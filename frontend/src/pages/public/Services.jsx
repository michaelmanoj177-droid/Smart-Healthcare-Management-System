import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, Stethoscope, Baby, Bone, Brain, Calendar, ArrowRight } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const Services = () => {
  const departments = [
    {
      name: 'Cardiology',
      icon: Heart,
      color: 'text-rose-600 bg-rose-50',
      description: 'Comprehensive evaluation of heart health, hypertension management, preventive cardiac screenings, and ECG consultations.',
      specialist: 'Dr. Arun Kumar (8 yrs exp)'
    },
    {
      name: 'Dermatology',
      icon: Sparkles,
      color: 'text-amber-600 bg-amber-50',
      description: 'Medical and aesthetic skin care, management of eczema, acne treatments, allergic reactions, and routine skin screenings.',
      specialist: 'Dr. Priya Sharma (6 yrs exp)'
    },
    {
      name: 'General Medicine',
      icon: Stethoscope,
      color: 'text-blue-600 bg-blue-50',
      description: 'Primary medical care, acute illness diagnosis, chronic disease monitoring, metabolic wellness, and annual physical checkups.',
      specialist: 'Dr. Karthik Raj (10 yrs exp)'
    },
    {
      name: 'Pediatrics',
      icon: Baby,
      color: 'text-teal-600 bg-teal-50',
      description: 'Specialized healthcare for infants, toddlers, and adolescents. Developmental tracking, nutrition advice, and vaccination support.',
      specialist: 'Dr. Meena Devi (7 yrs exp)'
    },
    {
      name: 'Orthopedics',
      icon: Bone,
      color: 'text-indigo-600 bg-indigo-50',
      description: 'Diagnosis and non-invasive therapy for joint pain, spine posture, fractures, sports rehabilitation, and musculoskeletal disorders.',
      specialist: 'Dr. Naveen Kumar (5 yrs exp)'
    },
    {
      name: 'Neurology',
      icon: Brain,
      color: 'text-purple-600 bg-purple-50',
      description: 'Specialized clinical assessment for persistent migraines, nerve pain, dizziness, sleep disturbances, and cognitive wellness.',
      specialist: 'Board-Certified Specialist'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-xs font-bold text-primary uppercase tracking-widest">Clinical Disciplines</span>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Comprehensive Medical Services
        </h1>
        <p className="text-gray-600 text-base leading-relaxed">
          From preventative assessments to specialized clinical consultations, our multi-departmental medical staff is dedicated to your health.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {departments.map((dept) => {
          const Icon = dept.icon;
          return (
            <Card key={dept.name} className="flex flex-col justify-between p-7 hover:border-blue-200 transition-all">
              <div className="space-y-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${dept.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{dept.name}</h3>
                  <p className="text-xs text-primary font-medium mt-0.5">{dept.specialist}</p>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {dept.description}
                </p>
              </div>

              <div className="pt-6 border-t border-gray-100 mt-6 flex items-center justify-between">
                <Link
                  to={`/doctors?specialization=${encodeURIComponent(dept.name)}`}
                  className="text-xs font-bold text-primary hover:text-blue-700 flex items-center gap-1"
                >
                  Find Doctors in {dept.name} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Booking CTA */}
      <div className="bg-blue-50 rounded-3xl p-8 sm:p-12 border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Need Guidance on Choosing a Department?</h3>
          <p className="text-sm text-gray-600 mt-1 max-w-xl">
            Our 24/7 AI Health Assistant can analyze your symptoms and suggest the most appropriate clinical specialty.
          </p>
        </div>
        <Link to="/patient/ai-assistant">
          <Button variant="primary" size="md">
            Ask AI Assistant
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Services;
