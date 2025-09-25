import React, { useState } from 'react';
import { 
  ExclamationTriangleIcon, 
  XMarkIcon, 
  BellIcon,
  BellSlashIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useNotifications } from '../hooks/useNotifications';
import type { Alert } from '../services/notifications';

interface AlertPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({ isOpen, onClose }) => {
  const {
    alerts,
    config,
    activeAlertsCount,
    updateConfig,
    dismissAlert,
    dismissAllAlerts,
    clearAllAlerts,
    getAlertsBySeverity
  } = useNotifications();

  const [showSettings, setShowSettings] = useState(false);

  if (!isOpen) return null;

  const highSeverityAlerts = getAlertsBySeverity('high');
  const mediumSeverityAlerts = getAlertsBySeverity('medium');
  const lowSeverityAlerts = getAlertsBySeverity('low');

  const getSeverityIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'high':
        return <ExclamationTriangleIcon className="alert-icon alert-icon--high" />;
      case 'medium':
        return <ExclamationTriangleIcon className="alert-icon alert-icon--medium" />;
      case 'low':
        return <BellIcon className="alert-icon alert-icon--low" />;
    }
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'high':
        return 'var(--color-red)';
      case 'medium':
        return 'var(--color-orange)';
      case 'low':
        return 'var(--color-blue-light)';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="alert-panel-overlay" onClick={onClose}>
      <div className="alert-panel" onClick={(e) => e.stopPropagation()}>
        <div className="alert-panel-header">
          <div className="alert-panel-title">
            <BellIcon className="alert-panel-title-icon" />
            <h3>Alerts & Notifications</h3>
            {activeAlertsCount > 0 && (
              <span className="alert-panel-count">{activeAlertsCount}</span>
            )}
          </div>
          <div className="alert-panel-actions">
            <button
              className="alert-panel-settings-btn"
              onClick={() => setShowSettings(!showSettings)}
              title="Settings"
            >
              <Cog6ToothIcon className="alert-panel-settings-icon" />
            </button>
            <button
              className="alert-panel-close-btn"
              onClick={onClose}
              title="Close"
            >
              <XMarkIcon className="alert-panel-close-icon" />
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="alert-panel-settings">
            <h4>Alert Settings</h4>
            <div className="alert-settings-grid">
              <label className="alert-setting-item">
                <input
                  type="checkbox"
                  checked={config.enableLowBatteryAlerts}
                  onChange={(e) => updateConfig({ enableLowBatteryAlerts: e.target.checked })}
                />
                <span>Low Battery Alerts</span>
              </label>
              <label className="alert-setting-item">
                <input
                  type="checkbox"
                  checked={config.enableConnectionAlerts}
                  onChange={(e) => updateConfig({ enableConnectionAlerts: e.target.checked })}
                />
                <span>Connection Alerts</span>
              </label>
              <label className="alert-setting-item">
                <input
                  type="checkbox"
                  checked={config.enableSessionAlerts}
                  onChange={(e) => updateConfig({ enableSessionAlerts: e.target.checked })}
                />
                <span>Session Alerts</span>
              </label>
            </div>
            <div className="alert-settings-sliders">
              <div className="alert-setting-slider">
                <label>Battery Warning Threshold (%)</label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={config.batteryWarningThreshold}
                  onChange={(e) => updateConfig({ batteryWarningThreshold: parseInt(e.target.value) })}
                />
                <span>{config.batteryWarningThreshold}%</span>
              </div>
            </div>
          </div>
        )}

        <div className="alert-panel-content">
          {activeAlertsCount === 0 ? (
            <div className="alert-panel-empty">
              <BellSlashIcon className="alert-panel-empty-icon" />
              <p>No active alerts</p>
            </div>
          ) : (
            <div className="alert-list">
              {/* High Severity Alerts */}
              {highSeverityAlerts.length > 0 && (
                <div className="alert-severity-group">
                  <h4 className="alert-severity-title alert-severity-title--high">
                    High Priority ({highSeverityAlerts.length})
                  </h4>
                  {highSeverityAlerts.map((alert) => (
                    <div key={alert.id} className="alert-item alert-item--high">
                      <div className="alert-item-header">
                        {getSeverityIcon(alert.severity)}
                        <div className="alert-item-content">
                          <h5 className="alert-item-title">{alert.title}</h5>
                          <p className="alert-item-message">{alert.message}</p>
                        </div>
                        <button
                          className="alert-item-dismiss"
                          onClick={() => dismissAlert(alert.id)}
                          title="Dismiss"
                        >
                          <XMarkIcon className="alert-item-dismiss-icon" />
                        </button>
                      </div>
                      <div className="alert-item-meta">
                        <span className="alert-item-time">{formatTimestamp(alert.timestamp)}</span>
                        {alert.rowerName && (
                          <span className="alert-item-rower">{alert.rowerName}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Medium Severity Alerts */}
              {mediumSeverityAlerts.length > 0 && (
                <div className="alert-severity-group">
                  <h4 className="alert-severity-title alert-severity-title--medium">
                    Medium Priority ({mediumSeverityAlerts.length})
                  </h4>
                  {mediumSeverityAlerts.map((alert) => (
                    <div key={alert.id} className="alert-item alert-item--medium">
                      <div className="alert-item-header">
                        {getSeverityIcon(alert.severity)}
                        <div className="alert-item-content">
                          <h5 className="alert-item-title">{alert.title}</h5>
                          <p className="alert-item-message">{alert.message}</p>
                        </div>
                        <button
                          className="alert-item-dismiss"
                          onClick={() => dismissAlert(alert.id)}
                          title="Dismiss"
                        >
                          <XMarkIcon className="alert-item-dismiss-icon" />
                        </button>
                      </div>
                      <div className="alert-item-meta">
                        <span className="alert-item-time">{formatTimestamp(alert.timestamp)}</span>
                        {alert.rowerName && (
                          <span className="alert-item-rower">{alert.rowerName}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Low Severity Alerts */}
              {lowSeverityAlerts.length > 0 && (
                <div className="alert-severity-group">
                  <h4 className="alert-severity-title alert-severity-title--low">
                    Low Priority ({lowSeverityAlerts.length})
                  </h4>
                  {lowSeverityAlerts.map((alert) => (
                    <div key={alert.id} className="alert-item alert-item--low">
                      <div className="alert-item-header">
                        {getSeverityIcon(alert.severity)}
                        <div className="alert-item-content">
                          <h5 className="alert-item-title">{alert.title}</h5>
                          <p className="alert-item-message">{alert.message}</p>
                        </div>
                        <button
                          className="alert-item-dismiss"
                          onClick={() => dismissAlert(alert.id)}
                          title="Dismiss"
                        >
                          <XMarkIcon className="alert-item-dismiss-icon" />
                        </button>
                      </div>
                      <div className="alert-item-meta">
                        <span className="alert-item-time">{formatTimestamp(alert.timestamp)}</span>
                        {alert.rowerName && (
                          <span className="alert-item-rower">{alert.rowerName}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {activeAlertsCount > 0 && (
          <div className="alert-panel-footer">
            <button
              className="alert-panel-dismiss-all"
              onClick={dismissAllAlerts}
            >
              Dismiss All
            </button>
            <button
              className="alert-panel-clear-all"
              onClick={clearAllAlerts}
            >
              Clear All
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
