import React from 'react';

const GlassCard = ({ children, className = "" }) => {
  return (
    <div className={`bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-glass overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;
