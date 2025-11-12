import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    const post = db.posts.getById(params.id)
    if (!post) {
      return NextResponse.json(
        { error: 'Пост не найден' },
        { status: 404 }
      )
    }

    const likes = [...post.likes]
    const index = likes.indexOf(user.id)

    if (index === -1) {
      likes.push(user.id)
    } else {
      likes.splice(index, 1)
    }

    db.posts.update(params.id, { likes })

    return NextResponse.json({ likes })
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при лайке' },
      { status: 500 }
    )
  }
}

