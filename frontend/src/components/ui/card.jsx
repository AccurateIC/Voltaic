import React from 'react';

export const Card = ({ children }) => {
  return (
    <div className="bg-white shadow-lg rounded-2xl p-4 mb-4">
      {children}
    </div>
  );
};

export const CardContent = ({ children }) => {
  return (
    <div className="p-4">
      {children}
    </div>
  );
};
