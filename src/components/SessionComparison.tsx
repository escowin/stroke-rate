import { useState, useMemo } from 'react';
import { useHistoricalData } from '../hooks/useHistoricalData';
import { useDefaultHeartRateZones } from '../hooks/useHeartRateZones';
import type { TrainingSession } from '../types';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  UserGroupIcon,
  HeartIcon,
  FireIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface SessionComparisonProps {
  currentSession?: TrainingSession;
}

// Zone colors
const ZONE_COLORS = {
  recovery: '#10b981',
  aerobic: '#3b82f6', 
  threshold: '#f59e0b',
  anaerobic: '#ef4444'
} as const;

export const SessionComparison = ({ currentSession }: SessionComparisonProps) => {
  const { sessions } = useHistoricalData();
  const { zones } = useDefaultHeartRateZones();
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);

  // Get all available sessions (including current if it's ended)
  const availableSessions = useMemo(() => {
    const allSessions = [...sessions];
    if (currentSession && !currentSession.isActive && currentSession.finalHeartRateData) {
      allSessions.unshift(currentSession);
    }
    return allSessions
      .filter(session => session.finalHeartRateData && session.finalHeartRateData.length > 0)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }, [sessions, currentSession]);

  // Calculate comparison data for selected sessions
  const comparisonData = useMemo(() => {
    if (selectedSessions.length < 2) return null;

    const selectedSessionData = selectedSessions
      .map(sessionId => availableSessions.find(s => s.id === sessionId))
      .filter(Boolean) as TrainingSession[];

    // Calculate metrics for each session
    const sessionMetrics = selectedSessionData.map(session => {
      const data = session.finalHeartRateData!;
      const heartRates = data.map(d => d.heartRate);
      
      const avgHeartRate = Math.round(heartRates.reduce((sum, hr) => sum + hr, 0) / heartRates.length);
      const maxHeartRate = Math.max(...heartRates);
      const minHeartRate = Math.min(...heartRates);
      
      // Calculate zone distribution for session
      const zoneCounts = {
        recovery: 0,
        aerobic: 0,
        threshold: 0,
        anaerobic: 0
      };
      
      data.forEach(dataPoint => {
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
      
      const totalDataPoints = data.length;
      const sessionDurationSeconds = session.endTime 
        ? Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000)
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
      
      // Calculate individual rower metrics
      const rowerMetrics = session.rowers.map(rower => {
        const rowerData = data.filter(d => d.deviceId === rower.deviceId);
        if (rowerData.length === 0) return null;
        
        const rowerHeartRates = rowerData.map(d => d.heartRate);
        const avgHR = Math.round(rowerHeartRates.reduce((sum, hr) => sum + hr, 0) / rowerHeartRates.length);
        const maxHR = Math.max(...rowerHeartRates);
        
        // Calculate zone breakdown for this rower
        const rowerZoneCounts = {
          recovery: 0,
          aerobic: 0,
          threshold: 0,
          anaerobic: 0
        };
        
        rowerData.forEach(dataPoint => {
          const heartRate = dataPoint.heartRate;
          if (heartRate >= zones.anaerobic.min) {
            rowerZoneCounts.anaerobic++;
          } else if (heartRate >= zones.threshold.min) {
            rowerZoneCounts.threshold++;
          } else if (heartRate >= zones.aerobic.min) {
            rowerZoneCounts.aerobic++;
          } else {
            rowerZoneCounts.recovery++;
          }
        });
        
        const rowerZoneBreakdown = Object.entries(rowerZoneCounts).map(([zone, count]) => {
          const percentage = rowerData.length > 0 ? Math.round((count / rowerData.length) * 100) : 0;
          const durationSeconds = rowerData.length > 0 ? Math.round((count / rowerData.length) * sessionDurationSeconds) : 0;
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
          dataPoints: rowerData.length,
          zoneBreakdown: rowerZoneBreakdown
        };
      }).filter(Boolean);

      return {
        session,
        avgHeartRate,
        maxHeartRate,
        minHeartRate,
        rowerMetrics,
        zoneBreakdown,
        sessionDate: session.startTime.toLocaleDateString(),
        sessionTime: session.startTime.toLocaleTimeString(),
        duration: session.endTime 
          ? Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000 / 60)
          : 0
      };
    });

    return sessionMetrics;
  }, [selectedSessions, availableSessions]);

  // Calculate rower comparison data
  const rowerComparisonData = useMemo(() => {
    if (!comparisonData || comparisonData.length < 2) return null;

    // Get all unique rowers across sessions
    const allRowers = new Map<string, { rower: any; sessions: any[] }>();
    
    comparisonData.forEach(sessionMetric => {
      sessionMetric.rowerMetrics.forEach((rowerMetric: any) => {
        const key = rowerMetric.rower.id;
        if (!allRowers.has(key)) {
          allRowers.set(key, { rower: rowerMetric.rower, sessions: [] });
        }
        allRowers.get(key)!.sessions.push({
          session: sessionMetric.session,
          avgHeartRate: rowerMetric.avgHeartRate,
          maxHeartRate: rowerMetric.maxHeartRate,
          sessionDate: sessionMetric.sessionDate
        });
      });
    });

    return Array.from(allRowers.values());
  }, [comparisonData]);

  const handleSessionToggle = (sessionId: string) => {
    setSelectedSessions(prev => {
      if (prev.includes(sessionId)) {
        return prev.filter(id => id !== sessionId);
      } else if (prev.length < 3) { // Limit to 3 sessions for readability
        return [...prev, sessionId];
      }
      return prev;
    });
  };

  const formatSessionLabel = (session: TrainingSession) => {
    const date = session.startTime.toLocaleDateString();
    const time = session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const duration = session.endTime 
      ? Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000 / 60)
      : 0;
    
    return `${date} ${time} (${duration}m)`;
  };

  if (availableSessions.length < 2) {
    return (
      <section className="card-base session-comparison">
        <h3 className="card-title">
          <ChartBarIcon className="card-title-icon" />
          Session Comparison
        </h3>
        <div className="empty-state">
          <CalendarIcon className="empty-state-icon" />
          <p className="empty-state-text">Need at least 2 completed sessions to compare</p>
          <p className="empty-state-subtext">Complete more training sessions to enable comparison features</p>
        </div>
      </section>
    );
  }

  return (
    <section className="card-base session-comparison">
      <h3 className="card-title">
        <ChartBarIcon className="card-title-icon" />
        Session Comparison
      </h3>
      
      {/* Session Selection */}
      <div className="session-selection">
        <h4 className="session-selection-title">Select Sessions to Compare (2-3 max)</h4>
        <div className="session-selection-grid">
          {availableSessions.map(session => (
            <div
              key={session.id}
              className={`session-selection-card ${selectedSessions.includes(session.id) ? 'selected' : ''}`}
              onClick={() => handleSessionToggle(session.id)}
            >
              <div className="session-selection-header">
                <input
                  type="checkbox"
                  checked={selectedSessions.includes(session.id)}
                  onChange={() => handleSessionToggle(session.id)}
                  className="session-selection-checkbox"
                />
                <div className="session-selection-info">
                  <span className="session-selection-date">{formatSessionLabel(session)}</span>
                  <span className="session-selection-details">
                    {session.rowers.length} rowers • {session.finalHeartRateData?.length || 0} data points
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Session Overview Comparison */}
      {comparisonData && comparisonData.length >= 2 && (
        <div className="comparison-section">
          <h4 className="comparison-section-title">Session Overview</h4>
          <div className="session-overview-grid">
            {comparisonData.map((sessionData, index) => (
              <div key={sessionData.session.id} className="session-overview-card">
                <div className="session-overview-header">
                  <h5 className="session-overview-title">Session {index + 1}</h5>
                  <div className="session-overview-meta">
                    <span className="session-overview-date">{sessionData.sessionDate}</span>
                    <span className="session-overview-time">{sessionData.sessionTime}</span>
                    <span className="session-overview-duration">{sessionData.duration}m</span>
                  </div>
                </div>
                
                <div className="session-overview-metrics">
                  <div className="session-overview-metric">
                    <HeartIcon className="session-overview-metric-icon" />
                    <div className="session-overview-metric-content">
                      <span className="session-overview-metric-value">{sessionData.avgHeartRate}</span>
                      <span className="session-overview-metric-label">Avg BPM</span>
                    </div>
                  </div>
                  <div className="session-overview-metric">
                    <FireIcon className="session-overview-metric-icon" />
                    <div className="session-overview-metric-content">
                      <span className="session-overview-metric-value">{sessionData.maxHeartRate}</span>
                      <span className="session-overview-metric-label">Max BPM</span>
                    </div>
                  </div>
                  <div className="session-overview-metric">
                    <ClockIcon className="session-overview-metric-icon" />
                    <div className="session-overview-metric-content">
                      <span className="session-overview-metric-value">{sessionData.duration}</span>
                      <span className="session-overview-metric-label">Duration (m)</span>
                    </div>
                  </div>
                </div>
                
                <div className="session-overview-zones">
                  <h6 className="session-overview-zones-title">Zone Distribution</h6>
                  <div className="session-overview-zones-list">
                    {sessionData.zoneBreakdown.map((zoneData) => (
                      <div key={zoneData.zone} className="session-overview-zone-item">
                        <div className="session-overview-zone-header">
                          <span 
                            className="session-overview-zone-color" 
                            style={{ backgroundColor: ZONE_COLORS[zoneData.zone as keyof typeof ZONE_COLORS] }}
                          />
                          <span className="session-overview-zone-name">
                            {zoneData.zone.charAt(0).toUpperCase() + zoneData.zone.slice(1)}
                          </span>
                        </div>
                        <div className="session-overview-zone-details">
                          <span className="session-overview-zone-percentage">{zoneData.percentage}%</span>
                          <span className="session-overview-zone-duration">{zoneData.durationFormatted}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Individual Rower Comparison */}
      {rowerComparisonData && rowerComparisonData.length > 0 && (
        <div className="comparison-section">
          <h4 className="comparison-section-title">
            <UserGroupIcon className="comparison-section-icon" />
            Individual Rower Progress
          </h4>
          <div className="rower-comparison-grid">
            {rowerComparisonData.map(({ rower, sessions: rowerSessions }) => (
              <div key={rower.id} className="rower-comparison-card">
                <div className="rower-comparison-header">
                  <h5 className="rower-comparison-name">{rower.name}</h5>
                  <span className="rower-comparison-seat">Seat {rower.seat}</span>
                </div>
                
                <div className="rower-comparison-sessions">
                  {rowerSessions.map((sessionData, index) => (
                    <div key={index} className="rower-comparison-session">
                      <div className="rower-comparison-session-header">
                        <span className="rower-comparison-session-label">Session {index + 1}</span>
                        <span className="rower-comparison-session-date">{sessionData.sessionDate}</span>
                      </div>
                      
                      <div className="rower-comparison-session-metrics">
                        <div className="rower-comparison-session-metric">
                          <HeartIcon className="rower-comparison-session-metric-icon" />
                          <div className="rower-comparison-session-metric-content">
                            <span className="rower-comparison-session-metric-value">{sessionData.avgHeartRate}</span>
                            <span className="rower-comparison-session-metric-label">Avg BPM</span>
                          </div>
                        </div>
                        <div className="rower-comparison-session-metric">
                          <FireIcon className="rower-comparison-session-metric-icon" />
                          <div className="rower-comparison-session-metric-content">
                            <span className="rower-comparison-session-metric-value">{sessionData.maxHeartRate}</span>
                            <span className="rower-comparison-session-metric-label">Max BPM</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Find the corresponding session data for zone breakdown */}
                      {(() => {
                        const sessionMetric = comparisonData?.find(s => s.session.id === sessionData.session.id);
                        const rowerMetric = sessionMetric?.rowerMetrics.find((rm: any) => rm.rower.id === rower.id);
                        return rowerMetric?.zoneBreakdown ? (
                          <div className="rower-comparison-session-zones">
                            <div className="rower-comparison-session-zones-list">
                              {rowerMetric.zoneBreakdown.map((zoneData: any) => (
                                <div key={zoneData.zone} className="rower-comparison-session-zone">
                                  <span 
                                    className="rower-comparison-session-zone-color" 
                                    style={{ backgroundColor: ZONE_COLORS[zoneData.zone as keyof typeof ZONE_COLORS] }}
                                  />
                                  <span className="rower-comparison-session-zone-name">
                                    {zoneData.zone.charAt(0).toUpperCase() + zoneData.zone.slice(1)}
                                  </span>
                                  <span className="rower-comparison-session-zone-percentage">{zoneData.percentage}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
