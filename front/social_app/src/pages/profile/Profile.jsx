import React, { useState, useEffect } from 'react'
import Header from '../../components/header/Header'
import ProfileCard from '../../components/profile/ProfileCard'
import './profile.css'

export default function Profile() {
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const currentUserId = 1  

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await fetch(`http://localhost:8000/api/profile/${currentUserId}`)
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
  }, [currentUserId])

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

