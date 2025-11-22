import React, { useState } from 'react'
import PostCardCom from '../postcardCom/PostCardCom'
import CreatePostModal from '../sidebar/CreatePostModal'
import {
  Avatar,
  Typography,
  Button,
  Box,
  Grid
} from '@mui/material'
import { DEFAULT_AVATAR_URL } from '../../config/api'

function CommunityCard({ community, isSubscribed, onSubscribe, onUnsubscribe, onPostCreated, onSendComment }) {
  const [modalOpen, setModalOpen] = useState(false)
  
  if (!community) return null

  const {
    id,
    community_id,
    name,
    description,
    avatar,
    members_count,
    posts = [],
  } = community

  const communityId = id || community_id

  const handlePostCreated = async () => {
    if (onPostCreated) {
      await onPostCreated()
    }
    setModalOpen(false)
  }

  return (
    <div className="community-page-bg">
      <Grid container spacing={3} alignItems="flex-start" className="community-main-row">
        {/* Левая часть — аватар сообщества */}
        <Grid item>
          <Avatar
            src={avatar || DEFAULT_AVATAR_URL}
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

            {/* Кнопки подписки и создания поста */}
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              {isSubscribed ? (
                <>
                  <Button 
                    variant="outlined" 
                    color="secondary" 
                    onClick={() => onUnsubscribe(communityId)}
                  >
                    Отписаться
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => setModalOpen(true)}
                  >
                    Создать пост
                  </Button>
                </>
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

          {/* Посты сообщества */}
          {posts && posts.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Посты сообщества</Typography>
              {posts.map((post) => (
                <PostCardCom
                  key={post.post_id}
                  imgSrc={post.picture || ''}
                  communityName={name || ''}
                  avatarSrc={avatar || DEFAULT_AVATAR_URL}
                  title={post.title}
                  description={post.description || ''}
                  comments={post.comments || []}
                  onLike={() => console.log('Лайк поста:', post.post_id)}
                  onSendComment={comment => onSendComment?.(post.post_id, comment)}
                  sx={{ mb: 2 }}
                />
              ))}
            </Box>
          )}
        </Grid>
      </Grid>
      
      {/* Модальное окно для создания поста */}
      {modalOpen && (
        <CreatePostModal
          communityId={communityId}
          onClose={() => setModalOpen(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </div>
  )
}

export default CommunityCard
