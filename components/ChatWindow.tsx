'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import styles from './ChatWindow.module.css'

interface User {
  id: string
  name: string
  avatar?: string
}

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  read: boolean
  createdAt: string
}

interface ChatWindowProps {
  currentUser: User
  otherUser: User
}

export default function ChatWindow({ currentUser, otherUser }: ChatWindowProps) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadMessages()
    const interval = setInterval(loadMessages, 2000) // Обновление каждые 2 секунды
    return () => clearInterval(interval)
  }, [otherUser.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/messages?userId=${otherUser.id}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Load messages error:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || isSending) return

    setIsSending(true)
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: otherUser.id,
          content: messageText
        })
      })

      if (response.ok) {
        setMessageText('')
        loadMessages()
      }
    } catch (error) {
      console.error('Send message error:', error)
    } finally {
      setIsSending(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={styles.container}>
      <div className={styles.chatBox}>
        <div className={styles.chatHeader}>
          <button onClick={() => router.push('/messages')} className={styles.backButton}>
            ← Назад
          </button>
          <div className={styles.userInfo}>
            {otherUser.avatar ? (
              <img src={otherUser.avatar} alt={otherUser.name} className={styles.avatar} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {otherUser.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className={styles.userName}>{otherUser.name}</div>
          </div>
        </div>

        <div className={styles.messagesContainer} ref={messagesContainerRef}>
          {messages.length === 0 ? (
            <div className={styles.emptyMessages}>
              <p>Начните переписку!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.senderId === currentUser.id
              return (
                <div
                  key={message.id}
                  className={`${styles.message} ${isOwn ? styles.ownMessage : styles.otherMessage}`}
                >
                  <div className={styles.messageContent}>
                    {message.content}
                  </div>
                  <div className={styles.messageTime}>
                    {formatTime(message.createdAt)}
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className={styles.inputForm}>
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Написать сообщение..."
            className={styles.messageInput}
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!messageText.trim() || isSending}
            className={styles.sendButton}
          >
            {isSending ? '...' : 'Отправить'}
          </button>
        </form>
      </div>
    </div>
  )
}

