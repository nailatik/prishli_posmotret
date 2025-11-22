import React from 'react'
import {
  Avatar,
  Typography,
  Button,
  Box,
  Grid,
  Paper
} from '@mui/material'

function CommunityCard({ community, isSubscribed, onSubscribe, onUnsubscribe }) {
  if (!community) return null

  const {
    id,
    community_id,
    name,
    description,
    avatar,
    members_count  // предполагаем, что это число участников
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
          />
        </Grid>

        {/* Правая часть — информация */}
        <Grid item xs>
          <div className="community-info-block">
            <Typography variant="h5" className="community-title">
              {name || 'Без названия'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {members_count != null ? `${members_count} участник${members_count === 1 ? '' : 'ов'}` : 'Нет данных об участниках'}
            </Typography>
            <Typography variant="body1" className="community-description" sx={{ mt: 1 }}>
              {description || 'Описание отсутствует'}
            </Typography>

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
          </div>
        </Grid>
      </Grid>

      {/* Здесь можно добавить блок с постами сообщества или другим контентом */}
    </div>
  )
}

export default CommunityCard
