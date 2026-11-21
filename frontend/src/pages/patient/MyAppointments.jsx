import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Filter, Eye, XCircle, Stethoscope } from 'lucide-react';
import { appointmentsAPI } from '../../api/appointments';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentsAPI.getMyAppointments({ status: statusFilter });
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelModal) return;
    setCancelling(true);
    try {
      await appointmentsAPI.updateStatus(cancelModal.id, {
        status: 'cancelled',
        notes: 'Cancelled by patient',
      });
      setActionMsg('Appointment cancelled successfully.');
      setCancelModal(null);
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel appointment.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">My Appointments</h1>
          <p className="text-xs text-gray-500 mt-1">
            Review your past, upcoming, and pending physician consultations.
          </p>
        </div>

        <Link to="/patient/book-appointment">
          <Button variant="primary" size="md">
            <Calendar className="w-4 h-4 mr-1.5" /> Book New Visit
          </Button>
        </Link>
      </div>

      {actionMsg && (
        <Alert type="success" message={actionMsg} onClose={() => setActionMsg('')} />
      )}

      {/* Filter bar */}
      <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs">
        <Filter className="w-4 h-4 text-gray-400 shrink-0 ml-1" />
        <span className="text-xs font-semibold text-gray-600">Status Filter:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs py-1.5 px-3 rounded-lg border border-gray-200 bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All Appointments</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Appointment List Table / Cards */}
      {loading ? (
        <Loader message="Loading your appointments..." />
      ) : appointments.length === 0 ? (
        <Card className="py-12">
          <EmptyState
            icon={Calendar}
            title="No appointments found"
            description="You don't have any appointments matching this status filter."
            actionLabel="Schedule Appointment"
            onAction={() => window.location.href = '/patient/book-appointment'}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <Card key={appt.id} className="p-5 hover:border-blue-200 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900">{appt.doctor_name || 'Doctor'}</h3>
                      <Badge status={appt.status} />
                    </div>
                    <p className="text-xs text-primary font-medium">{appt.doctor_specialization || 'Clinical Specialist'}</p>
                    <p className="text-xs text-gray-500">
                      Reason: <span className="text-gray-700">{appt.reason}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 md:text-right border-t md:border-t-0 pt-3 md:pt-0">
                  <div>
                    <span className="block text-xs font-bold text-gray-800">{appt.appointment_date}</span>
                    <span className="block text-[11px] text-gray-500">{appt.start_time} - {appt.end_time}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/patient/appointments/${appt.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-3.5 h-3.5 mr-1" /> View
                      </Button>
                    </Link>

                    {['pending', 'confirmed'].includes(appt.status) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCancelModal(appt)}
                        className="text-danger hover:bg-red-50 hover:text-red-700"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Cancel Appointment?</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to cancel your consultation with{' '}
              <span className="font-semibold">{cancelModal.doctor_name}</span> on{' '}
              <span className="font-semibold">{cancelModal.appointment_date}</span> at{' '}
              <span className="font-semibold">{cancelModal.start_time}</span>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <Button variant="outline" size="sm" onClick={() => setCancelModal(null)}>
                Keep Appointment
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={cancelling}
                onClick={handleCancel}
              >
                Yes, Cancel Visit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
