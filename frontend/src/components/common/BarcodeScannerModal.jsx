import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, Search, CheckCircle2, AlertCircle, RefreshCw, Barcode } from 'lucide-react';
import { pharmacyAPI } from '../../api/pharmacy';
import { medicationsAPI } from '../../api/medications';
import Button from './Button';
import Alert from './Alert';
import Badge from './Badge';

const BarcodeScannerModal = ({ isOpen, onClose, onMatchConfirmed }) => {
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scannerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setLookupResult(null);
      setError('');
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    setError('');
    setScanning(true);
    try {
      // Small delay to ensure DOM element is mounted
      setTimeout(async () => {
        const qrElement = document.getElementById('barcode-reader-viewport');
        if (!qrElement) return;

        const html5QrCode = new Html5Qrcode('barcode-reader-viewport');
        scannerRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 180 },
          aspectRatio: 1.333334,
        };

        try {
          await html5QrCode.start(
            { facingMode: 'environment' },
            config,
            (decodedText) => {
              handleBarcodeDetected(decodedText);
            },
            (errorMessage) => {
              // Ignore frame-by-frame non-match errors
            }
          );
        } catch (camErr) {
          console.warn('Camera access error:', camErr);
          setError('Camera access not granted or unavailable. You can enter the barcode/NDC manually below.');
          setScanning(false);
        }
      }, 300);
    } catch (err) {
      console.error('Failed to init scanner:', err);
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (e) {
        console.warn('Scanner stop error:', e);
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleBarcodeDetected = async (code) => {
    await stopScanner();
    performLookup(code);
  };

  const performLookup = async (code) => {
    if (!code || !code.trim()) return;
    setLoading(true);
    setError('');
    try {
      // First try pharmacy barcode lookup
      const res = await pharmacyAPI.lookupBarcode(code.trim());
      setLookupResult(res.data);
    } catch (err) {
      // Fallback: search reference catalog directly
      try {
        const refRes = await medicationsAPI.searchMedicines({ barcode: code.trim() });
        const meds = refRes.data.medicines || [];
        if (meds.length > 0) {
          setLookupResult({
            matched: true,
            barcode: code,
            reference_match: meds[0],
            inventory_match: null,
            confirmation_prompt: 'Please confirm this package matches your physical medication container before proceeding.',
          });
        } else {
          setError(
            `No verified medication found for barcode "${code}". Please enter the brand or generic name manually.`
          );
          setLookupResult(null);
        }
      } catch (refErr) {
        setError(`Barcode lookup failed for "${code}". Please verify the code or search by medicine name.`);
        setLookupResult(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      performLookup(manualCode.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
          onClick={() => {
            stopScanner();
            onClose();
          }}
        />

        {/* Modal Box */}
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-2xl transition-all border border-gray-100 z-10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 text-primary">
                <Barcode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Medication Barcode Scanner</h3>
                <p className="text-[11px] text-gray-500">Scan container barcode / NDC code</p>
              </div>
            </div>
            <button
              onClick={() => {
                stopScanner();
                onClose();
              }}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && <Alert type="warning" message={error} onClose={() => setError('')} />}

          {/* Scanner Viewport or Result */}
          {!lookupResult ? (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-4/3 flex flex-col items-center justify-center text-white">
                <div id="barcode-reader-viewport" className="w-full h-full" />
                {!scanning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-slate-900/90 text-center gap-2">
                    <Camera className="w-8 h-8 text-slate-400 animate-pulse" />
                    <p className="text-xs text-slate-300">Camera preview not active.</p>
                    <Button variant="primary" size="sm" onClick={startScanner}>
                      <RefreshCw className="w-3.5 h-3.5 mr-1" /> Start Camera Scan
                    </Button>
                  </div>
                )}
              </div>

              {/* Manual Input Fallback */}
              <form onSubmit={handleManualSubmit} className="pt-2 flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Or enter barcode / GTIN / NDC manually..."
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
                <Button type="submit" variant="outline" size="sm" isLoading={loading}>
                  <Search className="w-3.5 h-3.5 mr-1" /> Lookup
                </Button>
              </form>
            </div>
          ) : (
            /* Matched Medicine & Mandatory Confirmation */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Verified Product Matched
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                    Code: {lookupResult.barcode}
                  </span>
                </div>

                {lookupResult.reference_match ? (
                  <div>
                    <h4 className="text-base font-extrabold text-gray-900">
                      {lookupResult.reference_match.brand_name}
                    </h4>
                    <p className="text-xs font-semibold text-primary">
                      {lookupResult.reference_match.generic_name}
                    </p>
                    <p className="text-[11px] text-gray-600 mt-1">
                      Class: <span className="font-medium text-gray-800">{lookupResult.reference_match.drug_class}</span>
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {lookupResult.reference_match.available_strengths?.map((str) => (
                        <span key={str} className="text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-700">
                          {str}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : lookupResult.inventory_match ? (
                  <div>
                    <h4 className="text-base font-extrabold text-gray-900">
                      {lookupResult.inventory_match.medicine_name}
                    </h4>
                    <p className="text-xs text-gray-600">
                      Batch #{lookupResult.inventory_match.batch_number} • Exp: {lookupResult.inventory_match.expiry_date}
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Safety Confirmation Prompt */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  Mandatory Verification:
                </p>
                <p className="leading-relaxed text-[11px]">
                  Do not infer a tablet's identity from appearance alone. Please visually verify that the medication name, strength, and manufacturer label printed on your physical container exactly match the details above.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLookupResult(null);
                    startScanner();
                  }}
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" /> Scan Another
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (onMatchConfirmed) {
                      onMatchConfirmed(lookupResult.reference_match || lookupResult.inventory_match);
                    }
                    stopScanner();
                    onClose();
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Confirm & Proceed
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarcodeScannerModal;
