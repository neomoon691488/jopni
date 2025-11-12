'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './AdminPanel.module.css'

interface User {
  id: string
  email: string
  name: string
  grade?: string
  role: 'admin' | 'user'
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

interface AdminPanelProps {
  pendingUsers: User[]
  allUsers: User[]
}

export default function AdminPanel({ pendingUsers: initialPending, allUsers: initialAll }: AdminPanelProps) {
  const router = useRouter()
  const [pendingUsers, setPendingUsers] = useState(initialPending)
  const [allUsers, setAllUsers] = useState(initialAll)
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending')
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', grade: '' })

  const refreshData = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const users = await response.json()
        setPendingUsers(users.filter((u: User) => u.status === 'pending'))
        setAllUsers(users)
      }
    } catch (error) {
      console.error('Error refreshing data:', error)
    }
  }

  const handleApprove = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'POST'
      })
      if (response.ok) {
        await refreshData()
        router.refresh()
      }
    } catch (error) {
      console.error('Approve error:', error)
    }
  }

  const handleReject = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/reject`, {
        method: 'POST'
      })
      if (response.ok) {
        await refreshData()
        router.refresh()
      }
    } catch (error) {
      console.error('Reject error:', error)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user.id)
    setEditForm({ name: user.name, grade: user.grade || '' })
  }

  const handleSaveEdit = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })
      if (response.ok) {
        setEditingUser(null)
        await refreshData()
        router.refresh()
      }
    } catch (error) {
      console.error('Edit error:', error)
    }
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    setEditForm({ name: '', grade: '' })
  }

  const getStatusBadge = (status: string) => {
    const styles_map: Record<string, string> = {
      pending: styles.badgePending,
      approved: styles.badgeApproved,
      rejected: styles.badgeRejected
    }
    const labels: Record<string, string> = {
      pending: 'Ожидает',
      approved: 'Одобрен',
      rejected: 'Отклонен'
    }
    return (
      <span className={`${styles.badge} ${styles_map[status] || ''}`}>
        {labels[status] || status}
      </span>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.panel}>
        <h1 className={styles.title}>Панель администратора</h1>
        
        <div className={styles.tabs}>
          <button
            onClick={() => setActiveTab('pending')}
            className={`${styles.tab} ${activeTab === 'pending' ? styles.activeTab : ''}`}
          >
            Ожидающие одобрения ({pendingUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`${styles.tab} ${activeTab === 'all' ? styles.activeTab : ''}`}
          >
            Все пользователи ({allUsers.length})
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === 'pending' && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Заявки на регистрацию</h2>
              {pendingUsers.length === 0 ? (
                <div className={styles.empty}>Нет ожидающих одобрения пользователей</div>
              ) : (
                <div className={styles.userList}>
                  {pendingUsers.map((user) => (
                    <div key={user.id} className={styles.userCard}>
                      <div className={styles.userInfo}>
                        <div className={styles.userName}>{user.name}</div>
                        <div className={styles.userEmail}>{user.email}</div>
                        {user.grade && <div className={styles.userGrade}>Класс: {user.grade}</div>}
                        <div className={styles.userDate}>
                          Зарегистрирован: {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                      <div className={styles.userActions}>
                        <button
                          onClick={() => handleApprove(user.id)}
                          className={styles.approveButton}
                        >
                          Одобрить
                        </button>
                        <button
                          onClick={() => handleReject(user.id)}
                          className={styles.rejectButton}
                        >
                          Отклонить
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'all' && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Все пользователи</h2>
              <div className={styles.userList}>
                {allUsers.map((user) => (
                  <div key={user.id} className={styles.userCard}>
                    <div className={styles.userInfo}>
                      {editingUser === user.id ? (
                        <div className={styles.editForm}>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className={styles.editInput}
                            placeholder="Имя"
                          />
                          <input
                            type="text"
                            value={editForm.grade}
                            onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                            className={styles.editInput}
                            placeholder="Класс"
                          />
                          <div className={styles.editActions}>
                            <button
                              onClick={() => handleSaveEdit(user.id)}
                              className={styles.saveButton}
                            >
                              Сохранить
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className={styles.cancelButton}
                            >
                              Отмена
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className={styles.userHeader}>
                            <div className={styles.userName}>{user.name}</div>
                            {user.role === 'admin' && (
                              <span className={styles.adminBadge}>Админ</span>
                            )}
                            {getStatusBadge(user.status)}
                          </div>
                          <div className={styles.userEmail}>{user.email}</div>
                          {user.grade && <div className={styles.userGrade}>Класс: {user.grade}</div>}
                          <div className={styles.userDate}>
                            Зарегистрирован: {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                          </div>
                        </>
                      )}
                    </div>
                    {editingUser !== user.id && (
                      <div className={styles.userActions}>
                        <button
                          onClick={() => handleEdit(user)}
                          className={styles.editButton}
                        >
                          Редактировать
                        </button>
                        {user.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(user.id)}
                              className={styles.approveButton}
                            >
                              Одобрить
                            </button>
                            <button
                              onClick={() => handleReject(user.id)}
                              className={styles.rejectButton}
                            >
                              Отклонить
                            </button>
                          </>
                        )}
                        {user.status === 'rejected' && (
                          <button
                            onClick={() => handleApprove(user.id)}
                            className={styles.approveButton}
                          >
                            Одобрить
                          </button>
                        )}
                        {user.status === 'approved' && user.role !== 'admin' && (
                          <button
                            onClick={() => handleReject(user.id)}
                            className={styles.rejectButton}
                          >
                            Отклонить
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

