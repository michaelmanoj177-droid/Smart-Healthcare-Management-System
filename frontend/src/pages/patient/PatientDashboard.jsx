import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  FileText,
  Pill,
  Bot,
  Search,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Activity,
  Heart,
  Droplet
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { appointmentsAPI } from '../../api/appointments';
import { recordsAPI } from '../../api/records';
import { prescriptionsAPI } from '../../api/prescriptions';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const PatientDashboard = () => {
  const { user, profile } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [apptRes, recRes, rxRes] = await Promise.all([
        appointmentsAPI.getMyAppointments(),
        recordsAPI.getMyRecords(),
        prescriptionsAPI.getMyPrescriptions(),
      ]);
      setAppointments(apptRes.data.appointments || []);
      setRecords(recRes.data.records || []);
      setPrescriptions(rxRes.data.prescriptions || []);
    } catch (err) {
      console.error('Error loading patient dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalAppointments = appointments.length;
  const upcomingAppointments = appointments.filter((a) =>
    ['pending', 'confirmed'].includes(a.status)
  );
  const completedAppointments = appointments.filter((a) => a.status === 'completed');
  const availablePrescriptions = prescriptions.length;

  if (loading) return <Loader message="Loading your health portal..." />;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold uppercase tracking-wider">
            Patient Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm max-w-xl">
            Track your consultations, view medical diagnoses, manage digital prescriptions, and connect with clinical specialists.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link to="/patient/find-doctors">
            <Button variant="secondary" size="md" className="bg-teal-500 hover:bg-teal-600 text-white">
              <Search className="w-4 h-4 mr-1.5" /> Find a Doctor
            </Button>
          </Link>
          <Link to="/patient/book-appointment">
            <Button variant="outline" size="md" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
              <Calendar className="w-4 h-4 mr-1.5" /> Book Appointment
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards (Section 10 Requirement) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium">Total Appointments</span>
            <h3 className="text-2xl font-bold text-gray-900">{totalAppointments}</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-secondary flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium">Upcoming Visits</span>
            <h3 className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium">Completed Visits</span>
            <h3 className="text-2xl font-bold text-gray-900">{completedAppointments.length}</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium">Prescriptions</span>
            <h3 className="text-2xl font-bold text-gray-900">{availablePrescriptions}</h3>
          </div>
        </Card>
      </div>

      {/* Main Grid: Upcoming Appointments + Health Profile Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Upcoming Appointments */}
        <div className="lg:col-span-8 space-y-6">
          <Card
            title="Upcoming Consultations"
            subtitle="Scheduled visits with hospital specialists"
            action={
              <Link to="/patient/appointments" className="text-xs font-semibold text-primary hover:underline">
                View All
              </Link>
            }
          >
            {upcomingAppointments.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No Upcoming Consultations"
                description="You have no appointments scheduled at this time."
                actionLabel="Book a Consultation"
                onAction={() => window.location.href = '/patient/book-appointment'}
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {upcomingAppointments.slice(0, 3).map((appt) => (
                  <div key={appt.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{appt.doctor_name || 'Physician'}</h4>
                        <p className="text-xs text-primary font-medium">{appt.doctor_specialization || 'General'}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Reason: <span className="text-gray-700">{appt.reason}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:text-right">
                      <div>
                        <span className="block text-xs font-bold text-gray-800">{appt.appointment_date}</span>
                        <span className="block text-[11px] text-gray-500">{appt.start_time} - {appt.end_time}</span>
                      </div>
                      <Badge status={appt.status} />
                      <Link to={`/patient/appointments/${appt.id}`}>
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Medical Records & Prescriptions Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Medical Records */}
            <Card
              title="Recent Clinical Notes"
              action={
                <Link to="/patient/records" className="text-xs font-semibold text-primary hover:underline">
                  All Records
                </Link>
              }
            >
              {records.length === 0 ? (
                <p className="text-xs text-gray-500 py-6 text-center">No consultation notes recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {records.slice(0, 2).map((rec) => (
                    <div key={rec.id} className="p-3.5 rounded-xl bg-surface border border-gray-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900">{rec.diagnosis || 'Clinical Note'}</span>
                        <span className="text-[10px] text-gray-400">{rec.consultation_date}</span>
                      </div>
                      <p className="text-[11px] text-gray-600 line-clamp-2">{rec.clinical_notes}</p>
                      <span className="text-[10px] text-primary font-medium block">
                        Dr. {rec.doctor_name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Recent Prescriptions */}
            <Card
              title="Digital Prescriptions"
              action={
                <Link to="/patient/prescriptions" className="text-xs font-semibold text-secondary hover:underline">
                  All Prescriptions
                </Link>
              }
            >
              {prescriptions.length === 0 ? (
                <p className="text-xs text-gray-500 py-6 text-center">No digital prescriptions issued yet.</p>
              ) : (
                <div className="space-y-3">
                  {prescriptions.slice(0, 2).map((rx) => (
                    <div key={rx.id} className="p-3.5 rounded-xl bg-teal-50/50 border border-teal-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-teal-900">
                          {rx.medicines?.[0]?.name || 'Medication'}
                          {rx.medicines?.length > 1 ? ` (+${rx.medicines.length - 1} more)` : ''}
                        </span>
                        <span className="text-[10px] text-teal-700">{rx.issue_date}</span>
                      </div>
                      <p className="text-[11px] text-gray-600 line-clamp-1">{rx.instructions}</p>
                      <span className="text-[10px] text-teal-700 font-medium block">
                        Dr. {rx.doctor_name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Right Column: Health Profile & Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Health Profile Card */}
          <Card title="Health Profile Summary" subtitle="Patient identification & vitals">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-surface border border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Blood Group</span>
                  <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                    <Droplet className="w-3.5 h-3.5" />
                    {profile?.blood_group || 'Not recorded'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Gender</span>
                  <span className="text-xs font-semibold text-gray-800">{profile?.gender || 'Not specified'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Date of Birth</span>
                  <span className="text-xs font-semibold text-gray-800">{profile?.date_of_birth || 'Not recorded'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Allergies</span>
                  <span className="text-xs font-semibold text-amber-700">{profile?.allergies || 'None recorded'}</span>
                </div>
              </div>

              <Link to="/patient/profile">
                <Button variant="outline" size="sm" className="w-full">
                  Edit Health Profile
                </Button>
              </Link>
            </div>
          </Card>

          {/* AI Healthcare Assistant Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 to-purple-900 text-white shadow-md space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Bot className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <h4 className="text-sm font-bold">AI Health Assistant</h4>
                <p className="text-[11px] text-purple-200">24/7 Clinical Education</p>
              </div>
            </div>
            <p className="text-xs text-purple-100 leading-relaxed">
              Have questions about symptoms, medications, or preparing for your next doctor consultation?
            </p>
            <Link to="/patient/ai-assistant">
              <Button variant="secondary" size="sm" className="w-full bg-purple-500 hover:bg-purple-600 text-white">
                Start Health Chat <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
