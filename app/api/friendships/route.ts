import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.status !== 'approved') {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    const { friendId } = await request.json()

    if (!friendId) {
      return NextResponse.json(
        { error: 'ID друга обязателен' },
        { status: 400 }
      )
    }

    if (user.id === friendId) {
      return NextResponse.json(
        { error: 'Нельзя добавить себя в друзья' },
        { status: 400 }
      )
    }

    const friend = db.users.getById(friendId)
    if (!friend) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      )
    }

    // Проверяем, есть ли уже дружба
    const existing = db.friendships.find(user.id, friendId)
    if (existing) {
      return NextResponse.json(
        { error: 'Запрос уже существует' },
        { status: 400 }
      )
    }

    const friendship = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId: user.id,
      friendId: friendId,
      status: 'pending' as const,
      createdAt: new Date().toISOString()
    }

    db.friendships.create(friendship)

    return NextResponse.json(friendship)
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при создании запроса' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.status !== 'approved') {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    const friends = db.friendships.getFriends(user.id)
    const friendsData = friends.map(id => {
      const friend = db.users.getById(id)
      if (!friend) return null
      const { password, ...friendWithoutPassword } = friend
      return friendWithoutPassword
    }).filter(Boolean)

    return NextResponse.json(friendsData)
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при получении друзей' },
      { status: 500 }
    )
  }
}

