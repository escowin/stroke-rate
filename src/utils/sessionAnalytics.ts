import type { HeartRateData, TrainingSession, Rower, HeartRateZones } from '../types';

// Advanced Analytics Types
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

/**
 * Calculate Training Impulse (TRIMP) - a measure of training load
 * TRIMP = duration × avgHR × 0.64 × e^(1.92 × avgHR/maxHR)
 * @param heartRateData - Array of heart rate data points
 * @param maxHR - Maximum heart rate
 * @param duration - Session duration in minutes
 * @returns TRIMP value
 */
export const calculateTRIMP = (
  heartRateData: HeartRateData[],
  maxHR: number,
  duration: number
): number => {
  if (heartRateData.length === 0 || duration === 0) return 0;
  
  const avgHR = heartRateData.reduce((sum, data) => sum + data.heartRate, 0) / heartRateData.length;
  const intensityRatio = avgHR / maxHR;
  
  // TRIMP formula: duration × avgHR × 0.64 × e^(1.92 × intensityRatio)
  const trimp = duration * avgHR * 0.64 * Math.exp(1.92 * intensityRatio);
  
  return Math.round(trimp);
};

/**
 * Calculate Training Stress Score (TSS) - normalized training load
 * TSS = (TRIMP / 100) × 100
 * @param trimp - Training Impulse value
 * @returns TSS value (0-100+)
 */
export const calculateTSS = (trimp: number): number => {
  return Math.round((trimp / 100) * 100);
};

/**
 * Calculate Intensity Factor - ratio of normalized power to functional threshold
 * @param avgHeartRate - Average heart rate
 * @param maxHeartRate - Maximum heart rate
 * @returns Intensity factor (0-1+)
 */
export const calculateIntensityFactor = (avgHeartRate: number, maxHeartRate: number): number => {
  if (maxHeartRate === 0) return 0;
  return Math.round((avgHeartRate / maxHeartRate) * 100) / 100;
};

/**
 * Calculate Normalized Power - power equivalent for heart rate
 * @param heartRateData - Array of heart rate data points
 * @param maxHR - Maximum heart rate
 * @returns Normalized power value
 */
export const calculateNormalizedPower = (
  heartRateData: HeartRateData[],
  maxHR: number
): number => {
  if (heartRateData.length === 0) return 0;
  
  // Convert heart rate to power equivalent using a simplified formula
  // This is a rough approximation - in reality, you'd need actual power data
  const avgHR = heartRateData.reduce((sum, data) => sum + data.heartRate, 0) / heartRateData.length;
  const intensityRatio = avgHR / maxHR;
  
  // Simplified power calculation based on heart rate intensity
  const normalizedPower = Math.pow(intensityRatio, 3) * 300; // 300W as reference
  
  return Math.round(normalizedPower);
};

/**
 * Calculate zone distribution and time in zones
 * @param heartRateData - Array of heart rate data points
 * @param zones - Heart rate zones
 * @param duration - Session duration in minutes
 * @returns Zone distribution and time in zones
 */
export const calculateZoneAnalysis = (
  heartRateData: HeartRateData[],
  zones: HeartRateZones,
  duration: number
): { zoneDistribution: ZoneDistribution; timeInZones: TimeInZones } => {
  const zoneCounts = {
    recovery: 0,
    aerobic: 0,
    threshold: 0,
    anaerobic: 0
  };
  
  // Count data points in each zone
  heartRateData.forEach(data => {
    const hr = data.heartRate;
    if (hr <= zones.recovery.max) {
      zoneCounts.recovery++;
    } else if (hr <= zones.aerobic.max) {
      zoneCounts.aerobic++;
    } else if (hr <= zones.threshold.max) {
      zoneCounts.threshold++;
    } else {
      zoneCounts.anaerobic++;
    }
  });
  
  const totalPoints = heartRateData.length;
  
  // Calculate percentages
  const zoneDistribution: ZoneDistribution = {
    recovery: totalPoints > 0 ? Math.round((zoneCounts.recovery / totalPoints) * 100) : 0,
    aerobic: totalPoints > 0 ? Math.round((zoneCounts.aerobic / totalPoints) * 100) : 0,
    threshold: totalPoints > 0 ? Math.round((zoneCounts.threshold / totalPoints) * 100) : 0,
    anaerobic: totalPoints > 0 ? Math.round((zoneCounts.anaerobic / totalPoints) * 100) : 0
  };
  
  // Calculate time in each zone (in minutes)
  const timeInZones: TimeInZones = {
    recovery: totalPoints > 0 ? Math.round((zoneCounts.recovery / totalPoints) * duration) : 0,
    aerobic: totalPoints > 0 ? Math.round((zoneCounts.aerobic / totalPoints) * duration) : 0,
    threshold: totalPoints > 0 ? Math.round((zoneCounts.threshold / totalPoints) * duration) : 0,
    anaerobic: totalPoints > 0 ? Math.round((zoneCounts.anaerobic / totalPoints) * duration) : 0
  };
  
  return { zoneDistribution, timeInZones };
};

