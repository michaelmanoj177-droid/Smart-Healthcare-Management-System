import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Pill,
  Users,
  ShieldCheck,
  Activity,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { appointmentsAPI } from '../../api/appointments';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';

const DoctorDashboard = () => {
  const { user, profile } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentsAPI.getDoctorAppointments();
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error('Error fetching doctor appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (apptId, newStatus) => {
    setActionLoading(true);
    try {
      await appointmentsAPI.updateStatus(apptId, { status: newStatus });
      setAlertMsg(`Appointment status updated to ${newStatus}.`);
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update appointment status.');
    } finally {
      setActionLoading(false);
    }
  };

  const pendingAppointments = appointments.filter((a) => a.status === 'pending');
  const confirmedAppointments = appointments.filter((a) => a.status === 'confirmed');
  const completedAppointments = appointments.filter((a) => a.status === 'completed');

  if (loading) return <Loader message="Loading physician workspace..." />;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold uppercase tracking-wider">
              Physician Workspace
            </span>
            <Badge status="verified" text="Verified Practitioner" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-teal-100 text-xs sm:text-sm max-w-xl">
            {profile?.specialization || 'Clinical Specialist'} • {profile?.department_name || 'Medical Clinic'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link to="/doctor/create-record">
            <Button variant="primary" size="md" className="bg-blue-600 hover:bg-blue-700">
              <FileText className="w-4 h-4 mr-1.5" /> Clinical Note
            </Button>
          </Link>
          <Link to="/doctor/create-prescription">
            <Button variant="secondary" size="md" className="bg-emerald-600 hover:bg-emerald-700">
              <Pill className="w-4 h-4 mr-1.5" /> Write Prescription
            </Button>
          </Link>
        </div>
      </div>

      {alertMsg && <Alert type="success" message={alertMsg} onClose={() => setAlertMsg('')} />}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium">Pending Requests</span>
            <h3 className="text-2xl font-bold text-gray-900">{pendingAppointments.length}</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium">Upcoming Visits</span>
            <h3 className="text-2xl font-bold text-gray-900">{confirmedAppointments.length}</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium">Completed Visits</span>
            <h3 className="text-2xl font-bold text-gray-900">{completedAppointments.length}</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium">Total Bookings</span>
            <h3 className="text-2xl font-bold text-gray-900">{appointments.length}</h3>
          </div>
        </Card>
      </div>

      {/* Pending Appointment Requests Section */}
      <Card
        title="Pending Patient Requests"
        subtitle="Review and confirm or decline incoming consultation requests"
        action={
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            {pendingAppointments.length} Awaiting Action
          </span>
        }
      >
        {pendingAppointments.length === 0 ? (
          <p className="text-xs text-gray-500 py-6 text-center">
            No pending appointment requests currently. All requests have been reviewed!
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingAppointments.map((appt) => (
              <div key={appt.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {appt.patient_name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{appt.patient_name}</h4>
                    <p className="text-xs text-gray-500">
                      Reason: <span className="text-gray-800 font-medium">{appt.reason}</span>
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Contact: {appt.patient_phone || appt.patient_email} • Gender: {appt.patient_gender || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 md:text-right">
                  <div>
                    <span className="block text-xs font-bold text-gray-800">{appt.appointment_date}</span>
                    <span className="block text-[11px] text-gray-500">{appt.start_time} - {appt.end_time}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="success"
                      size="sm"
                      isLoading={actionLoading}
                      onClick={() => handleStatusUpdate(appt.id, 'confirmed')}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Confirm
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      isLoading={actionLoading}
                      onClick={() => handleStatusUpdate(appt.id, 'rejected')}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" /> Decline
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Confirmed Visits Schedule */}
      <Card
        title="Upcoming Confirmed Consultations"
        subtitle="Patients scheduled for consultation"
        action={
          <Link to="/doctor/appointments" className="text-xs font-semibold text-primary hover:underline">
            View All Schedule
          </Link>
        }
      >
        {confirmedAppointments.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No Upcoming Consultations"
            description="You don't have any confirmed appointments scheduled in your immediate queue."
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {confirmedAppointments.slice(0, 5).map((appt) => (
              <div key={appt.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                    {appt.patient_name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{appt.patient_name}</h4>
                    <p className="text-xs text-gray-500">
                      Reason: <span className="text-gray-800 font-medium">{appt.reason}</span>
                    </p>
                    <span className="text-[11px] text-gray-400">
                      Blood Group: {appt.patient_blood_group || 'N/A'} • DOB: {appt.patient_dob || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:text-right">
                  <div>
                    <span className="block text-xs font-bold text-gray-800">{appt.appointment_date}</span>
                    <span className="block text-[11px] text-gray-500">{appt.start_time} - {appt.end_time}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/doctor/create-record?patient_id=${appt.patient_id}&appointment_id=${appt.id}`}>
                      <Button variant="outline" size="sm">
                        <FileText className="w-3.5 h-3.5 mr-1 text-primary" /> Add Notes
                      </Button>
                    </Link>
                    <Link to={`/doctor/create-prescription?patient_id=${appt.patient_id}&appointment_id=${appt.id}`}>
                      <Button variant="outline" size="sm">
                        <Pill className="w-3.5 h-3.5 mr-1 text-secondary" /> Prescribe
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default DoctorDashboard;
