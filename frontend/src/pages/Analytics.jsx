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

  // Determine the color for avgUtilization based on its value
  const getUtilizationColor = (utilization) => {
    if (utilization > 0.75) return 'bg-green-100 text-green-800';
    if (utilization >= 0.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (isLoading) {
    return <div className="p-10 text-gray-500">Loading analytics data...</div>;
  }

  if (error) {
    return <div className="p-10 text-red-500 font-bold">❌ {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📊 Analytics Dashboard</h1>

      {/* Team Selection */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Select a Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className={`p-4 rounded-lg shadow-md cursor-pointer ${
              !selectedTeamId ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'
            }`}
            onClick={() => setSelectedTeamId(null)}
          >
            <h3 className="text-lg font-bold">🌍 Global Summary</h3>
          </div>
          {teams.map((team) => (
            <div
              key={team.id}
              className={`p-4 rounded-lg shadow-md cursor-pointer ${
                selectedTeamId === team.id ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'
              }`}
              onClick={() => setSelectedTeamId(team.id)}
            >
              <h3 className="text-lg font-bold">{team.name}</h3>
              <p className="text-sm">{team.description || 'No description available'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Cards */}
      {analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Members Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-600">Total Members</h2>
            <p className="text-4xl font-bold text-gray-800">{analyticsData.totalMembers}</p>
          </div>

          {/* Total Projects Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-600">Total Projects</h2>
            <p className="text-4xl font-bold text-gray-800">{analyticsData.totalProjects}</p>
          </div>

          {/* Average Utilization Card */}
          <div className={`p-6 rounded-lg shadow-md ${getUtilizationColor(analyticsData.avgUtilization)}`}>
            <h2 className="text-lg font-semibold">Average Utilization</h2>
            <p className="text-4xl font-bold">{(analyticsData.avgUtilization * 100).toFixed(0)}%</p>
          </div>

          {/* Skill Gap Alerts Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-600">Skill Gap Alerts</h2>
            <p className="text-4xl font-bold text-red-600">{analyticsData.skillGapAlerts}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;