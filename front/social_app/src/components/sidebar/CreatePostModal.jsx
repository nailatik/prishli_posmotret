import React, { useState } from 'react'
import './CreatePostModal.css'

function CreatePostModal({ onClose }) {
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [file, setFile] = useState(null)

  const isReady = !!title.trim()

  const handleSubmit = e => {
    e.preventDefault()
    // Здесь логика создания поста
    onClose()
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
            Вложение
            <input
              className="modal-file"
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              onChange={e => setFile(e.target.files[0])}
            />
          </label>
          <div className="modal-actions">
            <button
              type="submit"
              className="modal-submit"
              disabled={!isReady}
            >
              Создать
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
