'use client'

import { useState } from 'react'
import styles from './fix-user.module.css'

export default function FixUserPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleFix = async () => {
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch('/api/admin/fix-user', {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`Пользователь исправлен: ${data.user.email} (${data.user.name}) теперь администратор`)
      } else {
        setError(data.error || 'Ошибка при исправлении')
      }
    } catch (err) {
      setError('Ошибка при подключении')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Исправление статуса пользователя</h1>
        <p className={styles.description}>
          Эта утилита исправляет статус первого зарегистрированного пользователя,
          делая его администратором со статусом "одобрен".
        </p>
        
        {message && <div className={styles.success}>{message}</div>}
        {error && <div className={styles.error}>{error}</div>}

        <button
          onClick={handleFix}
          disabled={loading}
          className={styles.button}
        >
          {loading ? 'Исправление...' : 'Исправить первого пользователя'}
        </button>

        <p className={styles.note}>
          После исправления вы сможете войти в систему как администратор.
        </p>
      </div>
    </div>
  )
}

