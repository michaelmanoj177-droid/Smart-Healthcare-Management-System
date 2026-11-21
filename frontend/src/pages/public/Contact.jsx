import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-primary uppercase tracking-widest">Support & Inquiries</span>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Contact Apex Medicare</h1>
        <p className="text-gray-600 text-sm">
          Have an administrative query, need assistance with appointments, or require technical support? Reach out to our operational team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Info Column */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-8 space-y-6">
            <h3 className="text-lg font-bold text-gray-900">Hospital Contact Center</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-primary">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-400">Emergency & Appointments</span>
                  <span className="text-base font-bold text-gray-900">+1 (800) 555-CARE</span>
                  <span className="block text-[11px] text-gray-500">Toll-free 24/7 hotline</span>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-teal-50 text-secondary">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-400">Email Support</span>
                  <span className="text-sm font-bold text-gray-900">support@smarthealthcare.com</span>
                  <span className="block text-[11px] text-gray-500">Responses within 2-4 business hours</span>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-400">Physical Location</span>
                  <span className="text-sm font-bold text-gray-900">450 Medical Boulevard, Healthcare City</span>
                  <span className="block text-[11px] text-gray-500">Central Medical Plaza, Suites 100-500</span>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-400">Outpatient Working Hours</span>
                  <span className="text-sm font-bold text-gray-900">Monday - Friday: 08:00 AM - 08:00 PM</span>
                  <span className="block text-[11px] text-gray-500">Saturday: 09:00 AM - 02:00 PM</span>
                </div>
              </li>
            </ul>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <Card className="p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Send a Message</h3>
            <p className="text-xs text-gray-500 mb-6">Fill in the form below and our staff will respond promptly.</p>

            {submitted && (
              <Alert
                type="success"
                title="Message Transmitted"
                message="Thank you for reaching out. A healthcare support representative has received your note."
                onClose={() => setSubmitted(false)}
                className="mb-6"
              />
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Your Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Appointment inquiry"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Message</label>
                <textarea
                  rows="4"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we assist you today?..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <Button type="submit" variant="primary" size="md">
                <Send className="w-4 h-4 mr-1.5" /> Submit Message
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;
