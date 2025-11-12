import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      )
    }

    db.users.update(params.id, { status: 'approved' })
    return NextResponse.json({ message: 'Пользователь одобрен' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при одобрении пользователя' },
      { status: 500 }
    )
  }
}

