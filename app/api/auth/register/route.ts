import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}