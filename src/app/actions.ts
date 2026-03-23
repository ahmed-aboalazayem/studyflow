'use server'

import prisma from '@/lib/prisma'
import { signToken, verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'

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
    select: { id: true, username: true, displayName: true, imageUrl: true }
  })
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
    await prisma.user.update({
      where: { id: session.id },
      data
    })
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

  // Fetch courses owned by user OR shared with user
  const courses = await prisma.course.findMany({
    where: {
      OR: [
        { userId: session.id },
        { shares: { some: { userId: session.id } } }
      ]
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
      },
      shares: {
        include: { user: { select: { username: true } } }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Transform to include calculated fields per user
  return courses.map(course => {
    let totalItems = 0
    let completedItems = 0
    
    course.dayBlocks.forEach(block => {
      totalItems += block.items.length
      completedItems += block.items.filter(item => item.progress.length > 0 && item.progress[0].completed).length
    })

    const progress = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100)
    const ownership = course.userId === session.id ? 'owned' : 'shared'

    return {
      ...course,
      progress,
      totalVideos: totalItems,
      completedVideos: completedItems,
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

export async function shareCourse(courseId: string, targetUsername: string) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  const targetUser = await prisma.user.findUnique({
    where: { username: targetUsername }
  })

  if (!targetUser) return { error: 'User not found' }
  if (targetUser.id === session.id) return { error: 'You cannot share with yourself' }

  // Check if target user is the owner
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { userId: true }
  })

  if (course?.userId === targetUser.id) {
    return { error: 'This user is the owner of the course and already has access' }
  }

  // Check if already shared
  const existingShare = await prisma.courseShare.findUnique({
    where: {
      courseId_userId: {
        courseId,
        userId: targetUser.id
      }
    }
  })

  if (existingShare) {
    return { error: 'This course is already shared with this user' }
  }

  try {
    await prisma.courseShare.create({
      data: {
        courseId,
        userId: targetUser.id
      }
    })
    revalidatePath('/')
    return { success: true }
  } catch (err) {
    console.error('Share error:', err)
    return { error: 'Failed to share course' }
  }
}

export async function getLeaderboard(courseId: string) {
  const session = await getSession()
  if (!session) return []

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      shares: { include: { user: true } },
      user: true,
      dayBlocks: { 
        include: { items: true } 
      }
    }
  })

  if (!course) return []

  // All users with access: owner + shared users
  const users = [course.user, ...course.shares.map(s => s.user)]
  
  const leaderboardData = await Promise.all(users.map(async (u) => {
    const progress = await prisma.itemProgress.findMany({
      where: { 
        userId: u.id,
        item: { dayBlock: { courseId } },
        completed: true 
      },
      include: { item: true }
    })

    let totalSeconds = 0
    progress.forEach(p => {
      const parts = p.item.duration.split(':').map(Number)
      if (parts.length === 2) totalSeconds += parts[0] * 60 + parts[1]
      else if (parts.length === 3) totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2]
    })

    return {
      username: u.username,
      totalMinutes: Math.floor(totalSeconds / 60),
      completedCount: progress.length
    }
  }))

  return leaderboardData.sort((a, b) => b.totalMinutes - a.totalMinutes)
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
export async function updateCourseNote(courseId: string, content: string) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  const note = await prisma.courseNote.upsert({
    where: {
      courseId_userId: {
        courseId,
        userId: session.id
      }
    },
    update: { content },
    create: {
      content,
      courseId,
      userId: session.id
    }
  })

  return { success: true, note }
}

export async function getCourseNote(courseId: string) {
  const session = await getSession()
  if (!session) return null

  return await prisma.courseNote.findUnique({
    where: {
      courseId_userId: {
        courseId,
        userId: session.id
      }
    }
  })
}
