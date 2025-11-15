// frontend/src/components/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const nav = [
  { label: 'Projects', to: '/projects', icon: '📁' },
  { label: 'Teams', to: '/teams', icon: '👥' },
  { label: 'Analytics', to: '/analytics', icon: '📊' },
  { label: 'Chatbot', to: '/chatbot', icon: '🤖' },
];

export default function Sidebar({ onLogout }) {
  const location = useLocation();
  
  return (
    <aside className="w-72 h-screen p-6 bg-dark-surface border-r border-dark-border flex flex-col justify-between">
      <div>
        {/* Logo Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center text-white font-bold shadow-glow">
              WF
            </div>
            <div>
              <div className="text-2xl font-bold text-dark-text">Workflow</div>
              <div className="text-xs text-dark-muted">Management System</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {nav.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-primary text-white shadow-glow' 
                    : 'text-dark-text-secondary hover:bg-dark-surface-light hover:text-dark-text'
                  }
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className="w-full btn-danger flex items-center justify-center gap-2"
      >
        <span>🚪</span>
        <span>Logout</span>
      </button>
    </aside>
  );
}