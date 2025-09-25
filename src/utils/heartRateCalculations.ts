import type { HeartRateZones, HeartRateZone } from '../types';

/**
 * Calculate maximum heart rate for athletic individuals
 * Uses Tanaka formula which is more accurate for trained athletes
 * @param age - Age in years (14-80+)
 * @returns Estimated maximum heart rate
 */
export const calculateMaxHeartRate = (age: number): number => {
  // Validate age range
  if (age < 14) age = 14;
  if (age > 80) age = 80;
  
  // Tanaka formula: 208 - (0.7 * age) - more accurate for athletes
  // This formula works well across the full age range for athletic individuals
  return Math.round(208 - (0.7 * age));
};

/**
 * Estimate resting heart rate for athletic rowers
 * Athletic individuals typically have lower resting HR
 * @param age - Age in years (14-80+)
 * @returns Estimated resting heart rate
 */
export const estimateRestingHeartRate = (age: number): number => {
  // Validate age range
  if (age < 14) age = 14;
  if (age > 80) age = 80;
  
  // Athletic individuals typically have resting HR 40-70 BPM
  // Younger athletes tend to have lower resting HR
  if (age <= 18) return 45;      // High School (14-18)
  if (age <= 22) return 48;      // Collegiate (18-22)
  if (age <= 30) return 52;      // Young Masters (23-30)
  if (age <= 40) return 55;      // Masters A (31-40)
  if (age <= 50) return 58;      // Masters B (41-50)
  if (age <= 60) return 62;      // Masters C (51-60)
  if (age <= 70) return 65;      // Masters D (61-70)
  return 68;                     // Masters E+ (71-80+)
};

/**
 * Calculate heart rate zones using Karvonen method (Heart Rate Reserve)
 * Optimized for athletic training with proper zone boundaries
 * @param maxHR - Maximum heart rate
 * @param restingHR - Resting heart rate
 * @returns Heart rate zones object
 */
export const calculateHeartRateZones = (
  maxHR: number, 
  restingHR: number
): HeartRateZones => {
  // Calculate heart rate reserve (HRR)
  const hrr = maxHR - restingHR;
  
  // Athletic training zones using Karvonen method
  const recovery: HeartRateZone = {
    name: 'Recovery',
    min: Math.round(restingHR + (hrr * 0.5)),
    max: Math.round(restingHR + (hrr * 0.6)),
    color: '#10b981',
    description: 'Active recovery and warm-up'
  };
  
  const aerobic: HeartRateZone = {
    name: 'Aerobic',
    min: Math.round(restingHR + (hrr * 0.6)),
    max: Math.round(restingHR + (hrr * 0.7)),
    color: '#3b82f6',
    description: 'Base aerobic training'
  };
  
  const threshold: HeartRateZone = {
    name: 'Threshold',
    min: Math.round(restingHR + (hrr * 0.7)),
    max: Math.round(restingHR + (hrr * 0.8)),
    color: '#f59e0b',
    description: 'Lactate threshold training'
  };
  
  const anaerobic: HeartRateZone = {
    name: 'Anaerobic',
    min: Math.round(restingHR + (hrr * 0.8)),
    max: maxHR,
    color: '#ef4444',
    description: 'High-intensity intervals'
  };
  
  return { recovery, aerobic, threshold, anaerobic };
};

/**
 * Calculate heart rate zones for a rower based on their age
 * @param age - Rower's age in years
 * @param customRestingHR - Optional custom resting HR (if known)
 * @param customMaxHR - Optional custom max HR (if known)
 * @returns Heart rate zones object
 */
export const calculateRowerHeartRateZones = (
  age: number,
  customRestingHR?: number,
  customMaxHR?: number
): HeartRateZones => {
  const maxHR = customMaxHR || calculateMaxHeartRate(age);
  const restingHR = customRestingHR || estimateRestingHeartRate(age);
  
  return calculateHeartRateZones(maxHR, restingHR);
};

/**
 * Get zone for a specific heart rate
 * @param heartRate - Current heart rate
 * @param zones - Heart rate zones object
 * @returns Zone key
 */
export const getZoneForHeartRate = (
  heartRate: number, 
  zones: HeartRateZones
): keyof HeartRateZones => {
  if (heartRate <= zones.recovery.max) return 'recovery';
  if (heartRate <= zones.aerobic.max) return 'aerobic';
  if (heartRate <= zones.threshold.max) return 'threshold';
  return 'anaerobic';
};

/**
 * Get zone color for a specific heart rate
 * @param heartRate - Current heart rate
 * @param zones - Heart rate zones object
 * @returns Zone color
 */
export const getZoneColor = (
  heartRate: number, 
  zones: HeartRateZones
): string => {
  const zone = getZoneForHeartRate(heartRate, zones);
  return zones[zone].color;
};

/**
 * Get zone name for a specific heart rate
 * @param heartRate - Current heart rate
 * @param zones - Heart rate zones object
 * @returns Zone name
 */
export const getZoneName = (
  heartRate: number, 
  zones: HeartRateZones
): string => {
  const zone = getZoneForHeartRate(heartRate, zones);
  return zones[zone].name;
};
