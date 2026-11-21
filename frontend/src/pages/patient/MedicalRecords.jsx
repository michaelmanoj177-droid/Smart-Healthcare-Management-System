import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Filter, User, Stethoscope, AlertTriangle } from 'lucide-react';
import { recordsAPI } from '../../api/records';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchRecords();
  }, [dateFilter]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await recordsAPI.getMyRecords({ date: dateFilter });
      setRecords(res.data.records || []);
    } catch (err) {
      console.error('Error loading medical records:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Electronic Medical Records</h1>
          <p className="text-xs text-gray-500 mt-1">
            Access authorized consultation summaries, clinical observations, and diagnosis history.
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-100 shadow-xs">
          <Filter className="w-4 h-4 text-gray-400" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="text-xs text-gray-700 bg-transparent focus:outline-none"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-[10px] text-gray-400 hover:text-gray-700 font-semibold"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <Loader message="Loading your clinical records..." />
      ) : records.length === 0 ? (
        <Card className="py-12">
          <EmptyState
            icon={FileText}
            title="No Medical Records"
            description="You do not have any published medical records or consultation notes recorded yet."
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {records.map((rec) => (
            <Card key={rec.id} className="p-6 space-y-5 hover:border-blue-200 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center font-bold">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Dr. {rec.doctor_name || 'Physician'}</h3>
                    <p className="text-[11px] text-primary font-medium">{rec.doctor_specialization || 'Clinical Practitioner'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Consultation Date: {rec.consultation_date}</span>
                </div>
              </div>

              {/* Clinical Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-surface border border-gray-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Diagnosis</span>
                  <p className="text-xs font-bold text-gray-900">{rec.diagnosis || 'Routine evaluation'}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-surface border border-gray-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Follow-Up Recommended</span>
                  <p className="text-xs font-bold text-gray-800">{rec.follow_up_date || 'None scheduled'}</p>
                </div>
              </div>

              {/* Symptoms & Clinical Notes */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-bold text-gray-700 block mb-1">Symptoms Reported:</span>
                  <p className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-700 leading-relaxed">
                    {rec.symptoms || 'No acute symptoms reported.'}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-gray-700 block mb-1">Physician Clinical Notes:</span>
                  <p className="p-3 rounded-xl bg-blue-50/40 border border-blue-100 text-gray-800 leading-relaxed">
                    {rec.clinical_notes || 'Consultation performed according to clinical protocols.'}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;
