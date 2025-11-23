import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import './Header.css'

function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userId, setUserId] = useState(null)  // состояние для ID
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('access_token')
      setIsAuthenticated(!!token)
      // пример: userId можно хранить в localStorage после логина
      const storedUserId = localStorage.getItem('user_id')
      setUserId(storedUserId)
    }
    
    checkAuth()
    
    const handleStorageChange = () => checkAuth()
    window.addEventListener('storage', handleStorageChange)
    const handleAuthChange = () => checkAuth()
    window.addEventListener('auth-change', handleAuthChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('auth-change', handleAuthChange)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('token_type')
    localStorage.removeItem('user_id')
    setIsAuthenticated(false)
    setUserId(null)
    navigate('/auth')
  }

  const handleLogin = () => {
    navigate('/auth')
  }

  const myProfileLink = userId ? `/profile/${userId}` : '/auth'

  return (
    <header className="header">
      <div className="header-container">
        <nav className="header-nav">
          <Link to={myProfileLink}>Моя страница</Link>
          <Link to="/">Новости</Link>
          <Link to="/messages">Сообщения</Link>
          <Link to="/friends">Мои друзья</Link>
          <Link to="/communities">Сообщества</Link>
          <Link to="/music">Музыка</Link>
          {isAuthenticated ? (
            <button className="header-auth-btn header-logout-btn" onClick={handleLogout}>
              Выйти
            </button>
          ) : (
            <button className="header-auth-btn header-login-btn" onClick={handleLogin}>
              Авторизоваться
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
