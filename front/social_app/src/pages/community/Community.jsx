import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import Header from '../../components/header/Header'
import CommunityCard from '../../components/community/CommunityCard'
import { useApi } from '../../hooks/useApi'

export default function CommunityPage() {
  const { communityId } = useParams()
  const { makeRequest } = useApi()
  const [communityData, setCommunityData] = useState(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        setLoading(true)
        // Запрос данных сообщества
        const data = await makeRequest(`communities/${communityId}`)
        setCommunityData(data)
        
        // Проверяем, подписан ли пользователь
        setIsSubscribed(data.is_subscribed || false)
      } catch (err) {
        setError(err.message || 'Ошибка загрузки сообщества')
      } finally {
        setLoading(false)
      }
    }
    fetchCommunity()
  }, [communityId])

  const handleSubscribe = async (communityId) => {
    try {
      await makeRequest(`communities/${communityId}/subscribe`, {
        method: 'POST'
      })
      setIsSubscribed(true)
      // Обновляем данные сообщества
      const data = await makeRequest(`communities/${communityId}`)
      setCommunityData(data)
    } catch (err) {
      console.error('Ошибка подписки:', err)
      alert('Не удалось подписаться на сообщество')
    }
  }

  const handleUnsubscribe = async (communityId) => {
    try {
      await makeRequest(`communities/${communityId}/unsubscribe`, {
        method: 'POST'
      })
      setIsSubscribed(false)
      // Обновляем данные сообщества
      const data = await makeRequest(`communities/${communityId}`)
      setCommunityData(data)
    } catch (err) {
      console.error('Ошибка отписки:', err)
      alert('Не удалось отписаться от сообщества')
    }
  }

  if (loading) return <div>Загрузка...</div>
  if (error) return <div>Ошибка: {error}</div>

  return (
    <div>
      <Header />
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
        <CommunityCard 
          community={communityData}
          isSubscribed={isSubscribed}
          onSubscribe={handleSubscribe}
          onUnsubscribe={handleUnsubscribe}
        />
      </div>
    </div>
  )
}
