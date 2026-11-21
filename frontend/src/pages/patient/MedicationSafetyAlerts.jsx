import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Pill,
  Plus,
  Trash2,
  PhoneCall,
  Search,
  ExternalLink,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';
import { medicationsAPI } from '../../api/medications';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';

const MedicationSafetyAlerts = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [activeMeds, setActiveMeds] = useState([]);
  const [candidateMeds, setCandidateMeds] = useState([]);
  const [newMedInput, setNewMedInput] = useState('');
  const [report, setReport] = useState(null);
  const [patientAllergies, setPatientAllergies] = useState([]);

  useEffect(() => {
    loadActiveMedications();
  }, []);

  const loadActiveMedications = async () => {
    setLoading(true);
    try {
      const res = await medicationsAPI.getSchedules({ status: 'active' });
      const names = (res.data.schedules || []).map((s) => s.medicine_name);
      setActiveMeds(names);
      setCandidateMeds(names);
      // Run initial check
      if (names.length > 0) {
        runSafetyCheck(names);
      } else {
        setReport({
          interactions: [],
          duplicate_ingredients: [],
          allergy_conflicts: [],
          summary: { high_severity_count: 0, moderate_count: 0, allergy_conflict_count: 0 },
        });
      }
    } catch (err) {
      console.error('Error loading regimens:', err);
    } finally {
      setLoading(false);
    }
  };

  const runSafetyCheck = async (medList = candidateMeds) => {
    setChecking(true);
    try {
      const res = await medicationsAPI.checkSafety({
        medicines: medList,
      });
      setReport(res.data.report);
      setPatientAllergies(res.data.patient_allergies || []);
    } catch (err) {
      console.error('Error running safety check:', err);
    } finally {
      setChecking(false);
    }
  };

  const handleAddCandidate = (e) => {
    e.preventDefault();
    if (!newMedInput.trim()) return;
    const updated = Array.from(new Set([...candidateMeds, newMedInput.trim()]));
    setCandidateMeds(updated);
    setNewMedInput('');
    runSafetyCheck(updated);
  };

  const handleRemoveCandidate = (index) => {
    const updated = candidateMeds.filter((_, idx) => idx !== index);
    setCandidateMeds(updated);
    runSafetyCheck(updated);
  };

  const hasHighRisk =
    report &&
    (report.summary?.high_severity_count > 0 ||
      report.summary?.allergy_conflict_count > 0 ||
      report.summary?.duplicate_ingredients_count > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Medication Safety Checker
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
              <ShieldCheck className="w-3 h-3 text-purple-700" /> Clinical Cross-Check
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Automated screening for drug-drug interactions, duplicate active ingredients, and allergy conflicts.
          </p>
        </div>

        <Button
          onClick={() => navigate('/patient/book-appointment')}
          className="bg-primary hover:bg-blue-700 text-white flex items-center gap-2 text-xs self-start sm:self-auto"
        >
          <Stethoscope className="w-4 h-4" />
          <span>Consult Doctor</span>
        </Button>
      </div>

      {/* MANDATORY CLINICAL SAFETY DISCLAIMER */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="text-xs text-blue-950">
          <h4 className="font-bold text-blue-900 mb-0.5">Clinical Decision Support Notice:</h4>
          <p className="leading-relaxed">
            This automated safety check uses verified interaction compendia for educational screening.
            <strong> It does not replace professional medical judgment. Never independently stop, start,
            or alter prescribed medication without explicit physician or pharmacist consultation.</strong>
          </p>
        </div>
      </div>

      {/* Interactive Drug Testing Console */}
      <Card className="p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Screening Regimen Pool</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Includes your active prescriptions plus any candidate medications (e.g. over-the-counter painkillers, vitamins).
          </p>
        </div>

        {/* Medication Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {candidateMeds.map((med, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200"
            >
              <Pill className="w-3.5 h-3.5 text-primary" />
              <span>{med}</span>
              <button
                onClick={() => handleRemoveCandidate(idx)}
                className="text-gray-400 hover:text-red-500 transition-colors ml-1"
                title="Remove from screening"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        {/* Add Candidate Form */}
        <form onSubmit={handleAddCandidate} className="flex gap-2 pt-2 border-t border-gray-100">
          <input
            type="text"
            value={newMedInput}
            onChange={(e) => setNewMedInput(e.target.value)}
            placeholder="Add candidate medication to screen (e.g. Ibuprofen, Aspirin, Acetaminophen)..."
            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <Button type="submit" size="sm" className="shrink-0 flex items-center gap-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" /> Add to Screen
          </Button>
        </form>

        {patientAllergies.length > 0 && (
          <div className="pt-2 text-[11px] text-gray-500 flex items-center gap-2">
            <span className="font-bold text-gray-700">Recorded Patient Allergies:</span>
            {patientAllergies.map((alg, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-semibold">
                {alg}
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* Safety Screening Results */}
      {loading || checking ? (
        <Loader message="Screening interactions, duplicate ingredients, and allergy records..." />
      ) : !report ? null : (
        <div className="space-y-6">
          {/* Status Headline Banner */}
          {hasHighRisk ? (
            <div className="p-4 rounded-xl bg-red-50 border border-red-300 flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs text-red-950">
                <h3 className="text-sm font-bold text-red-900 mb-0.5">
                  High Priority Safety Conflicts Detected ({report.summary?.high_severity_count + report.summary?.allergy_conflict_count + report.summary?.duplicate_ingredients_count})
                </h3>
                <p>
                  Potential clinical risks have been flagged among the selected medications. Review the detailed findings
                  below and contact your prescribing physician or pharmacist before taking these combinations.
                </p>
              </div>
            </div>
          ) : report.summary?.moderate_count > 0 ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-950">
                <h3 className="text-sm font-bold text-amber-900 mb-0.5">
                  Moderate Precautions Advised ({report.summary?.moderate_count})
                </h3>
                <p>
                  Some mild or moderate interactions were noted. Routine monitoring or spaced administration may be appropriate.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-950">
                <h3 className="text-sm font-bold text-emerald-900 mb-0.5">
                  No Immediate Safety Conflicts Detected
                </h3>
                <p>
                  No recognized drug-drug interactions, duplicate active ingredients, or recorded allergy cross-reactions
                  were identified among the screened medications in our clinical database.
                </p>
              </div>
            </div>
          )}

          {/* 1. Allergy Conflicts */}
          {report.allergy_conflicts && report.allergy_conflicts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" /> Allergy Cross-Reactivity Alerts ({report.allergy_conflicts.length})
              </h3>
              <div className="space-y-2">
                {report.allergy_conflicts.map((alg, idx) => (
                  <Card key={idx} className="p-4 border-red-200 bg-red-50/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-red-900">
                        {alg.medicine} vs Known Allergy: {alg.allergy}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 uppercase">
                        {alg.severity} Severity
                      </span>
                    </div>
                    <p className="text-xs text-red-950">{alg.detail}</p>
                    <p className="text-[11px] font-bold text-red-800">
                      Recommendation: {alg.recommendation}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* 2. Duplicate Active Ingredients */}
          {report.duplicate_ingredients && report.duplicate_ingredients.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-orange-700 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Duplicate Active Ingredient Risk ({report.duplicate_ingredients.length})
              </h3>
              <div className="space-y-2">
                {report.duplicate_ingredients.map((dup, idx) => (
                  <Card key={idx} className="p-4 border-orange-200 bg-orange-50/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-orange-950">
                        Active Ingredient: {dup.active_ingredient}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800 uppercase">
                        {dup.severity} Severity
                      </span>
                    </div>
                    <p className="text-xs text-orange-900">
                      Co-administered products:{' '}
                      <strong className="text-gray-900">{dup.medications_involved?.join(', ')}</strong>
                    </p>
                    <p className="text-xs text-orange-950">{dup.warning}</p>
                    <p className="text-[11px] font-bold text-orange-800">
                      Action Required: {dup.recommendation}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* 3. Drug-Drug Interactions */}
          {report.interactions && report.interactions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-primary" /> Drug-Drug Interaction Details ({report.interactions.length})
              </h3>
              <div className="space-y-3">
                {report.interactions.map((inter, idx) => {
                  const isHigh = inter.severity === 'high';
                  return (
                    <Card
                      key={idx}
                      className={`p-4 space-y-2.5 transition-all ${
                        isHigh ? 'border-red-200 bg-red-50/20' : 'border-amber-200 bg-amber-50/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-gray-900">
                            {inter.drug1} + {inter.drug2}
                          </h4>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isHigh ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {inter.severity} Risk
                        </span>
                      </div>

                      <div className="text-xs space-y-1">
                        <p className="text-gray-800">
                          <strong>Clinical Effect:</strong> {inter.effect}
                        </p>
                        <p className="text-gray-600">
                          <strong>Mechanism:</strong> {inter.mechanism}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-white/80 border border-gray-200 text-xs">
                        <strong className="text-primary font-bold">Clinical Advisory:</strong>{' '}
                        <span className="text-gray-700">{inter.action}</span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Source Verification Footer */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-[11px] text-gray-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>
              Compendium Source: <strong>Apex Pharmacopeia Interaction Engine</strong>
            </span>
            <span>Safety Rulebase Version: 2026.1 • Monitored daily</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationSafetyAlerts;
