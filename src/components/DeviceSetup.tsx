import { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { useBluetooth } from '../hooks/useBluetooth';
import type { BluetoothDevice, Rower } from '../types';
import { 
  WifiIcon, 
  PlusIcon, 
  TrashIcon,
  UserIcon,
  SignalIcon,
  ExclamationTriangleIcon
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
    addManualConflict
  } = useBluetooth();
  
  const [newRowerName, setNewRowerName] = useState('');
  const [selectedSeat, setSelectedSeat] = useState(1);

  const availableSeats = [1, 2, 3, 4].filter(seat => 
    !rowers.some(rower => rower.seat === seat)
  );

  // Update selectedSeat when available seats change
  useEffect(() => {
    if (availableSeats.length > 0 && !availableSeats.includes(selectedSeat)) {
      setSelectedSeat(availableSeats[0]);
    }
  }, [availableSeats, selectedSeat]);

  const handleScanForDevices = async () => {
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
        seat: availableSeats[0],
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

  return (
    <div className="space-y-6">
      {/* Device Discovery */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Heart Rate Devices
          </h2>
          <button
            onClick={handleScanForDevices}
            disabled={isScanning}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <WifiIcon className="h-4 w-4 mr-2" />
            {isScanning ? 'Scanning...' : 'Scan for Devices'}
          </button>
        </div>

        {/* Available Devices */}
        {connectionStatus.availableDevices.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Available Devices</h3>
            {connectionStatus.availableDevices.map((device) => (
              <div
                key={device.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <SignalIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {device.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {device.id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleConnectDevice(device)}
                  className="px-3 py-1 text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Connect
                </button>
              </div>
            ))}
          </div>
        )}

        {/* No Heart Rate Devices Found */}
        {connectionStatus.availableDevices.length === 0 && !isScanning && (
          <div className="space-y-3">
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-yellow-800">
                    No heart rate devices found
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    This could mean your heart rate device is connected to SpeedCoach. 
                    If you know your device is connected to SpeedCoach, you can report it below.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Report SpeedCoach Conflict</h4>
              <p className="text-xs text-blue-700 mb-3">
                If you know your heart rate device (like Whoop 4.0) is connected to SpeedCoach, 
                click the button below to report it:
              </p>
              <button
                onClick={() => addManualConflict('Whoop 4.0')}
                className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Report Whoop 4.0 Connected to SpeedCoach
              </button>
            </div>
          </div>
        )}

        {/* Debug Information */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Debug Information</h4>
            <div className="text-xs text-blue-700 space-y-1">
              <p>Known Devices: {getKnownDevices().length}</p>
              <p>Conflicts Detected: {connectionStatus.conflicts.length}</p>
              <p>Has SpeedCoach Conflicts: {connectionStatus.hasSpeedCoachConflicts ? 'Yes' : 'No'}</p>
              <button
                onClick={clearKnownDevices}
                className="mt-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Clear Known Devices
              </button>
            </div>
          </div>
        )}

        {/* Connected Devices */}
        {connectionStatus.connectedDevices.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Connected Devices</h3>
            {connectionStatus.connectedDevices.map((device) => (
              <div
                key={device.id}
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {device.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Connected
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDisconnectDevice(device.id)}
                  className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Disconnect
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rower Management */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Rower Setup
        </h2>

        {/* Add New Rower */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Rower</h3>
          <div className="flex space-x-3">
            <input
              type="text"
              placeholder="Rower name"
              value={newRowerName}
              onChange={(e) => setNewRowerName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <select
              value={selectedSeat}
              onChange={(e) => setSelectedSeat(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add
            </button>
          </div>
        </div>

        {/* Rower List */}
        {rowers.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Configured Rowers</h3>
            {rowers.map((rower) => (
              <div
                key={rower.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {rower.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Seat {rower.seat}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Device Assignment */}
                  <select
                    value={rower.deviceId || ''}
                    onChange={(e) => handleAssignDevice(rower.id, e.target.value)}
                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">No device</option>
                    {connectionStatus.connectedDevices.map((device) => (
                      <option key={device.id} value={device.id}>
                        {device.name}
                      </option>
                    ))}
                  </select>
                  
                  <button
                    onClick={() => handleRemoveRower(rower.id)}
                    className="p-1 text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
