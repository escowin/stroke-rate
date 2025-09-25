import type { TrainingSession, SessionMetrics, Rower, HeartRateZones } from '../types';
import { calculateSessionMetrics } from './sessionAnalytics';

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

/**
 * Calculate progress trend for a specific metric over time
 */
export const calculateProgressTrend = (
  dataPoints: ProgressDataPoint[],
  metricPath: string,
  timeWindow: number = 30 // days
): ProgressTrend => {
  if (dataPoints.length < 2) {
    return {
      metric: metricPath,
      direction: 'stable',
      changeRate: 0,
      confidence: 0,
      trendData: []
    };
  }

  // Filter data points within time window
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - timeWindow);
  const recentData = dataPoints
    .filter(dp => dp.date >= cutoffDate)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (recentData.length < 2) {
    return {
      metric: metricPath,
      direction: 'stable',
      changeRate: 0,
      confidence: 0,
      trendData: []
    };
  }

  // Extract metric values
  const values = recentData.map(dp => {
    const pathParts = metricPath.split('.');
    let value = dp.metrics;
    for (const part of pathParts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part as keyof typeof value];
      } else {
        return 0;
      }
    }
    return typeof value === 'number' ? value : 0;
  });

  // Calculate linear regression
  const n = values.length;
  const x = recentData.map((_, index) => index);
  const y = values;

  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, index) => sum + val * y[index], 0);
  const sumXX = x.reduce((sum, val) => sum + val * val, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared for confidence
  const yMean = sumY / n;
  const ssRes = y.reduce((sum, val, index) => {
    const predicted = slope * x[index] + intercept;
    return sum + Math.pow(val - predicted, 2);
  }, 0);
  const ssTot = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
  const rSquared = ssTot > 0 ? 1 - (ssRes / ssTot) : 0;

  // Calculate change rate (percentage per week)
  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  const timeSpanWeeks = (recentData[recentData.length - 1].date.getTime() - recentData[0].date.getTime()) / (1000 * 60 * 60 * 24 * 7);
  const changeRate = timeSpanWeeks > 0 ? ((lastValue - firstValue) / firstValue) * 100 / timeSpanWeeks : 0;

  // Determine direction
  let direction: 'improving' | 'declining' | 'stable' = 'stable';
  if (Math.abs(changeRate) > 1) { // 1% threshold
    direction = changeRate > 0 ? 'improving' : 'declining';
  }

  // Create trend data for visualization
  const trendData = recentData.map((dp, index) => ({
    date: dp.date,
    value: slope * index + intercept
  }));

  return {
    metric: metricPath,
    direction,
    changeRate: Math.round(changeRate * 100) / 100,
    confidence: Math.round(rSquared * 100),
    trendData
  };
};

/**
 * Calculate individual rower progress trends
 */
