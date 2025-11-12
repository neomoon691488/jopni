import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.status !== 'approved') {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    const friendship = db.friendships.getAll().find(f => f.id === params.id)
    if (!friendship) {
      return NextResponse.json(
        { error: 'Запрос не найден' },
        { status: 404 }
      )
    }

    if (friendship.friendId !== user.id) {
      return NextResponse.json(
        { error: 'Нет доступа' },
        { status: 403 }
      )
    }

    db.friendships.update(params.id, { status: 'accepted' })

    return NextResponse.json({ message: 'Запрос принят' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при принятии запроса' },
      { status: 500 }
    )
  }
}