/**
 * Calculate heart rate variability (simplified RMSSD approximation)
 * @param heartRateData - Array of heart rate data points
 * @returns HRV value
 */
export const calculateHeartRateVariability = (heartRateData: HeartRateData[]): number => {
  if (heartRateData.length < 2) return 0;
  
  // Calculate differences between consecutive heart rates
  const differences: number[] = [];
  for (let i = 1; i < heartRateData.length; i++) {
    const diff = heartRateData[i].heartRate - heartRateData[i - 1].heartRate;
    differences.push(diff * diff); // Square the differences
  }
  
  // Calculate mean of squared differences
  const meanSquaredDiff = differences.reduce((sum, diff) => sum + diff, 0) / differences.length;
  
  // RMSSD approximation
  const rmssd = Math.sqrt(meanSquaredDiff);
  
  return Math.round(rmssd * 100) / 100;
};

/**
 * Calculate recovery time estimate based on training load
 * @param trimp - Training Impulse value
 * @param tss - Training Stress Score
 * @returns Recovery time in hours
 */
export const calculateRecoveryTime = (trimp: number, tss: number): number => {
  // Recovery time based on training load
  // Higher TSS = longer recovery time
  const baseRecovery = 2; // Base 2 hours
  const additionalRecovery = (tss / 100) * 12; // Up to 12 additional hours for high TSS
  
  return Math.round((baseRecovery + additionalRecovery) * 10) / 10;
};

/**
 * Calculate recovery score (0-100)
 * @param heartRateVariability - HRV value
 * @param recoveryTime - Estimated recovery time
 * @param maxHR - Maximum heart rate
 * @param restingHR - Resting heart rate
 * @returns Recovery score (0-100)
 */
export const calculateRecoveryScore = (
  heartRateVariability: number,
  recoveryTime: number,
  maxHR: number,
  restingHR: number
): number => {
  // Higher HRV = better recovery
  // Shorter recovery time = better recovery
  // Lower resting HR = better recovery
  
  const hrr = maxHR - restingHR;
  const hrvScore = Math.min(heartRateVariability * 10, 50); // Max 50 points for HRV
  const recoveryTimeScore = Math.max(0, 30 - (recoveryTime - 2) * 2); // Max 30 points for recovery time
  const restingHRScore = Math.max(0, 20 - (restingHR - 40) * 0.5); // Max 20 points for resting HR
  
  const totalScore = hrvScore + recoveryTimeScore + restingHRScore;
  return Math.min(Math.round(totalScore), 100);
};

/**
 * Calculate performance score (0-100)
 * @param avgHeartRate - Average heart rate
 * @param maxHeartRate - Maximum heart rate
 * @param duration - Session duration in minutes
 * @param targetZone - Target training zone
 * @returns Performance score (0-100)
 */
export const calculatePerformanceScore = (
  avgHeartRate: number,
  maxHeartRate: number,
  duration: number,
  targetZone: 'recovery' | 'aerobic' | 'threshold' | 'anaerobic'
): number => {
  const intensityRatio = avgHeartRate / maxHeartRate;
  
  // Define target intensity ranges for each zone
  const targetRanges = {
    recovery: { min: 0.5, max: 0.6 },
    aerobic: { min: 0.6, max: 0.7 },
    threshold: { min: 0.7, max: 0.8 },
    anaerobic: { min: 0.8, max: 1.0 }
  };
  
  const target = targetRanges[targetZone];
  const zoneAccuracy = Math.max(0, 100 - Math.abs(intensityRatio - (target.min + target.max) / 2) * 200);
  const durationScore = Math.min(duration / 60 * 20, 20); // Max 20 points for duration
  
  return Math.min(Math.round(zoneAccuracy + durationScore), 100);
};

/**
 * Calculate consistency score (0-100)
 * @param heartRateData - Array of heart rate data points
 * @returns Consistency score (0-100)
 */
export const calculateConsistencyScore = (heartRateData: HeartRateData[]): number => {
  if (heartRateData.length < 2) return 0;
  
  const heartRates = heartRateData.map(data => data.heartRate);
  const avgHR = heartRates.reduce((sum, hr) => sum + hr, 0) / heartRates.length;
  
  // Calculate standard deviation
  const variance = heartRates.reduce((sum, hr) => sum + Math.pow(hr - avgHR, 2), 0) / heartRates.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Lower standard deviation = higher consistency
  const consistencyScore = Math.max(0, 100 - (standardDeviation / avgHR) * 100);
  
  return Math.round(consistencyScore);
};

