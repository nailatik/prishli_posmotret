import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import Header from '../../components/header/Header'
import ProfileCard from '../../components/profile/ProfileCard'
import { useApi } from '../../hooks/useApi'
import './profile.css'

export default function Profile({ userId, isOwnProfile = true }) {
  const { makeRequest } = useApi()
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const [currentUserId, setCurrentUserId] = useState(() => userId || localStorage.getItem('user_id') || '1')
  const [isFriend, setIsFriend] = useState(false);


  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      navigate('/auth')
    }
  }, [navigate])  

  const fetchProfile = async (userId) => {
    try {
      setLoading(true)
      // Используем useApi, чтобы токен автоматически передавался
      const data = await makeRequest(`profile/${userId}`)
      setProfileData(data)
    } catch (err) {
      setError(err.message || 'Ошибка загрузки профиля')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const userIdToUse = userId || localStorage.getItem('user_id') || '1'
    setCurrentUserId(userIdToUse)
    fetchProfile(userIdToUse)
    
    // Слушаем событие обновления авторизации
    const handleAuthChange = () => {
      const storedUserId = userId || localStorage.getItem('user_id')
      if (storedUserId) {
        setCurrentUserId(storedUserId)
        fetchProfile(storedUserId)
      }
    }
    window.addEventListener('auth-change', handleAuthChange)
    
    return () => {
      window.removeEventListener('auth-change', handleAuthChange)
    }
  }, [userId])

  if (loading) return <div>Загрузка...</div>
  if (error) return <div>Ошибка: {error}</div>

  const onAddFriend = async () => {
    try {
      const response = await makeRequest(`profile/${currentUserId}/add-friend`, {
        method: 'POST',
      });
      if (response.is_friend) {
        setIsFriend(true);
      }
    } catch (err) {
      console.error('Ошибка добавления в друзья:', err);
    }
  };

  const onRemoveFriend = async () => {
    try {
      const response = await makeRequest(`profile/${currentUserId}/remove-friend`, {
        method: 'POST',
      });
      if (response.is_friend === false) {
        setIsFriend(false);
      }
    } catch (err) {
      console.error('Ошибка удаления из друзей:', err);
    }
  };

  return (
    <div>
      <Header />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <ProfileCard
          profile={profileData}
          isOwnProfile={isOwnProfile}
          isFriend={isFriend}
          onAddFriend={onAddFriend}
          onRemoveFriend={onRemoveFriend}
        />
      </div>
    </div>
  );
}

