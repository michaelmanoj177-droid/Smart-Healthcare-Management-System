import React, { useState, useEffect } from 'react';
import {
  Search,
  Pill,
  Scan,
  AlertTriangle,
  Info,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  Calendar,
  FileText,
  BookmarkCheck,
  AlertCircle
} from 'lucide-react';
import { medicationsAPI } from '../../api/medications';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';
import BarcodeScannerModal from '../../components/common/BarcodeScannerModal';

const MedicineInfo = () => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [medicines, setMedicines] = useState([]);
  const [selectedMed, setSelectedMed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);

  useEffect(() => {
    handleSearch('');
  }, []);

  const handleSearch = async (searchTerm = query) => {
    setLoading(true);
    setError('');
    try {
      const res = await medicationsAPI.searchMedicines({
        q: searchTerm,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
      });
      setMedicines(res.data.medicines || []);
      if (res.data.medicines && res.data.medicines.length > 0 && !selectedMed) {
        setSelectedMed(res.data.medicines[0]);
      }
    } catch (err) {
      console.error('Error searching medicines:', err);
      setError('Unable to load verified medicine compendium. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    // Trigger search with updated category
    setLoading(true);
    medicationsAPI
      .searchMedicines({
        q: query,
        category: cat !== 'all' ? cat : undefined,
      })
      .then((res) => {
        setMedicines(res.data.medicines || []);
        if (res.data.medicines?.length > 0) {
          setSelectedMed(res.data.medicines[0]);
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  const handleBarcodeMatch = (confirmedItem) => {
    // When barcode is scanned and visually confirmed
    if (confirmedItem) {
      setSelectedMed(confirmedItem);
      // Ensure it is in list or add it
      if (!medicines.some((m) => m.id === confirmedItem.id)) {
        setMedicines([confirmedItem, ...medicines]);
      }
    }
    setScannerOpen(false);
  };

  const categories = [
    { id: 'all', label: 'All Medications' },
    { id: 'Cardiovascular', label: 'Cardiovascular' },
    { id: 'Endocrinology', label: 'Endocrinology' },
    { id: 'Antibiotics', label: 'Antibiotics' },
    { id: 'Analgesics', label: 'Analgesics / NSAIDs' },
    { id: 'Gastroenterology', label: 'Gastroenterology' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Medicine Information Finder
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-secondary border border-teal-200">
              <ShieldCheck className="w-3 h-3 text-secondary" />
              Verified Clinical Compendium
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Search verified drug monographs, dosage guidelines, contraindications, and known adverse effects.
          </p>
        </div>

        {/* Scan Barcode Button */}
        <Button
          onClick={() => setScannerOpen(true)}
          className="bg-secondary hover:bg-teal-700 text-white shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <Scan className="w-4 h-4" />
          <span>Scan Tablet / Package</span>
        </Button>
      </div>

      {/* Safety Notice Banner */}
      <Alert
        type="info"
        title="Clinical Data Assurance"
        message="All medicine monographs are sourced directly from verified clinical pharmacopeia data. Our system strictly prohibits synthetic or unverified drug information."
      />

      {/* Search & Category Filter Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              placeholder="Search by brand name (e.g. Lipitor, Glucophage, Tylenol) or generic name (e.g. Atorvastatin, Metformin)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <Button onClick={() => handleSearch(query)} className="shrink-0">
            Search
          </Button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Main Content: Left List / Right Detail */}
      {loading ? (
        <Loader message="Loading verified clinical monographs..." />
      ) : error ? (
        <Alert type="error" message={error} />
      ) : medicines.length === 0 ? (
        <Card className="py-12">
          <EmptyState
            icon={Pill}
            title="No Verified Medicines Found"
            description="No clinical records matched your search query. The system does not invent unverified drug information."
            action={
              <Button variant="outline" size="sm" onClick={() => { setQuery(''); handleSearch(''); }}>
                Reset Search
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Medicine List (Column 1-4) */}
          <div className="lg:col-span-5 space-y-3">
            <p className="text-xs font-bold uppercase text-gray-400 tracking-wider">
              Search Results ({medicines.length})
            </p>
            <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
              {medicines.map((med) => {
                const isSelected = selectedMed?.id === med.id;
                return (
                  <div
                    key={med.id}
                    onClick={() => setSelectedMed(med)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/60 border-primary shadow-xs ring-1 ring-primary/20'
                        : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{med.brand_name}</h4>
                        <p className="text-xs text-primary font-medium">{med.generic_name}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700">
                        {med.dosage_form}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-gray-500 font-medium">Strengths:</span>
                      {med.available_strengths?.map((str, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200"
                        >
                          {str}
                        </span>
                      ))}
                    </div>

                    <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                      <span>Category: {med.category}</span>
                      {med.requires_prescription && (
                        <span className="text-amber-700 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Rx Required
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Monograph View (Column 5-12) */}
          <div className="lg:col-span-7">
            {selectedMed ? (
              <Card className="p-6 space-y-6">
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-5 border-b border-gray-100 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                        {selectedMed.brand_name}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-primary border border-blue-200">
                        {selectedMed.dosage_form}
                      </span>
                    </div>
                    <p className="text-sm text-secondary font-semibold mt-0.5">
                      Generic Name: {selectedMed.generic_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Therapeutic Class: <span className="font-semibold text-gray-700">{selectedMed.category}</span>
                    </p>
                  </div>

                  {/* NDC / Barcode Badge */}
                  {selectedMed.barcode && (
                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-right">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Identifier / Barcode</span>
                      <span className="text-xs font-mono font-bold text-gray-800">{selectedMed.barcode}</span>
                    </div>
                  )}
                </div>

                {/* Available Strengths */}
                <div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Available Strengths & Dosage Forms
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMed.available_strengths?.map((str, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-teal-50 text-secondary border border-teal-200"
                      >
                        {str}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Clinical Description / Action */}
                <div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Clinical Description & Indications
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed bg-surface p-3.5 rounded-xl border border-gray-100">
                    {selectedMed.description}
                  </p>
                </div>

                {/* Standard Dosage Guideline */}
                <div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Standard Prescribing Guideline
                  </h4>
                  <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-blue-950 font-medium">
                    {selectedMed.standard_dosage}
                  </div>
                </div>

                {/* Warnings & Boxed Precautions */}
                {selectedMed.warnings && selectedMed.warnings.length > 0 && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Warnings & Clinical Precautions</span>
                    </div>
                    <ul className="space-y-1 pl-4 list-disc text-xs text-amber-950">
                      {selectedMed.warnings.map((w, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Known Side Effects */}
                {selectedMed.side_effects && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Known Adverse Reactions & Side Effects
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Common Side Effects */}
                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1.5">
                        <span className="text-[11px] font-bold text-gray-700 block">Common</span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedMed.side_effects.common?.map((eff, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md text-[11px] bg-white text-gray-700 border border-gray-200 shadow-2xs"
                            >
                              {eff}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Serious Side Effects */}
                      <div className="p-3 rounded-xl bg-red-50/60 border border-red-200 space-y-1.5">
                        <span className="text-[11px] font-bold text-red-900 block flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-red-600" /> Serious (Contact Doctor)
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedMed.side_effects.serious?.map((eff, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md text-[11px] bg-white text-red-700 border border-red-200 font-medium shadow-2xs"
                            >
                              {eff}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Metadata & Source Verification Footer */}
                <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-400 gap-2">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-secondary" />
                    <span>
                      Data Source:{' '}
                      <strong className="text-gray-600 font-semibold">
                        {selectedMed.source || 'Apex Clinical Drug Compendium'}
                      </strong>
                    </span>
                  </div>
                  <div>
                    Last Updated:{' '}
                    <span className="text-gray-600 font-medium">
                      {selectedMed.last_updated || '2026-03-01'}
                    </span>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="py-16 text-center text-gray-400">
                <Pill className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-semibold text-gray-700">Select a medicine to view details</p>
                <p className="text-xs text-gray-400 mt-1">
                  Click any medication in the list or scan a packaging barcode to inspect clinical data.
                </p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onConfirm={handleBarcodeMatch}
      />
    </div>
  );
};

export default MedicineInfo;
