import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, User, Stethoscope, Mail, Lock, Phone, FileCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { doctorsAPI } from '../../api/doctors';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('patient'); // 'patient' or 'doctor'
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form fields
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    // Patient specific
    date_of_birth: '',
    gender: 'Other',
    emergency_contact: '',
    allergies: '',
    blood_group: 'O+',
    // Doctor specific
    specialization: 'General Medicine',
    qualifications: 'MBBS',
    experience_years: 5,
    professional_registration_number: '',
    department_id: '',
    consultation_fee: 75,
    biography: '',
  });

  useEffect(() => {
    doctorsAPI.getDepartments().then(res => {
      const depts = res.data.departments || [];
      setDepartments(depts);
      if (depts.length > 0) {
        setFormData(prev => ({ ...prev, department_id: depts[0].id }));
      }
    }).catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (role === 'doctor' && !formData.professional_registration_number.trim()) {
      setError('Professional medical registration number is required for verification.');
      return;
    }

    setLoading(true);
    try {
      const payload = { ...formData, role };
      const res = await register(payload);
      if (role === 'doctor') {
        setSuccessMsg('Your doctor application has been submitted successfully! It is currently pending administrator verification.');
      } else {
        setSuccessMsg('Patient account created successfully! Redirecting to your dashboard...');
        setTimeout(() => navigate('/patient/dashboard'), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full bg-white p-8 sm:p-10 rounded-3xl border border-gray-100 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white mx-auto shadow-md">
            <Activity className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Create an Account
          </h2>
          <p className="text-xs text-gray-500">
            Join Apex Medicare as a patient or submit credentials as a medical physician
          </p>
        </div>

        {/* Role Toggle Tabs */}
        <div className="grid grid-cols-2 p-1 bg-surface rounded-2xl border border-gray-200">
          <button
            type="button"
            onClick={() => setRole('patient')}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              role === 'patient'
                ? 'bg-white text-primary shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <User className="w-4 h-4" /> Patient Registration
          </button>
          <button
            type="button"
            onClick={() => setRole('doctor')}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              role === 'doctor'
                ? 'bg-white text-secondary shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Stethoscope className="w-4 h-4" /> Doctor Registration
          </button>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {successMsg && <Alert type="success" message={successMsg} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Common info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                placeholder={role === 'doctor' ? 'Dr. Jane Smith' : 'Jane Smith'}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Password (6+ chars)</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirm_password"
              required
              value={formData.confirm_password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Role-specific section */}
          {role === 'patient' ? (
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-4">
              <span className="text-xs font-bold text-primary block">Patient Health Profile</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Blood Group</label>
                  <select
                    name="blood_group"
                    value={formData.blood_group}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Known Allergies</label>
                <input
                  type="text"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  placeholder="e.g. Penicillin, Peanuts, None"
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                />
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-800">Doctor Credentials & Licensing</span>
                <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-semibold">
                  Requires Admin Verification
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    required
                    value={formData.specialization}
                    onChange={handleChange}
                    placeholder="e.g. Cardiology"
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Qualifications</label>
                  <input
                    type="text"
                    name="qualifications"
                    required
                    value={formData.qualifications}
                    onChange={handleChange}
                    placeholder="e.g. MBBS, MD (Cardio)"
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    min="1"
                    name="experience_years"
                    value={formData.experience_years}
                    onChange={handleChange}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Consultation Fee ($)</label>
                  <input
                    type="number"
                    min="0"
                    name="consultation_fee"
                    value={formData.consultation_fee}
                    onChange={handleChange}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Professional Registration Number *
                </label>
                <input
                  type="text"
                  name="professional_registration_number"
                  required
                  value={formData.professional_registration_number}
                  onChange={handleChange}
                  placeholder="e.g. MED-REG-12345"
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Biography / Summary</label>
                <textarea
                  rows="2"
                  name="biography"
                  value={formData.biography}
                  onChange={handleChange}
                  placeholder="Brief clinical overview and areas of medical practice..."
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            variant={role === 'doctor' ? 'secondary' : 'primary'}
            size="lg"
            isLoading={loading}
            className="w-full shadow-md"
          >
            {role === 'doctor' ? 'Submit Doctor Application' : 'Complete Patient Registration'}
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
