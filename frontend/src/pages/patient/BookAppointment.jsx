import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  DollarSign
} from 'lucide-react';
import { doctorsAPI } from '../../api/doctors';
import { appointmentsAPI } from '../../api/appointments';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';

const BookAppointment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(searchParams.get('doctor_id') || '');
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(searchParams.get('time') || '');
  const [reason, setReason] = useState('Routine consultation and health checkup');
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctorId && selectedDate) {
      fetchSlots();
    }
  }, [selectedDoctorId, selectedDate]);

  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const res = await doctorsAPI.getDoctors({ limit: 50 });
      const docs = res.data.doctors || [];
      setDoctors(docs);
      if (!selectedDoctorId && docs.length > 0) {
        setSelectedDoctorId(docs[0].id);
      }
    } catch (err) {
      setError('Failed to load verified doctors list.');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchSlots = async () => {
    setLoadingSlots(true);
    setError('');
    setSelectedSlot('');
    try {
      const res = await doctorsAPI.getDoctorAvailability(selectedDoctorId, selectedDate);
      setSlots(res.data.slots || []);
      const paramTime = searchParams.get('time');
      if (paramTime) {
        setSelectedSlot(paramTime);
      }
    } catch (err) {
      console.error('Error loading slots:', err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      setError('Please select a doctor.');
      return;
    }
    if (!selectedDate) {
      setError('Please select an appointment date.');
      return;
    }
    if (!selectedSlot) {
      setError('Please select an available time slot.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const slotObj = slots.find((s) => s.start_time === selectedSlot);
      const res = await appointmentsAPI.bookAppointment({
        doctor_id: selectedDoctorId,
        appointment_date: selectedDate,
        start_time: selectedSlot,
        end_time: slotObj?.end_time || selectedSlot,
        reason: reason.trim(),
      });
      setConfirmation(res.data.appointment);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment. Time slot may have been taken.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  // If confirmed, render Confirmation View (Step 8)
  if (confirmation) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Card className="p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-success flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-success uppercase tracking-wider">Booking Successful</span>
            <h2 className="text-2xl font-extrabold text-gray-900">Appointment Request Confirmed</h2>
            <p className="text-xs text-gray-500">
              Your consultation request has been lodged and sent directly to the physician's schedule.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-gray-100 text-left space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Appointment ID:</span>
              <span className="font-mono font-semibold text-gray-800">{confirmation.id}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Consulting Physician:</span>
              <span className="font-bold text-gray-900">{confirmation.doctor_name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Specialization:</span>
              <span className="text-primary font-semibold">{confirmation.doctor_specialization}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Date & Time:</span>
              <span className="font-bold text-gray-800">
                {confirmation.appointment_date} at {confirmation.start_time}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Reason:</span>
              <span className="text-gray-700">{confirmation.reason}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Status:</span>
              <span className="text-amber-700 font-bold uppercase">{confirmation.status}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link to="/patient/appointments" className="flex-1">
              <Button variant="primary" size="md" className="w-full">
                View My Appointments
              </Button>
            </Link>
            <Link to="/patient/dashboard" className="flex-1">
              <Button variant="outline" size="md" className="w-full">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Book an Appointment</h1>
        <p className="text-xs text-gray-500 mt-1">
          Select a verified physician, select your preferred date, and choose an available clinic time slot.
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <form onSubmit={handleBooking} className="space-y-6">
        {/* Step 1: Select Doctor */}
        <Card title="1. Select Consulting Physician" subtitle="Verified specialists only">
          {loadingDoctors ? (
            <Loader message="Loading doctors..." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {doctors.map((doc) => {
                const isSelected = selectedDoctorId === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoctorId(doc.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'border-primary bg-blue-50/70 shadow-xs ring-2 ring-primary/20'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={doc.profile_image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80'}
                      alt={doc.name}
                      className="w-11 h-11 rounded-xl object-cover bg-gray-100 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-gray-900 truncate">{doc.name}</p>
                      <p className="text-[11px] text-primary font-medium truncate">{doc.specialization}</p>
                      <p className="text-[10px] text-gray-500">${doc.consultation_fee?.toFixed(2)} Fee</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Step 2 & 3: Date & Slots */}
        <Card title="2. Select Date & Time Slot" subtitle="Live schedule computed from doctor availability">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-5 space-y-2">
              <label className="block text-xs font-semibold text-gray-700">
                Consultation Date
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <p className="text-[11px] text-gray-400">
                Physicians are typically available Monday through Friday.
              </p>
            </div>

            <div className="md:col-span-7 space-y-2">
              <label className="block text-xs font-semibold text-gray-700">
                Available Time Slots ({selectedDate})
              </label>
              {loadingSlots ? (
                <div className="py-6 text-center text-xs text-gray-400">Loading schedule...</div>
              ) : slots.length === 0 ? (
                <div className="p-4 rounded-xl bg-amber-50 text-amber-800 text-xs border border-amber-200">
                  Doctor is not available on this date. Please pick a weekday or another physician.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                  {slots.map((slot) => {
                    const isSelected = selectedSlot === slot.start_time;
                    return (
                      <button
                        key={slot.start_time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setSelectedSlot(slot.start_time)}
                        className={`py-2 px-1 text-center text-xs font-semibold rounded-lg border transition-all ${
                          !slot.available
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-primary text-white border-primary shadow-xs'
                            : 'bg-surface text-gray-700 border-gray-200 hover:border-primary/50'
                        }`}
                      >
                        {slot.start_time}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Step 4: Reason & Submit */}
        <Card title="3. Reason for Consultation & Confirmation">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Reason for Consultation / Current Symptoms
              </label>
              <textarea
                rows="3"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe your health concern, symptoms, or routine checkup purpose..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {selectedDoctor && selectedSlot && (
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-gray-500">Summary: </span>
                  <span className="font-bold text-gray-900">{selectedDoctor.name}</span> on{' '}
                  <span className="font-bold text-gray-900">{selectedDate}</span> at{' '}
                  <span className="font-bold text-primary">{selectedSlot}</span>
                </div>
                <span className="font-bold text-gray-800">${selectedDoctor.consultation_fee?.toFixed(2)}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={!selectedDoctorId || !selectedDate || !selectedSlot}
              isLoading={submitting}
              className="w-full shadow-md"
            >
              <Calendar className="w-4 h-4 mr-1.5" /> Confirm & Book Consultation
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default BookAppointment;
