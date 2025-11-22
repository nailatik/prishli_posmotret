import React, { useState } from 'react'
import './Sidebar.css'
import CreatePostModal from './CreatePostModal'

function Sidebar({ onPostCreated }) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-buttons">
          <button className="sidebar-btn">Весь мир</button>
          <button className="sidebar-btn">Мой мир</button>
          <button className="sidebar-btn" onClick={() => setModalOpen(true)}>Создать пост</button>
        </div>
      </aside>
      {modalOpen && (
        <CreatePostModal
          onClose={() => setModalOpen(false)}
          onPostCreated={onPostCreated}
        />
      )}
    </>
  )
}

export default Sidebar
