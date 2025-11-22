import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import Header from '../../components/header/Header'
import './Messages.css'

const API_URL = 'http://localhost:8000/api'  // измени на свой URL

function Messages() {
  const navigate = useNavigate()
  const [currentUserId, setCurrentUserId] = useState(null)
  const [dialogs, setDialogs] = useState([])
  const [selectedDialog, setSelectedDialog] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  // Проверка авторизации и получение ID текущего пользователя
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      navigate('/auth')
      return
    }

    // Получаем ID текущего пользователя из токена или из отдельного API
    // Предполагаю, что у тебя есть способ получить current user ID
    const userId = localStorage.getItem('user_id') // или декодируй из JWT
    setCurrentUserId(parseInt(userId))
  }, [navigate])

  // Загрузка списка диалогов
  useEffect(() => {
    if (!currentUserId) return

    const fetchDialogs = async () => {
      try {
        const token = localStorage.getItem('access_token')
        const response = await fetch(
          `${API_URL}/messages/dialogs/list?user_id=${currentUserId}`,
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

    fetchDialogs()
    // Обновляем диалоги каждые 5 секунд
    const interval = setInterval(fetchDialogs, 5000)
    return () => clearInterval(interval)
  }, [currentUserId])

  // Загрузка сообщений выбранного диалога
  useEffect(() => {
    if (!selectedDialog || !currentUserId) return

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('access_token')
        const response = await fetch(
          `${API_URL}/messages/${selectedDialog.id}?current_user_id=${currentUserId}`,
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
    // Обновляем сообщения каждые 2 секунды
    const interval = setInterval(fetchMessages, 2000)
    return () => clearInterval(interval)
  }, [selectedDialog, currentUserId])

  // Автоскролл вниз при новых сообщениях
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleDialogClick = (dialog) => {
    setSelectedDialog(dialog)
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedDialog || !currentUserId) return

    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(
        `${API_URL}/messages/send?sender_id=${currentUserId}`,
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

  return (
    <div className="messages-page">
      <Header />
      <div className="messages-container">
        {/* Левая панель - список диалогов */}
        <aside className="messages-sidebar">
          <h2 className="messages-title">Сообщения</h2>
          <div className="dialogs-list">
            {dialogs.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                Нет диалогов
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
                    const isMine = msg.sender_id === currentUserId
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
              <p>Выберите диалог, чтобы начать общение</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Messages
