'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PostCard from './PostCard'
import styles from './UserProfile.module.css'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  bio?: string
  grade?: string
  role: 'admin' | 'user'
}

interface Friendship {
  id: string
  userId: string
  friendId: string
  status: 'pending' | 'accepted' | 'blocked'
}

interface Post {
  id: string
  authorId: string
  authorName: string
  authorAvatar?: string
  content: string
  image?: string
  likes: string[]
  comments: any[]
  createdAt: string
}

interface UserProfileProps {
  user: User
  currentUser: User
  posts: Post[]
  friendsCount: number
  friendship?: Friendship
}

export default function UserProfile({ user, currentUser, posts, friendsCount, friendship }: UserProfileProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [friendshipStatus, setFriendshipStatus] = useState(friendship?.status || null)

  const isOwnProfile = user.id === currentUser.id

  const handleAddFriend = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/friendships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId: user.id })
      })
      if (response.ok) {
        setFriendshipStatus('pending')
        router.refresh()
      }
    } catch (error) {
      console.error('Add friend error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptFriend = async () => {
    if (!friendship) return
    setIsLoading(true)
    try {
      const response = await fetch(`/api/friendships/${friendship.id}/accept`, {
        method: 'POST'
      })
      if (response.ok) {
        setFriendshipStatus('accepted')
        router.refresh()
      }
    } catch (error) {
      console.error('Accept friend error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMessage = () => {
    router.push(`/messages/${user.id}`)
  }

  return (
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
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statValue}>{posts.length}</span>
                <span className={styles.statLabel}>Постов</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{friendsCount}</span>
                <span className={styles.statLabel}>Друзей</span>
              </div>
            </div>
          </div>
        </div>

        {!isOwnProfile && (
          <div className={styles.actions}>
            {friendshipStatus === 'accepted' ? (
              <>
                <button onClick={handleMessage} className={styles.messageButton}>
                  💬 Написать сообщение
                </button>
                <span className={styles.friendBadge}>Друг</span>
              </>
            ) : friendshipStatus === 'pending' ? (
              friendship?.userId === currentUser.id ? (
                <span className={styles.pendingBadge}>Запрос отправлен</span>
              ) : (
                <button onClick={handleAcceptFriend} className={styles.acceptButton} disabled={isLoading}>
                  {isLoading ? '...' : '✓ Принять запрос'}
                </button>
              )
            ) : (
              <button onClick={handleAddFriend} className={styles.addButton} disabled={isLoading}>
                {isLoading ? '...' : '+ Добавить в друзья'}
              </button>
            )}
          </div>
        )}

        <div className={styles.postsSection}>
          <h2 className={styles.sectionTitle}>
            {isOwnProfile ? 'Мои посты' : `Посты ${user.name}`} ({posts.length})
          </h2>
          <div className={styles.posts}>
            {posts.length === 0 ? (
              <div className={styles.empty}>
                <p>Пока нет постов</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUser.id}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

