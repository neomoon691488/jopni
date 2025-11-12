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

    const { receiverId, content } = await request.json()

    if (!receiverId || !content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Получатель и сообщение обязательны' },
        { status: 400 }
      )
    }

    const receiver = db.users.getById(receiverId)
    if (!receiver) {
      return NextResponse.json(
        { error: 'Получатель не найден' },
        { status: 404 }
      )
    }

    const message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      senderId: user.id,
      receiverId: receiverId,
      content: content.trim(),
      read: false,
      createdAt: new Date().toISOString()
    }

    db.messages.create(message)

    return NextResponse.json(message)
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при отправке сообщения' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.status !== 'approved') {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (userId) {
      // Получаем переписку с конкретным пользователем
      const messages = db.messages.getConversation(user.id, userId)
      // Помечаем сообщения как прочитанные
      db.messages.markAsRead(userId, user.id)
      return NextResponse.json(messages)
    }

    // Получаем список всех переписок
    const conversationIds = db.messages.getConversations(user.id)
    const conversations = conversationIds.map(id => {
      const otherUser = db.users.getById(id)
      if (!otherUser) return null
      
      const messages = db.messages.getConversation(user.id, id)
      const lastMessage = messages[messages.length - 1]
      const unreadCount = messages.filter(m => m.receiverId === user.id && !m.read).length

      const { password, ...userWithoutPassword } = otherUser
      return {
        user: userWithoutPassword,
        lastMessage,
        unreadCount
      }
    }).filter(Boolean)

    // Сортируем по последнему сообщению
    conversations.sort((a, b) => {
      if (!a?.lastMessage || !b?.lastMessage) return 0
      return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    })

    return NextResponse.json(conversations)
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при получении сообщений' },
      { status: 500 }
    )
  }
}

