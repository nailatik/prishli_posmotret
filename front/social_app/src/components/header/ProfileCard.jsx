import React from 'react';
import { Card, CardContent, Avatar, Typography, Button, Box } from '@mui/material';
import './ProfileCard.css';


export default function ProfileCard() {
  return (
    <Card className="profile-card">
      {/* Фото профиля */}
      <Avatar
        alt="Tyler"
        src="https://material-ui.com/static/images/avatar/1.jpg"
        variant="rounded"
        className="profile-avatar"
      />

      {/* Текстовая часть */}
      <CardContent className="profile-content">
        <Typography variant="h5" className="profile-title">
          Тайлер Дерден
        </Typography>
        <Typography className="profile-friends">
          Друзья: <b>1000</b>
        </Typography>
        <Typography className="profile-university">
          Университет: <b>Самый лучший вуз мира - СГУ им. Чернышквского</b>
        </Typography>
        {/* Кнопки */}
        <Box className="profile-actions">
          <Button
            variant="contained"
            color="primary"
            className="profile-btn"
          >
            Добавить в друзья
          </Button>
          <Button
            variant="contained"
            color="secondary"
            className="profile-btn"
          >
            Написать соо
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
