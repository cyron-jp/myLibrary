import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ZUSTAND: global state ng login. Dito naka-save yung token at yung user (may role), kahit saang component pwede kunin
// token lang ang sine-save sa localStorage, yung role laging kinukuha ulit sa database para hindi mapeke
export const useAuth = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'mylibrary-auth', partialize: (s) => ({ token: s.token }) }
  )
)
