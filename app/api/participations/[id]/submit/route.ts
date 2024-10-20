import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1]
    const user = await verifyToken(token)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { answers } = await request.json()

    const participation = await prisma.participation.findUnique({
      where: { id: params.id },
      include: {
        quiz: {
          include: {
            questions: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    })

    if (!participation) {
      return NextResponse.json({ error: 'Participation not found' }, { status: 404 })
    }

    if (participation.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let score = 0
    const submittedAnswers = []

    for (const answer of answers) {
      const question = participation.quiz.questions.find(q => q.id === answer.questionId)
      if (question) {
        const correctOption = question.options.find(o => o.isCorrect)
        if (correctOption && correctOption.id === answer.selectedOptionId) {
          score++
        }
        submittedAnswers.push({
          participationId: participation.id,
          questionId: answer.questionId,
          selectedOptionId: answer.selectedOptionId,
        })
      }
    }

    const updatedParticipation = await prisma.participation.update({
      where: { id: params.id },
      data: {
        score,
        finishedAt: new Date(),
        answers: {
          createMany: {
            data: submittedAnswers,
          },
        },
      },
    })

    return NextResponse.json(updatedParticipation)
  } catch (error) {
    console.error('Error submitting participation:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}