import api from './client';

export const doctorsAPI = {
  getDepartments: () => api.get('/departments'),
  getDoctors: (params) => api.get('/doctors', { params }),
  getDoctorById: (id) => api.get(`/doctors/${id}`),
  getDoctorAvailability: (id, date) => api.get(`/doctors/${id}/availability`, { params: { date } }),
  getMyAvailability: () => api.get('/doctor/availability'),
  updateMyAvailability: (schedules) => api.put('/doctor/availability', { schedules }),
};
