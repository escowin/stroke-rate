import { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { 
  generateMockHeartRateData, 
  createMockRowers, 
  shouldUseMockData, 
  toggleMockData,
  isDevelopmentMode 
} from '../utils/mockData';
import { storeHeartRateDataBatch, deleteDatabase } from '../services/database';
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
    removeAllRowers,
    setConnectionStatus,
    addConnectedDevice,
    removeAllConnectedDevices,
    clearHeartRateData
  } = useAppStore();

  const [useMockData, setUseMockData] = useState(shouldUseMockData());
  const [mockDataInterval, setMockDataInterval] = useState<NodeJS.Timeout | null>(null);
  const [isGeneratingData, setIsGeneratingData] = useState(false);

  // Don't show in production
  if (!isDevelopmentMode()) {
    return null;
  }

  const handleToggleMockData = () => {
    const newMockDataState = !shouldUseMockData();
    toggleMockData();
    
    // If turning off mock data, clean up all mock data
    if (!newMockDataState) {
      // Stop any running mock data generation
      if (mockDataInterval) {
        clearInterval(mockDataInterval);
        setMockDataInterval(null);
      }
      setIsGeneratingData(false);
      
      // End any active mock session
      if (currentSession?.isActive) {
        endSession();
      }
      
      // Clear all mock rowers and connected devices
      removeAllRowers();
      removeAllConnectedDevices();
      clearHeartRateData();
      
      // Reset connection status
      setConnectionStatus({
        connectedDevices: [],
        isScanning: false
      });
    }
    
    // Update local state to reflect the new value
    setUseMockData(newMockDataState);
  };

  const handleLoadMockRowers = () => {
    // Only allow if mock data is enabled
    if (!useMockData) {
      console.warn('Mock data is disabled. Enable mock data first.');
      return;
    }
    
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
    // Only allow if mock data is enabled
    if (!useMockData) {
      console.warn('Mock data is disabled. Enable mock data first.');
      return;
    }
    
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
      
      // Store initial batch data to IndexedDB
      const dataWithSessionId = initialData.map(data => ({
        ...data,
        sessionId: session.id
      }));
      
      storeHeartRateDataBatch(dataWithSessionId).catch(error => {
        console.error('Failed to store initial mock data batch:', error);
      });
      
      // Also add to session for UI display
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
    // Only allow if mock data is enabled
    if (!useMockData) {
      console.warn('Mock data is disabled. Enable mock data first.');
      return;
    }
    
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

  const handleResetDatabase = async () => {
    try {
      await deleteDatabase();
      // Reload the page to reinitialize the database
      window.location.reload();
    } catch (error) {
      console.error('DevToggle - failed to reset database:', error);
    }
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
    <section className="dev-toggle">
      <header className="dev-toggle-header">
        <BeakerIcon className="dev-toggle-icon" />
        <h3 className="dev-toggle-title">
          Development Tools
        </h3>
      </header>
      
      <article className="dev-toggle-content">
        {/* Mock Data Toggle */}
        <div className="dev-toggle-control">
          <label htmlFor="toggle-switch" className="dev-toggle-label">Use Mock Data</label>
          <button
            id="toggle-switch"
            onClick={handleToggleMockData}
            className={`dev-toggle-switch ${
              useMockData ? 'dev-toggle-switch--active' : 'dev-toggle-switch--inactive'
            }`}
          >
            <span
              className={`dev-toggle-switch-thumb ${
                useMockData ? 'dev-toggle-switch-thumb--active' : 'dev-toggle-switch-thumb--inactive'
              }`}
            />
          </button>
        </div>

        {/* Mock Actions */}
        <div className="dev-toggle-actions">
          <button
            onClick={handleLoadMockRowers}
            disabled={!useMockData}
            className={`dev-toggle-button ${!useMockData ? 'dev-toggle-button--disabled' : ''}`}
          >
            Load Mock Rowers
          </button>

          {!currentSession?.isActive ? (
            <button
              onClick={handleStartMockSession}
              disabled={!useMockData}
              className={`dev-toggle-button dev-toggle-button--primary ${!useMockData ? 'dev-toggle-button--disabled' : ''}`}
            >
              <PlayIcon className="dev-toggle-button-icon" />
              Start Mock Session
            </button>
          ) : (
            <button
              onClick={handleStopMockSession}
              className="dev-toggle-button dev-toggle-button--danger"
            >
              <StopIcon className="dev-toggle-button-icon" />
              Stop Mock Session
            </button>
          )}
        </div>

        {/* Scenario Generation */}
        <div className="dev-toggle-scenarios">
          <p className="dev-toggle-scenarios-label">Generate Scenario Data:</p>
          <div className="dev-toggle-scenarios-list">
            {['practice', 'race', 'intervals', 'warmup'].map((scenario) => (
              <button
                key={scenario}
                onClick={() => handleGenerateScenario(scenario as any)}
                disabled={!useMockData}
                className={`dev-toggle-scenario-button ${!useMockData ? 'dev-toggle-scenario-button--disabled' : ''}`}
              >
                <ArrowPathIcon className="dev-toggle-scenario-icon" />
                {scenario.charAt(0).toUpperCase() + scenario.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Database Reset */}
        <div className="dev-toggle-actions">
          <button
            onClick={handleResetDatabase}
            className="dev-toggle-button dev-toggle-button--danger"
            title="Reset the entire IndexedDB database (useful when encountering storage errors)"
          >
            <ArrowPathIcon className="dev-toggle-button-icon" />
            Reset Database
          </button>
        </div>

        {isGeneratingData && (
          <div className="dev-toggle-status">
            <div className="dev-toggle-status-indicator" />
            <span>Generating real-time mock data...</span>
          </div>
        )}
      </article>
    </section>
  );
};
