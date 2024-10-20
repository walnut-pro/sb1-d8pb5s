import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const quizzes = await prisma.quiz.findMany({
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    })
    return NextResponse.json(quizzes)
  } catch (error) {
    console.error('Error fetching quizzes:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1]
    const user = await verifyToken(token)

    if (!user || user.role !== 'ORGANIZER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, questions } = await request.json()

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        createdById: user.id,
        questions: {
          create: questions.map((q: any) => ({
            text: q.text,
            options: {
              create: q.options.map((o: any) => ({
                text: o.text,
                isCorrect: o.isCorrect,
              })),
            },
          })),
        },
      },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    })

    return NextResponse.json(quiz)
  } catch (error) {
    console.error('Error creating quiz:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}