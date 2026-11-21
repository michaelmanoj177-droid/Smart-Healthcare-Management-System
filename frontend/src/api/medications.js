import api from './client';

export const medicationsAPI = {
  searchMedicines: (params) => api.get('/medications/search', { params }),
  getMedicineReference: (idOrBarcode) => api.get(`/medications/reference/${idOrBarcode}`),
  getSchedules: (params) => api.get('/medications/schedules', { params }),
  createSchedule: (data) => api.post('/medications/schedules', data),
  updateSchedule: (id, data) => api.put(`/medications/schedules/${id}`, data),
  deleteSchedule: (id) => api.delete(`/medications/schedules/${id}`),
  importFromPrescription: (prescriptionId) =>
    api.post(`/medications/schedules/import-from-prescription/${prescriptionId}`),
  getDoses: (params) => api.get('/medications/doses', { params }),
  logDose: (data) => api.post('/medications/doses/log', data),
  checkSafety: (data) => api.post('/medications/safety-check', data),
};
