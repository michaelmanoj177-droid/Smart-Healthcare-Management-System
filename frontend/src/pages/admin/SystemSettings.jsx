import React, { useState, useEffect } from 'react';
import { Settings, Save, ShieldAlert, Building2, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { adminAPI } from '../../api/admin';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    hospital_name: 'Apex Medicare Center',
    support_email: 'support@smarthealthcare.com',
    support_phone: '+1 (800) 555-CARE',
    max_booking_days_ahead: 30,
    maintenance_mode: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getSettings();
      if (res.data.settings) {
        setSettings(res.data.settings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      await adminAPI.updateSettings(settings);
      setSuccess('System configuration parameters saved.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update system settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader message="Loading hospital settings..." />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">System Configuration</h1>
        <p className="text-xs text-gray-500 mt-1">
          Configure facility information, operational booking limits, and global system maintenance status.
        </p>
      </div>

      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSave} className="space-y-6">
        <Card title="Facility Identity & Contacts">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Hospital / Clinic Name
              </label>
              <input
                type="text"
                required
                value={settings.hospital_name}
                onChange={(e) => setSettings({ ...settings, hospital_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Support Email Address
                </label>
                <input
                  type="email"
                  required
                  value={settings.support_email}
                  onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Support Phone / Hotline
                </label>
                <input
                  type="text"
                  required
                  value={settings.support_phone}
                  onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card title="Appointment Scheduling Rules">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Maximum Booking Advance Horizon (Days)
            </label>
            <input
              type="number"
              min="1"
              max="180"
              value={settings.max_booking_days_ahead}
              onChange={(e) => setSettings({ ...settings, max_booking_days_ahead: Number(e.target.value) })}
              className="w-full sm:w-48 px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Limits how many days in advance patients are allowed to schedule consultations.
            </p>
          </div>
        </Card>

        <Card title="Maintenance Control">
          <div className="flex items-center justify-between p-4 rounded-xl bg-surface border border-gray-100">
            <div>
              <h4 className="text-sm font-bold text-gray-900">System Maintenance Mode</h4>
              <p className="text-xs text-gray-500">Temporarily restrict routine booking actions for platform upgrades.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenance_mode}
                onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </Card>

        <Button type="submit" variant="primary" size="lg" isLoading={saving} className="shadow-md">
          <Save className="w-4 h-4 mr-1.5" /> Save Application Settings
        </Button>
      </form>
    </div>
  );
};

export default SystemSettings;
