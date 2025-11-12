import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import MessagesList from '@/components/MessagesList'

export default async function MessagesPage() {
  const user = await getCurrentUser()
  
  if (!user || user.status !== 'approved') {
    redirect('/login')
  }

  return (
    <>
      <Navbar userName={user.name} userAvatar={user.avatar} userRole={user.role} />
      <MessagesList currentUser={user} />
    </>
  )
}

