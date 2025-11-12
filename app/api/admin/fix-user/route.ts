import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Утилита для исправления статуса первого пользователя
export async function POST(request: NextRequest) {
  try {
    const allUsers = db.users.getAll()
    
    if (allUsers.length === 0) {
      return NextResponse.json(
        { error: 'Нет пользователей в базе' },
        { status: 404 }
      )
    }

    // Находим первого пользователя (по дате создания)
    const firstUser = allUsers.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )[0]

    // Исправляем статус и роль первого пользователя
    db.users.update(firstUser.id, {
      role: 'admin',
      status: 'approved'
    })

    return NextResponse.json({
      message: 'Статус первого пользователя исправлен',
      user: {
        id: firstUser.id,
        email: firstUser.email,
        name: firstUser.name,
        role: 'admin',
        status: 'approved'
      }
    })
  } catch (error) {
    console.error('Fix user error:', error)
    return NextResponse.json(
      { error: 'Ошибка при исправлении пользователя' },
      { status: 500 }
    )
  }
}

