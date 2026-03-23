import { jwtVerify, SignJWT } from 'jose'

const secretKey = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production'
const key = new TextEncoder().encode(secretKey)

export async function signToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key)
}

export async function verifyToken(input: string) {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    })
    return payload
  } catch (error) {
    return null
  }
}
