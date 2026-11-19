import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './authStore'
import { getProfile } from './api'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Books from './pages/Books'
import MyLoans from './pages/MyLoans'
import Login from './pages/Login'
import Admin from './pages/Admin'

// REACT ROUTER: bantay ng mga protected na page. Walang token = login, mali ang role = balik sa home
const Guard = ({ role, children }) => {
  const { token, user } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (!user) return <p className="p-10 text-center">Loading...</p>
  return user.role === role ? children : <Navigate to="/" replace />
}

export default function App() {
  const { token, setUser, logout } = useAuth()

  // HOOKS (useEffect): tuwing may token, kinukuha ulit sa database yung role para sure na hindi napeke sa browser
  useEffect(() => {
    if (token) getProfile().then(setUser).catch(logout)
  }, [token])

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl p-4">
        {/* REACT ROUTER: lahat ng pages ng system nandito */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<Books />} />
          <Route path="/login" element={<Login />} />
          <Route path="/loans" element={<Guard role="customer"><MyLoans /></Guard>} />
          <Route path="/admin" element={<Guard role="admin"><Admin /></Guard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  )
}
