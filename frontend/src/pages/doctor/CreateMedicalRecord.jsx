import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { FileText, Save, CheckCircle2, User, Stethoscope, ArrowLeft, AlertCircle } from 'lucide-react';
import { recordsAPI } from '../../api/records';
import { appointmentsAPI } from '../../api/appointments';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

const CreateMedicalRecord = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [patientId, setPatientId] = useState(searchParams.get('patient_id') || '');
  const [appointmentId, setAppointmentId] = useState(searchParams.get('appointment_id') || '');
  const [consultationDate, setConsultationDate] = useState(new Date().toISOString().split('T')[0]);
  const [symptoms, setSymptoms] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [allergies, setAllergies] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    appointmentsAPI.getDoctorAppointments().then((res) => {
      setRecentAppointments(res.data.appointments || []);
    }).catch(console.error);
  }, []);

  const handleSelectAppt = (appt) => {
    setPatientId(appt.patient_id);
    setAppointmentId(appt.id);
    setSymptoms(appt.reason || '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId) {
      setError('Patient ID is required. Please select an appointment or patient.');
      return;
    }
    if (!diagnosis.trim()) {
      setError('A clinical diagnosis is required.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await recordsAPI.createRecord({
        patient_id: patientId,
        appointment_id: appointmentId || null,
        consultation_date: consultationDate,
        symptoms: symptoms.trim(),
        clinical_notes: clinicalNotes.trim(),
        diagnosis: diagnosis.trim(),
        allergies: allergies.trim(),
        follow_up_date: followUpDate,
      });

      setSuccess('Medical record recorded and stored securely. Patient notified.');
      setTimeout(() => navigate('/doctor/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create medical record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/doctor/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Doctor Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Create Medical Record</h1>
        <p className="text-xs text-gray-500 mt-1">
          Document patient symptoms, clinical observations, confirmed diagnoses, and treatment plans.
        </p>
      </div>

      {success && <Alert type="success" message={success} />}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Quick Select from Recent Consultations */}
      {recentAppointments.length > 0 && !patientId && (
        <Card title="Select Patient Consultation" subtitle="Click to prefill clinical record">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
            {recentAppointments.map((a) => (
              <div
                key={a.id}
                onClick={() => handleSelectAppt(a)}
                className="p-3 rounded-xl border border-gray-200 hover:border-primary cursor-pointer transition-all bg-surface hover:bg-blue-50/50"
              >
                <p className="text-xs font-bold text-gray-900">{a.patient_name}</p>
                <p className="text-[11px] text-gray-500 truncate">{a.appointment_date} • {a.reason}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="Consultation Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Patient User ID *
              </label>
              <input
                type="text"
                required
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="MongoDB Patient User ID"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Consultation Date
              </label>
              <input
                type="date"
                required
                value={consultationDate}
                onChange={(e) => setConsultationDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </Card>

        <Card title="Clinical Findings & Observations">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Clinical Diagnosis *
              </label>
              <input
                type="text"
                required
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Mild Hypertension, Acute Rhinitis, Contact Dermatitis"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Symptoms Reported by Patient
              </label>
              <textarea
                rows="3"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Chief complaints, onset of symptoms, severity, and duration..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Clinical Notes & Observations
              </label>
              <textarea
                rows="4"
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="Physical examination notes, vital signs, diagnostic test recommendations..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Documented Allergies / Contraindications
                </label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. None known, Penicillin"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Follow-Up Review Date (Optional)
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>
        </Card>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={submitting}
          className="w-full shadow-md"
        >
          <Save className="w-4 h-4 mr-1.5" /> Save Electronic Medical Record
        </Button>
      </form>
    </div>
  );
};

export default CreateMedicalRecord;
