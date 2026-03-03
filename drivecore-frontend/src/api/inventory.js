import { inventoryApi } from './axiosInstances'

export const getAllInventory = () =>
  inventoryApi.get('/api/inventory')

export const addInventoryItem = (payload) =>
  inventoryApi.post('/api/inventory', payload)
