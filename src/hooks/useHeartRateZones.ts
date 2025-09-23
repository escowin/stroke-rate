import { useMemo } from 'react';
import type { HeartRateZones, HeartRateZone } from '../types';

export const useHeartRateZones = (maxHR: number = 190, restingHR: number = 60) => {
  const zones = useMemo((): HeartRateZones => {
    // Calculate heart rate reserve (HRR)
    const hrr = maxHR - restingHR;
    
    // Calculate zone boundaries using Karvonen method
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
  }, [maxHR, restingHR]);

  const getZoneForHeartRate = (heartRate: number): keyof HeartRateZones => {
    if (heartRate <= zones.recovery.max) return 'recovery';
    if (heartRate <= zones.aerobic.max) return 'aerobic';
    if (heartRate <= zones.threshold.max) return 'threshold';
    return 'anaerobic';
  };

  const getZoneColor = (heartRate: number): string => {
    const zone = getZoneForHeartRate(heartRate);
    return zones[zone].color;
  };

  const getZoneName = (heartRate: number): string => {
    const zone = getZoneForHeartRate(heartRate);
    return zones[zone].name;
  };

  return {
    zones,
    getZoneForHeartRate,
    getZoneColor,
    getZoneName
  };
};
