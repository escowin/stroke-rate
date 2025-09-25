import { useState, useEffect, useCallback } from 'react';
import { notificationService, type Alert, type AlertConfig } from '../services/notifications';

export const useNotifications = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [config, setConfig] = useState<AlertConfig>(notificationService.getConfig());

  // Load alerts and config on mount
  useEffect(() => {
    setAlerts(notificationService.getAllAlerts());
    setConfig(notificationService.getConfig());
  }, []);

  // Update alerts when they change
  const refreshAlerts = useCallback(() => {
    setAlerts(notificationService.getAllAlerts());
  }, []);

  // Update config
  const updateConfig = useCallback((newConfig: Partial<AlertConfig>) => {
    notificationService.updateConfig(newConfig);
    setConfig(notificationService.getConfig());
  }, []);

  // Dismiss alert
  const dismissAlert = useCallback((alertId: string) => {
    notificationService.dismissAlert(alertId);
    refreshAlerts();
  }, [refreshAlerts]);

  // Dismiss all alerts
  const dismissAllAlerts = useCallback(() => {
    notificationService.dismissAllAlerts();
    refreshAlerts();
  }, [refreshAlerts]);

  // Clear all alerts
  const clearAllAlerts = useCallback(() => {
    notificationService.clearAllAlerts();
    refreshAlerts();
  }, [refreshAlerts]);

  // Get active alerts count
  const activeAlertsCount = alerts.filter(alert => !alert.dismissed).length;

  // Get alerts by severity
  const getAlertsBySeverity = useCallback((severity: Alert['severity']) => {
    return alerts.filter(alert => alert.severity === severity && !alert.dismissed);
  }, [alerts]);

  return {
    alerts,
    config,
    activeAlertsCount,
    updateConfig,
    dismissAlert,
    dismissAllAlerts,
    clearAllAlerts,
    refreshAlerts,
    getAlertsBySeverity
  };
};