export const calculateRowerProgressTrend = (
  dataPoints: ProgressDataPoint[],
  rowerId: string
): RowerProgressTrend => {
  if (!dataPoints || dataPoints.length === 0) {
    return {
      rowerId,
      rowerName: '',
      seat: 0,
      trends: [],
      overallProgress: 0,
      strengths: [],
      improvementAreas: []
    };
  }

  const rowerData = dataPoints
    .map(dp => dp.rowerMetrics.find(rm => rm.rowerId === rowerId))
    .filter(Boolean) as RowerProgressData[];

  if (rowerData.length < 2) {
    return {
      rowerId,
      rowerName: '',
      seat: 0,
      trends: [],
      overallProgress: 0,
      strengths: [],
      improvementAreas: []
    };
  }

  // Calculate trends for key metrics
  const metrics = [
    'metrics.avgHeartRate',
    'metrics.maxHeartRate',
    'metrics.trimp',
    'metrics.consistencyScore',
    'metrics.effortScore'
  ];

  const trends = metrics.map(metric => {
    const trendData = dataPoints
      .map(dp => {
        const rowerMetric = dp.rowerMetrics.find(rm => rm.rowerId === rowerId);
        if (!rowerMetric) return null;
        
        const pathParts = metric.split('.');
        let value = rowerMetric;
        for (const part of pathParts) {
          if (value && typeof value === 'object' && part in value) {
            value = value[part as keyof typeof value];
          } else {
            return null;
          }
        }
        return { date: dp.date, value: typeof value === 'number' ? value : 0 };
      })
      .filter(Boolean) as Array<{ date: Date; value: number }>;

    // Create a filtered data points array with only the current rower's data
    const filteredDataPoints = dataPoints
      .map(dp => {
        const rowerMetric = dp.rowerMetrics.find(rm => rm.rowerId === rowerId);
        if (!rowerMetric) return null;
        
        return {
          ...dp,
          rowerMetrics: [rowerMetric]
        };
      })
      .filter(Boolean) as ProgressDataPoint[];

    return calculateProgressTrend(filteredDataPoints, metric);
  });

  // Calculate overall progress (weighted average of improvements)
  const positiveTrends = trends.filter(t => t.direction === 'improving');
  const overallProgress = positiveTrends.length > 0 
    ? Math.round(positiveTrends.reduce((sum, t) => sum + t.confidence, 0) / positiveTrends.length)
    : 0;

  // Generate insights
  const strengths: string[] = [];
  const improvementAreas: string[] = [];

  trends.forEach(trend => {
    if (trend.direction === 'improving' && trend.confidence > 70) {
      strengths.push(`${trend.metric} is improving consistently`);
    } else if (trend.direction === 'declining' && trend.confidence > 50) {
      improvementAreas.push(`${trend.metric} needs attention`);
    }
  });

  return {
    rowerId,
    rowerName: rowerData[0]?.rowerName || '',
    seat: rowerData[0]?.seat || 0,
    trends,
    overallProgress,
    strengths,
    improvementAreas
  };
};

/**
 * Calculate crew progress trends
 */
export const calculateCrewProgressTrend = (
  dataPoints: ProgressDataPoint[]
): CrewProgressTrend => {
  if (!dataPoints || dataPoints.length < 2) {
    return {
      overallProgress: 0,
      synchronizationTrend: {
        metric: 'crewSynchronization',
        direction: 'stable',
        changeRate: 0,
        confidence: 0,
        trendData: []
      },
      cohesionTrend: {
        metric: 'crewCohesion',
        direction: 'stable',
        changeRate: 0,
        confidence: 0,
        trendData: []
      },
      performanceTrend: {
        metric: 'performanceScore',
        direction: 'stable',
        changeRate: 0,
        confidence: 0,
        trendData: []
      },
      individualTrends: [],
      crewStrengths: [],
      crewImprovementAreas: []
    };
  }

  // Calculate crew-level trends
  const synchronizationTrend = calculateProgressTrend(dataPoints, 'crewSynchronization');
  const cohesionTrend = calculateProgressTrend(dataPoints, 'crewCohesion');
  const performanceTrend = calculateProgressTrend(dataPoints, 'performanceScore');

  // Calculate individual trends
  const uniqueRowers = new Set(dataPoints.flatMap(dp => dp.rowerMetrics.map(rm => rm.rowerId)));
  const individualTrends = Array.from(uniqueRowers).map(rowerId => 
    calculateRowerProgressTrend(dataPoints, rowerId)
  );

  // Calculate overall crew progress
  const crewTrends = [synchronizationTrend, cohesionTrend, performanceTrend];
  const positiveTrends = crewTrends.filter(t => t.direction === 'improving');
  const overallProgress = positiveTrends.length > 0
    ? Math.round(positiveTrends.reduce((sum, t) => sum + t.confidence, 0) / positiveTrends.length)
    : 0;

  // Generate crew insights
  const crewStrengths: string[] = [];
  const crewImprovementAreas: string[] = [];

  crewTrends.forEach(trend => {
    if (trend.direction === 'improving' && trend.confidence > 70) {
      crewStrengths.push(`${trend.metric} is improving consistently`);
    } else if (trend.direction === 'declining' && trend.confidence > 50) {
      crewImprovementAreas.push(`${trend.metric} needs attention`);
    }
  });

  return {
    overallProgress,
    synchronizationTrend,
    cohesionTrend,
    performanceTrend,
    individualTrends,
    crewStrengths,
    crewImprovementAreas
  };
};

