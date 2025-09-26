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
  isHealthy?: boolean;
  connectionAttempts?: number;
}

export interface HeartRateData {
  deviceId: string;
  heartRate: number;
  timestamp: Date;
  zone: keyof HeartRateZones;
  batteryLevel?: number;
  sessionId?: string; // Optional for backward compatibility
}

// Rower Types
export interface Rower {
  id: string;
  name: string;
  seat: number; // 1-4 for 4+ boat
  deviceId?: string;
  age?: number;
  restingHeartRate?: number;
  maxHeartRate?: number;
  targetZones: HeartRateZones;
  currentHeartRate?: HeartRateData;
  isActive?: boolean;
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
  finalHeartRateData?: HeartRateData[]; // Static snapshot captured when session ends
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
  currentView: 'dashboard' | 'progress' | 'export' | 'setup' | 'session' | 'settings' | 'compatibility';
  selectedRower?: string;
  showConflictDialog: boolean;
  isFullscreen: boolean;
}

// Session Analytics Types
export interface SessionMetrics {
  // Basic Metrics
  duration: number; // in minutes
  totalDataPoints: number;
  avgHeartRate: number;
  maxHeartRate: number;
  minHeartRate: number;
  
  // Advanced Metrics
  trimp: number; // Training Impulse
  tss: number; // Training Stress Score
  intensityFactor: number;
  normalizedPower: number;
  
  // Zone Analysis
  zoneDistribution: ZoneDistribution;
  timeInZones: TimeInZones;
  
  // Recovery Metrics
  recoveryTime: number; // estimated recovery time in hours
  heartRateVariability: number;
  recoveryScore: number; // 0-100
  
  // Performance Metrics
  performanceScore: number; // 0-100
  consistencyScore: number; // 0-100
  effortScore: number; // 0-100
  
  // Crew Metrics
  crewSynchronization: number; // 0-100
  crewCohesion: number; // 0-100
  individualVariance: IndividualVariance[];
}

export interface ZoneDistribution {
  recovery: number; // percentage
  aerobic: number;
  threshold: number;
  anaerobic: number;
}

export interface TimeInZones {
  recovery: number; // minutes
  aerobic: number;
  threshold: number;
  anaerobic: number;
}

export interface IndividualVariance {
  rowerId: string;
  rowerName: string;
  seat: number;
  variance: number; // standard deviation from crew average
  consistency: number; // 0-100
}

export interface RowerAnalytics {
  rowerId: string;
  rowerName: string;
  seat: number;
  metrics: {
    avgHeartRate: number;
    maxHeartRate: number;
    minHeartRate: number;
    trimp: number;
    timeInZones: TimeInZones;
    zoneDistribution: ZoneDistribution;
    consistencyScore: number;
    effortScore: number;
  };
}

export interface SessionReport {
  sessionId: string;
  sessionDate: string;
  sessionTime: string;
  duration: number;
  rowerCount: number;
  
  // Overall Session Summary
  overallMetrics: SessionMetrics;
  
  // Individual Rower Analysis
  rowerAnalytics: RowerAnalytics[];
  
  // Crew Analysis
  crewAnalysis: {
    synchronization: number;
    cohesion: number;
    performance: number;
    recommendations: string[];
  };
  
  // Training Insights
  insights: {
    primaryTrainingZone: string;
    trainingEffectiveness: number;
    improvementAreas: string[];
    strengths: string[];
  };
}

// Progress Tracking Types
export interface ProgressDataPoint {
  date: Date;
  sessionId: string;
  metrics: SessionMetrics;
  rowerMetrics: RowerProgressData[];
}

export interface RowerProgressData {
  rowerId: string;
  rowerName: string;
  seat: number;
  metrics: {
    avgHeartRate: number;
    maxHeartRate: number;
    trimp: number;
    consistencyScore: number;
    effortScore: number;
    timeInZones: {
      recovery: number;
      aerobic: number;
      threshold: number;
      anaerobic: number;
    };
  };
}

export interface ProgressTrend {
  metric: string;
  direction: 'improving' | 'declining' | 'stable';
  changeRate: number; // percentage change per week
  confidence: number; // 0-100, based on data points and consistency
  trendData: Array<{
    date: Date;
    value: number;
  }>;
}

export interface RowerProgressTrend {
  rowerId: string;
  rowerName: string;
  seat: number;
  trends: ProgressTrend[];
  overallProgress: number; // 0-100
  strengths: string[];
  improvementAreas: string[];
}

export interface CrewProgressTrend {
  overallProgress: number; // 0-100
  synchronizationTrend: ProgressTrend;
  cohesionTrend: ProgressTrend;
  performanceTrend: ProgressTrend;
  individualTrends: RowerProgressTrend[];
  crewStrengths: string[];
  crewImprovementAreas: string[];
}

export interface Goal {
  id: string;
  name: string;
  description: string;
  type: 'performance' | 'consistency' | 'endurance' | 'synchronization' | 'custom';
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: Date;
  targetDate: Date;
  isAchieved: boolean;
  progress: number; // 0-100
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  name: string;
  targetValue: number;
  achievedValue?: number;
  achievedDate?: Date;
  isAchieved: boolean;
  progress: number; // 0-100
}

export interface TrainingPhase {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  focus: 'base' | 'build' | 'peak' | 'recovery' | 'maintenance';
  targetMetrics: {
    primaryZone: string;
    avgIntensity: number;
    sessionDuration: number;
    weeklyVolume: number;
  };
  actualMetrics?: {
    avgIntensity: number;
    avgDuration: number;
    totalVolume: number;
    primaryZoneTime: number;
  };
  progress: number; // 0-100
}

export interface ProgressReport {
  period: {
    startDate: Date;
    endDate: Date;
    duration: number; // days
  };
  totalSessions: number;
  crewProgress: CrewProgressTrend;
  individualProgress: RowerProgressTrend[];
  goals: Goal[];
  trainingPhases: TrainingPhase[];
  insights: {
    keyImprovements: string[];
    areasOfConcern: string[];
    recommendations: string[];
    nextPhaseFocus: string;
  };
}
