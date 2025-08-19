// FILE: src/components/ChartArea.tsx
// Main chart area using ECharts with zoom/pan functionality
import { forwardRef, useImperativeHandle, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { createChartOption } from '../lib/chartConfig';
import type { TemperatureDataPoint, ChannelConfig, ChartDisplayMode } from '../types';

interface ChartAreaProps {
  data: TemperatureDataPoint[];
  channels: ChannelConfig[];
  displayMode: ChartDisplayMode;
  isDark?: boolean;
}

const ChartArea = forwardRef<any, ChartAreaProps>(({
  data,
  channels,
  displayMode,
  isDark = false
}, ref) => {
  const chartRef = useRef<ReactECharts>(null);

  useImperativeHandle(ref, () => chartRef.current);

  const option = createChartOption(data, channels, displayMode, isDark);

  return (
    <div style={{ width: '100%', height: '100%', padding: '16px' }}>
      <div 
        id="temperature-chart"
        style={{ 
          width: '100%', 
          height: '100%', 
          border: '1px solid #E0E0E0',
          borderRadius: '8px'
        }}
      >
        <ReactECharts
          ref={chartRef}
          option={option}
          style={{ width: '100%', height: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
      </div>
    </div>
  );
});

ChartArea.displayName = 'ChartArea';

export default ChartArea;