/**
 * Calculate effort score (0-100)
 * @param avgHeartRate - Average heart rate
 * @param maxHeartRate - Maximum heart rate
 * @param duration - Session duration in minutes
 * @returns Effort score (0-100)
 */
export const calculateEffortScore = (
  avgHeartRate: number,
  maxHeartRate: number,
  duration: number
): number => {
  const intensityRatio = avgHeartRate / maxHeartRate;
  const durationFactor = Math.min(duration / 60, 1); // Cap at 60 minutes
  
  // Effort = intensity × duration
  const effortScore = intensityRatio * durationFactor * 100;
  
  return Math.round(Math.min(effortScore, 100));
};

/**
 * Calculate crew synchronization score (0-100)
 * @param heartRateData - Array of heart rate data points
 * @param rowers - Array of rowers
 * @returns Synchronization score (0-100)
 */
export const calculateCrewSynchronization = (
  heartRateData: HeartRateData[],
  rowers: Rower[]
): number => {
  if (rowers.length < 2) return 100; // Single rower is perfectly synchronized
  
  // Group data by rower
  const rowerData = new Map<string, HeartRateData[]>();
  rowers.forEach(rower => {
    if (rower.deviceId) {
      rowerData.set(rower.deviceId, heartRateData.filter(data => data.deviceId === rower.deviceId));
    }
  });
  
  // Calculate average heart rate for each rower at each time point
  const timePoints = new Map<number, number[]>();
  
  heartRateData.forEach(data => {
    const timestamp = data.timestamp.getTime();
    if (!timePoints.has(timestamp)) {
      timePoints.set(timestamp, []);
    }
    timePoints.get(timestamp)!.push(data.heartRate);
  });
  
  // Calculate synchronization (lower variance = higher sync)
  let totalVariance = 0;
  let validTimePoints = 0;
  
  timePoints.forEach(heartRates => {
    if (heartRates.length >= 2) {
      const avg = heartRates.reduce((sum, hr) => sum + hr, 0) / heartRates.length;
      const variance = heartRates.reduce((sum, hr) => sum + Math.pow(hr - avg, 2), 0) / heartRates.length;
      totalVariance += variance;
      validTimePoints++;
    }
  });
  
  if (validTimePoints === 0) return 0;
  
  const avgVariance = totalVariance / validTimePoints;
  const syncScore = Math.max(0, 100 - (avgVariance / 100)); // Normalize variance
  
  return Math.round(syncScore);
};

/**
 * Calculate individual rower variance from crew average
 * @param heartRateData - Array of heart rate data points
 * @param rowers - Array of rowers
 * @returns Individual variance data
 */
export const calculateIndividualVariance = (
  heartRateData: HeartRateData[],
  rowers: Rower[]
): IndividualVariance[] => {
  const rowerVariances: IndividualVariance[] = [];
  
  // Calculate crew average heart rate over time
  const timePoints = new Map<number, number>();
  heartRateData.forEach(data => {
    const timestamp = data.timestamp.getTime();
    if (!timePoints.has(timestamp)) {
      timePoints.set(timestamp, 0);
    }
    timePoints.set(timestamp, timePoints.get(timestamp)! + data.heartRate);
  });
  
  // Calculate crew average at each time point
  const crewAverages = new Map<number, number>();
  timePoints.forEach((totalHR, timestamp) => {
    const rowerCount = heartRateData.filter(data => data.timestamp.getTime() === timestamp).length;
    crewAverages.set(timestamp, totalHR / rowerCount);
  });
  
  // Calculate variance for each rower
  rowers.forEach(rower => {
    if (!rower.deviceId) return;
    
    const rowerData = heartRateData.filter(data => data.deviceId === rower.deviceId);
    if (rowerData.length === 0) return;
    
    let totalVariance = 0;
    let validPoints = 0;
    
    rowerData.forEach(data => {
      const timestamp = data.timestamp.getTime();
      const crewAvg = crewAverages.get(timestamp);
      if (crewAvg !== undefined) {
        totalVariance += Math.pow(data.heartRate - crewAvg, 2);
        validPoints++;
      }
    });
    
    const variance = validPoints > 0 ? totalVariance / validPoints : 0;
    const consistency = Math.max(0, 100 - (Math.sqrt(variance) / 10)); // Normalize variance
    
    rowerVariances.push({
      rowerId: rower.id,
      rowerName: rower.name,
      seat: rower.seat,
      variance: Math.round(Math.sqrt(variance) * 100) / 100,
      consistency: Math.round(consistency)
    });
  });
  
  return rowerVariances;
};

