import { useState, useEffect } from 'react';
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
import { SessionAccessibility, AccessibilityAnnouncer, generateId } from '../utils/accessibility';


export const Dashboard = () => {
  const {
    currentSession,
    rowers,
    connectionStatus,
    startSession,
    endSession,
    setUIState,
    getUnhealthyDevices,
    sessionWasRestored
  } = useAppStore();

  const { zones } = useDefaultHeartRateZones();
  const sessionDuration = useSessionDuration(currentSession);
  const isSessionActive = currentSession?.isActive;
  const [showEnhancedView, setShowEnhancedView] = useState(false);
  const [showRestorationNotification, setShowRestorationNotification] = useState(false);

  const unhealthyDevices = getUnhealthyDevices();
  
  // Generate unique IDs for accessibility
  const dashboardId = generateId('dashboard');
  const sessionControlsId = generateId('session-controls');
  const rowersSectionId = generateId('rowers-section');
  const announcer = AccessibilityAnnouncer.getInstance();

  // Show restoration notification when session was actually restored
  useEffect(() => {
    if (sessionWasRestored && currentSession) {
      setShowRestorationNotification(true);
      // Auto-hide the notification after 5 seconds
      setTimeout(() => setShowRestorationNotification(false), 5000);
    }
  }, [sessionWasRestored, currentSession]);

  const handleStartSession = () => {
    if (rowers.length === 0) {
      setUIState({ currentView: 'setup' });
      announcer.announce('No rowers configured. Please add rowers in setup.');
      return;
    }

    // Hide any restoration notification when starting new session
    setShowRestorationNotification(false);

    const session = {
      id: `session-${Date.now()}`,
      startTime: new Date(),
      rowers,
      heartRateData: [],
      isActive: true
    };

    startSession(session);
    announcer.announceSessionStatus(true);
  };

  const handleEndSession = () => {
    endSession();
    announcer.announceSessionStatus(false);
  };

  const connectedRowers = rowers.filter(rower => rower.deviceId && rower.currentHeartRate);

  return (
    <main 
      id={dashboardId}
      role="main"
      aria-labelledby="dashboard-title"
    >
      {/* Development Toggle */}
      <DevToggle />

      {/* Session Controls */}
      <section 
        className="session-controls"
        id={sessionControlsId}
        aria-labelledby="session-title"
        aria-describedby="session-status"
      >
        {/* Session Restoration Notification */}
        {showRestorationNotification && (
          <div 
            className="session-restoration-notification"
            role="status"
            aria-live="polite"
          >
            <CheckCircleIcon 
              className="restoration-icon"
              aria-hidden="true"
            />
            <span>Session restored from previous session</span>
          </div>
        )}
        
        <article className="session-info">
          <h2 
            className="session-title"
            id="session-title"
          >
            Training Session
          </h2>
          <p 
            className="session-subtitle"
            id="session-status"
            aria-live="polite"
          >
            {isSessionActive
              ? `Started ${currentSession?.startTime.toLocaleTimeString()}`
              : currentSession && !isSessionActive
                ? `Session ended - Duration: ${sessionDuration}`
                : 'Ready to start monitoring'
            }
          </p>

          {isSessionActive && (
            <div 
              className="session-status"
              role="status"
              aria-live="polite"
              aria-label={SessionAccessibility.getRowerCountDescription(rowers.length, connectedRowers.length)}
            >
              <p className="status-indicator">
                <CheckCircleIcon 
                  className="status-icon"
                  aria-hidden="true"
                />
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
                  <ExclamationTriangleIcon 
                    className="status-icon"
                    aria-hidden="true"
                  />
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
              aria-describedby={connectionStatus.connectedDevices.length === 0 ? "no-devices-warning" : undefined}
            >
              <PlayIcon 
                className="btn-icon"
                aria-hidden="true"
              />
              Start Session
            </button>
          ) : (
            <button
              onClick={handleEndSession}
              className="btn btn-danger"
              aria-label="End current training session"
            >
              <StopIcon 
                className="btn-icon"
                aria-hidden="true"
              />
              End Session
            </button>
          )}

          <button
            onClick={() => setUIState({ currentView: 'setup' })}
            className="btn btn-secondary"
            aria-label="Add new rower to session"
          >
            <PlusIcon 
              className="btn-icon"
              aria-hidden="true"
            />
            Add Rower
          </button>

          {connectionStatus.connectedDevices.length === 0 && (
            <p 
              id="no-devices-warning"
              className="session-warning"
              role="alert"
            >
              No heart rate devices connected. Please connect devices before starting a session.
            </p>
          )}

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
              <section 
                className="rower-overview"
                id={rowersSectionId}
                aria-labelledby="rower-overview-title"
              >
                <h3 
                  className="rower-overview-title"
                  id="rower-overview-title"
                >
                  Rower Status
                </h3>
                <article 
                  className="rower-grid"
                  role="grid"
                  aria-label="Rower status grid showing all 4 seats"
                >
                  {[1, 2, 3, 4].map(seat => {
                    const rower = rowers.find(r => r.seat === seat);
                    const isConnected = rower && rower.deviceId && rower.currentHeartRate;
                    const hasDevice = rower && rower.deviceId;
                    const seatId = generateId(`rower-seat-${seat}`);

                    return (
                      <div
                        key={seat}
                        id={seatId}
                        className={`rower-seat ${isConnected
                          ? 'rower-seat--connected'
                          : hasDevice
                            ? 'rower-seat--device-only'
                            : 'rower-seat--empty'
                          }`}
                        role="gridcell"
                        aria-labelledby={`${seatId}-name ${seatId}-status`}
                      >
                          <span 
                            className={`rower-status-indicator ${isConnected ? 'rower-status-indicator--connected' : hasDevice ? 'rower-status-indicator--device-only' : 'rower-status-indicator--empty'
                              }`}
                            aria-hidden="true"
                          />
                          <p 
                            className="rower-seat-number"
                            id={`${seatId}-number`}
                          >
                            Seat {seat}
                          </p>
                          <p 
                            className="rower-name"
                            id={`${seatId}-name`}
                          >
                            {rower ? rower.name : 'Empty'}
                          </p>
                          <p 
                            className="rower-status"
                            id={`${seatId}-status`}
                          >
                            {isConnected ? 'Active' : hasDevice ? 'Connected' : 'No Device'}
                          </p>
                      </div>
                    );
                  })}
                </article>
              </section>

              {/* Heart Rate Cards */}
              {connectedRowers.length > 0 && (
                <section 
                  className="heart-rate-grid"
                  aria-labelledby="heart-rate-cards-title"
                >
                  <h3 
                    id="heart-rate-cards-title"
                    className="sr-only"
                  >
                    Active Heart Rate Monitors
                  </h3>
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
        <section 
          className="card-base empty-state"
          role="status"
          aria-labelledby="empty-state-title"
        >
          <ChartBarIcon 
            className="empty-state-icon"
            aria-hidden="true"
          />
          <h3 
            className="empty-state-title"
            id="empty-state-title"
          >
            No heart rate data
          </h3>
          <p className="empty-state-description">
            Connect heart rate devices and assign them to rowers to start monitoring.
          </p>
          <div className="empty-state-action">
            <button
              onClick={() => setUIState({ currentView: 'setup' })}
              className="btn btn-primary"
              aria-label="Go to device setup to connect heart rate monitors"
            >
              <PlusIcon 
                className="btn-icon"
                aria-hidden="true"
              />
              Setup Devices
            </button>
          </div>
        </section>
      )}

      {/* Heart Rate Zones Legend */}
      <section 
        className="card-base heart-rate-zones"
        aria-labelledby="heart-rate-zones-title"
      >
        <h3 
          className="heart-rate-zones-title"
          id="heart-rate-zones-title"
        >
          Heart Rate Zones
        </h3>
        <article 
          className="heart-rate-zones-grid"
          role="list"
          aria-label="Heart rate zone definitions"
        >
          {Object.entries(zones).map(([key, zone]) => (
            <div 
              key={key} 
              className="heart-rate-zone-item"
              role="listitem"
            >
              <span 
                className={`heart-rate-zone-color ${zone.name.toLowerCase()}`}
                aria-hidden="true"
              />
              <p className="heart-rate-zone-name">{zone.name}</p>
              <p className="heart-rate-zone-range">{zone.min}-{zone.max} BPM</p>
            </div>
          ))}
        </article>
      </section>

    </main>
  );
};
