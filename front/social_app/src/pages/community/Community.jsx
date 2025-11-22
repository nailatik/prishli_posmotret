import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import Header from '../../components/header/Header'
import CommunityCard from '../../components/community/CommunityCard'

export default function CommunityPage() {
  const { communityId } = useParams()
  const [communityData, setCommunityData] = useState(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        setLoading(true)
        // Запрос данных сообщества
        const response = await fetch(`http://localhost:8000/api/communities/${communityId}`)
        if (!response.ok) {
          throw new Error('Ошибка загрузки сообщества')
        }
        const data = await response.json()
        setCommunityData(data)
        
        // Проверяем, подписан ли пользователь
        // Это можно сделать отдельным запросом или получить из данных сообщества
        setIsSubscribed(data.is_subscribed || false)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchCommunity()
  }, [communityId])

  const handleSubscribe = async (communityId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/communities/${communityId}/subscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      if (response.ok) {
        setIsSubscribed(true)
      }
    } catch (err) {
      console.error('Ошибка подписки:', err)
    }
  }

  const handleUnsubscribe = async (communityId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/communities/${communityId}/unsubscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      if (response.ok) {
        setIsSubscribed(false)
      }
    } catch (err) {
      console.error('Ошибка отписки:', err)
    }
  }

  if (loading) return <div>Загрузка...</div>
  if (error) return <div>Ошибка: {error}</div>

  return (
    <div>
      <Header />
      <div style={{ display: 'flex', justifyContent: 'center' }}>
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
