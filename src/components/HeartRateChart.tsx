import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { HeartRateData, HeartRateZones } from '../types';
// import { useHeartRateZones } from '../hooks/useHeartRateZones';

interface HeartRateChartProps {
  data: HeartRateData[];
  zones: HeartRateZones;
  maxDataPoints?: number;
}

export const HeartRateChart = ({ data, zones, maxDataPoints = 50 }: HeartRateChartProps) => {
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
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">
            Heart Rate: {data.heartRate} BPM
          </p>
          <p className="text-xs text-gray-500">
            Zone: {data.zone}
          </p>
          <p className="text-xs text-gray-500">
            Time: {data.timestamp}
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Heart Rate Trend
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📈</div>
            <p>No heart rate data available</p>
            <p className="text-sm">Connect a device to see real-time trends</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Heart Rate Trend
      </h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#d1d5db' }}
              axisLine={{ stroke: '#d1d5db' }}
            />
            <YAxis 
              domain={[60, 200]}
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#d1d5db' }}
              axisLine={{ stroke: '#d1d5db' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="heartRate"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Zone Indicators */}
      <div className="mt-4 flex justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: zones.recovery.color }} />
          <span>Recovery</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: zones.aerobic.color }} />
          <span>Aerobic</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: zones.threshold.color }} />
          <span>Threshold</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: zones.anaerobic.color }} />
          <span>Anaerobic</span>
        </div>
      </div>
    </div>
  );
};
