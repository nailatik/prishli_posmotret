import { useState } from 'react'
import Header from '../../components/header/Header'
import Sidebar from '../../components/sidebar/Sidebar'
import FeedList from '../../components/FeedList'
import './Feed.css'

function Feed() {
  const [posts, setPosts] = useState([
    {
      id: 1,
      imgSrc: 'https://img.freepik.com/free-photo/cute-beagle-dark-brown-bow-tie_53876-89059.jpg?semt=ais_hybrid&w=740&q=80',
      author: 'Игорь Дорохов',
      avatarSrc: 'https://randomuser.me/api/portraits/men/34.jpg',
      title: 'Пушистый друг дня!',
      description: 'Щенок впервые гуляет на даче. Очень любопытный и фотогеничный.'
    },
    {
      id: 2,
      imgSrc: 'https://img.freepik.com/free-photo/cute-beagle-dark-brown-bow-tie_53876-89059.jpg?semt=ais_hybrid&w=740&q=80',
      author: 'Игорь Дорохов',
      avatarSrc: 'https://randomuser.me/api/portraits/men/34.jpg',
      title: 'Пушистый друг дня!',
      description: 'Щенок впервые гуляет на даче. Очень любопытный и фотогеничный.'
    },
    {
      id: 3,
      imgSrc: 'https://img.freepik.com/free-photo/cute-beagle-dark-brown-bow-tie_53876-89059.jpg?semt=ais_hybrid&w=740&q=80',
      author: 'Игорь Дорохов',
      avatarSrc: 'https://randomuser.me/api/portraits/men/34.jpg',
      title: 'Пушистый друг дня!',
      description: 'Щенок впервые гуляет на даче. Очень любопытный и фотогеничный.'
    },
    {
      id: 4,
      imgSrc: 'https://img.freepik.com/free-photo/cute-beagle-dark-brown-bow-tie_53876-89059.jpg?semt=ais_hybrid&w=740&q=80',
      author: 'Игорь Дорохов',
      avatarSrc: 'https://randomuser.me/api/portraits/men/34.jpg',
      title: 'Пушистый друг дня!',
      description: 'Щенок впервые гуляет на даче. Очень любопытный и фотогеничный.'
    },
    {
      id: 5,
      imgSrc: 'https://img.freepik.com/free-photo/cute-beagle-dark-brown-bow-tie_53876-89059.jpg?semt=ais_hybrid&w=740&q=80',
      author: 'Игорь Дорохов',
      avatarSrc: 'https://randomuser.me/api/portraits/men/34.jpg',
      title: 'Пушистый друг дня!',
      description: 'Щенок впервые гуляет на даче. Очень любопытный и фотогеничный.'
    },
  ])

  // Заглушки для обработки лайка и комментария
  const handleLike = id => {
    alert(`Лайк, пост: ${id}`)
  }

  const handleSendComment = (id, comment) => {
    alert(`Комментарий "${comment}" для поста ${id}`)
    // когда будет сервер — отправляй туда
  }

  return (
    <div className="feed">
      <Header />
      <div className="feed-container">
        <div className="feed-left">
          <h1 className="feed-title">Мои новости</h1>
          <Sidebar />
        </div>
        <div className="feed-content">
          <FeedList
            posts={posts}
            onLike={handleLike}
            onSendComment={handleSendComment}
          />
        </div>
      </div>
    </div>
  )
}

export default Feed
