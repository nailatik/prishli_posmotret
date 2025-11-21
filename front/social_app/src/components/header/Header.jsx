// import './Header.css'

// function Header() {
//   return (
//     <header className="header">
//       <div className="header-container">        
//         {/* Навигация */}
//         <nav className="header-nav">
//           <a href="/">Моя страница</a>
//           <a href="/profile">Новости</a>
//           <a href="/messages">Сообщения</a>
//           <a href="/friends">Мои друзья</a>
//           <a href="/music">Музыка</a>
//         </nav>
//       </div>
//     </header>
//   )
// }

// export default Header

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import './Header.css'

function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('access_token')
      setIsAuthenticated(!!token)
    }
    
    checkAuth()
    
    // Проверяем при изменении localStorage (для других вкладок)
    const handleStorageChange = () => checkAuth()
    window.addEventListener('storage', handleStorageChange)
    
    // Проверяем при кастомном событии auth-change (для текущей вкладки)
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
    setIsAuthenticated(false)
    navigate('/auth')
  }

  const handleLogin = () => {
    navigate('/auth')
  }

  return (
    <header className="header">
      <div className="header-container">
        {/* Навигация */}
        <nav className="header-nav">
          <Link to="/profile">Моя страница</Link>
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
              Войти/Зарегистрироваться
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
