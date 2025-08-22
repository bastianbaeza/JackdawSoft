// src/components/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ size = "sm", color = "white" }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const colorClasses = {
    white: 'border-white border-t-white',
    gray: 'border-gray-300 border-t-gray-800',
    cyan: 'border-cyan-400 border-t-cyan-700'
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