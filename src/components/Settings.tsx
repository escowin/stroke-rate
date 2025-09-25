import React, { useState } from 'react';
import { 
  Cog6ToothIcon, 
  BellIcon, 
  DevicePhoneMobileIcon,
  WifiIcon,
  PlayIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { useNotifications } from '../hooks/useNotifications';
import { useAppStore } from '../store';
import { getDatabaseUsage, clearObjectStore, clearAllData, getDatabaseStats } from '../services/database';

export const Settings: React.FC = () => {
  const { config, updateConfig } = useNotifications();
  const { setUIState } = useAppStore();
  const [activeTab, setActiveTab] = useState<'notifications' | 'general'>('notifications');
  const [databaseUsage, setDatabaseUsage] = useState<{ usage: number; quota: number; percentage: number; cap: number } | null>(null);
  const [databaseStats, setDatabaseStats] = useState<{
    totalSessions: number;
    totalHeartRateDataPoints: number;
    totalRowers: number;
    databaseSize: number;
  } | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  // Load database usage and stats
  const loadDatabaseInfo = async () => {
    try {
      const [usage, stats] = await Promise.all([
        getDatabaseUsage(),
        getDatabaseStats()
      ]);
      setDatabaseUsage(usage);
      setDatabaseStats(stats);
    } catch (error) {
      console.error('Failed to load database info:', error);
    }
  };

  // Load database info on component mount
  React.useEffect(() => {
    loadDatabaseInfo();
  }, []);

  const handleSave = () => {
    // Settings are automatically saved via the hook
    // Navigate back to dashboard
    setUIState({ currentView: 'session' });
  };

  const handleReset = () => {
    updateConfig({
      enableLowBatteryAlerts: true,
      enableConnectionAlerts: true,
      enableDatabaseFullAlerts: true,
      batteryWarningThreshold: 20,
      databaseWarningThreshold: 0.8
    });
  };

  const handleClearObjectStore = async (storeName: 'sessions' | 'heartRateData' | 'rowers') => {
    if (!confirm(`Are you sure you want to clear all ${storeName}? This action cannot be undone.`)) {
      return;
    }

    setIsClearing(true);
    try {
      await clearObjectStore(storeName);
      await loadDatabaseInfo(); // Refresh stats
    } catch (error) {
      console.error(`Failed to clear ${storeName}:`, error);
      alert(`Failed to clear ${storeName}. Please try again.`);
    } finally {
      setIsClearing(false);
    }
  };

  const handleClearAllData = async () => {
    if (!confirm('Are you sure you want to clear ALL data? This will remove all sessions, rower profiles, and heart rate data. This action cannot be undone.')) {
      return;
    }

    setIsClearing(true);
    try {
      await clearAllData();
      await loadDatabaseInfo(); // Refresh stats
    } catch (error) {
      console.error('Failed to clear all data:', error);
      alert('Failed to clear all data. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const estimateSessionsFromUsage = (usageBytes: number): number => {
    // Each session is approximately 271 KB (270 KB heart rate data + 1 KB metadata)
    const bytesPerSession = 271 * 1024;
    return Math.round(usageBytes / bytesPerSession);
  };

  return (
    <div className="settings-page">
        <div className="settings-header">
          <div className="settings-title">
            <Cog6ToothIcon className="settings-title-icon" />
            <h2>Settings</h2>
          </div>
          <button
            className="settings-back-btn"
            onClick={() => setUIState({ currentView: 'session' })}
            title="Back to Dashboard"
          >
            <XMarkIcon className="settings-back-icon" />
          </button>
        </div>

        <div className="settings-content">
          {/* Tab Navigation */}
          <div className="settings-tabs">
            <button
              className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <BellIcon className="settings-tab-icon" />
              Notifications
            </button>
            <button
              className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              <Cog6ToothIcon className="settings-tab-icon" />
              General
            </button>
          </div>

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h3 className="settings-section-title">Notification Preferences</h3>
              <p className="settings-section-description">
                Choose which notifications you want to receive during training sessions.
              </p>

              <div className="settings-group">
                <h4 className="settings-group-title">Alert Types</h4>
                
                <div className="settings-item">
                  <div className="settings-item-content">
                    <div className="settings-item-header">
                      <DevicePhoneMobileIcon className="settings-item-icon" />
                      <div className="settings-item-info">
                        <h5 className="settings-item-title">Low Battery Alerts</h5>
                        <p className="settings-item-description">
                          Get notified when heart rate monitor batteries are running low
                        </p>
                      </div>
                    </div>
                    <label className="settings-toggle">
                      <input
                        type="checkbox"
                        checked={config.enableLowBatteryAlerts}
                        onChange={(e) => updateConfig({ enableLowBatteryAlerts: e.target.checked })}
                      />
                      <span className="settings-toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="settings-item">
                  <div className="settings-item-content">
                    <div className="settings-item-header">
                      <WifiIcon className="settings-item-icon" />
                      <div className="settings-item-info">
                        <h5 className="settings-item-title">Connection Alerts</h5>
                        <p className="settings-item-description">
                          Get notified when heart rate monitor connections are lost
                        </p>
                      </div>
                    </div>
                    <label className="settings-toggle">
                      <input
                        type="checkbox"
                        checked={config.enableConnectionAlerts}
                        onChange={(e) => updateConfig({ enableConnectionAlerts: e.target.checked })}
                      />
                      <span className="settings-toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="settings-item">
                  <div className="settings-item-content">
                    <div className="settings-item-header">
                      <Cog6ToothIcon className="settings-item-icon" />
                      <div className="settings-item-info">
                        <h5 className="settings-item-title">Database Storage Alerts</h5>
                        <p className="settings-item-description">
                          Get notified when database storage is getting full
                        </p>
                      </div>
                    </div>
                    <label className="settings-toggle">
                      <input
                        type="checkbox"
                        checked={config.enableDatabaseFullAlerts}
                        onChange={(e) => updateConfig({ enableDatabaseFullAlerts: e.target.checked })}
                      />
                      <span className="settings-toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="settings-group">
                <h4 className="settings-group-title">Alert Thresholds</h4>
                
                <div className="settings-item">
                  <div className="settings-item-content">
                    <div className="settings-item-header">
                      <div className="settings-item-info">
                        <h5 className="settings-item-title">Battery Warning Threshold</h5>
                        <p className="settings-item-description">
                          Battery percentage at which to show low battery alerts
                        </p>
                      </div>
                    </div>
                    <div className="settings-slider-container">
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={config.batteryWarningThreshold}
                        onChange={(e) => updateConfig({ batteryWarningThreshold: parseInt(e.target.value) })}
                        className="settings-slider"
                      />
                      <span className="settings-slider-value">{config.batteryWarningThreshold}%</span>
                    </div>
                  </div>
                </div>

                <div className="settings-item">
                  <div className="settings-item-content">
                    <div className="settings-item-header">
                      <div className="settings-item-info">
                        <h5 className="settings-item-title">Database Warning Threshold</h5>
                        <p className="settings-item-description">
                          Database usage percentage at which to show storage alerts
                        </p>
                      </div>
                    </div>
                    <div className="settings-slider-container">
                      <input
                        type="range"
                        min="50"
                        max="95"
                        value={Math.round(config.databaseWarningThreshold * 100)}
                        onChange={(e) => updateConfig({ databaseWarningThreshold: parseInt(e.target.value) / 100 })}
                        className="settings-slider"
                      />
                      <span className="settings-slider-value">{Math.round(config.databaseWarningThreshold * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="settings-section">
              <h3 className="settings-section-title">General Settings</h3>
              <p className="settings-section-description">
                Configure general application preferences.
              </p>

              <div className="settings-group">
                <h4 className="settings-group-title">Navigation</h4>
                
                <div className="settings-item">
                  <div className="settings-item-content">
                    <div className="settings-item-header">
                      <div className="settings-item-info">
                        <h5 className="settings-item-title">Default View</h5>
                        <p className="settings-item-description">
                          Choose the default dashboard view when starting the app
                        </p>
                      </div>
                    </div>
                    <div className="settings-select">
                      <select 
                        className="settings-select-input"
                        defaultValue="basic"
                      >
                        <option value="basic">Basic View</option>
                        <option value="enhanced">Enhanced View</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-group">
                <h4 className="settings-group-title">Database Storage</h4>
                
                {databaseUsage && (
                  <div className="settings-item">
                    <div className="settings-item-content">
                      <div className="settings-item-header">
                        <div className="settings-item-info">
                          <h5 className="settings-item-title">Storage Usage</h5>
                          <p className="settings-item-description">
                            {formatBytes(databaseUsage.usage)} of {formatBytes(databaseUsage.cap)} used
                          </p>
                        </div>
                      </div>
                      <div className="settings-progress-container">
                        <progress 
                          className="settings-progress" 
                          value={databaseUsage.percentage} 
                          max="1"
                        />
                        <span className="settings-progress-value">
                          {Math.round(databaseUsage.percentage * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {databaseStats && (
                  <div className="settings-item">
                    <div className="settings-item-content">
                      <div className="settings-item-header">
                        <div className="settings-item-info">
                          <h5 className="settings-item-title">Database Statistics</h5>
                          <p className="settings-item-description">
                            {databaseStats.totalSessions} sessions, {databaseStats.totalHeartRateDataPoints} data points, {databaseStats.totalRowers} rowers
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="settings-group">
                <h4 className="settings-group-title">Data Management</h4>
                
                <div className="settings-item">
                  <div className="settings-item-content">
                    <div className="settings-item-header">
                      <div className="settings-item-info">
                        <h5 className="settings-item-title">Clear Sessions</h5>
                        <p className="settings-item-description">
                          Remove all training sessions and associated heart rate data
                        </p>
                      </div>
                    </div>
                    <button 
                      className="settings-danger-btn"
                      onClick={() => handleClearObjectStore('sessions')}
                      disabled={isClearing}
                    >
                      {isClearing ? 'Clearing...' : 'Clear Sessions'}
                    </button>
                  </div>
                </div>

                <div className="settings-item">
                  <div className="settings-item-content">
                    <div className="settings-item-header">
                      <div className="settings-item-info">
                        <h5 className="settings-item-title">Clear Heart Rate Data</h5>
                        <p className="settings-item-description">
                          Remove all stored heart rate data points
                        </p>
                      </div>
                    </div>
                    <button 
                      className="settings-danger-btn"
                      onClick={() => handleClearObjectStore('heartRateData')}
                      disabled={isClearing}
                    >
                      {isClearing ? 'Clearing...' : 'Clear Heart Rate Data'}
                    </button>
                  </div>
                </div>

                <div className="settings-item">
                  <div className="settings-item-content">
                    <div className="settings-item-header">
                      <div className="settings-item-info">
                        <h5 className="settings-item-title">Clear Rower Profiles</h5>
                        <p className="settings-item-description">
                          Remove all rower profiles and settings
                        </p>
                      </div>
                    </div>
                    <button 
                      className="settings-danger-btn"
                      onClick={() => handleClearObjectStore('rowers')}
                      disabled={isClearing}
                    >
                      {isClearing ? 'Clearing...' : 'Clear Rower Profiles'}
                    </button>
                  </div>
                </div>

                <div className="settings-item">
                  <div className="settings-item-content">
                    <div className="settings-item-header">
                      <div className="settings-item-info">
                        <h5 className="settings-item-title">Clear All Data</h5>
                        <p className="settings-item-description">
                          Remove all stored data (sessions, rower profiles, and heart rate data)
                        </p>
                      </div>
                    </div>
                    <button 
                      className="settings-danger-btn"
                      onClick={handleClearAllData}
                      disabled={isClearing}
                    >
                      {isClearing ? 'Clearing...' : 'Clear All Data'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="settings-footer">
          <button
            className="settings-reset-btn"
            onClick={handleReset}
          >
            Reset to Defaults
          </button>
          <div className="settings-footer-actions">
            <button
              className="settings-cancel-btn"
              onClick={() => setUIState({ currentView: 'session' })}
            >
              Cancel
            </button>
            <button
              className="settings-save-btn"
              onClick={handleSave}
            >
              <CheckIcon className="settings-save-icon" />
              Save
            </button>
          </div>
        </div>
    </div>
  );
};
