'use server'

import prisma from '@/lib/prisma'
import { signToken, verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import fs from 'fs/promises'
import path from 'path'

async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null
  return await verifyToken(token) as { id: number; username: string } | null
}

export async function getMe() {
  const session = await getSession()
  if (!session) return null
  
  return await prisma.user.findUnique({
    where: { id: session.id },
    select: { 
      id: true, 
      username: true, 
      displayName: true, 
      imageUrl: true,
      xp: true,
      streak: true,
      lastStudyDate: true,
      activityData: true
    }
  })
}

export async function updateUserStatsAction(data: { xp?: number, streak?: number, lastStudyDate?: Date, activityData?: any }) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data,
      select: {
        id: true,
        username: true,
        displayName: true,
        imageUrl: true,
        xp: true,
        streak: true,
        lastStudyDate: true,
        activityData: true
      }
    })
    return { success: true, user: updatedUser }
  } catch (err) {
    console.error('Failed to update stats:', err)
    return { error: 'Failed to update stats' }
  }
}

export async function fixDatabaseSchema() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "displayName" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;`);
    return { success: true };
  } catch (err) {
    console.error('Manual schema fix failed:', err);
    return { error: 'Fix failed' };
  }
}

export async function updateProfileAction(formData: FormData) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  const displayName = formData.get('displayName') as string
  const password = formData.get('password') as string
  const imageUrl = formData.get('imageUrl') as string

  const data: any = {}
  if (displayName !== undefined) data.displayName = displayName
  if (imageUrl !== undefined) data.imageUrl = imageUrl
  if (password) {
    data.password = await bcrypt.hash(password, 10)
  }

  try {
    console.log(`Updating profile for user ${session.id}. Image size: ${imageUrl?.length || 0} chars.`);
    await prisma.user.update({
      where: { id: session.id },
      data
    })
    console.log(`Profile updated successfully for user ${session.id}`);
    return { success: true }
  } catch (error) {
    console.error('Update profile error:', error)
    return { error: 'Failed to update profile' }
  }
}

export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (!username || !password) return { error: 'Username and password required' }

  try {
    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) return { error: 'Invalid credentials' }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) return { error: 'Invalid credentials' }

    const token = await signToken({ id: user.id, username: user.username })
    
    const cookieStore = await cookies()
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    })

    return { success: true }
  } catch (error) {
    console.error('Login error:', error)
    return { error: 'Something went wrong during login' }
  }
}

export async function registerAction(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (!username || !password) return { error: 'Username and password required' }

  try {
    const existingUser = await prisma.user.findUnique({ where: { username } })
    if (existingUser) return { error: 'Username already taken' }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword
      }
    })

    const token = await signToken({ id: user.id, username: user.username })
    
    const cookieStore = await cookies()
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    })

    return { success: true }
  } catch (error) {
    console.error('Register error:', error)
    return { error: 'Something went wrong during registration' }
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
  return { success: true }
}

// Course Actions
export async function getCourses() {
  const session = await getSession()
  if (!session) return []

  // Fetch courses owned by user
  const courses = await prisma.course.findMany({
    where: {
      userId: session.id,
    },
    include: {
      user: { select: { username: true } },
      dayBlocks: {
        include: { 
          items: {
            include: {
              progress: {
                where: { userId: session.id }
              }
            },
            orderBy: { sortOrder: 'asc' }
          } 
        },
        orderBy: { sortOrder: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Transform to include calculated fields per user
  return courses.map(course => {
    let totalSeconds = 0
    let completedSeconds = 0
    let totalItems = 0
    let completedItems = 0
    
    course.dayBlocks.forEach(block => {
      totalItems += block.items.length
      
      block.items.forEach(item => {
        const isCompleted = item.progress.length > 0 && item.progress[0].completed
        if (isCompleted) completedItems++
        
        let itemSeconds = 0
        const parts = item.duration.split(':').map(Number)
        if (parts.length === 2) itemSeconds = parts[0] * 60 + parts[1]
        else if (parts.length === 3) itemSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2]
        
        totalSeconds += itemSeconds
        if (isCompleted) completedSeconds += itemSeconds
      })
    })

    const progress = totalSeconds === 0 ? 0 : Math.round((completedSeconds / totalSeconds) * 100)
    const ownership = course.userId === session.id ? 'owned' : 'shared'

    return {
      ...course,
      progress,
      totalVideos: totalItems,
      completedVideos: completedItems,
      totalTimeSeconds: totalSeconds,
      completedTimeSeconds: completedSeconds,
      ownership,
      ownerName: course.user.username
    }
  })
}

export async function addCourse(data: { title: string; imageUrl: string }) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  const course = await prisma.course.create({
    data: {
      title: data.title,
      imageUrl: data.imageUrl,
      userId: session.id,
      ownerName: session.username
    }
  })

  revalidatePath('/')
  return course
}

export async function deleteAccount() {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  try {
    await prisma.user.delete({
      where: { id: session.id }
    })
    
    const cookieStore = await cookies()
    cookieStore.delete('session')
    
    return { success: true }
  } catch (error) {
    console.error('Delete account error:', error)
    return { error: 'Failed to delete account' }
  }
}

export async function deleteCourse(courseId: string) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  await prisma.course.delete({
    where: { id: courseId, userId: session.id }
  })

  revalidatePath('/')
  return { success: true }
}

export async function addDayBlock(courseId: string, title: string) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  const blockCount = await prisma.dayBlock.count({
    where: { courseId }
  })

  const block = await prisma.dayBlock.create({
    data: {
      title,
      courseId,
      sortOrder: blockCount
    }
  })

  revalidatePath(`/course/${courseId}`)
  return block
}

export async function deleteDayBlock(courseId: string, blockId: string) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  await prisma.dayBlock.delete({
    where: { id: blockId, courseId: courseId }
  })

  revalidatePath(`/course/${courseId}`)
  return { success: true }
}

export async function addItemsToBlock(blockId: string, items: { title: string; duration: string }[]) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  const existingCount = await prisma.item.count({
    where: { blockId }
  })

  const newItems = await prisma.$transaction(
    items.map((item, index) => prisma.item.create({
      data: {
        title: item.title,
        duration: item.duration,
        blockId,
        sortOrder: existingCount + index
      }
    }))
  )

  // Update course progress counts
  // This is a bit complex since we need the courseId. 
  // We can find it through the block.
  const block = await prisma.dayBlock.findUnique({
    where: { id: blockId },
    select: { courseId: true }
  })
  
  if (block) {
    revalidatePath(`/course/${block.courseId}`)
  }

  return newItems
}

export async function toggleItem(itemId: string, completed: boolean) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  const progress = await prisma.itemProgress.upsert({
    where: {
      userId_itemId: { 
        userId: session.id,
        itemId 
      }
    },
    update: { completed },
    create: {
      userId: session.id,
      itemId,
      completed
    },
    include: {
      item: {
        include: {
          dayBlock: {
            select: { courseId: true }
          }
        }
      }
    }
  })

  revalidatePath(`/course/${progress.item.dayBlock.courseId}`)
  revalidatePath('/progress')
  return { success: true }
}

export async function toggleItemImportant(itemId: string, isImportant: boolean) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  const item = await prisma.item.update({
    where: { id: itemId },
    data: { isImportant },
    include: { dayBlock: true }
  })

  // @ts-ignore
  revalidatePath(`/course/${item.dayBlock?.courseId || ''}`)
  return { success: true }
}

export async function toggleAllInBlockAction(blockId: string, completed: boolean) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  // 1. Find all items in the block
  const items = await prisma.item.findMany({
    where: { blockId },
    select: { id: true }
  })

  // 2. Bulk upsert progress for all items
  await prisma.$transaction(
    items.map(item => prisma.itemProgress.upsert({
      where: {
        userId_itemId: { 
          userId: session.id,
          itemId: item.id 
        }
      },
      update: { completed },
      create: {
        userId: session.id,
        itemId: item.id,
        completed
      }
    }))
  )

  // 3. Find courseId for revalidation
  const block = await prisma.dayBlock.findUnique({
    where: { id: blockId },
    select: { courseId: true }
  })
  
  if (block) {
    revalidatePath(`/course/${block.courseId}`)
  }
  revalidatePath('/progress')
  
  return { success: true }
}



export async function updateBlockTitle(blockId: string, title: string) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  const block = await prisma.dayBlock.update({
    where: { id: blockId },
    data: { title }
  })

  revalidatePath(`/course/${block.courseId}`)
  return { success: true }
}

export async function getFolders() {
  const session = await getSession()
  if (!session) return []

  return await prisma.folder.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' }
  })
}

export async function createFolder(name: string) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  const folder = await prisma.folder.create({
    data: {
      name,
      userId: session.id
    }
  })

  revalidatePath('/dashboard')
  return folder
}

export async function deleteFolder(folderId: string) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  // Courses in this folder will have their folderId set to null due to SetNull onDelete in schema
  await prisma.folder.delete({
    where: { id: folderId, userId: session.id }
  })

  revalidatePath('/dashboard')
  return { success: true }
}

export async function moveCourseToFolder(courseId: string, folderId: string | null) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  await prisma.course.update({
    where: { id: courseId, userId: session.id },
    data: { folderId }
  })

  revalidatePath('/dashboard')
  return { success: true }
}

export async function renameFolder(folderId: string, name: string) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  await prisma.folder.update({
    where: { id: folderId, userId: session.id },
    data: { name }
  })

  revalidatePath('/dashboard')
  return { success: true }
}
