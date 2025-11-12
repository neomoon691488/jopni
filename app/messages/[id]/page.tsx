import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import Navbar from '@/components/Navbar'
import ChatWindow from '@/components/ChatWindow'

export default async function ChatPage({ params }: { params: { id: string } }) {
  const currentUser = await getCurrentUser()
  
  if (!currentUser || currentUser.status !== 'approved') {
    redirect('/login')
  }

  const otherUser = db.users.getById(params.id)
  if (!otherUser) {
    redirect('/messages')
  }

  const { password, ...userWithoutPassword } = otherUser

  return (
    <>
      <Navbar userName={currentUser.name} userAvatar={currentUser.avatar} userRole={currentUser.role} />
      <ChatWindow currentUser={currentUser} otherUser={userWithoutPassword} />
    </>
  )
}

