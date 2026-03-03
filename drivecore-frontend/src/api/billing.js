import { billingApi } from './axiosInstances'

export const getInvoicesByUser = (userId) =>
  billingApi.get(`/api/billing/${userId}`)

export const createInvoice = (payload) =>
  billingApi.post('/api/billing', payload)
