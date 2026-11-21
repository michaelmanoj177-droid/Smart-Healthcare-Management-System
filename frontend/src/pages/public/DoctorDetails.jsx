import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Calendar,
  Clock,
  DollarSign,
  GraduationCap,
  Award,
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { doctorsAPI } from '../../api/doctors';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    // Tomorrow by default
    const d = new Date();
    d.setDate(d.getDate() + 1);
    while (d.getDay() === 0 || d.getDay() === 6) {
      d.setDate(d.getDate() + 1);
    }
    return d.toISOString().split('T')[0];
  });
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDoctor();
  }, [id]);

  useEffect(() => {
    if (doctor && selectedDate) {
      fetchSlots();
    }
  }, [doctor, selectedDate]);

  const fetchDoctor = async () => {
    setLoading(true);
    try {
      const res = await doctorsAPI.getDoctorById(id);
      setDoctor(res.data.doctor);
    } catch (err) {
      setError('Doctor profile could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async () => {
    setLoadingSlots(true);
    try {
      const res = await doctorsAPI.getDoctorAvailability(id, selectedDate);
      setSlots(res.data.slots || []);
    } catch (err) {
      console.error('Error fetching slots:', err);
    } finally {
      setLoadingSlots(false);
    }
  };

  if (loading) return <Loader fullScreen message="Loading physician profile..." />;
  if (error || !doctor) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <Alert type="error" message={error || 'Doctor not found'} />
        <Link to="/doctors" className="mt-4 inline-block">
          <Button variant="outline">Back to Doctors</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <Link to="/doctors" className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Doctor Directory
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Doctor Profile Info */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-gray-100">
              <img
                src={doctor.profile_image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80'}
                alt={doctor.name}
                className="w-28 h-28 rounded-2xl object-cover shadow-sm border border-gray-100 shrink-0"
              />
              <div className="space-y-2 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl font-extrabold text-gray-900">{doctor.name}</h1>
                  <Badge status="verified" text="Verified Physician" />
                </div>
                <p className="text-sm font-semibold text-primary">{doctor.specialization} • {doctor.department_name}</p>
                <p className="text-xs text-gray-500 font-medium flex items-center justify-center sm:justify-start gap-1">
                  <GraduationCap className="w-4 h-4 text-gray-400" />
                  {doctor.qualifications}
                </p>
                <p className="text-xs text-gray-400">
                  Reg No: <span className="font-mono text-gray-700">{doctor.professional_registration_number || 'REG-PENDING'}</span>
                </p>
              </div>
            </div>

            {/* Quick Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-6 border-b border-gray-100 text-center">
              <div className="p-3 rounded-xl bg-surface">
                <span className="text-[11px] text-gray-400 block uppercase font-medium">Experience</span>
                <span className="text-base font-bold text-gray-800">{doctor.experience_years} Years</span>
              </div>
              <div className="p-3 rounded-xl bg-surface">
                <span className="text-[11px] text-gray-400 block uppercase font-medium">Consultation Fee</span>
                <span className="text-base font-bold text-primary">${doctor.consultation_fee?.toFixed(2)}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface col-span-2 sm:col-span-1">
                <span className="text-[11px] text-gray-400 block uppercase font-medium">Department</span>
                <span className="text-base font-bold text-teal-700">{doctor.department_name}</span>
              </div>
            </div>

            {/* Biography */}
            <div className="pt-6 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800">Physician Biography</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {doctor.biography || 'Dr. ' + doctor.name + ' is a certified specialist at Apex Medicare dedicated to providing compassionate, evidence-based healthcare. Focused on preventive care, thorough diagnostic evaluations, and patient-tailored treatment plans.'}
              </p>
            </div>
          </Card>
        </div>

        {/* Right Column: Live Slot Preview & Booking */}
        <div className="lg:col-span-5 space-y-6">
          <Card title="Available Appointment Slots" subtitle="Real-time availability schedule" className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Select Consultation Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Slot grid */}
              <div>
                <span className="block text-xs font-semibold text-gray-700 mb-2">
                  Generated Time Slots
                </span>
                {loadingSlots ? (
                  <div className="py-8 text-center text-xs text-gray-400">Loading available slots...</div>
                ) : slots.length === 0 ? (
                  <div className="p-4 rounded-xl bg-amber-50 text-amber-800 text-xs border border-amber-200 text-center">
                    Doctor has no active clinic slots scheduled on this date. Please pick a weekday.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                    {slots.map((slot) => (
                      <button
                        key={slot.start_time}
                        disabled={!slot.available}
                        onClick={() => navigate(`/patient/book-appointment?doctor_id=${doctor.id}&date=${selectedDate}&time=${slot.start_time}`)}
                        className={`py-2 px-1 text-center text-xs font-medium rounded-lg border transition-all ${
                          slot.available
                            ? 'bg-blue-50/70 text-primary border-blue-200 hover:bg-primary hover:text-white cursor-pointer shadow-xs'
                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                        }`}
                        title={slot.available ? 'Click to book slot' : 'Slot already booked'}
                      >
                        {slot.start_time}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100">
                <Link to={`/patient/book-appointment?doctor_id=${doctor.id}&date=${selectedDate}`}>
                  <Button variant="primary" size="md" className="w-full">
                    <Calendar className="w-4 h-4 mr-1.5" /> Book Consultation with {doctor.name}
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetails;