/**
 * Calculate comprehensive session metrics
 * @param session - Training session
 * @param zones - Heart rate zones (using first rower's zones as reference)
 * @returns Complete session metrics
 */
export const calculateSessionMetrics = (
  session: TrainingSession,
  zones: HeartRateZones
): SessionMetrics => {
  const heartRateData = session.finalHeartRateData || session.heartRateData;
  if (heartRateData.length === 0) {
    return createEmptyMetrics();
  }
  
  const duration = session.endTime 
    ? Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000 / 60)
    : 0;
  
  const heartRates = heartRateData.map(data => data.heartRate);
  const avgHeartRate = Math.round(heartRates.reduce((sum, hr) => sum + hr, 0) / heartRates.length);
  const maxHeartRate = Math.max(...heartRates);
  const minHeartRate = Math.min(...heartRates);
  
  // Use first rower's max HR as reference (or calculate from age)
  const referenceMaxHR = session.rowers[0]?.maxHeartRate || 180;
  const referenceRestingHR = session.rowers[0]?.restingHeartRate || 60;
  
  // Calculate advanced metrics
  const trimp = calculateTRIMP(heartRateData, referenceMaxHR, duration);
  const tss = calculateTSS(trimp);
  const intensityFactor = calculateIntensityFactor(avgHeartRate, referenceMaxHR);
  const normalizedPower = calculateNormalizedPower(heartRateData, referenceMaxHR);
  
  // Calculate zone analysis
  const { zoneDistribution, timeInZones } = calculateZoneAnalysis(heartRateData, zones, duration);
  
  // Calculate recovery metrics
  const heartRateVariability = calculateHeartRateVariability(heartRateData);
  const recoveryTime = calculateRecoveryTime(trimp, tss);
  const recoveryScore = calculateRecoveryScore(heartRateVariability, recoveryTime, referenceMaxHR, referenceRestingHR);
  
  // Calculate performance metrics
  const performanceScore = calculatePerformanceScore(avgHeartRate, referenceMaxHR, duration, 'aerobic');
  const consistencyScore = calculateConsistencyScore(heartRateData);
  const effortScore = calculateEffortScore(avgHeartRate, referenceMaxHR, duration);
  
  // Calculate crew metrics
  const crewSynchronization = calculateCrewSynchronization(heartRateData, session.rowers);
  const crewCohesion = crewSynchronization; // Simplified - could be more sophisticated
  const individualVariance = calculateIndividualVariance(heartRateData, session.rowers);
  
  return {
    duration,
    totalDataPoints: heartRateData.length,
    avgHeartRate,
    maxHeartRate,
    minHeartRate,
    trimp,
    tss,
    intensityFactor,
    normalizedPower,
    zoneDistribution,
    timeInZones,
    recoveryTime,
    heartRateVariability,
    recoveryScore,
    performanceScore,
    consistencyScore,
    effortScore,
    crewSynchronization,
    crewCohesion,
    individualVariance
  };
};

/**
 * Create empty metrics for sessions with no data
 */
const createEmptyMetrics = (): SessionMetrics => ({
  duration: 0,
  totalDataPoints: 0,
  avgHeartRate: 0,
  maxHeartRate: 0,
  minHeartRate: 0,
  trimp: 0,
  tss: 0,
  intensityFactor: 0,
  normalizedPower: 0,
  zoneDistribution: { recovery: 0, aerobic: 0, threshold: 0, anaerobic: 0 },
  timeInZones: { recovery: 0, aerobic: 0, threshold: 0, anaerobic: 0 },
  recoveryTime: 0,
  heartRateVariability: 0,
  recoveryScore: 0,
  performanceScore: 0,
  consistencyScore: 0,
  effortScore: 0,
  crewSynchronization: 0,
  crewCohesion: 0,
  individualVariance: []
});

/**
 * Generate comprehensive session report
 * @param session - Training session
 * @param zones - Heart rate zones
 * @returns Complete session report
 */
