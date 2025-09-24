import { useState, useEffect, useCallback, useMemo } from 'react';
import { BluetoothService } from '../services/bluetooth';
import { useAppStore } from '../store';

export interface ConnectionHealth {
  deviceId: string;
  isHealthy: boolean;
  lastHeartbeat: Date;
  timeSinceLastHeartbeat: number;
}

export const useConnectionHealth = () => {
  const [connectionHealth, setConnectionHealth] = useState<Map<string, ConnectionHealth>>(new Map());
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  const bluetoothService = BluetoothService.getInstance();
  const { connectionStatus } = useAppStore();

  // Update connection health data
  const updateHealthData = useCallback(() => {
    const healthMap = new Map<string, ConnectionHealth>();
    const allHealth = bluetoothService.getAllConnectionHealth();
    
    for (const [deviceId, health] of allHealth) {
      const timeSinceLastHeartbeat = Date.now() - health.lastHeartbeat.getTime();
      
      // Use the service's health calculation to ensure consistency
      const isHealthy = bluetoothService.isConnectionHealthy(deviceId);
      
      healthMap.set(deviceId, {
        deviceId,
        isHealthy,
        lastHeartbeat: health.lastHeartbeat,
        timeSinceLastHeartbeat
      });
    }
    
    setConnectionHealth(healthMap);
  }, [bluetoothService]);

  // Start monitoring connection health
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    bluetoothService.startConnectionHealthMonitoring();
    
    // Update health data every 5 seconds
    const interval = setInterval(updateHealthData, 5000);
    
    return () => {
      clearInterval(interval);
      bluetoothService.stopConnectionHealthMonitoring();
      setIsMonitoring(false);
    };
  }, [bluetoothService, updateHealthData]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    bluetoothService.stopConnectionHealthMonitoring();
    setIsMonitoring(false);
  }, [bluetoothService]);

  // Get health for specific device - memoized to prevent unnecessary re-renders
  const getDeviceHealth = useCallback((deviceId: string): ConnectionHealth | undefined => {
    return connectionHealth.get(deviceId);
  }, [connectionHealth]);

  // Get all unhealthy connections
  const getUnhealthyConnections = useCallback((): ConnectionHealth[] => {
    return Array.from(connectionHealth.values()).filter(health => !health.isHealthy);
  }, [connectionHealth]);

  // Get connection health summary
  const getHealthSummary = useCallback(() => {
    const total = connectionHealth.size;
    const healthy = Array.from(connectionHealth.values()).filter(h => h.isHealthy).length;
    const unhealthy = total - healthy;
    
    return {
      total,
      healthy,
      unhealthy,
      healthPercentage: total > 0 ? Math.round((healthy / total) * 100) : 100
    };
  }, [connectionHealth]);

  // Memoized device health status for all devices to prevent unnecessary re-renders
  const deviceHealthStatuses = useMemo(() => {
    const statuses = new Map<string, { status: string; color: string }>();
    for (const [deviceId, health] of connectionHealth) {
      if (health.isHealthy) {
        statuses.set(deviceId, { status: 'healthy', color: 'green' });
      } else {
        statuses.set(deviceId, { status: 'unhealthy', color: 'red' });
      }
    }
    return statuses;
  }, [connectionHealth]);

  // Optimized function to get device health status
  const getDeviceHealthStatus = useCallback((deviceId: string) => {
    return deviceHealthStatuses.get(deviceId) || { status: 'unknown', color: 'gray' };
  }, [deviceHealthStatuses]);

  // Note: Device status updates are now handled directly in the BluetoothService
  // to avoid infinite loops between the hook and the store

  // Auto-start monitoring when devices are connected
  useEffect(() => {
    const hasConnectedDevices = connectionStatus.connectedDevices.length > 0;
    
    if (hasConnectedDevices) {
      bluetoothService.startConnectionHealthMonitoring();
      
      // Initial health data update
      updateHealthData();
      
      // Update health data every 5 seconds
      const interval = setInterval(updateHealthData, 5000);
      
      return () => {
        clearInterval(interval);
        bluetoothService.stopConnectionHealthMonitoring();
      };
    } else {
      bluetoothService.stopConnectionHealthMonitoring();
    }
  }, [connectionStatus.connectedDevices.length, bluetoothService, updateHealthData]);

  // Separate effect to manage monitoring state
  useEffect(() => {
    setIsMonitoring(connectionStatus.connectedDevices.length > 0);
  }, [connectionStatus.connectedDevices.length]);

  return {
    connectionHealth,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    getDeviceHealth,
    getDeviceHealthStatus,
    getUnhealthyConnections,
    getHealthSummary,
    updateHealthData
  };
};
