import { useState, useEffect } from 'react'
import { useApi } from '../../hooks/useApi'
import Header from '../../components/header/Header'
import Sidebar from '../../components/sidebar/Sidebar'
import FeedList from '../../components/FeedList'
import './Feed.css'

function Feed() {
  const { makeRequest } = useApi()
  const [posts, setPosts] = useState([]) 
  const [commentsByPost, setCommentsByPost] = useState({})

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await makeRequest('posts') 
        console.log('Получены посты:', data)
        // Проверяем структуру данных
        if (data && Array.isArray(data)) {
          data.forEach((post, index) => {
            console.log(`Пост ${index + 1}:`, {
              post_id: post.post_id,
              picture: post.picture,
              title: post.title
            })
          })
        }
        setPosts(data) 

        // Загружаем комментарии для каждого поста
        if (data && Array.isArray(data)) {
          const commentsPromises = data.map(async (post) => {
            try {
              const comments = await makeRequest(`posts/${post.post_id}/comments`)
              return { postId: post.post_id, comments }
            } catch (error) {
              console.error(`Ошибка при загрузке комментариев для поста ${post.post_id}:`, error)
              return { postId: post.post_id, comments: [] }
            }
          })
          
          const commentsResults = await Promise.all(commentsPromises)
          const commentsMap = {}
          commentsResults.forEach(({ postId, comments }) => {
            commentsMap[postId] = comments
          })
          setCommentsByPost(commentsMap)
        }
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

  const handleSendComment = async (postId, comment) => {
    if (!comment || !comment.trim()) {
      return
    }

    try {
      const newComment = await makeRequest('comments', {
        method: 'POST',
        body: JSON.stringify({
          post_id: postId,
          content: comment.trim()
        })
      })
      console.log('Комментарий успешно отправлен', newComment)
      
      // Обновляем список комментариев для этого поста
      setCommentsByPost(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment]
      }))
    } catch (error) {
      console.error('Ошибка при отправке комментария:', error)
      alert('Не удалось отправить комментарий')
    }
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
            commentsByPost={commentsByPost}
            onLike={handleLike}
            onSendComment={handleSendComment}
          />
        </div>
      </div>
    </div>
  )
}

export default Feed
