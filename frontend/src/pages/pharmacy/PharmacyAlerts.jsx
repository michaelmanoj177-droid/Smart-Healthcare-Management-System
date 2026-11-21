import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  AlertCircle,
  Clock,
  Boxes,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';
import { pharmacyAPI } from '../../api/pharmacy';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';

const PharmacyAlerts = () => {
  const navigate = useNavigate();
  const [alertsData, setAlertsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'expired', 'near_expiry', 'low_stock'
  const [actionMsg, setActionMsg] = useState(null);

  // Restock Modal
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [restockQty, setRestockQty] = useState(50);
  const [restockLoading, setRestockLoading] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await pharmacyAPI.getAlerts();
      setAlertsData(res.data);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setActionMsg({ type: 'error', text: 'Failed to load pharmacy safety alerts.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRestock = (batch) => {
    setSelectedBatch(batch);
    setRestockQty(50);
    setRestockModalOpen(true);
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBatch) return;
    setRestockLoading(true);
    try {
      const newQuantity = (selectedBatch.quantity || 0) + parseInt(restockQty || 0);
      await pharmacyAPI.updateInventoryItem(selectedBatch.id, {
        quantity: newQuantity,
      });
      setActionMsg({
        type: 'success',
        text: `Restocked batch ${selectedBatch.batch_number}. New total stock: ${newQuantity}`,
      });
      setRestockModalOpen(false);
      fetchAlerts();
    } catch (err) {
      console.error('Restock error:', err);
      setActionMsg({ type: 'error', text: 'Failed to update stock quantity.' });
    } finally {
      setRestockLoading(false);
    }
  };

  const expiredList = alertsData?.expired || [];
  const nearExpiryList = alertsData?.near_expiry || [];
  const lowStockList = alertsData?.low_stock || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Pharmacy Expiry & Stock Alerts
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              <ShieldAlert className="w-3 h-3 text-amber-600" /> Critical Safety Controls
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time surveillance for quarantined expired pharmaceuticals, shelf-life warnings, and stock deficits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAlerts}
            className="text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/pharmacy/inventory')}
            className="text-xs"
          >
            Inventory Management
          </Button>
        </div>
      </div>

      {actionMsg && (
        <Alert
          type={actionMsg.type}
          message={actionMsg.text}
          onClose={() => setActionMsg(null)}
        />
      )}

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Expired Items */}
        <div
          onClick={() => setActiveTab('expired')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'expired'
              ? 'bg-red-50 border-red-300 ring-2 ring-red-200'
              : 'bg-white border-gray-100 hover:border-red-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 uppercase">
              Action Required
            </span>
          </div>
          <h3 className="text-3xl font-black text-gray-900 mt-3">{expiredList.length}</h3>
          <p className="text-xs font-bold text-red-700 mt-0.5">Expired Batches (Quarantined)</p>
          <p className="text-[11px] text-gray-500 mt-1">
            Dispensing is strictly blocked in compliance with health regulations.
          </p>
        </div>

        {/* Near Expiry Items */}
        <div
          onClick={() => setActiveTab('near_expiry')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'near_expiry'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200'
              : 'bg-white border-gray-100 hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
              Within 60 Days
            </span>
          </div>
          <h3 className="text-3xl font-black text-gray-900 mt-3">{nearExpiryList.length}</h3>
          <p className="text-xs font-bold text-amber-700 mt-0.5">Expiring Soon (Near-Expiry)</p>
          <p className="text-[11px] text-gray-500 mt-1">
            Prioritize dispensing or schedule replacement batches.
          </p>
        </div>

        {/* Low Stock Items */}
        <div
          onClick={() => setActiveTab('low_stock')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'low_stock'
              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
              : 'bg-white border-gray-100 hover:border-blue-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-primary flex items-center justify-center font-bold">
              <Boxes className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-primary uppercase">
              Below Threshold
            </span>
          </div>
          <h3 className="text-3xl font-black text-gray-900 mt-3">{lowStockList.length}</h3>
          <p className="text-xs font-bold text-primary mt-0.5">Low Stock Deficits</p>
          <p className="text-[11px] text-gray-500 mt-1">
            Current inventory is below minimum safety reserves.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 text-xs pb-2 font-semibold">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'all' ? 'bg-primary text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          All Active Alerts ({expiredList.length + nearExpiryList.length + lowStockList.length})
        </button>
        <button
          onClick={() => setActiveTab('expired')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'expired'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Expired Batches ({expiredList.length})
        </button>
        <button
          onClick={() => setActiveTab('near_expiry')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'near_expiry'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Near-Expiry ({nearExpiryList.length})
        </button>
        <button
          onClick={() => setActiveTab('low_stock')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'low_stock'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Low Stock ({lowStockList.length})
        </button>
      </div>

      {loading ? (
        <Loader message="Loading surveillance alerts..." />
      ) : (
        <div className="space-y-4">
          {/* 1. Expired Items Section */}
          {(activeTab === 'all' || activeTab === 'expired') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" /> Expired Stock (Quarantined - Non-Dispensable)
                </h3>
                <span className="text-xs text-gray-400">{expiredList.length} batches</span>
              </div>

              {expiredList.length === 0 ? (
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs text-emerald-800">
                  Zero expired medications in active inventory.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {expiredList.map((batch) => (
                    <Card
                      key={batch.id}
                      className="p-4 border-red-200 bg-red-50/30 flex flex-col justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-black text-gray-900">{batch.medicine_name}</h4>
                            <p className="text-xs text-gray-500 font-mono">Batch: {batch.batch_number}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 uppercase">
                            Non-Dispensable
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-red-100 text-xs">
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase font-bold block">
                              Expiry Date
                            </span>
                            <span className="font-bold text-red-700">{batch.expiry_date}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase font-bold block">
                              Quarantined Qty
                            </span>
                            <span className="font-bold text-gray-800">{batch.quantity} units</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-red-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-gray-500">Supplier: {batch.supplier}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate('/pharmacy/inventory')}
                          className="text-xs text-red-700 border-red-300 hover:bg-red-100"
                        >
                          Disposal Protocol
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. Near-Expiry Items Section */}
          {(activeTab === 'all' || activeTab === 'near_expiry') && (
            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Near-Expiry Stock (Within 60 Days)
                </h3>
                <span className="text-xs text-gray-400">{nearExpiryList.length} batches</span>
              </div>

              {nearExpiryList.length === 0 ? (
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs text-emerald-800">
                  No batches expiring within the next 60 days.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {nearExpiryList.map((batch) => (
                    <Card
                      key={batch.id}
                      className="p-4 border-amber-200 bg-amber-50/30 flex flex-col justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-black text-gray-900">{batch.medicine_name}</h4>
                            <p className="text-xs text-gray-500 font-mono">Batch: {batch.batch_number}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                            {batch.days_to_expiry} Days Remaining
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-amber-100 text-xs">
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase font-bold block">
                              Expiry Date
                            </span>
                            <span className="font-bold text-amber-800">{batch.expiry_date}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase font-bold block">
                              Current Stock
                            </span>
                            <span className="font-bold text-gray-800">{batch.quantity} units</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-amber-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-gray-500">Supplier: {batch.supplier}</span>
                        <Button
                          size="sm"
                          onClick={() => handleOpenRestock(batch)}
                          className="text-xs bg-amber-600 hover:bg-amber-700 text-white"
                        >
                          <PlusCircle className="w-3.5 h-3.5 mr-1" /> Reorder Replacement
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. Low-Stock Items Section */}
          {(activeTab === 'all' || activeTab === 'low_stock') && (
            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                  <Boxes className="w-4 h-4" /> Low Stock Deficits (Below Safety Threshold)
                </h3>
                <span className="text-xs text-gray-400">{lowStockList.length} batches</span>
              </div>

              {lowStockList.length === 0 ? (
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs text-emerald-800">
                  All pharmacy inventory levels meet or exceed safety thresholds.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {lowStockList.map((batch) => (
                    <Card
                      key={batch.id}
                      className="p-4 border-blue-200 bg-blue-50/30 flex flex-col justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-black text-gray-900">{batch.medicine_name}</h4>
                            <p className="text-xs text-gray-500 font-mono">Batch: {batch.batch_number}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-primary uppercase">
                            Below Threshold
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-blue-100 text-xs">
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase font-bold block">
                              Available Stock
                            </span>
                            <span className="font-bold text-red-600">{batch.quantity} units</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase font-bold block">
                              Safety Threshold
                            </span>
                            <span className="font-bold text-gray-700">{batch.threshold} units</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-blue-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-gray-500">Supplier: {batch.supplier}</span>
                        <Button
                          size="sm"
                          onClick={() => handleOpenRestock(batch)}
                          className="text-xs bg-primary hover:bg-blue-700 text-white"
                        >
                          <PlusCircle className="w-3.5 h-3.5 mr-1" /> Restock Batch
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Restock Modal */}
      <Modal
        isOpen={restockModalOpen}
        onClose={() => setRestockModalOpen(false)}
        title={`Restock: ${selectedBatch?.medicine_name} (${selectedBatch?.batch_number})`}
      >
        <form onSubmit={handleRestockSubmit} className="space-y-4">
          <p className="text-xs text-gray-600">
            Specify the incoming quantity received from supplier <strong>{selectedBatch?.supplier}</strong>.
          </p>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1">
            <p>
              Current Quantity: <strong>{selectedBatch?.quantity} units</strong>
            </p>
            <p>
              Reorder Threshold: <strong>{selectedBatch?.threshold} units</strong>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Quantity to Add (Units) *
            </label>
            <input
              type="number"
              required
              min="1"
              value={restockQty}
              onChange={(e) => setRestockQty(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button variant="outline" type="button" onClick={() => setRestockModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={restockLoading}>
              {restockLoading ? 'Updating Stock...' : 'Confirm Restock'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PharmacyAlerts;
