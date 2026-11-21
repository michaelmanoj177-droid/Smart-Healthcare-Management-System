import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Pill, Plus, Trash2, Save, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { prescriptionsAPI } from '../../api/prescriptions';
import { appointmentsAPI } from '../../api/appointments';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

const CreatePrescription = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [patientId, setPatientId] = useState(searchParams.get('patient_id') || '');
  const [appointmentId, setAppointmentId] = useState(searchParams.get('appointment_id') || '');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [followUpDate, setFollowUpDate] = useState('');
  const [instructions, setInstructions] = useState('Maintain good hydration, balanced nutrition, and take medications as directed.');

  const [medicines, setMedicines] = useState([
    { name: '', dosage: '500mg', frequency: 'Twice daily', duration: '5 days', instructions: 'Take after meals' },
  ]);

  const [recentAppointments, setRecentAppointments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    appointmentsAPI.getDoctorAppointments().then((res) => {
      setRecentAppointments(res.data.appointments || []);
    }).catch(console.error);
  }, []);

  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      { name: '', dosage: '', frequency: 'Once daily', duration: '7 days', instructions: 'Take after food' },
    ]);
  };

  const handleRemoveMedicine = (index) => {
    if (medicines.length === 1) return;
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId) {
      setError('Patient ID is required.');
      return;
    }

    const invalid = medicines.some((m) => !m.name.trim());
    if (invalid) {
      setError('Every medicine row must have a medication name.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await prescriptionsAPI.createPrescription({
        patient_id: patientId,
        appointment_id: appointmentId || null,
        issue_date: issueDate,
        follow_up_date: followUpDate,
        medicines,
        instructions: instructions.trim(),
      });

      setSuccess('Prescription issued successfully. Patient has been notified.');
      setTimeout(() => navigate('/doctor/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to issue prescription.');
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
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Issue Digital Prescription</h1>
        <p className="text-xs text-gray-500 mt-1">
          Draft licensed electronic prescriptions with dosages, frequencies, and pharmacy dispensing instructions.
        </p>
      </div>

      {success && <Alert type="success" message={success} />}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Quick Select from Recent Consultations */}
      {recentAppointments.length > 0 && !patientId && (
        <Card title="Select Patient Consultation" subtitle="Prefill patient details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-40 overflow-y-auto pr-1">
            {recentAppointments.map((a) => (
              <div
                key={a.id}
                onClick={() => {
                  setPatientId(a.patient_id);
                  setAppointmentId(a.id);
                }}
                className="p-3 rounded-xl border border-gray-200 hover:border-secondary cursor-pointer transition-all bg-surface hover:bg-teal-50/50"
              >
                <p className="text-xs font-bold text-gray-900">{a.patient_name}</p>
                <p className="text-[11px] text-gray-500 truncate">{a.appointment_date} • {a.reason}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="Prescription Header">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Patient ID *</label>
              <input
                type="text"
                required
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="MongoDB Patient User ID"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Issue Date</label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
              />
            </div>
          </div>
        </Card>

        {/* Dynamic Medicines List */}
        <Card
          title="Medication Regimen (℞)"
          subtitle="Add prescribed pharmaceuticals and dosing schedules"
          action={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddMedicine}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Medicine
            </Button>
          }
        >
          <div className="space-y-4">
            {medicines.map((med, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl bg-surface border border-gray-100 space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-800">Item #{index + 1}</span>
                  {medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicine(index)}
                      className="text-gray-400 hover:text-danger text-xs flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Medicine / Chemical Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={med.name}
                      onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                      placeholder="e.g. Amoxicillin, Paracetamol, Atorvastatin"
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Dosage</label>
                    <input
                      type="text"
                      value={med.dosage}
                      onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                      placeholder="e.g. 500mg, 1 Tab"
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-secondary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Frequency</label>
                    <input
                      type="text"
                      value={med.frequency}
                      onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                      placeholder="e.g. Twice daily, Once at bedtime"
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Duration</label>
                    <input
                      type="text"
                      value={med.duration}
                      onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                      placeholder="e.g. 5 days, 30 days"
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Special Instructions</label>
                    <input
                      type="text"
                      value={med.instructions}
                      onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)}
                      placeholder="e.g. Take after food"
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-secondary"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* General instructions & Follow-up */}
        <Card title="General Advice & Follow-Up">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Dietary & Lifestyle Instructions
              </label>
              <textarea
                rows="3"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Hydration advice, physical activity guidance, rest periods..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Recommended Follow-Up Date (Optional)
              </label>
              <input
                type="date"
                value={followUpDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
              />
            </div>
          </div>
        </Card>

        <Button
          type="submit"
          variant="secondary"
          size="lg"
          isLoading={submitting}
          className="w-full shadow-md"
        >
          <Save className="w-4 h-4 mr-1.5" /> Sign & Issue Prescription
        </Button>
      </form>
    </div>
  );
};

export default CreatePrescription;
