import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 })
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    )

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}