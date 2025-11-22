import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import Profile from './profile/Profile'
import NoMyProfile from './no_my_profile/NoMyProfile'

const getCurrentUserId = () => {
  const storedUserId = localStorage.getItem('user_id')
  return storedUserId ? parseInt(storedUserId) : null
}

export default function ProfileWrapper() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const currentUserId = getCurrentUserId()

  useEffect(() => {
    // Если это свой профиль, проверяем авторизацию
    if (currentUserId && parseInt(userId) === currentUserId) {
      const token = localStorage.getItem('access_token')
      if (!token) {
        navigate('/auth')
      }
    }
  }, [userId, currentUserId, navigate])

  if (currentUserId && parseInt(userId) === currentUserId) {
    // Свой профиль
    return <Profile userId={userId} isOwnProfile={true} />
  } else {
    // Чужой профиль - доступен без авторизации
    return <NoMyProfile userId={userId} isOwnProfile={false} />
  }
}
