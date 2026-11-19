import { useEffect, useState } from 'react'
import api, { errMsg } from '../api'
import Status from '../components/Status'

export default function MyLoans() {
  // HOOKS (useState + useEffect): listahan ng loans ng customer at message
  const [loans, setLoans] = useState([])
  const [msg, setMsg] = useState('')

  // AXIOS: kinukuha yung loans (kasama title ng libro). Sa database naka-limit na sa sarili mong loans lang
  const load = () => api.get('/rest/v1/loans', { params: { select: '*,books(title,author)', order: 'created_at.desc' } }).then((r) => setLoans(r.data)).catch((e) => setMsg(errMsg(e)))
  useEffect(() => { load() }, [])

  const giveBack = async (id) => {
    try {
      // AXIOS: PATCH para i-update yung status ng loan papuntang returned
      await api.patch('/rest/v1/loans', { status: 'returned' }, { params: { id: `eq.${id}` } })
      setMsg('Book returned. Thank you!')
      load()
    } catch (e) { setMsg(errMsg(e)) }
  }

  return (
    <>
      <h1 className="mb-4 text-3xl font-bold text-cocoa">My Loans</h1>
      {msg && <p className="mb-4 rounded-lg bg-sand p-3 text-sm text-cocoa">{msg}</p>}
      {loans.length === 0 && <p className="text-ink/60">Nothing here yet. Borrow a book from the Books page.</p>}
      <div className="space-y-3">
        {loans.map((l) => (
          <div key={l.id} className="card flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-bold">{l.books.title}</p>
              <p className="text-sm text-brown">{l.books.author}</p>
              {l.status === 'borrowed' && (
                <p className={`text-sm ${new Date(l.due_at) < new Date() ? 'text-rust' : 'text-ink/60'}`}>
                  Due {new Date(l.due_at).toLocaleDateString()} {new Date(l.due_at) < new Date() && '(overdue)'}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Status s={l.status} />
              {l.status === 'borrowed' && <button className="btn" onClick={() => giveBack(l.id)}>Return</button>}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
