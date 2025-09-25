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

interface AppStore extends AppState {
  // Connection Management
  setConnectionStatus: (status: Partial<ConnectionStatus>) => void;
  addConnectedDevice: (device: BluetoothDevice) => void;
  removeConnectedDevice: (deviceId: string) => void;
  removeAllConnectedDevices: () => void;
  updateDeviceStatus: (deviceId: string, updates: Partial<BluetoothDevice>) => void;
  
  // Heart Rate Data
  updateHeartRate: (data: HeartRateData) => void;
  clearHeartRateData: () => void;
  
  // Rower Management
  addRower: (rower: Rower) => void;
  updateRower: (rowerId: string, updates: Partial<Rower>) => void;
  removeRower: (rowerId: string) => void;
  removeAllRowers: () => void;
  assignDeviceToRower: (rowerId: string, deviceId: string) => void;
  
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
    (set) => ({
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
      
      // Heart Rate Data
      updateHeartRate: (data) =>
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
      addRower: (rower) =>
        set((state) => ({
          rowers: [...state.rowers, rower]
        })),
      
      updateRower: (rowerId, updates) =>
        set((state) => ({
          rowers: state.rowers.map(rower =>
            rower.id === rowerId ? { ...rower, ...updates } : rower
          )
        })),
      
      removeRower: (rowerId) =>
        set((state) => ({
          rowers: state.rowers.filter(rower => rower.id !== rowerId)
        })),
      
      removeAllRowers: () =>
        set(() => ({
          rowers: []
        })),
      
      assignDeviceToRower: (rowerId, deviceId) =>
        set((state) => ({
          rowers: state.rowers.map(rower =>
            rower.id === rowerId ? { ...rower, deviceId } : rower
          )
        })),
      
      // Session Management
      startSession: (session) =>
        set(() => ({
          currentSession: session
        })),
      
      endSession: () =>
        set((state) => ({
          currentSession: state.currentSession ? {
            ...state.currentSession,
            endTime: new Date(),
            isActive: false,
            finalHeartRateData: [...state.currentSession.heartRateData] // Capture static snapshot
          } : undefined
        })),
      
      updateSession: (updates) =>
        set((state) => ({
          currentSession: state.currentSession ? {
            ...state.currentSession,
            ...updates
          } : undefined
        })),
      
      // Error Handling
      setError: (error) =>
        set(() => ({ error })),
      
      clearError: () =>
        set(() => ({ error: undefined })),
      
      // UI State
      setUIState: (updates) =>
        set((state) => ({
          uiState: { ...state.uiState, ...updates }
        }))
    }),
    {
      name: 'coxswain-hr-store'
    }
  )
);
