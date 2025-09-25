import type { HeartRateData } from '../types';

export interface AlertConfig {
  enableLowBatteryAlerts: boolean;
  enableConnectionAlerts: boolean;
  enableSessionAlerts: boolean;
  batteryWarningThreshold: number; // percentage
}

export interface Alert {
  id: string;
  type: 'battery' | 'connection' | 'session';
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  timestamp: Date;
  deviceId?: string;
  rowerName?: string;
  dismissed: boolean;
}

class NotificationService {
  private config: AlertConfig = {
    enableLowBatteryAlerts: true,
    enableConnectionAlerts: true,
    enableSessionAlerts: true,
    batteryWarningThreshold: 20 // 20% battery
  };

  private alerts: Alert[] = [];
  private notificationPermission: NotificationPermission = 'default';

  constructor() {
    this.requestNotificationPermission();
  }

  private async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window) {
      this.notificationPermission = await Notification.requestPermission();
    }
  }

  updateConfig(newConfig: Partial<AlertConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): AlertConfig {
    return { ...this.config };
  }

  getAllAlerts(): Alert[] {
    return [...this.alerts];
  }

  getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.dismissed);
  }

  dismissAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.dismissed = true;
    }
  }

  dismissAllAlerts(): void {
    this.alerts.forEach(alert => {
      alert.dismissed = true;
    });
  }

  clearAllAlerts(): void {
    this.alerts = [];
  }

  // Session-related alerts
  notifySessionStarted(sessionId: string): void {
    if (this.config.enableSessionAlerts) {
      this.createAlert({
        type: 'session',
        severity: 'low',
        title: 'Session Started',
        message: `Training session ${sessionId} has begun`,
        timestamp: new Date()
      });
    }
  }

  notifySessionEnded(sessionId: string, duration: string): void {
    if (this.config.enableSessionAlerts) {
      this.createAlert({
        type: 'session',
        severity: 'low',
        title: 'Session Ended',
        message: `Training session completed. Duration: ${duration}`,
        timestamp: new Date()
      });
    }
  }

  // Battery and connection alerts
  checkBatteryLevel(deviceId: string, batteryLevel: number, rowerName: string): void {
    if (this.config.enableLowBatteryAlerts && batteryLevel <= this.config.batteryWarningThreshold) {
      this.createAlert({
        type: 'battery',
        severity: 'low',
        title: 'Low Battery',
        message: `${rowerName}'s heart rate monitor battery is at ${batteryLevel}%`,
        timestamp: new Date(),
        deviceId,
        rowerName
      });
    }
  }

  checkConnectionStatus(deviceId: string, isConnected: boolean, rowerName: string): void {
    if (this.config.enableConnectionAlerts && !isConnected) {
      this.createAlert({
        type: 'connection',
        severity: 'high',
        title: 'Connection Lost',
        message: `Lost connection to ${rowerName}'s heart rate monitor`,
        timestamp: new Date(),
        deviceId,
        rowerName
      });
    }
  }

  private createAlert(alertData: Omit<Alert, 'id' | 'dismissed'>): void {
    const alert: Alert = {
      ...alertData,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      dismissed: false
    };

    this.alerts.unshift(alert); // Add to beginning of array
    
    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(0, 50);
    }

    // Show browser notification if permission granted
    this.showBrowserNotification(alert);
  }

  private showBrowserNotification(alert: Alert): void {
    if (this.notificationPermission === 'granted' && 'Notification' in window) {
      const notification = new Notification(alert.title, {
        body: alert.message,
        icon: '/icon.svg',
        tag: alert.id, // Prevents duplicate notifications
        requireInteraction: alert.severity === 'high'
      });

      // Auto-close after 5 seconds for low/medium severity
      if (alert.severity !== 'high') {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
