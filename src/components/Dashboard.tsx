import { useState } from 'react';
import { useAppStore } from '../store';
import { useDefaultHeartRateZones } from '../hooks/useHeartRateZones';
// Removed useConnectionHealth import - now using global store for unhealthy devices
import { useSessionDuration } from '../hooks/useSessionDuration';
import { HeartRateCard } from './HeartRateCard';
import { HeartRateChart } from './HeartRateChart';
import { EnhancedDashboard } from './EnhancedDashboard';
import { ConnectionStatus } from './ConnectionStatus';
import { ReconnectionStatus } from './ReconnectionStatus';
import { DevToggle } from './DevToggle';
import {
  PlayIcon,
  StopIcon,
  PlusIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartPieIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';


export const Dashboard = () => {
  const {
    currentSession,
    rowers,
    connectionStatus,
    startSession,
    endSession,
    setUIState,
    getUnhealthyDevices
  } = useAppStore();

  const { zones } = useDefaultHeartRateZones();
  const sessionDuration = useSessionDuration(currentSession);
  const isSessionActive = currentSession?.isActive;
  const [showEnhancedView, setShowEnhancedView] = useState(false);

  const unhealthyDevices = getUnhealthyDevices();

  const handleStartSession = () => {
    if (rowers.length === 0) {
      setUIState({ currentView: 'setup' });
      return;
    }

    const session = {
      id: `session-${Date.now()}`,
      startTime: new Date(),
      rowers,
      heartRateData: [],
      isActive: true
    };

    startSession(session);
  };

  const handleEndSession = () => {
    endSession();
  };

  const connectedRowers = rowers.filter(rower => rower.deviceId && rower.currentHeartRate);

  return (
    <>
      {/* Development Toggle */}
      <DevToggle />

      {/* Session Controls */}
      <section className="session-controls">
        <article className="session-info">
          <h2 className="session-title">
            Training Session
          </h2>
          <p className="session-subtitle">
            {isSessionActive
              ? `Started ${currentSession?.startTime.toLocaleTimeString()}`
              : currentSession && !isSessionActive
                ? `Session ended - Duration: ${sessionDuration}`
                : 'Ready to start monitoring'
            }
          </p>

          {isSessionActive && (
            <div className="session-status">
              <p className="status-indicator">
                <CheckCircleIcon className="status-icon" />
                <span className="status-text status-text--success">
                  {connectedRowers.length} rower(s) active
                </span>
              </p>
              <p className="status-indicator">
                <span className="status-text status-text--info">
                  Duration: {sessionDuration}
                </span>
              </p>
              {unhealthyDevices.length > 0 && (
                <p className="status-indicator">
                  <ExclamationTriangleIcon className="status-icon" />
                  <span className="status-text status-text--error">
                    {unhealthyDevices.length} connection(s) unhealthy
                  </span>
                </p>
              )}
            </div>
          )}
        </article>

        <article className="session-actions">
          {!isSessionActive ? (
            <button
              onClick={handleStartSession}
              disabled={connectionStatus.connectedDevices.length === 0}
              className="btn btn-primary"
            >
              <PlayIcon className="btn-icon" />
              Start Session
            </button>
          ) : (
            <button
              onClick={handleEndSession}
              className="btn btn-danger"
            >
              <StopIcon className="btn-icon" />
              End Session
            </button>
          )}

          <button
            onClick={() => setUIState({ currentView: 'setup' })}
            className="btn btn-secondary"
          >
            <PlusIcon className="btn-icon" />
            Add Rower
          </button>

          {currentSession && (
            <button
              onClick={() => setShowEnhancedView(!showEnhancedView)}
              className={`btn ${showEnhancedView ? 'btn-primary' : 'btn-secondary'}`}
            >
              {showEnhancedView ? (
                <>
                  <EyeIcon className="btn-icon" />
                  Basic View
                </>
              ) : (
                <>
                  <ChartPieIcon className="btn-icon" />
                  Enhanced View
                </>
              )}
            </button>
          )}
        </article>
      </section>

      {/* Connection Status */}
      <ConnectionStatus />

      {/* Reconnection Status */}
      <ReconnectionStatus />

      {/* Heart Rate Monitoring */}
      {rowers.length > 0 ? (
        <>
          {/* Enhanced Dashboard View */}
          {showEnhancedView && currentSession ? (
            <EnhancedDashboard currentSession={currentSession} />
          ) : (
            <>
              {/* Rower Status Overview */}
              <section className="rower-overview">
                <h3 className="rower-overview-title">Rower Status</h3>
                <article className="rower-grid">
                  {[1, 2, 3, 4].map(seat => {
                    const rower = rowers.find(r => r.seat === seat);
                    const isConnected = rower && rower.deviceId && rower.currentHeartRate;
                    const hasDevice = rower && rower.deviceId;

                    return (
                      <div
                        key={seat}
                        className={`rower-seat ${isConnected
                          ? 'rower-seat--connected'
                          : hasDevice
                            ? 'rower-seat--device-only'
                            : 'rower-seat--empty'
                          }`}
                      >
                          <span className={`rower-status-indicator ${isConnected ? 'rower-status-indicator--connected' : hasDevice ? 'rower-status-indicator--device-only' : 'rower-status-indicator--empty'
                            }`} />
                          <p className="rower-seat-number">
                            Seat {seat}
                          </p>
                          <p className="rower-name">
                            {rower ? rower.name : 'Empty'}
                          </p>
                          <p className="rower-status">
                            {isConnected ? 'Active' : hasDevice ? 'Connected' : 'No Device'}
                          </p>
                      </div>
                    );
                  })}
                </article>
              </section>

              {/* Heart Rate Cards */}
              {connectedRowers.length > 0 && (
                <section className="heart-rate-grid">
                  {connectedRowers.map((rower) => (
                    <HeartRateCard
                      key={rower.id}
                      rower={rower}
                      zones={zones}
                    />
                  ))}
                </section>
              )}

              {/* Session Analysis Chart - Only show after session ends */}
              {currentSession && !currentSession.isActive && currentSession.finalHeartRateData && currentSession.finalHeartRateData.length > 0 && (
                <HeartRateChart
                  data={currentSession.finalHeartRateData}
                  rowers={currentSession.rowers}
                  sessionStartTime={currentSession.startTime}
                  sessionEndTime={currentSession.endTime}
                />
              )}
            </>
          )}
        </>
      ) : (
        <section className="card-base empty-state">
          <ChartBarIcon className="empty-state-icon" />
          <h3 className="empty-state-title">
            No heart rate data
          </h3>
          <p className="empty-state-description">
            Connect heart rate devices and assign them to rowers to start monitoring.
          </p>
          <div className="empty-state-action">
            <button
              onClick={() => setUIState({ currentView: 'setup' })}
              className="btn btn-primary"
            >
              <PlusIcon className="btn-icon" />
              Setup Devices
            </button>
          </div>
        </section>
      )}

      {/* Heart Rate Zones Legend */}
      <section className="card-base heart-rate-zones">
        <h3 className="heart-rate-zones-title">
          Heart Rate Zones
        </h3>
        <article className="heart-rate-zones-grid">
          {Object.entries(zones).map(([key, zone]) => (
            <div key={key} className="heart-rate-zone-item">
              <span className={`heart-rate-zone-color ${zone.name.toLowerCase()}`}/>
              <p className="heart-rate-zone-name">{zone.name}</p>
              <p className="heart-rate-zone-range">{zone.min}-{zone.max} BPM</p>
            </div>
          ))}
        </article>
      </section>

    </>
  );
};
