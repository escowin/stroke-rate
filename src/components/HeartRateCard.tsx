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
    <div className="heart-rate-card">
      {/* Header */}
      <div className="heart-rate-card-header">
        <div className="heart-rate-card-info">
          <h3 className="heart-rate-card-name">
            {rower.name}
          </h3>
          <p className="heart-rate-card-seat">
            Seat {rower.seat}
          </p>
        </div>
        <div className="heart-rate-card-status">
          <StatusIcon className={`heart-rate-card-status-icon ${
            connectionStatus.status === 'connected' ? 'heart-rate-card-status-icon--connected' :
            connectionStatus.status === 'connecting' ? 'heart-rate-card-status-icon--connecting' :
            'heart-rate-card-status-icon--disconnected'
          }`} />
          <Battery0Icon className="heart-rate-card-battery-icon" />
        </div>
      </div>

      {/* Heart Rate Display */}
      <div className="heart-rate-display">
        <div className="heart-rate-value-container">
          <HeartIcon className="heart-rate-icon" />
          <div 
            className="heart-rate-value"
            style={{ color: zoneColor }}
          >
            {heartRate || '--'}
          </div>
          <div className="heart-rate-unit">BPM</div>
        </div>
        
        <div 
          className="heart-rate-zone-badge"
          style={{ backgroundColor: zoneColor }}
        >
          {zone}
        </div>
      </div>

      {/* Zone Progress */}
      {heartRate && (
        <div className="heart-rate-zone-progress">
          <div className="heart-rate-zone-labels">
            <span>Recovery</span>
            <span>Anaerobic</span>
          </div>
          <div className="heart-rate-progress-bar">
            <div 
              className="heart-rate-progress-fill"
              style={{ 
                backgroundColor: zoneColor,
                width: `${Math.min(100, ((heartRate - 60) / (190 - 60)) * 100)}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Last Update */}
      <div className="heart-rate-last-update">
        {lastUpdate 
          ? `Updated ${lastUpdate.toLocaleTimeString()}`
          : 'No data received'
        }
      </div>
    </div>
  );
};
