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

    const { content } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Комментарий не может быть пустым' },
        { status: 400 }
      )
    }

    const post = db.posts.getById(params.id)
    if (!post) {
      return NextResponse.json(
        { error: 'Пост не найден' },
        { status: 404 }
      )
    }

    const comment = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatar,
      content: content.trim(),
      createdAt: new Date().toISOString()
    }

    const comments = [...post.comments, comment]
    db.posts.update(params.id, { comments })

    return NextResponse.json(comment)
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при создании комментария' },
      { status: 500 }
    )
  }
}

