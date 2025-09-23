import type { Rower, HeartRateZones } from '../types';
import { useHeartRateZones } from '../hooks/useHeartRateZones';
import { 
  HeartIcon, 
  Battery0Icon,
  SignalIcon,
  SignalSlashIcon
} from '@heroicons/react/24/outline';

interface HeartRateCardProps {
  rower: Rower;
  zones: HeartRateZones;
}

export const HeartRateCard = ({ rower }: HeartRateCardProps) => {
  const { getZoneColor, getZoneName } = useHeartRateZones();
  
  const heartRate = rower.currentHeartRate?.heartRate;
  const zone = heartRate ? getZoneName(heartRate) : 'No Data';
  const zoneColor = heartRate ? getZoneColor(heartRate) : '#6b7280';
  const lastUpdate = rower.currentHeartRate?.timestamp;

  const getConnectionStatus = () => {
    if (!rower.deviceId) return { status: 'disconnected', icon: SignalSlashIcon, color: 'text-gray-400' };
    if (heartRate) return { status: 'connected', icon: SignalIcon, color: 'text-green-500' };
    return { status: 'connecting', icon: SignalIcon, color: 'text-yellow-500' };
  };

  const connectionStatus = getConnectionStatus();
  const StatusIcon = connectionStatus.icon;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {rower.name}
          </h3>
          <p className="text-sm text-gray-500">
            Seat {rower.seat}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <StatusIcon className={`h-5 w-5 ${connectionStatus.color}`} />
          <Battery0Icon className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Heart Rate Display */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center mb-2">
          <HeartIcon className="h-8 w-8 text-red-500 mr-2" />
          <div 
            className="text-4xl font-bold"
            style={{ color: zoneColor }}
          >
            {heartRate || '--'}
          </div>
          <div className="text-sm text-gray-500 ml-2">BPM</div>
        </div>
        
        <div 
          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
          style={{ backgroundColor: zoneColor }}
        >
          {zone}
        </div>
      </div>

      {/* Zone Progress */}
      {heartRate && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Recovery</span>
            <span>Anaerobic</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                backgroundColor: zoneColor,
                width: `${Math.min(100, ((heartRate - 60) / (190 - 60)) * 100)}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Last Update */}
      <div className="text-xs text-gray-400 text-center">
        {lastUpdate 
          ? `Updated ${lastUpdate.toLocaleTimeString()}`
          : 'No data received'
        }
      </div>
    </div>
  );
};
