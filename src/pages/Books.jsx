import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api, { errMsg } from '../api'
import { useAuth } from '../authStore'
import { useBooks } from '../bookStore'
import BookCard from '../components/BookCard'

export default function Books() {
  const { books, fetchBooks } = useBooks()
  const { token, user } = useAuth()
  const go = useNavigate()
  // REACT ROUTER: kinukuha yung ?q= galing sa search ng homepage
  const [params] = useSearchParams()
  // HOOKS (useState + useEffect): search, filter, message, at pag-load ng libro
  const [q, setQ] = useState(params.get('q') || '')
  const [cat, setCat] = useState('All')
  const [msg, setMsg] = useState('')
  useEffect(() => { fetchBooks() }, [])

  const cats = ['All', ...new Set(books.map((b) => b.category))]
  const list = books.filter((b) => (cat === 'All' || b.category === cat) && `${b.title} ${b.author}`.toLowerCase().includes(q.toLowerCase()))

  const borrow = async (id) => {
    if (!token) return go('/login')
    try {
      // AXIOS: nagpapadala ng borrow request. Dito rin chine-check ng database kung may available pa
      await api.post('/rest/v1/loans', { book_id: id })
      setMsg('Request sent. Wait for the librarian to approve it in My Loans.')
    } catch (e) { setMsg(errMsg(e)) }
  }

  return (
    <>
      <h1 className="mb-4 text-3xl font-bold text-cocoa">Books</h1>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input className="input" placeholder="Search title or author" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input sm:w-48" value={cat} onChange={(e) => setCat(e.target.value)}>
          {cats.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      {msg && <p className="mb-4 rounded-lg bg-sand p-3 text-sm text-cocoa">{msg}</p>}
      {list.length === 0 && <p className="text-ink/60">No books found. Try a different search.</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((b) => <BookCard key={b.id} b={b} onBorrow={user?.role === 'admin' ? undefined : borrow} />)}
      </div>
    </>
  )
}
