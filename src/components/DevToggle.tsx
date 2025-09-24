import { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { 
  generateMockHeartRateData, 
  createMockRowers, 
  shouldUseMockData, 
  toggleMockData,
  isDevelopmentMode 
} from '../utils/mockData';
import { 
  BeakerIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export const DevToggle = () => {
  const { 
    rowers, 
    currentSession, 
    startSession, 
    endSession, 
    updateHeartRate,
    addRower,
    setConnectionStatus,
    addConnectedDevice
  } = useAppStore();

  const [useMockData, setUseMockData] = useState(shouldUseMockData());
  const [mockDataInterval, setMockDataInterval] = useState<NodeJS.Timeout | null>(null);
  const [isGeneratingData, setIsGeneratingData] = useState(false);

  // Don't show in production
  if (!isDevelopmentMode()) {
    return null;
  }

  const handleToggleMockData = () => {
    toggleMockData();
    setUseMockData(!useMockData);
  };

  const handleLoadMockRowers = () => {
    const mockRowers = createMockRowers();
    
    // Add mock rowers to store
    mockRowers.forEach(rower => {
      addRower(rower);
    });

    // Add mock connected devices
    mockRowers.forEach(rower => {
      if (rower.deviceId) {
        addConnectedDevice({
          id: rower.deviceId,
          name: `Mock HRM ${rower.seat}`,
          connected: true,
          lastSeen: new Date(),
          isHealthy: true
        });
      }
    });

    // Update connection status
    setConnectionStatus({
      connectedDevices: mockRowers.map(rower => ({
        id: rower.deviceId!,
        name: `Mock HRM ${rower.seat}`,
        connected: true,
        lastSeen: new Date(),
        isHealthy: true
      })),
      isScanning: false
    });
  };

  const handleStartMockSession = () => {
    if (rowers.length === 0) {
      handleLoadMockRowers();
      // Wait a bit for rowers to be added
      setTimeout(() => startMockSession(), 100);
      return;
    }
    
    startMockSession();
  };

  const startMockSession = () => {
    const session = {
      id: `mock-session-${Date.now()}`,
      startTime: new Date(),
      rowers: rowers.length > 0 ? rowers : createMockRowers(),
      heartRateData: [],
      isActive: true
    };
    
    startSession(session);
    setIsGeneratingData(true);

    // Wait for session to be set before adding data
    setTimeout(() => {
      // Generate initial batch of mock data
      const initialData = generateMockHeartRateData(session.rowers, 30, 'practice');
      // console.log('DevToggle - generated initial data:', initialData);
      initialData.forEach(data => {
        // console.log('DevToggle - adding heart rate data:', data);
        updateHeartRate(data);
      });
    }, 100);

    // Start real-time mock data generation
    const interval = setInterval(() => {
      session.rowers.forEach(rower => {
        if (rower.deviceId) {
          const mockReading = {
            deviceId: rower.deviceId,
            heartRate: 120 + (rower.seat - 1) * 10 + Math.round((Math.random() - 0.5) * 20),
            timestamp: new Date(),
            zone: 'aerobic' as const
          };
          // console.log('DevToggle - adding real-time data:', mockReading);
          updateHeartRate(mockReading);
        }
      });
    }, 2000); // Update every 2 seconds

    setMockDataInterval(interval);
  };

  const handleStopMockSession = () => {
    if (mockDataInterval) {
      clearInterval(mockDataInterval);
      setMockDataInterval(null);
    }
    setIsGeneratingData(false);
    endSession();
  };

  const handleGenerateScenario = (scenario: 'practice' | 'race' | 'intervals' | 'warmup') => {
    if (rowers.length === 0) {
      handleLoadMockRowers();
      setTimeout(() => generateScenarioData(scenario), 100);
      return;
    }
    
    generateScenarioData(scenario);
  };

  const generateScenarioData = (scenario: 'practice' | 'race' | 'intervals' | 'warmup') => {
    if (!currentSession?.isActive) {
      console.log('DevToggle - no active session, cannot generate scenario data');
      return;
    }
    
    const mockData = generateMockHeartRateData(rowers, 120, scenario); // 2 minutes of data
    // console.log('DevToggle - generated scenario data:', mockData.length, 'points for', scenario);
    mockData.forEach(data => {
      // console.log('DevToggle - adding scenario data:', data);
      updateHeartRate(data);
    });
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (mockDataInterval) {
        clearInterval(mockDataInterval);
      }
    };
  }, [mockDataInterval]);

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-2 mb-3">
        <BeakerIcon className="h-5 w-5 text-purple-600" />
        <h3 className="text-sm font-medium text-purple-900">
          Development Tools
        </h3>
      </div>
      
      <div className="space-y-3">
        {/* Mock Data Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-purple-700">Use Mock Data</span>
          <button
            onClick={handleToggleMockData}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
              useMockData ? 'bg-purple-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                useMockData ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Mock Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleLoadMockRowers}
            className="inline-flex items-center px-3 py-1 border border-purple-300 text-xs font-medium rounded-md text-purple-700 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Load Mock Rowers
          </button>

          {!currentSession?.isActive ? (
            <button
              onClick={handleStartMockSession}
              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <PlayIcon className="h-3 w-3 mr-1" />
              Start Mock Session
            </button>
          ) : (
            <button
              onClick={handleStopMockSession}
              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <StopIcon className="h-3 w-3 mr-1" />
              Stop Mock Session
            </button>
          )}
        </div>

        {/* Scenario Generation */}
        <div>
          <p className="text-xs text-purple-600 mb-2">Generate Scenario Data:</p>
          <div className="flex flex-wrap gap-2">
            {['practice', 'race', 'intervals', 'warmup'].map((scenario) => (
              <button
                key={scenario}
                onClick={() => handleGenerateScenario(scenario as any)}
                className="inline-flex items-center px-2 py-1 border border-purple-300 text-xs font-medium rounded text-purple-700 bg-white hover:bg-purple-50 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <ArrowPathIcon className="h-3 w-3 mr-1" />
                {scenario.charAt(0).toUpperCase() + scenario.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {isGeneratingData && (
          <div className="flex items-center space-x-2 text-xs text-purple-600">
            <div className="animate-pulse w-2 h-2 bg-purple-500 rounded-full" />
            <span>Generating real-time mock data...</span>
          </div>
        )}
      </div>
    </div>
  );
};
