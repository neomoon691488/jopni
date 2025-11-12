'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './login.module.css'

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    grade: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const url = isLogin ? '/api/auth/login' : '/api/auth/register'
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Произошла ошибка')
        setLoading(false)
        return
      }

      // Если регистрация успешна, но нужна модерация
      if (data.message && data.message.includes('одобрения')) {
        setError('')
        alert('Регистрация успешна! Ожидайте одобрения администратора.')
        setIsLogin(true)
        setFormData({ email: '', password: '', name: '', grade: '' })
        setLoading(false)
        return
      }

      // Успешный вход или регистрация админа
      setLoading(false)
      
      // Проверяем статус пользователя для правильного редиректа
      if (data.user) {
        if (data.user.status === 'pending') {
          window.location.href = '/pending'
        } else if (data.user.status === 'approved') {
          window.location.href = '/feed'
        } else {
          setError('Ваш аккаунт был отклонен')
          setLoading(false)
          return
        }
      } else {
        // Если нет данных пользователя, просто редиректим на feed
        window.location.href = '/feed'
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Произошла ошибка при подключении')
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Школьная Социальная Сеть</h1>
        <p className={styles.subtitle}>
          {isLogin ? 'Войдите в свой аккаунт' : 'Создайте новый аккаунт'}
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Имя"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required={!isLogin}
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Класс (необязательно)"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className={styles.input}
              />
            </>
          )}
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className={styles.input}
          />
          <input
            type="password"
            placeholder="Пароль"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            className={styles.input}
          />

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className={styles.button}
          >
            {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className={styles.switch}>
          {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setError('')
            }}
            className={styles.linkButton}
          >
            {isLogin ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </p>
      </div>
    </div>
  )
}

