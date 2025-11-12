'use client'

import { useState } from 'react'
import styles from './PostCard.module.css'

interface Comment {
  id: string
  authorName: string
  authorAvatar?: string
  content: string
  createdAt: string
}

interface Post {
  id: string
  authorName: string
  authorAvatar?: string
  content: string
  image?: string
  likes: string[]
  comments: Comment[]
  createdAt: string
}

interface PostCardProps {
  post: Post
  currentUserId?: string
  authorId?: string
  onUpdate?: () => void
}

export default function PostCard({ post, currentUserId, authorId, onUpdate }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [isLiking, setIsLiking] = useState(false)
  const [isCommenting, setIsCommenting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content)
  const [isDeleting, setIsDeleting] = useState(false)

  const isLiked = currentUserId ? post.likes.includes(currentUserId) : false
  const canEdit = currentUserId && authorId && currentUserId === authorId

  const handleLike = async () => {
    if (!currentUserId || isLiking) return
    setIsLiking(true)
    try {
      await fetch(`/api/posts/${post.id}/like`, { method: 'POST' })
      onUpdate?.()
    } catch (error) {
      console.error('Like error:', error)
    } finally {
      setIsLiking(false)
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || !currentUserId || isCommenting) return
    setIsCommenting(true)
    try {
      await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText })
      })
      setCommentText('')
      onUpdate?.()
    } catch (error) {
      console.error('Comment error:', error)
    } finally {
      setIsCommenting(false)
    }
  }

  const handleEdit = async () => {
    if (!editContent.trim()) return
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent })
      })
      if (response.ok) {
        setIsEditing(false)
        onUpdate?.()
      }
    } catch (error) {
      console.error('Edit error:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить этот пост?')) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        onUpdate?.()
      }
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'только что'
    if (minutes < 60) return `${minutes} мин. назад`
    if (hours < 24) return `${hours} ч. назад`
    if (days < 7) return `${days} дн. назад`
    return date.toLocaleDateString('ru-RU')
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.author}>
          {post.authorAvatar ? (
            <img src={post.authorAvatar} alt={post.authorName} className={styles.avatar} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {post.authorName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className={styles.authorName}>{post.authorName}</div>
            <div className={styles.date}>{formatDate(post.createdAt)}</div>
          </div>
        </div>
        {canEdit && (
          <div className={styles.postActions}>
            {!isEditing && (
              <>
                <button onClick={() => setIsEditing(true)} className={styles.editButton}>
                  ✏️
                </button>
                <button onClick={handleDelete} className={styles.deleteButton} disabled={isDeleting}>
                  {isDeleting ? '...' : '🗑️'}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className={styles.content}>
        {isEditing ? (
          <div className={styles.editForm}>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className={styles.editTextarea}
              rows={3}
            />
            <div className={styles.editActions}>
              <button onClick={handleEdit} className={styles.saveEditButton}>
                Сохранить
              </button>
              <button onClick={() => {
                setIsEditing(false)
                setEditContent(post.content)
              }} className={styles.cancelEditButton}>
                Отмена
              </button>
            </div>
          </div>
        ) : (
          <>
            <p>{post.content}</p>
            {post.image && (
              <img src={post.image} alt="Post" className={styles.postImage} />
            )}
          </>
        )}
      </div>

      <div className={styles.actions}>
        <button
          onClick={handleLike}
          className={`${styles.actionButton} ${isLiked ? styles.liked : ''}`}
          disabled={isLiking}
        >
          <span className={styles.likeIcon}>👍</span>
          <span>{post.likes.length}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className={styles.actionButton}
        >
          💬 {post.comments.length}
        </button>
      </div>

      {showComments && (
        <div className={styles.comments}>
          {post.comments.map((comment) => (
            <div key={comment.id} className={styles.comment}>
              <div className={styles.commentAuthor}>
                {comment.authorAvatar ? (
                  <img
                    src={comment.authorAvatar}
                    alt={comment.authorName}
                    className={styles.commentAvatar}
                  />
                ) : (
                  <div className={styles.commentAvatarPlaceholder}>
                    {comment.authorName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className={styles.commentAuthorName}>{comment.authorName}</div>
                  <div className={styles.commentContent}>{comment.content}</div>
                </div>
              </div>
            </div>
          ))}
          {currentUserId && (
            <form onSubmit={handleComment} className={styles.commentForm}>
              <input
                type="text"
                placeholder="Написать комментарий..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className={styles.commentInput}
                disabled={isCommenting}
              />
              <button
                type="submit"
                disabled={!commentText.trim() || isCommenting}
                className={styles.commentButton}
              >
                {isCommenting ? '...' : 'Отправить'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}

