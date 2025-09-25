import { useMemo } from 'react';
import type { HeartRateZones, Rower } from '../types';
import { 
  calculateHeartRateZones, 
  calculateRowerHeartRateZones,
  getZoneForHeartRate,
  getZoneColor,
  getZoneName
} from '../utils/heartRateCalculations';

/**
 * Hook for calculating heart rate zones for a specific rower
 * @param rower - Rower object with age and optional custom HR values
 * @returns Heart rate zones and utility functions
 */
export const useHeartRateZones = (rower?: Rower) => {
  const zones = useMemo((): HeartRateZones => {
    if (!rower?.age) {
      // Fallback to default values if no rower data
      return calculateHeartRateZones(190, 60);
    }
    
    return calculateRowerHeartRateZones(
      rower.age,
      rower.restingHeartRate,
      rower.maxHeartRate
    );
  }, [rower?.age, rower?.restingHeartRate, rower?.maxHeartRate]);

  const getZoneForHeartRateValue = (heartRate: number): keyof HeartRateZones => {
    return getZoneForHeartRate(heartRate, zones);
  };

  const getZoneColorValue = (heartRate: number): string => {
    return getZoneColor(heartRate, zones);
  };

  const getZoneNameValue = (heartRate: number): string => {
    return getZoneName(heartRate, zones);
  };

  return {
    zones,
    getZoneForHeartRate: getZoneForHeartRateValue,
    getZoneColor: getZoneColorValue,
    getZoneName: getZoneNameValue
  };
};

/**
 * Legacy hook for backward compatibility with default values
 * @param maxHR - Maximum heart rate (default: 190)
 * @param restingHR - Resting heart rate (default: 60)
 * @returns Heart rate zones and utility functions
 */
export const useDefaultHeartRateZones = (maxHR: number = 190, restingHR: number = 60) => {
  const zones = useMemo((): HeartRateZones => {
    return calculateHeartRateZones(maxHR, restingHR);
  }, [maxHR, restingHR]);

  const getZoneForHeartRateValue = (heartRate: number): keyof HeartRateZones => {
    return getZoneForHeartRate(heartRate, zones);
  };

  const getZoneColorValue = (heartRate: number): string => {
    return getZoneColor(heartRate, zones);
  };

  const getZoneNameValue = (heartRate: number): string => {
    return getZoneName(heartRate, zones);
  };

  return {
    zones,
    getZoneForHeartRate: getZoneForHeartRateValue,
    getZoneColor: getZoneColorValue,
    getZoneName: getZoneNameValue
  };
};
