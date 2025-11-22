import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router'
import { useApi } from '../../hooks/useApi'
import Header from '../../components/header/Header'
import './Communities.css'

const PAGE_SIZE = 20

function Communities() {
  const { makeRequest } = useApi()
  const [query, setQuery] = useState('')
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE)
  const [allCommunities, setAllCommunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loaderRef = useRef(null)

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(true)
        const data = await makeRequest('user/me/communities')
        setAllCommunities(data)
      } catch (err) {
        setError(err.message || 'Ошибка загрузки сообществ')
      } finally {
        setLoading(false)
      }
    }
    fetchCommunities()
  }, [])

  const filtered = allCommunities.filter(c =>
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

  if (loading) {
    return (
      <div className="communities-page">
        <Header />
        <main className="communities-content">
          <div className="communities-loader">Загрузка сообществ...</div>
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
        <h1 className="communities-title">Мои сообщества</h1>
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
            <Link
              to={`/community/${c.id}`}
              className="community-card"
              key={c.id}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <img className="community-avatar" src={c.avatar} alt={c.name} />
              <div className="community-name">{c.name}</div>
              <div className="community-desc">
                {c.description.length > 20
                  ? `${c.description.slice(0, 20)}...`
                  : c.description}
              </div>
            </Link>
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
