import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    })

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    return NextResponse.json(quiz)
  } catch (error) {
    console.error('Error fetching quiz:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1]
    const user = await verifyToken(token)

    if (!user || user.role !== 'ORGANIZER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, questions } = await request.json()

    const updatedQuiz = await prisma.quiz.update({
      where: { id: params.id },
      data: {
        title,
        description,
        questions: {
          deleteMany: {},
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

    return NextResponse.json(updatedQuiz)
  } catch (error) {
    console.error('Error updating quiz:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1]
    const user = await verifyToken(token)

    if (!user || user.role !== 'ORGANIZER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.quiz.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Quiz deleted successfully' })
  } catch (error) {
    console.error('Error deleting quiz:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}