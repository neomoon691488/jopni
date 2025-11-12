import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
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

    const updates = await request.json()
    const { name, grade, status } = updates

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (grade !== undefined) updateData.grade = grade
    if (status !== undefined) updateData.status = status

    db.users.update(params.id, updateData)

    const updatedUser = db.users.getById(params.id)
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      )
    }

    const { password, ...userWithoutPassword } = updatedUser
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при обновлении пользователя' },
      { status: 500 }
    )
  }
}

