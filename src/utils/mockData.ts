import type { HeartRateData, Rower, HeartRateZones } from '../types';

// Calculate heart rate zone based on BPM
const calculateZone = (heartRate: number): keyof HeartRateZones => {
  if (heartRate < 120) return 'recovery';
  if (heartRate < 150) return 'aerobic';
  if (heartRate < 170) return 'threshold';
  return 'anaerobic';
};

// Generate realistic heart rate patterns for different training scenarios
const generateHeartRatePattern = (
  baseHR: number, 
  patternType: 'steady' | 'intervals' | 'warmup' | 'recovery',
  timeIndex: number,
  duration: number
): number => {
  const progress = timeIndex / duration;
  
  switch (patternType) {
    case 'steady':
      // Steady aerobic pace with small variations
      return baseHR + Math.sin(timeIndex / 30) * 5 + (Math.random() - 0.5) * 3;
    
    case 'intervals':
      // Interval training pattern - high/low cycles
      const intervalCycle = Math.floor(timeIndex / 60); // 60-second intervals
      const isHighIntensity = intervalCycle % 2 === 0;
      const cycleProgress = (timeIndex % 60) / 60;
      
      if (isHighIntensity) {
        // Ramp up to high intensity
        return baseHR + 20 + (cycleProgress * 15) + (Math.random() - 0.5) * 5;
      } else {
        // Recovery between intervals
        return baseHR - 10 + (Math.random() - 0.5) * 8;
      }
    
    case 'warmup':
      // Gradual increase from low to target HR
      const warmupProgress = Math.min(progress * 3, 1); // Warm up over first third
      return (baseHR - 30) + (warmupProgress * 40) + (Math.random() - 0.5) * 5;
    
    case 'recovery':
      // Gradual decrease from high to low HR
      const recoveryProgress = progress;
      return (baseHR + 20) - (recoveryProgress * 35) + (Math.random() - 0.5) * 3;
    
    default:
      return baseHR + (Math.random() - 0.5) * 10;
  }
};

// Generate mock heart rate data for multiple rowers
export const generateMockHeartRateData = (
  rowers: Rower[], 
  duration: number = 300, // 5 minutes default
  scenario: 'practice' | 'race' | 'intervals' | 'warmup' = 'practice'
): HeartRateData[] => {
  if (rowers.length === 0) return [];
  
  const mockData: HeartRateData[] = [];
  const startTime = new Date();
  
  // Define different patterns for each rower based on seat position
  const rowerPatterns: Record<number, { baseHR: number; pattern: 'steady' | 'intervals' | 'warmup' | 'recovery' }> = {
    1: { baseHR: 140, pattern: scenario === 'intervals' ? 'intervals' : 'steady' }, // Bow - steady pacer
    2: { baseHR: 145, pattern: scenario === 'intervals' ? 'intervals' : 'steady' }, // 2-seat - slightly higher
    3: { baseHR: 135, pattern: scenario === 'intervals' ? 'intervals' : 'steady' }, // 3-seat - conservative
    4: { baseHR: 150, pattern: scenario === 'intervals' ? 'intervals' : 'steady' }  // Stroke - highest intensity
  };
  
  rowers.forEach((rower) => {
    if (!rower.deviceId) return;
    
    const rowerConfig = rowerPatterns[rower.seat] || { baseHR: 140, pattern: 'steady' as const };
    
    for (let i = 0; i < duration; i++) {
      const heartRate = generateHeartRatePattern(
        rowerConfig.baseHR,
        rowerConfig.pattern,
        i,
        duration
      );
      
      // Ensure HR stays within realistic bounds
      const clampedHR = Math.max(60, Math.min(200, Math.round(heartRate)));
      
      mockData.push({
        deviceId: rower.deviceId,
        heartRate: clampedHR,
        timestamp: new Date(startTime.getTime() + i * 1000), // 1-second intervals
        zone: calculateZone(clampedHR)
      });
    }
  });
  
  // Sort by timestamp to simulate real-time data flow
  return mockData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
};

