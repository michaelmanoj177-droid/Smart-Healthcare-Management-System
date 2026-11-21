import React, { useState } from 'react';
import { User, Stethoscope, DollarSign, Award, Save, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/auth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Alert from '../../components/common/Alert';

const DoctorProfile = () => {
  const { user, profile, refreshProfile } = useAuth();

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    specialization: profile?.specialization || 'General Medicine',
    qualifications: profile?.qualifications || 'MBBS',
    experience_years: profile?.experience_years || 5,
    consultation_fee: profile?.consultation_fee || 75,
    biography: profile?.biography || '',
    profile_image: profile?.profile_image || '',
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      await authAPI.updateProfile(formData);
      await refreshProfile();
      setSuccess('Doctor profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Physician Profile</h1>
        <p className="text-xs text-gray-500 mt-1">
          Update your public profile, clinical summary, fees, and contact details displayed in the doctor directory.
        </p>
      </div>

      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="Professional Credentials" subtitle="Verified medical identity">
          <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
            <img
              src={formData.profile_image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80'}
              alt="Doctor Avatar"
              className="w-16 h-16 rounded-2xl object-cover border border-gray-200"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900">{user?.full_name}</h3>
                <Badge status={profile?.verification_status || 'verified'} />
              </div>
              <p className="text-xs text-gray-500 font-mono">
                Reg #{profile?.professional_registration_number || 'VERIFIED-CLINICIAN'}
              </p>
              <p className="text-xs text-teal-700 font-semibold">{profile?.department_name} Department</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Clinical Specialization</label>
              <input
                type="text"
                required
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Board Qualifications</label>
              <input
                type="text"
                required
                value={formData.qualifications}
                onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Experience (Years)</label>
              <input
                type="number"
                min="0"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Consultation Fee ($)</label>
              <input
                type="number"
                min="0"
                step="5"
                value={formData.consultation_fee}
                onChange={(e) => setFormData({ ...formData, consultation_fee: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary font-bold text-gray-900"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Profile Avatar Image URL</label>
            <input
              type="url"
              value={formData.profile_image}
              onChange={(e) => setFormData({ ...formData, profile_image: e.target.value })}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
            />
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Physician Biography</label>
            <textarea
              rows="4"
              value={formData.biography}
              onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
              placeholder="Clinical experience, background, special interests..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
            />
          </div>
        </Card>

        <Button type="submit" variant="secondary" size="lg" isLoading={saving} className="shadow-md">
          <Save className="w-4 h-4 mr-1.5" /> Save Profile Information
        </Button>
      </form>
    </div>
  );
};

export default DoctorProfile;
