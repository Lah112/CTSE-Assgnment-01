import { bookingApi } from './axiosInstances'

export const getBookingsByUser = (userId) =>
  bookingApi.get(`/api/bookings/${userId}`)

export const createBooking = (payload) =>
  bookingApi.post('/api/bookings', payload)

// Available service types from the Booking microservice enum
export const SERVICE_TYPES = [
  'OIL_CHANGE',
  'TIRE_ROTATION',
  'BRAKE_SERVICE',
  'GENERAL_INSPECTION',
  'ENGINE_REPAIR',
  'TRANSMISSION_SERVICE',
  'AC_SERVICE',
  'WHEEL_ALIGNMENT',
]
