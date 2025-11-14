
import React from 'react';

export default function Button({ children, variant = 'solid', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center px-4 py-2 rounded-2xl text-sm font-semibold';
  
  if (variant === 'outline') {
    return (
      <button className={${base} mb-btn-outline ${className}} {...props}>
        {children}
      </button>
    );
  }

  return (
    <button className={${base} mb-btn ${className}} {...props}>
      {children}
    </button>
  );
}
