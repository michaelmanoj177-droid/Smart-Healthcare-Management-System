import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Calendar,
  Clock,
  ShieldCheck,
  Building2,
  AlertCircle,
  Activity,
  CheckCircle2,
  XCircle,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { adminAPI } from '../../api/admin';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';

const COLORS = ['#2563EB', '#0D9488', '#16A34A', '#DC2626', '#F59E0B', '#9333EA'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, pendingRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getPendingDoctors(),
      ]);
      setStats(statsRes.data.stats);
      setPendingDoctors(pendingRes.data.pending_doctors || []);
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDoctor = async (userId, decision) => {
    try {
      await adminAPI.verifyDoctor(userId, decision, `Reviewed and ${decision} by administrator.`);
      setActionMsg(`Doctor application has been ${decision}.`);
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed.');
    }
  };

  if (loading) return <Loader message="Loading administrator analytics..." />;

  const statusData = stats?.status_breakdown || [];
  const specData = stats?.specialization_breakdown || [];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Hospital Administration</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-primary text-[10px] font-bold border border-blue-200">
              Live Operations
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time facility metrics, clinical practitioner verification, and appointment management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/verification">
            <Button variant="outline" size="sm">
              <ShieldCheck className="w-4 h-4 mr-1 text-primary" /> Doctor Verifications ({pendingDoctors.length})
            </Button>
          </Link>
          <Link to="/admin/audit-logs">
            <Button variant="primary" size="sm">
              Audit Logs
            </Button>
          </Link>
        </div>
      </div>

      {actionMsg && <Alert type="success" message={actionMsg} onClose={() => setActionMsg('')} />}

      {/* KPI Cards (Section 16 Requirements) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium">Total Patients</span>
            <h3 className="text-2xl font-bold text-gray-900">{stats?.total_patients || 0}</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-secondary flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium">Verified Doctors</span>
            <h3 className="text-2xl font-bold text-gray-900">{stats?.verified_doctors || 0}</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium">Pending Verifications</span>
            <h3 className="text-2xl font-bold text-amber-600">{stats?.pending_doctors || 0}</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium">Total Bookings</span>
            <h3 className="text-2xl font-bold text-gray-900">{stats?.total_appointments || 0}</h3>
          </div>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Appointments by Status Chart */}
        <div className="lg:col-span-6">
          <Card title="Appointments by Status" subtitle="Breakdown of scheduled visits across clinic lifecycle">
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
                  <YAxis stroke="#94A3B8" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Doctor Specialization Distribution */}
        <div className="lg:col-span-6">
          <Card title="Physicians by Department" subtitle="Active clinical specialty distribution">
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={specData}
                    dataKey="count"
                    nameKey="specialization"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ specialization, count }) => `${specialization}: ${count}`}
                    fontSize={11}
                  >
                    {specData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Pending Doctor Applications Review Queue */}
      <Card
        title="Pending Doctor Applications"
        subtitle="Physicians awaiting credential verification to activate booking schedule"
        action={
          <Link to="/admin/verification" className="text-xs font-semibold text-primary hover:underline">
            View All ({pendingDoctors.length})
          </Link>
        }
      >
        {pendingDoctors.length === 0 ? (
          <p className="text-xs text-gray-500 py-6 text-center">
            No doctor applications are currently pending verification.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingDoctors.slice(0, 3).map((doc) => (
              <div key={doc.doctor_profile_id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-gray-900">{doc.name}</h4>
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold border border-amber-200">
                      Pending
                    </span>
                  </div>
                  <p className="text-xs text-primary font-medium">{doc.specialization} • {doc.qualifications}</p>
                  <p className="text-[11px] text-gray-500">
                    Registration No: <span className="font-mono text-gray-700">{doc.registration_number || 'N/A'}</span> • {doc.experience_years} years experience
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleVerifyDoctor(doc.user_id, 'verified')}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve Doctor
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleVerifyDoctor(doc.user_id, 'rejected')}
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminDashboard;
