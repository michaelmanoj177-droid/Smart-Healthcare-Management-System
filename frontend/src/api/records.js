import api from './client';

export const recordsAPI = {
  createRecord: (data) => api.post('/records', data),
  getMyRecords: (params) => api.get('/records/patient/me', { params }),
  getPatientRecordsForDoctor: (patientId) => api.get(`/records/patient/${patientId}`),
  getRecordById: (id) => api.get(`/records/${id}`),
};
