import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Search, ShieldCheck, Power, ShieldAlert, Award } from 'lucide-react';
import { adminAPI } from '../../api/admin';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({ role: 'doctor', search });
      setDoctors(res.data.users || []);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.account_status === 'active' ? 'inactive' : 'active';
    try {
      await adminAPI.updateUserStatus(user.id, newStatus);
      setAlertMsg(`Physician ${user.full_name} is now ${newStatus}.`);
      fetchDoctors();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Doctor Faculty Management</h1>
          <p className="text-xs text-gray-500 mt-1">
            Review registered medical specialists, clinical registration numbers, verification, and active status.
          </p>
        </div>

        <Link to="/admin/verification">
          <Button variant="secondary" size="sm">
            <ShieldCheck className="w-4 h-4 mr-1.5" /> Doctor Verification Center
          </Button>
        </Link>
      </div>

      {alertMsg && <Alert type="success" message={alertMsg} onClose={() => setAlertMsg('')} />}

      {/* Search Bar */}
      <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by physician name or email..."
            className="w-full pl-10 pr-24 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="absolute right-1.5 top-1/2 -translate-y-1/2"
          >
            Search
          </Button>
        </form>
      </Card>

      {/* Doctors Table */}
      {loading ? (
        <Loader message="Loading doctor directory..." />
      ) : doctors.length === 0 ? (
        <Card className="py-12">
          <EmptyState
            icon={Stethoscope}
            title="No Doctors Found"
            description="No physician records matched your search query."
          />
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface border-b border-gray-100 text-gray-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Doctor Name</th>
                  <th className="py-3 px-4">Specialization</th>
                  <th className="py-3 px-4">Registration No</th>
                  <th className="py-3 px-4">Experience</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {doctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4">
                      <p className="font-bold text-gray-900">{doc.full_name}</p>
                      <p className="text-[11px] text-gray-400">{doc.email}</p>
                    </td>
                    <td className="py-3 px-4 font-semibold text-primary">{doc.specialization || 'General'}</td>
                    <td className="py-3 px-4 font-mono text-gray-700">{doc.registration_number || 'PENDING'}</td>
                    <td className="py-3 px-4 text-gray-600">{doc.experience_years || 0} years</td>
                    <td className="py-3 px-4">
                      <Badge status={doc.verification_status || 'verified'} />
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={doc.account_status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant={doc.account_status === 'active' ? 'danger' : 'success'}
                        size="sm"
                        onClick={() => handleToggleStatus(doc)}
                        className="text-[11px] py-1 px-2.5"
                      >
                        <Power className="w-3 h-3 mr-1" />
                        {doc.account_status === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
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

export default DoctorManagement;
