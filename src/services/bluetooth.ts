import type { BluetoothDevice, HeartRateData, SpeedCoachConflict } from '../types';

// Heart Rate Service UUIDs
const HEART_RATE_SERVICE_UUID = 'heart_rate';
const HEART_RATE_MEASUREMENT_CHARACTERISTIC_UUID = 'heart_rate_measurement';
const BATTERY_SERVICE_UUID = 'battery_service';
const BATTERY_LEVEL_CHARACTERISTIC_UUID = 'battery_level';

export class BluetoothService {
  private static instance: BluetoothService;
  private connectedDevices: Map<string, any> = new Map();
  private heartRateListeners: Map<string, (data: HeartRateData) => void> = new Map();
  private knownDevices: Map<string, BluetoothDevice> = new Map();
  private connectionAttempts: Map<string, number> = new Map();

  static getInstance(): BluetoothService {
    if (!BluetoothService.instance) {
      BluetoothService.instance = new BluetoothService();
    }
    return BluetoothService.instance;
  }

  // Check if Bluetooth is available
  isBluetoothAvailable(): boolean {
    return 'bluetooth' in navigator;
  }

  // Request Bluetooth device with heart rate service
  async requestDevice(): Promise<BluetoothDevice[]> {
    if (!this.isBluetoothAvailable()) {
      throw new Error('Bluetooth is not available on this device');
    }

    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [
          { services: [HEART_RATE_SERVICE_UUID] },
          { namePrefix: 'HRM' },
          { namePrefix: 'Garmin' },
          { namePrefix: 'Polar' },
          { namePrefix: 'Wahoo' }
        ],
        optionalServices: [BATTERY_SERVICE_UUID]
      });

      return [this.mapBluetoothDevice(device)];
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'NotFoundError') {
          throw new Error('No heart rate devices found');
        } else if (error.name === 'SecurityError') {
          throw new Error('Bluetooth access denied or cancelled by user');
        } else if (error.name === 'AbortError') {
          throw new Error('Device selection was cancelled');
        }
      }
      throw error;
    }
  }

  // Scan for available devices
  async scanForDevices(): Promise<BluetoothDevice[]> {
    if (!this.isBluetoothAvailable()) {
      throw new Error('Bluetooth is not available on this device');
    }

    const devices: BluetoothDevice[] = [];
    
    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [HEART_RATE_SERVICE_UUID, BATTERY_SERVICE_UUID]
      });

      const mappedDevice = this.mapBluetoothDevice(device);
      devices.push(mappedDevice);
      
      // Store known device for conflict detection
      this.knownDevices.set(device.id, mappedDevice);
      
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'SecurityError') {
          console.warn('Bluetooth access denied or cancelled by user');
        } else if (error.name === 'AbortError') {
          console.warn('Device selection was cancelled');
        } else {
          console.warn('Device scan failed:', error);
        }
      } else {
        console.warn('Device scan failed:', error);
      }
    }

    return devices;
  }

  // Connect to a specific device
  async connectToDevice(deviceId: string): Promise<boolean> {
    try {
      // Track connection attempts for conflict detection
      const attempts = this.connectionAttempts.get(deviceId) || 0;
      this.connectionAttempts.set(deviceId, attempts + 1);
      
      // This is a simplified version - in a real implementation,
      // you'd need to store the BluetoothDevice object from the scan
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: [HEART_RATE_SERVICE_UUID] }],
        optionalServices: [BATTERY_SERVICE_UUID]
      });

      const server = await device.gatt?.connect();
      if (!server) {
        throw new Error('Failed to connect to GATT server');
      }

      this.connectedDevices.set(deviceId, server);
      
      // Reset connection attempts on successful connection
      this.connectionAttempts.delete(deviceId);
      
      return true;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'SecurityError') {
          console.warn('Bluetooth access denied or cancelled by user');
        } else if (error.name === 'AbortError') {
          console.warn('Device selection was cancelled');
        } else {
          console.error('Failed to connect to device:', error);
        }
      } else {
        console.error('Failed to connect to device:', error);
      }
      return false;
    }
  }

  // Disconnect from a device
  async disconnectFromDevice(deviceId: string): Promise<void> {
    const server = this.connectedDevices.get(deviceId);
    if (server && server.connected) {
      server.disconnect();
      this.connectedDevices.delete(deviceId);
      this.heartRateListeners.delete(deviceId);
    }
  }

  // Start heart rate monitoring for a device
  async startHeartRateMonitoring(
    deviceId: string,
    onHeartRateUpdate: (data: HeartRateData) => void
  ): Promise<void> {
    const server = this.connectedDevices.get(deviceId);
    if (!server) {
      throw new Error('Device not connected');
    }

    try {
      const service = await server.getPrimaryService(HEART_RATE_SERVICE_UUID);
      const characteristic = await service.getCharacteristic(HEART_RATE_MEASUREMENT_CHARACTERISTIC_UUID);

      // Store the listener
      this.heartRateListeners.set(deviceId, onHeartRateUpdate);

      // Start notifications
      await characteristic.startNotifications();
      
      characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = (event.target as any).value;
        if (value) {
          const heartRate = this.parseHeartRateData(value);
          const heartRateData: HeartRateData = {
            deviceId,
            heartRate,
            timestamp: new Date(),
            zone: this.calculateHeartRateZone(heartRate)
          };
          onHeartRateUpdate(heartRateData);
        }
      });
    } catch (error) {
      console.error('Failed to start heart rate monitoring:', error);
      throw error;
    }
  }

  // Stop heart rate monitoring for a device
  async stopHeartRateMonitoring(deviceId: string): Promise<void> {
    const server = this.connectedDevices.get(deviceId);
    if (!server) {
      return;
    }

    try {
      const service = await server.getPrimaryService(HEART_RATE_SERVICE_UUID);
      const characteristic = await service.getCharacteristic(HEART_RATE_MEASUREMENT_CHARACTERISTIC_UUID);
      
      await characteristic.stopNotifications();
      this.heartRateListeners.delete(deviceId);
    } catch (error) {
      console.error('Failed to stop heart rate monitoring:', error);
    }
  }

  // Get battery level for a device
  async getBatteryLevel(deviceId: string): Promise<number | undefined> {
    const server = this.connectedDevices.get(deviceId);
    if (!server) {
      return undefined;
    }

    try {
      const service = await server.getPrimaryService(BATTERY_SERVICE_UUID);
      const characteristic = await service.getCharacteristic(BATTERY_LEVEL_CHARACTERISTIC_UUID);
      const value = await characteristic.readValue();
      
      return value.getUint8(0);
    } catch (error) {
      console.warn('Failed to read battery level:', error);
      return undefined;
    }
  }

  // Check for SpeedCoach conflicts
  async checkSpeedCoachConflicts(devices: BluetoothDevice[]): Promise<SpeedCoachConflict[]> {
    const conflicts: SpeedCoachConflict[] = [];
    const currentTime = Date.now();
    
    // Check for devices that should be available but aren't showing up
    // This indicates they might be connected to SpeedCoach
    for (const [deviceId, knownDevice] of this.knownDevices) {
      const isCurrentlyVisible = devices.some(d => d.id === deviceId);
      const isHeartRateDevice = this.isHeartRateDevice(knownDevice.name);
      const timeSinceLastSeen = currentTime - (knownDevice.lastSeen?.getTime() || 0);
      
      // If a known heart rate device is not visible and was seen recently,
      // it's likely connected to SpeedCoach
      if (isHeartRateDevice && !isCurrentlyVisible && timeSinceLastSeen < 300000) { // 5 minutes
        conflicts.push({
          deviceId: knownDevice.id,
          deviceName: knownDevice.name,
          isConnectedToSpeedCoach: true,
          canDisconnect: true
        });
      }
    }
    
    // Also check for devices that appear but might have connection issues
    for (const device of devices) {
      if (this.isHeartRateDevice(device.name)) {
        const connectionAttempts = this.connectionAttempts.get(device.id) || 0;
        
        // If we've tried to connect multiple times and failed,
        // it might be connected to SpeedCoach
        if (connectionAttempts > 2) {
          conflicts.push({
            deviceId: device.id,
            deviceName: device.name,
            isConnectedToSpeedCoach: true,
            canDisconnect: true
          });
        }
      }
    }
    
    return conflicts;
  }

  // Add a manual conflict report (for when user knows a device is connected to SpeedCoach)
  addManualConflict(deviceName: string): void {
    const conflict: SpeedCoachConflict = {
      deviceId: `manual-${Date.now()}`,
      deviceName: deviceName,
      isConnectedToSpeedCoach: true,
      canDisconnect: true
    };
    
    // Store this as a known device for future reference
    const device: BluetoothDevice = {
      id: conflict.deviceId,
      name: deviceName,
      connected: false,
      lastSeen: new Date()
    };
    
    this.knownDevices.set(conflict.deviceId, device);
    console.log('Manual conflict added:', conflict);
  }

  // Check if we should suggest potential conflicts (when no heart rate devices are found)
  shouldSuggestConflicts(devices: BluetoothDevice[]): boolean {
    const heartRateDevices = devices.filter(d => this.isHeartRateDevice(d.name));
    return heartRateDevices.length === 0;
  }

  // Helper method to identify heart rate devices
  private isHeartRateDevice(deviceName: string): boolean {
    const name = deviceName.toLowerCase();
    return (
      name.includes('hrm') ||
      name.includes('garmin') ||
      name.includes('polar') ||
      name.includes('wahoo') ||
      name.includes('whoop') ||
      name.includes('heart') ||
      name.includes('hr-') ||
      name.includes('hr ')
    );
  }

  // Parse heart rate data from characteristic value
  private parseHeartRateData(value: DataView): number {
    const flags = value.getUint8(0);
    let heartRate: number;
    
    if (flags & 0x01) {
      // 16-bit heart rate value
      heartRate = value.getUint16(1, true);
    } else {
      // 8-bit heart rate value
      heartRate = value.getUint8(1);
    }
    
    return heartRate;
  }

  // Calculate heart rate zone (simplified)
  private calculateHeartRateZone(heartRate: number): keyof import('../types').HeartRateZones {
    // This is a simplified calculation - in reality, you'd use
    // individual rower's max HR and resting HR
    if (heartRate < 120) return 'recovery';
    if (heartRate < 150) return 'aerobic';
    if (heartRate < 170) return 'threshold';
    return 'anaerobic';
  }

  // Map Bluetooth device to our internal format
  private mapBluetoothDevice(device: BluetoothDevice): BluetoothDevice {
    return {
      id: device.id,
      name: device.name || 'Unknown Device',
      connected: false,
      lastSeen: new Date()
    };
  }

  // Handle SpeedCoach disconnection
  async handleSpeedCoachDisconnection(conflicts: SpeedCoachConflict[]): Promise<boolean> {
    try {
      // In a real implementation, this would:
      // 1. Attempt to connect to each conflicted device
      // 2. If connection fails, it means the device is connected to SpeedCoach
      // 3. We would need to implement a way to force disconnection
      // For now, we'll simulate the process
      
      console.log('Handling SpeedCoach disconnection for conflicts:', conflicts);
      
      // Clear connection attempts for conflicted devices
      for (const conflict of conflicts) {
        this.connectionAttempts.delete(conflict.deviceId);
      }
      
      // In a real implementation, you might:
      // - Send a disconnect command to the device
      // - Wait for the device to become available
      // - Retry connection
      
      return true;
    } catch (error) {
      console.error('Failed to handle SpeedCoach disconnection:', error);
      return false;
    }
  }

  // Get known devices for debugging
  getKnownDevices(): BluetoothDevice[] {
    return Array.from(this.knownDevices.values());
  }

  // Clear known devices (useful for testing)
  clearKnownDevices(): void {
    this.knownDevices.clear();
    this.connectionAttempts.clear();
  }

  // Get connection status
  getConnectionStatus(): { connected: number; total: number } {
    return {
      connected: this.connectedDevices.size,
      total: this.connectedDevices.size
    };
  }
}
