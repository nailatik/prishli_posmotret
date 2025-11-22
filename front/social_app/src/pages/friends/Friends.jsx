import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router'
import Header from '../../components/header/Header'
import './Friends.css'

const PAGE_SIZE = 20

function Communities() {
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      navigate('/auth')
    }
  }, [navigate])
  const [query, setQuery] = useState('')
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE)
  const [allFriends, setAllFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loaderRef = useRef(null)

  // Заменяем MOCK_COMMUNITIES на запрос к бэку
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true)
        const currentUserId = 1 // TODO: получить из контекста/авторизации
        const response = await fetch(`http://localhost:8000/api/friends/${currentUserId}`)
        if (!response.ok) {
          throw new Error('Ошибка загрузки друзей')
        }
        const data = await response.json()
        setAllFriends(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchFriends()
  }, [])

  const filtered = allFriends.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase())
  )
  const communitiesToDisplay = filtered.slice(0, displayCount)

  useEffect(() => {
    if (!loaderRef.current) return
    const handleObserve = (entries) => {
      if (entries[0].isIntersecting && displayCount < filtered.length) {
        setDisplayCount(count => Math.min(count + PAGE_SIZE, filtered.length))
      }
    }
    const observer = new IntersectionObserver(handleObserve, { threshold: 1 })
    observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [displayCount, filtered.length])

  useEffect(() => {
    setDisplayCount(PAGE_SIZE)
  }, [query])

  const handleCardClick = (community) => {
    alert(`Открыть: ${community.name}`)
  }

  if (loading) {
    return (
      <div className="communities-page">
        <Header />
        <main className="communities-content">
          <div className="communities-loader">Загрузка друзей...</div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="communities-page">
        <Header />
        <main className="communities-content">
          <div className="communities-empty">Ошибка: {error}</div>
        </main>
      </div>
    )
  }

  return (
    <div className="communities-page">
      <Header />
      <main className="communities-content">
        <h1 className="communities-title">Мои друзья</h1>
        <div className="communities-search-wrap">
          <input
            className="communities-search"
            type="text"
            placeholder="Поиск друзей..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="communities-list">
          {communitiesToDisplay.map(c => (
            <div
              className="community-card"
              key={c.id}
              onClick={() => handleCardClick(c)}
            >
              <img className="community-avatar" src={c.avatar} alt={c.name} />
              <div className="community-name">{c.name}</div>
              <div className="community-desc">
                {c.description.length > 20
                  ? `${c.description.slice(0, 20)}...`
                  : c.description}
              </div>
            </div>
          ))}
        </div>
        {displayCount < filtered.length && (
          <div ref={loaderRef} className="communities-loader">Загрузка...</div>
        )}
        {filtered.length === 0 && (
          <div className="communities-empty">Ничего не найдено</div>
        )}
      </main>
    </div>
  )
}

export default Communities