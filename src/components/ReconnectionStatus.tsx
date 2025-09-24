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
    <div className="bg-white rounded-lg shadow-sm border border-red-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
          <h3 className="text-sm font-medium text-red-800">
            Connection Issues Detected
          </h3>
        </div>
        {unhealthyConnections.length > 1 && (
          <button
            onClick={handleReconnectAll}
            className="inline-flex items-center px-3 py-1 border border-red-300 text-xs font-medium rounded-md shadow-sm text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <ArrowPathIcon className="h-3 w-3 mr-1" />
            Reconnect All
          </button>
        )}
      </div>

      <div className="space-y-2">
        {unhealthyConnections.map((health) => {
          const isAttempting = reconnectionAttempts.get(health.deviceId);
          const result = reconnectionResults.get(health.deviceId);
          const device = connectionStatus.connectedDevices.find(d => d.id === health.deviceId);
          
          return (
            <div
              key={health.deviceId}
              className="flex items-center justify-between p-2 bg-red-50 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {device?.name || `Device ${health.deviceId}`}
                  </p>
                  <p className="text-xs text-red-600">
                    Last heartbeat: {Math.round(health.timeSinceLastHeartbeat / 1000)}s ago
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {result === true && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircleIcon className="h-4 w-4" />
                    <span className="text-xs">Reconnected</span>
                  </div>
                )}
                
                {result === false && (
                  <div className="flex items-center space-x-1 text-red-600">
                    <XCircleIcon className="h-4 w-4" />
                    <span className="text-xs">Failed</span>
                  </div>
                )}
                
                <button
                  onClick={() => handleManualReconnection(health.deviceId)}
                  disabled={isAttempting}
                  className="inline-flex items-center px-2 py-1 border border-red-300 text-xs font-medium rounded shadow-sm text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAttempting ? (
                    <>
                      <ArrowPathIcon className="h-3 w-3 mr-1 animate-spin" />
                      Reconnecting...
                    </>
                  ) : (
                    <>
                      <ArrowPathIcon className="h-3 w-3 mr-1" />
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
