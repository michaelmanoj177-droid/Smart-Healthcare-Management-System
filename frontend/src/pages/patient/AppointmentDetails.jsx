import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  ArrowLeft,
  XCircle,
  FileText,
  Pill,
  CheckCircle2
} from 'lucide-react';
import { appointmentsAPI } from '../../api/appointments';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await appointmentsAPI.getAppointmentById(id);
      setAppointment(res.data.appointment);
    } catch (err) {
      console.error('Error fetching appointment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    setCancelling(true);
    try {
      await appointmentsAPI.updateStatus(id, {
        status: 'cancelled',
        notes: 'Cancelled by patient from details page',
      });
      setMessage('Appointment has been cancelled.');
      fetchDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel appointment.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <Loader fullScreen message="Loading appointment details..." />;
  if (!appointment) {
    return (
      <div className="py-12 text-center">
        <Alert type="error" message="Appointment record could not be found." />
        <Link to="/patient/appointments" className="mt-4 inline-block">
          <Button variant="outline">Back to Appointments</Button>
        </Link>
      </div>
    );
  }

  const canCancel = ['pending', 'confirmed'].includes(appointment.status);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/patient/appointments"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Appointments
      </Link>

      {message && <Alert type="info" message={message} onClose={() => setMessage('')} />}

      <Card className="p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-gray-400">ID: {appointment.id}</span>
            <h2 className="text-xl font-extrabold text-gray-900">Consultation Session</h2>
            <p className="text-xs text-gray-500">Booked on {appointment.created_at?.split('T')[0]}</p>
          </div>
          <Badge status={appointment.status} className="self-start sm:self-auto text-sm px-3 py-1" />
        </div>

        {/* Doctor & Schedule Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-4 rounded-2xl bg-surface border border-gray-100 space-y-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Doctor Information
            </span>
            <h4 className="text-base font-bold text-gray-900">{appointment.doctor_name || 'Physician'}</h4>
            <p className="text-xs font-semibold text-primary">{appointment.doctor_specialization || 'Specialist'}</p>
            <p className="text-xs text-gray-500">{appointment.department_name} Department</p>
            <p className="text-xs text-gray-600 font-medium">Fee: ${appointment.consultation_fee?.toFixed(2)}</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-gray-100 space-y-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Appointment Schedule
            </span>
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{appointment.appointment_date}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
              <Clock className="w-4 h-4 text-secondary" />
              <span>{appointment.start_time} - {appointment.end_time}</span>
            </div>
          </div>
        </div>

        {/* Consultation Reason */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Consultation Reason</h4>
          <p className="p-4 rounded-xl bg-gray-50 text-xs text-gray-700 border border-gray-100 leading-relaxed">
            {appointment.reason}
          </p>
        </div>

        {/* Actions bar */}
        <div className="pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {appointment.status === 'completed' && (
              <>
                <Link to="/patient/records">
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-1 text-primary" /> View Clinical Notes
                  </Button>
                </Link>
                <Link to="/patient/prescriptions">
                  <Button variant="outline" size="sm">
                    <Pill className="w-4 h-4 mr-1 text-secondary" /> View Prescriptions
                  </Button>
                </Link>
              </>
            )}
          </div>

          {canCancel && (
            <Button
              variant="danger"
              size="sm"
              isLoading={cancelling}
              onClick={handleCancel}
            >
              <XCircle className="w-4 h-4 mr-1.5" /> Cancel Appointment
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AppointmentDetails;
