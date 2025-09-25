import { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { useBluetooth } from '../hooks/useBluetooth';
import { useConnectionHealth } from '../hooks/useConnectionHealth';
import type { BluetoothDevice, Rower } from '../types';
import {
  WifiIcon,
  PlusIcon,
  TrashIcon,
  UserIcon,
  SignalIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export const DeviceSetup = () => {
  const {
    connectionStatus,
    rowers,
    addRower,
    // updateRower, 
    removeRower,
    assignDeviceToRower
  } = useAppStore();

  const {
    scanForDevices,
    connectToDevice,
    disconnectFromDevice,
    isScanning,
    clearKnownDevices,
    getKnownDevices,
    attemptReconnection
  } = useBluetooth();

  const { getDeviceHealthStatus } = useConnectionHealth();

  const [newRowerName, setNewRowerName] = useState('');
  const [selectedSeat, setSelectedSeat] = useState(1);
  const [hasScanned, setHasScanned] = useState(false);

  const availableSeats = [1, 2, 3, 4].filter(seat =>
    !rowers.some(rower => rower.seat === seat)
  );

  // Filter out connected devices from available devices
  const unconnectedAvailableDevices = connectionStatus.availableDevices.filter(device =>
    !connectionStatus.connectedDevices.some(connected => connected.id === device.id)
  );

  // Update selectedSeat when available seats change
  useEffect(() => {
    if (availableSeats.length > 0 && !availableSeats.includes(selectedSeat)) {
      setSelectedSeat(availableSeats[0]);
    }
  }, [availableSeats, selectedSeat]);

  const handleScanForDevices = async () => {
    setHasScanned(true);
    await scanForDevices();
  };

  const handleConnectDevice = async (device: BluetoothDevice) => {
    await connectToDevice(device);
  };

  const handleDisconnectDevice = async (deviceId: string) => {
    await disconnectFromDevice(deviceId);
  };

  const handleAddRower = () => {
    if (newRowerName.trim() && availableSeats.length > 0) {
      const rower: Rower = {
        id: `rower-${Date.now()}`,
        name: newRowerName.trim(),
        seat: selectedSeat,
        targetZones: {
          recovery: { name: 'Recovery', min: 60, max: 120, color: '#10b981', description: 'Active recovery' },
          aerobic: { name: 'Aerobic', min: 120, max: 150, color: '#3b82f6', description: 'Base aerobic' },
          threshold: { name: 'Threshold', min: 150, max: 170, color: '#f59e0b', description: 'Lactate threshold' },
          anaerobic: { name: 'Anaerobic', min: 170, max: 190, color: '#ef4444', description: 'High intensity' }
        }
      };

      addRower(rower);
      setNewRowerName('');
      setSelectedSeat(availableSeats[0] || 1);
    }
  };

  const handleAssignDevice = (rowerId: string, deviceId: string) => {
    assignDeviceToRower(rowerId, deviceId);
  };

  const handleRemoveRower = (rowerId: string) => {
    const rower = rowers.find(r => r.id === rowerId);
    if (rower?.deviceId) {
      handleDisconnectDevice(rower.deviceId);
    }
    removeRower(rowerId);
  };


  const handleConnectAllAvailable = async () => {
    for (const device of unconnectedAvailableDevices) {
      await handleConnectDevice(device);
    }
  };

  // Use the optimized getDeviceHealthStatus from the hook

  return (
    <>
      {/* Device Discovery */}
      <section className="device-discovery">
        <article className="device-discovery-header">
          <h2 className="device-discovery-title">
            Heart Rate Devices
          </h2>
          {unconnectedAvailableDevices.length > 0 && (
            <button
              onClick={handleConnectAllAvailable}
              className="btn btn-secondary"
            >
              <CheckCircleIcon className="btn-icon" />
              Connect All
            </button>
          )}
          <button
            onClick={handleScanForDevices}
            disabled={isScanning}
            className="btn btn-primary"
          >
            <WifiIcon className="btn-icon" />
            {isScanning ? 'Scanning...' : 'Scan for Devices'}
          </button>
        </article>

        {/* Available Devices */}
        {unconnectedAvailableDevices.length > 0 && (
          <article className="device-list">
            <h3 className="device-list-title">Available Devices</h3>
            {unconnectedAvailableDevices.map((device) => (
              <div
                key={device.id}
                className="device-item"
              >
                <div className="device-item-info">
                  <SignalIcon className="device-item-icon" />
                  <p className="device-item-details">
                    <span className="device-item-name">
                      {device.name}
                    </span>
                    <span className="device-item-id">
                      {device.id}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => handleConnectDevice(device)}
                  className="device-item-connect-button"
                >
                  Connect
                </button>
              </div>
            ))}
          </article>
        )}

        {/* No Heart Rate Devices Found */}
        {hasScanned && unconnectedAvailableDevices.length === 0 && !isScanning && connectionStatus.connectedDevices.length === 0 && (
          <article className="no-devices-warning">
            {/* <div className="no-devices-warning-content"> */}
              <ExclamationTriangleIcon className="no-devices-warning-icon" />
              <div className="no-devices-warning-text">
                <h3 className="no-devices-warning-title">
                  No heart rate devices found
                </h3>
                <p className="no-devices-warning-description">
                  This may mean heart rate devices are connected to SpeedCoach.
                  Ask rowers to disconnect their devices from SpeedCoach, then scan again.
                </p>
              </div>
            {/* </div> */}
          </article>
        )}

        {/* Debug Information */}
        {process.env.NODE_ENV === 'development' && (
          <article className="debug-info">
            <h4 className="debug-info-title">Debug Information</h4>
            <div className="debug-info-content">
              <p className="debug-info-item">Known Devices: {getKnownDevices().length}</p>
              <p className="debug-info-item">Conflicts Detected: {connectionStatus.conflicts.length}</p>
              <p className="debug-info-item">Has SpeedCoach Conflicts: {connectionStatus.hasSpeedCoachConflicts ? 'Yes' : 'No'}</p>
              <button
                onClick={clearKnownDevices}
                className="debug-clear-button"
              >
                Clear Known Devices
              </button>
            </div>
          </article>
        )}

        {/* Connected Devices */}
        {connectionStatus.connectedDevices.length > 0 && (
          <article className="connected-devices">
            <h3 className="connected-devices-title">Connected Devices</h3>
            {connectionStatus.connectedDevices.map((device) => {
              const healthStatus = getDeviceHealthStatus(device.id);
              const isHealthy = healthStatus.status === 'healthy';

              return (
                <div
                  key={device.id}
                  className={`connected-device-item ${isHealthy ? 'connected-device-item--healthy' : 'connected-device-item--unhealthy'
                    }`}
                >
                  <div className="connected-device-info">
                    <span className={`connected-device-status-indicator ${isHealthy ? 'connected-device-status-indicator--healthy' : 'connected-device-status-indicator--unhealthy'
                      }`} />
                    <p className="connected-device-details">
                      <span className="connected-device-name">
                        {device.name}
                      </span>
                      <span className={`connected-device-status ${isHealthy ? 'connected-device-status--healthy' : 'connected-device-status--unhealthy'
                        }`}>
                        {isHealthy ? 'Connected & Healthy' : 'Connected (Unhealthy)'}
                      </span>
                    </p>
                  </div>
                  <div className="connected-device-actions">
                    {!isHealthy && (
                      <>
                        <ExclamationCircleIcon className="connected-device-warning-icon" />
                        <button
                          onClick={() => attemptReconnection(device.id)}
                          className="connected-device-retry-button"
                          title="Retry connection"
                        >
                          <ArrowPathIcon className="connected-device-retry-icon" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDisconnectDevice(device.id)}
                      className="connected-device-disconnect-button"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              );
            })}
          </article>
        )}
      </section>

      {/* Rower Management */}
      <section className="card-base rower-management">
        <h2 className="rower-management-title">
          Rower Setup
        </h2>

        {/* Add New Rower */}
        <article className="add-rower-section">
          <h3 className="add-rower-title">Add New Rower</h3>
          <div className="add-rower-form">
            <input
              type="text"
              placeholder="Rower name"
              value={newRowerName}
              onChange={(e) => setNewRowerName(e.target.value)}
              className="add-rower-name-input"
            />
            <select
              value={selectedSeat}
              onChange={(e) => setSelectedSeat(Number(e.target.value))}
              className="add-rower-seat-select"
            >
              {availableSeats.map(seat => (
                <option key={seat} value={seat}>
                  Seat {seat}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddRower}
              disabled={!newRowerName.trim() || availableSeats.length === 0}
              className="btn btn-primary"
            >
              <PlusIcon className="btn-icon" />
              Add
            </button>
          </div>
        </article>

        {/* Rower List */}
        {rowers.length > 0 && (
          <article className="rower-list">
            <h3 className="rower-list-title">Configured Rowers</h3>
            {rowers.map((rower) => (
              <div
                key={rower.id}
                className="rower-item"
              >
                <div className="rower-item-info">
                  <UserIcon className="rower-item-icon" />
                  <div className="rower-item-details">
                    <p className="rower-item-name">
                      {rower.name}
                    </p>
                    <p className="rower-item-seat">
                      Seat {rower.seat}
                    </p>
                  </div>
                </div>

                <div className="rower-item-actions">
                  {/* Device Assignment */}
                  <div className="rower-device-assignment">
                    <select
                      value={rower.deviceId || ''}
                      onChange={(e) => handleAssignDevice(rower.id, e.target.value)}
                      className="rower-device-select"
                    >
                      <option value="">No device</option>
                      {connectionStatus.connectedDevices.map((device) => {
                        const healthStatus = getDeviceHealthStatus(device.id);
                        const isHealthy = healthStatus.status === 'healthy';
                        return (
                          <option key={device.id} value={device.id}>
                            {device.name} {isHealthy ? '✓' : '⚠'}
                          </option>
                        );
                      })}
                    </select>

                    {/* Device Health Indicator */}
                    {rower.deviceId && (
                      <div className="rower-device-health">
                        {(() => {
                          const healthStatus = getDeviceHealthStatus(rower.deviceId);
                          const isHealthy = healthStatus.status === 'healthy';
                          return (
                            <>
                              <div className={`rower-device-health-indicator ${isHealthy ? 'rower-device-health-indicator--healthy' : 'rower-device-health-indicator--unhealthy'
                                }`} />
                              <span className={`rower-device-health-text ${isHealthy ? 'rower-device-health-text--healthy' : 'rower-device-health-text--unhealthy'
                                }`}>
                                {isHealthy ? 'Healthy' : 'Unhealthy'}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleRemoveRower(rower.id)}
                    className="rower-remove-button"
                  >
                    <TrashIcon className="rower-remove-icon" />
                  </button>
                </div>
              </div>
            ))}
          </article>
        )}
      </section>
    </>
  );
};
