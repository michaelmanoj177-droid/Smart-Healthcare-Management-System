import React, { useState, useEffect } from 'react';
import { ScrollText, Filter, Calendar, Clock, ShieldCheck, User, RefreshCw } from 'lucide-react';
import { adminAPI } from '../../api/admin';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, resourceFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAuditLogs({
        action: actionFilter,
        resource_type: resourceFilter,
        limit: 100,
      });
      setLogs(res.data.audit_logs || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeColor = (action) => {
    if (action.includes('VERIF') || action.includes('SUCCESS')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (action.includes('CANCEL') || action.includes('REJECT') || action.includes('DEACT')) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (action.includes('LOGIN') || action.includes('REGISTER')) return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-purple-50 text-purple-700 border-purple-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Security & Activity Audit Logs</h1>
          <p className="text-xs text-gray-500 mt-1">
            Complete cryptographic audit trail of user logins, appointment changes, doctor verifications, and clinical actions.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchLogs}>
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh Trail
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-semibold text-gray-600">Action:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-lg border border-gray-200 bg-surface focus:outline-none"
          >
            <option value="">All Actions</option>
            <option value="USER_LOGIN">USER_LOGIN</option>
            <option value="USER_REGISTER">USER_REGISTER</option>
            <option value="APPOINTMENT_BOOK">APPOINTMENT_BOOK</option>
            <option value="APPOINTMENT_STATUS_UPDATE">APPOINTMENT_STATUS_UPDATE</option>
            <option value="DOCTOR_VERIFICATION">DOCTOR_VERIFICATION</option>
            <option value="CREATE_MEDICAL_RECORD">CREATE_MEDICAL_RECORD</option>
            <option value="CREATE_PRESCRIPTION">CREATE_PRESCRIPTION</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-600">Resource:</span>
          <select
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-lg border border-gray-200 bg-surface focus:outline-none"
          >
            <option value="">All Resources</option>
            <option value="user">User</option>
            <option value="appointment">Appointment</option>
            <option value="doctor_profile">Doctor Profile</option>
            <option value="medical_record">Medical Record</option>
            <option value="prescription">Prescription</option>
            <option value="department">Department</option>
          </select>
        </div>
      </Card>

      {/* Logs Table */}
      {loading ? (
        <Loader message="Loading immutable audit logs..." />
      ) : logs.length === 0 ? (
        <Card className="py-12">
          <EmptyState
            icon={ScrollText}
            title="No Audit Entries Found"
            description="No actions matched the current audit filter parameters."
          />
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface border-b border-gray-100 text-gray-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Timestamp (UTC)</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Resource Type</th>
                  <th className="py-3 px-4">Resource ID</th>
                  <th className="py-3 px-4">Metadata Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 text-gray-500 font-mono text-[11px] whitespace-nowrap">
                      {log.timestamp?.replace('T', ' ').substring(0, 19)}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">{log.actor_name || 'System / Guest'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 uppercase text-[10px] font-semibold text-gray-600">
                      {log.resource_type}
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-gray-400">
                      {log.resource_id ? `${String(log.resource_id).substring(0, 10)}...` : '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-gray-500 max-w-xs truncate">
                      {log.metadata ? JSON.stringify(log.metadata) : '{}'}
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

export default AuditLogs;
