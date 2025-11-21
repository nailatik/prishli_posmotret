import React, { useState } from 'react'
import './Auth.css'
import { TextField, Button } from '@mui/material'

function Auth() {
  const [flipped, setFlipped] = useState(false)
  const handleFlip = () => setFlipped(f => !f)

  return (
    <div className="auth-background">
      <div className={`auth-card${flipped ? ' flipped' : ''}`}>
        {/* Фронт (вход) */}
        <div className="auth-card-face auth-card-front">
          <h2>Вход</h2>
          <form autoComplete="off">
            <TextField
              label="Email"
              fullWidth
              type="email"
              margin="normal"
              variant="outlined"
              size="medium"
              className="mui-rounded-input"
            />
            <TextField
              label="Пароль"
              fullWidth
              type="password"
              margin="normal"
              variant="outlined"
              size="medium"
              className="mui-rounded-input"
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2, fontFamily: 'MainFont', fontSize: 16, borderRadius: '37px'}}
            >
              Войти
            </Button>
          </form>
          <button type="button" className="auth-flip-btn" onClick={handleFlip}>
            Нет аккаунта? Зарегистрируйтесь
          </button>
        </div>
        {/* Бэк (регистрация) */}
        <div className="auth-card-face auth-card-back">
          <h2>Регистрация</h2>
          <form autoComplete="off">
            <TextField
              label="Имя"
              fullWidth
              margin="normal"
              variant="outlined"
              size="medium"
              className="mui-rounded-input"
            />
            <TextField
              label="Email"
              fullWidth
              type="email"
              margin="normal"
              variant="outlined"
              size="medium"
              className="mui-rounded-input"
            />
            <TextField
              label="Пароль"
              fullWidth
              type="password"
              margin="normal"
              variant="outlined"
              size="medium"
              className="mui-rounded-input"
            />
            <Button
              fullWidth
              variant="contained"
              color="success"
              sx={{ mt: 2, fontFamily: 'MainFont', fontSize: 16, borderRadius: '37px'}}
            >
              Зарегистрироваться
            </Button>
          </form>
          <button type="button" className="auth-flip-btn" onClick={handleFlip}>
            Уже есть аккаунт? Войти
          </button>
        </div>
      </div>
    </div>
  )
}

export default Auth
