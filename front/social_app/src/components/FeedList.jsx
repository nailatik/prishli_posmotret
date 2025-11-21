import PostCard from './postcard/PostCard'

function FeedList({ posts, onLike, onSendComment }) {
  return (
    <>
      {posts.map(post => (
        <PostCard
          key={post.id}
          {...post}
          onLike={() => onLike?.(post.id)}
          onSendComment={comment => onSendComment?.(post.id, comment)}
        />
      ))}
    </>
  )
}

export default FeedList
