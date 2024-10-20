import jwt from 'jsonwebtoken'
import prisma from './prisma'

export async function verifyToken(token: string | undefined) {
  if (!token) return null

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string }
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } })
    return user
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}