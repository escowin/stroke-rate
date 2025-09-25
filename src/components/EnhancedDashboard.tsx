import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
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

  // Historical comparison data
  const historicalComparison = useMemo(() => {
    if (!sessions || sessions.length < 2) return null;

    const recentSessions = sessions
      .filter(s => !s.isActive)
      .slice(0, 5)
      .map(session => {
        if (!session.heartRateData || session.heartRateData.length === 0) {
          return null;
        }

        const heartRates = session.heartRateData.map(d => d.heartRate);
        const avgHeartRate = Math.round(heartRates.reduce((sum, hr) => sum + hr, 0) / heartRates.length);
        
        return {
          date: session.startTime.toLocaleDateString(),
          avgHeartRate,
          duration: session.endTime 
            ? Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000 / 60)
            : 0
        };
      })
      .filter(Boolean);

    return recentSessions;
  }, [sessions]);

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
    <div className="enhanced-dashboard">
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
              </div>
            </div>
            <div className="metric-item">
              <FireIcon className="metric-icon" />
              <div className="metric-content">
                <p className="metric-value">{performanceMetrics.maxHeartRate}</p>
                <p className="metric-label">Max BPM</p>
              </div>
            </div>
            <div className="metric-item">
              <ClockIcon className="metric-icon" />
              <div className="metric-content">
                <p className="metric-value">{performanceMetrics.sessionDuration}m</p>
                <p className="metric-label">Duration</p>
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
                    </div>
                    <div className="rower-metric-stat">
                      <span className="rower-metric-stat-value">{rowerMetric.maxHeartRate}</span>
                      <span className="rower-metric-stat-label">Max BPM</span>
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


      {/* Historical Comparison */}
      {historicalComparison && historicalComparison.length > 0 && (
        <section className="card-base historical-comparison">
          <h3 className="card-title">
            <ArrowTrendingUpIcon className="card-title-icon" />
            Recent Session Comparison
          </h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={historicalComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[100, 200]} />
                <Tooltip />
                <Bar dataKey="avgHeartRate" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}
    </div>
  );
};
