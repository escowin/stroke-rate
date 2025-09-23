import { useAppStore } from '../store';
import { 
  WifiIcon, 
  SignalSlashIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export const ConnectionStatus = () => {
  const { connectionStatus } = useAppStore();
  
  const { 
    isScanning, 
    connectedDevices, 
    availableDevices, 
    hasSpeedCoachConflicts,
    conflicts 
  } = connectionStatus;

  const getStatusColor = () => {
    if (hasSpeedCoachConflicts) return 'text-yellow-600';
    if (connectedDevices.length > 0) return 'text-green-600';
    if (isScanning) return 'text-blue-600';
    return 'text-gray-600';
  };

  const getStatusIcon = () => {
    if (hasSpeedCoachConflicts) return ExclamationTriangleIcon;
    if (connectedDevices.length > 0) return CheckCircleIcon;
    if (isScanning) return WifiIcon;
    return SignalSlashIcon;
  };

  const getStatusText = () => {
    if (hasSpeedCoachConflicts) return 'SpeedCoach conflicts detected';
    if (connectedDevices.length > 0) return `${connectedDevices.length} device(s) connected`;
    if (isScanning) return 'Scanning for devices...';
    return 'No devices connected';
  };

  const StatusIcon = getStatusIcon();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <StatusIcon className={`h-5 w-5 ${getStatusColor()}`} />
          <div>
            <p className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </p>
            {availableDevices.length > 0 && (
              <p className="text-xs text-gray-500">
                {availableDevices.length} device(s) available
              </p>
            )}
          </div>
        </div>

        {/* Device List */}
        {connectedDevices.length > 0 && (
          <div className="flex space-x-2">
            {connectedDevices.map((device) => (
              <div
                key={device.id}
                className="flex items-center space-x-1 px-2 py-1 bg-green-100 rounded-full"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs text-green-700 font-medium">
                  {device.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SpeedCoach Conflicts */}
      {hasSpeedCoachConflicts && conflicts.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-start space-x-2">
            <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mt-0.5" />
            <div className="text-sm">
              <p className="text-yellow-800 font-medium">
                Connection conflicts detected:
              </p>
              <ul className="mt-1 text-yellow-700">
                {conflicts.map((conflict) => (
                  <li key={conflict.deviceId} className="text-xs">
                    • {conflict.deviceName} is connected to SpeedCoach
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
