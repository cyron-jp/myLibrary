import { useEffect, useState } from 'react'
import api, { errMsg } from '../api'
import { useBooks } from '../bookStore'
import Status from '../components/Status'

const empty = { title: '', author: '', category: '', copies: 1 }

export default function Admin() {
  const { books, fetchBooks } = useBooks()
  // HOOKS (useState): loans, tab, message, form ng libro, at id ng ine-edit
  const [loans, setLoans] = useState([])
  const [tab, setTab] = useState('Requests')
  const [msg, setMsg] = useState('')
  const [f, setF] = useState(empty)
  const [editId, setEditId] = useState(null)

  // AXIOS: kinukuha lahat ng loans kasama pangalan ng borrower at title. Admin lang ang makakakita ng lahat
  const loadLoans = () => api.get('/rest/v1/loans', { params: { select: '*,books(title),profiles(name)', order: 'created_at.desc' } }).then((r) => setLoans(r.data)).catch((e) => setMsg(errMsg(e)))
  // HOOKS (useEffect): load ng data pagbukas ng dashboard
  useEffect(() => { fetchBooks(); loadLoans() }, [])

  // isang function para sa lahat ng request: kung ok, refresh ng data. Kung hindi, ipakita yung error
  const act = async (req) => {
    try { await req; setMsg(''); fetchBooks(); loadLoans(); return true }
    catch (e) { setMsg(errMsg(e)); return false }
  }
  // AXIOS: approve o reject ng request
  const decide = (id, status) => act(api.patch('/rest/v1/loans', { status }, { params: { id: `eq.${id}` } }))
  // AXIOS: PATCH pag edit, POST pag bago, DELETE pag buburahin
  const saveBook = async (e) => {
    e.preventDefault()
    const copies = Number(f.copies)
    if (!f.title.trim() || !f.author.trim() || !f.category.trim() || copies < 1) return setMsg('Fill in all fields. Copies must be at least 1.')
    const body = { title: f.title, author: f.author, category: f.category }
    const ok = await act(editId ? api.patch('/rest/v1/books', body, { params: { id: `eq.${editId}` } }) : api.post('/rest/v1/books', { ...body, copies, available: copies }))
    if (ok) { setF(empty); setEditId(null) }
  }
  const delBook = (id) => window.confirm('Delete this book and its loan history?') && act(api.delete('/rest/v1/books', { params: { id: `eq.${id}` } }))

  const stats = [
    ['Titles', books.length],
    ['Copies available', books.reduce((s, b) => s + b.available, 0)],
    ['Pending requests', loans.filter((l) => l.status === 'pending').length],
    ['Currently borrowed', loans.filter((l) => l.status === 'borrowed').length],
  ]
  const shown = tab === 'Requests' ? loans.filter((l) => l.status === 'pending') : loans

  return (
    <>
      <h1 className="mb-4 text-3xl font-bold text-cocoa">Admin dashboard</h1>
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(([t, n]) => (
          <div key={t} className="card bg-ink text-cream"><p className="text-3xl font-bold">{n}</p><p className="text-sm text-tan">{t}</p></div>
        ))}
      </div>

      <div className="mb-4 flex gap-2">
        {['Requests', 'Loans', 'Books'].map((t) => (
          <button key={t} className={tab === t ? 'btn' : 'btn-alt'} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      {msg && <p className="mb-4 rounded-lg bg-sand p-3 text-sm text-cocoa">{msg}</p>}

      {tab !== 'Books' && (
        <div className="space-y-3">
          {shown.length === 0 && <p className="text-ink/60">Nothing to show.</p>}
          {shown.map((l) => (
            <div key={l.id} className="card flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold">{l.books.title}</p>
                <p className="text-sm text-brown">{l.profiles?.name || 'Customer'} on {new Date(l.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <Status s={l.status} />
                {l.status === 'pending' && (
                  <>
                    <button className="btn" onClick={() => decide(l.id, 'borrowed')}>Approve</button>
                    <button className="btn-alt" onClick={() => decide(l.id, 'rejected')}>Reject</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'Books' && (
        <>
          <form className="card mb-4 grid gap-2 sm:grid-cols-5" onSubmit={saveBook}>
            <input className="input" placeholder="Title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
            <input className="input" placeholder="Author" value={f.author} onChange={(e) => setF({ ...f, author: e.target.value })} />
            <input className="input" placeholder="Category" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} />
            <input className="input" type="number" min="1" disabled={!!editId} value={f.copies} onChange={(e) => setF({ ...f, copies: e.target.value })} />
            <button className="btn">{editId ? 'Save changes' : 'Add book'}</button>
          </form>
          <div className="space-y-3">
            {books.map((b) => (
              <div key={b.id} className="card flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold">{b.title}</p>
                  <p className="text-sm text-brown">{b.author} in {b.category} ({b.available}/{b.copies} available)</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn-alt" onClick={() => { setEditId(b.id); setF(b) }}>Edit</button>
                  <button className="btn-alt text-rust" onClick={() => delBook(b.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  )
}
