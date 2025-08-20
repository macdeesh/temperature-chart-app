// FILE: src/components/ChartArea.tsx
// Main chart area using ECharts with zoom/pan functionality
import { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { createChartOption } from '../lib/chartConfig';
import type { TemperatureDataPoint, ChartDisplayMode } from '../types';
import type { TimeMapping } from '../types/csv';

interface ChannelConfig {
  id: number;
  label: string;
  visible: boolean;
  color: string;
}

interface ChartAreaProps {
  data: TemperatureDataPoint[];
  channels: ChannelConfig[];
  displayMode: ChartDisplayMode;
  isDark?: boolean;
  timeMapping: TimeMapping[];
}

const ChartArea = forwardRef<any, ChartAreaProps>(({
  data,
  channels,
  displayMode,
  isDark = false,
  timeMapping
}, ref) => {
  const chartRef = useRef<ReactECharts>(null);

  useImperativeHandle(ref, () => chartRef.current);

  const option = createChartOption(data, channels, displayMode, isDark, timeMapping);

  // Force chart update when channels change (visibility/color)
  useEffect(() => {
    if (chartRef.current) {
      const chartInstance = chartRef.current.getEchartsInstance();
      if (chartInstance) {
        chartInstance.setOption(option, true); // true = replace completely
      }
    }
  }, [channels, displayMode, isDark, data, timeMapping]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div 
        id="temperature-chart"
        style={{ 
          width: '100%', 
          height: '100%', 
          border: `1px solid ${isDark ? '#4B5563' : '#E0E0E0'}`,
          borderRadius: '12px',
          backgroundColor: isDark ? '#111827' : '#FFFFFF',
          overflow: 'hidden'
        }}
      >
        <ReactECharts
          ref={chartRef}
          option={option}
          style={{ width: '100%', height: '100%', borderRadius: '12px' }}
          opts={{ renderer: 'canvas' }}
        />
      </div>
    </div>
  );
});

ChartArea.displayName = 'ChartArea';

export default ChartArea;