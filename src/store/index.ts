import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { 
  AppState, 
  BluetoothDevice, 
  HeartRateData, 
  Rower, 
  TrainingSession,
  ConnectionStatus,
  UIState
} from '../types';
import { calculateRowerHeartRateZones } from '../utils/heartRateCalculations';
import { storeHeartRateData, storeSession, storeRower, getAllRowers } from '../services/database';

interface AppStore extends AppState {
  // Connection Management
  setConnectionStatus: (status: Partial<ConnectionStatus>) => void;
  addConnectedDevice: (device: BluetoothDevice) => void;
  removeConnectedDevice: (deviceId: string) => void;
  removeAllConnectedDevices: () => void;
  updateDeviceStatus: (deviceId: string, updates: Partial<BluetoothDevice>) => void;
  updateDeviceHealth: (deviceId: string, isHealthy: boolean) => void;
  getUnhealthyDevices: () => BluetoothDevice[];
  
  // Heart Rate Data
  updateHeartRate: (data: HeartRateData) => void;
  clearHeartRateData: () => void;
  
  // Rower Management
  addRower: (rower: Rower) => void;
  updateRower: (rowerId: string, updates: Partial<Rower>) => void;
  removeRower: (rowerId: string) => void;
  removeAllRowers: () => void;
  assignDeviceToRower: (rowerId: string, deviceId: string) => void;
  loadRowersFromDatabase: () => Promise<void>;
  
  // Session Management
  startSession: (session: TrainingSession) => void;
  endSession: () => void;
  updateSession: (updates: Partial<TrainingSession>) => void;
  
  // Error Handling
  setError: (error: string | undefined) => void;
  clearError: () => void;
  
  // UI State
  uiState: UIState;
  setUIState: (updates: Partial<UIState>) => void;
}

const initialConnectionStatus: ConnectionStatus = {
  isScanning: false,
  connectedDevices: [],
  availableDevices: [],
  hasSpeedCoachConflicts: false,
  conflicts: []
};

const initialUIState: UIState = {
  currentView: 'dashboard',
  showConflictDialog: false,
  isFullscreen: false
};

