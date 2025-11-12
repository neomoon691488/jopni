'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './SearchComponent.module.css'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  grade?: string
}

export default function SearchComponent() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (query.length < 2) {
      setResults([])
      return
    }

    setIsLoading(true)
    timeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
        if (response.ok) {
          const data = await response.json()
          setResults(data)
        }
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [query])

  return (
    <div className={styles.container}>
      <div className={styles.searchBox}>
        <h1 className={styles.title}>Поиск пользователей</h1>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            placeholder="Поиск по имени, email или классу..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.input}
            autoFocus
          />
          {isLoading && <div className={styles.loader}>...</div>}
        </div>

        {results.length > 0 && (
          <div className={styles.results}>
            {results.map((user) => (
              <Link key={user.id} href={`/users/${user.id}`} className={styles.resultItem}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className={styles.avatar} />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className={styles.userInfo}>
                  <div className={styles.userName}>{user.name}</div>
                  {user.grade && <div className={styles.userGrade}>{user.grade}</div>}
                </div>
              </Link>
            ))}
          </div>
        )}

        {query.length >= 2 && results.length === 0 && !isLoading && (
          <div className={styles.noResults}>
            Пользователи не найдены
          </div>
        )}
      </div>
    </div>
  )
}

