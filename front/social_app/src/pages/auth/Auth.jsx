import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import './Auth.css'
import { TextField, Button, Alert, CircularProgress } from '@mui/material'
import { useApi } from '../../hooks/useApi'
import { API_BASE_URL } from '../../config/api'
import logo from '../../assets/logo.png'

function Auth() {
  const [flipped, setFlipped] = useState(false)
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [signupUsername, setSignupUsername] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { makeRequest } = useApi()
  const navigate = useNavigate()

  const handleFlip = () => {
    setFlipped(f => !f)
    setError('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // OAuth2PasswordRequestForm требует form-data
      const formData = new FormData()
      formData.append('username', loginUsername)
      formData.append('password', loginPassword)

      const response = await fetch(`${API_BASE_URL}token`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Ошибка авторизации' }))
        throw new Error(errorData.detail || 'Ошибка авторизации')
      }

      const data = await response.json()
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('token_type', data.token_type)
      if (data.user_id) {
        localStorage.setItem('user_id', data.user_id.toString())
      }
      
      // Отправляем событие об обновлении авторизации
      window.dispatchEvent(new Event('auth-change'))
      
      // Редирект на главную страницу
      navigate('/')
    } catch (err) {
      setError(err.message || 'Ошибка при входе')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const signupData = await makeRequest('sign-up', {
        method: 'POST',
        body: JSON.stringify({
          username: signupUsername,
          password: signupPassword,
        }),
      })

      // После успешной регистрации автоматически входим
      const formData = new FormData()
      formData.append('username', signupUsername)
      formData.append('password', signupPassword)

      const loginResponse = await fetch(`${API_BASE_URL}token`, {
        method: 'POST',
        body: formData,
      })

      if (!loginResponse.ok) {
        throw new Error('Регистрация успешна, но не удалось войти')
      }

      const loginData = await loginResponse.json()
      localStorage.setItem('access_token', loginData.access_token)
      localStorage.setItem('token_type', loginData.token_type)
      // Используем user_id из loginData или id из signupData
      const userId = loginData.user_id || signupData.id
      if (userId) {
        localStorage.setItem('user_id', userId.toString())
      }
      
      // Отправляем событие об обновлении авторизации для всех компонентов
      window.dispatchEvent(new Event('auth-change'))
      
      // Редирект на главную страницу
      navigate('/')
    } catch (err) {
      setError(err.message || 'Ошибка при регистрации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-background">
      <div className="auth-logo-wrapper">
        <img src={logo} alt="Logo" className="auth-logo" />
        <div className="auth-logo-text">SPRING</div>
      </div>

      <div className={`auth-card${flipped ? ' flipped' : ''}`}>
        {/* Фронт (вход) */}
        <div className="auth-card-face auth-card-front">
          <h2>Вход</h2>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleLogin} autoComplete="off">
            <TextField
              label="Username"
              fullWidth
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              margin="normal"
              variant="outlined"
              size="medium"
              className="mui-rounded-input"
              required
              disabled={loading}
            />
            <TextField
              label="Пароль"
              fullWidth
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              margin="normal"
              variant="outlined"
              size="medium"
              className="mui-rounded-input"
              required
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ mt: 2, fontFamily: 'MainFont', fontSize: 16, borderRadius: '37px'}}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Войти'}
            </Button>
          </form>
          <button type="button" className="auth-flip-btn" onClick={handleFlip} disabled={loading}>
            Нет аккаунта? Зарегистрируйтесь
          </button>
        </div>
        {/* Бэк (регистрация) */}
        <div className="auth-card-face auth-card-back">
          <h2>Регистрация</h2>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSignup} autoComplete="off">
            <TextField
              label="Username"
              fullWidth
              value={signupUsername}
              onChange={(e) => setSignupUsername(e.target.value)}
              margin="normal"
              variant="outlined"
              size="medium"
              className="mui-rounded-input"
              required
              disabled={loading}
            />
            <TextField
              label="Пароль"
              fullWidth
              type="password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              margin="normal"
              variant="outlined"
              size="medium"
              className="mui-rounded-input"
              required
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="success"
              disabled={loading}
              sx={{ mt: 2, fontFamily: 'MainFont', fontSize: 16, borderRadius: '37px'}}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Зарегистрироваться'}
            </Button>
          </form>
          <button type="button" className="auth-flip-btn" onClick={handleFlip} disabled={loading}>
            Уже есть аккаунт? Войти
          </button>
        </div>
      </div>
    </div>
  )
}

export default Auth
