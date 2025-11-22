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
import './ProfileCard.css'

function ProfileCard({ profile }) {
  if (!profile) return null

  const {
    first_name,
    last_name,
    avatar,
    bio,
    is_own_profile,
    posts
  } = profile

  const fullName = `${first_name || ''} ${last_name || ''}`.trim() || 'Без имени'

  return (
    <div className="profile-page-bg">
      <Grid container spacing={3} alignItems="flex-start" className="profile-main-row">
        {/* Левая часть — фото */}
        <Grid item>
          <Avatar
            src={avatar || 'https://via.placeholder.com/150'}
            alt={fullName}
            className="profile-main-avatar"
          />
        </Grid>

        {/* Правая часть — информация */}
        <Grid item xs>
          <div className="profile-info-block">
            <Typography variant="h5" className="profile-title">
              {fullName}
            </Typography>
            <Typography variant="body1" className="profile-bio">
              {bio || 'Описание отсутствует'}
            </Typography>

            {/* Кнопки в зависимости от того чей профиль */}
            {is_own_profile ? (
              <Button variant="contained" color="primary">
                Редактировать профиль
              </Button>
            ) : (
              <Box sx={{ mt: 2 }}>
                <Button variant="outlined" color="primary" sx={{ mr: 1 }}>
                  Добавить в друзья
                </Button>
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

      {/* Здесь можно добавить блок "Возможно знакомы" или другой контент */}
            {/* Блок "Возможно знакомы" */}
            <div className="profile-acquaintances-block">
        <Typography className="profile-acquaintances-title">
          возможно знакомы
        </Typography>
        <div className="profile-acquaintances-list">
          <Paper elevation={0} className="profile-acquaintance-card">
            <Avatar
              src="acquaintance_photo_url.jpg"
              alt="Тайлеринка Дейлердина"
              className="profile-acquaintance-avatar"
            />
            <Typography className="profile-acquaintance-name">
              Тайлеринка<br />Дейлердина
            </Typography>
          </Paper>
          <Paper elevation={0} className="profile-acquaintance-card">
            <Avatar
              src="acquaintance_photo_url.jpg"
              alt="Тайлеринка Дейлердина"
              className="profile-acquaintance-avatar"
            />
            <Typography className="profile-acquaintance-name">
              Тайлеринка<br />Дейлердина
            </Typography>
          </Paper>
          <Paper elevation={0} className="profile-acquaintance-card">
            <Avatar
              src="acquaintance_photo_url.jpg"
              alt="Тайлеринка Дейлердина"
              className="profile-acquaintance-avatar"
            />
            <Typography className="profile-acquaintance-name">
              Тайлеринка<br />Дейлердина
            </Typography>
          </Paper>
          <Paper elevation={0} className="profile-acquaintance-card">
            <Avatar
              src="acquaintance_photo_url.jpg"
              alt="Тайлеринка Дейлердина"
              className="profile-acquaintance-avatar"
            />
            <Typography className="profile-acquaintance-name">
              Тайлеринка<br />Дейлердина
            </Typography>
          </Paper>
          <Paper elevation={0} className="profile-acquaintance-card">
            <Avatar
              src="acquaintance_photo_url.jpg"
              alt="Тайлеринка Дейлердина"
              className="profile-acquaintance-avatar"
            />
            <Typography className="profile-acquaintance-name">
              Тайлеринка<br />Дейлердина
            </Typography>
          </Paper>
          <Paper elevation={0} className="profile-acquaintance-card">
            <Avatar
              src="acquaintance_photo_url.jpg"
              alt="Тайлеринка Дейлердина"
              className="profile-acquaintance-avatar"
            />
            <Typography className="profile-acquaintance-name">
              Тайлеринка<br />Дейлердина
            </Typography>
          </Paper>
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
