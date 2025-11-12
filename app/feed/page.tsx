import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import FeedContent from '@/components/FeedContent'
import CreatePost from '@/components/CreatePost'
import { db } from '@/lib/db'
import styles from './feed.module.css'

export default async function FeedPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  if (user.status === 'pending') {
    redirect('/pending')
  }
  
  if (user.status === 'rejected') {
    redirect('/login')
  }

  const posts = db.posts.getAll()

  return (
    <>
      <Navbar userName={user.name} userAvatar={user.avatar} userRole={user.role} />
      <div className={styles.container}>
        <div className={styles.feed}>
          <CreatePost userId={user.id} />
          <FeedContent posts={posts} currentUserId={user.id} />
        </div>
      </div>
    </>
  )
}

