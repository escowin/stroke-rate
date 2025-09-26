import React, { useState, useMemo } from 'react';
import {
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useHistoricalData } from '../hooks/useHistoricalData';
import { useDefaultHeartRateZones } from '../hooks/useHeartRateZones';
import { ExportService, type ExportOptions } from '../services/export';
import type { HeartRateData } from '../types';

interface DataExportProps {
  className?: string;
}

export const DataExport: React.FC<DataExportProps> = ({ className = '' }) => {
  const { sessions, getSessionHeartRateData } = useHistoricalData();
  const { zones } = useDefaultHeartRateZones();
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    includeHeartRateData: true,
    includeAnalytics: true,
    includeProgressData: true,
    dateRange: undefined,
    rowerIds: undefined,
    sessionIds: undefined
  });
  
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: '',
    endDate: ''
  });
  
  const [selectedRowers, setSelectedRowers] = useState<string[]>([]);
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Get all heart rate data
  const [allHeartRateData, setAllHeartRateData] = useState<HeartRateData[]>([]);
  
  React.useEffect(() => {
    const loadHeartRateData = async () => {
      try {
        // Get heart rate data for all sessions
        const allHeartRateData: HeartRateData[] = [];
        for (const session of sessions) {
          const sessionData = await getSessionHeartRateData(session.id);
          allHeartRateData.push(...sessionData);
        }
        setAllHeartRateData(allHeartRateData);
      } catch (error) {
        console.error('Failed to load heart rate data:', error);
      }
    };
    loadHeartRateData();
  }, [sessions, getSessionHeartRateData]);

  // Calculate export statistics
  const exportStats = useMemo(() => {
    return ExportService.getExportStats(sessions, allHeartRateData);
  }, [sessions, allHeartRateData]);

  // Get unique rowers from sessions
  const allRowers = useMemo(() => {
    const rowerMap = new Map<string, { id: string; name: string; seat: number }>();
    sessions.forEach(session => {
      session.rowers.forEach(rower => {
        rowerMap.set(rower.id, {
          id: rower.id,
          name: rower.name,
          seat: rower.seat
        });
      });
    });
    return Array.from(rowerMap.values()).sort((a, b) => a.seat - b.seat);
  }, [sessions]);

  // Get sessions for selection
  const selectableSessions = useMemo(() => {
    return sessions
      .filter(session => session.finalHeartRateData && session.finalHeartRateData.length > 0)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, 20); // Limit to last 20 sessions for performance
  }, [sessions]);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Prepare export options
      const options: ExportOptions = {
        ...exportOptions,
        dateRange: dateRange.startDate && dateRange.endDate ? {
          startDate: new Date(dateRange.startDate),
          endDate: new Date(dateRange.endDate)
        } : undefined,
        rowerIds: selectedRowers.length > 0 ? selectedRowers : undefined,
        sessionIds: selectedSessions.length > 0 ? selectedSessions : undefined
      };

      await ExportService.exportData(sessions, allHeartRateData, zones, options);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRowerToggle = (rowerId: string) => {
    setSelectedRowers(prev => 
      prev.includes(rowerId) 
        ? prev.filter(id => id !== rowerId)
        : [...prev, rowerId]
    );
  };

  const handleSessionToggle = (sessionId: string) => {
    setSelectedSessions(prev => 
      prev.includes(sessionId) 
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const resetFilters = () => {
    setDateRange({ startDate: '', endDate: '' });
    setSelectedRowers([]);
    setSelectedSessions([]);
  };

  return (
    <div className={`data-export ${className}`}>
      {/* Header */}
      <section className="card-base export-header">
        <div className="export-header-content">
          <h2 className="export-header-title">
            <ArrowDownTrayIcon className="export-header-icon" />
            Data Export
          </h2>
          <p className="export-header-description">
            Export your training data for external analysis, backup, or sharing
          </p>
        </div>
      </section>

      {/* Export Statistics */}
      <section className="card-base export-stats">
        <h3 className="card-title">
          <InformationCircleIcon className="card-title-icon" />
          Export Statistics
        </h3>
        
        <div className="export-stats-grid">
          <div className="export-stat">
            <span className="export-stat-label">Total Sessions</span>
            <span className="export-stat-value">{exportStats.totalSessions}</span>
          </div>
          <div className="export-stat">
            <span className="export-stat-label">Data Points</span>
            <span className="export-stat-value">{exportStats.totalDataPoints.toLocaleString()}</span>
          </div>
          <div className="export-stat">
            <span className="export-stat-label">Date Range</span>
            <span className="export-stat-value">
              {exportStats.dateRange.start.toLocaleDateString()} - {exportStats.dateRange.end.toLocaleDateString()}
            </span>
          </div>
          <div className="export-stat">
            <span className="export-stat-label">Estimated Size</span>
            <span className="export-stat-value">{exportStats.dataSize}</span>
          </div>
        </div>
      </section>

      {/* Export Options */}
      <section className="card-base export-options">
        <h3 className="card-title">
          <Cog6ToothIcon className="card-title-icon" />
          Export Options
        </h3>
        
        <div className="export-options-content">
          {/* Format Selection */}
          <div className="export-option-group">
            <h4 className="export-option-group-title">Export Format</h4>
            <div className="export-format-options">
              <label className="export-format-option">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={exportOptions.format === 'csv'}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as 'csv' | 'json' }))}
                  className="export-format-radio"
                />
                <div className="export-format-content">
                  <DocumentArrowDownIcon className="export-format-icon" />
                  <div className="export-format-info">
                    <span className="export-format-name">CSV Files</span>
                    <span className="export-format-description">Multiple CSV files for Excel/Google Sheets</span>
                  </div>
                </div>
              </label>
              
              <label className="export-format-option">
                <input
                  type="radio"
                  name="format"
                  value="json"
                  checked={exportOptions.format === 'json'}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as 'csv' | 'json' }))}
                  className="export-format-radio"
                />
                <div className="export-format-content">
                  <ChartBarIcon className="export-format-icon" />
                  <div className="export-format-info">
                    <span className="export-format-name">JSON File</span>
                    <span className="export-format-description">Single JSON file for developers</span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Data Selection */}
          <div className="export-option-group">
            <h4 className="export-option-group-title">Include Data</h4>
            <div className="export-data-options">
              <label className="export-data-option">
                <input
                  type="checkbox"
                  checked={exportOptions.includeHeartRateData}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeHeartRateData: e.target.checked }))}
                  className="export-data-checkbox"
                />
                <span className="export-data-label">Heart Rate Data</span>
                <span className="export-data-description">Raw heart rate measurements</span>
              </label>
              
              <label className="export-data-option">
                <input
                  type="checkbox"
                  checked={exportOptions.includeAnalytics}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeAnalytics: e.target.checked }))}
                  className="export-data-checkbox"
                />
                <span className="export-data-label">Session Analytics</span>
                <span className="export-data-description">TRIMP, TSS, recovery metrics</span>
              </label>
              
              <label className="export-data-option">
                <input
                  type="checkbox"
                  checked={exportOptions.includeProgressData}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeProgressData: e.target.checked }))}
                  className="export-data-checkbox"
                />
                <span className="export-data-label">Progress Tracking</span>
                <span className="export-data-description">Trends and progress analysis</span>
              </label>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="export-option-group">
            <div className="export-advanced-header">
              <h4 className="export-option-group-title">Advanced Filters</h4>
              <button
                className="export-advanced-toggle"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? 'Hide' : 'Show'} Advanced
              </button>
            </div>
            
            {showAdvanced && (
              <div className="export-advanced-content">
                {/* Date Range */}
                <div className="export-filter-group">
                  <h5 className="export-filter-title">
                    <CalendarDaysIcon className="export-filter-icon" />
                    Date Range
                  </h5>
                  <div className="export-date-range">
                    <div className="export-date-input">
                      <label className="export-date-label">Start Date</label>
                      <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                        className="export-date-field"
                      />
                    </div>
                    <div className="export-date-input">
                      <label className="export-date-label">End Date</label>
                      <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                        className="export-date-field"
                      />
                    </div>
                  </div>
                </div>

                {/* Rower Selection */}
                <div className="export-filter-group">
                  <h5 className="export-filter-title">
                    <UserGroupIcon className="export-filter-icon" />
                    Rowers
                  </h5>
                  <div className="export-rower-selection">
                    {allRowers.map(rower => (
                      <label key={rower.id} className="export-rower-option">
                        <input
                          type="checkbox"
                          checked={selectedRowers.includes(rower.id)}
                          onChange={() => handleRowerToggle(rower.id)}
                          className="export-rower-checkbox"
                        />
                        <span className="export-rower-label">
                          {rower.name} (Seat {rower.seat})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Session Selection */}
                <div className="export-filter-group">
                  <h5 className="export-filter-title">
                    <ChartBarIcon className="export-filter-icon" />
                    Sessions
                  </h5>
                  <div className="export-session-selection">
                    {selectableSessions.map(session => (
                      <label key={session.id} className="export-session-option">
                        <input
                          type="checkbox"
                          checked={selectedSessions.includes(session.id)}
                          onChange={() => handleSessionToggle(session.id)}
                          className="export-session-checkbox"
                        />
                        <span className="export-session-label">
                          {session.startTime.toLocaleDateString()} {session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          <span className="export-session-details">
                            ({session.rowers.length} rowers, {session.finalHeartRateData?.length || 0} data points)
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="export-filter-actions">
                  <button
                    className="export-reset-button"
                    onClick={resetFilters}
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Export Actions */}
      <section className="card-base export-actions">
        <div className="export-actions-content">
          <div className="export-actions-info">
            <h4 className="export-actions-title">Ready to Export</h4>
            <p className="export-actions-description">
              {exportOptions.format === 'csv' 
                ? 'Multiple CSV files will be downloaded'
                : 'A single JSON file will be downloaded'
              }
            </p>
          </div>
          
          <div className="export-actions-buttons">
            <button
              className="export-button"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <div className="export-button-spinner" />
                  Exporting...
                </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="export-button-icon" />
                  Export Data
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Export Information */}
      <section className="card-base export-info">
        <h3 className="card-title">
          <InformationCircleIcon className="card-title-icon" />
          Export Information
        </h3>
        
        <div className="export-info-content">
          <div className="export-info-section">
            <h4 className="export-info-title">CSV Format</h4>
            <ul className="export-info-list">
              <li>• Sessions data: Basic session information and metadata</li>
              <li>• Heart Rate Data: Raw heart rate measurements with timestamps</li>
              <li>• Analytics: TRIMP, TSS, recovery metrics, and performance scores</li>
              <li>• Progress Data: Trend analysis and progress tracking</li>
              <li>• Rower Progress: Individual rower performance trends</li>
            </ul>
          </div>
          
          <div className="export-info-section">
            <h4 className="export-info-title">JSON Format</h4>
            <ul className="export-info-list">
              <li>• Complete data structure with all relationships</li>
              <li>• Includes metadata and export information</li>
              <li>• Suitable for developers and custom analysis tools</li>
              <li>• Preserves all data types and timestamps</li>
            </ul>
          </div>
          
          <div className="export-info-section">
            <h4 className="export-info-title">Compatibility</h4>
            <ul className="export-info-list">
              <li>• CSV files work with Excel, Google Sheets, and Numbers</li>
              <li>• JSON files work with any programming language</li>
              <li>• Data is exported in UTC timezone</li>
              <li>• All numeric values use standard decimal notation</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
