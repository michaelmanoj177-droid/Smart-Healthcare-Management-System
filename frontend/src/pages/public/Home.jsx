import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  FileText,
  Pill,
  Bot,
  ShieldCheck,
  ArrowRight,
  Clock,
  Heart,
  CheckCircle,
  Stethoscope,
  Activity,
  Award,
  Users
} from 'lucide-react';
import Button from '../../components/common/Button';

const Home = () => {
  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-primary text-xs font-semibold">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                Modern Hospital & Patient SaaS Platform
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.15]">
                Smarter Healthcare, <br />
                <span className="bg-gradient-to-r from-primary via-blue-600 to-secondary bg-clip-text text-transparent">
                  Better Patient Experiences
                </span>
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Connect directly with certified specialists, schedule consultations seamlessly, access unified digital medical records, and experience safe AI-powered health guidance in one unified ecosystem.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link to="/register">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-md">
                    Get Started Free <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link to="/doctors">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    <Stethoscope className="w-4 h-4 mr-1 text-primary" /> Find a Doctor
                  </Button>
                </Link>
              </div>

              {/* Stats badges */}
              <div className="pt-8 border-t border-gray-100 grid grid-cols-3 gap-6 max-w-lg mx-auto lg:mx-0">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">100%</h3>
                  <p className="text-xs text-gray-500 font-medium">Verified Physicians</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary">24/7</h3>
                  <p className="text-xs text-gray-500 font-medium">Digital Access</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-secondary">Zero</h3>
                  <p className="text-xs text-gray-500 font-medium">Double-Booking Lag</p>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100 to-teal-50 rounded-3xl filter blur-2xl opacity-70 -z-10" />
                <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-primary flex items-center justify-center font-bold">
                        <Activity className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Apex Medical Portal</h4>
                        <p className="text-xs text-emerald-600 font-medium">System Active & Online</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                      Live
                    </span>
                  </div>

                  {/* Sample Card Previews */}
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900">Cardiology Consultation</p>
                        <p className="text-[11px] text-gray-500">Dr. Arun Kumar • Today, 10:00 AM</p>
                      </div>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                        Confirmed
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-100 flex items-center gap-3">
                      <Pill className="w-5 h-5 text-secondary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900">Digital Prescription</p>
                        <p className="text-[11px] text-gray-500">2 Active Medications Prescribed</p>
                      </div>
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded">
                        Verified
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center gap-3">
                      <Bot className="w-5 h-5 text-purple-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900">AI Health Assistant</p>
                        <p className="text-[11px] text-gray-500">Ready for clinical inquiries</p>
                      </div>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                        Ready
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 text-center">
                    <Link to="/doctors" className="text-xs font-semibold text-primary hover:underline">
                      Explore Doctor Directory & Available Slots →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Feature Section (Section 6 requirement) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-bold text-primary uppercase tracking-widest">Enterprise Architecture</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Comprehensive Digital Health Infrastructure
          </h3>
          <p className="text-gray-600 text-sm sm:text-base">
            Engineered specifically to eliminate administrative friction for patients, physicians, and clinical staff.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center mb-5">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Online Appointment Booking</h4>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Real-time slot generation based on doctor weekly schedules. Overlap prevention and atomic booking safeguards prevent conflicts.
            </p>
            <Link to="/patient/book-appointment" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              Book a slot <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-secondary flex items-center justify-center mb-5">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Digital Medical Records</h4>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Electronic medical records curated by licensed practitioners. Complete audit logs and role-restricted privacy safeguards.
            </p>
            <Link to="/patient/records" className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1">
              View records <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
              <Pill className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Prescription Management</h4>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Standardized digital prescriptions with dosage, frequency, and duration details. Instant printable formats for pharmacies.
            </p>
            <Link to="/patient/prescriptions" className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
              View prescriptions <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
              <Bot className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">AI Healthcare Assistant</h4>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              24/7 intelligent health education, symptom triage guidance, red-flag emergency detection, and physician consultation prep.
            </p>
            <Link to="/patient/ai-assistant" className="text-xs font-semibold text-amber-600 hover:underline flex items-center gap-1">
              Chat with AI <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Feature 5 */}
          <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Secure Patient Management</h4>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Flask JWT authentication, cryptographic password hashing, role-based access control, and comprehensive audit logs.
            </p>
            <Link to="/about" className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1">
              Learn security <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Feature 6 */}
          <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-danger flex items-center justify-center mb-5">
              <Activity className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Physician Verification</h4>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Rigorous administrator review of doctor credentials, medical registration IDs, and qualifications before booking is opened.
            </p>
            <Link to="/doctors" className="text-xs font-semibold text-danger hover:underline flex items-center gap-1">
              Browse Doctors <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gradient-to-b from-white to-surface py-16 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold text-primary uppercase tracking-widest">Workflow</h2>
            <h3 className="text-3xl font-extrabold text-gray-900">How The System Works</h3>
            <p className="text-gray-600 text-sm">Four straightforward steps to receiving exceptional healthcare.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary text-white font-bold text-lg flex items-center justify-center mx-auto shadow-md">
                1
              </div>
              <h4 className="font-bold text-gray-900 text-base">Select Specialist</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Filter verified physicians by department, qualification, fees, or availability.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-secondary text-white font-bold text-lg flex items-center justify-center mx-auto shadow-md">
                2
              </div>
              <h4 className="font-bold text-gray-900 text-base">Book Appointment</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Pick a valid date and available time slot with your consultation reason.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-700 text-white font-bold text-lg flex items-center justify-center mx-auto shadow-md">
                3
              </div>
              <h4 className="font-bold text-gray-900 text-base">Attend Consultation</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Receive diagnosis, clinical observations, and physician treatment plans.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-bold text-lg flex items-center justify-center mx-auto shadow-md">
                4
              </div>
              <h4 className="font-bold text-gray-900 text-base">Access Records</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Instantly view, download, or print digital prescriptions and follow-up notes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Doctor Availability CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-primary to-blue-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center lg:text-left max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold uppercase tracking-wider">
              Ready for Consultation
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Consult With Our Top Specialists Today
            </h3>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Our clinical faculty spans 6 key hospital departments including Cardiology, Dermatology, General Medicine, Orthopedics, Pediatrics, and Neurology.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <Link to="/doctors">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto shadow-lg bg-teal-500 hover:bg-teal-600 text-white">
                View Available Doctors
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/30">
                Register as Patient
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
