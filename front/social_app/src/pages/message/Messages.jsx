import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import Header from '../../components/header/Header'
import './Messages.css'

const API_URL = 'http://localhost:8000/api'

function Messages() {
  const navigate = useNavigate()
  const [dialogs, setDialogs] = useState([])
  const [selectedDialog, setSelectedDialog] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showNewDialogModal, setShowNewDialogModal] = useState(false)
  const [allUsers, setAllUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef(null)

  // Проверка авторизации
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      navigate('/auth')
    }
  }, [navigate])

  // Загрузка списка диалогов
  useEffect(() => {
    fetchDialogs()
    const interval = setInterval(fetchDialogs, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchDialogs = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(
        `${API_URL}/messages/dialogs/list`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        setDialogs(data)
      }
    } catch (error) {
      console.error('Ошибка загрузки диалогов:', error)
    }
  }

  // Загрузка сообщений выбранного диалога
  useEffect(() => {
    if (!selectedDialog) return

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('access_token')
        const response = await fetch(
          `${API_URL}/messages/${selectedDialog.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )
        
        if (response.ok) {
          const data = await response.json()
          setMessages(data)
        }
      } catch (error) {
        console.error('Ошибка загрузки сообщений:', error)
      }
    }

    fetchMessages()
    const interval = setInterval(fetchMessages, 2000)
    return () => clearInterval(interval)
  }, [selectedDialog])

  // Автоскролл вниз при новых сообщениях
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Загрузка ВСЕХ пользователей при открытии модального окна
  useEffect(() => {
    if (showNewDialogModal && allUsers.length === 0) {
      fetchAllUsers()
    }
  }, [showNewDialogModal])

  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(
        `${API_URL}/users/all`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        setAllUsers(data)
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error)
    }
  }

  // Фильтрация пользователей по поисковому запросу
  const filteredUsers = allUsers.filter(user => {
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    const firstName = user.first_name?.toLowerCase() || ''
    const lastName = user.last_name?.toLowerCase() || ''
    const username = user.username?.toLowerCase() || ''
    
    return firstName.includes(query) || 
           lastName.includes(query) || 
           username.includes(query)
  })

  const handleDialogClick = (dialog) => {
    setSelectedDialog(dialog)
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedDialog) return

    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(
        `${API_URL}/messages/send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            receiver_id: selectedDialog.id,
            content: messageInput,
            picture_url: ""
          })
        }
      )

      if (response.ok) {
        const newMessage = await response.json()
        setMessages(prev => [...prev, newMessage])
        setMessageInput('')
        
        // Обновляем список диалогов
        fetchDialogs()
      }
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleStartNewDialog = (user) => {
    setSelectedDialog({
      id: user.user_id,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Пользователь',
      avatar: user.avatar_url || 'https://via.placeholder.com/50'
    })
    setMessages([])
    setShowNewDialogModal(false)
    setSearchQuery('')
  }

  // Функция для определения текущего пользователя из сообщений
  const getCurrentUserId = () => {
    if (messages.length === 0) return null
    // Берем первое сообщение и определяем, кто НЕ selectedDialog.id
    const firstMsg = messages[0]
    if (firstMsg.sender_id === selectedDialog.id) {
      return firstMsg.receiver_id
    }
    return firstMsg.sender_id
  }

  const currentUserId = getCurrentUserId()

  return (
    <div className="messages-page">
      <Header />
      <div className="messages-container">
        {/* Левая панель - список диалогов */}
        <aside className="messages-sidebar">
          <div className="messages-header">
            <h2 className="messages-title">Сообщения</h2>
            <button 
              className="new-dialog-btn"
              onClick={() => setShowNewDialogModal(true)}
              title="Новый диалог"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
          </div>
          
          <div className="dialogs-list">
            {dialogs.length === 0 ? (
              <div className="no-dialogs">
                <p>Нет диалогов</p>
                <button 
                  className="start-dialog-btn"
                  onClick={() => setShowNewDialogModal(true)}
                >
                  Начать диалог
                </button>
              </div>
            ) : (
              dialogs.map(dialog => (
                <div
                  key={dialog.id}
                  className={`dialog-item ${selectedDialog?.id === dialog.id ? 'active' : ''}`}
                  onClick={() => handleDialogClick(dialog)}
                >
                  <img src={dialog.avatar} alt={dialog.name} className="dialog-avatar" />
                  <div className="dialog-info">
                    <h3 className="dialog-name">{dialog.name}</h3>
                    <p className="dialog-last-message">{dialog.lastMessage}</p>
                  </div>
                  {dialog.unread > 0 && (
                    <span className="dialog-unread">{dialog.unread}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Правая панель - выбранный диалог */}
        <main className="messages-content">
          {selectedDialog ? (
            <>
              <div className="chat-header">
                <img src={selectedDialog.avatar} alt={selectedDialog.name} className="chat-avatar" />
                <h3 className="chat-name">{selectedDialog.name}</h3>
              </div>
              <div className="chat-messages">
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>
                    Начните общение
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMine = currentUserId ? msg.sender_id === currentUserId : msg.receiver_id === selectedDialog.id
                    return (
                      <div key={index} className={`message ${isMine ? 'me' : 'them'}`}>
                        <div className="message-bubble">
                          <p className="message-text">{msg.content}</p>
                          {msg.picture_url && (
                            <img 
                              src={msg.picture_url} 
                              alt="attachment" 
                              style={{ maxWidth: '200px', marginTop: '5px', borderRadius: '8px' }}
                            />
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="chat-input">
                <input 
                  type="text" 
                  placeholder="Напишите сообщение..." 
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                />
                <button onClick={handleSendMessage} disabled={loading || !messageInput.trim()}>
                  {loading ? 'Отправка...' : 'Отправить'}
                </button>
              </div>
            </>
          ) : (
            <div className="no-dialog-selected">
              <p>Выберите диалог чтобы начать общение</p>
            </div>
          )}
        </main>
      </div>

      {/* Модальное окно для выбора пользователя */}
      {showNewDialogModal && (
        <div className="modal-overlay" onClick={() => setShowNewDialogModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Новый диалог</h3>
              <button 
                className="modal-close"
                onClick={() => setShowNewDialogModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <input
                type="text"
                placeholder="Поиск пользователей..."
                className="user-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              
              <div className="users-list">
                {filteredUsers.length === 0 ? (
                  <p className="no-users">
                    {allUsers.length === 0 ? 'Загрузка пользователей...' : 'Пользователи не найдены'}
                  </p>
                ) : (
                  filteredUsers.map(user => (
                    <div
                      key={user.user_id}
                      className="user-item"
                      onClick={() => handleStartNewDialog(user)}
                    >
                      <img 
                        src={user.avatar_url || 'https://via.placeholder.com/50'} 
                        alt={`${user.first_name || ''} ${user.last_name || ''}`}
                        className="user-avatar"
                      />
                      <div className="user-info">
                        <h4>
                          {user.first_name && user.last_name 
                            ? `${user.first_name} ${user.last_name}` 
                            : user.username || 'Пользователь'}
                        </h4>
                        {user.username && <p>@{user.username}</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Messages
