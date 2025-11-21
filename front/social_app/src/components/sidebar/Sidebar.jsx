import './Sidebar.css'

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-buttons">
        <button className="sidebar-btn">Весь мир</button>
        <button className="sidebar-btn">Мой мир</button>
        <button className="sidebar-btn">Создать пост</button>
      </div>
    </aside>
  )
}

export default Sidebar