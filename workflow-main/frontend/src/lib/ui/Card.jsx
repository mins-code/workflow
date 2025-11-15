import React from 'react';

export default function Card({ children, className = '', soft }) {
  return (
    <div className={`${soft ? 'mb-soft-card' : 'mb-card'} ${className}`}>
      {children}
    </div>
  );
}