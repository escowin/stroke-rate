import React, { useState, useMemo } from 'react';
import {
  ChartBarIcon,
  CalendarDaysIcon,
  FlagIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useHistoricalData } from '../hooks/useHistoricalData';
import { useDefaultHeartRateZones } from '../hooks/useHeartRateZones';
import { generateProgressReport } from '../utils/progressTracking';

interface ProgressTrackingProps {
  className?: string;
}

export const ProgressTracking: React.FC<ProgressTrackingProps> = ({ 
  className = '' 
}) => {
  const { sessions } = useHistoricalData();
  const { zones } = useDefaultHeartRateZones();
  const [selectedPeriod, setSelectedPeriod] = useState<number>(30);
  const [selectedRower, setSelectedRower] = useState<string | null>(null);
  const [showGoals, setShowGoals] = useState(false);
  const [showPhases, setShowPhases] = useState(false);

  // Generate progress report
  const progressReport = useMemo(() => {
    const report = generateProgressReport(sessions, zones, [], [], selectedPeriod);
    
    // Debug logging
    console.log('Progress Report Debug:', {
      totalSessions: sessions.length,
      sessionsWithData: sessions.filter(s => s.finalHeartRateData && s.finalHeartRateData.length > 0).length,
      individualProgress: report.individualProgress.length,
      firstRowerTrends: report.individualProgress[0]?.trends?.map(t => ({
        metric: t.metric,
        changeRate: t.changeRate,
        confidence: t.confidence,
        direction: t.direction
      }))
    });
    
    return report;
  }, [sessions, zones, selectedPeriod]);

  const { crewProgress, individualProgress, insights } = progressReport;

  // Prepare chart data
  const trendChartData = useMemo(() => {
    const data = crewProgress.synchronizationTrend.trendData.map((point, index) => ({
      date: point.date.toLocaleDateString(),
      synchronization: point.value,
      performance: crewProgress.performanceTrend.trendData[index]?.value || 0,
      cohesion: crewProgress.cohesionTrend.trendData[index]?.value || 0
    }));
    return data;
  }, [crewProgress]);


  const zoneDistributionData = useMemo(() => {
    const recentSessions = sessions
      .filter(s => s.finalHeartRateData && s.finalHeartRateData.length > 0)
      .slice(-5); // Last 5 sessions

    if (recentSessions.length === 0) return [];

    const zoneTotals = { recovery: 0, aerobic: 0, threshold: 0, anaerobic: 0 };
    
    recentSessions.forEach(session => {
      const sessionData = session.finalHeartRateData!;
      
      sessionData.forEach(data => {
        const zone = data.zone;
        if (zone in zoneTotals) {
          zoneTotals[zone as keyof typeof zoneTotals]++;
        }
      });
    });

    return Object.entries(zoneTotals).map(([zone, count]) => ({
      zone: zone.charAt(0).toUpperCase() + zone.slice(1),
      count,
      percentage: Math.round((count / Object.values(zoneTotals).reduce((sum, val) => sum + val, 0)) * 100)
    }));
  }, [sessions]);

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'improving':
        return <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />;
      case 'declining':
        return <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'improving':
        return 'text-green-600';
      case 'declining':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };


  const getMetricDisplayName = (metric: string): string => {
    const metricMap: Record<string, string> = {
      'metrics.avgHeartRate': 'Average Heart Rate',
      'metrics.maxHeartRate': 'Max Heart Rate',
      'metrics.trimp': 'TRIMP Score',
      'metrics.consistencyScore': 'Consistency',
      'metrics.effortScore': 'Effort Level',
      'crewSynchronization': 'Crew Synchronization',
      'crewCohesion': 'Crew Cohesion',
      'performanceScore': 'Performance Score'
    };
    
    return metricMap[metric] || metric.replace('metrics.', '').replace(/([A-Z])/g, ' $1').trim();
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <div className={`progress-tracking ${className}`}>
      {/* Header Controls */}
      <section className="card-base progress-header">
        <div className="progress-header-content">
          <h2 className="progress-header-title">
            <ArrowTrendingUpIcon className="progress-header-icon" />
            Progress Tracking
          </h2>
          <div className="progress-header-controls">
            <div className="period-selector">
              <label className="period-selector-label">Time Period:</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(Number(e.target.value))}
                className="period-selector-select"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
                <option value={180}>Last 6 months</option>
              </select>
            </div>
            <div className="view-toggles">
              <button
                className={`view-toggle ${showGoals ? 'active' : ''}`}
                onClick={() => setShowGoals(!showGoals)}
              >
                <FlagIcon className="view-toggle-icon" />
                Goals
              </button>
              <button
                className={`view-toggle ${showPhases ? 'active' : ''}`}
                onClick={() => setShowPhases(!showPhases)}
              >
                <CalendarDaysIcon className="view-toggle-icon" />
                Phases
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Overview Metrics */}
      <section className="card-base progress-overview">
        <h3 className="card-title">
          <ChartBarIcon className="card-title-icon" />
          Progress Overview
        </h3>
        
        <div className="progress-overview-grid">
          <div className="progress-metric">
            <div className="progress-metric-header">
              <span className="progress-metric-label">Crew Progress</span>
              <span className={`progress-metric-value ${getProgressColor(crewProgress.overallProgress)}`}>
                {crewProgress.overallProgress}%
              </span>
            </div>
            <progress 
              className="progress-metric-progress"
              value={crewProgress.overallProgress} 
              max={100}
              aria-label={`Crew progress: ${crewProgress.overallProgress}%`}
            />
          </div>

          <div className="progress-metric">
            <div className="progress-metric-header">
              <span className="progress-metric-label">Sessions Completed</span>
              <span className="progress-metric-value">{progressReport.totalSessions}</span>
            </div>
          </div>

          <div className="progress-metric">
            <div className="progress-metric-header">
              <span className="progress-metric-label">Improving Rowers</span>
              <span className="progress-metric-value">
                {individualProgress.filter(ip => ip.overallProgress > 70).length}/{individualProgress.length}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Trend Charts */}
      <section className="card-base trend-charts">
        <h3 className="card-title">
          <ArrowTrendingUpIcon className="card-title-icon" />
          Performance Trends
        </h3>
        
        <div className="trend-charts-content">
          <div className="trend-chart">
            <h4 className="trend-chart-title">Crew Metrics Over Time</h4>
            <div className="trend-chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="synchronization" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Synchronization"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="performance" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Performance"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cohesion" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="Cohesion"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="trend-chart">
            <h4 className="trend-chart-title">Zone Distribution (Last 5 Sessions)</h4>
            <div className="trend-chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={zoneDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ zone, percentage }) => `${zone} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {zoneDistributionData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Individual Rower Progress */}
      <section className="card-base individual-progress">
        <h3 className="card-title">
          <UserGroupIcon className="card-title-icon" />
          Individual Rower Progress
        </h3>
        
        <div className="individual-progress-content">
          <div className="rower-selector">
            <label className="rower-selector-label">Select Rower:</label>
            <select
              value={selectedRower || ''}
              onChange={(e) => setSelectedRower(e.target.value || null)}
              className="rower-selector-select"
            >
              <option value="">All Rowers</option>
              {individualProgress.map(rower => (
                <option key={rower.rowerId} value={rower.rowerId}>
                  {rower.rowerName} (Seat {rower.seat})
                </option>
              ))}
            </select>
          </div>

          <div className="individual-progress-grid">
            {individualProgress.map(rower => (
              <div key={rower.rowerId} className="rower-progress-card">
                <div className="rower-progress-header">
                  <h4 className="rower-progress-name">{rower.rowerName}</h4>
                  <span className="rower-progress-seat">Seat {rower.seat}</span>
                </div>
                
                <div className="rower-progress-metrics">
                  <div className="rower-progress-metric">
                    <span className="rower-progress-metric-label">Overall Progress</span>
                    <div className="rower-progress-metric-value">
                      <span className={`rower-progress-score ${getProgressColor(rower.overallProgress)}`}>
                        {rower.overallProgress}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="rower-progress-trends">
                    {rower.trends.slice(0, 3).map(trend => (
                      <div key={trend.metric} className="rower-trend-item">
                        <div className="rower-trend-header">
                          <span className="rower-trend-metric">{getMetricDisplayName(trend.metric)}</span>
                          {getTrendIcon(trend.direction)}
                        </div>
                        <div className="rower-trend-details">
                          <span className={`rower-trend-rate ${getTrendColor(trend.direction)}`}>
                            {trend.changeRate > 0 ? '+' : ''}{trend.changeRate}%/week
                          </span>
                          <span className="rower-trend-confidence">
                            {trend.confidence}% confidence
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {rower.strengths.length > 0 && (
                  <div className="rower-strengths">
                    <h5 className="rower-strengths-title">Strengths</h5>
                    <ul className="rower-strengths-list">
                      {rower.strengths.map((strength, index) => (
                        <li key={index} className="rower-strength-item">
                          <CheckCircleIcon className="rower-strength-icon" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {rower.improvementAreas.length > 0 && (
                  <div className="rower-improvements">
                    <h5 className="rower-improvements-title">Areas for Improvement</h5>
                    <ul className="rower-improvements-list">
                      {rower.improvementAreas.map((area, index) => (
                        <li key={index} className="rower-improvement-item">
                          <ExclamationTriangleIcon className="rower-improvement-icon" />
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Insights and Recommendations */}
      <section className="card-base progress-insights">
        <h3 className="card-title">
          <LightBulbIcon className="card-title-icon" />
          Insights & Recommendations
        </h3>
        
        <div className="progress-insights-content">
          {insights.keyImprovements.length > 0 && (
            <div className="insight-section">
              <h4 className="insight-section-title">
                <CheckCircleIcon className="insight-section-icon" />
                Key Improvements
              </h4>
              <ul className="insight-list">
                {insights.keyImprovements.map((improvement, index) => (
                  <li key={index} className="insight-item improvement">
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {insights.areasOfConcern.length > 0 && (
            <div className="insight-section">
              <h4 className="insight-section-title">
                <ExclamationTriangleIcon className="insight-section-icon" />
                Areas of Concern
              </h4>
              <ul className="insight-list">
                {insights.areasOfConcern.map((concern, index) => (
                  <li key={index} className="insight-item concern">
                    {concern}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {insights.recommendations.length > 0 && (
            <div className="insight-section">
              <h4 className="insight-section-title">
                <LightBulbIcon className="insight-section-icon" />
                Recommendations
              </h4>
              <ul className="insight-list">
                {insights.recommendations.map((recommendation, index) => (
                  <li key={index} className="insight-item recommendation">
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="insight-section">
            <h4 className="insight-section-title">
              <FlagIcon className="insight-section-icon" />
              Next Phase Focus
            </h4>
            <p className="insight-focus-text">{insights.nextPhaseFocus}</p>
          </div>
        </div>
      </section>
    </div>
  );
};
