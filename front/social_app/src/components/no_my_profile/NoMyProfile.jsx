import React from 'react';
import {
  Avatar,
  Typography,
  Button,
  Box,
  Grid,
  Paper
} from '@mui/material';
import './ProfileCard.css';

function ProfileCard() {
  return (
    <div className="profile-page-bg">
      <Grid container spacing={3} alignItems="flex-start" className="profile-main-row">
        {/* Левая часть — фото */}
        <Grid item>
          <Avatar
            src="photo_url.jpg"
            alt="Тайлер Дерден"
            className="profile-main-avatar"
          />
        </Grid>

        {/* Правая часть — информация */}
        <Grid item xs>
          <div className="profile-info-block">
            <Typography variant="h5" className="profile-title">
              Тайлер Дерден
            </Typography>
            <div className="profile-line">
              <span className="profile-label">Друзья</span>
              <span className="profile-value">1000</span>
            </div>
            <div className="profile-line">
              <span className="profile-label">Университет</span>
              <span className="profile-value">
                Самый лучший вуз мира – СГУ им.Чернышевского
              </span>
            </div>
          </div>
           
        </Grid>
      </Grid>

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
  );
}

export default ProfileCard;
