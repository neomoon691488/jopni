import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const posts = db.posts.getAll()
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Get posts error:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении постов' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    const { content, image } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Содержание поста не может быть пустым' },
        { status: 400 }
      )
    }

    const post = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatar,
      content: content.trim(),
      image: image || undefined,
      likes: [],
      comments: [],
      createdAt: new Date().toISOString()
    }

    db.posts.create(post)

    return NextResponse.json(post)
  } catch (error) {
    console.error('Create post error:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании поста' },
      { status: 500 }
    )
  }
}

