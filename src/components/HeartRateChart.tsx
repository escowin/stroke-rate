import { useMemo, memo } from 'react';
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
import type { HeartRateData, Rower } from '../types';

interface HeartRateChartProps {
  data: HeartRateData[];
  rowers: Rower[];
  sessionStartTime?: Date;
  sessionEndTime?: Date;
}

// Color mapping for each seat position
const SEAT_COLORS = {
  1: '#ef4444', // Seat 1 (Bow) - Red
  2: '#3b82f6', // Seat 2 - Blue  
  3: '#10b981', // Seat 3 - Green
  4: '#f59e0b'  // Seat 4 (Stroke) - Orange
} as const;

export const HeartRateChart = memo(({ data, rowers, sessionStartTime, sessionEndTime }: HeartRateChartProps) => {
  const chartData = useMemo(() => {
    if (data.length === 0) return [];

    // Create a copy and sort by timestamp to avoid mutating original data
    const sortedData = [...data].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Use session start time as baseline, or fall back to first data point
    const baselineTime = sessionStartTime?.getTime() || sortedData[0].timestamp.getTime();

    // Group data by timestamp and create unified time series
    const timeGroups = new Map<number, Record<string, number | string>>();

    sortedData.forEach(point => {
      const timeKey = Math.floor((point.timestamp.getTime() - baselineTime) / 1000); // Group by second

      if (!timeGroups.has(timeKey)) {
        timeGroups.set(timeKey, {});
      }

      const group = timeGroups.get(timeKey)!;
      group[`device_${point.deviceId}`] = point.heartRate;
      group.timestampStr = point.timestamp.toLocaleTimeString();
    });

    // Convert to array and use relative time
    const sortedEntries = Array.from(timeGroups.entries()).sort(([a], [b]) => a - b);

    const chartData = sortedEntries.map(([timeKey, values]) => ({
      duration: timeKey,
      ...values
    }));

    return chartData;
  }, [data, sessionStartTime?.getTime(), sessionEndTime?.getTime()]);

  // Calculate session duration and quarter ticks
  const { sessionDuration, xAxisTicks } = useMemo(() => {
    if (chartData.length === 0) return { sessionDuration: 0, xAxisTicks: [] };

    // Use session end time if available, otherwise calculate from data
    let actualDuration: number;
    if (sessionEndTime && sessionStartTime) {
      actualDuration = Math.round((sessionEndTime.getTime() - sessionStartTime.getTime()) / 1000);
    } else {
      // Fall back to data-based calculation, but add 1 to account for the last second
      const maxDuration = Math.max(...chartData.map(d => d.duration));
      actualDuration = maxDuration + 1; // Add 1 because if we have data at second 61, the session is 62 seconds
    }
    
    // Create 4 evenly spaced quarters: 0%, 25%, 50%, 75%, 100%
    const quarterTicks = [
      0,
      Math.round(actualDuration * 0.25),
      Math.round(actualDuration * 0.5),
      Math.round(actualDuration * 0.75),
      actualDuration
    ];

    return { 
      sessionDuration: actualDuration, 
      xAxisTicks: quarterTicks 
    };
  }, [chartData, sessionStartTime, sessionEndTime]);

  // Get rowers with devices and current heart rate data, sorted by seat number
  const activeRowers = useMemo(() => {
    return rowers
      .filter(rower =>
        rower.deviceId && data.some(d => d.deviceId === rower.deviceId)
      )
      .sort((a, b) => a.seat - b.seat); // Sort by seat number (1, 2, 3, 4)
  }, [rowers, data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <article className="heart-rate-tooltip">
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
      </article>
    );
  };

  // Custom legend - sorted by seat number
  const CustomLegend = ({ payload }: any) => {
    if (!payload || payload.length === 0) return null;

    // Sort legend entries by seat number to match our activeRowers sorting
    const sortedEntries = payload
      .map((entry: any) => {
        const deviceId = entry.dataKey.replace('device_', '');
        const rower = activeRowers.find(r => r.deviceId === deviceId);
        return { entry, rower };
      })
      .filter((item: any) => item.rower)
      .sort((a: any, b: any) => a.rower.seat - b.rower.seat);

    return (
      <div className="heart-rate-legend">
        {sortedEntries.map(({ entry, rower }: any) => (
          <div key={entry.dataKey} className="heart-rate-legend-item">
            <div
              className="heart-rate-legend-indicator"
              style={{ backgroundColor: entry.color }}
            />
            <span className="heart-rate-legend-text">
              {rower.name} (Seat {rower.seat})
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Custom x-axis label with session duration
  const CustomXAxisLabel = ({ viewBox }: any) => {
    const { x, y, width, height } = viewBox;
    return (
      <text
        x={x + width / 2}
        y={y + height} // Adjust this value to control spacing
        textAnchor="middle"
        fontSize="12"
        fill="var(--color-blue-light)"
      >
        Session Duration: {sessionDuration}s
      </text>
    );
  };

  if (chartData.length === 0) {
    return (
      <section className="heart-rate-chart">
        <h3 className="heart-rate-chart-title">
          Heart Rate Trend
        </h3>
        <article className="heart-rate-chart-empty">
          <span className="heart-rate-chart-empty-icon">📈</span>
          <p className="heart-rate-chart-empty-text">No session data available</p>
          <p className="heart-rate-chart-empty-subtext">Complete a training session to see heart rate analysis</p>
        </article>
      </section>
    );
  }

  return (
    <section className="heart-rate-chart">
      <header className="heart-rate-chart-header">
        <h3 className="heart-rate-chart-title">
          Session Analysis
        </h3>
        <div className="heart-rate-chart-subtitle">
          {activeRowers.length} rower{activeRowers.length !== 1 ? 's' : ''} active
        </div>
      </header>

      <article className="heart-rate-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-blue-light)" />
            <XAxis
              dataKey="duration"
              tick={{ fontSize: 11, fill: 'var(--color-blue-light)' }}
              tickLine={{ stroke: 'var(--color-blue-light)' }}
              axisLine={{ stroke: 'var(--color-blue-light)' }}
              domain={['dataMin', 'dataMax']}
              ticks={xAxisTicks} // Use custom calculated ticks
              label={<CustomXAxisLabel />}
            />
            <YAxis
              domain={[80, 200]}
              tick={{ fontSize: 12, fill: 'var(--color-blue-light)' }}
              tickLine={{ stroke: 'var(--color-blue-light)' }}
              axisLine={{ stroke: 'var(--color-blue-light)' }}
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
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2 }}
                animationDuration={1000} // Quick initial render animation
                animationEasing="ease-out"
                isAnimationActive={true} // Animate only on initial render
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </article>
    </section>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.data === nextProps.data &&
    prevProps.rowers === nextProps.rowers &&
    prevProps.sessionStartTime?.getTime() === nextProps.sessionStartTime?.getTime() &&
    prevProps.sessionEndTime?.getTime() === nextProps.sessionEndTime?.getTime()
  );
});