/**
 * Generate progress data points from sessions
 */
export const generateProgressDataPoints = (
  sessions: TrainingSession[],
  zones: HeartRateZones
): ProgressDataPoint[] => {
  return sessions
    .filter(session => 
      session && 
      session.finalHeartRateData && 
      session.finalHeartRateData.length > 0 &&
      session.rowers &&
      session.rowers.length > 0
    )
    .map(session => {
      const metrics = calculateSessionMetrics(session, zones);
      
      const rowerMetrics: RowerProgressData[] = session.rowers.map(rower => {
        const rowerData = session.finalHeartRateData!.filter(data => data.deviceId === rower.deviceId);
        if (rowerData.length === 0) {
          return {
            rowerId: rower.id,
            rowerName: rower.name,
            seat: rower.seat,
            metrics: {
              avgHeartRate: 0,
              maxHeartRate: 0,
              trimp: 0,
              consistencyScore: 0,
              effortScore: 0,
              timeInZones: { recovery: 0, aerobic: 0, threshold: 0, anaerobic: 0 }
            }
          };
        }

        const heartRates = rowerData.map(data => data.heartRate);
        const avgHR = Math.round(heartRates.reduce((sum, hr) => sum + hr, 0) / heartRates.length);
        const maxHR = Math.max(...heartRates);
        
        // Calculate TRIMP for this rower
        const rowerTrimp = calculateTRIMP(rowerData, rower.maxHeartRate || 180, metrics.duration);
        
        // Calculate zone time for this rower
        const { timeInZones } = calculateZoneAnalysis(rowerData, zones, metrics.duration);
        
        return {
          rowerId: rower.id,
          rowerName: rower.name,
          seat: rower.seat,
          metrics: {
            avgHeartRate: avgHR,
            maxHeartRate: maxHR,
            trimp: rowerTrimp,
            consistencyScore: calculateConsistencyScore(rowerData),
            effortScore: calculateEffortScore(avgHR, maxHR, metrics.duration),
            timeInZones: timeInZones
          }
        };
      });

      return {
        date: session.startTime,
        sessionId: session.id,
        metrics,
        rowerMetrics
      };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());
};

/**
 * Create a goal
 */
export const createGoal = (
  name: string,
  description: string,
  type: Goal['type'],
  targetValue: number,
  unit: string,
  targetDate: Date,
  milestones: Array<{ name: string; targetValue: number }> = []
): Goal => {
  const id = `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id,
    name,
    description,
    type,
    targetValue,
    currentValue: 0,
    unit,
    startDate: new Date(),
    targetDate,
    isAchieved: false,
    progress: 0,
    milestones: milestones.map((milestone, index) => ({
      id: `milestone_${id}_${index}`,
      name: milestone.name,
      targetValue: milestone.targetValue,
      isAchieved: false,
      progress: 0
    }))
  };
};

/**
 * Update goal progress based on current data
 */
export const updateGoalProgress = (
  goal: Goal,
  currentValue: number,
  achievedDate?: Date
): Goal => {
  const progress = Math.min(100, Math.round((currentValue / goal.targetValue) * 100));
  const isAchieved = progress >= 100;
  
  // Update milestones
  const updatedMilestones = goal.milestones.map(milestone => {
    const milestoneProgress = Math.min(100, Math.round((currentValue / milestone.targetValue) * 100));
    const milestoneAchieved = milestoneProgress >= 100;
    
    return {
      ...milestone,
      achievedValue: milestoneAchieved ? currentValue : undefined,
      achievedDate: milestoneAchieved ? (achievedDate || new Date()) : undefined,
      isAchieved: milestoneAchieved,
      progress: milestoneProgress
    };
  });

  return {
    ...goal,
    currentValue,
    isAchieved,
    progress,
    milestones: updatedMilestones
  };
};

/**
 * Create a training phase
 */
export const createTrainingPhase = (
  name: string,
  description: string,
  focus: TrainingPhase['focus'],
  startDate: Date,
  endDate: Date,
  targetMetrics: TrainingPhase['targetMetrics']
): TrainingPhase => {
  const id = `phase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id,
    name,
    description,
    startDate,
    endDate,
    focus,
    targetMetrics,
    progress: 0
  };
};

