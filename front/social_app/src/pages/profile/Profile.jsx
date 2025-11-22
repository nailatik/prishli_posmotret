import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import Header from '../../components/header/Header'
import ProfileCard from '../../components/profile/ProfileCard'
import './profile.css'

export default function Profile() {
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const [currentUserId, setCurrentUserId] = useState(() => localStorage.getItem('user_id') || '1')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      navigate('/auth')
    }
  }, [navigate])  

  const fetchProfile = async (userId) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:8000/api/profile/${userId}`)
      if (!response.ok) {
        throw new Error('Ошибка загрузки профиля')
      }
      const data = await response.json()
      setProfileData(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const userId = localStorage.getItem('user_id') || '1'
    setCurrentUserId(userId)
    fetchProfile(userId)
    
    // Слушаем событие обновления авторизации
    const handleAuthChange = () => {
      const storedUserId = localStorage.getItem('user_id')
      if (storedUserId) {
        setCurrentUserId(storedUserId)
        fetchProfile(storedUserId)
      }
    }
    window.addEventListener('auth-change', handleAuthChange)
    
    return () => {
      window.removeEventListener('auth-change', handleAuthChange)
    }
  }, [])

  if (loading) return <div>Загрузка...</div>
  if (error) return <div>Ошибка: {error}</div>

  return (
    <div>
      <Header />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <ProfileCard profile={profileData} />
      </div>
    </div>
  )
}

