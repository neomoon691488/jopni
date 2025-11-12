import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = db.posts.getById(params.id)
    if (!post) {
      return NextResponse.json(
        { error: 'Пост не найден' },
        { status: 404 }
      )
    }
    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при получении поста' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    if (post.authorId !== user.id) {
      return NextResponse.json(
        { error: 'Нет доступа' },
        { status: 403 }
      )
    }

    const { content } = await request.json()
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Содержание поста не может быть пустым' },
        { status: 400 }
      )
    }

    db.posts.update(params.id, { content: content.trim() })
    const updatedPost = db.posts.getById(params.id)
    return NextResponse.json(updatedPost)
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при обновлении поста' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    if (post.authorId !== user.id) {
      return NextResponse.json(
        { error: 'Нет доступа' },
        { status: 403 }
      )
    }

    db.posts.delete(params.id)
    return NextResponse.json({ message: 'Пост удален' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при удалении поста' },
      { status: 500 }
    )
  }
}

