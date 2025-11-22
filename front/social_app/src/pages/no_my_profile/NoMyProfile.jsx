import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import Header from '../../components/header/Header'
import ProfileCard from '../../components/profile/ProfileCard'
import { Button, Box } from '@mui/material'
import './NoMyProfile.css'

export default function NoMyProfile() {
  const { userId } = useParams()
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
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
    fetchProfile()
  }, [userId])

  const handleAddFriend = () => {
    alert(`Добавить пользователя ${profileData.first_name} в друзья`)
  }

  const handleSendMessage = () => {
    alert(`Написать сообщение пользователю ${profileData.first_name}`)
  }

  if (loading) return <div>Загрузка...</div>
  if (error) return <div>Ошибка: {error}</div>

  // Отрисовка ProfileCard с переданными данными
  // Добавляем кнопки «Добавить в друзья» и «Написать сообщение»
  return (
    <div>
      <Header />
      <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
        <ProfileCard profile={profileData} />
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" color="primary" sx={{ mr: 1 }} onClick={handleAddFriend}>
            Добавить в друзья
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleSendMessage}>
            Написать сообщение
          </Button>
        </Box>
      </div>
    </div>
  )
}