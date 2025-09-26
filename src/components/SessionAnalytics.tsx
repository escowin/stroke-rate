import React, { useMemo } from 'react';
import {
  ChartBarIcon,
  HeartIcon,
  FireIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import type { TrainingSession, HeartRateZones } from '../types';
import { generateSessionReport } from '../utils/sessionAnalytics';

interface SessionAnalyticsProps {
  session: TrainingSession;
  zones: HeartRateZones;
  className?: string;
}

export const SessionAnalytics: React.FC<SessionAnalyticsProps> = ({ 
  session, 
  zones, 
  className = '' 
}) => {
  const report = useMemo(() => {
    return generateSessionReport(session, zones);
  }, [session, zones]);

  const { overallMetrics, rowerAnalytics, crewAnalysis, insights } = report;

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getZoneColor = (zone: string): string => {
    const colors = {
      recovery: '#10b981',
      aerobic: '#3b82f6',
      threshold: '#f59e0b',
      anaerobic: '#ef4444'
    };
    return colors[zone as keyof typeof colors] || '#6b7280';
  };

  return (
    <div className={`session-analytics ${className}`}>
      {/* Session Overview */}
      <section className="card-base analytics-overview">
        <h3 className="card-title">
          <ChartBarIcon className="card-title-icon" />
          Session Analytics
        </h3>
        
        <div className="analytics-overview-grid">
          {/* Basic Metrics */}
          <div className="analytics-metric-group">
            <h4 className="analytics-metric-group-title">Basic Metrics</h4>
            <div className="analytics-metric-grid">
              <div className="analytics-metric">
                <HeartIcon className="analytics-metric-icon" />
                <div className="analytics-metric-content">
                  <span className="analytics-metric-value">{overallMetrics.avgHeartRate}</span>
                  <span className="analytics-metric-label">Avg BPM</span>
                </div>
              </div>
              <div className="analytics-metric">
                <FireIcon className="analytics-metric-icon" />
                <div className="analytics-metric-content">
                  <span className="analytics-metric-value">{overallMetrics.maxHeartRate}</span>
                  <span className="analytics-metric-label">Max BPM</span>
                </div>
              </div>
              <div className="analytics-metric">
                <ClockIcon className="analytics-metric-icon" />
                <div className="analytics-metric-content">
                  <span className="analytics-metric-value">{overallMetrics.duration}</span>
                  <span className="analytics-metric-label">Duration (m)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Metrics */}
          <div className="analytics-metric-group">
            <h4 className="analytics-metric-group-title">Training Load</h4>
            <div className="analytics-metric-grid">
              <div className="analytics-metric">
                <ArrowTrendingUpIcon className="analytics-metric-icon" />
                <div className="analytics-metric-content">
                  <span className="analytics-metric-value">{overallMetrics.trimp}</span>
                  <span className="analytics-metric-label">TRIMP</span>
                </div>
              </div>
              <div className="analytics-metric">
                <ArrowTrendingUpIcon className="analytics-metric-icon" />
                <div className="analytics-metric-content">
                  <span className="analytics-metric-value">{overallMetrics.tss}</span>
                  <span className="analytics-metric-label">TSS</span>
                </div>
              </div>
              <div className="analytics-metric">
                <ChartBarIcon className="analytics-metric-icon" />
                <div className="analytics-metric-content">
                  <span className="analytics-metric-value">{overallMetrics.intensityFactor.toFixed(2)}</span>
                  <span className="analytics-metric-label">Intensity</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Scores */}
      <section className="card-base performance-scores">
        <h3 className="card-title">
          <ArrowTrendingUpIcon className="card-title-icon" />
          Performance Scores
        </h3>
        
        <div className="performance-scores-grid">
          <div className={`performance-score ${getScoreBgColor(overallMetrics.performanceScore)}`}>
            <div className="performance-score-header">
              <span className="performance-score-label">Performance</span>
              <span className={`performance-score-value ${getScoreColor(overallMetrics.performanceScore)}`}>
                {overallMetrics.performanceScore}
              </span>
            </div>
            <div className="performance-score-bar">
              <div 
                className="performance-score-fill"
                style={{ 
                  width: `${overallMetrics.performanceScore}%`,
                  backgroundColor: getScoreColor(overallMetrics.performanceScore).replace('text-', '')
                }}
              />
            </div>
          </div>

          <div className={`performance-score ${getScoreBgColor(overallMetrics.consistencyScore)}`}>
            <div className="performance-score-header">
              <span className="performance-score-label">Consistency</span>
              <span className={`performance-score-value ${getScoreColor(overallMetrics.consistencyScore)}`}>
                {overallMetrics.consistencyScore}
              </span>
            </div>
            <div className="performance-score-bar">
              <div 
                className="performance-score-fill"
                style={{ 
                  width: `${overallMetrics.consistencyScore}%`,
                  backgroundColor: getScoreColor(overallMetrics.consistencyScore).replace('text-', '')
                }}
              />
            </div>
          </div>

          <div className={`performance-score ${getScoreBgColor(overallMetrics.effortScore)}`}>
            <div className="performance-score-header">
              <span className="performance-score-label">Effort</span>
              <span className={`performance-score-value ${getScoreColor(overallMetrics.effortScore)}`}>
                {overallMetrics.effortScore}
              </span>
            </div>
            <div className="performance-score-bar">
              <div 
                className="performance-score-fill"
                style={{ 
                  width: `${overallMetrics.effortScore}%`,
                  backgroundColor: getScoreColor(overallMetrics.effortScore).replace('text-', '')
                }}
              />
            </div>
          </div>

          <div className={`performance-score ${getScoreBgColor(overallMetrics.recoveryScore)}`}>
            <div className="performance-score-header">
              <span className="performance-score-label">Recovery</span>
              <span className={`performance-score-value ${getScoreColor(overallMetrics.recoveryScore)}`}>
                {overallMetrics.recoveryScore}
              </span>
            </div>
            <div className="performance-score-bar">
              <div 
                className="performance-score-fill"
                style={{ 
                  width: `${overallMetrics.recoveryScore}%`,
                  backgroundColor: getScoreColor(overallMetrics.recoveryScore).replace('text-', '')
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Zone Analysis */}
      <section className="card-base zone-analysis">
        <h3 className="card-title">
          <ChartBarIcon className="card-title-icon" />
          Heart Rate Zone Analysis
        </h3>
        
        <div className="zone-analysis-content">
          <div className="zone-distribution">
            <h4 className="zone-distribution-title">Time Distribution</h4>
            <div className="zone-distribution-bars">
              {Object.entries(overallMetrics.zoneDistribution).map(([zone, percentage]) => (
                <div key={zone} className="zone-distribution-bar">
                  <div className="zone-distribution-bar-header">
                    <span 
                      className="zone-distribution-bar-color"
                      style={{ backgroundColor: getZoneColor(zone) }}
                    />
                    <span className="zone-distribution-bar-label">
                      {zone.charAt(0).toUpperCase() + zone.slice(1)}
                    </span>
                    <span className="zone-distribution-bar-percentage">{percentage}%</span>
                  </div>
                  <div className="zone-distribution-bar-track">
                    <div 
                      className="zone-distribution-bar-fill"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: getZoneColor(zone)
                      }}
                    />
                  </div>
                  <div className="zone-distribution-bar-time">
                    {overallMetrics.timeInZones[zone as keyof typeof overallMetrics.timeInZones]}m
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Crew Analysis */}
      <section className="card-base crew-analysis">
        <h3 className="card-title">
          <UserGroupIcon className="card-title-icon" />
          Crew Analysis
        </h3>
        
        <div className="crew-analysis-content">
          <div className="crew-metrics">
            <div className="crew-metric">
              <span className="crew-metric-label">Synchronization</span>
              <div className="crew-metric-value">
                <span className={`crew-metric-score ${getScoreColor(overallMetrics.crewSynchronization)}`}>
                  {overallMetrics.crewSynchronization}
                </span>
                <span className="crew-metric-unit">/100</span>
              </div>
            </div>
            <div className="crew-metric">
              <span className="crew-metric-label">Cohesion</span>
              <div className="crew-metric-value">
                <span className={`crew-metric-score ${getScoreColor(overallMetrics.crewCohesion)}`}>
                  {overallMetrics.crewCohesion}
                </span>
                <span className="crew-metric-unit">/100</span>
              </div>
            </div>
          </div>

          {/* Individual Rower Performance */}
          <div className="rower-performance">
            <h4 className="rower-performance-title">Individual Performance</h4>
            <div className="rower-performance-grid">
              {rowerAnalytics.map(rower => (
                <div key={rower.rowerId} className="rower-performance-card">
                  <div className="rower-performance-header">
                    <span className="rower-performance-name">{rower.rowerName}</span>
                    <span className="rower-performance-seat">Seat {rower.seat}</span>
                  </div>
                  <div className="rower-performance-metrics">
                    <div className="rower-performance-metric">
                      <HeartIcon className="rower-performance-metric-icon" />
                      <span className="rower-performance-metric-value">{rower.metrics.avgHeartRate}</span>
                      <span className="rower-performance-metric-label">Avg BPM</span>
                    </div>
                    <div className="rower-performance-metric">
                      <ArrowTrendingUpIcon className="rower-performance-metric-icon" />
                      <span className="rower-performance-metric-value">{rower.metrics.trimp}</span>
                      <span className="rower-performance-metric-label">TRIMP</span>
                    </div>
                    <div className="rower-performance-metric">
                      <ChartBarIcon className="rower-performance-metric-icon" />
                      <span className={`rower-performance-metric-value ${getScoreColor(rower.metrics.consistencyScore)}`}>
                        {rower.metrics.consistencyScore}
                      </span>
                      <span className="rower-performance-metric-label">Consistency</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Training Insights */}
      <section className="card-base training-insights">
        <h3 className="card-title">
          <LightBulbIcon className="card-title-icon" />
          Training Insights
        </h3>
        
        <div className="training-insights-content">
          <div className="insight-section">
            <h4 className="insight-section-title">Primary Training Zone</h4>
            <div className="insight-primary-zone">
              <span 
                className="insight-zone-indicator"
                style={{ backgroundColor: getZoneColor(insights.primaryTrainingZone) }}
              />
              <span className="insight-zone-name">
                {insights.primaryTrainingZone.charAt(0).toUpperCase() + insights.primaryTrainingZone.slice(1)}
              </span>
              <span className="insight-zone-effectiveness">
                {insights.trainingEffectiveness}% effectiveness
              </span>
            </div>
          </div>

          {insights.strengths.length > 0 && (
            <div className="insight-section">
              <h4 className="insight-section-title">
                <CheckCircleIcon className="insight-section-icon" />
                Strengths
              </h4>
              <ul className="insight-list">
                {insights.strengths.map((strength, index) => (
                  <li key={index} className="insight-item strength">
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {insights.improvementAreas.length > 0 && (
            <div className="insight-section">
              <h4 className="insight-section-title">
                <ExclamationTriangleIcon className="insight-section-icon" />
                Areas for Improvement
              </h4>
              <ul className="insight-list">
                {insights.improvementAreas.map((area, index) => (
                  <li key={index} className="insight-item improvement">
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {crewAnalysis.recommendations.length > 0 && (
            <div className="insight-section">
              <h4 className="insight-section-title">
                <UserGroupIcon className="insight-section-icon" />
                Crew Recommendations
              </h4>
              <ul className="insight-list">
                {crewAnalysis.recommendations.map((recommendation, index) => (
                  <li key={index} className="insight-item recommendation">
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Recovery Information */}
      <section className="card-base recovery-info">
        <h3 className="card-title">
          <ClockIcon className="card-title-icon" />
          Recovery Information
        </h3>
        
        <div className="recovery-info-content">
          <div className="recovery-metric">
            <span className="recovery-metric-label">Estimated Recovery Time</span>
            <span className="recovery-metric-value">{overallMetrics.recoveryTime}h</span>
          </div>
          <div className="recovery-metric">
            <span className="recovery-metric-label">Heart Rate Variability</span>
            <span className="recovery-metric-value">{overallMetrics.heartRateVariability}</span>
          </div>
          <div className="recovery-metric">
            <span className="recovery-metric-label">Recovery Score</span>
            <span className={`recovery-metric-value ${getScoreColor(overallMetrics.recoveryScore)}`}>
              {overallMetrics.recoveryScore}/100
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
