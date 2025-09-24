import { useAppStore } from '../store';
import { useHeartRateZones } from '../hooks/useHeartRateZones';
import { useConnectionHealth } from '../hooks/useConnectionHealth';
import { HeartRateCard } from './HeartRateCard';
import { HeartRateChartEnhanced } from './HeartRateChartEnhanced';
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
    <div className="space-y-6">
      {/* Development Toggle */}
      <DevToggle />

      {/* Session Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Training Session
            </h2>
            <p className="text-sm text-gray-600">
              {isSessionActive 
                ? `Started ${currentSession?.startTime.toLocaleTimeString()}`
                : 'Ready to start monitoring'
              }
            </p>
            {isSessionActive && (
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-gray-600">
                    {connectedRowers.length} rower(s) active
                  </span>
                </div>
                {unhealthyConnections.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                    <span className="text-xs text-red-600">
                      {unhealthyConnections.length} connection(s) unhealthy
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex space-x-3">
            {!isSessionActive ? (
              <button
                onClick={handleStartSession}
                disabled={connectionStatus.connectedDevices.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlayIcon className="h-4 w-4 mr-2" />
                Start Session
              </button>
            ) : (
              <button
                onClick={handleEndSession}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <StopIcon className="h-4 w-4 mr-2" />
                End Session
              </button>
            )}
            
            <button
              onClick={() => setUIState({ currentView: 'setup' })}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Rower Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map(seat => {
                const rower = rowers.find(r => r.seat === seat);
                const isConnected = rower && rower.deviceId && rower.currentHeartRate;
                const hasDevice = rower && rower.deviceId;
                
                return (
                  <div
                    key={seat}
                    className={`p-3 rounded-lg border ${
                      isConnected 
                        ? 'bg-green-50 border-green-200' 
                        : hasDevice 
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                        isConnected ? 'bg-green-500' : hasDevice ? 'bg-yellow-500' : 'bg-gray-400'
                      }`} />
                      <p className="text-sm font-medium text-gray-900">
                        Seat {seat}
                      </p>
                      <p className="text-xs text-gray-500">
                        {rower ? rower.name : 'Empty'}
                      </p>
                      <p className="text-xs text-gray-500">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {connectedRowers.map((rower) => (
                <HeartRateCard
                  key={rower.id}
                  rower={rower}
                  zones={zones}
                />
              ))}
            </div>
          )}
          
          {/* Enhanced Heart Rate Chart - Temporarily disabled */}
          {/* {currentSession && (
            <HeartRateChartEnhanced
              data={currentSession.heartRateData || []}
              maxDataPoints={100}
            />
          )} */}
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No heart rate data
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Connect heart rate devices and assign them to rowers to start monitoring.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setUIState({ currentView: 'setup' })}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Setup Devices
            </button>
          </div>
        </div>
      )}

      {/* Heart Rate Zones Legend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Heart Rate Zones
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(zones).map(([key, zone]) => (
            <div key={key} className="text-center">
              <div 
                className="w-full h-4 rounded mb-2"
                style={{ backgroundColor: zone.color }}
              />
              <div className="text-sm font-medium text-gray-900">
                {zone.name}
              </div>
              <div className="text-xs text-gray-500">
                {zone.min}-{zone.max} BPM
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
