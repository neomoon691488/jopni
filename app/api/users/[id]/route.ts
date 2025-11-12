import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = db.users.getById(params.id)
    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      )
    }

    const { password, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при получении пользователя' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    if (currentUser.id !== params.id) {
      return NextResponse.json(
        { error: 'Нет доступа' },
        { status: 403 }
      )
    }

    const updates = await request.json()
    db.users.update(params.id, updates)

    const updatedUser = db.users.getById(params.id)
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      )
    }

    const { password, ...userWithoutPassword } = updatedUser
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при обновлении профиля' },
      { status: 500 }
    )
  }
}

