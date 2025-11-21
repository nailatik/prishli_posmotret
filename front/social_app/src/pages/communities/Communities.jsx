import React, { useState, useRef, useEffect } from 'react'
import Header from '../../components/header/Header'
import './Communities.css'

const MOCK_COMMUNITIES = Array.from({ length: 100 }).map((_, idx) => ({
  id: idx + 1,
  name: `Сообщество ${idx + 1}`,
  avatar: `https://api.dicebear.com/7.x/fun/svg?seed=${idx + 1}`,
  description: `Описание сообщества номер ${idx + 1}. Очень интересное и классное место!`
}))

const PAGE_SIZE = 20

function Communities() {
  const [query, setQuery] = useState('')
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE)

  const filtered = MOCK_COMMUNITIES.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase())
  )
  const communitiesToDisplay = filtered.slice(0, displayCount)

  const loaderRef = useRef(null)

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

  return (
    <div className="communities-page">
      <Header />
      <main className="communities-content">
        <h1 className="communities-title">Наши сообщества</h1>
        <div className="communities-search-wrap">
          <input
            className="communities-search"
            type="text"
            placeholder="Поиск по сообществам…"
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
