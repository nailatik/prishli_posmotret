import { BrowserRouter, Routes, Route } from 'react-router'
import Feed from './pages/feed/Feed'
import Messages from './pages/message/Messages'
<<<<<<< HEAD
import Profile from "./pages/profile/Profile";
=======
import Profile from './pages/profile/Profile'
import Auth from './pages/auth/Auth'
import NotFound from './pages/notfound/NotFound'
import Communities from './pages/communities/Communities'

>>>>>>> 25c35090b70e730d3b0751acdd92051a81bbaac5

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile" element={<Profile />} />
<<<<<<< HEAD
=======
        <Route path="/auth" element={<Auth />} />
        <Route path="/communities" element={<Communities />} />
        
        <Route path="*" element={<NotFound />} />
>>>>>>> 25c35090b70e730d3b0751acdd92051a81bbaac5
      </Routes>
    </BrowserRouter>
  )
}

export default App