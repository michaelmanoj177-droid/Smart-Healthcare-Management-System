import api from './client';

export const appointmentsAPI = {
  bookAppointment: (data) => api.post('/appointments/book', data),
  getMyAppointments: (params) => api.get('/appointments/my-appointments', { params }),
  getDoctorAppointments: (params) => api.get('/appointments/doctor-appointments', { params }),
  getAppointmentById: (id) => api.get(`/appointments/${id}`),
  updateStatus: (id, statusData) => api.put(`/appointments/${id}/status`, statusData),
};
