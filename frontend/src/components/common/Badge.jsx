import React from 'react';

const Badge = ({ status = 'pending', text, className = '' }) => {
  const norm = String(status).toLowerCase();
  
  let styles = 'bg-gray-100 text-gray-700 border-gray-200';
  let label = text || status;

  if (['confirmed', 'active', 'verified'].includes(norm)) {
    styles = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (['completed'].includes(norm)) {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (['pending', 'pending_verification'].includes(norm)) {
    styles = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (['cancelled', 'rejected', 'inactive'].includes(norm)) {
    styles = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${styles} ${className}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-75"></span>
      {label}
    </span>
  );
};

export default Badge;
