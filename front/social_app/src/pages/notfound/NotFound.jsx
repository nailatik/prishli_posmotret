import React from 'react'
import './NotFound.css'

function NotFound() {
  return (
    <div className="notfound-bg">
      <div className="notfound-card">
        <h1 className="notfound-title">404</h1>
        <p className="notfound-desc">Страница не найдена</p>
        <a className="notfound-link" href="/">На главную</a>
        <div className="notfound-decor">
          <span className="star star-lg" />
          <span className="star star-md" />
          <span className="star star-sm" />
        </div>
      </div>
    </div>
  )
}

export default NotFound
