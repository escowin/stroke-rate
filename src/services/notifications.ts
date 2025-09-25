import { DATABASE_CAP_BYTES } from './database';

export interface AlertConfig {
  enableLowBatteryAlerts: boolean;
  enableConnectionAlerts: boolean;
  enableDatabaseFullAlerts: boolean;
  batteryWarningThreshold: number; // percentage
  databaseWarningThreshold: number; // percentage (80% = 0.8)
}

export interface Alert {
  id: string;
  type: 'battery' | 'connection' | 'database';
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
    enableDatabaseFullAlerts: true,
    batteryWarningThreshold: 20, // 20% battery
    databaseWarningThreshold: 0.8 // 80% of database quota
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

  // Database monitoring
  async checkDatabaseUsage(): Promise<void> {
    if (!this.config.enableDatabaseFullAlerts) return;

    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        if (estimate.usage !== undefined) {
          // Use realistic 100MB cap instead of browser's massive quota
          const usagePercentage = estimate.usage / DATABASE_CAP_BYTES;
          
          if (usagePercentage >= this.config.databaseWarningThreshold) {
            this.createAlert({
              type: 'database',
              severity: 'high',
              title: 'Database Storage Warning',
              message: `Database is ${Math.round(usagePercentage * 100)}% full (${Math.round(estimate.usage / 1024 / 1024)}MB of 100MB). Consider clearing old data or exporting sessions.`,
              timestamp: new Date()
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed to check database usage:', error);
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
