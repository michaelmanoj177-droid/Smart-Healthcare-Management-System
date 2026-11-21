import api from './client';

export const prescriptionsAPI = {
  createPrescription: (data) => api.post('/prescriptions', data),
  getMyPrescriptions: () => api.get('/prescriptions/patient/me'),
  getDoctorPrescriptions: () => api.get('/prescriptions/doctor/me'),
  getPrescriptionById: (id) => api.get(`/prescriptions/${id}`),
};
