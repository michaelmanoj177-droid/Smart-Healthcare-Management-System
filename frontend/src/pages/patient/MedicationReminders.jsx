import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  PhoneCall,
  Calendar,
  Pill,
  ShieldAlert,
  ArrowRight,
  Filter,
  Check
} from 'lucide-react';
import { medicationsAPI } from '../../api/medications';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';

const MedicationReminders = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [doses, setDoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'upcoming', 'completed', 'missed'
  const [alertInfo, setAlertInfo] = useState(null);

  // Doctor Contact Modal
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schedRes, doseRes] = await Promise.all([
        medicationsAPI.getSchedules(),
        medicationsAPI.getDoses({ limit: 50 }),
      ]);
      setSchedules(schedRes.data.schedules || []);
      setDoses(doseRes.data.doses || []);
    } catch (err) {
      console.error('Error fetching reminder data:', err);
      setAlertInfo({ type: 'error', message: 'Failed to load medication reminders and dose logs.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogDose = async (scheduleId, medicineName, status, defaultTime = 'Now') => {
    setActionLoading(true);
    try {
      const res = await medicationsAPI.logDose({
        schedule_id: scheduleId,
        medicine_name: medicineName,
        status: status,
        dose_time: defaultTime === 'Now' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : defaultTime,
        notes: status === 'skipped' ? 'Patient marked as skipped' : 'Taken on schedule',
      });

      setAlertInfo({
        type: status === 'taken' ? 'success' : 'warning',
        message:
          status === 'taken'
            ? `Recorded dose taken for ${medicineName}. Good job staying on track!`
            : `Recorded skipped dose. ${res.data.safety_warning || 'Do not take extra doses.'}`,
      });

      fetchData();
    } catch (err) {
      console.error('Error logging dose:', err);
      setAlertInfo({ type: 'error', message: err.response?.data?.message || 'Error updating dose status.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleContactDoctor = (sched) => {
    setSelectedDoctor({
      name: sched.prescribing_doctor || 'Attending Physician',
      medicine: sched.medicine_name,
      dose: sched.dose,
    });
    setContactModalOpen(true);
  };

  // Build upcoming, completed, and missed lists from schedules and doses
  const completedDoses = doses.filter((d) => d.status === 'taken');
  const missedDoses = doses.filter((d) => d.status === 'missed' || d.status === 'skipped');
  const upcomingSchedules = schedules.filter((s) => s.status === 'active');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Medication Reminders & Dose Logs
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Stay on track with upcoming alerts, record taken doses, and review missed dose protocols.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/patient/my-medications')}
            className="text-xs"
          >
            Manage Regimens
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/patient/medication-schedule')}
            className="text-xs"
          >
            Daily Schedule
          </Button>
        </div>
      </div>

      {alertInfo && (
        <Alert
          type={alertInfo.type}
          message={alertInfo.message}
          onClose={() => setAlertInfo(null)}
        />
      )}

      {/* STRICT CLINICAL SAFETY CALLOUT FOR MISSED DOSES */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-300 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-950">
          <h4 className="font-bold text-amber-900 mb-0.5">Critical Missed-Dose Safety Protocol:</h4>
          <p>
            If you miss a dose, take it as soon as you remember. However, if it is almost time for your
            next scheduled dose, <strong>skip the missed dose and resume your regular schedule. NEVER
            take a double or extra dose</strong> to make up for a missed dose.
          </p>
        </div>
      </div>

      {/* Overview Stat Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-blue-50/40 border-blue-100">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Active Regimens
          </span>
          <h3 className="text-2xl font-black text-gray-900 mt-1">{upcomingSchedules.length}</h3>
          <span className="text-[11px] text-primary font-medium">Daily reminders active</span>
        </Card>

        <Card className="p-4 bg-emerald-50/40 border-emerald-100">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Doses Taken
          </span>
          <h3 className="text-2xl font-black text-emerald-700 mt-1">{completedDoses.length}</h3>
          <span className="text-[11px] text-emerald-600 font-medium">Recorded compliant</span>
        </Card>

        <Card className="p-4 bg-amber-50/40 border-amber-100">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Missed / Skipped
          </span>
          <h3 className="text-2xl font-black text-amber-700 mt-1">{missedDoses.length}</h3>
          <span className="text-[11px] text-amber-600 font-medium">Logged exceptions</span>
        </Card>

        <Card className="p-4 bg-purple-50/40 border-purple-100">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Adherence Score
          </span>
          <h3 className="text-2xl font-black text-purple-900 mt-1">
            {completedDoses.length + missedDoses.length > 0
              ? Math.round(
                  (completedDoses.length / (completedDoses.length + missedDoses.length)) * 100
                )
              : 100}
            %
          </h3>
          <span className="text-[11px] text-purple-700 font-medium">Historical compliance</span>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 text-xs pb-2 font-semibold">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'all' ? 'bg-primary text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          All Regimens ({upcomingSchedules.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'completed'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Completed Logs ({completedDoses.length})
        </button>
        <button
          onClick={() => setActiveTab('missed')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'missed'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Missed / Skipped ({missedDoses.length})
        </button>
      </div>

      {/* Tab Contents */}
      {loading ? (
        <Loader message="Loading reminders and dose logs..." />
      ) : activeTab === 'all' ? (
        /* Upcoming / Active Schedules */
        <div className="space-y-3">
          {upcomingSchedules.length === 0 ? (
            <Card className="py-12">
              <EmptyState
                icon={Bell}
                title="No Reminders Set"
                description="Add medications to your regimen to receive configurable alerts."
              />
            </Card>
          ) : (
            upcomingSchedules.map((sched) => (
              <Card
                key={sched.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-blue-200 transition-all"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-gray-900">{sched.medicine_name}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-primary">
                        {sched.dose}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-0.5">
                      Frequency: <strong className="text-gray-700">{sched.frequency}</strong> •
                      Slots:{' '}
                      <span className="capitalize font-medium text-teal-700">
                        {sched.timing_slots?.join(', ') || 'Morning'}
                      </span>
                    </p>

                    {sched.instructions && (
                      <p className="text-[11px] text-gray-600 mt-1 italic">
                        "{sched.instructions}"
                      </p>
                    )}

                    <p className="text-[10px] text-gray-400 mt-1">
                      Doctor: {sched.prescribing_doctor || 'Verified Physician'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleContactDoctor(sched)}
                    className="text-xs text-gray-600 flex items-center gap-1.5"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Contact Doctor</span>
                  </Button>

                  <Button
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleLogDose(sched.id, sched.medicine_name, 'skipped')}
                    className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                    Skip
                  </Button>

                  <Button
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleLogDose(sched.id, sched.medicine_name, 'taken')}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Take Dose
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : activeTab === 'completed' ? (
        /* Completed Logs */
        <div className="space-y-3">
          {completedDoses.length === 0 ? (
            <Card className="py-12">
              <EmptyState
                icon={CheckCircle2}
                title="No Completed Dose Logs Yet"
                description="When you mark doses as taken, your compliance records appear here."
              />
            </Card>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-surface text-gray-600 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Medicine</th>
                    <th className="py-3 px-4">Logged Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {completedDoses.map((dose) => (
                    <tr key={dose.id} className="hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-bold text-gray-900">{dose.medicine_name}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {dose.date} • {dose.dose_time}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Taken
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 italic">{dose.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Missed or Skipped Logs */
        <div className="space-y-3">
          {missedDoses.length === 0 ? (
            <Card className="py-12">
              <EmptyState
                icon={CheckCircle2}
                title="No Missed Doses"
                description="Excellent! You have 100% adherence on your logged doses."
              />
            </Card>
          ) : (
            <div className="space-y-3">
              {missedDoses.map((dose) => (
                <Card key={dose.id} className="p-4 border-amber-200 bg-amber-50/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <h4 className="text-xs font-bold text-gray-900">{dose.medicine_name}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                        {dose.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-500">
                      {dose.date} at {dose.dose_time}
                    </span>
                  </div>

                  <p className="text-xs text-amber-900">
                    <strong>Medical Rule:</strong> Do not double up on your next dose. Resume your
                    next scheduled dose at its normal time.
                  </p>

                  <div className="pt-2 flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleContactDoctor({
                          prescribing_doctor: 'Physician',
                          medicine_name: dose.medicine_name,
                          dose: 'Prescribed dose',
                        })
                      }
                      className="text-xs"
                    >
                      <PhoneCall className="w-3.5 h-3.5 mr-1" /> Consult Physician Regarding Missed Dose
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Contact Doctor Modal */}
      <Modal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        title="Contact Prescribing Healthcare Provider"
      >
        <div className="space-y-4">
          <p className="text-xs text-gray-600">
            For questions regarding missed doses, adverse effects, or dosage adjustments for{' '}
            <strong>{selectedDoctor?.medicine}</strong>, please contact your doctor or book a follow-up.
          </p>

          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-2 text-xs">
            <p className="font-bold text-gray-900">Physician: {selectedDoctor?.name}</p>
            <p className="text-gray-600">Hospital Clinic: Apex Medicare Central Health Facility</p>
            <p className="text-gray-600">Emergency / Triage Hotline: +1 (800) 555-0199</p>
            <p className="text-gray-600">Clinical Desk Hours: 8:00 AM – 8:00 PM</p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button variant="outline" onClick={() => setContactModalOpen(false)}>
              Close
            </Button>
            <Button onClick={() => navigate('/patient/book-appointment')}>
              Book Consultation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MedicationReminders;
