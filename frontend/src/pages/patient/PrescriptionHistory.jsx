import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, Printer, Calendar, Clock, Stethoscope, Activity, FileText, CheckCircle2, ShieldCheck, DownloadCloud } from 'lucide-react';
import { prescriptionsAPI } from '../../api/prescriptions';
import { medicationsAPI } from '../../api/medications';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';

const PrescriptionHistory = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRx, setActiveRx] = useState(null);
  const [importingId, setImportingId] = useState(null);
  const [alertInfo, setAlertInfo] = useState(null);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await prescriptionsAPI.getMyPrescriptions();
      setPrescriptions(res.data.prescriptions || []);
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleImportToSchedule = async (prescriptionId) => {
    setImportingId(prescriptionId);
    try {
      const res = await medicationsAPI.importFromPrescription(prescriptionId);
      setAlertInfo({
        type: 'success',
        message: res.data.message || 'Prescription medications imported into your active schedule!',
      });
    } catch (err) {
      console.error('Import error:', err);
      setAlertInfo({
        type: 'error',
        message: err.response?.data?.message || 'Failed to import prescription medications.',
      });
    } finally {
      setImportingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Prescription History</h1>
          <p className="text-xs text-gray-500 mt-1">
            Access, review, and print authorized digital prescriptions issued by your doctors.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/patient/my-medications')}
          className="text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span>My Medication Tracker</span>
        </Button>
      </div>

      {alertInfo && (
        <Alert
          type={alertInfo.type}
          message={alertInfo.message}
          onClose={() => setAlertInfo(null)}
        />
      )}

      {loading ? (
        <Loader message="Loading your digital prescriptions..." />
      ) : prescriptions.length === 0 ? (
        <Card className="py-12">
          <EmptyState
            icon={Pill}
            title="No Prescriptions Issued"
            description="You do not have any digital prescriptions on record currently."
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {prescriptions.map((rx) => (
            <Card key={rx.id} className="p-6 space-y-5 hover:border-teal-200 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-secondary flex items-center justify-center font-bold">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Dr. {rx.doctor_name || 'Physician'}</h3>
                    <p className="text-[11px] text-teal-700 font-medium">
                      {rx.doctor_specialization} • Reg #{rx.professional_registration_number || 'VERIFIED'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500 mr-1">Issued: {rx.issue_date}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveRx(rx)}
                  >
                    <Printer className="w-3.5 h-3.5 mr-1" /> View Slip
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleImportToSchedule(rx.id)}
                    disabled={importingId === rx.id}
                    className="bg-primary hover:bg-blue-700 text-white text-xs"
                  >
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {importingId === rx.id ? 'Importing...' : 'Add to Schedule'}
                  </Button>
                </div>
              </div>

              {/* Medicine Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 bg-surface text-gray-600 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Medicine Name</th>
                      <th className="py-2.5 px-3">Dosage</th>
                      <th className="py-2.5 px-3">Frequency</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rx.medicines?.map((med, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="py-2.5 px-3 font-bold text-gray-900">{med.name}</td>
                        <td className="py-2.5 px-3 text-gray-700">{med.dosage}</td>
                        <td className="py-2.5 px-3 text-gray-700">{med.frequency}</td>
                        <td className="py-2.5 px-3 text-gray-700">{med.duration}</td>
                        <td className="py-2.5 px-3 text-gray-500 italic">{med.instructions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {rx.instructions && (
                <div className="pt-2">
                  <span className="text-xs font-bold text-gray-700 block mb-1">General Dietary & Lifestyle Advice:</span>
                  <p className="p-3 rounded-xl bg-teal-50/40 text-xs text-gray-700 border border-teal-100 leading-relaxed">
                    {rx.instructions}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Printable Prescription Modal */}
      {activeRx && (
        <Modal
          isOpen={!!activeRx}
          onClose={() => setActiveRx(null)}
          title="Digital Prescription Slip"
          maxWidth="max-w-2xl"
        >
          <div id="printable-prescription" className="space-y-6 text-gray-900 font-sans">
            {/* Hospital & Doctor Header */}
            <div className="flex items-start justify-between border-b-2 border-gray-900 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Activity className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight uppercase">Apex Medicare Center</h2>
                  <p className="text-xs text-gray-500">450 Medical Boulevard • Tel: +1 (800) 555-CARE</p>
                </div>
              </div>
              <div className="text-right">
                <h3 className="text-sm font-bold text-gray-900">Dr. {activeRx.doctor_name}</h3>
                <p className="text-xs text-blue-700 font-semibold">{activeRx.doctor_specialization}</p>
                <p className="text-[10px] text-gray-400">Reg: {activeRx.professional_registration_number || 'VERIFIED'}</p>
              </div>
            </div>

            {/* Patient & Date Meta */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50 text-xs border border-gray-200">
              <div>
                <p className="text-gray-500">Patient Name: <span className="font-bold text-gray-900">{activeRx.patient_name}</span></p>
                <p className="text-gray-500 mt-1">Prescription ID: <span className="font-mono text-gray-800">{activeRx.id}</span></p>
              </div>
              <div className="text-right">
                <p className="text-gray-500">Date Issued: <span className="font-bold text-gray-900">{activeRx.issue_date}</span></p>
                {activeRx.follow_up_date && (
                  <p className="text-gray-500 mt-1">Next Follow-Up: <span className="font-bold text-teal-700">{activeRx.follow_up_date}</span></p>
                )}
              </div>
            </div>

            {/* Rx Symbol & Medication Details */}
            <div className="space-y-3">
              <span className="text-2xl font-serif font-black text-blue-700">℞</span>
              <table className="w-full text-left text-xs border border-gray-200">
                <thead className="bg-gray-100 font-bold border-b border-gray-200">
                  <tr>
                    <th className="p-2">#</th>
                    <th className="p-2">Medication</th>
                    <th className="p-2">Dosage</th>
                    <th className="p-2">Frequency</th>
                    <th className="p-2">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {activeRx.medicines?.map((m, i) => (
                    <tr key={i}>
                      <td className="p-2 font-bold">{i + 1}</td>
                      <td className="p-2 font-bold">{m.name}</td>
                      <td className="p-2">{m.dosage}</td>
                      <td className="p-2">{m.frequency}</td>
                      <td className="p-2">{m.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Additional instructions */}
            {activeRx.instructions && (
              <div className="text-xs p-3 rounded-lg border border-gray-200 bg-gray-50">
                <span className="font-bold block mb-0.5">Instructions:</span>
                <p className="text-gray-700">{activeRx.instructions}</p>
              </div>
            )}

            {/* Signature & Disclaimer */}
            <div className="pt-6 border-t border-gray-200 flex items-end justify-between">
              <p className="text-[10px] text-gray-400 max-w-xs">
                Generated via Apex Medicare Electronic Health Records. Valid for clinical dispensing.
              </p>
              <div className="text-center">
                <div className="w-32 border-b border-gray-900 mb-1" />
                <span className="text-[10px] font-bold text-gray-700">Authorized Physician Signature</span>
              </div>
            </div>

            {/* Action Bar (hidden when printing) */}
            <div className="no-print pt-4 flex justify-end gap-3 border-t border-gray-100">
              <Button variant="outline" size="sm" onClick={() => setActiveRx(null)}>
                Close
              </Button>
              <Button variant="primary" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-1.5" /> Print Prescription
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PrescriptionHistory;
