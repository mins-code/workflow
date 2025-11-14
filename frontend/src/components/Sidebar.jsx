import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ onLogout }) => {
  return (
    <div className="h-screen w-64 bg-gray-900 text-white fixed flex flex-col">
      {/* Application Logo */}
      <div className="p-6 text-center text-2xl font-bold border-b border-gray-700">
        Workflow
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-4">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `block px-4 py-2 rounded-lg font-medium ${
              isActive ? 'bg-gray-700' : 'hover:bg-gray-800'
            }`
          }
        >
          🏠 Dashboard
        </NavLink>
        <NavLink
          to="/teams"
          className={({ isActive }) =>
            `block px-4 py-2 rounded-lg font-medium ${
              isActive ? 'bg-gray-700' : 'hover:bg-gray-800'
            }`
          }
        >
          👥 Teams
        </NavLink>
        <NavLink
          to="/projects/new"
          className={({ isActive }) =>
            `block px-4 py-2 rounded-lg font-medium ${
              isActive ? 'bg-gray-700' : 'hover:bg-gray-800'
            }`
          }
        >
          ➕ New Project
        </NavLink>
        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            `block px-4 py-2 rounded-lg font-medium ${
              isActive ? 'bg-gray-700' : 'hover:bg-gray-800'
            }`
          }
        >
          📊 Analytics
        </NavLink>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={onLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;