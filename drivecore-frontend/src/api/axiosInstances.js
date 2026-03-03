/**
 * src/api/axiosInstances.js
 *
 * Creates one Axios instance per microservice.
 * A shared request interceptor automatically attaches the JWT Bearer token
 * stored in localStorage to every outgoing request, so individual API
 * functions don't need to manage the Authorization header manually.
 */
import axios from 'axios'
import services from './config'

const TOKEN_KEY = 'drivecore_token'

// ----- Factory ---------------------------------------------------------------
// Creates a pre-configured Axios instance for a given base URL.
const createInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
  })

  // Request interceptor — inject Bearer token if one exists in localStorage
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem(TOKEN_KEY)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // Response interceptor — handle 401 globally (token expired / invalid)
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Clear stale credentials and redirect to login
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem('drivecore_user')
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )

  return instance
}

// ----- Per-service instances -------------------------------------------------
export const authApi      = createInstance(services.AUTH)
export const bookingApi   = createInstance(services.BOOKING)
export const inventoryApi = createInstance(services.INVENTORY)
export const billingApi   = createInstance(services.BILLING)
