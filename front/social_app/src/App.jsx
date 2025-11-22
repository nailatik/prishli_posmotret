import { BrowserRouter, Routes, Route } from 'react-router'
import Feed from './pages/feed/Feed'
import Messages from './pages/message/Messages'
import ProfileWrapper from './pages/ProfileWrapper'
import Auth from './pages/auth/Auth'
import NotFound from './pages/notfound/NotFound'
import Communities from './pages/communities/Communities'
import Friends from './pages/friends/Friends'
import CommunityPage from './pages/community/Community'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile/:userId" element={<ProfileWrapper />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/community/:communityId" element={<CommunityPage />} />
        <Route path="/communities" element={<Communities />} />
        <Route path='/friends' element={<Friends/>}/>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App