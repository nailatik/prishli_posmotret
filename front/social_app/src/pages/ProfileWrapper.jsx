import React from 'react'
import { useParams } from 'react-router-dom'
import Profile from './profile/Profile'
import NoMyProfile from './no_my_profile/NoMyProfile'

const getCurrentUserId = () => 1 

export default function ProfileWrapper() {
  const { userId } = useParams()
  const currentUserId = getCurrentUserId()

  if (parseInt(userId) === currentUserId) {
    // Свой профиль
    return <Profile userId={userId} isOwnProfile={true} />
  } else {
    // Чужой профиль
    return <NoMyProfile userId={userId} isOwnProfile={false} />
  }
}
