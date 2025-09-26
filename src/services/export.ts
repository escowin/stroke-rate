import type { TrainingSession, HeartRateData, Rower, SessionMetrics, ProgressReport } from '../types';
import { calculateSessionMetrics } from '../utils/sessionAnalytics';
import { generateProgressReport } from '../utils/progressTracking';

// Export Types
export interface ExportOptions {
  format: 'csv' | 'json';
  includeHeartRateData: boolean;
  includeAnalytics: boolean;
  includeProgressData: boolean;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  rowerIds?: string[];
  sessionIds?: string[];
}

export interface ExportData {
  sessions: TrainingSession[];
  heartRateData: HeartRateData[];
  analytics: SessionMetrics[];
  progressData?: ProgressReport;
  metadata: {
    exportDate: Date;
    totalSessions: number;
    totalDataPoints: number;
    dateRange: {
      start: Date;
      end: Date;
    };
    rowers: Rower[];
  };
}

export interface CSVExportData {
  sessions: string;
  heartRateData: string;
  analytics: string;
  progressData?: string;
}

/**
 * Export service for handling data exports
 */
export class ExportService {
  /**
   * Export sessions data in CSV format
   */
  static exportSessionsCSV(sessions: TrainingSession[]): string {
    if (sessions.length === 0) return '';

    const headers = [
      'Session ID',
      'Start Time',
      'End Time',
      'Duration (minutes)',
      'Rower Count',
      'Data Points',
      'Is Active'
    ];

    const rows = sessions.map(session => [
      session.id,
      session.startTime.toISOString(),
      session.endTime?.toISOString() || '',
      session.endTime 
        ? Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000 / 60)
        : 0,
      session.rowers.length,
      session.finalHeartRateData?.length || session.heartRateData.length,
      session.isActive ? 'Yes' : 'No'
    ]);

