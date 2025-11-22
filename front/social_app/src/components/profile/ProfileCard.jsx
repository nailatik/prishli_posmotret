// import React from 'react';
// import {
//   Avatar,
//   Typography,
//   Button,
//   Box,
//   Grid,
//   Paper
// } from '@mui/material';
// import './ProfileCard.css';

// function ProfileCard() {
//   return (
//     <div className="profile-page-bg">
//       <Grid container spacing={3} alignItems="flex-start" className="profile-main-row">
//         {/* Левая часть — фото */}
//         <Grid item>
//           <Avatar
//             src="photo_url.jpg"
//             alt="Тайлер Дерден"
//             className="profile-main-avatar"
//           />
//         </Grid>

//         {/* Правая часть — информация */}
//         <Grid item xs>
//           <div className="profile-info-block">
//             <Typography variant="h5" className="profile-title">
//               Тайлер Дерден
//             </Typography>
//             <div className="profile-line">
//               <span className="profile-label">Друзья</span>
//               <span className="profile-value">1000</span>
//             </div>
//             <div className="profile-line">
//               <span className="profile-label">Университет</span>
//               <span className="profile-value">
//                 Самый лучший вуз мира – СГУ им.Чернышевского
//               </span>
//             </div>
//           </div>
           
//         </Grid>
//       </Grid>
        
//       </div>
      
//     </div>
//   );
// }

// export default ProfileCard;

import React from 'react'
import {
  Avatar,
  Typography,
  Button,
  Box,
  Grid,
  Paper
} from '@mui/material'
import { DEFAULT_AVATAR_URL } from '../../config/api'
import './ProfileCard.css'

function ProfileCard({ profile, isOwnProfile = false, isFriend = false, onAddFriend, onRemoveFriend }) {
  if (!profile) return null

  const {
    first_name,
    last_name,
    avatar,
    bio,
    username,
    is_own_profile,
    posts
  } = profile

  // Используем переданный prop или значение из данных
  const ownProfile = isOwnProfile || is_own_profile || false
  
  // Для своего профиля показываем только username (ник), для других - имя и фамилию
  // Если username есть, используем его (для своего профиля)
  // Иначе используем имя и фамилию (для чужих профилей)
  const displayName = ownProfile && username 
    ? username 
    : (first_name || last_name 
        ? `${first_name || ''} ${last_name || ''}`.trim() 
        : username || 'Без имени')
  
  // Для своего профиля не показываем bio (описание), только username
  const showBio = !ownProfile

  return (
    <div className="profile-page-bg">
      <Grid container spacing={3} alignItems="flex-start" className="profile-main-row">
        {/* Левая часть — фото */}
        <Grid item>
          <Avatar
            src={avatar || DEFAULT_AVATAR_URL}
            alt={displayName}
            className="profile-main-avatar"
          />
        </Grid>

        {/* Правая часть — информация */}
        <Grid item xs>
          <div className="profile-info-block">
            <Typography variant="h5" className="profile-title">
              {displayName}
            </Typography>
            {showBio && (
              <Typography variant="body1" className="profile-bio">
                {bio || 'Описание отсутствует'}
              </Typography>
            )}

            {/* Кнопки в зависимости от того чей профиль */}
            {!ownProfile && (
              <Box sx={{ mt: 2 }}>
                {isFriend ? (
                  <Button 
                    variant="outlined" 
                    color="secondary" 
                    sx={{ mr: 1 }}
                    onClick={onRemoveFriend}
                  >
                    Удалить из друзей
                  </Button>
                ) : (
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    sx={{ mr: 1 }}
                    onClick={onAddFriend}
                  >
                    Добавить в друзья
                  </Button>
                )}
                <Button variant="outlined" color="secondary">
                  Написать сообщение
                </Button>
              </Box>
            )}
          </div>
        </Grid>
      </Grid>

      {/* Пример блока с постами */}
      {posts && posts.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Посты</Typography>
          <div className="posts-list">
            {posts.map(post => (
              <Paper key={post.post_id} sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1">{post.title}</Typography>
                <Typography variant="body2">{post.description}</Typography>
              </Paper>
            ))}
          </div>
        </Box>
      )}

      {/* Блок "Возможно знакомы" */}
<div className="profile-acquaintances-block">
  <Typography className="profile-acquaintances-title">
    Возможно знакомы:
  </Typography>
  <div className="profile-acquaintances-list">
  {[
      { name: 'Анастасия Петрова', id: 3 },
      { name: 'Иван Смирнов', id: 7 },
      { name: 'Екатерина Лебедева', id: 15 },
      { name: 'Дмитрий Кузнецов', id: 22 },
      { name: 'Ольга Васильева', id: 27 },
      { name: 'Сергей Новиков', id: 31 },
      { name: 'Марина Морозова', id: 37 },
      { name: 'Алексей Фролов', id: 41 },
      { name: 'Виктория Соколова', id: 43 },
      { name: 'Николай Орлов', id: 47 },
      { name: 'Людмила Козлова', id: 49 },
      { name: 'Максим Беляев', id: 52 },
      { name: 'Елена Гусева', id: 55 },
      { name: 'Павел Дмитриев', id: 59 },
      { name: 'Юлия Тихомирова', id: 62 },
    ].map(({ name, id }, index) => (
      <Paper elevation={0} className="profile-acquaintance-card" key={index}>
        <Avatar
          src={`https://i.pravatar.cc/150?img=${id}`}
          alt={name}
          className="profile-acquaintance-avatar"
        />
        <Typography className="profile-acquaintance-name">
          {name.split(' ')[0]}<br />{name.split(' ')[1]}
        </Typography>
      </Paper>
    ))}


    {/* Пустые карточки — заглушки */}
    <div className="empty-card" />
    <div className="empty-card" />
    <div className="empty-card" />
  </div>
  </div>
  </div>
  )
}

export default ProfileCard