export const useAppStore = create<AppStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      connectionStatus: initialConnectionStatus,
      rowers: [],
      isConnected: false,
      uiState: initialUIState,
      
      // Connection Management
      setConnectionStatus: (status) =>
        set((state) => ({
          connectionStatus: { ...state.connectionStatus, ...status }
        })),
      
      addConnectedDevice: (device) =>
        set((state) => ({
          connectionStatus: {
            ...state.connectionStatus,
            connectedDevices: [...state.connectionStatus.connectedDevices, device]
          },
          isConnected: true
        })),
      
      removeConnectedDevice: (deviceId) =>
        set((state) => ({
          connectionStatus: {
            ...state.connectionStatus,
            connectedDevices: state.connectionStatus.connectedDevices.filter(
              device => device.id !== deviceId
            )
          },
          isConnected: state.connectionStatus.connectedDevices.length > 1
        })),
      
      removeAllConnectedDevices: () =>
        set((state) => ({
          connectionStatus: {
            ...state.connectionStatus,
            connectedDevices: []
          },
          isConnected: false
        })),
      
      updateDeviceStatus: (deviceId, updates) =>
        set((state) => ({
          connectionStatus: {
            ...state.connectionStatus,
            connectedDevices: state.connectionStatus.connectedDevices.map(device =>
              device.id === deviceId ? { ...device, ...updates } : device
            )
          }
        })),
      
      updateDeviceHealth: (deviceId, isHealthy) =>
        set((state) => ({
          connectionStatus: {
            ...state.connectionStatus,
            connectedDevices: state.connectionStatus.connectedDevices.map(device =>
              device.id === deviceId ? { ...device, isHealthy } : device
            )
          }
        })),
      
      getUnhealthyDevices: () => {
        const state = get();
        return state.connectionStatus.connectedDevices.filter(device => device.isHealthy === false);
      },
      
      // Heart Rate Data
      updateHeartRate: (data: HeartRateData) =>
        set((state) => {
          // console.log('Store - updateHeartRate called with:', data);
          // console.log('Store - current session:', state.currentSession);
          
          const updatedRowers = state.rowers.map(rower => {
            if (rower.deviceId === data.deviceId) {
              return { ...rower, currentHeartRate: data };
            }
            return rower;
          });
          
          const updatedSession = state.currentSession ? {
            ...state.currentSession,
            heartRateData: [...state.currentSession.heartRateData, data]
          } : undefined;
          
          // Store heart rate data in IndexedDB if we have an active session
          if (state.currentSession && state.currentSession.isActive) {
            const dataWithSessionId = {
              ...data,
              sessionId: state.currentSession.id
            };
            
            // Store asynchronously without blocking the UI
            storeHeartRateData(dataWithSessionId).catch(error => {
              console.error('Failed to store heart rate data:', error);
            });
          }
          
          // console.log('Store - updated session heartRateData length:', updatedSession?.heartRateData.length);
          
          return {
            rowers: updatedRowers,
            currentSession: updatedSession
          };
        }),
      
      clearHeartRateData: () =>
        set((state) => ({
          rowers: state.rowers.map(rower => ({ ...rower, currentHeartRate: undefined })),
          currentSession: state.currentSession ? {
            ...state.currentSession,
            heartRateData: []
          } : undefined
        })),
      
      // Rower Management
      addRower: (rower: Rower) =>
        set((state) => {
          // Store rower to IndexedDB
          storeRower(rower).catch(error => {
            console.error('Failed to store rower:', error);
          });
          
          return {
            rowers: [...state.rowers, rower]
          };
        }),
      
      updateRower: (rowerId: string, updates: Partial<Rower>) =>
        set((state) => {
          const updatedRowers = state.rowers.map(rower => {
            if (rower.id === rowerId) {
              const updatedRower = { ...rower, ...updates };
              
              // Recalculate heart rate zones if age or HR values changed
              if (updates.age !== undefined || updates.restingHeartRate !== undefined || updates.maxHeartRate !== undefined) {
                if (updatedRower.age) {
                  updatedRower.targetZones = calculateRowerHeartRateZones(
                    updatedRower.age,
                    updatedRower.restingHeartRate,
                    updatedRower.maxHeartRate
                  );
                }
              }
              
              // Store updated rower to IndexedDB
              storeRower(updatedRower).catch(error => {
                console.error('Failed to update rower in database:', error);
              });
              
              return updatedRower;
            }
            return rower;
          });
          
          return { rowers: updatedRowers };
        }),
      
      removeRower: (rowerId: string) =>
        set((state) => ({
          rowers: state.rowers.filter(rower => rower.id !== rowerId)
        })),
      
      removeAllRowers: () =>
        set(() => ({
          rowers: []
        })),
      
      assignDeviceToRower: (rowerId: string, deviceId: string) =>
        set((state) => ({
          rowers: state.rowers.map(rower =>
            rower.id === rowerId ? { ...rower, deviceId } : rower
          )
        })),
      
      loadRowersFromDatabase: async () => {
        try {
          const rowers = await getAllRowers();
          set({ rowers });
        } catch (error) {
          console.error('Failed to load rowers from database:', error);
        }
      },
      
      // Session Management
      startSession: (session: TrainingSession) =>
        set(() => {
          // Store session in IndexedDB
          storeSession(session).catch(error => {
            console.error('Failed to store session:', error);
          });
          
          return {
            currentSession: session
          };
        }),
      
      endSession: () =>
        set((state) => {
          if (!state.currentSession) return state;
          
          const endedSession = {
            ...state.currentSession,
            endTime: new Date(),
            isActive: false,
            finalHeartRateData: [...state.currentSession.heartRateData] // Capture static snapshot
          };
          
          // Store updated session in IndexedDB
          storeSession(endedSession).catch(error => {
            console.error('Failed to store ended session:', error);
          });
          
          return {
            currentSession: endedSession
          };
        }),
      
      updateSession: (updates: Partial<TrainingSession>) =>
        set((state) => {
          const updatedSession = state.currentSession ? {
            ...state.currentSession,
            ...updates
          } : undefined;
          
          // Store updated session in IndexedDB
          if (updatedSession) {
            storeSession(updatedSession).catch(error => {
              console.error('Failed to store updated session:', error);
            });
          }
          
          return {
            currentSession: updatedSession
          };
        }),
      
      // Error Handling
      setError: (error: string | undefined) =>
        set(() => ({ error })),
      
      clearError: () =>
        set(() => ({ error: undefined })),
      
      // UI State
      setUIState: (updates: Partial<UIState>) =>
        set((state) => ({
          uiState: { ...state.uiState, ...updates }
        }))
    }),
    {
      name: 'coxswain-hr-store'
    }
  )
);
