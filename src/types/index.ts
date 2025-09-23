// Heart Rate Zone Types
export interface HeartRateZone {
  name: string;
  min: number;
  max: number;
  color: string;
  description: string;
}

export interface HeartRateZones {
  recovery: HeartRateZone;
  aerobic: HeartRateZone;
  threshold: HeartRateZone;
  anaerobic: HeartRateZone;
}

// Bluetooth Device Types
export interface BluetoothDevice {
  id: string;
  name: string;
  connected: boolean;
  batteryLevel?: number;
  lastSeen: Date;
  isConnectedToSpeedCoach?: boolean;
}

export interface HeartRateData {
  deviceId: string;
  heartRate: number;
  timestamp: Date;
  zone: keyof HeartRateZones;
}

// Rower Types
export interface Rower {
  id: string;
  name: string;
  seat: number; // 1-4 for 4+ boat
  deviceId?: string;
  targetZones: HeartRateZones;
  currentHeartRate?: HeartRateData;
}

// Connection Status Types
export interface ConnectionStatus {
  isScanning: boolean;
  connectedDevices: BluetoothDevice[];
  availableDevices: BluetoothDevice[];
  hasSpeedCoachConflicts: boolean;
  conflicts: SpeedCoachConflict[];
}

export interface SpeedCoachConflict {
  deviceId: string;
  deviceName: string;
  isConnectedToSpeedCoach: boolean;
  canDisconnect: boolean;
}

// Session Types
export interface TrainingSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  rowers: Rower[];
  heartRateData: HeartRateData[];
  isActive: boolean;
}

// App State Types
export interface AppState {
  connectionStatus: ConnectionStatus;
  currentSession?: TrainingSession;
  rowers: Rower[];
  isConnected: boolean;
  error?: string;
}

// Bluetooth Service Types
export interface BluetoothService {
  device: BluetoothDevice;
  server: any;
  service: any;
  characteristic: any;
}

// Heart Rate Calculation Types
export interface HeartRateCalculation {
  restingHR: number;
  maxHR: number;
  zones: HeartRateZones;
}

// UI State Types
export interface UIState {
  currentView: 'dashboard' | 'setup' | 'session' | 'settings';
  selectedRower?: string;
  showConflictDialog: boolean;
  isFullscreen: boolean;
}
