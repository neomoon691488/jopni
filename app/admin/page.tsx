import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import Navbar from '@/components/Navbar'
import AdminPanel from '@/components/AdminPanel'

export default async function AdminPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'admin') {
    redirect('/feed')
  }

  const pendingUsers = db.users.getPending()
  const allUsers = db.users.getAll()

  return (
    <>
      <Navbar userName={user.name} userAvatar={user.avatar} userRole={user.role} />
      <AdminPanel 
        pendingUsers={pendingUsers.map(({ password, ...u }) => u)}
        allUsers={allUsers.map(({ password, ...u }) => u)}
      />
    </>
  )
}

