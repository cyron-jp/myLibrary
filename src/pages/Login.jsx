import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import api, { getProfile, errMsg } from '../api'
import { useAuth } from '../authStore'

export default function Login() {
  const { token, user, setAuth } = useAuth()
  // HOOKS (useState): laman ng form, error, register mode, admin mode, at bilang ng click sa logo
  const [f, setF] = useState({ name: '', email: '', password: '' })
  const [reg, setReg] = useState(false)
  const [admin, setAdmin] = useState(false)
  const [clicks, setClicks] = useState(0)
  const [err, setErr] = useState('')

  // REACT ROUTER: pag naka-login na, ihahatid sa tamang page depende sa role
  if (token && user) return <Navigate to={user.role === 'admin' ? '/admin' : '/books'} replace />

  // Sikreto: 5 beses i-click yung logo para lumabas/mawala yung admin login
  const logoClick = () => {
    if (clicks + 1 < 5) return setClicks(clicks + 1)
    setClicks(0); setReg(false); setErr(''); setAdmin(!admin)
  }
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault(); setErr('')
    const { name, email, password } = f
    // Validation bago ipadala sa backend
    if (!email.includes('@') || password.length < 6 || (reg && !name.trim())) return setErr('Check your details. Password needs at least 6 characters.')
    try {
      // AXIOS: login o register request sa backend
      const { data } = reg
        ? await api.post('/auth/v1/signup', { email, password, data: { name } })
        : await api.post('/auth/v1/token', { email, password }, { params: { grant_type: 'password' } })
      if (!data.access_token) return setErr('Please confirm your email first, then log in.')
      const p = await getProfile(data.access_token)
      // Admin mode = admin lang pwede, normal mode = customer lang. Pareho ng generic na error para walang clue
      if ((p.role === 'admin') !== admin) return setErr('Invalid email or password.')
      setAuth(data.access_token, p)
    } catch (e) { setErr(errMsg(e)) }
  }

  return (
    <div className={`mx-auto mt-10 max-w-sm rounded-2xl border p-6 ${admin ? 'border-ink bg-ink text-cream' : 'border-sand bg-white'}`}>
      <img src="/logo.png" alt="MyLibrary logo" className="mx-auto h-16 w-16 cursor-pointer select-none" onClick={logoClick} />
      <h1 className="mt-2 text-center text-2xl font-bold">{admin ? 'Staff access' : reg ? 'Create account' : 'Welcome back'}</h1>
      <form className="mt-5 space-y-3" onSubmit={submit}>
        {reg && <input className="input text-ink" placeholder="Full name" value={f.name} onChange={set('name')} />}
        <input className="input text-ink" type="email" placeholder="Email" value={f.email} onChange={set('email')} />
        <input className="input text-ink" type="password" placeholder="Password" value={f.password} onChange={set('password')} />
        {err && <p className="text-sm text-rust">{err}</p>}
        <button className={`btn w-full ${admin ? 'bg-brown' : ''}`}>{reg ? 'Sign up' : 'Log in'}</button>
      </form>
      {!admin && (
        <button className="mt-4 w-full text-sm text-cocoa underline" onClick={() => { setReg(!reg); setErr('') }}>
          {reg ? 'Already have an account? Log in' : 'No account yet? Sign up'}
        </button>
      )}
    </div>
  )
}
