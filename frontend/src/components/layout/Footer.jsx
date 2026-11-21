import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Phone, Mail, MapPin, Heart, Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-md">
                <Activity className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Apex Medicare
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Next-generation hospital management and digital patient care platform. Connecting certified medical professionals, patients, and healthcare facilities with high security and clinical precision.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/80 px-3 py-2 rounded-lg w-fit border border-slate-700/50">
              <Shield className="w-4 h-4 text-secondary" />
              <span>HIPAA Compliant Data Standards</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Navigation</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Medical Services</Link></li>
              <li><Link to="/doctors" className="hover:text-white transition-colors">Find a Doctor</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* Clinical Departments */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Departments</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/doctors?specialization=Cardiology" className="hover:text-white transition-colors">Cardiology</Link></li>
              <li><Link to="/doctors?specialization=Dermatology" className="hover:text-white transition-colors">Dermatology</Link></li>
              <li><Link to="/doctors?specialization=General+Medicine" className="hover:text-white transition-colors">General Medicine</Link></li>
              <li><Link to="/doctors?specialization=Pediatrics" className="hover:text-white transition-colors">Pediatrics</Link></li>
              <li><Link to="/doctors?specialization=Orthopedics" className="hover:text-white transition-colors">Orthopedics</Link></li>
            </ul>
          </div>

          {/* Emergency & Support */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Contact & Help</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>+1 (800) 555-CARE</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-secondary shrink-0" />
                <span>support@smarthealthcare.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>450 Medical Boulevard, Healthcare City</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Apex Medicare Management System. Built for collegiate demonstration and healthcare operations.</p>
          <p className="text-slate-400">
            ⚠️ General Healthcare Notice: This platform provides operational healthcare assistance and does not replace emergency clinical services.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
