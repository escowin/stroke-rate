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
  private connectionHealth: Map<string, { lastHeartbeat: Date; isHealthy: boolean }> = new Map();
  private reconnectionTimers: Map<string, NodeJS.Timeout> = new Map();
  private healthMonitoringInterval: NodeJS.Timeout | null = null;
  private maxReconnectionAttempts = 3;
  private reconnectionDelay = 5000; // 5 seconds
  private lastWarningTime: Map<string, number> = new Map();
  private warningCooldown = 30000; // 30 seconds between warnings
  private storeUpdateCallback: ((deviceId: string, updates: Partial<BluetoothDevice>) => void) | null = null;

  static getInstance(): BluetoothService {
    if (!BluetoothService.instance) {
      BluetoothService.instance = new BluetoothService();
    }
    return BluetoothService.instance;
  }

  // Set store update callback
  setStoreUpdateCallback(callback: (deviceId: string, updates: Partial<BluetoothDevice>) => void): void {
    this.storeUpdateCallback = callback;
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
          
          // Update connection health on each heartbeat
          this.updateConnectionHealth(deviceId);
          
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

  // Get connection health summary
  getConnectionHealthSummary(): { healthy: number; unhealthy: number; total: number } {
    let healthy = 0;
    let unhealthy = 0;
    
    for (const [deviceId] of this.connectionHealth) {
      if (this.isConnectionHealthy(deviceId)) {
        healthy++;
      } else {
        unhealthy++;
      }
    }
    
    return {
      healthy,
      unhealthy,
      total: healthy + unhealthy
    };
  }

  // Connection health monitoring
  updateConnectionHealth(deviceId: string): void {
    this.connectionHealth.set(deviceId, {
      lastHeartbeat: new Date(),
      isHealthy: true
    });
  }

  getConnectionHealth(deviceId: string): { lastHeartbeat: Date; isHealthy: boolean } | undefined {
    return this.connectionHealth.get(deviceId);
  }

  getAllConnectionHealth(): Map<string, { lastHeartbeat: Date; isHealthy: boolean }> {
    return new Map(this.connectionHealth);
  }

  // Check if connection is healthy (no heartbeat for 30 seconds)
  isConnectionHealthy(deviceId: string): boolean {
    const health = this.connectionHealth.get(deviceId);
    if (!health) return false;
    
    const timeSinceLastHeartbeat = Date.now() - health.lastHeartbeat.getTime();
    return timeSinceLastHeartbeat < 30000; // 30 seconds
  }

  // Mark connection as unhealthy
  markConnectionUnhealthy(deviceId: string): void {
    const health = this.connectionHealth.get(deviceId);
    if (health) {
      this.connectionHealth.set(deviceId, {
        ...health,
        isHealthy: false
      });
    }
  }

  // Rate-limited warning logging
  private logWarningWithCooldown(deviceId: string, message: string): void {
    const now = Date.now();
    const lastWarning = this.lastWarningTime.get(deviceId) || 0;
    
    if (now - lastWarning > this.warningCooldown) {
      console.warn(message);
      this.lastWarningTime.set(deviceId, now);
    }
  }

  // Automatic reconnection logic
  async attemptReconnection(deviceId: string): Promise<boolean> {
    const attempts = this.connectionAttempts.get(deviceId) || 0;
    
    if (attempts >= this.maxReconnectionAttempts) {
      this.logWarningWithCooldown(deviceId, `Max reconnection attempts reached for device ${deviceId}. Connection marked as unhealthy.`);
      this.markConnectionUnhealthy(deviceId);
      return false;
    }

    // Only log first attempt to reduce noise
    if (attempts === 0) {
      console.log(`Attempting reconnection for device ${deviceId}`);
    }
    
    try {
      // Clear existing timer
      const existingTimer = this.reconnectionTimers.get(deviceId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Wait before attempting reconnection
      await new Promise(resolve => {
        const timer = setTimeout(resolve, this.reconnectionDelay);
        this.reconnectionTimers.set(deviceId, timer);
      });

      // Attempt to reconnect
      const success = await this.connectToDevice(deviceId);
      
      if (success) {
        this.connectionAttempts.delete(deviceId);
        this.reconnectionTimers.delete(deviceId);
        this.lastWarningTime.delete(deviceId); // Clear warning cooldown on successful reconnect
        console.log(`Successfully reconnected to device ${deviceId}`);
        return true;
      } else {
        this.connectionAttempts.set(deviceId, attempts + 1);
        // Schedule next attempt
        return this.attemptReconnection(deviceId);
      }
    } catch (error) {
      this.logWarningWithCooldown(deviceId, `Reconnection failed for device ${deviceId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.connectionAttempts.set(deviceId, attempts + 1);
      return this.attemptReconnection(deviceId);
    }
  }

  // Start connection health monitoring
  startConnectionHealthMonitoring(): void {
    // Clear existing interval if any
    if (this.healthMonitoringInterval) {
      clearInterval(this.healthMonitoringInterval);
    }
    
    this.healthMonitoringInterval = setInterval(() => {
      for (const [deviceId] of this.connectionHealth) {
        const wasHealthy = this.connectionHealth.get(deviceId)?.isHealthy;
        const isHealthy = this.isConnectionHealthy(deviceId);
        
        // Update health status if it changed
        if (wasHealthy !== isHealthy) {
          if (!isHealthy) {
            this.logWarningWithCooldown(deviceId, `Connection unhealthy for device ${deviceId}. Attempting reconnection...`);
            this.markConnectionUnhealthy(deviceId);
            
            // Update store
            if (this.storeUpdateCallback) {
              this.storeUpdateCallback(deviceId, { isHealthy: false });
            }
            
            // Attempt reconnection if device is still in connected devices
            if (this.connectedDevices.has(deviceId)) {
              this.attemptReconnection(deviceId);
            }
          } else {
            // Connection became healthy again
            this.connectionHealth.set(deviceId, {
              lastHeartbeat: new Date(),
              isHealthy: true
            });
            
            // Update store
            if (this.storeUpdateCallback) {
              this.storeUpdateCallback(deviceId, { isHealthy: true });
            }
          }
        }
      }
    }, 10000); // Check every 10 seconds
  }

  // Stop connection health monitoring
  stopConnectionHealthMonitoring(): void {
    if (this.healthMonitoringInterval) {
      clearInterval(this.healthMonitoringInterval);
      this.healthMonitoringInterval = null;
    }
  }

  // Enhanced connect to device with health monitoring
  async connectToDeviceWithHealthMonitoring(deviceId: string): Promise<boolean> {
    const success = await this.connectToDevice(deviceId);
    
    if (success) {
      this.updateConnectionHealth(deviceId);
    }
    
    return success;
  }

  // Enhanced disconnect with cleanup
  async disconnectFromDeviceWithCleanup(deviceId: string): Promise<void> {
    // Clear reconnection timer
    const timer = this.reconnectionTimers.get(deviceId);
    if (timer) {
      clearTimeout(timer);
      this.reconnectionTimers.delete(deviceId);
    }

    // Clear connection health and warning cooldowns
    this.connectionHealth.delete(deviceId);
    this.connectionAttempts.delete(deviceId);
    this.lastWarningTime.delete(deviceId);

    // Disconnect device
    await this.disconnectFromDevice(deviceId);
  }
}
