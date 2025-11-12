import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import PendingContent from '@/components/PendingContent'
import styles from './pending.module.css'

export default async function PendingPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  if (user.status === 'approved') {
    redirect('/feed')
  }

  if (user.status === 'rejected') {
    redirect('/login')
  }

  return (
    <>
      <Navbar userName={user.name} userAvatar={user.avatar} userRole={user.role} />
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.icon}>⏳</div>
          <h1 className={styles.title}>Ожидание одобрения</h1>
          <p className={styles.message}>
            Ваш аккаунт ожидает одобрения администратора.
            <br />
            Вы получите доступ к сайту после проверки вашей заявки.
          </p>
          <PendingContent />
        </div>
      </div>
    </>
  )
}

