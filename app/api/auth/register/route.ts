import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, generateToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, grade } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Все поля обязательны' },
        { status: 400 }
      )
    }

    // Проверяем, существует ли пользователь
    const existingUser = db.users.getByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      )
    }

    // Хешируем пароль
    const hashedPassword = await hashPassword(password)

    // Проверяем, есть ли уже админ (первый пользователь становится админом)
    const allUsers = db.users.getAll()
    const isFirstUser = allUsers.length === 0

    // Создаем пользователя
    const user = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      email,
      password: hashedPassword,
      name,
      grade: grade || '',
      bio: '',
      role: isFirstUser ? 'admin' as const : 'user' as const,
      status: isFirstUser ? 'approved' as const : 'pending' as const,
      createdAt: new Date().toISOString()
    }

    db.users.create(user)

    // Если первый пользователь (админ), сразу логиним
    if (isFirstUser) {
      const token = generateToken(user.id)
      const cookieStore = await cookies()
      cookieStore.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7
      })

      const { password: _, ...userWithoutPassword } = user
      return NextResponse.json({
        user: userWithoutPassword,
        token,
        message: 'Вы зарегистрированы как администратор'
      })
    }

    // Для остальных - ждем одобрения
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json({
      user: userWithoutPassword,
      message: 'Регистрация успешна! Ожидайте одобрения администратора.'
    }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Ошибка при регистрации' },
      { status: 500 }
    )
  }
}

