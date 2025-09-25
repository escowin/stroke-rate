import { useMemo, useState } from 'react';
import { useDefaultHeartRateZones } from '../hooks/useHeartRateZones';
import { useHistoricalData } from '../hooks/useHistoricalData';
import { HeartRateChart } from './HeartRateChart';
import type { HeartRateData, Rower } from '../types';
import {
  ChartBarIcon,
  ClockIcon,
  HeartIcon,
  ArrowTrendingUpIcon,
  FireIcon
} from '@heroicons/react/24/outline';

interface EnhancedDashboardProps {
  currentSession?: {
    id: string;
    startTime: Date;
    endTime?: Date;
    isActive: boolean;
    heartRateData: HeartRateData[];
    finalHeartRateData?: HeartRateData[];
    rowers: Rower[];
  };
}


// Zone colors
const ZONE_COLORS = {
  recovery: '#10b981',
  aerobic: '#3b82f6', 
  threshold: '#f59e0b',
  anaerobic: '#ef4444'
} as const;

export const EnhancedDashboard = ({ currentSession }: EnhancedDashboardProps) => {
  const { zones } = useDefaultHeartRateZones();
  const { sessions } = useHistoricalData();
  const [selectedComparisonSession, setSelectedComparisonSession] = useState<string | null>(null);




  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    if (!currentSession?.finalHeartRateData || currentSession.finalHeartRateData.length === 0) {
      return null;
    }

    const data = currentSession.finalHeartRateData;
    const heartRates = data.map(d => d.heartRate);
    
    const avgHeartRate = Math.round(heartRates.reduce((sum, hr) => sum + hr, 0) / heartRates.length);
    const maxHeartRate = Math.max(...heartRates);
    const minHeartRate = Math.min(...heartRates);
    
    // Calculate individual rower metrics
    const rowerMetrics = currentSession.rowers.map(rower => {
      const rowerData = data.filter(d => d.deviceId === rower.deviceId);
      if (rowerData.length === 0) return null;
      
      const rowerHeartRates = rowerData.map(d => d.heartRate);
      const avgHR = Math.round(rowerHeartRates.reduce((sum, hr) => sum + hr, 0) / rowerHeartRates.length);
      const maxHR = Math.max(...rowerHeartRates);
      const minHR = Math.min(...rowerHeartRates);
      
      // Calculate zone distribution for this rower
      const zoneCounts = {
        recovery: 0,
        aerobic: 0,
        threshold: 0,
        anaerobic: 0
      };
      
      rowerData.forEach(dataPoint => {
        const heartRate = dataPoint.heartRate;
        if (heartRate >= zones.anaerobic.min) {
          zoneCounts.anaerobic++;
        } else if (heartRate >= zones.threshold.min) {
          zoneCounts.threshold++;
        } else if (heartRate >= zones.aerobic.min) {
          zoneCounts.aerobic++;
        } else {
          zoneCounts.recovery++;
        }
      });
      
      // Calculate percentages and time durations
      const totalDataPoints = rowerData.length;
      const sessionDurationSeconds = currentSession.endTime 
        ? Math.floor((currentSession.endTime.getTime() - currentSession.startTime.getTime()) / 1000)
        : 0;
      
      const zoneBreakdown = Object.entries(zoneCounts).map(([zone, count]) => {
        const percentage = totalDataPoints > 0 ? Math.round((count / totalDataPoints) * 100) : 0;
        const durationSeconds = totalDataPoints > 0 ? Math.round((count / totalDataPoints) * sessionDurationSeconds) : 0;
        const minutes = Math.floor(durationSeconds / 60);
        const seconds = durationSeconds % 60;
        
        return {
          zone,
          count,
          percentage,
          durationSeconds,
          durationFormatted: minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
        };
      });
      
      return {
        rower,
        avgHeartRate: avgHR,
        maxHeartRate: maxHR,
        minHeartRate: minHR,
        dataPoints: rowerData.length,
        zoneBreakdown
      };
    }).filter(Boolean);
    
    // Calculate time in each zone
    const totalDataPoints = data.length;
    const zoneTime = {
      recovery: data.filter(d => d.heartRate < zones.aerobic.min).length,
      aerobic: data.filter(d => d.heartRate >= zones.aerobic.min && d.heartRate < zones.threshold.min).length,
      threshold: data.filter(d => d.heartRate >= zones.threshold.min && d.heartRate < zones.anaerobic.min).length,
      anaerobic: data.filter(d => d.heartRate >= zones.anaerobic.min).length
    };

    return {
      avgHeartRate,
      maxHeartRate,
      minHeartRate,
      totalDataPoints,
      zoneTime,
      rowerMetrics,
      sessionDuration: currentSession.endTime 
        ? Math.floor((currentSession.endTime.getTime() - currentSession.startTime.getTime()) / 1000 / 60)
        : 0
    };
  }, [currentSession, zones]);

  // Calculate progress indicators if a comparison session is selected
  const progressIndicators = useMemo(() => {
    if (!selectedComparisonSession || !sessions || !performanceMetrics) return null;
    
    const comparisonSession = sessions.find(s => s.id === selectedComparisonSession);
    if (!comparisonSession || !comparisonSession.finalHeartRateData) return null;

    // Calculate comparison session metrics
    const comparisonData = comparisonSession.finalHeartRateData;
    const comparisonAvgHR = Math.round(comparisonData.reduce((sum, d) => sum + d.heartRate, 0) / comparisonData.length);
    const comparisonMaxHR = Math.max(...comparisonData.map(d => d.heartRate));
    const comparisonDuration = comparisonSession.endTime 
      ? Math.floor((comparisonSession.endTime.getTime() - comparisonSession.startTime.getTime()) / 1000 / 60)
      : 0;

    // Calculate percentage changes
    const avgHRChange = Math.round(((performanceMetrics.avgHeartRate - comparisonAvgHR) / comparisonAvgHR) * 100);
    const maxHRChange = Math.round(((performanceMetrics.maxHeartRate - comparisonMaxHR) / comparisonMaxHR) * 100);
    const durationChange = comparisonDuration > 0 ? Math.round(((performanceMetrics.sessionDuration - comparisonDuration) / comparisonDuration) * 100) : 0;

    return {
      avgHeartRate: avgHRChange,
      maxHeartRate: maxHRChange,
      duration: durationChange
    };
  }, [selectedComparisonSession, sessions, performanceMetrics]);

  // Calculate individual rower progress indicators
  const rowerProgressIndicators = useMemo(() => {
    if (!selectedComparisonSession || !sessions || !performanceMetrics?.rowerMetrics) return null;
    
    const comparisonSession = sessions.find(s => s.id === selectedComparisonSession);
    if (!comparisonSession || !comparisonSession.finalHeartRateData) return null;

    return performanceMetrics.rowerMetrics.map(currentRowerMetric => {
      if (!currentRowerMetric) return null;
      
      const rowerComparisonData = comparisonSession.finalHeartRateData!.filter(d => d.deviceId === currentRowerMetric.rower.deviceId);
      if (rowerComparisonData.length === 0) return null;

      const comparisonAvgHR = Math.round(rowerComparisonData.reduce((sum, d) => sum + d.heartRate, 0) / rowerComparisonData.length);
      const comparisonMaxHR = Math.max(...rowerComparisonData.map(d => d.heartRate));
      
      const avgHRChange = Math.round(((currentRowerMetric.avgHeartRate - comparisonAvgHR) / comparisonAvgHR) * 100);
      const maxHRChange = Math.round(((currentRowerMetric.maxHeartRate - comparisonMaxHR) / comparisonMaxHR) * 100);

      return {
        rowerId: currentRowerMetric.rower.id,
        avgHeartRate: avgHRChange,
        maxHeartRate: maxHRChange
      };
    }).filter(Boolean);
  }, [selectedComparisonSession, sessions, performanceMetrics]);

  if (!currentSession) {
    return (
      <section className="card-base empty-state">
        <ChartBarIcon className="empty-state-icon" />
        <h3 className="empty-state-title">No Active Session</h3>
        <p className="empty-state-description">
          Start a training session to view enhanced analytics and trends.
        </p>
      </section>
    );
  }

  return (
    <section className="enhanced-dashboard">
      {/* Performance Metrics */}
      {performanceMetrics && (
        <section className="card-base performance-metrics">
          <h3 className="card-title">
            <ArrowTrendingUpIcon className="card-title-icon" />
            Performance Metrics
          </h3>
          <div className="metrics-grid">
            <div className="metric-item">
              <HeartIcon className="metric-icon" />
              <div className="metric-content">
                <p className="metric-value">{performanceMetrics.avgHeartRate}</p>
                <p className="metric-label">Avg BPM</p>
                {progressIndicators && (
                  <div className={`progress-indicator ${
                    progressIndicators.avgHeartRate === 0 ? 'neutral' : 
                    progressIndicators.avgHeartRate < 0 ? 'improvement' : 'decline'
                  }`}>
                    <span className="progress-icon">
                      {progressIndicators.avgHeartRate === 0 ? '—' : 
                       progressIndicators.avgHeartRate < 0 ? '↗' : '↘'}
                    </span>
                    <span className="progress-text">
                      {Math.abs(progressIndicators.avgHeartRate)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="metric-item">
              <FireIcon className="metric-icon" />
              <div className="metric-content">
                <p className="metric-value">{performanceMetrics.maxHeartRate}</p>
                <p className="metric-label">Max BPM</p>
                {progressIndicators && (
                  <div className={`progress-indicator ${
                    progressIndicators.maxHeartRate === 0 ? 'neutral' : 
                    progressIndicators.maxHeartRate < 0 ? 'improvement' : 'decline'
                  }`}>
                    <span className="progress-icon">
                      {progressIndicators.maxHeartRate === 0 ? '—' : 
                       progressIndicators.maxHeartRate < 0 ? '↗' : '↘'}
                    </span>
                    <span className="progress-text">
                      {Math.abs(progressIndicators.maxHeartRate)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="metric-item">
              <ClockIcon className="metric-icon" />
              <div className="metric-content">
                <p className="metric-value">{performanceMetrics.sessionDuration}m</p>
                <p className="metric-label">Duration</p>
                {progressIndicators && (
                  <div className={`progress-indicator ${
                    progressIndicators.duration === 0 ? 'neutral' : 
                    progressIndicators.duration > 0 ? 'improvement' : 'decline'
                  }`}>
                    <span className="progress-icon">
                      {progressIndicators.duration === 0 ? '—' : 
                       progressIndicators.duration > 0 ? '↗' : '↘'}
                    </span>
                    <span className="progress-text">
                      {Math.abs(progressIndicators.duration)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="metric-item">
              <ChartBarIcon className="metric-icon" />
              <div className="metric-content">
                <p className="metric-value">{performanceMetrics.totalDataPoints}</p>
                <p className="metric-label">Data Points</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Individual Rower Metrics */}
      {performanceMetrics?.rowerMetrics && performanceMetrics.rowerMetrics.length > 0 && (
        <section className="card-base rower-metrics">
          <h3 className="card-title">
            <HeartIcon className="card-title-icon" />
            Individual Rower Performance
          </h3>
          <div className="rower-metrics-grid">
            {performanceMetrics.rowerMetrics.map((rowerMetric) => {
              if (!rowerMetric) return null;
              return (
                <div key={rowerMetric.rower.id} className="rower-metric-card">
                  <div className="rower-metric-header">
                    <h4 className="rower-metric-name">{rowerMetric.rower.name}</h4>
                    <span className="rower-metric-seat">Seat {rowerMetric.rower.seat}</span>
                  </div>
                  <div className="rower-metric-stats">
                    <div className="rower-metric-stat">
                      <span className="rower-metric-stat-value">{rowerMetric.avgHeartRate}</span>
                      <span className="rower-metric-stat-label">Avg BPM</span>
                      {rowerProgressIndicators && (() => {
                        const rowerProgress = rowerProgressIndicators.find(p => p?.rowerId === rowerMetric.rower.id);
                        return rowerProgress ? (
                          <div className={`progress-indicator ${
                            rowerProgress.avgHeartRate === 0 ? 'neutral' : 
                            rowerProgress.avgHeartRate < 0 ? 'improvement' : 'decline'
                          }`}>
                            <span className="progress-icon">
                              {rowerProgress.avgHeartRate === 0 ? '—' : 
                               rowerProgress.avgHeartRate < 0 ? '↗' : '↘'}
                            </span>
                            <span className="progress-text">
                              {Math.abs(rowerProgress.avgHeartRate)}%
                            </span>
                          </div>
                        ) : null;
                      })()}
                    </div>
                    <div className="rower-metric-stat">
                      <span className="rower-metric-stat-value">{rowerMetric.maxHeartRate}</span>
                      <span className="rower-metric-stat-label">Max BPM</span>
                      {rowerProgressIndicators && (() => {
                        const rowerProgress = rowerProgressIndicators.find(p => p?.rowerId === rowerMetric.rower.id);
                        return rowerProgress ? (
                          <div className={`progress-indicator ${
                            rowerProgress.maxHeartRate === 0 ? 'neutral' : 
                            rowerProgress.maxHeartRate < 0 ? 'improvement' : 'decline'
                          }`}>
                            <span className="progress-icon">
                              {rowerProgress.maxHeartRate === 0 ? '—' : 
                               rowerProgress.maxHeartRate < 0 ? '↗' : '↘'}
                            </span>
                            <span className="progress-text">
                              {Math.abs(rowerProgress.maxHeartRate)}%
                            </span>
                          </div>
                        ) : null;
                      })()}
                    </div>
                    <div className="rower-metric-stat">
                      <span className="rower-metric-stat-value">{rowerMetric.dataPoints}</span>
                      <span className="rower-metric-stat-label">Data Points</span>
                    </div>
                  </div>
                  
                  {/* Heart Rate Zone Breakdown */}
                  <div className="rower-zone-breakdown">
                    <h5 className="rower-zone-breakdown-title">Heart Rate Zones</h5>
                    <div className="rower-zone-list">
                      {rowerMetric.zoneBreakdown.map((zoneData) => (
                        <div key={zoneData.zone} className="rower-zone-item">
                          <div className="rower-zone-header">
                            <span 
                              className="rower-zone-color" 
                              style={{ backgroundColor: ZONE_COLORS[zoneData.zone as keyof typeof ZONE_COLORS] }}
                            />
                            <span className="rower-zone-name">
                              {zoneData.zone.charAt(0).toUpperCase() + zoneData.zone.slice(1)}
                            </span>
                          </div>
                          <div className="rower-zone-details">
                            <span className="rower-zone-percentage">{zoneData.percentage}%</span>
                            <span className="rower-zone-duration">{zoneData.durationFormatted}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Session Analysis Chart - Only show after session ends (same as basic view) */}
      {currentSession && !currentSession.isActive && currentSession.finalHeartRateData && currentSession.finalHeartRateData.length > 0 && (
        <HeartRateChart
          data={currentSession.finalHeartRateData}
          rowers={currentSession.rowers}
          sessionStartTime={currentSession.startTime}
          sessionEndTime={currentSession.endTime}
        />
      )}


      {/* Session Selection for Comparison */}
      {sessions && sessions.length > 0 && (
        <section className="card-base session-selection">
          <h3 className="card-title">
            <ArrowTrendingUpIcon className="card-title-icon" />
            Compare with Previous Session
          </h3>
          <div className="session-selection-grid">
            {sessions
              .filter(session => session.id !== currentSession.id) // Exclude current session
              .map(session => (
                <div
                  key={session.id}
                  className={`session-selection-card ${selectedComparisonSession === session.id ? 'selected' : ''}`}
                  onClick={() => setSelectedComparisonSession(selectedComparisonSession === session.id ? null : session.id)}
                >
                  <div className="session-selection-header">
                    <input
                      type="radio"
                      name="session-comparison"
                      checked={selectedComparisonSession === session.id}
                      onChange={() => setSelectedComparisonSession(selectedComparisonSession === session.id ? null : session.id)}
                      className="session-selection-radio"
                    />
                    <div className="session-selection-info">
                      <span className="session-selection-date">
                        {session.startTime.toLocaleDateString()} {session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="session-selection-details">
                        {session.rowers.length} rowers • {session.finalHeartRateData?.length || 0} data points
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}
    </section>
  );
};
