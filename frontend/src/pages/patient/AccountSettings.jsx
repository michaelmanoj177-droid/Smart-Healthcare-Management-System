import React, { useState } from 'react';
import { Lock, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { authAPI } from '../../api/auth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

const AccountSettings = () => {
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (passwords.new_password !== passwords.confirm_password) {
      setError('New passwords do not match.');
      return;
    }

    if (passwords.new_password.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await authAPI.changePassword(passwords);
      setSuccess('Password updated successfully.');
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Account Security</h1>
        <p className="text-xs text-gray-500 mt-1">
          Manage your credentials, password security, and account preferences.
        </p>
      </div>

      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <Card title="Update Password" subtitle="Ensure your account uses a secure password">
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              name="current_password"
              required
              value={passwords.current_password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">New Password (6+ chars)</label>
              <input
                type="password"
                name="new_password"
                required
                value={passwords.new_password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                name="confirm_password"
                required
                value={passwords.confirm_password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" size="md" isLoading={loading}>
            <Lock className="w-4 h-4 mr-1.5" /> Change Password
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AccountSettings;
