import React from 'react';

const Loader = ({ open }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
};

export default Loader;