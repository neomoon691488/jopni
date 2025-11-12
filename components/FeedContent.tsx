'use client'

import { useRouter } from 'next/navigation'
import PostCard from './PostCard'
import styles from './FeedContent.module.css'

interface Comment {
  id: string
  authorName: string
  authorAvatar?: string
  content: string
  createdAt: string
}

interface Post {
  id: string
  authorId: string
  authorName: string
  authorAvatar?: string
  content: string
  image?: string
  likes: string[]
  comments: Comment[]
  createdAt: string
}

interface FeedContentProps {
  posts: Post[]
  currentUserId: string
}

export default function FeedContent({ posts, currentUserId }: FeedContentProps) {
  const router = useRouter()

  const handleUpdate = () => {
    router.refresh()
  }

  return (
    <div className={styles.posts}>
      {posts.length === 0 ? (
        <div className={styles.empty}>
          <p>Пока нет постов. Создайте первый!</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={currentUserId}
            authorId={post.authorId}
            onUpdate={handleUpdate}
          />
        ))
      )}
    </div>
  )
}

