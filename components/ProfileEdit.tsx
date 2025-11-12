'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import styles from './ProfileEdit.module.css'

interface User {
  id: string
  name: string
  email: string
  bio?: string
  grade?: string
  avatar?: string
}

interface ProfileEditProps {
  user: User
}

export default function ProfileEdit({ user }: ProfileEditProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.bio || '',
    grade: user.grade || '',
    avatar: user.avatar || ''
  })
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar || null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите изображение')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Размер файла не должен превышать 5MB')
        return
      }
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setAvatarPreview(result)
        setFormData({ ...formData, avatar: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      let avatarUrl = formData.avatar

      // Загружаем аватар если есть новый файл
      if (avatarFile) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', avatarFile)
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData
        })

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          avatarUrl = uploadData.url
        } else {
          const errorData = await uploadResponse.json()
          alert(errorData.error || 'Ошибка при загрузке аватара')
          setIsSaving(false)
          return
        }
      }

      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, avatar: avatarUrl })
      })

      if (response.ok) {
        setIsEditing(false)
        setAvatarFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        router.refresh()
      }
    } catch (error) {
      console.error('Update profile error:', error)
      alert('Ошибка при обновлении профиля')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isEditing) {
    return (
      <div className={styles.card}>
        <button
          onClick={() => setIsEditing(true)}
          className={styles.editButton}
        >
          Редактировать профиль
        </button>
      </div>
    )
  }

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Редактирование профиля</h3>
      <div className={styles.form}>
        <label className={styles.label}>
          Имя
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={styles.input}
          />
        </label>
        <label className={styles.label}>
          Класс
          <input
            type="text"
            value={formData.grade}
            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
            className={styles.input}
            placeholder="Например: 10А"
          />
        </label>
        <label className={styles.label}>
          О себе
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className={styles.textarea}
            rows={3}
            placeholder="Расскажите о себе..."
          />
        </label>
        <label className={styles.label}>
          Аватар
          {avatarPreview && (
            <div className={styles.avatarPreview}>
              <img src={avatarPreview} alt="Avatar preview" className={styles.avatarImage} />
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className={styles.fileInput}
            id="avatar-input"
          />
          <label htmlFor="avatar-input" className={styles.fileInputLabel}>
            📷 {avatarPreview ? 'Изменить аватар' : 'Загрузить аватар'}
          </label>
        </label>
        <div className={styles.actions}>
          <button
            onClick={() => {
              setIsEditing(false)
              setFormData({
                name: user.name,
                bio: user.bio || '',
                grade: user.grade || '',
                avatar: user.avatar || ''
              })
            }}
            className={styles.cancelButton}
            disabled={isSaving}
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            className={styles.saveButton}
            disabled={isSaving}
          >
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  )
}

