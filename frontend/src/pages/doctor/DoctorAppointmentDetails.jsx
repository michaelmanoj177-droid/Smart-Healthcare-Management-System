import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileText,
  Pill,
  Check
} from 'lucide-react';
import { appointmentsAPI } from '../../api/appointments';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';

const DoctorAppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
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

  const handleStatus = async (newStatus) => {
    setActionLoading(true);
    try {
      await appointmentsAPI.updateStatus(id, { status: newStatus });
      setMessage(`Appointment updated to ${newStatus}.`);
      fetchDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader fullScreen message="Loading consultation file..." />;
  if (!appointment) {
    return (
      <div className="py-12 text-center">
        <Alert type="error" message="Appointment record could not be found." />
        <Link to="/doctor/appointments" className="mt-4 inline-block">
          <Button variant="outline">Back to Appointments</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/doctor/appointments"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Assigned Appointments
      </Link>

      {message && <Alert type="success" message={message} onClose={() => setMessage('')} />}

      <Card className="p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-gray-400">APPOINTMENT #{appointment.id}</span>
            <h2 className="text-xl font-extrabold text-gray-900">Patient Consultation File</h2>
            <p className="text-xs text-gray-500">Lodged on {appointment.created_at?.split('T')[0]}</p>
          </div>
          <Badge status={appointment.status} className="self-start sm:self-auto text-sm px-3 py-1" />
        </div>

        {/* Patient Details & Schedule */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-4 rounded-2xl bg-surface border border-gray-100 space-y-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Patient Profile
            </span>
            <h4 className="text-base font-bold text-gray-900">{appointment.patient_name}</h4>
            <p className="text-xs text-gray-600">Email: {appointment.patient_email}</p>
            <p className="text-xs text-gray-600">Phone: {appointment.patient_phone || 'N/A'}</p>
            <p className="text-xs text-gray-600">
              Gender: {appointment.patient_gender || 'N/A'} • Blood: {appointment.patient_blood_group || 'N/A'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-gray-100 space-y-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Session Schedule
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

        {/* Patient's Reported Reason */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Patient Consultation Reason</h4>
          <p className="p-4 rounded-xl bg-gray-50 text-xs text-gray-700 border border-gray-100 leading-relaxed">
            {appointment.reason}
          </p>
        </div>

        {/* Status Actions */}
        <div className="pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link to={`/doctor/create-record?patient_id=${appointment.patient_id}&appointment_id=${appointment.id}`}>
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-1 text-primary" /> Create Medical Record
              </Button>
            </Link>
            <Link to={`/doctor/create-prescription?patient_id=${appointment.patient_id}&appointment_id=${appointment.id}`}>
              <Button variant="outline" size="sm">
                <Pill className="w-4 h-4 mr-1 text-secondary" /> Write Prescription
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {appointment.status === 'pending' && (
              <>
                <Button
                  variant="success"
                  size="sm"
                  isLoading={actionLoading}
                  onClick={() => handleStatus('confirmed')}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Confirm Consultation
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  isLoading={actionLoading}
                  onClick={() => handleStatus('rejected')}
                >
                  <XCircle className="w-4 h-4 mr-1" /> Reject Request
                </Button>
              </>
            )}

            {appointment.status === 'confirmed' && (
              <Button
                variant="success"
                size="sm"
                isLoading={actionLoading}
                onClick={() => handleStatus('completed')}
              >
                <Check className="w-4 h-4 mr-1" /> Mark Consultation Completed
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DoctorAppointmentDetails;
