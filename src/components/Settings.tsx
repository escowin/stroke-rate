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

export const Settings: React.FC = () => {
  const { config, updateConfig } = useNotifications();
  const { setUIState } = useAppStore();
  const [activeTab, setActiveTab] = useState<'notifications' | 'general'>('notifications');

  const handleSave = () => {
    // Settings are automatically saved via the hook
    // Navigate back to dashboard
    setUIState({ currentView: 'session' });
  };

  const handleReset = () => {
    updateConfig({
      enableLowBatteryAlerts: true,
      enableConnectionAlerts: true,
      enableSessionAlerts: true,
      batteryWarningThreshold: 20
    });
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
                      <PlayIcon className="settings-item-icon" />
                      <div className="settings-item-info">
                        <h5 className="settings-item-title">Session Alerts</h5>
                        <p className="settings-item-description">
                          Get notified when training sessions start and end
                        </p>
                      </div>
                    </div>
                    <label className="settings-toggle">
                      <input
                        type="checkbox"
                        checked={config.enableSessionAlerts}
                        onChange={(e) => updateConfig({ enableSessionAlerts: e.target.checked })}
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
                <h4 className="settings-group-title">Data Management</h4>
                
                <div className="settings-item">
                  <div className="settings-item-content">
                    <div className="settings-item-header">
                      <div className="settings-item-info">
                        <h5 className="settings-item-title">Clear All Data</h5>
                        <p className="settings-item-description">
                          Remove all stored sessions, rower profiles, and heart rate data
                        </p>
                      </div>
                    </div>
                    <button className="settings-danger-btn">
                      Clear All Data
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
