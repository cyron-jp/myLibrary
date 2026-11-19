const color = {
  pending: 'bg-amber-100 text-amber-800',
  borrowed: 'bg-sky-100 text-sky-800',
  returned: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
}

export default function Status({ s }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${color[s]}`}>{s}</span>
}
