import React from 'react';

export default function Card({ children, className = '', soft }) {
  return (
    <div className={`app-card ${className}`}>
      {children}
    </div>
  );
}