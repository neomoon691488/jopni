'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './Navbar.module.css'

interface NavbarProps {
  userName?: string
  userAvatar?: string
  userRole?: 'admin' | 'user'
}

export default function Navbar({ userName, userAvatar, userRole }: NavbarProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/feed" className={styles.logo}>
          Школьная Сеть
        </Link>
        <div className={styles.right}>
          <Link href="/feed" className={styles.link}>
            Лента
          </Link>
          {userName && (
            <>
              <Link href="/search" className={styles.link}>
                Поиск
              </Link>
              <Link href="/messages" className={styles.link}>
                Сообщения
              </Link>
              <Link href="/profile" className={styles.link}>
                Профиль
              </Link>
              {userRole === 'admin' && (
                <Link href="/admin" className={styles.link}>
                  Админ
                </Link>
              )}
              <div className={styles.user}>
                {userAvatar && (
                  <img src={userAvatar} alt={userName} className={styles.avatar} />
                )}
                <span className={styles.userName}>{userName}</span>
                <button onClick={handleLogout} className={styles.logoutButton}>
                  Выйти
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

