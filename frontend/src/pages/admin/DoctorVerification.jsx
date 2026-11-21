import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, GraduationCap, Award, Building2 } from 'lucide-react';
import { adminAPI } from '../../api/admin';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';

const DoctorVerification = () => {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getPendingDoctors();
      setPendingDoctors(res.data.pending_doctors || []);
    } catch (err) {
      console.error('Error fetching pending doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (userId, decision, reason = '') => {
    setActionLoading(true);
    try {
      await adminAPI.verifyDoctor(userId, decision, reason);
      setAlertMsg(`Doctor application marked as ${decision}. Notification delivered.`);
      setRejectModal(null);
      setRejectReason('');
      fetchPending();
    } catch (err) {
      alert(err.response?.data?.message || 'Verification action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Physician Credential Verification</h1>
        <p className="text-xs text-gray-500 mt-1">
          Review medical licensing numbers, board qualifications, and institutional credentials before allowing doctors to accept appointments.
        </p>
      </div>

      {alertMsg && <Alert type="success" message={alertMsg} onClose={() => setAlertMsg('')} />}

      {loading ? (
        <Loader message="Loading verification applications..." />
      ) : pendingDoctors.length === 0 ? (
        <Card className="py-12">
          <EmptyState
            icon={ShieldCheck}
            title="All Applications Verified"
            description="There are currently no doctor credential applications awaiting administrative review."
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {pendingDoctors.map((doc) => (
            <Card key={doc.doctor_profile_id} className="p-6 space-y-5 border-amber-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900">{doc.name}</h3>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Pending Verification
                    </span>
                  </div>
                  <p className="text-xs text-primary font-medium mt-0.5">
                    {doc.specialization} • {doc.department_name}
                  </p>
                  <p className="text-xs text-gray-500">Contact: {doc.email} • {doc.phone || 'N/A'}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="success"
                    size="sm"
                    isLoading={actionLoading}
                    onClick={() => handleDecision(doc.user_id, 'verified')}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve & Verify
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setRejectModal(doc)}
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Reject Application
                  </Button>
                </div>
              </div>

              {/* Credential Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-surface">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Medical Registration No</span>
                  <span className="font-mono font-bold text-gray-900 text-sm mt-0.5 block">
                    {doc.registration_number || 'NOT PROVIDED'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-surface">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Qualifications</span>
                  <span className="font-bold text-gray-900 mt-0.5 block">{doc.qualifications}</span>
                </div>
                <div className="p-3 rounded-xl bg-surface">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Experience</span>
                  <span className="font-bold text-gray-900 mt-0.5 block">{doc.experience_years} Years</span>
                </div>
                <div className="p-3 rounded-xl bg-surface">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Consultation Fee</span>
                  <span className="font-bold text-primary text-sm mt-0.5 block">${doc.consultation_fee?.toFixed(2)}</span>
                </div>
              </div>

              {doc.biography && (
                <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="font-bold text-gray-700 block mb-0.5">Physician Statement:</span>
                  {doc.biography}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <Modal
          isOpen={!!rejectModal}
          onClose={() => setRejectModal(null)}
          title="Reject Doctor Application"
        >
          <div className="space-y-4">
            <p className="text-xs text-gray-600">
              Please enter the reasoning for rejecting Dr. {rejectModal.name}'s application (e.g. unverified registration ID or incomplete credentials):
            </p>
            <textarea
              rows="3"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for verification decline..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-danger"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setRejectModal(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={actionLoading}
                onClick={() => handleDecision(rejectModal.user_id, 'rejected', rejectReason)}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DoctorVerification;
