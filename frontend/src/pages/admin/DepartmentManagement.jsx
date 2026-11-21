import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, CheckCircle2, XCircle, Power } from 'lucide-react';
import { adminAPI } from '../../api/admin';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', status: 'active' });
  const [saving, setSaving] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getDepartments();
      setDepartments(res.data.departments || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingDept(null);
    setFormData({ name: '', description: '', status: 'active' });
    setModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setFormData({ name: dept.name, description: dept.description, status: dept.status });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    try {
      if (editingDept) {
        await adminAPI.updateDepartment(editingDept.id, formData);
        setAlertMsg(`Department ${formData.name} updated successfully.`);
      } else {
        await adminAPI.createDepartment(formData);
        setAlertMsg(`Department ${formData.name} created successfully.`);
      }
      setModalOpen(false);
      fetchDepartments();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Operation failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (dept) => {
    const newStatus = dept.status === 'active' ? 'inactive' : 'active';
    try {
      await adminAPI.updateDepartment(dept.id, { status: newStatus });
      setAlertMsg(`Department ${dept.name} is now ${newStatus}.`);
      fetchDepartments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Clinical Departments</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage hospital medical wings, specialties, descriptions, and active booking availability.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-1.5" /> New Department
        </Button>
      </div>

      {alertMsg && <Alert type="success" message={alertMsg} onClose={() => setAlertMsg('')} />}

      {loading ? (
        <Loader message="Loading hospital departments..." />
      ) : departments.length === 0 ? (
        <Card className="py-12">
          <EmptyState
            icon={Building2}
            title="No Departments Configured"
            description="Create your first hospital department to start routing doctors and patients."
            actionLabel="Add Department"
            onAction={handleOpenCreate}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <Card key={dept.id} className="p-6 flex flex-col justify-between hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-primary flex items-center justify-center font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">{dept.name}</h3>
                  </div>
                  <Badge status={dept.status} />
                </div>

                <p className="text-xs text-gray-600 leading-relaxed min-h-[48px]">
                  {dept.description || 'Clinical department providing specialized medical care.'}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(dept)}
                  className={`text-xs font-semibold flex items-center gap-1 transition-colors ${
                    dept.status === 'active'
                      ? 'text-danger hover:underline'
                      : 'text-success hover:underline'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  {dept.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>

                <Button variant="outline" size="sm" onClick={() => handleOpenEdit(dept)}>
                  <Edit2 className="w-3 h-3 mr-1" /> Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Department Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingDept ? 'Edit Clinical Department' : 'Create New Department'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && <Alert type="error" message={errorMsg} />}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Department Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Oncology, Endocrinology, Cardiology"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Description & Scope of Care
              </label>
              <textarea
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Clinical treatments, facilities, and procedures offered..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={saving}>
                {editingDept ? 'Update Department' : 'Create Department'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default DepartmentManagement;
