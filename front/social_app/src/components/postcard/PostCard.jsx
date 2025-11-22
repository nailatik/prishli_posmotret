import { useState, useEffect } from 'react'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import CardMedia from '@mui/material/CardMedia'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'

function PostCard({ 
  postId,
  imgSrc, 
  author, 
  avatarSrc, 
  title, 
  description, 
  initialLiked = false,
  initialLikesCount = 0,
  onSendComment,
  ...props 
}) {
  const [comment, setComment] = useState('')
  const [focused, setFocused] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageUrl, setImageUrl] = useState(imgSrc)

  // Состояния лайка и количества лайков
  const [liked, setLiked] = useState(initialLiked)
  const [likesCount, setLikesCount] = useState(initialLikesCount)

  useEffect(() => {
    if (imgSrc) {
      setImageUrl(imgSrc)
      setImageError(false)
    }
  }, [imgSrc])

  const handleImageError = () => {
    console.error('Ошибка загрузки изображения:', imgSrc)
    setImageError(true)
  }

  // Обработчик кнопки лайка с API-запросом
  const handleLikeClick = async () => {
    // токен, например, из localStorage
    const token = localStorage.getItem("token");

    try {
      // Отправляем POST запрос на лайк/анлайк поста
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Ошибка при лайке");
      }

      const data = await response.json();

      // Обновляем состояние лайка и счётчика
      setLiked(data.liked);
      setLikesCount(prev => prev + (data.liked ? 1 : -1));

    } catch (err) {
      console.error(err);
      alert("Не удалось поставить лайк");
    }
  }

  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        borderRadius: 6,
        backgroundColor: '#E9E9E9',
        boxShadow: 2,
        p: 2,
        mb: 4,
        minHeight: 370,
        overflow: 'hidden'
      }}
      data-post-id={postId} // для соответствия вашему примеру
      className="post"
    >
      {imgSrc && typeof imgSrc === 'string' && imgSrc.trim() !== '' && !imageError && (
        <CardMedia
          component="img"
          image={imageUrl}
          alt={title || 'Post image'}
          onError={handleImageError}
          onLoad={() => console.log('Изображение загружено:', imageUrl)}
          sx={{
            width: 370,
            height: 370,
            objectFit: 'cover',
            borderRadius: 6,
            mr: 3,
            backgroundColor: '#f0f0f0'
          }}
        />
      )}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#E1E1E1',
          borderRadius: 5,
          p: 3,
          minHeight: imgSrc ? 370 : 250,
          alignItems: imgSrc ? 'flex-start' : 'center'
        }}
      >
        <Box sx={{ width: '100%' }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <Avatar src={avatarSrc} sx={{ width: 48, height: 48 }} />
            </Grid>
            <Grid item>
              <Typography variant="subtitle1" fontWeight="bold">
                {author}
              </Typography>
            </Grid>
          </Grid>
          <Typography variant="h5" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
            {title}
          </Typography>
          {description && (
            <Typography variant="body1" sx={{ mb: 2 }}>
              {description}
            </Typography>
          )}
        </Box>
        {/* Комментарии и лайк */}
        <Box sx={{ display: 'flex', gap: 2, width: '100%', alignItems: 'center', mt: 3 }}>
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <TextField 
              fullWidth
              size="small"
              placeholder="Комментарий..."
              value={comment}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onChange={e => setComment(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  background: '#e1e1e1',
                  '& fieldset': {
                    borderRadius: 2,
                    border: '2px solid #aeaffc',
                  },
                  '&:hover fieldset': {
                    border: '2px solid #aeaffc',
                  },
                  '&.Mui-focused fieldset': {
                    border: '2px solid #aeaffc',
                  },
                },
                input: {
                  borderRadius: 2,
                  background: '#e1e1e1',
                  paddingLeft: '10px',
                }
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && comment) {
                  onSendComment?.(comment)
                  setComment('')
                }
              }}
            />
            {(focused || comment) && (
              <Button
                color="primary"
                variant="contained"
                size="small"
                sx={{
                  minWidth: 36,
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  padding: 0,
                  marginLeft: '8px',
                  boxShadow: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: (focused || comment) ? 1 : 0,
                  transition: 'opacity 0.25s'
                }}
                onClick={() => {
                  onSendComment?.(comment)
                  setComment('')
                }}
              >
                <ArrowUpwardIcon />
              </Button>
            )}
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <Button
              variant="contained"
              color={liked ? 'error' : 'warning'}
              size="small"
              sx={{
                width: 36,
                height: 36,
                minWidth: 36,
                borderRadius: '50%',
                fontWeight: 'bold',
                fontSize: 18,
                lineHeight: 1,
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.3s ease',
                color: liked ? 'red' : 'black'
              }}
              onClick={handleLikeClick}
              className="like-btn"
            >
              {liked ? '❤️' : '❤'}
            </Button>
            <Typography className="likes-count" variant="caption" sx={{ mt: 0.5 }}>
              {likesCount}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Card>
  )
}

export default PostCard
