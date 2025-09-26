import type { Rower, HeartRateZones } from '../types';
import { useHeartRateZones } from '../hooks/useHeartRateZones';
import { 
  HeartIcon, 
  Battery0Icon,
  SignalIcon,
  SignalSlashIcon
} from '@heroicons/react/24/outline';
import { HeartRateAccessibility, generateId } from '../utils/accessibility';

interface HeartRateCardProps {
  rower: Rower;
  zones: HeartRateZones;
}

export const HeartRateCard = ({ rower }: HeartRateCardProps) => {
  const { getZoneColor, getZoneName, zones } = useHeartRateZones(rower);
  
  const heartRate = rower.currentHeartRate?.heartRate;
  const zone = heartRate ? getZoneName(heartRate) : 'No Data';
  const zoneColor = heartRate ? getZoneColor(heartRate) : '#6b7280';
  const lastUpdate = rower.currentHeartRate?.timestamp;

  // Generate unique IDs for accessibility
  const cardId = generateId(`heart-rate-card-${rower.id}`);
  const heartRateId = generateId(`heart-rate-${rower.id}`);
  const zoneId = generateId(`zone-${rower.id}`);
  const connectionId = generateId(`connection-${rower.id}`);
  const batteryId = generateId(`battery-${rower.id}`);

  const getConnectionStatus = () => {
    if (!rower.deviceId) return { status: 'disconnected', icon: SignalSlashIcon, color: 'text-gray-400' };
    if (heartRate) return { status: 'connected', icon: SignalIcon, color: 'text-green-500' };
    return { status: 'connecting', icon: SignalIcon, color: 'text-yellow-500' };
  };

  const getBatteryStatus = () => {
    const batteryLevel = rower.currentHeartRate?.batteryLevel;
    if (batteryLevel === undefined) return { level: null, color: 'text-gray-400' };
    if (batteryLevel <= 20) return { level: batteryLevel, color: 'text-red-500' };
    if (batteryLevel <= 50) return { level: batteryLevel, color: 'text-yellow-500' };
    return { level: batteryLevel, color: 'text-green-500' };
  };

  const connectionStatus = getConnectionStatus();
  const batteryStatus = getBatteryStatus();
  const StatusIcon = connectionStatus.icon;

  // Generate accessible descriptions
  const heartRateDescription = heartRate 
    ? HeartRateAccessibility.getHeartRateDescription(heartRate, zone, rower.name)
    : `${rower.name} heart rate: No data available`;
  
  const zoneDescription = heartRate 
    ? HeartRateAccessibility.getZoneDescription(zone, heartRate)
    : `${rower.name} heart rate zone: No data available`;
  
  const connectionDescription = HeartRateAccessibility.getConnectionStatusDescription(
    connectionStatus.status === 'connected',
    rower.name
  );

  return (
    <article 
      className="heart-rate-card"
      id={cardId}
      role="region"
      aria-labelledby={`${cardId}-name`}
      aria-describedby={`${heartRateId} ${zoneId} ${connectionId} ${batteryId}`}
    >
      {/* Header */}
      <header className="heart-rate-card-header">
        <div className="heart-rate-card-info">
          <h3 
            className="heart-rate-card-name"
            id={`${cardId}-name`}
          >
            {rower.name}
          </h3>
          <p className="heart-rate-card-seat">
            Seat {rower.seat}
          </p>
        </div>
        <div 
          className="heart-rate-card-status"
          id={connectionId}
          role="status"
          aria-label={connectionDescription}
        >
          <StatusIcon 
            className={`heart-rate-card-status-icon ${
              connectionStatus.status === 'connected' ? 'heart-rate-card-status-icon--connected' :
              connectionStatus.status === 'connecting' ? 'heart-rate-card-status-icon--connecting' :
              'heart-rate-card-status-icon--disconnected'
            }`}
            aria-hidden="true"
          />
          <Battery0Icon 
            className={`heart-rate-card-battery-icon ${batteryStatus.color}`}
            aria-hidden="true"
          />
          <span className="sr-only">{connectionDescription}</span>
        </div>
      </header>

      {/* Heart Rate Display */}
      <div className="heart-rate-display">
        <div 
          className="heart-rate-value-container"
          id={heartRateId}
          role="status"
          aria-label={heartRateDescription}
        >
          <HeartIcon 
            className="heart-rate-icon"
            aria-hidden="true"
          />
          <div 
            className="heart-rate-value"
            style={{ color: zoneColor }}
          >
            {heartRate || '--'}
          </div>
          <div className="heart-rate-unit">BPM</div>
          <span className="sr-only">{heartRateDescription}</span>
        </div>
        
        <div 
          className="heart-rate-zone-badge"
          id={zoneId}
          role="status"
          aria-label={zoneDescription}
          style={{ backgroundColor: zoneColor }}
        >
          {zone}
          <span className="sr-only">{zoneDescription}</span>
        </div>
      </div>

      {/* Zone Progress */}
      {heartRate && (
        <div className="heart-rate-zone-progress">
          <label htmlFor={`progress-bar-${rower.id}`} className="heart-rate-zone-labels">
            <span>{zones.recovery.min}</span>
            <span>{zones.anaerobic.max}</span>
          </label>
          <progress 
            id={`progress-bar-${rower.id}`}
            className="heart-rate-progress-bar"
            max={zones.anaerobic.max - zones.recovery.min}
            value={heartRate - zones.recovery.min}
            style={{ '--zone-color': zoneColor } as React.CSSProperties}
            aria-label={`Heart rate progress: ${heartRate} BPM in ${zone} zone`}
          >
            {heartRate} BPM
          </progress>
        </div>
      )}

      {/* Battery Status */}
      <div 
        className="heart-rate-battery-status"
        id={batteryId}
        role="status"
        aria-label={batteryStatus.level !== null 
          ? `${rower.name} heart rate monitor battery: ${batteryStatus.level}%`
          : `${rower.name} heart rate monitor battery: Unknown`
        }
      >
        <Battery0Icon 
          className={`heart-rate-battery-icon ${batteryStatus.color}`}
          aria-hidden="true"
        />
        <span className="heart-rate-battery-level">
          {batteryStatus.level !== null ? `${batteryStatus.level}%` : '--'}
        </span>
        <span className="sr-only">
          {batteryStatus.level !== null 
            ? `Battery level: ${batteryStatus.level}%`
            : 'Battery level: Unknown'
          }
        </span>
      </div>

      {/* Last Update */}
      <div 
        className="heart-rate-last-update"
        aria-label={lastUpdate 
          ? `Last heart rate update: ${lastUpdate.toLocaleTimeString()}`
          : 'No heart rate data received'
        }
      >
        {lastUpdate 
          ? `Updated ${lastUpdate.toLocaleTimeString()}`
          : 'No data received'
        }
      </div>
    </article>
  );
};
