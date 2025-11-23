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
        const currentUserId = localStorage.getItem('user_id') || '1'
        const response = await fetch(`http://localhost:8000/api/friends/${currentUserId}`)
        if (!response.ok) {
          throw new Error('Ошибка загрузки друзей')
        }
        const data = await response.json()
              setAllFriends(Array.isArray(data.friends) ? data.friends : [])
            } catch (err) {
              setError(err.message)
            } finally {
              setLoading(false)
            }
          }
          fetchFriends()
        }, [])

      const filtered = allFriends.filter(c => {
      const fullName = `${c.first_name || ''} ${c.last_name || ''}`.trim().toLowerCase()
      const username = (c.username || '').toLowerCase()
      const q = query.toLowerCase()
      return fullName.includes(q) || username.includes(q)
    })

    const communitiesToDisplay = filtered.slice(0, displayCount);



      {communitiesToDisplay.map(c => (
        <div
          className="community-card"
          key={c.user_id}  // заменил c.id на c.user_id
          onClick={() => handleCardClick(c)}
        >
          <img className="community-avatar" src={c.avatar} alt={c.username || 'avatar'} />
          <div className="community-name">{c.username || `${c.first_name} ${c.last_name}`}</div> {/* заменил c.name */}
          <div className="community-desc">
            {c.bio ? (c.bio.length > 20 ? `${c.bio.slice(0, 20)}...` : c.bio) : ''}
          </div>
        </div>
      ))}



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

  const handleCardClick = (c) => {
    navigate(`/profile/${c.user_id}`)
  };



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
              key={c.user_id}  // правильно user_id
              onClick={() => handleCardClick(c)}
            >
              <img className="community-avatar" src={c.avatar} alt={c.username || 'avatar'} />
              <div className="community-name">{c.username || `${c.first_name} ${c.last_name}`}</div>
              {/* Если нужно описание, раскомментируй и исправь так: */}
              {/* <div className="community-desc">
                {c.bio ? (c.bio.length > 20 ? `${c.bio.slice(0, 20)}...` : c.bio) : ''}
              </div> */}
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