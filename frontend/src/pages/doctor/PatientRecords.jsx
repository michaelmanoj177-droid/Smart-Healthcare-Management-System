import React, { useState, useEffect } from 'react';
import { Users, Search, FileText, Calendar, Clock, Stethoscope, AlertCircle, Eye } from 'lucide-react';
import { appointmentsAPI } from '../../api/appointments';
import { recordsAPI } from '../../api/records';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';

const PatientRecords = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatientList();
  }, []);

  const fetchPatientList = async () => {
    setLoading(true);
    try {
      const res = await appointmentsAPI.getDoctorAppointments();
      const appts = res.data.appointments || [];
      
      // Extract unique patients from appointments
      const map = new Map();
      appts.forEach((a) => {
        if (a.patient_id && !map.has(a.patient_id)) {
          map.set(a.patient_id, {
            id: a.patient_id,
            name: a.patient_name || 'Patient',
            email: a.patient_email,
            phone: a.patient_phone,
            gender: a.patient_gender,
            blood_group: a.patient_blood_group,
            last_visit: a.appointment_date,
          });
        }
      });
      const list = Array.from(map.values());
      setPatients(list);
      if (list.length > 0) {
        loadPatientRecords(list[0]);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPatientRecords = async (patient) => {
    setSelectedPatient(patient);
    setLoadingRecords(true);
    setError('');
    try {
      const res = await recordsAPI.getPatientRecordsForDoctor(patient.id);
      setRecords(res.data.records || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load clinical history.');
    } finally {
      setLoadingRecords(false);
    }
  };

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) return <Loader message="Loading patient list..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Patient Clinical Records</h1>
        <p className="text-xs text-gray-500 mt-1">
          Review historical consultation notes, diagnoses, and medical summaries for patients under your clinical care.
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Patient Directory */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-4 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patients..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {filteredPatients.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No patients found.</p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {filteredPatients.map((patient) => {
                  const isSelected = selectedPatient?.id === patient.id;
                  return (
                    <div
                      key={patient.id}
                      onClick={() => loadPatientRecords(patient)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-teal-50/70 border-secondary ring-1 ring-secondary/20'
                          : 'bg-surface border-gray-100 hover:bg-gray-100'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{patient.name}</p>
                        <p className="text-[11px] text-gray-500 truncate">{patient.email}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Last Visit: {patient.last_visit || 'N/A'}
                        </p>
                      </div>
                      <Eye className="w-4 h-4 text-gray-400 shrink-0" />
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Clinical History of Selected Patient */}
        <div className="lg:col-span-8 space-y-4">
          {selectedPatient ? (
            <>
              {/* Patient Profile Card */}
              <Card className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{selectedPatient.name}</h3>
                    <p className="text-xs text-gray-500">Contact: {selectedPatient.phone || selectedPatient.email}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="p-2 rounded-lg bg-surface font-semibold text-gray-700">
                      Gender: {selectedPatient.gender || 'N/A'}
                    </span>
                    <span className="p-2 rounded-lg bg-rose-50 font-bold text-rose-700">
                      Blood: {selectedPatient.blood_group || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-mono">Patient ID: {selectedPatient.id}</span>
                  <Link to={`/doctor/create-record?patient_id=${selectedPatient.id}`}>
                    <Button variant="primary" size="sm">
                      <FileText className="w-3.5 h-3.5 mr-1" /> Add Clinical Note
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Consultation Records List */}
              {loadingRecords ? (
                <Loader message="Loading clinical history..." />
              ) : records.length === 0 ? (
                <Card className="py-12">
                  <EmptyState
                    icon={FileText}
                    title="No Clinical Records Found"
                    description="No prior medical records or clinical notes have been logged for this patient."
                    actionLabel="Create First Record"
                    onAction={() => window.location.href = `/doctor/create-record?patient_id=${selectedPatient.id}`}
                  />
                </Card>
              ) : (
                <div className="space-y-4">
                  {records.map((rec) => (
                    <Card key={rec.id} className="p-5 space-y-3">
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div>
                          <span className="text-xs font-bold text-gray-900">
                            Diagnosis: <span className="text-primary">{rec.diagnosis}</span>
                          </span>
                          <p className="text-[11px] text-gray-400">Dr. {rec.doctor_name || 'Physician'}</p>
                        </div>
                        <span className="text-xs text-gray-500">{rec.consultation_date}</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        {rec.symptoms && (
                          <div>
                            <span className="font-semibold text-gray-600 block mb-0.5">Symptoms:</span>
                            <p className="p-2.5 rounded-lg bg-surface text-gray-700">{rec.symptoms}</p>
                          </div>
                        )}
                        <div>
                          <span className="font-semibold text-gray-600 block mb-0.5">Clinical Notes:</span>
                          <p className="p-2.5 rounded-lg bg-blue-50/40 text-gray-800 leading-relaxed">
                            {rec.clinical_notes}
                          </p>
                        </div>
                        {rec.follow_up_date && (
                          <p className="text-[11px] text-secondary font-medium">
                            Follow-Up Recommended: {rec.follow_up_date}
                          </p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : (
            <Card className="py-12">
              <EmptyState
                icon={Users}
                title="Select a Patient"
                description="Choose a patient from the list on the left to review their medical records."
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientRecords;
