import { useState } from 'react';
import { useAppStore } from '../store';
import { useBluetooth } from '../hooks/useBluetooth';
import { useConnectionHealth } from '../hooks/useConnectionHealth';
import { 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export const ReconnectionStatus = () => {
  const { connectionStatus } = useAppStore();
  const { attemptReconnection } = useBluetooth();
  const { getUnhealthyConnections } = useConnectionHealth();
  
  const [reconnectionAttempts, setReconnectionAttempts] = useState<Map<string, boolean>>(new Map());
  const [reconnectionResults, setReconnectionResults] = useState<Map<string, boolean>>(new Map());

  const unhealthyConnections = getUnhealthyConnections();

  const handleManualReconnection = async (deviceId: string) => {
    setReconnectionAttempts(prev => new Map(prev).set(deviceId, true));
    
    try {
      const success = await attemptReconnection(deviceId);
      setReconnectionResults(prev => new Map(prev).set(deviceId, success));
      
      // Clear result after 3 seconds
      setTimeout(() => {
        setReconnectionResults(prev => {
          const newMap = new Map(prev);
          newMap.delete(deviceId);
          return newMap;
        });
      }, 3000);
    } catch (error) {
      console.error('Manual reconnection failed:', error);
      setReconnectionResults(prev => new Map(prev).set(deviceId, false));
    } finally {
      setReconnectionAttempts(prev => {
        const newMap = new Map(prev);
        newMap.delete(deviceId);
        return newMap;
      });
    }
  };

  const handleReconnectAll = async () => {
    for (const health of unhealthyConnections) {
      await handleManualReconnection(health.deviceId);
    }
  };

  if (unhealthyConnections.length === 0) {
    return null;
  }

  return (
    <div className="reconnection-status">
      <div className="reconnection-status-header">
        <div className="reconnection-status-title">
          <ExclamationTriangleIcon className="reconnection-status-icon" />
          <h3 className="reconnection-status-text">
            Connection Issues Detected
          </h3>
        </div>
        {unhealthyConnections.length > 1 && (
          <div className="reconnection-status-actions">
            <button
              onClick={handleReconnectAll}
              className="btn btn-secondary"
              style={{ color: 'var(--status-error)', borderColor: 'var(--status-error)' }}
            >
              <ArrowPathIcon className="h-3 w-3 mr-1" />
              Reconnect All
            </button>
          </div>
        )}
      </div>

      <div className="reconnection-device-list">
        {unhealthyConnections.map((health) => {
          const isAttempting = reconnectionAttempts.get(health.deviceId);
          const result = reconnectionResults.get(health.deviceId);
          const device = connectionStatus.connectedDevices.find(d => d.id === health.deviceId);
          
          return (
            <div
              key={health.deviceId}
              className="reconnection-device-item"
            >
              <div className="reconnection-device-info">
                <div className="reconnection-device-indicator" />
                <div className="reconnection-device-details">
                  <p className="reconnection-device-name">
                    {device?.name || `Device ${health.deviceId}`}
                  </p>
                  <p className="reconnection-device-timeout">
                    Last heartbeat: {Math.round(health.timeSinceLastHeartbeat / 1000)}s ago
                  </p>
                </div>
              </div>
              
              <div className="reconnection-device-actions">
                {result === true && (
                  <div className="reconnection-result reconnection-result--success">
                    <CheckCircleIcon className="reconnection-result-icon" />
                    <span className="reconnection-result-text">Reconnected</span>
                  </div>
                )}
                
                {result === false && (
                  <div className="reconnection-result reconnection-result--failure">
                    <XCircleIcon className="reconnection-result-icon" />
                    <span className="reconnection-result-text">Failed</span>
                  </div>
                )}
                
                <button
                  onClick={() => handleManualReconnection(health.deviceId)}
                  disabled={isAttempting}
                  className="reconnection-button"
                >
                  {isAttempting ? (
                    <>
                      <ArrowPathIcon className="reconnection-button-icon reconnection-button-icon--spinning" />
                      Reconnecting...
                    </>
                  ) : (
                    <>
                      <ArrowPathIcon className="reconnection-button-icon" />
                      Reconnect
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
