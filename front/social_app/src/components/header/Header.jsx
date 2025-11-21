import './Header.css'

function Header() {
  return (
    <header className="header">
      <div className="header-container">        
        {/* Навигация */}
        <nav className="header-nav">
          <a href="/">Моя страница</a>
          <a href="/profile">Новости</a>
          <a href="/messages">Сообщения</a>
          <a href="/friends">Мои друзья</a>
          <a href="/music">Музыка</a>
        </nav>
      </div>
    </header>
  )
}

export default Header