/**
 * Update training phase progress
 */
export const updateTrainingPhaseProgress = (
  phase: TrainingPhase,
  actualMetrics: TrainingPhase['actualMetrics']
): TrainingPhase => {
  if (!actualMetrics) return phase;

  // Calculate progress based on how close actual metrics are to targets
  const intensityProgress = Math.min(100, Math.round((actualMetrics.avgIntensity / phase.targetMetrics.avgIntensity) * 100));
  const durationProgress = Math.min(100, Math.round((actualMetrics.avgDuration / phase.targetMetrics.sessionDuration) * 100));
  const volumeProgress = Math.min(100, Math.round((actualMetrics.totalVolume / phase.targetMetrics.weeklyVolume) * 100));
  
  const overallProgress = Math.round((intensityProgress + durationProgress + volumeProgress) / 3);

  return {
    ...phase,
    actualMetrics,
    progress: overallProgress
  };
};

/**
 * Generate comprehensive progress report
 */
export const generateProgressReport = (
  sessions: TrainingSession[],
  zones: HeartRateZones,
  goals: Goal[] = [],
  trainingPhases: TrainingPhase[] = [],
  periodDays: number = 30
): ProgressReport => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - periodDays);

  const progressDataPoints = generateProgressDataPoints(sessions, zones);
  const periodDataPoints = progressDataPoints.filter(dp => 
    dp.date >= startDate && dp.date <= endDate
  );

  const crewProgress = calculateCrewProgressTrend(periodDataPoints);
  const individualProgress = crewProgress.individualTrends;

  // Generate insights
  const keyImprovements: string[] = [];
  const areasOfConcern: string[] = [];
  const recommendations: string[] = [];

  // Analyze trends for insights
  if (crewProgress.synchronizationTrend.direction === 'improving') {
    keyImprovements.push('Crew synchronization is improving');
  } else if (crewProgress.synchronizationTrend.direction === 'declining') {
    areasOfConcern.push('Crew synchronization is declining');
    recommendations.push('Focus on stroke rate synchronization drills');
  }

  if (crewProgress.performanceTrend.direction === 'improving') {
    keyImprovements.push('Overall performance is trending upward');
  } else if (crewProgress.performanceTrend.direction === 'declining') {
    areasOfConcern.push('Performance metrics are declining');
    recommendations.push('Review training intensity and recovery');
  }

  // Analyze individual progress
  const improvingRowers = individualProgress.filter(ip => ip.overallProgress > 70);
  const strugglingRowers = individualProgress.filter(ip => ip.overallProgress < 30);

  if (improvingRowers.length > 0) {
    keyImprovements.push(`${improvingRowers.length} rower(s) showing strong progress`);
  }

  if (strugglingRowers.length > 0) {
    areasOfConcern.push(`${strugglingRowers.length} rower(s) may need additional support`);
    recommendations.push('Provide individual coaching for struggling rowers');
  }

  // Determine next phase focus
  let nextPhaseFocus = 'Continue current training approach';
  if (areasOfConcern.length > keyImprovements.length) {
    nextPhaseFocus = 'Focus on addressing areas of concern';
  } else if (keyImprovements.length > 0) {
    nextPhaseFocus = 'Build on current improvements';
  }

  return {
    period: {
      startDate,
      endDate,
      duration: periodDays
    },
    totalSessions: periodDataPoints.length,
    crewProgress,
    individualProgress,
    goals,
    trainingPhases,
    insights: {
      keyImprovements,
      areasOfConcern,
      recommendations,
      nextPhaseFocus
    }
  };
};

// Import the required functions from sessionAnalytics
import { 
  calculateTRIMP, 
  calculateZoneAnalysis, 
  calculateConsistencyScore, 
  calculateEffortScore 
} from './sessionAnalytics';
