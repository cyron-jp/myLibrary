export default function BookCard({ b, onBorrow }) {
  return (
    <div className="card flex flex-col justify-between">
      <div>
        <span className="rounded-full bg-sand px-2 py-0.5 text-xs text-cocoa">{b.category}</span>
        <h3 className="mt-2 text-lg font-bold leading-snug">{b.title}</h3>
        <p className="text-sm text-brown">{b.author}</p>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className={b.available ? 'text-emerald-700' : 'text-rust'}>
          {b.available ? `${b.available} available` : 'Not available'}
        </span>
        {onBorrow && <button className="btn" disabled={!b.available} onClick={() => onBorrow(b.id)}>Borrow</button>}
      </div>
    </div>
  )
}
