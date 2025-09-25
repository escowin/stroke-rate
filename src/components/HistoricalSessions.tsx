import { useState, useEffect } from 'react';
import { useHistoricalData } from '../hooks/useHistoricalData';
import type { TrainingSession, HeartRateData } from '../types';
import {
  ClockIcon,
  CalendarIcon,
  ChartBarIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface HistoricalSessionsProps {
  onViewSession?: (session: TrainingSession) => void;
}

export const HistoricalSessions = ({ onViewSession }: HistoricalSessionsProps) => {
  const {
    isInitialized,
    isLoading,
    error,
    getAllTrainingSessions,
    getSessionHeartRateData,
    deleteTrainingSession,
    getStats
  } = useHistoricalData();

  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);
  const [sessionHeartRateData, setSessionHeartRateData] = useState<HeartRateData[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingSessionData, setIsLoadingSessionData] = useState(false);

  // Load sessions on component mount
  useEffect(() => {
    if (isInitialized) {
      loadSessions();
      loadStats();
    }
  }, [isInitialized]);

  const loadSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const allSessions = await getAllTrainingSessions();
      setSessions(allSessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const loadStats = async () => {
    try {
      const databaseStats = await getStats();
      setStats(databaseStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleViewSession = async (session: TrainingSession) => {
    setSelectedSession(session);
    setIsLoadingSessionData(true);
    
    try {
      const heartRateData = await getSessionHeartRateData(session.id);
      setSessionHeartRateData(heartRateData);
      onViewSession?.(session);
    } catch (error) {
      console.error('Failed to load session data:', error);
    } finally {
      setIsLoadingSessionData(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteTrainingSession(sessionId);
      await loadSessions();
      await loadStats();
      
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
        setSessionHeartRateData([]);
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const formatDuration = (startTime: Date, endTime?: Date) => {
    const end = endTime || new Date();
    const durationMs = end.getTime() - startTime.getTime();
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAverageHeartRate = (data: HeartRateData[]) => {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, point) => acc + point.heartRate, 0);
    return Math.round(sum / data.length);
  };

  if (!isInitialized || isLoading) {
    return (
      <div className="historical-sessions">
        <div className="historical-sessions-loading">
          <div className="loading-spinner" />
          <p>Initializing database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="historical-sessions">
        <div className="historical-sessions-error">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="historical-sessions">
      <div className="historical-sessions-header">
        <h2 className="historical-sessions-title">
          <ChartBarIcon className="historical-sessions-icon" />
          Training History
        </h2>
        
        {stats && (
          <div className="historical-sessions-stats">
            <div className="stat-item">
              <span className="stat-value">{stats.totalSessions}</span>
              <span className="stat-label">Sessions</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.totalHeartRateDataPoints.toLocaleString()}</span>
              <span className="stat-label">Data Points</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{Math.round(stats.databaseSize / 1024)} KB</span>
              <span className="stat-label">Storage</span>
            </div>
          </div>
        )}
      </div>

      <div className="historical-sessions-content">
        <div className="historical-sessions-list">
          <h3 className="historical-sessions-list-title">Recent Sessions</h3>
          
          {isLoadingSessions ? (
            <div className="historical-sessions-loading">
              <div className="loading-spinner" />
              <p>Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="historical-sessions-empty">
              <ChartBarIcon className="historical-sessions-empty-icon" />
              <p>No training sessions found</p>
              <p className="historical-sessions-empty-subtitle">
                Start a training session to see your history here
              </p>
            </div>
          ) : (
            <div className="historical-sessions-grid">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`historical-session-card ${
                    selectedSession?.id === session.id ? 'historical-session-card--selected' : ''
                  }`}
                >
                  <div className="historical-session-header">
                    <div className="historical-session-info">
                      <h4 className="historical-session-title">
                        Session {session.id.split('-')[1]}
                      </h4>
                      <p className="historical-session-date">
                        <CalendarIcon className="historical-session-date-icon" />
                        {formatDate(session.startTime)}
                      </p>
                    </div>
                    <div className="historical-session-status">
                      <span className={`historical-session-status-badge ${
                        session.isActive ? 'historical-session-status-badge--active' : 'historical-session-status-badge--completed'
                      }`}>
                        {session.isActive ? 'Active' : 'Completed'}
                      </span>
                    </div>
                  </div>

                  <div className="historical-session-details">
                    <div className="historical-session-detail">
                      <ClockIcon className="historical-session-detail-icon" />
                      <span className="historical-session-detail-label">Duration:</span>
                      <span className="historical-session-detail-value">
                        {formatDuration(session.startTime, session.endTime)}
                      </span>
                    </div>
                    
                    <div className="historical-session-detail">
                      <span className="historical-session-detail-label">Rowers:</span>
                      <span className="historical-session-detail-value">
                        {session.rowers.length}
                      </span>
                    </div>
                    
                    <div className="historical-session-detail">
                      <span className="historical-session-detail-label">Data Points:</span>
                      <span className="historical-session-detail-value">
                        {session.heartRateData.length.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="historical-session-actions">
                    <button
                      onClick={() => handleViewSession(session)}
                      className="btn btn-sm btn-primary"
                      title="View session details"
                    >
                      <EyeIcon className="btn-icon" />
                      View
                    </button>
                    
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="btn btn-sm btn-danger"
                      title="Delete session"
                    >
                      <TrashIcon className="btn-icon" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedSession && (
          <div className="historical-session-details-panel">
            <h3 className="historical-session-details-title">
              Session Details
            </h3>
            
            {isLoadingSessionData ? (
              <div className="historical-session-loading">
                <div className="loading-spinner" />
                <p>Loading session data...</p>
              </div>
            ) : (
              <div className="historical-session-details-content">
                <div className="historical-session-summary">
                  <div className="summary-item">
                    <span className="summary-label">Start Time:</span>
                    <span className="summary-value">{formatDate(selectedSession.startTime)}</span>
                  </div>
                  
                  {selectedSession.endTime && (
                    <div className="summary-item">
                      <span className="summary-label">End Time:</span>
                      <span className="summary-value">{formatDate(selectedSession.endTime)}</span>
                    </div>
                  )}
                  
                  <div className="summary-item">
                    <span className="summary-label">Duration:</span>
                    <span className="summary-value">
                      {formatDuration(selectedSession.startTime, selectedSession.endTime)}
                    </span>
                  </div>
                  
                  <div className="summary-item">
                    <span className="summary-label">Average HR:</span>
                    <span className="summary-value">
                      {getAverageHeartRate(sessionHeartRateData)} BPM
                    </span>
                  </div>
                </div>

                <div className="historical-session-rowers">
                  <h4 className="historical-session-rowers-title">Rowers</h4>
                  <div className="historical-session-rowers-list">
                    {selectedSession.rowers.map((rower) => (
                      <div key={rower.id} className="historical-session-rower">
                        <span className="historical-session-rower-name">{rower.name}</span>
                        <span className="historical-session-rower-seat">Seat {rower.seat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
