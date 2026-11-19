import { create } from 'zustand'
import api from './api'

// ZUSTAND: global state ng mga libro, shared ng Home, Books at Admin para isang fetch lang ang logic
export const useBooks = create((set) => ({
  books: [],
  fetchBooks: async () => {
    const { data } = await api.get('/rest/v1/books', { params: { select: '*', order: 'title' } })
    set({ books: data })
  },
}))
