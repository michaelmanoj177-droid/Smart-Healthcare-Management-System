import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, Mail, Lock, LogIn, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchParams = new URLSearchParams(location.search);
  const isExpired = searchParams.get('expired') === 'true';

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const autofillDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@healthcare.com');
      setPassword('Password123!');
    } else if (role === 'doctor') {
      setEmail('arun.doctor@example.com');
      setPassword('Password123!');
    } else if (role === 'patient') {
      setEmail('rahul.patient@example.com');
      setPassword('Password123!');
    }
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-gray-100 shadow-xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white mx-auto shadow-md">
            <Activity className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Sign In to Apex Medicare
          </h2>
          <p className="text-xs text-gray-500">
            Access your patient portal, doctor clinic workspace, or administration dashboard
          </p>
        </div>

        {isExpired && (
          <Alert type="warning" message="Your session has expired. Please sign in again." />
        )}

        {error && (
          <Alert type="error" message={error} onClose={() => setError('')} />
        )}

        {/* Demo Credentials Quick-Filler */}
        <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-2">
          <span className="text-[11px] font-bold text-primary uppercase tracking-wider block text-center">
            ⚡ Quick Demo Logins (1-Click Fill)
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => autofillDemo('admin')}
              className="py-1.5 px-2 bg-white rounded-lg text-xs font-semibold text-gray-700 hover:text-primary hover:border-primary border border-gray-200 transition-all shadow-xs"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => autofillDemo('doctor')}
              className="py-1.5 px-2 bg-white rounded-lg text-xs font-semibold text-gray-700 hover:text-teal-700 hover:border-teal-500 border border-gray-200 transition-all shadow-xs"
            >
              🩺 Doctor
            </button>
            <button
              type="button"
              onClick={() => autofillDemo('patient')}
              className="py-1.5 px-2 bg-white rounded-lg text-xs font-semibold text-gray-700 hover:text-blue-700 hover:border-blue-500 border border-gray-200 transition-all shadow-xs"
            >
              🧑 Patient
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            className="w-full shadow-md mt-2"
          >
            <LogIn className="w-4 h-4 mr-1.5" /> Sign In
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
