import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import Header from '../../components/header/Header'
import Sidebar from '../../components/sidebar/Sidebar'
import FeedList from '../../components/FeedList'
import './Messages.css'

function Messages() {
  const navigate = useNavigate()

  // Состояния
  const [dialogs, setDialogs] = useState([
    { id: 1, name: 'Имя Фамилия', avatar: 'https://i.pravatar.cc/150?img=1', lastMessage: 'Привет, как дела?', unread: 2 },
    { id: 2, name: 'Анна Смирнова', avatar: 'https://i.pravatar.cc/150?img=2', lastMessage: 'Увидимся завтра!', unread: 0 },
    { id: 3, name: 'Петр Иванов', avatar: 'https://i.pravatar.cc/150?img=3', lastMessage: 'Спасибо за помощь', unread: 1 },
    { id: 4, name: 'Мария Козлова', avatar: 'https://i.pravatar.cc/150?img=4', lastMessage: 'Отправил файлы', unread: 0 },
    { id: 5, name: 'Сергей Попов', avatar: 'https://i.pravatar.cc/150?img=5', lastMessage: 'Когда встретимся?', unread: 0 },
  ])

  const [selectedDialog, setSelectedDialog] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')

  // Проверка авторизации
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) navigate('/auth')
  }, [navigate])

  // Заглушка загрузки сообщений (замените на реальный запрос)
  const loadMessages = (dialogId) => {
    // TODO: Заменить на запрос к API
    const mockMessages = {
      1: [
        { id: 1, text: 'Привет!', sender: 'me', time: '14:20' },
        { id: 2, text: 'Привет, как дела?', sender: 'them', time: '14:22' },
        { id: 3, text: 'Всё отлично, спасибо!', sender: 'me', time: '14:25' },
      ],
      2: [
        { id: 1, text: 'Встретимся завтра?', sender: 'them', time: '10:15' },
        { id: 2, text: 'Да, конечно!', sender: 'me', time: '10:20' },
      ],
    }
    setMessages(mockMessages[dialogId] || [])
  }

  const handleDialogClick = (dialog) => {
    setSelectedDialog(dialog)
    loadMessages(dialog.id)
  }

  // Отправка сообщения
  const sendMessage = () => {
    if (!inputMessage.trim() || !selectedDialog) return

    // Добавляем сообщение локально (с id и временем)
    const newMessage = {
      id: messages.length ? messages[messages.length - 1].id + 1 : 1,
      text: inputMessage,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages([...messages, newMessage])
    setInputMessage('')

    // TODO: Отправить на сервер, например:
    // await api.sendMessage(selectedDialog.id, inputMessage)
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
            {dialogs.map(dialog => (
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
            ))}
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
              {/* <div className="chat-input">
                <input type="text" placeholder="Напишите сообщение..." />
                <button>Отправить</button>
              </div> */}

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
