'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

interface Quiz {
  id: string
  title: string
  description: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchQuizzes(token)
  }, [router])

  async function fetchQuizzes(token: string) {
    try {
      const response = await fetch('/api/quizzes', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setQuizzes(data)
      } else {
        throw new Error('Failed to fetch quizzes')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch quizzes. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  function handleStartQuiz(quizId: string) {
    router.push(`/quiz/${quizId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 dark:from-gray-900 dark:to-gray-800 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900 dark:text-white">Quiz Dashboard</h1>
        {isLoading ? (
          <p className="text-center text-gray-600 dark:text-gray-300">Loading quizzes...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle>{quiz.title}</CardTitle>
                  <CardDescription>{quiz.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Add more quiz details here if needed */}
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleStartQuiz(quiz.id)}>Start Quiz</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}