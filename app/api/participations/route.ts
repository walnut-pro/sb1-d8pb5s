import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1]
    const user = await verifyToken(token)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { quizId } = await request.json()

    const participation = await prisma.participation.create({
      data: {
        userId: user.id,
        quizId,
        score: 0,
      },
    })

    return NextResponse.json(participation)
  } catch (error) {
    console.error('Error creating participation:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1]
    const user = await verifyToken(token)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const participations = await prisma.participation.findMany({
      where: { userId: user.id },
      include: {
        quiz: true,
        answers: true,
      },
    })

    return NextResponse.json(participations)
  } catch (error) {
    console.error('Error fetching participations:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}