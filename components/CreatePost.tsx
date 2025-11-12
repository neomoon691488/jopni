'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import styles from './CreatePost.module.css'

interface CreatePostProps {
  userId: string
}

export default function CreatePost({ userId }: CreatePostProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [content, setContent] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

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
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImage(null)
    setImageFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isSubmitting) return

    setIsSubmitting(true)
    setIsUploading(true)
    
    try {
      let imageUrl = null

      // Загружаем изображение если есть
      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          imageUrl = uploadData.url
        } else {
          const errorData = await uploadResponse.json()
          alert(errorData.error || 'Ошибка при загрузке изображения')
          setIsSubmitting(false)
          setIsUploading(false)
          return
        }
      }

      setIsUploading(false)

      // Создаем пост
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, image: imageUrl || undefined })
      })

      if (response.ok) {
        setContent('')
        setImage(null)
        setImageFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        router.refresh()
      }
    } catch (error) {
      console.error('Create post error:', error)
      alert('Ошибка при создании поста')
    } finally {
      setIsSubmitting(false)
      setIsUploading(false)
    }
  }

  return (
    <div className={styles.card}>
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="О чем вы думаете?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={styles.textarea}
          rows={3}
        />
        
        {image && (
          <div className={styles.imagePreview}>
            <img src={image} alt="Preview" className={styles.previewImage} />
            <button
              type="button"
              onClick={handleRemoveImage}
              className={styles.removeImageButton}
            >
              ✕
            </button>
          </div>
        )}

        <div className={styles.fileInputWrapper}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className={styles.fileInput}
            id="post-image-input"
          />
          <label htmlFor="post-image-input" className={styles.fileInputLabel}>
            📷 {image ? 'Изменить изображение' : 'Добавить фото'}
          </label>
        </div>

        <div className={styles.actions}>
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className={styles.button}
          >
            {isSubmitting ? (isUploading ? 'Загрузка...' : 'Публикация...') : 'Опубликовать'}
          </button>
        </div>
      </form>
    </div>
  )
}

