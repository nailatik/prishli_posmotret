import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import Header from '../../components/header/Header'
import ProfileCard from '../../components/profile/ProfileCard'
import { useApi } from '../../hooks/useApi'
import './NoMyProfile.css'

export default function NoMyProfile() {
  const { userId } = useParams()
  const { makeRequest } = useApi()
  const [profileData, setProfileData] = useState(null)
  const [isFriend, setIsFriend] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const data = await makeRequest(`profile/${userId}`)
      setProfileData(data)
      setIsFriend(data.is_friend || false)
    } catch (err) {
      setError(err.message || 'Ошибка загрузки профиля')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [userId])

  const handleAddFriend = async () => {
    try {
      await makeRequest(`profile/${userId}/add-friend`, {
        method: 'POST'
      })
      setIsFriend(true)
      // Обновляем данные профиля
      await fetchProfile()
    } catch (err) {
      console.error('Ошибка добавления в друзья:', err)
      alert('Не удалось добавить в друзья')
    }
  }

  const handleRemoveFriend = async () => {
    try {
      await makeRequest(`profile/${userId}/remove-friend`, {
        method: 'POST'
      })
      setIsFriend(false)
      // Обновляем данные профиля
      await fetchProfile()
    } catch (err) {
      console.error('Ошибка удаления из друзей:', err)
      alert('Не удалось удалить из друзей')
    }
  }

  if (loading) return <div>Загрузка...</div>
  if (error) return <div>Ошибка: {error}</div>

  return (
    <div>
      <Header />
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ProfileCard 
          profile={profileData} 
          isOwnProfile={false}
          isFriend={isFriend}
          onAddFriend={handleAddFriend}
          onRemoveFriend={handleRemoveFriend}
        />
      </div>
    </div>
  )
}