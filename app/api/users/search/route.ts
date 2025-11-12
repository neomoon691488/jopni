import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

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
    const query = searchParams.get('q') || ''

    if (!query || query.length < 2) {
      return NextResponse.json([])
    }

    const allUsers = db.users.getAll()
    const searchLower = query.toLowerCase()

    const results = allUsers
      .filter(u => 
        u.status === 'approved' &&
        u.id !== user.id &&
        (u.name.toLowerCase().includes(searchLower) ||
         u.email.toLowerCase().includes(searchLower) ||
         (u.grade && u.grade.toLowerCase().includes(searchLower)))
      )
      .slice(0, 20)
      .map(u => {
        const { password, ...userWithoutPassword } = u
        return userWithoutPassword
      })

    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при поиске' },
      { status: 500 }
    )
  }
}

