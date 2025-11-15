import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const Analytics = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const url = selectedTeamId
          ? `/analytics/teams/${selectedTeamId}/summary`
          : '/analytics/summary';
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

  if (isLoading) {
    return (
      <div className="p-10 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-dark-text text-lg">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10">
        <div className="app-card bg-error bg-opacity-10 border-error">
          <p className="text-error font-bold">❌ {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mb-8">
        <h1 className="app-heading mb-2">📊 Analytics Dashboard</h1>
        <p className="text-dark-text-secondary">Track team performance and workload distribution</p>
      </div>

      {/* Team Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-dark-text mb-4">Select View</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className={`app-card cursor-pointer transition-all ${
              !selectedTeamId ? 'bg-gradient-primary text-white shadow-glow' : 'hover:shadow-card-hover'
            }`}
            onClick={() => setSelectedTeamId(null)}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌍</span>
              <div>
                <h3 className="text-lg font-bold">Global Summary</h3>
                <p className={`text-sm ${!selectedTeamId ? 'text-white text-opacity-80' : 'text-dark-text-secondary'}`}>
                  All teams
                </p>
              </div>
            </div>
          </div>
          
          {teams.map((team) => (
            <div
              key={team.id}
              className={`app-card cursor-pointer transition-all ${
                selectedTeamId === team.id ? 'bg-gradient-primary text-white shadow-glow' : 'hover:shadow-card-hover'
              }`}
              onClick={() => setSelectedTeamId(team.id)}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">👥</span>
                <div>
                  <h3 className="text-lg font-bold">{team.name}</h3>
                  <p className={`text-sm ${selectedTeamId === team.id ? 'text-white text-opacity-80' : 'text-dark-text-secondary'}`}>
                    {team.description || 'Team analytics'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Cards */}
      {analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Members Card */}
          <div className="app-card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-sm font-semibold opacity-90">Total Members</h2>
              <span className="text-3xl">👥</span>
            </div>
            <p className="text-5xl font-bold">{analyticsData.totalMembers}</p>
            <p className="text-sm opacity-80 mt-2">Active team members</p>
          </div>

          {/* Total Projects Card */}
          <div className="app-card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-sm font-semibold opacity-90">Total Projects</h2>
              <span className="text-3xl">📁</span>
            </div>
            <p className="text-5xl font-bold">{analyticsData.totalProjects}</p>
            <p className="text-sm opacity-80 mt-2">Active projects</p>
          </div>

          {/* Average Utilization Card */}
          <div className="app-card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-sm font-semibold opacity-90">Avg Utilization</h2>
              <span className="text-3xl">📈</span>
            </div>
            <p className="text-5xl font-bold">{(analyticsData.avgUtilization * 100).toFixed(0)}%</p>
            <p className="text-sm opacity-80 mt-2">Team capacity used</p>
          </div>

          {/* Skill Gap Alerts Card */}
          <div className="app-card bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-sm font-semibold opacity-90">Skill Gaps</h2>
              <span className="text-3xl">⚠️</span>
            </div>
            <p className="text-5xl font-bold">{analyticsData.skillGapAlerts}</p>
            <p className="text-sm opacity-80 mt-2">Identified gaps</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;