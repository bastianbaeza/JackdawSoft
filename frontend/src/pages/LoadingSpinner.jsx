// src/components/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ size = "md", color = "gray" }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const colorClasses = {
    gray: 'border-gray-300 border-t-gray-800',
    white: 'border-white border-t-white',
    cyan: 'border-cyan-300 border-t-cyan-600'
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`animate-spin rounded-full border-2 ${sizeClasses[size]} ${colorClasses[color]}`}
      />
    </div>
  );
};

export default LoadingSpinner;