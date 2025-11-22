import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import Header from '../../components/header/Header'
import './Messages.css'

const API_URL = 'http://localhost:8000/api'

function Messages() {
  const navigate = useNavigate()

  // Состояния
  const [dialogs, setDialogs] = useState([])
  const [selectedDialog, setSelectedDialog] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')

  // Проверка авторизации
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) navigate('/auth')
  }, [navigate])

  // Загрузка диалогов при монтировании
  useEffect(() => {
    loadDialogs()
    // Обновляем диалоги каждые 5 секунд
    const interval = setInterval(loadDialogs, 5000)
    return () => clearInterval(interval)
  }, [])

  // Загрузка сообщений при выборе диалога
  useEffect(() => {
    if (selectedDialog) {
      loadMessages(selectedDialog.id)
      // Обновляем сообщения каждые 2 секунды
      const interval = setInterval(() => loadMessages(selectedDialog.id), 2000)
      return () => clearInterval(interval)
    }
  }, [selectedDialog])

  // Загрузка списка диалогов
  const loadDialogs = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_URL}/messages/dialogs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setDialogs(data)
      } else {
        console.error('Ошибка загрузки диалогов:', response.status)
      }
    } catch (error) {
      console.error('Ошибка загрузки диалогов:', error)
    }
  }

  // Загрузка сообщений конкретного диалога
  const loadMessages = async (dialogId) => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_URL}/messages/${dialogId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      } else {
        console.error('Ошибка загрузки сообщений:', response.status)
      }
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error)
    }
  }

  const handleDialogClick = (dialog) => {
    setSelectedDialog(dialog)
  }

  // Отправка сообщения
  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedDialog) return

    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_URL}/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiver_id: selectedDialog.id,
          text: inputMessage
        })
      })

      if (response.ok) {
        const newMessage = await response.json()
        setMessages([...messages, newMessage])
        setInputMessage('')
        
        // Обновляем список диалогов
        loadDialogs()
      } else {
        console.error('Ошибка отправки сообщения:', response.status)
      }
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error)
    }
  }

  // Отправка по Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
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
                {messages.map(msg => (
                  <div key={msg.id} className={`message ${msg.sender}`}>
                    <div className="message-bubble">
                      <p className="message-text">{msg.text}</p>
                      <span className="message-time">{msg.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="chat-input">
                <textarea
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Напишите сообщение..."
                  rows={2}
                />
                <button onClick={sendMessage}>Отправить</button>
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
