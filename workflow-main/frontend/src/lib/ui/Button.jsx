import React from 'react';

export default function Button({ children, variant = 'solid', className = '', disabled, ...props }) {
  const base = 'inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300';
  
  if (variant === 'outline') {
    return (
      <button 
        className={`${base} btn-secondary ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`} 
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <button 
      className={`${base} btn-primary ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`} 
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}