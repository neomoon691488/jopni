import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      )
    }

    const allUsers = db.users.getAll()
    const usersWithoutPasswords = allUsers.map(({ password, ...user }) => user)
    
    return NextResponse.json(usersWithoutPasswords)
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при получении пользователей' },
      { status: 500 }
    )
  }
}

