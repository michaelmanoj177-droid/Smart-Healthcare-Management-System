import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Filter,
  CheckCircle2,
  XCircle,
  FileText,
  Pill,
  User,
  Eye,
  Check
} from 'lucide-react';
import { appointmentsAPI } from '../../api/appointments';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, dateFilter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentsAPI.getDoctorAppointments({
        status: statusFilter,
        date: dateFilter,
      });
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error('Error fetching doctor appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (apptId, newStatus) => {
    try {
      await appointmentsAPI.updateStatus(apptId, { status: newStatus });
      setAlertMsg(`Appointment status updated to ${newStatus}.`);
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Assigned Consultations</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage your patient consultation requests, schedule visits, and update consultation progress.
          </p>
        </div>
      </div>

      {alertMsg && <Alert type="success" message={alertMsg} onClose={() => setAlertMsg('')} />}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-semibold text-gray-600">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-xl border border-gray-200 bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-semibold text-gray-600">Date:</span>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-xl border border-gray-200 bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-[11px] text-gray-400 hover:text-gray-700 font-semibold"
            >
              Clear Date
            </button>
          )}
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <Loader message="Loading assigned appointments..." />
      ) : appointments.length === 0 ? (
        <Card className="py-12">
          <EmptyState
            icon={Calendar}
            title="No Appointments Found"
            description="There are no consultations matching your chosen filter criteria."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <Card key={appt.id} className="p-5 hover:border-teal-200 transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-teal-50 text-secondary flex items-center justify-center font-bold text-xs shrink-0">
                    {appt.patient_name?.charAt(0) || 'P'}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900">{appt.patient_name}</h3>
                      <Badge status={appt.status} />
                    </div>
                    <p className="text-xs text-gray-600">
                      Reason: <span className="font-medium text-gray-800">{appt.reason}</span>
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Contact: {appt.patient_phone || appt.patient_email} • Gender: {appt.patient_gender || 'N/A'} • Blood: {appt.patient_blood_group || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 lg:text-right border-t lg:border-t-0 pt-3 lg:pt-0">
                  <div>
                    <span className="block text-xs font-bold text-gray-800">{appt.appointment_date}</span>
                    <span className="block text-[11px] text-gray-500">{appt.start_time} - {appt.end_time}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {appt.status === 'pending' && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleStatus(appt.id, 'confirmed')}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Confirm
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleStatus(appt.id, 'rejected')}
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                        </Button>
                      </>
                    )}

                    {appt.status === 'confirmed' && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleStatus(appt.id, 'completed')}
                        >
                          <Check className="w-3.5 h-3.5 mr-1" /> Mark Complete
                        </Button>
                        <Link to={`/doctor/create-record?patient_id=${appt.patient_id}&appointment_id=${appt.id}`}>
                          <Button variant="outline" size="sm">
                            <FileText className="w-3.5 h-3.5 mr-1 text-primary" /> Add Record
                          </Button>
                        </Link>
                        <Link to={`/doctor/create-prescription?patient_id=${appt.patient_id}&appointment_id=${appt.id}`}>
                          <Button variant="outline" size="sm">
                            <Pill className="w-3.5 h-3.5 mr-1 text-secondary" /> Prescribe
                          </Button>
                        </Link>
                      </>
                    )}

                    <Link to={`/doctor/appointments/${appt.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-3.5 h-3.5 mr-1" /> Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
