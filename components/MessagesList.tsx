'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './MessagesList.module.css'

interface User {
  id: string
  name: string
  avatar?: string
}

interface Message {
  id: string
  content: string
  createdAt: string
}

interface Conversation {
  user: User
  lastMessage?: Message
  unreadCount: number
}

interface MessagesListProps {
  currentUser: User
}

export default function MessagesList({ currentUser }: MessagesListProps) {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadConversations()
    const interval = setInterval(loadConversations, 5000) // Обновление каждые 5 секунд
    return () => clearInterval(interval)
  }, [])

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/messages')
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error('Load conversations error:', error)
    } finally {
      setIsLoading(false)
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

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.messagesBox}>
        <h1 className={styles.title}>Сообщения</h1>
        {conversations.length === 0 ? (
          <div className={styles.empty}>
            <p>У вас пока нет сообщений</p>
            <p className={styles.emptyHint}>Начните переписку с друзьями!</p>
          </div>
        ) : (
          <div className={styles.conversations}>
            {conversations.map((conv) => (
              <Link
                key={conv.user.id}
                href={`/messages/${conv.user.id}`}
                className={styles.conversationItem}
              >
                {conv.user.avatar ? (
                  <img src={conv.user.avatar} alt={conv.user.name} className={styles.avatar} />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {conv.user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className={styles.conversationInfo}>
                  <div className={styles.conversationHeader}>
                    <div className={styles.userName}>{conv.user.name}</div>
                    {conv.lastMessage && (
                      <div className={styles.time}>{formatDate(conv.lastMessage.createdAt)}</div>
                    )}
                  </div>
                  {conv.lastMessage && (
                    <div className={styles.lastMessage}>
                      {conv.lastMessage.content}
                    </div>
                  )}
                </div>
                {conv.unreadCount > 0 && (
                  <div className={styles.unreadBadge}>{conv.unreadCount}</div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

