import { authApi } from './axiosInstances'

export const login = (email, password) =>
  authApi.post('/api/auth/login', { email, password })

export const register = (name, email, password) =>
  authApi.post('/api/auth/register', { name, email, password })

export const getUserById = (userId) =>
  authApi.get(`/api/auth/users/${userId}`)
