import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Sun,
  Sunset,
  Moon,
  Coffee,
  CheckCircle2,
  AlertCircle,
  Pill,
  ChevronRight,
  Info
} from 'lucide-react';
import { medicationsAPI } from '../../api/medications';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';

const TIME_SLOTS = [
  {
    id: 'morning',
    label: 'Morning Regimen',
    time: '08:00 AM',
    icon: Coffee,
    accent: 'bg-amber-500/10 text-amber-600 border-amber-200',
    headerBg: 'bg-amber-50/50',
  },
  {
    id: 'afternoon',
    label: 'Afternoon Regimen',
    time: '01:00 PM',
    icon: Sun,
    accent: 'bg-blue-500/10 text-blue-600 border-blue-200',
    headerBg: 'bg-blue-50/50',
  },
  {
    id: 'evening',
    label: 'Evening Regimen',
    time: '07:00 PM',
    icon: Sunset,
    accent: 'bg-orange-500/10 text-orange-600 border-orange-200',
    headerBg: 'bg-orange-50/50',
  },
  {
    id: 'bedtime',
    label: 'Bedtime Regimen',
    time: '10:00 PM',
    icon: Moon,
    accent: 'bg-indigo-500/10 text-indigo-600 border-indigo-200',
    headerBg: 'bg-indigo-50/50',
  },
];

const MedicationSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [todayLogs, setTodayLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [actionMsg, setActionMsg] = useState(null);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schedRes, dosesRes] = await Promise.all([
        medicationsAPI.getSchedules({ status: 'active' }),
        medicationsAPI.getDoses({ date: selectedDate }),
      ]);
      setSchedules(schedRes.data.schedules || []);
      setTodayLogs(dosesRes.data.doses || []);
    } catch (err) {
      console.error('Error fetching schedule data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLog = async (schedule, slot) => {
    try {
      const res = await medicationsAPI.logDose({
        schedule_id: schedule.id,
        dose_time: slot.time,
        status: 'taken',
        notes: `Logged via Daily Schedule (${slot.label})`,
      });
      setActionMsg({
        type: 'success',
        text: `Marked ${schedule.medicine_name} (${slot.time}) as taken!`,
      });
      // Refresh logs
      const dosesRes = await medicationsAPI.getDoses({ date: selectedDate });
      setTodayLogs(dosesRes.data.doses || []);
    } catch (err) {
      console.error('Log dose error:', err);
      setActionMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to record dose.',
      });
    }
  };

  const isDoseTaken = (schedId, slotId) => {
    return todayLogs.some(
      (l) =>
        (l.schedule_id === schedId || l.medicine_name === schedId) &&
        l.status === 'taken' &&
        (l.dose_time?.toLowerCase().includes(slotId) || l.notes?.includes(slotId))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Daily Medication Schedule</h1>
          <p className="text-xs text-gray-500 mt-1">
            Visual routine organized by prescribed time slots throughout your day.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-2xs self-start sm:self-auto">
          <Calendar className="w-4 h-4 text-primary" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs font-semibold text-gray-800 bg-transparent border-none focus:outline-hidden"
          />
        </div>
      </div>

      {actionMsg && (
        <Alert
          type={actionMsg.type}
          message={actionMsg.text}
          onClose={() => setActionMsg(null)}
        />
      )}

      {/* Safety Notice */}
      <Alert
        type="info"
        title="Safe Dosing Protocol"
        message="Take tablets exactly as directed by your physician. If you miss a scheduled time slot, do NOT double up doses on the subsequent time slot."
      />

      {loading ? (
        <Loader message="Organizing your daily schedule..." />
      ) : schedules.length === 0 ? (
        <Card className="py-12">
          <EmptyState
            icon={Pill}
            title="No Active Schedules Found"
            description="You don't have any active medications configured in your profile. Add medications to populate your daily timeline."
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {TIME_SLOTS.map((slot) => {
            const SlotIcon = slot.icon;
            // Filter medications matching this slot
            const slotMeds = schedules.filter(
              (s) =>
                s.timing_slots?.includes(slot.id) ||
                (s.timing_slots?.length === 0 && slot.id === 'morning')
            );

            return (
              <div
                key={slot.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:border-blue-200 transition-all"
              >
                {/* Slot Header */}
                <div className={`p-4 border-b border-gray-100 flex items-center justify-between ${slot.headerBg}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${slot.accent}`}>
                      <SlotIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{slot.label}</h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>Recommended target: {slot.time}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/80 border border-gray-200 text-gray-700">
                    {slotMeds.length} {slotMeds.length === 1 ? 'Medication' : 'Medications'}
                  </span>
                </div>

                {/* Slot Medications */}
                <div className="p-4">
                  {slotMeds.length === 0 ? (
                    <p className="text-xs text-gray-400 italic py-2">
                      No medications scheduled for this time slot.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {slotMeds.map((med) => {
                        const taken = isDoseTaken(med.id, slot.id);
                        return (
                          <div
                            key={med.id}
                            className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                              taken
                                ? 'bg-emerald-50/40 border-emerald-200'
                                : 'bg-surface border-gray-100 hover:border-gray-200'
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-xs font-black text-gray-900">{med.medicine_name}</h4>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-primary border border-blue-100">
                                  {med.dose}
                                </span>
                              </div>

                              {med.instructions && (
                                <p className="text-[11px] text-gray-500 mt-1 italic">
                                  "{med.instructions}"
                                </p>
                              )}

                              <p className="text-[10px] text-gray-400 mt-2">
                                Prescribed by: {med.prescribing_doctor || 'Verified Physician'}
                              </p>
                            </div>

                            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                              {taken ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Taken Today
                                </span>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => handleQuickLog(med, slot)}
                                  className="w-full text-xs py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 font-semibold"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark Taken
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MedicationSchedule;
