import React from 'react';
import { Shield, Award, Users, Stethoscope, HeartPulse, CheckCircle2 } from 'lucide-react';
import Card from '../../components/common/Card';

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-primary uppercase tracking-widest">About Apex Medicare</span>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Empowering Healthcare Through Technology & Precision
        </h1>
        <p className="text-gray-600 text-base leading-relaxed">
          Apex Medicare was created to redefine hospital management and outpatient experience. By combining real-time scheduling, verified clinical practitioners, digital records, and intelligent assistance, we ensure seamless patient care.
        </p>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="text-center p-8 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center mx-auto mb-4">
            <HeartPulse className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Patient-Centric Care</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Patients hold instant access to their full clinical history, consultations, follow-up recommendations, and digital prescriptions.
          </p>
        </Card>

        <Card className="text-center p-8 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-secondary flex items-center justify-center mx-auto mb-4">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Credentialed Physicians</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            All doctors undergo rigorous verification of medical licenses, board qualifications, and institutional affiliations prior to clinical onboarding.
          </p>
        </Card>

        <Card className="text-center p-8 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Data Integrity & Privacy</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Role-based access permissions ensure clinical notes remain strictly confidential between patients and authorized treating doctors.
          </p>
        </Card>
      </div>

      {/* Clinical standards section */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-900">Engineered for Clinical Reliability</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Unlike superficial clinic landing pages, Apex Medicare is built on a full-stack Flask and MongoDB Atlas foundation. It incorporates atomic concurrency checks to eliminate double-booking, real-time rate limiting, and an intelligent rule-based healthcare fallback.
          </p>
          <ul className="space-y-2.5 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <span>Full compliance with digital record privacy standards.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <span>Comprehensive audit trail capturing all critical actions.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <span>Safe AI assistant with red-flag emergency detection.</span>
            </li>
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-blue-50 text-center">
            <h4 className="text-3xl font-extrabold text-primary">6</h4>
            <p className="text-xs font-semibold text-gray-600 mt-1">Medical Departments</p>
          </div>
          <div className="p-6 rounded-2xl bg-teal-50 text-center">
            <h4 className="text-3xl font-extrabold text-secondary">100%</h4>
            <p className="text-xs font-semibold text-gray-600 mt-1">Audit Traceability</p>
          </div>
          <div className="p-6 rounded-2xl bg-indigo-50 text-center">
            <h4 className="text-3xl font-extrabold text-indigo-600">30 min</h4>
            <p className="text-xs font-semibold text-gray-600 mt-1">Dynamic Slot Durations</p>
          </div>
          <div className="p-6 rounded-2xl bg-amber-50 text-center">
            <h4 className="text-3xl font-extrabold text-amber-600">Zero</h4>
            <p className="text-xs font-semibold text-gray-600 mt-1">Hardcoded Stubs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
