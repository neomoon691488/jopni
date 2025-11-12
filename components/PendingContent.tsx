'use client'

import { useRouter } from 'next/navigation'
import styles from './PendingContent.module.css'

export default function PendingContent() {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <div className={styles.actions}>
      <button
        onClick={handleLogout}
        className={styles.button}
      >
        Выйти из аккаунта
      </button>
    </div>
  )
}

