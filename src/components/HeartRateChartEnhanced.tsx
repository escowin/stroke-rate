import { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import type { HeartRateData } from '../types';
import { useAppStore } from '../store';

interface HeartRateChartEnhancedProps {
  data: HeartRateData[];
  maxDataPoints?: number;
}

// Color mapping for each seat position
const SEAT_COLORS = {
  1: '#ef4444', // Seat 1 (Bow) - Red
  2: '#3b82f6', // Seat 2 - Blue  
  3: '#10b981', // Seat 3 - Green
  4: '#f59e0b'  // Seat 4 (Stroke) - Orange
} as const;

export const HeartRateChartEnhanced = ({ data, maxDataPoints = 50 }: HeartRateChartEnhancedProps) => {
  const { rowers } = useAppStore();

  // Debug logging (can be removed in production)
  // console.log('HeartRateChartEnhanced - data:', data);
  // console.log('HeartRateChartEnhanced - rowers:', rowers);

  // Transform data for multi-device visualization
  const { chartData, activeRowers } = useMemo(() => {
    // console.log('HeartRateChartEnhanced - processing data, length:', data.length);
    
    if (data.length === 0) {
      return { chartData: [], activeRowers: [] };
    }

    // Get rowers with devices and current heart rate data
    const activeRowers = rowers.filter(rower => 
      rower.deviceId && data.some(d => d.deviceId === rower.deviceId)
    );
    
    // console.log('HeartRateChartEnhanced - activeRowers:', activeRowers);
    // console.log('HeartRateChartEnhanced - rowers with deviceIds:', rowers.map(r => ({ name: r.name, deviceId: r.deviceId })));
    // console.log('HeartRateChartEnhanced - unique deviceIds in data:', [...new Set(data.map(d => d.deviceId))]);

    // Group data by timestamp and create unified time series
    const timeGroups = new Map<number, Record<string, number | string>>();
    const recentData = data.slice(-maxDataPoints * activeRowers.length);

    recentData.forEach(point => {
      const timeKey = Math.floor(point.timestamp.getTime() / 1000); // Group by second
      
      if (!timeGroups.has(timeKey)) {
        timeGroups.set(timeKey, {});
      }
      
      const group = timeGroups.get(timeKey)!;
      group[`device_${point.deviceId}`] = point.heartRate;
      group.timestampStr = point.timestamp.toLocaleTimeString();
    });

    // Convert to array and fill missing values
    const chartData = Array.from(timeGroups.entries())
      .sort(([a], [b]) => a - b)
      .slice(-maxDataPoints)
      .map(([timeKey, values], index) => ({
        time: index,
        timeKey,
        ...values
      }));

    // console.log('HeartRateChartEnhanced - timeGroups size:', timeGroups.size);
    // console.log('HeartRateChartEnhanced - chartData length:', chartData.length);
    // console.log('HeartRateChartEnhanced - sample chartData:', chartData[0]);

    return { chartData, activeRowers };
  }, [data, rowers, maxDataPoints]);

  // Custom tooltip with rower identification
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div className="heart-rate-tooltip">
        <p className="heart-rate-tooltip-title">
          Time: {payload[0]?.payload?.timestampStr}
        </p>
        {payload.map((entry: any) => {
          const deviceId = entry.dataKey.replace('device_', '');
          const rower = activeRowers.find(r => r.deviceId === deviceId);
          
          if (!rower || entry.value === undefined) return null;
          
          return (
            <div key={entry.dataKey} className="heart-rate-tooltip-item">
              <div 
                className="heart-rate-tooltip-indicator" 
                style={{ backgroundColor: entry.color }}
              />
              <div>
                <p className="heart-rate-tooltip-text">
                  {rower.name} (Seat {rower.seat}): {entry.value} BPM
                </p>
                <p className="heart-rate-tooltip-text">
                  Zone: {entry.value < 120 ? 'Recovery' : entry.value < 150 ? 'Aerobic' : entry.value < 170 ? 'Threshold' : 'Anaerobic'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Custom legend
  const CustomLegend = ({ payload }: any) => {
    if (!payload || payload.length === 0) return null;

    return (
      <div className="heart-rate-legend">
        {payload.map((entry: any) => {
          const deviceId = entry.dataKey.replace('device_', '');
          const rower = activeRowers.find(r => r.deviceId === deviceId);
          
          if (!rower) return null;
          
          return (
            <div key={entry.dataKey} className="heart-rate-legend-item">
              <div 
                className="heart-rate-legend-indicator" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="heart-rate-legend-text">
                {rower.name} (Seat {rower.seat})
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (chartData.length === 0 || activeRowers.length === 0) {
    return (
      <div className="heart-rate-chart">
        <h3 className="heart-rate-chart-title">
          Heart Rate Trends
        </h3>
        <div className="heart-rate-chart-empty">
          <div className="heart-rate-chart-empty-content">
            <div className="heart-rate-chart-empty-icon">📈</div>
            <p className="heart-rate-chart-empty-text">No heart rate data available</p>
            <p className="heart-rate-chart-empty-subtext">Connect devices and assign them to rowers to see individual trends</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="heart-rate-chart">
      <div className="heart-rate-chart-header">
        <h3 className="heart-rate-chart-title">
          Heart Rate Trends
        </h3>
        <div className="heart-rate-chart-subtitle">
          {activeRowers.length} rower{activeRowers.length !== 1 ? 's' : ''} active
        </div>
      </div>
      
      <div className="heart-rate-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
            <XAxis 
              dataKey="time"
              tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }}
              tickLine={{ stroke: 'var(--border-secondary)' }}
              axisLine={{ stroke: 'var(--border-secondary)' }}
              label={{ 
                value: 'Time', 
                position: 'insideBottom', 
                offset: -10,
                style: { textAnchor: 'middle', fontSize: 12, fill: 'var(--text-tertiary)' } 
              }}
            />
            <YAxis 
              domain={[60, 200]}
              tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }}
              tickLine={{ stroke: 'var(--border-secondary)' }}
              axisLine={{ stroke: 'var(--border-secondary)' }}
              label={{ 
                value: 'Heart Rate (BPM)', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fontSize: 12, fill: 'var(--text-tertiary)' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            
            {/* Render a line for each active rower */}
            {activeRowers.map((rower) => (
              <Line
                key={rower.deviceId}
                type="monotone"
                dataKey={`device_${rower.deviceId}`}
                stroke={SEAT_COLORS[rower.seat as keyof typeof SEAT_COLORS] || '#6b7280'}
                strokeWidth={2}
                name={`${rower.name} (Seat ${rower.seat})`}
                connectNulls={false}
                dot={{ r: 3 }}
                activeDot={{ r: 5, strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Heart Rate Zone Reference */}
      <div className="heart-rate-zone-labels">
        <div className="heart-rate-zone-item">
          <div className="heart-rate-zone-color" style={{ backgroundColor: '#10b981' }} />
          <span className="heart-rate-zone-name">Recovery (60-120)</span>
        </div>
        <div className="heart-rate-zone-item">
          <div className="heart-rate-zone-color" style={{ backgroundColor: '#3b82f6' }} />
          <span className="heart-rate-zone-name">Aerobic (120-150)</span>
        </div>
        <div className="heart-rate-zone-item">
          <div className="heart-rate-zone-color" style={{ backgroundColor: '#f59e0b' }} />
          <span className="heart-rate-zone-name">Threshold (150-170)</span>
        </div>
        <div className="heart-rate-zone-item">
          <div className="heart-rate-zone-color" style={{ backgroundColor: '#ef4444' }} />
          <span className="heart-rate-zone-name">Anaerobic (170+)</span>
        </div>
      </div>
    </div>
  );
};
