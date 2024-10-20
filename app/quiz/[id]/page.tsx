'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

interface Question {
  id: string
  text: string
  options: {
    id: string
    text: string
  }[]
}

interface Quiz {
  id: string
  title: string
  description: string
  questions: Question[]
}

export default function QuizPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchQuiz(token)
  }, [router, params.id])

  async function fetchQuiz(token: string) {
    try {
      const response = await fetch(`/api/quizzes/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setQuiz(data)
      } else {
        throw new Error('Failed to fetch quiz')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch quiz. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  function handleAnswerSelect(questionId: string, optionId: string) {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }))
  }

  function handleNextQuestion() {
    if (currentQuestionIndex < quiz!.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  function handlePreviousQuestion() {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  async function handleSubmitQuiz() {
    setIsSubmitting(true)
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const response = await fetch(`/api/participations/${quiz!.id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: Object.entries(selectedAnswers).map(([questionId, optionId]) => ({
            questionId,
            selectedOptionId: optionId,
          })),
        }),
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: 'Quiz submitted',
          description: `Your score: ${result.score}/${quiz!.questions.length}`,
        })
        router.push('/dashboard')
      } else {
        throw new Error('Failed to submit quiz')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit quiz. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <p className="text-center mt-8">Loading quiz...</p>
  }

  if (!quiz) {
    return <p className="text-center mt-8">Quiz not found</p>
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 dark:from-gray-900 dark:to-gray-800 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900 dark:text-white">{quiz.title}</h1>
        <Card className="max-w-2xl mx-auto bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle>Question {currentQuestionIndex + 1} of {quiz.questions.length}</CardTitle>
            <CardDescription>{currentQuestion.text}</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedAnswers[currentQuestion.id] || ''}
              onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
            >
              {currentQuestion.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id}>{option.text}</Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
              Previous
            </Button>
            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <Button onClick={handleSubmitQuiz} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
              </Button>
            ) : (
              <Button onClick={handleNextQuestion}>Next</Button>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}