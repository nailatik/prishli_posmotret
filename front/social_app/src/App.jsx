import { BrowserRouter, Routes, Route } from 'react-router'
import Feed from './pages/feed/Feed'
import Messages from './pages/message/Messages'
import Profile from "./pages/profile/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App