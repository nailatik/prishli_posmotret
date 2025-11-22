import React from 'react'
import PostCardCom from './PostCardCom'  // путь к вашему компоненту
import {
  Avatar,
  Typography,
  Button,
  Box,
  Grid
} from '@mui/material'

function CommunityCard({ community, isSubscribed, onSubscribe, onUnsubscribe }) {
  if (!community) return null

  const {
    id,
    community_id,
    name,
    description,
    avatar,
    members_count,
    cover_image,
    comments,
  } = community

  const communityId = id || community_id

  return (
    <div className="community-page-bg">
      <Grid container spacing={3} alignItems="flex-start" className="community-main-row">
        {/* Левая часть — аватар сообщества */}
        <Grid item>
          <Avatar
            src={avatar || 'https://via.placeholder.com/150'}
            alt={name}
            className="community-main-avatar"
            sx={{ width: 80, height: 80 }}
          />
        </Grid>

        {/* Правая часть — информация и кнопки */}
        <Grid item xs>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" className="community-title" gutterBottom>
              {name || 'Без названия'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {members_count != null 
                ? `${members_count} участник${members_count === 1 ? '' : 'ов'}` 
                : 'Нет данных об участниках'}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body1" className="community-description">
                {description || 'Описание отсутствует'}
              </Typography>
            </Box>

            {/* Кнопки подписки */}
            <Box sx={{ mt: 2 }}>
              {isSubscribed ? (
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={() => onUnsubscribe(communityId)}
                >
                  Отписаться
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => onSubscribe(communityId)}
                >
                  Подписаться
                </Button>
              )}
            </Box>
          </Box>

          {/* Карточка сообщества с изображением, комментариями и действиями */}
          <PostCardCom
            imgSrc={cover_image || ''}
            communityName={name || ''}
            avatarSrc={avatar || ''}
            description={description || ''}
            comments={comments || []}
            onLike={() => console.log('Лайк сообщества')}
            onSendComment={comment => console.log('Отправить комментарий:', comment)}
          />
        </Grid>
      </Grid>
    </div>
  )
}

export default CommunityCard
