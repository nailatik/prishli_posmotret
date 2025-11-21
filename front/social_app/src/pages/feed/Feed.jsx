import { useState } from 'react'
import Header from '../../components/header/Header'
{/*}mport CreatePost from '../components/CreatePost'
import PostList from '../components/PostList'*/}
import './Feed.css'

function Feed() {
  const [posts, setPosts] = useState([])
  
  return (
    <div className="feed">
      <Header />
      <div className="feed-content">
        {/*<CreatePost onPostCreated={(newPost) => setPosts([newPost, ...posts])} />
        <PostList posts={posts} />*/}
      </div>
    </div>
  )
}
export default Feed
