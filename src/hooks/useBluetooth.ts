import { useState, useEffect, useCallback } from 'react';
import type { BluetoothDevice, HeartRateData, SpeedCoachConflict } from '../types';
import { BluetoothService } from '../services/bluetooth';
import { useAppStore } from '../store';

export const useBluetooth = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const bluetoothService = BluetoothService.getInstance();
  const {
    setConnectionStatus,
    addConnectedDevice,
    removeConnectedDevice,
    // updateDeviceStatus,
    updateHeartRate,
    setError: setStoreError
  } = useAppStore();

  // Check Bluetooth availability on mount
  useEffect(() => {
    setIsAvailable(bluetoothService.isBluetoothAvailable());
  }, [bluetoothService]);

  // Scan for devices
  const scanForDevices = useCallback(async () => {
    if (!isAvailable) {
      setError('Bluetooth is not available on this device');
      return [];
    }

    setIsScanning(true);
    setError(null);
    setStoreError(undefined);

    try {
      const devices = await bluetoothService.scanForDevices();
      
      // Check for SpeedCoach conflicts
      const conflicts = await bluetoothService.checkSpeedCoachConflicts(devices);
      
      setConnectionStatus({
        availableDevices: devices,
        hasSpeedCoachConflicts: conflicts.length > 0,
        conflicts
      });

      return devices;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to scan for devices';
      setError(errorMessage);
      setStoreError(errorMessage);
      return [];
    } finally {
      setIsScanning(false);
    }
  }, [isAvailable, bluetoothService, setConnectionStatus, setStoreError]);

  // Connect to a device
  const connectToDevice = useCallback(async (device: BluetoothDevice) => {
    setError(null);
    setStoreError(undefined);

    try {
      const success = await bluetoothService.connectToDevice(device.id);
      
      if (success) {
        const connectedDevice = { ...device, connected: true };
        addConnectedDevice(connectedDevice);
        
        // Start heart rate monitoring
        await bluetoothService.startHeartRateMonitoring(
          device.id,
          (heartRateData: HeartRateData) => {
            updateHeartRate(heartRateData);
          }
        );

        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to device';
      setError(errorMessage);
      setStoreError(errorMessage);
      return false;
    }
  }, [bluetoothService, addConnectedDevice, updateHeartRate, setStoreError]);

  // Disconnect from a device
  const disconnectFromDevice = useCallback(async (deviceId: string) => {
    try {
      await bluetoothService.stopHeartRateMonitoring(deviceId);
      await bluetoothService.disconnectFromDevice(deviceId);
      removeConnectedDevice(deviceId);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect from device';
      setError(errorMessage);
      setStoreError(errorMessage);
      return false;
    }
  }, [bluetoothService, removeConnectedDevice, setStoreError]);

  // Get battery level for a device
  const getBatteryLevel = useCallback(async (deviceId: string) => {
    try {
      return await bluetoothService.getBatteryLevel(deviceId);
    } catch (err) {
      console.warn('Failed to get battery level:', err);
      return undefined;
    }
  }, [bluetoothService]);

  // Handle SpeedCoach conflicts
  const handleSpeedCoachConflicts = useCallback(async (conflicts: SpeedCoachConflict[]) => {
    // This would be implemented based on user choice
    // For now, we'll just log the conflicts
    console.log('SpeedCoach conflicts detected:', conflicts);
    
    // In a real implementation, you'd show a dialog to the user
    // and handle the disconnection based on their choice
    return conflicts;
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
    setStoreError(undefined);
  }, [setStoreError]);

  return {
    isAvailable,
    isScanning,
    error,
    scanForDevices,
    connectToDevice,
    disconnectFromDevice,
    getBatteryLevel,
    handleSpeedCoachConflicts,
    clearError
  };
};
