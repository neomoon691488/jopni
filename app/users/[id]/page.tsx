import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import Navbar from '@/components/Navbar'
import UserProfile from '@/components/UserProfile'

export default async function UserPage({ params }: { params: { id: string } }) {
  const currentUser = await getCurrentUser()
  
  if (!currentUser || currentUser.status !== 'approved') {
    redirect('/login')
  }

  const user = db.users.getById(params.id)
  if (!user) {
    redirect('/feed')
  }

  const { password, ...userWithoutPassword } = user
  const userPosts = db.posts.getByAuthor(user.id)
  const friends = db.friendships.getFriends(user.id)
  const friendship = db.friendships.find(currentUser.id, user.id)

  return (
    <>
      <Navbar userName={currentUser.name} userAvatar={currentUser.avatar} userRole={currentUser.role} />
      <UserProfile
        user={userWithoutPassword}
        currentUser={currentUser}
        posts={userPosts}
        friendsCount={friends.length}
        friendship={friendship}
      />
    </>
  )
}

