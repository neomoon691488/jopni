import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import Navbar from '@/components/Navbar'
import ProfilePosts from '@/components/ProfilePosts'
import ProfileEdit from '@/components/ProfileEdit'
import styles from './profile.module.css'

export default async function ProfilePage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  if (user.status !== 'approved') {
    redirect('/login')
  }

  const userPosts = db.posts.getByAuthor(user.id)

  return (
    <>
      <Navbar userName={user.name} userAvatar={user.avatar} userRole={user.role} />
      <div className={styles.container}>
        <div className={styles.profile}>
          <div className={styles.header}>
            <div className={styles.avatarSection}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className={styles.avatar} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className={styles.info}>
              <h1 className={styles.name}>{user.name}</h1>
              {user.grade && <p className={styles.grade}>Класс: {user.grade}</p>}
              {user.bio && <p className={styles.bio}>{user.bio}</p>}
            </div>
          </div>

          <ProfileEdit user={user} />

          <div className={styles.postsSection}>
            <h2 className={styles.sectionTitle}>Мои посты ({userPosts.length})</h2>
            <ProfilePosts posts={userPosts} currentUserId={user.id} />
          </div>
        </div>
      </div>
    </>
  )
}

