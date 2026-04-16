import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-primary text-white px-6 py-4 flex items-center justify-between">
      <Link to="/" className="font-bold text-lg">PneumoAI</Link>
      <div className="flex items-center gap-4 text-sm">
        {user?.role === 'admin' ? (
          <>
            <Link to="/admin">Admin</Link>
            <Link to="/admin/users">Users</Link>
            <Link to="/admin/scans">Scans</Link>
          </>
        ) : (
          <>
            <Link to="/">Dashboard</Link>
            <Link to="/upload">Upload</Link>
            <Link to="/history">History</Link>
          </>
        )}
        <button onClick={handleLogout} className="border border-white/40 rounded px-3 py-1">Logout</button>
      </div>
    </nav>
  )
}
