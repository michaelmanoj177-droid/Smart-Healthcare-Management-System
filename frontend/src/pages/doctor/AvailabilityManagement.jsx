import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { doctorsAPI } from '../../api/doctors';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const AvailabilityManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await doctorsAPI.getMyAvailability();
      const existing = res.data.schedules || [];
      
      // Merge with default 7 days
      const merged = DAYS.map((day) => {
        const found = existing.find((s) => s.day_of_week === day);
        if (found) return found;
        const isWeekday = !['Saturday', 'Sunday'].includes(day);
        return {
          day_of_week: day,
          start_time: '09:00',
          end_time: '17:00',
          slot_duration_minutes: 30,
          is_available: isWeekday,
        };
      });
      setSchedules(merged);
    } catch (err) {
      console.error('Error fetching availability:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (index, field, value) => {
    const updated = [...schedules];
    updated[index][field] = value;
    setSchedules(updated);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      await doctorsAPI.updateMyAvailability(schedules);
      setSuccess('Weekly clinic schedule updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update schedule.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader message="Loading clinic schedule..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Availability Management</h1>
        <p className="text-xs text-gray-500 mt-1">
          Configure your active clinic days, working hours, and appointment slot durations.
        </p>
      </div>

      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSave} className="space-y-6">
        <Card title="Weekly Clinic Hours & Slot Intervals">
          <div className="divide-y divide-gray-100">
            {schedules.map((item, index) => (
              <div
                key={item.day_of_week}
                className={`py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                  !item.is_available ? 'opacity-60 bg-gray-50/50' : ''
                }`}
              >
                <div className="flex items-center gap-3 w-36">
                  <input
                    type="checkbox"
                    id={`day-${item.day_of_week}`}
                    checked={item.is_available}
                    onChange={(e) => handleFieldChange(index, 'is_available', e.target.checked)}
                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                  />
                  <label
                    htmlFor={`day-${item.day_of_week}`}
                    className="text-sm font-bold text-gray-800 cursor-pointer"
                  >
                    {item.day_of_week}
                  </label>
                </div>

                {item.is_available ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-400">From</span>
                      <input
                        type="time"
                        value={item.start_time}
                        onChange={(e) => handleFieldChange(index, 'start_time', e.target.value)}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-400">To</span>
                      <input
                        type="time"
                        value={item.end_time}
                        onChange={(e) => handleFieldChange(index, 'end_time', e.target.value)}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-400">Slot:</span>
                      <select
                        value={item.slot_duration_minutes}
                        onChange={(e) => handleFieldChange(index, 'slot_duration_minutes', Number(e.target.value))}
                        className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 bg-white"
                      >
                        <option value={15}>15 mins</option>
                        <option value={20}>20 mins</option>
                        <option value={30}>30 mins</option>
                        <option value={45}>45 mins</option>
                        <option value={60}>60 mins</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-gray-400 italic">
                    Clinic Closed / Day Off
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Button type="submit" variant="primary" size="lg" isLoading={saving} className="shadow-md">
          <Save className="w-4 h-4 mr-1.5" /> Save Weekly Schedule
        </Button>
      </form>
    </div>
  );
};

export default AvailabilityManagement;
