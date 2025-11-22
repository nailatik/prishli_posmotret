import PostCard from './postcard/PostCard'

function FeedList({ posts, commentsByPost, onLike, onSendComment }) {
  return (
    <>
      {posts.map(post => {
        console.log('Рендерим пост:', {
          post_id: post.post_id,
          picture: post.picture,
          title: post.title
        })
        return (
          <PostCard
            key={post.post_id}
            id={post.post_id}
            imgSrc={post.picture}
            author={post.author?.username || 'Unknown'}
            title={post.title}
            description={post.description}
            likesCount={post.likes_count}
            comments={commentsByPost[post.post_id] || []}
            onLike={() => onLike?.(post.post_id)}
            onSendComment={comment => onSendComment?.(post.post_id, comment)}
          />
        )
      })}
    </>
  )
}

export default FeedList
