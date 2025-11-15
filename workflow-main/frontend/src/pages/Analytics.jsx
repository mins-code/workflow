import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const Analytics = () => {
  const [teams, setTeams] = useState([]); // List of all teams
  const [selectedTeamId, setSelectedTeamId] = useState(null); // Selected team ID for drill-down
  const [analyticsData, setAnalyticsData] = useState(null); // Analytics data (global or team-specific)
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all teams on load
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await apiClient.get('/teams');
        setTeams(response.data);
      } catch (err) {
        setError('Failed to fetch teams.');
        console.error(err);
      }
    };

    fetchTeams();
  }, []);

  // Fetch analytics data (global or team-specific) based on `selectedTeamId`
  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const url = selectedTeamId
          ? `/analytics/teams/${selectedTeamId}/summary` // Team-specific analytics
          : '/analytics/summary'; // Global analytics
        const response = await apiClient.get(url);
        setAnalyticsData(response.data);
      } catch (err) {
        setError('Failed to fetch analytics data.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedTeamId]);

  // REMOVED: The getUtilizationColor function is no longer needed.

  if (isLoading) {
    return <div className="p-10 text-dark-text">Loading analytics data...</div>;
  }

  if (error) {
    return <div className="p-10 text-red-400 font-bold">❌ {error}</div>;
  }

  return (
    <div className="min-h-screen bg-dark-bg p-8 font-sans">
      <h1 className="text-3xl font-bold text-dark-text mb-6">📊 Analytics Dashboard</h1>

      {/* Team Selection */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-black mb-4">Select a Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className={`p-4 rounded-lg shadow-md cursor-pointer ${
              !selectedTeamId ? 'bg-dark-accent text-dark-bg' : 'bg-dark-surface text-dark-text'
            }`}
            onClick={() => setSelectedTeamId(null)}
          >
            <h3 className="text-lg font-bold">🌍 Global Summary</h3>
          </div>
          {teams.map((team) => (
            <div
              key={team.id}
              className={`p-4 rounded-lg shadow-md cursor-pointer ${
                selectedTeamId === team.id ? 'bg-dark-accent text-dark-bg' : 'bg-dark-surface text-dark-text'
              }`}
              onClick={() => setSelectedTeamId(team.id)}
            >
              <h3 className="text-lg font-bold">{team.name}</h3>
              <p className="text-sm text-dark-muted">{team.description || 'No description available'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Cards */}
      {analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Members Card - Using Dark Theme Card Styles */}
          <div className="bg-dark-surface p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-dark-muted">Total Members</h2>
            <p className="text-4xl font-bold text-dark-text">{analyticsData.totalMembers}</p>
          </div>

          {/* Total Projects Card - Using Dark Theme Card Styles */}
          <div className="bg-dark-surface p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-dark-muted">Total Projects</h2>
            <p className="text-4xl font-bold text-dark-text">{analyticsData.totalProjects}</p>
          </div>

          {/* Average Utilization Card - NOW USING STATIC DARK THEME STYLES */}
          <div className="bg-dark-surface p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-dark-muted">Average Utilization</h2>
            <p className="text-4xl font-bold text-dark-text">{(analyticsData.avgUtilization * 100).toFixed(0)}%</p>
          </div>

          {/* Skill Gap Alerts Card - Using Dark Theme Card Styles */}
          <div className="bg-dark-surface p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-dark-muted">Skill Gap Alerts</h2>
            {/* Keeping the red color for the alert count as a visual cue */}
            <p className="text-4xl font-bold text-red-400">{analyticsData.skillGapAlerts}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;