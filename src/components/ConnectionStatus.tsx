import { useAppStore } from '../store';
import { useConnectionHealth } from '../hooks/useConnectionHealth';
import { 
  WifiIcon, 
  SignalSlashIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

export const ConnectionStatus = () => {
  const { connectionStatus } = useAppStore();
  const { getHealthSummary, getUnhealthyConnections } = useConnectionHealth();
  
  const { 
    isScanning, 
    connectedDevices, 
    availableDevices, 
    hasSpeedCoachConflicts,
    conflicts 
  } = connectionStatus;

  const healthSummary = getHealthSummary();
  const unhealthyConnections = getUnhealthyConnections();


  const getStatusIcon = () => {
    if (hasSpeedCoachConflicts) return ExclamationTriangleIcon;
    if (unhealthyConnections.length > 0) return ExclamationCircleIcon;
    if (connectedDevices.length > 0) return CheckCircleIcon;
    if (isScanning) return WifiIcon;
    return SignalSlashIcon;
  };

  const getStatusText = () => {
    if (hasSpeedCoachConflicts) return 'SpeedCoach conflicts detected';
    if (unhealthyConnections.length > 0) return `${unhealthyConnections.length} connection(s) unhealthy`;
    if (connectedDevices.length > 0) return `${connectedDevices.length} device(s) connected (${healthSummary.healthPercentage}% healthy)`;
    if (isScanning) return 'Scanning for devices...';
    return 'No devices connected';
  };

  const StatusIcon = getStatusIcon();

  return (
    <div className="connection-status">
      <div className="connection-status-content">
        <div className="connection-status-info">
          <StatusIcon className={`connection-status-icon ${
            hasSpeedCoachConflicts ? 'connection-status-icon--conflict' :
            unhealthyConnections.length > 0 ? 'connection-status-icon--unhealthy' :
            connectedDevices.length > 0 ? 'connection-status-icon--connected' :
            isScanning ? 'connection-status-icon--scanning' :
            'connection-status-icon--disconnected'
          }`} />
          <div>
            <p className={`connection-status-text ${
              hasSpeedCoachConflicts ? 'connection-status-text--conflict' :
              unhealthyConnections.length > 0 ? 'connection-status-text--unhealthy' :
              connectedDevices.length > 0 ? 'connection-status-text--connected' :
              isScanning ? 'connection-status-text--scanning' :
              'connection-status-text--disconnected'
            }`}>
              {getStatusText()}
            </p>
            {availableDevices.length > 0 && (
              <p className="connection-status-subtitle">
                {availableDevices.length} device(s) available
              </p>
            )}
          </div>
        </div>

        {/* Device List */}
        {connectedDevices.length > 0 && (
          <div className="connection-device-list">
            {connectedDevices.map((device) => {
              const isHealthy = device.isHealthy !== false;
              
              return (
                <div
                  key={device.id}
                  className={`connection-device-item ${
                    isHealthy ? 'connection-device-item--healthy' : 'connection-device-item--unhealthy'
                  }`}
                >
                  <div className={`connection-device-indicator ${
                    isHealthy ? 'connection-device-indicator--healthy' : 'connection-device-indicator--unhealthy'
                  }`} />
                  <span className={`connection-device-name ${
                    isHealthy ? 'connection-device-name--healthy' : 'connection-device-name--unhealthy'
                  }`}>
                    {device.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Unhealthy Connections */}
      {unhealthyConnections.length > 0 && (
        <div className="connection-issues">
          <div className="connection-issue">
            <ExclamationCircleIcon className="connection-issue-icon connection-issue-icon--error" />
            <div className="connection-issue-content">
              <p className="connection-issue-title connection-issue-title--error">
                Unhealthy connections detected:
              </p>
              <ul className="connection-issue-list">
                {unhealthyConnections.map((health) => (
                  <li key={health.deviceId} className="connection-issue-item connection-issue-item--error">
                    • Device {health.deviceId} - Last heartbeat: {Math.round(health.timeSinceLastHeartbeat / 1000)}s ago
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SpeedCoach Conflicts */}
      {hasSpeedCoachConflicts && conflicts.length > 0 && (
        <div className="connection-issues">
          <div className="connection-issue">
            <ExclamationTriangleIcon className="connection-issue-icon connection-issue-icon--warning" />
            <div className="connection-issue-content">
              <p className="connection-issue-title connection-issue-title--warning">
                Connection conflicts detected:
              </p>
              <ul className="connection-issue-list">
                {conflicts.map((conflict) => (
                  <li key={conflict.deviceId} className="connection-issue-item connection-issue-item--warning">
                    • {conflict.deviceName} is connected to SpeedCoach
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
