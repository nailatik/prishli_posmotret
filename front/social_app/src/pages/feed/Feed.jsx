import { useState, useEffect } from 'react'
import { useApi } from '../../hooks/useApi'
import Header from '../../components/header/Header'
import Sidebar from '../../components/sidebar/Sidebar'
import FeedList from '../../components/FeedList'
import './Feed.css'

function Feed() {
  const { makeRequest } = useApi()
  const [posts, setPosts] = useState([]) 

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await makeRequest('posts') 
        setPosts(data) 
      } catch (error) {
        console.error('Ошибка при получении постов:', error)
      }
    }

    fetchPosts()
  }, []) 

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
          <h1 className="feed-title">Мои Новости</h1>
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
