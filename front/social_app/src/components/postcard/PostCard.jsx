import { useState } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import CardMedia from '@mui/material/CardMedia'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'

function PostCard({ 
  imgSrc, 
  author, 
  avatarSrc, 
  title, 
  description, 
  onLike, 
  onSendComment,
  ...props 
}) {
  const [comment, setComment] = useState('')
  const [focused, setFocused] = useState(false)

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
    >
      {imgSrc && (
        <CardMedia
          component="img"
          image={imgSrc}
          alt={title}
          sx={{
            width: 370,
            height: 370,
            objectFit: 'cover',
            borderRadius: 6,
            mr: 3
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
          <Button
            variant="contained"
            color="warning"
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
              justifyContent: 'center'
            }}
            onClick={onLike}
          >
            ❤
          </Button>
        </Box>
      </Box>
    </Card>
  )
}

export default PostCard
