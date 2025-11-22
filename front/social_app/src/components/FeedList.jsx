import PostCard from './postcard/PostCard'
import PostCardCom from './postcardCom/PostCardCom'

function FeedList({ posts, commentsByPost, onLike, onSendComment }) {
  return (
    <>
      {posts.map(post => {
        console.log('Рендерим пост:', {
          post_id: post.post_id,
          picture: post.picture,
          title: post.title,
          is_community_post: post.is_community_post
        })
        
        // Если пост от сообщества, используем PostCardCom
        if (post.is_community_post && post.community) {
          return (
            <PostCardCom
              key={post.post_id}
              imgSrc={post.picture}
              communityName={post.community.name || post.author?.name || 'Unknown Community'}
              avatarSrc={post.community.avatar}
              title={post.title}
              description={post.description}
              comments={commentsByPost[post.post_id] || []}
              onLike={() => onLike?.(post.post_id)}
              onSendComment={comment => onSendComment?.(post.post_id, comment)}
            />
          )
        }
        
        // Если пост от пользователя, используем PostCard
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
