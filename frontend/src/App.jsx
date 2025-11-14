import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './Dashboard';
import Teams from './pages/Teams';
import NewProject from './pages/NewProject';
import Analytics from './pages/Analytics';
import AuthForm from './components/AuthForm';
import CreateTeamPage from './pages/CreateTeamPage'; // Import the new component

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if a token exists in localStorage
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear the token
    setIsLoggedIn(false); // Update the login state
  };

  const handleAuthSuccess = () => {
    setIsLoggedIn(true); // Update the login state on successful authentication
  };

  if (!isLoggedIn) {
    return (
      <Router>
        <Routes>
          <Route path="/auth" element={<AuthForm onAuthSuccess={handleAuthSuccess} />} />
          <Route path="*" element={<Navigate to="/auth" />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="flex">
        {/* Sidebar */}
        <Sidebar onLogout={handleLogout} />

        {/* Main Content Area */}
        <div className="flex-1 ml-64 p-6 bg-gray-100 min-h-screen">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/teams/new" element={<CreateTeamPage />} /> {/* Add the new route for creating a team */}
            <Route path="/projects/new" element={<NewProject />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;