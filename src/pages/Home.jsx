import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBooks } from '../bookStore'
import BookCard from '../components/BookCard'

const steps = [
  ['Search', 'Look for a title, author, or category.'],
  ['Borrow', 'Send a request. The librarian approves it.'],
  ['Return', 'Give it back before the due date and mark it returned.'],
]

export default function Home() {
  const { books, fetchBooks } = useBooks()
  const go = useNavigate()
  // HOOKS (useState + useEffect): search text at pag-load ng mga libro pagbukas ng page
  const [q, setQ] = useState('')
  useEffect(() => { fetchBooks() }, [])

  return (
    <>
      <section className="rounded-2xl bg-sand px-6 py-14 text-center">
        <h1 className="text-4xl font-bold text-cocoa">Find your next read</h1>
        <p className="mt-2 text-ink/70">Search, borrow, and return books from one place.</p>
        <form className="mx-auto mt-6 flex max-w-md gap-2" onSubmit={(e) => { e.preventDefault(); go(`/books?q=${encodeURIComponent(q)}`) }}>
          <input className="input" placeholder="Title or author" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="btn">Search</button>
        </form>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        {steps.map(([t, d]) => (
          <div key={t} className="card"><h3 className="font-bold text-cocoa">{t}</h3><p className="text-sm text-ink/70">{d}</p></div>
        ))}
      </section>

      <h2 className="mb-3 mt-10 text-2xl font-bold text-cocoa">Latest books</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {books.slice(0, 4).map((b) => <BookCard key={b.id} b={b} />)}
      </div>
    </>
  )
}
