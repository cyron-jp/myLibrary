import axios from 'axios'
import { useAuth } from './authStore'

// AXIOS: ito yung main instance, lahat ng request papunta sa backend/database dito dumadaan
const api = axios.create({
  baseURL: import.meta.env.VITE_SUPABASE_URL,
  headers: { apikey: import.meta.env.VITE_SUPABASE_KEY },
})

// AXIOS: nilalagay dito yung token ng naka-login para alam ng backend kung sino at ano role mo
api.interceptors.request.use((c) => {
  const t = useAuth.getState().token
  if (t) c.headers.Authorization = `Bearer ${t}`
  return c
})

// AXIOS: pag expired o invalid na yung token, auto logout
api.interceptors.response.use(
  (r) => r,
  (e) => {
    if (e.response?.status === 401) useAuth.getState().logout()
    return Promise.reject(e)
  }
)

export const errMsg = (e) => e.response?.data?.message || e.response?.data?.msg || e.response?.data?.error_description || e.message

// AXIOS: kinukuha yung profile (name at role) ng kasalukuyang user galing sa database
export const getProfile = async (token) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined
  const { data: u } = await api.get('/auth/v1/user', { headers })
  const { data } = await api.get('/rest/v1/profiles', { params: { id: `eq.${u.id}`, select: '*' }, headers })
  if (!data[0]) throw new Error('No profile')
  return data[0]
}

export default api
