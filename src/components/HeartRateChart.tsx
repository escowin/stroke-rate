import { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import type { HeartRateData } from '../types';
// import { useHeartRateZones } from '../hooks/useHeartRateZones';

interface HeartRateChartProps {
  data: HeartRateData[];
  maxDataPoints?: number;
}

export const HeartRateChart = ({ data, maxDataPoints = 50 }: HeartRateChartProps) => {
  // const { getZoneColor } = useHeartRateZones();

  const chartData = useMemo(() => {
    // Take only the last maxDataPoints data points
    const recentData = data.slice(-maxDataPoints);
    
    return recentData.map((point, index) => ({
      time: index,
      heartRate: point.heartRate,
      zone: point.zone,
      timestamp: point.timestamp.toLocaleTimeString()
    }));
  }, [data, maxDataPoints]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="heart-rate-tooltip">
          <p className="heart-rate-tooltip-title">
            Heart Rate: {data.heartRate} BPM
          </p>
          <p className="heart-rate-tooltip-text">
            Zone: {data.zone}
          </p>
          <p className="heart-rate-tooltip-text">
            Time: {data.timestamp}
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="heart-rate-chart">
        <h3 className="heart-rate-chart-title">
          Heart Rate Trend
        </h3>
        <div className="heart-rate-chart-empty">
          <div className="heart-rate-chart-empty-content">
            <div className="heart-rate-chart-empty-icon">📈</div>
            <p className="heart-rate-chart-empty-text">No heart rate data available</p>
            <p className="heart-rate-chart-empty-subtext">Connect a device to see real-time trends</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="heart-rate-chart">
      <h3 className="heart-rate-chart-title">
        Heart Rate Trend
      </h3>
      
      <div className="heart-rate-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
            <XAxis 
              dataKey="time" 
              tick={false}
              tickLine={{ stroke: 'var(--border-secondary)' }}
              axisLine={{ stroke: 'var(--border-secondary)' }}
              label={{ value: 'Time', position: 'outsideBottom', offset: 10, style: { textAnchor: 'middle', fontSize: 12, fill: 'var(--text-tertiary)' } }}
            />
            <YAxis 
              domain={[60, 200]}
              tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }}
              tickLine={{ stroke: 'var(--border-secondary)' }}
              axisLine={{ stroke: 'var(--border-secondary)' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="heartRate"
              stroke="var(--btn-primary)"
              strokeWidth={2}
              dot={{ fill: 'var(--btn-primary)', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'var(--btn-primary)', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
