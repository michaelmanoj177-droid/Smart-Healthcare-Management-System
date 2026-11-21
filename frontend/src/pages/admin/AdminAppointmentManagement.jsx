import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Filter, Eye, Stethoscope, User, Search } from 'lucide-react';
import { appointmentsAPI } from '../../api/appointments';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';

const AdminAppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentsAPI.getMyAppointments(); // Or fetch doctor appts
      // In Admin mode, we can retrieve doctor appointments or all appointments
      const doctorRes = await appointmentsAPI.getDoctorAppointments();
      setAppointments(doctorRes.data.appointments || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (apptId, newStatus) => {
    try {
      await appointmentsAPI.updateStatus(apptId, { status: newStatus, notes: 'Updated by hospital administrator' });
      setAlertMsg(`Appointment status modified to ${newStatus}.`);
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed.');
    }
  };

  const filtered = appointments.filter((a) => {
    const matchesSearch =
      (a.doctor_name && a.doctor_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.patient_name && a.patient_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.reason && a.reason.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = !statusFilter || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Facility Appointment Registry</h1>
          <p className="text-xs text-gray-500 mt-1">
            Global overview of consultations, patient schedules, and clinical lifecycle statuses.
          </p>
        </div>
      </div>

      {alertMsg && <Alert type="success" message={alertMsg} onClose={() => setAlertMsg('')} />}

      {/* Filter and Search */}
      <Card className="p-4 flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by physician, patient, or consultation reason..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-semibold text-gray-600">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-lg border border-gray-200 bg-surface focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </Card>

      {/* Appointment Table */}
      {loading ? (
        <Loader message="Loading appointment records..." />
      ) : filtered.length === 0 ? (
        <Card className="py-12">
          <EmptyState
            icon={Calendar}
            title="No Appointments Found"
            description="No scheduled consultations match your filter criteria."
          />
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface border-b border-gray-100 text-gray-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Consulting Physician</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Admin Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4">
                      <p className="font-bold text-gray-900">{a.patient_name || 'Patient'}</p>
                      <p className="text-[10px] text-gray-400">{a.patient_email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-gray-900">{a.doctor_name || 'Doctor'}</p>
                      <p className="text-[10px] text-primary">{a.doctor_specialization}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-800">{a.appointment_date}</span>
                      <span className="block text-[10px] text-gray-400">{a.start_time} - {a.end_time}</span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-gray-600">
                      {a.reason}
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={a.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <select
                        value={a.status}
                        onChange={(e) => handleUpdateStatus(a.id, e.target.value)}
                        className="text-[11px] py-1 px-2 rounded-lg border border-gray-200 bg-white font-medium"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminAppointmentManagement;
