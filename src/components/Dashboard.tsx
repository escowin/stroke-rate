import { useAppStore } from '../store';
import { useHeartRateZones } from '../hooks/useHeartRateZones';
import { HeartRateCard } from './HeartRateCard';
import { HeartRateChart } from './HeartRateChart';
import { ConnectionStatus } from './ConnectionStatus';
import { 
  PlayIcon, 
  StopIcon, 
  PlusIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export const Dashboard = () => {
  const { 
    currentSession, 
    rowers, 
    connectionStatus, 
    startSession, 
    endSession,
    setUIState 
  } = useAppStore();
  
  const { zones } = useHeartRateZones();
  const isSessionActive = currentSession?.isActive;

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

      {/* Heart Rate Monitoring */}
      {connectedRowers.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {connectedRowers.map((rower) => (
              <HeartRateCard
                key={rower.id}
                rower={rower}
                zones={zones}
              />
            ))}
          </div>
          
          {/* Heart Rate Chart */}
          {currentSession && currentSession.heartRateData.length > 0 && (
            <HeartRateChart
              data={currentSession.heartRateData}
              zones={zones}
            />
          )}
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