export const generateSessionReport = (
  session: TrainingSession,
  zones: HeartRateZones
): SessionReport => {
  const metrics = calculateSessionMetrics(session, zones);
  
  // Calculate individual rower analytics
  const rowerAnalytics: RowerAnalytics[] = session.rowers.map(rower => {
    const rowerData = (session.finalHeartRateData || session.heartRateData)
      .filter(data => data.deviceId === rower.deviceId);
    
    if (rowerData.length === 0) {
      return {
        rowerId: rower.id,
        rowerName: rower.name,
        seat: rower.seat,
        metrics: {
          avgHeartRate: 0,
          maxHeartRate: 0,
          minHeartRate: 0,
          trimp: 0,
          timeInZones: { recovery: 0, aerobic: 0, threshold: 0, anaerobic: 0 },
          zoneDistribution: { recovery: 0, aerobic: 0, threshold: 0, anaerobic: 0 },
          consistencyScore: 0,
          effortScore: 0
        }
      };
    }
    
    const rowerHeartRates = rowerData.map(data => data.heartRate);
    const avgHR = Math.round(rowerHeartRates.reduce((sum, hr) => sum + hr, 0) / rowerHeartRates.length);
    const maxHR = Math.max(...rowerHeartRates);
    const minHR = Math.min(...rowerHeartRates);
    
    const rowerTrimp = calculateTRIMP(rowerData, rower.maxHeartRate || 180, metrics.duration);
    const { zoneDistribution: rowerZoneDist, timeInZones: rowerTimeInZones } = 
      calculateZoneAnalysis(rowerData, zones, metrics.duration);
    
    return {
      rowerId: rower.id,
      rowerName: rower.name,
      seat: rower.seat,
      metrics: {
        avgHeartRate: avgHR,
        maxHeartRate: maxHR,
        minHeartRate: minHR,
        trimp: rowerTrimp,
        timeInZones: rowerTimeInZones,
        zoneDistribution: rowerZoneDist,
        consistencyScore: calculateConsistencyScore(rowerData),
        effortScore: calculateEffortScore(avgHR, maxHR, metrics.duration)
      }
    };
  });
  
  // Determine primary training zone
  const primaryZone = Object.entries(metrics.zoneDistribution)
    .reduce((max, [zone, percentage]) => 
      percentage > max.percentage ? { zone, percentage } : max, 
      { zone: 'aerobic', percentage: 0 }
    );
  
  // Generate insights
  const insights = {
    primaryTrainingZone: primaryZone.zone,
    trainingEffectiveness: metrics.performanceScore,
    improvementAreas: generateImprovementAreas(metrics),
    strengths: generateStrengths(metrics)
  };
  
  // Generate crew analysis
  const crewAnalysis = {
    synchronization: metrics.crewSynchronization,
    cohesion: metrics.crewCohesion,
    performance: metrics.performanceScore,
    recommendations: generateCrewRecommendations(metrics)
  };
  
  return {
    sessionId: session.id,
    sessionDate: session.startTime.toLocaleDateString(),
    sessionTime: session.startTime.toLocaleTimeString(),
    duration: metrics.duration,
    rowerCount: session.rowers.length,
    overallMetrics: metrics,
    rowerAnalytics,
    crewAnalysis,
    insights
  };
};

/**
 * Generate improvement areas based on metrics
 */
const generateImprovementAreas = (metrics: SessionMetrics): string[] => {
  const areas: string[] = [];
  
  if (metrics.consistencyScore < 70) {
    areas.push('Focus on maintaining steady heart rate during training');
  }
  
  if (metrics.crewSynchronization < 80) {
    areas.push('Work on crew synchronization and pacing');
  }
  
  if (metrics.zoneDistribution.aerobic < 60) {
    areas.push('Increase time in aerobic zone for base building');
  }
  
  if (metrics.recoveryScore < 60) {
    areas.push('Improve recovery between training sessions');
  }
  
  return areas;
};

/**
 * Generate strengths based on metrics
 */
const generateStrengths = (metrics: SessionMetrics): string[] => {
  const strengths: string[] = [];
  
  if (metrics.consistencyScore >= 80) {
    strengths.push('Excellent heart rate consistency');
  }
  
  if (metrics.crewSynchronization >= 85) {
    strengths.push('Strong crew synchronization');
  }
  
  if (metrics.performanceScore >= 80) {
    strengths.push('High training effectiveness');
  }
  
  if (metrics.effortScore >= 75) {
    strengths.push('Good training intensity');
  }
  
  return strengths;
};

/**
 * Generate crew recommendations based on metrics
 */
const generateCrewRecommendations = (metrics: SessionMetrics): string[] => {
  const recommendations: string[] = [];
  
  if (metrics.crewSynchronization < 70) {
    recommendations.push('Practice stroke rate synchronization drills');
  }
  
  if (metrics.individualVariance.some(v => v.variance > 15)) {
    recommendations.push('Address individual pacing differences');
  }
  
  if (metrics.zoneDistribution.threshold > 40) {
    recommendations.push('Consider more aerobic base training');
  }
  
  return recommendations;
};
