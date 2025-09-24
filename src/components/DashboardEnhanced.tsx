import { useAppStore } from '../store';
import { useHeartRateZones } from '../hooks/useHeartRateZones';
import { useConnectionHealth } from '../hooks/useConnectionHealth';
import { useSessionDuration } from '../hooks/useSessionDuration';
import { HeartRateCard } from './HeartRateCard';
import { ConnectionStatus } from './ConnectionStatus';
import { ReconnectionStatus } from './ReconnectionStatus';
import { DevToggle } from './DevToggle';
import { 
  PlayIcon, 
  StopIcon, 
  PlusIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export const DashboardEnhanced = () => {
  const { 
    currentSession, 
    rowers, 
    connectionStatus, 
    startSession, 
    endSession,
    setUIState 
  } = useAppStore();
  
  const { zones } = useHeartRateZones();
  const { getUnhealthyConnections } = useConnectionHealth();
  const sessionDuration = useSessionDuration(currentSession);
  const isSessionActive = currentSession?.isActive;
  
  const unhealthyConnections = getUnhealthyConnections();

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
    <div className="dashboard-container">
      {/* Development Toggle */}
      <DevToggle />

      {/* Session Controls */}
      <div className="session-controls">
        <div className="session-header">
          <div className="session-info">
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
                <div className="status-indicator">
                  <CheckCircleIcon className="status-icon" style={{ color: 'var(--status-success)' }} />
                  <span className="status-text status-text--success">
                    {connectedRowers.length} rower(s) active
                  </span>
                </div>
                <div className="status-indicator">
                  <span className="status-text status-text--info">
                    Duration: {sessionDuration}
                  </span>
                </div>
                {unhealthyConnections.length > 0 && (
                  <div className="status-indicator">
                    <ExclamationTriangleIcon className="status-icon" style={{ color: 'var(--status-error)' }} />
                    <span className="status-text status-text--error">
                      {unhealthyConnections.length} connection(s) unhealthy
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="session-actions">
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
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <ConnectionStatus />

      {/* Reconnection Status */}
      <ReconnectionStatus />

      {/* Heart Rate Monitoring */}
      {rowers.length > 0 ? (
        <>
        {/* Rower Status Overview */}
        <div className="rower-overview">
          <h3 className="rower-overview-title">Rower Status</h3>
          <div className="rower-grid">
            {[1, 2, 3, 4].map(seat => {
              const rower = rowers.find(r => r.seat === seat);
              const isConnected = rower && rower.deviceId && rower.currentHeartRate;
              const hasDevice = rower && rower.deviceId;
              
              return (
                <div
                  key={seat}
                  className={`rower-seat ${
                    isConnected 
                      ? 'rower-seat--connected' 
                      : hasDevice 
                      ? 'rower-seat--device-only'
                      : 'rower-seat--empty'
                  }`}
                >
                  <div className="rower-seat-content">
                    <div className={`rower-status-indicator ${
                      isConnected ? 'rower-status-indicator--connected' : hasDevice ? 'rower-status-indicator--device-only' : 'rower-status-indicator--empty'
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
                </div>
              );
            })}
          </div>
        </div>

        {/* Heart Rate Cards */}
        {connectedRowers.length > 0 && (
          <div className="heart-rate-grid">
            {connectedRowers.map((rower) => (
              <HeartRateCard
                key={rower.id}
                rower={rower}
                zones={zones}
              />
            ))}
          </div>
        )}
        
        {/* Heart Rate Chart */}
        {/* {currentSession && currentSession.heartRateData.length > 0 && (
          <HeartRateChart
            data={currentSession.heartRateData}
          />
        )} */}
      </>
      ) : (
        <div className="card-base empty-state">
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
        </div>
      )}

      {/* Heart Rate Zones Legend */}
      <div className="card-base heart-rate-zones">
        <h3 className="heart-rate-zones-title">
          Heart Rate Zones
        </h3>
        <div className="heart-rate-zones-grid">
          {Object.entries(zones).map(([key, zone]) => (
            <div key={key} className="heart-rate-zone-item">
              <div 
                className="heart-rate-zone-color"
                style={{ backgroundColor: zone.color }}
              />
              <div className="heart-rate-zone-name">
                {zone.name}
              </div>
              <div className="heart-rate-zone-range">
                {zone.min}-{zone.max} BPM
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
