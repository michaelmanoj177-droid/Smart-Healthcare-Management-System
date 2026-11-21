import api from './client';

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (userId, status) => api.put(`/admin/users/${userId}/status`, { account_status: status }),
  getPendingDoctors: () => api.get('/admin/doctors/pending'),
  verifyDoctor: (doctorUserId, decision, reason = '') => 
    api.put(`/admin/doctors/${doctorUserId}/verify`, { decision, reason }),
  getDepartments: () => api.get('/admin/departments'),
  createDepartment: (deptData) => api.post('/admin/departments', deptData),
  updateDepartment: (deptId, deptData) => api.put(`/admin/departments/${deptId}`, deptData),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (settingsData) => api.put('/admin/settings', settingsData),
};
