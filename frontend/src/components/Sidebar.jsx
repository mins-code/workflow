// frontend/src/components/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../lib/ui/Card';

const nav = [
  { label: 'Projects', to: '/' },
  { label: 'Teams', to: '/teams' },
  { label: 'Analytics', to: '/analytics' },
  { label: 'Chat', to: '/gemini' }
];

export default function Sidebar() {
  return (
    <aside className="w-72 h-screen p-6 bg-transparent">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-mb-500 to-mb-700 flex items-center justify-center text-white font-bold shadow">
            MB
          </div>
          <div>
            <div className="mb-h1">Workflow</div>
            <div className="text-sm mb-muted">Magic Bento theme</div>
          </div>
        </div>
      </div>

      <Card soft className="overflow-hidden">
        <nav className="flex flex-col gap-1">
          {nav.map((n) => (
            <Link
              key={n.label}
              to={n.to}
              className="block px-3 py-2 rounded-xl hover:bg-gray-50 hover:translate-x-1 transition transform"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </Card>

      <div className="mt-6">
        <Card soft className="p-4">
          <div className="text-sm mb-muted">Need help?</div>
          <div className="mt-3">
            <Link to="/settings" className="text-sm underline">Settings</Link>
          </div>
        </Card>
      </div>
    </aside>
  );
}
