import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  Scan,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Search,
  Filter,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  Building,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { pharmacyAPI } from '../../api/pharmacy';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import BarcodeScannerModal from '../../components/common/BarcodeScannerModal';

const PharmacyInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [scannerOpen, setScannerOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);

  // Form State
  const initialForm = {
    medicine_name: '',
    generic_name: '',
    dosage_form: 'Tablet',
    strength: '20 mg',
    batch_number: '',
    quantity: 100,
    threshold: 20,
    expiry_date: '',
    supplier: 'Apex Central Pharma Supply',
    unit_price: 0.5,
    barcode: '',
    storage_conditions: 'Store at 20°C to 25°C',
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchInventory();
  }, [statusFilter]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await pharmacyAPI.getInventory({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setInventory(res.data.inventory || []);
      setTotalCount(res.data.total || 0);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setAlertInfo({ type: 'error', message: 'Failed to load pharmacy inventory.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInventory();
  };

  const handleOpenAdd = () => {
    // Generate a default batch number
    const randomBatch = 'BAT-' + Math.floor(100000 + Math.random() * 900000);
    // Default expiry 1 year out
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    const expStr = d.toISOString().split('T')[0];

    setFormData({
      ...initialForm,
      batch_number: randomBatch,
      expiry_date: expStr,
    });
    setAddModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setCurrentEditItem(item);
    setFormData({
      medicine_name: item.medicine_name,
      generic_name: item.generic_name || '',
      dosage_form: item.dosage_form || 'Tablet',
      strength: item.strength || '',
      batch_number: item.batch_number,
      quantity: item.quantity,
      threshold: item.threshold,
      expiry_date: item.expiry_date,
      supplier: item.supplier || '',
      unit_price: item.unit_price || 0,
      barcode: item.barcode || '',
      storage_conditions: item.storage_conditions || '',
    });
    setEditModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await pharmacyAPI.createInventoryItem(formData);
      setAlertInfo({ type: 'success', message: 'Inventory batch registered successfully.' });
      setAddModalOpen(false);
      fetchInventory();
    } catch (err) {
      console.error('Create inventory error:', err);
      setAlertInfo({ type: 'error', message: err.response?.data?.message || 'Failed to add batch.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!currentEditItem) return;
    setActionLoading(true);
    try {
      await pharmacyAPI.updateInventoryItem(currentEditItem.id, formData);
      setAlertInfo({ type: 'success', message: 'Batch details updated.' });
      setEditModalOpen(false);
      fetchInventory();
    } catch (err) {
      console.error('Update inventory error:', err);
      setAlertInfo({ type: 'error', message: err.response?.data?.message || 'Failed to update batch.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id, batchNo) => {
    if (!window.confirm(`Are you sure you want to remove/quarantine batch ${batchNo}?`)) return;
    try {
      await pharmacyAPI.deleteInventoryItem(id);
      setAlertInfo({ type: 'info', message: `Batch ${batchNo} removed from active stock.` });
      fetchInventory();
    } catch (err) {
      console.error('Delete error:', err);
      setAlertInfo({ type: 'error', message: 'Failed to remove batch.' });
    }
  };

  const handleBarcodeMatched = (item) => {
    // If scanned item matches a medicine reference or barcode
    setFormData({
      ...formData,
      medicine_name: item.brand_name || item.medicine_name,
      generic_name: item.generic_name || '',
      dosage_form: item.dosage_form || 'Tablet',
      strength: item.available_strengths?.[0] || '10 mg',
      barcode: item.barcode || '',
    });
    setScannerOpen(false);
    setAddModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Pharmacy Inventory</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-primary border border-blue-200">
              <ShieldCheck className="w-3 h-3 text-primary" /> Staff & Clinical Access
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Manage pharmaceutical batches, monitor expiration dates, and enforce dispensability safeguards.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            onClick={() => setScannerOpen(true)}
            className="flex items-center gap-2 text-xs"
          >
            <Scan className="w-4 h-4 text-primary" />
            <span>Scan Barcode</span>
          </Button>

          <Button
            onClick={handleOpenAdd}
            className="bg-primary hover:bg-blue-700 text-white flex items-center gap-2 text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Receive New Batch</span>
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

      {/* Strict Compliance Banner */}
      <Alert
        type="info"
        title="Dispensation Safety Policy"
        message="Expired inventory batches are strictly prohibited from dispensing and are automatically locked in Quarantine status. Stock levels below reorder thresholds require restocking authorization."
      />

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by medicine name, generic name, or batch number..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">All Stock Statuses</option>
              <option value="in_stock">In Stock (Dispensable)</option>
              <option value="low_stock">Low Stock Alerts</option>
              <option value="expired">Expired (Quarantined)</option>
            </select>

            <Button type="submit" size="sm" className="text-xs">
              Filter
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                fetchInventory();
              }}
              className="text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </form>
      </Card>

      {/* Inventory Table */}
      {loading ? (
        <Loader message="Loading pharmacy inventory records..." />
      ) : inventory.length === 0 ? (
        <Card className="py-12">
          <EmptyState
            icon={Boxes}
            title="No Inventory Batches Found"
            description="No medicine stock records match your query. Add received inventory or reset your filters."
            action={
              <Button size="sm" onClick={handleOpenAdd}>
                Receive New Batch
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-surface text-gray-600 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Medicine & Form</th>
                  <th className="py-3 px-4">Batch Number</th>
                  <th className="py-3 px-4">Available Qty</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Dispensable?</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inventory.map((item) => {
                  const isExpired = item.status === 'expired' || item.is_dispensable === false;
                  const isLow = item.status === 'low_stock';

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-gray-50/50 transition-colors ${
                        isExpired ? 'bg-red-50/30' : isLow ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900">{item.medicine_name}</div>
                        <div className="text-[11px] text-gray-500">
                          {item.generic_name} • {item.strength} ({item.dosage_form})
                        </div>
                        {item.barcode && (
                          <span className="text-[10px] font-mono text-gray-400 block">
                            NDC/UPC: {item.barcode}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-gray-700">
                        {item.batch_number}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-black text-gray-900 text-sm">{item.quantity}</span>
                        <span className="text-[10px] text-gray-400 block">
                          Min threshold: {item.threshold}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`font-semibold ${
                            isExpired ? 'text-red-700' : 'text-gray-800'
                          }`}
                        >
                          {item.expiry_date}
                        </span>
                        {item.days_to_expiry !== undefined && (
                          <span className="text-[10px] text-gray-500 block">
                            {item.days_to_expiry <= 0
                              ? 'Expired'
                              : `${item.days_to_expiry} days left`}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-gray-600 truncate max-w-[140px]">
                        {item.supplier}
                      </td>

                      <td className="py-3.5 px-4">
                        {item.is_dispensable ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                            <CheckCircle className="w-3.5 h-3.5" /> Dispensable
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700">
                            <XCircle className="w-3.5 h-3.5" /> Quarantined
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {isExpired ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200 uppercase">
                            Expired
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                            In Stock
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-gray-500 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit batch"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.batch_number)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Quarantine/Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Batch Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Receive New Pharmacy Batch"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Medicine Name *</label>
              <input
                type="text"
                required
                value={formData.medicine_name}
                onChange={(e) => setFormData({ ...formData, medicine_name: e.target.value })}
                placeholder="e.g. Atorvastatin"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Generic Name</label>
              <input
                type="text"
                value={formData.generic_name}
                onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
                placeholder="e.g. Atorvastatin Calcium"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Dosage Form</label>
              <select
                value={formData.dosage_form}
                onChange={(e) => setFormData({ ...formData, dosage_form: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Syrup">Syrup</option>
                <option value="Injection">Injection</option>
                <option value="Suspension">Suspension</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Strength</label>
              <input
                type="text"
                value={formData.strength}
                onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                placeholder="e.g. 20 mg"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Batch Number *</label>
              <input
                type="text"
                required
                value={formData.batch_number}
                onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Quantity *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Stock Threshold</label>
              <input
                type="number"
                min="0"
                value={formData.threshold}
                onChange={(e) => setFormData({ ...formData, threshold: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Expiry Date *</label>
              <input
                type="date"
                required
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Supplier</label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Barcode / NDC</label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="e.g. 00071015523"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button variant="outline" type="button" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={actionLoading}>
              {actionLoading ? 'Saving...' : 'Add Batch'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Batch Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Update Batch: ${currentEditItem?.batch_number}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Quantity in Stock</label>
              <input
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Reorder Threshold</label>
              <input
                type="number"
                min="0"
                value={formData.threshold}
                onChange={(e) => setFormData({ ...formData, threshold: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Expiry Date</label>
              <input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Supplier</label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button variant="outline" type="button" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={actionLoading}>
              {actionLoading ? 'Updating...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onConfirm={handleBarcodeMatched}
      />
    </div>
  );
};

export default PharmacyInventory;