// Generate a single mock heart rate reading for real-time simulation
export const generateMockHeartRateReading = (
  deviceId: string,
  previousReading?: HeartRateData,
  rowerSeat: number = 1
): HeartRateData => {
  const baseHR = 140 + (rowerSeat - 1) * 5; // Different base rates per seat
  const previousHR = previousReading?.heartRate || baseHR;
  
  // Generate realistic variation (±5 BPM from previous reading)
  const variation = (Math.random() - 0.5) * 10;
  const newHR = Math.max(60, Math.min(200, Math.round(previousHR + variation)));
  
  return {
    deviceId,
    heartRate: newHR,
    timestamp: new Date(),
    zone: calculateZone(newHR)
  };
};

// Mock rower data for testing
export const createMockRowers = (): Rower[] => {
  const mockRowers: Rower[] = [
    {
      id: 'rower-1',
      name: 'Edwin',
      seat: 1,
      deviceId: 'mock-device-1',
      targetZones: {
        recovery: { name: 'Recovery', min: 60, max: 120, color: '#10b981', description: 'Active recovery' },
        aerobic: { name: 'Aerobic', min: 120, max: 150, color: '#3b82f6', description: 'Base aerobic' },
        threshold: { name: 'Threshold', min: 150, max: 170, color: '#f59e0b', description: 'Lactate threshold' },
        anaerobic: { name: 'Anaerobic', min: 170, max: 190, color: '#ef4444', description: 'High intensity' }
      }
    },
    {
      id: 'rower-2',
      name: 'John',
      seat: 2,
      deviceId: 'mock-device-2',
      targetZones: {
        recovery: { name: 'Recovery', min: 60, max: 120, color: '#10b981', description: 'Active recovery' },
        aerobic: { name: 'Aerobic', min: 120, max: 150, color: '#3b82f6', description: 'Base aerobic' },
        threshold: { name: 'Threshold', min: 150, max: 170, color: '#f59e0b', description: 'Lactate threshold' },
        anaerobic: { name: 'Anaerobic', min: 170, max: 190, color: '#ef4444', description: 'High intensity' }
      }
    },
    {
      id: 'rower-3',
      name: 'Craig',
      seat: 3,
      deviceId: 'mock-device-3',
      targetZones: {
        recovery: { name: 'Recovery', min: 60, max: 120, color: '#10b981', description: 'Active recovery' },
        aerobic: { name: 'Aerobic', min: 120, max: 150, color: '#3b82f6', description: 'Base aerobic' },
        threshold: { name: 'Threshold', min: 150, max: 170, color: '#f59e0b', description: 'Lactate threshold' },
        anaerobic: { name: 'Anaerobic', min: 170, max: 190, color: '#ef4444', description: 'High intensity' }
      }
    },
    {
      id: 'rower-4',
      name: 'Rob',
      seat: 4,
      deviceId: 'mock-device-4',
      targetZones: {
        recovery: { name: 'Recovery', min: 60, max: 120, color: '#10b981', description: 'Active recovery' },
        aerobic: { name: 'Aerobic', min: 120, max: 150, color: '#3b82f6', description: 'Base aerobic' },
        threshold: { name: 'Threshold', min: 150, max: 170, color: '#f59e0b', description: 'Lactate threshold' },
        anaerobic: { name: 'Anaerobic', min: 170, max: 190, color: '#ef4444', description: 'High intensity' }
      }
    }
  ];
  
  return mockRowers;
};

// Development mode helpers
export const isDevelopmentMode = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

export const shouldUseMockData = (): boolean => {
  return isDevelopmentMode() && localStorage.getItem('useMockData') === 'true';
};

export const toggleMockData = (): void => {
  const current = shouldUseMockData();
  localStorage.setItem('useMockData', (!current).toString());
  // No need to reload - the DevToggle component will reactively update
};
