import api from './client';

export const pharmacyAPI = {
  getInventory: (params) => api.get('/pharmacy/inventory', { params }),
  getInventoryItem: (id) => api.get(`/pharmacy/inventory/${id}`),
  createInventoryItem: (data) => api.post('/pharmacy/inventory', data),
  updateInventoryItem: (id, data) => api.put(`/pharmacy/inventory/${id}`, data),
  deleteInventoryItem: (id) => api.delete(`/pharmacy/inventory/${id}`),
  getAlerts: () => api.get('/pharmacy/alerts'),
  lookupBarcode: (barcode) => api.get('/pharmacy/lookup-barcode', { params: { barcode } }),
};
