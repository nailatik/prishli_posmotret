import { BrowserRouter, Routes, Route } from 'react-router'
import Feed from './pages/feed/Feed'
import Messages from './pages/message/Messages'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/messages" element={<Messages />} />
      </Routes>
    </BrowserRouter>
      
  )
}

export default App