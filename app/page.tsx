import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 dark:from-gray-900 dark:to-gray-800">
      <h1 className="text-4xl font-bold mb-8 text-center">Welcome to the Quiz Competition System</h1>
      <div className="space-x-4">
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/register">Register</Link>
        </Button>
      </div>
    </div>
  )
}