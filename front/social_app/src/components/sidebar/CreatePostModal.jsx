import React, { useState } from 'react'
import { useApi } from '../../hooks/useApi'
import './CreatePostModal.css'

function CreatePostModal({ onClose, onPostCreated }) {
  const { makeRequest } = useApi()
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [picture, setPicture] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const isReady = !!title.trim()

  const handleSubmit = async e => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await makeRequest('create-post', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          content: desc.trim() || '',
          picture: picture.trim() || null
        })
      })
      
      // Обновляем список постов
      if (onPostCreated) {
        await onPostCreated()
      }
      
      // Закрываем модальное окно
      onClose()
    } catch (err) {
      console.error('Ошибка при создании поста:', err)
      setError(err.message || 'Не удалось создать пост')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-window">
        <h2>Создать пост</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Название <span className="modal-required">*</span>
            <input
              className="modal-input"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              placeholder="Название поста"
            />
          </label>
          <label>
            Описание
            <textarea
              className="modal-textarea"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Описание (необязательно)"
              rows={3}
            />
          </label>
          <label>
            URL картинки
            <input
              className="modal-input"
              type="url"
              value={picture}
              onChange={e => setPicture(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </label>
          {error && (
            <div style={{ color: '#d32f2f', fontSize: '14px', marginTop: '-10px' }}>
              {error}
            </div>
          )}
          <div className="modal-actions">
            <button
              type="submit"
              className="modal-submit"
              disabled={!isReady || isLoading}
            >
              {isLoading ? 'Создание...' : 'Создать'}
            </button>
            <button
              type="button"
              className="modal-cancel"
              onClick={onClose}
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePostModal
