import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, CheckCircle2, XCircle, Power } from 'lucide-react';
import { adminAPI } from '../../api/admin';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';

const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({ role: 'patient', search });
      setPatients(res.data.users || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPatients();
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.account_status === 'active' ? 'inactive' : 'active';
    try {
      await adminAPI.updateUserStatus(user.id, newStatus);
      setAlertMsg(`Patient account ${user.full_name} is now ${newStatus}.`);
      fetchPatients();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Patient Account Management</h1>
          <p className="text-xs text-gray-500 mt-1">
            Review registered patient profiles, contact details, and manage account authorization status.
          </p>
        </div>
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
            placeholder="Search by patient name or email..."
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

      {/* Patients Table */}
      {loading ? (
        <Loader message="Loading patient database..." />
      ) : patients.length === 0 ? (
        <Card className="py-12">
          <EmptyState
            icon={Users}
            title="No Patients Found"
            description="No patient accounts matched your search."
          />
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface border-b border-gray-100 text-gray-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Registered On</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {patients.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-bold text-gray-900">{p.full_name}</td>
                    <td className="py-3 px-4 text-gray-600">{p.email}</td>
                    <td className="py-3 px-4 text-gray-600">{p.phone || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-400">{p.created_at?.split('T')[0]}</td>
                    <td className="py-3 px-4">
                      <Badge status={p.account_status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant={p.account_status === 'active' ? 'danger' : 'success'}
                        size="sm"
                        onClick={() => handleToggleStatus(p)}
                        className="text-[11px] py-1 px-2.5"
                      >
                        <Power className="w-3 h-3 mr-1" />
                        {p.account_status === 'active' ? 'Deactivate' : 'Activate'}
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

export default PatientManagement;
