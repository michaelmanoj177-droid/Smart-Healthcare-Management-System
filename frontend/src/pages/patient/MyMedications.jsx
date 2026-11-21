import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pill,
  Plus,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle,
  FileText,
  Trash2,
  Bell,
  BellOff,
  Activity,
  ShieldCheck,
  DownloadCloud,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { medicationsAPI } from '../../api/medications';
import { prescriptionsAPI } from '../../api/prescriptions';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';

const MyMedications = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingRx, setLoadingRx] = useState(false);

  // Add Schedule Form State
  const [newSchedule, setNewSchedule] = useState({
    medicine_name: '',
    dose: '',
    frequency: 'Once Daily',
    timing_slots: ['morning'],
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    instructions: 'Take with full glass of water after food',
    remind_enabled: true,
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await medicationsAPI.getSchedules();
      setSchedules(res.data.schedules || []);
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setAlertInfo({ type: 'error', message: 'Failed to fetch medication schedules.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenImportModal = async () => {
    setImportModalOpen(true);
    setLoadingRx(true);
    try {
      const res = await prescriptionsAPI.getMyPrescriptions();
      setPrescriptions(res.data.prescriptions || []);
    } catch (err) {
      console.error('Error loading prescriptions:', err);
    } finally {
      setLoadingRx(false);
    }
  };

  const handleImportPrescription = async (prescriptionId) => {
    setActionLoading(true);
    try {
      const res = await medicationsAPI.importFromPrescription(prescriptionId);
      setAlertInfo({
        type: 'success',
        message: res.data.message || 'Prescription medications imported successfully into your active schedules!',
      });
      setImportModalOpen(false);
      fetchSchedules();
    } catch (err) {
      console.error('Import error:', err);
      setAlertInfo({
        type: 'error',
        message: err.response?.data?.message || 'Failed to import prescription medications.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    if (!newSchedule.medicine_name || !newSchedule.dose) {
      alert('Please provide medicine name and dose.');
      return;
    }
    setActionLoading(true);
    try {
      await medicationsAPI.createSchedule(newSchedule);
      setAlertInfo({ type: 'success', message: 'Medication schedule recorded successfully.' });
      setAddModalOpen(false);
      setNewSchedule({
        medicine_name: '',
        dose: '',
        frequency: 'Once Daily',
        timing_slots: ['morning'],
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        instructions: 'Take with full glass of water after food',
        remind_enabled: true,
      });
      fetchSchedules();
    } catch (err) {
      console.error('Error creating schedule:', err);
      setAlertInfo({
        type: 'error',
        message: err.response?.data?.message || 'Failed to save medication schedule.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleReminder = async (sched) => {
    try {
      await medicationsAPI.updateSchedule(sched.id, {
        remind_enabled: !sched.remind_enabled,
      });
      fetchSchedules();
    } catch (err) {
      console.error('Error toggling reminder:', err);
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('Are you sure you want to remove this medication schedule?')) return;
    try {
      await medicationsAPI.deleteSchedule(id);
      setAlertInfo({ type: 'info', message: 'Schedule removed.' });
      fetchSchedules();
    } catch (err) {
      console.error('Error deleting schedule:', err);
    }
  };

  const toggleTimingSlot = (slot) => {
    const current = newSchedule.timing_slots;
    if (current.includes(slot)) {
      if (current.length > 1) {
        setNewSchedule({ ...newSchedule, timing_slots: current.filter((s) => s !== slot) });
      }
    } else {
      setNewSchedule({ ...newSchedule, timing_slots: [...current, slot] });
    }
  };

  // Calculate adherence aggregate
  const activeSchedules = schedules.filter((s) => s.status === 'active');
  const adherenceAvg =
    activeSchedules.length > 0
      ? Math.round(
          activeSchedules.reduce((acc, curr) => acc + (curr.adherence_rate || 100), 0) /
            activeSchedules.length
        )
      : 100;

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">My Medications</h1>
          <p className="text-xs text-gray-500 mt-1">
            Track your doctor-approved medication regimens, schedule details, and adherence performance.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            onClick={handleOpenImportModal}
            className="flex items-center gap-2 text-xs"
          >
            <DownloadCloud className="w-4 h-4 text-primary" />
            <span>Import from Prescription</span>
          </Button>

          <Button
            onClick={() => setAddModalOpen(true)}
            className="bg-primary hover:bg-blue-700 text-white flex items-center gap-2 text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medication</span>
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

      {/* Adherence & Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4 bg-gradient-to-br from-blue-50/50 to-white">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-primary flex items-center justify-center shrink-0">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Regimens</p>
            <h3 className="text-2xl font-black text-gray-900">{activeSchedules.length}</h3>
            <p className="text-[11px] text-gray-500">Prescribed medications</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-gradient-to-br from-teal-50/50 to-white">
          <div className="w-12 h-12 rounded-xl bg-teal-100 text-secondary flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Overall Adherence</p>
            <h3 className="text-2xl font-black text-gray-900">{adherenceAvg}%</h3>
            <p className="text-[11px] text-teal-700 font-medium">Compliance rate (30 days)</p>
          </div>
        </Card>

        <Card
          className="p-4 flex items-center justify-between bg-gradient-to-br from-purple-50/50 to-white cursor-pointer hover:border-purple-200 transition-all"
          onClick={() => navigate('/patient/medication-safety')}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Safety Screening</p>
              <h3 className="text-sm font-bold text-gray-900">Safety Checker</h3>
              <p className="text-[11px] text-purple-700 font-medium">Screen interactions & allergies</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </Card>
      </div>

      {/* Medication List */}
      {loading ? (
        <Loader message="Loading your medications..." />
      ) : schedules.length === 0 ? (
        <Card className="py-12">
          <EmptyState
            icon={Pill}
            title="No Medications Registered"
            description="You do not have any active medication regimens recorded. You can add one or import from your doctor's digital prescription."
            action={
              <div className="flex gap-2">
                <Button size="sm" onClick={handleOpenImportModal}>
                  Import Prescription
                </Button>
                <Button size="sm" variant="outline" onClick={() => setAddModalOpen(true)}>
                  Add Manually
                </Button>
              </div>
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Current Medication Regimens ({schedules.length})
            </h3>
            <span className="text-xs text-gray-500">
              Prescribed doses are locked to doctor's orders
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedules.map((item) => (
              <Card
                key={item.id}
                className="p-5 border-gray-100 hover:border-blue-200 transition-all space-y-4 relative"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center font-bold shrink-0">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-gray-900">{item.medicine_name}</h4>
                      <p className="text-xs font-semibold text-primary">{item.dose}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 uppercase">
                      {item.status || 'Active'}
                    </span>
                    <button
                      onClick={() => handleDeleteSchedule(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Remove schedule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-gray-100">
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-bold block">Frequency</span>
                    <span className="font-semibold text-gray-800">{item.frequency}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-bold block">Timing Slots</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {item.timing_slots?.map((slot, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px] capitalize font-medium"
                        >
                          {slot}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-bold block">Prescribed By</span>
                    <span className="font-semibold text-gray-800 truncate block">
                      {item.prescribing_doctor ? `Dr. ${item.prescribing_doctor}` : 'Verified Physician'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-bold block">Adherence Rate</span>
                    <span className="font-bold text-teal-700">{item.adherence_rate || 100}%</span>
                  </div>
                </div>

                {/* Instructions */}
                {item.instructions && (
                  <p className="text-xs text-gray-600 bg-surface p-2.5 rounded-lg border border-gray-100 italic">
                    "{item.instructions}"
                  </p>
                )}

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    onClick={() => handleToggleReminder(item)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                      item.remind_enabled
                        ? 'bg-blue-50 text-primary border border-blue-200'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {item.remind_enabled ? (
                      <>
                        <Bell className="w-3.5 h-3.5" /> Reminders On
                      </>
                    ) : (
                      <>
                        <BellOff className="w-3.5 h-3.5" /> Reminders Muted
                      </>
                    )}
                  </button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/patient/medication-reminders')}
                    className="text-[11px] py-1"
                  >
                    <Clock className="w-3.5 h-3.5 mr-1" /> Log Dose
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Import from Doctor's Prescription */}
      <Modal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Import Medications from Prescription"
      >
        <div className="space-y-4">
          <p className="text-xs text-gray-500">
            Select an authorized digital prescription issued by your doctor to automatically import its medication schedules.
          </p>

          {loadingRx ? (
            <Loader message="Checking authorized prescriptions..." />
          ) : prescriptions.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-xs">
              No digital prescriptions found in your medical records.
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {prescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="p-3.5 rounded-xl border border-gray-200 hover:border-primary/50 transition-all bg-surface flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">
                        Dr. {rx.doctor_name || 'Physician'}
                      </h4>
                      <p className="text-[11px] text-teal-700">{rx.doctor_specialization}</p>
                      <span className="text-[10px] text-gray-400">Date: {rx.issue_date}</span>
                    </div>

                    <Button
                      size="sm"
                      disabled={actionLoading}
                      onClick={() => handleImportPrescription(rx.id)}
                      className="text-xs bg-primary text-white"
                    >
                      Import Medicines
                    </Button>
                  </div>

                  <div className="border-t border-gray-200 pt-2">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                      Medicines Included:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {rx.medicines?.map((m, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] bg-white font-semibold text-gray-800 border border-gray-200"
                        >
                          {m.name} ({m.dosage})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Modal: Add Custom Schedule */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Doctor-Approved Medication"
      >
        <form onSubmit={handleCreateSchedule} className="space-y-4">
          <Alert
            type="info"
            message="Only record medications approved by your licensed physician. Always follow prescribed dosage directions."
          />

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Medicine Name *</label>
            <input
              type="text"
              required
              value={newSchedule.medicine_name}
              onChange={(e) => setNewSchedule({ ...newSchedule, medicine_name: e.target.value })}
              placeholder="e.g. Atorvastatin, Metformin, Amoxicillin"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Prescribed Dose *</label>
              <input
                type="text"
                required
                value={newSchedule.dose}
                onChange={(e) => setNewSchedule({ ...newSchedule, dose: e.target.value })}
                placeholder="e.g. 20 mg, 500 mg tablet"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Frequency *</label>
              <select
                value={newSchedule.frequency}
                onChange={(e) => setNewSchedule({ ...newSchedule, frequency: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="Once Daily">Once Daily</option>
                <option value="Twice Daily">Twice Daily (BID)</option>
                <option value="Three Times Daily">Three Times Daily (TID)</option>
                <option value="Four Times Daily">Four Times Daily (QID)</option>
                <option value="As Needed (PRN)">As Needed (PRN)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Timing Slots</label>
            <div className="grid grid-cols-4 gap-2">
              {['morning', 'afternoon', 'evening', 'bedtime'].map((slot) => {
                const isSelected = newSchedule.timing_slots.includes(slot);
                return (
                  <button
                    type="button"
                    key={slot}
                    onClick={() => toggleTimingSlot(slot)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold capitalize border transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-primary text-primary'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={newSchedule.start_date}
                onChange={(e) => setNewSchedule({ ...newSchedule, start_date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">End Date (Optional)</label>
              <input
                type="date"
                value={newSchedule.end_date}
                onChange={(e) => setNewSchedule({ ...newSchedule, end_date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Instructions / Advisory</label>
            <textarea
              rows="2"
              value={newSchedule.instructions}
              onChange={(e) => setNewSchedule({ ...newSchedule, instructions: e.target.value })}
              placeholder="e.g. Take with food. Do not crush."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button variant="outline" type="button" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={actionLoading}>
              {actionLoading ? 'Saving...' : 'Save Schedule'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MyMedications;