    return this.arrayToCSV([headers, ...rows.map(row => row.map(cell => String(cell)))]);
  }

  /**
   * Export heart rate data in CSV format
   */
  static exportHeartRateDataCSV(heartRateData: HeartRateData[]): string {
    if (heartRateData.length === 0) return '';

    const headers = [
      'Device ID',
      'Heart Rate (BPM)',
      'Timestamp',
      'Zone',
      'Battery Level',
      'Session ID'
    ];

    const rows = heartRateData.map(data => [
      data.deviceId,
      data.heartRate,
      data.timestamp.toISOString(),
      data.zone,
      data.batteryLevel || '',
      data.sessionId || ''
    ]);

    return this.arrayToCSV([headers, ...rows.map(row => row.map(cell => String(cell)))]);
  }

  /**
   * Export analytics data in CSV format
   */
  static exportAnalyticsCSV(sessions: TrainingSession[], zones: any): string {
    if (sessions.length === 0) return '';

    const headers = [
      'Session ID',
      'Date',
      'Duration (min)',
      'Avg Heart Rate',
      'Max Heart Rate',
      'Min Heart Rate',
      'TRIMP',
      'TSS',
      'Intensity Factor',
      'Normalized Power',
      'Recovery Time (hrs)',
      'HRV',
      'Recovery Score',
      'Performance Score',
      'Consistency Score',
      'Effort Score',
      'Crew Sync',
      'Crew Cohesion',
      'Recovery Zone %',
      'Aerobic Zone %',
      'Threshold Zone %',
      'Anaerobic Zone %'
    ];

    const rows = sessions
      .filter(session => session.finalHeartRateData && session.finalHeartRateData.length > 0)
      .map(session => {
        const metrics = calculateSessionMetrics(session, zones);
        return [
          session.id,
          session.startTime.toISOString().split('T')[0],
          metrics.duration,
          metrics.avgHeartRate,
          metrics.maxHeartRate,
          metrics.minHeartRate,
          metrics.trimp,
          metrics.tss,
          metrics.intensityFactor,
          metrics.normalizedPower,
          metrics.recoveryTime,
          metrics.heartRateVariability,
          metrics.recoveryScore,
          metrics.performanceScore,
          metrics.consistencyScore,
          metrics.effortScore,
          metrics.crewSynchronization,
          metrics.crewCohesion,
          metrics.zoneDistribution.recovery,
          metrics.zoneDistribution.aerobic,
          metrics.zoneDistribution.threshold,
          metrics.zoneDistribution.anaerobic
        ];
      });

    return this.arrayToCSV([headers, ...rows.map(row => row.map(cell => String(cell)))]);
  }

  /**
   * Export progress data in CSV format
   */
  static exportProgressDataCSV(progressReport: ProgressReport): string {
    const headers = [
      'Period Start',
      'Period End',
      'Duration (days)',
      'Total Sessions',
      'Crew Progress %',
      'Sync Trend',
      'Sync Change Rate %/week',
      'Sync Confidence %',
      'Cohesion Trend',
      'Cohesion Change Rate %/week',
      'Cohesion Confidence %',
      'Performance Trend',
      'Performance Change Rate %/week',
      'Performance Confidence %',
      'Key Improvements',
      'Areas of Concern',
      'Recommendations',
      'Next Phase Focus'
    ];

    const row = [
      progressReport.period.startDate.toISOString().split('T')[0],
      progressReport.period.endDate.toISOString().split('T')[0],
      progressReport.period.duration,
      progressReport.totalSessions,
      progressReport.crewProgress.overallProgress,
      progressReport.crewProgress.synchronizationTrend.direction,
      progressReport.crewProgress.synchronizationTrend.changeRate,
      progressReport.crewProgress.synchronizationTrend.confidence,
      progressReport.crewProgress.cohesionTrend.direction,
      progressReport.crewProgress.cohesionTrend.changeRate,
      progressReport.crewProgress.cohesionTrend.confidence,
      progressReport.crewProgress.performanceTrend.direction,
      progressReport.crewProgress.performanceTrend.changeRate,
      progressReport.crewProgress.performanceTrend.confidence,
      progressReport.insights.keyImprovements.join('; '),
      progressReport.insights.areasOfConcern.join('; '),
      progressReport.insights.recommendations.join('; '),
      progressReport.insights.nextPhaseFocus
    ];

    return this.arrayToCSV([headers, row.map(cell => String(cell))]);
  }

  /**
   * Export individual rower progress in CSV format
   */
  static exportRowerProgressCSV(progressReport: ProgressReport): string {
    if (progressReport.individualProgress.length === 0) return '';

    const headers = [
      'Rower ID',
      'Rower Name',
      'Seat',
      'Overall Progress %',
      'Avg HR Trend',
      'Avg HR Change Rate %/week',
      'Avg HR Confidence %',
      'Max HR Trend',
      'Max HR Change Rate %/week',
      'Max HR Confidence %',
      'TRIMP Trend',
      'TRIMP Change Rate %/week',
      'TRIMP Confidence %',
      'Consistency Trend',
      'Consistency Change Rate %/week',
      'Consistency Confidence %',
      'Effort Trend',
      'Effort Change Rate %/week',
      'Effort Confidence %',
      'Strengths',
      'Improvement Areas'
    ];

    const rows = progressReport.individualProgress.map(rower => {
      const avgHRTrend = rower.trends.find(t => t.metric === 'metrics.avgHeartRate');
      const maxHRTrend = rower.trends.find(t => t.metric === 'metrics.maxHeartRate');
      const trimpTrend = rower.trends.find(t => t.metric === 'metrics.trimp');
      const consistencyTrend = rower.trends.find(t => t.metric === 'metrics.consistencyScore');
      const effortTrend = rower.trends.find(t => t.metric === 'metrics.effortScore');

      return [
        rower.rowerId,
        rower.rowerName,
        rower.seat,
        rower.overallProgress,
        avgHRTrend?.direction || 'stable',
        avgHRTrend?.changeRate || 0,
        avgHRTrend?.confidence || 0,
        maxHRTrend?.direction || 'stable',
        maxHRTrend?.changeRate || 0,
        maxHRTrend?.confidence || 0,
        trimpTrend?.direction || 'stable',
        trimpTrend?.changeRate || 0,
        trimpTrend?.confidence || 0,
        consistencyTrend?.direction || 'stable',
        consistencyTrend?.changeRate || 0,
        consistencyTrend?.confidence || 0,
        effortTrend?.direction || 'stable',
        effortTrend?.changeRate || 0,
        effortTrend?.confidence || 0,
        rower.strengths.join('; '),
        rower.improvementAreas.join('; ')
      ];
    });

    return this.arrayToCSV([headers, ...rows.map(row => row.map(cell => String(cell)))]);
  }

  /**
   * Export data in JSON format
   */
  static exportDataJSON(exportData: ExportData): string {
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Create comprehensive export data
   */
  static createExportData(
    sessions: TrainingSession[],
    heartRateData: HeartRateData[],
    zones: any,
    options: ExportOptions
  ): ExportData {
    // Filter sessions based on options
    let filteredSessions = sessions;
    if (options.dateRange) {
      filteredSessions = sessions.filter(session => 
        session.startTime >= options.dateRange!.startDate &&
        session.startTime <= options.dateRange!.endDate
      );
    }
    if (options.sessionIds) {
      filteredSessions = filteredSessions.filter(session => 
        options.sessionIds!.includes(session.id)
      );
    }

    // Filter heart rate data
    let filteredHeartRateData = heartRateData;
    if (options.dateRange) {
      filteredHeartRateData = heartRateData.filter(data => 
        data.timestamp >= options.dateRange!.startDate &&
        data.timestamp <= options.dateRange!.endDate
      );
    }
    if (options.sessionIds) {
      filteredHeartRateData = filteredHeartRateData.filter(data => 
        data.sessionId && options.sessionIds!.includes(data.sessionId)
      );
    }

    // Calculate analytics for filtered sessions
    const analytics = filteredSessions
      .filter(session => session.finalHeartRateData && session.finalHeartRateData.length > 0)
      .map(session => calculateSessionMetrics(session, zones));

    // Get all unique rowers
    const allRowers = new Map<string, Rower>();
    filteredSessions.forEach(session => {
      session.rowers.forEach(rower => {
        allRowers.set(rower.id, rower);
      });
    });

    // Generate progress data if requested
    let progressData: ProgressReport | undefined;
    if (options.includeProgressData) {
      progressData = generateProgressReport(filteredSessions, zones, [], [], 30);
    }

    return {
      sessions: filteredSessions,
      heartRateData: filteredHeartRateData,
      analytics,
      progressData,
      metadata: {
        exportDate: new Date(),
        totalSessions: filteredSessions.length,
        totalDataPoints: filteredHeartRateData.length,
        dateRange: {
          start: options.dateRange?.startDate || new Date(Math.min(...sessions.map(s => s.startTime.getTime()))),
          end: options.dateRange?.endDate || new Date(Math.max(...sessions.map(s => s.startTime.getTime())))
        },
        rowers: Array.from(allRowers.values())
      }
    };
  }

  /**
   * Generate CSV content from array of arrays
   */
  private static arrayToCSV(data: string[][]): string {
    return data.map(row => 
      row.map(cell => {
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        const escaped = cell.toString().replace(/"/g, '""');
        if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
          return `"${escaped}"`;
        }
        return escaped;
      }).join(',')
    ).join('\n');
  }

  /**
   * Download data as file
   */
  static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Export all data based on options
   */
  static async exportData(
    sessions: TrainingSession[],
    heartRateData: HeartRateData[],
    zones: any,
    options: ExportOptions
  ): Promise<void> {
    const exportData = this.createExportData(sessions, heartRateData, zones, options);
    
    if (options.format === 'json') {
      const jsonContent = this.exportDataJSON(exportData);
      const filename = `stroke-rate-export-${new Date().toISOString().split('T')[0]}.json`;
      this.downloadFile(jsonContent, filename, 'application/json');
    } else {
      // Export multiple CSV files
      const timestamp = new Date().toISOString().split('T')[0];
      
      // Sessions CSV
      const sessionsCSV = this.exportSessionsCSV(exportData.sessions);
      this.downloadFile(sessionsCSV, `sessions-${timestamp}.csv`, 'text/csv');
      
      // Heart Rate Data CSV
      if (options.includeHeartRateData) {
        const heartRateCSV = this.exportHeartRateDataCSV(exportData.heartRateData);
        this.downloadFile(heartRateCSV, `heart-rate-data-${timestamp}.csv`, 'text/csv');
      }
      
      // Analytics CSV
      if (options.includeAnalytics) {
        const analyticsCSV = this.exportAnalyticsCSV(exportData.sessions, zones);
        this.downloadFile(analyticsCSV, `analytics-${timestamp}.csv`, 'text/csv');
      }
      
      // Progress Data CSV
      if (options.includeProgressData && exportData.progressData) {
        const progressCSV = this.exportProgressDataCSV(exportData.progressData);
        this.downloadFile(progressCSV, `progress-data-${timestamp}.csv`, 'text/csv');
        
        const rowerProgressCSV = this.exportRowerProgressCSV(exportData.progressData);
        this.downloadFile(rowerProgressCSV, `rower-progress-${timestamp}.csv`, 'text/csv');
      }
    }
  }

  /**
   * Get export statistics
   */
  static getExportStats(sessions: TrainingSession[], heartRateData: HeartRateData[]): {
    totalSessions: number;
    totalDataPoints: number;
    dateRange: { start: Date; end: Date };
    dataSize: string;
  } {
    const totalSessions = sessions.length;
    const totalDataPoints = heartRateData.length;
    
    const dates = sessions.map(s => s.startTime.getTime());
    const dateRange = {
      start: new Date(Math.min(...dates)),
      end: new Date(Math.max(...dates))
    };
    
    // Estimate data size (rough calculation)
    const avgSessionSize = 1000; // bytes per session
    const avgDataPointSize = 50; // bytes per data point
    const estimatedSize = (totalSessions * avgSessionSize) + (totalDataPoints * avgDataPointSize);
    const dataSize = this.formatBytes(estimatedSize);
    
    return {
      totalSessions,
      totalDataPoints,
      dateRange,
      dataSize
    };
  }

  /**
   * Format bytes to human readable string
   */
  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
