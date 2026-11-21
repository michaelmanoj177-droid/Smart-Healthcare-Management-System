import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ message = 'Loading...', fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-blue-100 animate-spin border-t-primary" />
        <Loader2 className="w-6 h-6 text-primary absolute animate-pulse" />
      </div>
      <p className="text-sm font-medium text-gray-500">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;
