import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../authStore'

export default function Navbar() {
  const { user, token, logout } = useAuth()
  const go = useNavigate()
  // HOOKS (useState): bukas o sarado yung menu sa mobile
  const [open, setOpen] = useState(false)

  // REACT ROUTER: mga link ng navbar, nag-iiba depende sa role
  const links = [
    ['/', 'Home'],
    ['/books', 'Books'],
    ...(user?.role === 'customer' ? [['/loans', 'My Loans']] : []),
    ...(user?.role === 'admin' ? [['/admin', 'Dashboard']] : []),
  ]
  const out = () => { logout(); setOpen(false); go('/') }

  return (
    <header className="sticky top-0 z-10 border-b border-sand bg-cream/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between p-3">
        <Link to="/" className="flex items-center gap-2 font-serif text-xl font-bold text-cocoa">
          <img src="/logo.png" alt="MyLibrary logo" className="h-9 w-9" />
          MyLibrary
        </Link>
        <button className="text-2xl md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">☰</button>
        <div className={`${open ? 'flex' : 'hidden'} absolute left-0 top-full w-full flex-col gap-3 border-b border-sand bg-cream p-4 md:static md:flex md:w-auto md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0`}>
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)}
              className={({ isActive }) => `py-1 ${isActive ? 'font-semibold text-cocoa underline underline-offset-8' : 'text-ink/70 hover:text-cocoa'}`}>
              {label}
            </NavLink>
          ))}
          {token ? (
            <button className="btn-alt" onClick={out}>Log out</button>
          ) : (
            <Link to="/login" className="btn text-center" onClick={() => setOpen(false)}>Log in</Link>
          )}
        </div>
      </nav>
    </header>
  )
}
