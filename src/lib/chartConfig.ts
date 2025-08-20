// ECharts configuration - scatter+line hybrid, Y=-100..1400 with 25° major, 10° minor

import type { EChartsOption } from 'echarts';
import type { TemperatureDataPoint, ChartDisplayMode } from '../types';
import type { TimeMapping } from '../types/csv';

interface ChannelConfig {
  id: number;
  label: string;
  visible: boolean;
  color: string;
}


export function createChartOption(
  data: TemperatureDataPoint[],
  channels: ChannelConfig[],
  displayMode: ChartDisplayMode,
  isDark: boolean = false,
  timeMapping: TimeMapping[] = []
): EChartsOption {
  const visibleChannels = channels.filter(c => c.visible);
  
  // Group data by channel
  const seriesData = visibleChannels.map(channel => {
    const channelData = data
      .filter(d => d.channel === channel.id)
      .map(d => [d.time, d.temperature] as [number, number])
      .sort((a, b) => a[0] - b[0]); // Sort by time

    const baseConfig = {
      name: channel.label,
      data: channelData,
      color: channel.color,
      symbolSize: 4,
      lineStyle: { width: 2 }
    };

    // Return series based on display mode
    switch (displayMode.type) {
      case 'scatter':
        return { ...baseConfig, type: 'scatter' as const };
      case 'line':
        return { ...baseConfig, type: 'line' as const, symbol: 'none' };
      case 'both':
      default:
        return { ...baseConfig, type: 'line' as const, showSymbol: true };
    }
  });


  const textColor = isDark ? '#FFFFFF' : '#333333';
  const gridColor = isDark ? '#404040' : '#E0E0E0';
  const backgroundColor = isDark ? '#1E1E1E' : '#FFFFFF';

  return {
    backgroundColor,
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const [timeIndex, temp] = params.data;
        const mapping = timeMapping.find(tm => tm.index === timeIndex);
        const displayTime = mapping ? mapping.displayTime : `${timeIndex}s`;
        
        // Calculate trend indicator
        const channelId = visibleChannels.find(ch => ch.label === params.seriesName)?.id;
        let trendIndicator = '';
        
        if (channelId) {
          const channelData = data
            .filter(d => d.channel === channelId)
            .sort((a, b) => a.time - b.time);
          
          const currentIndex = channelData.findIndex(d => d.time === timeIndex);
          
          if (currentIndex > 0) {
            const prevTemp = channelData[currentIndex - 1].temperature;
            const currentTemp = channelData[currentIndex].temperature;
            const tempDiff = currentTemp - prevTemp;
            
            if (tempDiff > 1) {
              trendIndicator = ' ↗️ Rising';
            } else if (tempDiff < -1) {
              trendIndicator = ' ↘️ Falling';
            } else {
              trendIndicator = ' → Stable';
            }
          }
        }
        
        return `${params.seriesName}<br/>Time: ${displayTime}<br/>Temperature: ${temp}°C${trendIndicator}`;
      }
    },
    legend: {
      type: 'scroll',
      orient: 'horizontal',
      bottom: 10,
      textStyle: { color: textColor }
    },
    grid: {
      left: 80,
      right: 40,
      top: 40,
      bottom: 80
    },
    xAxis: {
      type: 'value',
      name: 'Time',
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: { color: textColor },
      axisLine: { lineStyle: { color: textColor } },
      axisTick: { lineStyle: { color: textColor } },
      axisLabel: { 
        color: textColor,
        formatter: (value: number) => {
          // Always round to nearest integer to avoid decimals
          const roundedValue = Math.round(value);
          const mapping = timeMapping.find(tm => tm.index === roundedValue);
          
          if (mapping) {
            return mapping.displayTime;
          }
          
          // For padding values beyond our data, extrapolate realistic times
          if (timeMapping.length > 0) {
            const lastMapping = timeMapping[timeMapping.length - 1];
            const extraMinutes = Math.round(roundedValue - lastMapping.index);
            if (extraMinutes > 0) {
              const [hours, minutes] = lastMapping.displayTime.split(':');
              const totalMinutes = parseInt(hours) * 60 + parseInt(minutes) + extraMinutes;
              const newHours = Math.floor(totalMinutes / 60);
              const newMinutes = totalMinutes % 60;
              return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
            }
          }
          
          return roundedValue.toString();
        }
      },
      splitLine: { lineStyle: { color: gridColor } },
      splitNumber: 8, // Limit to ~8 major tick marks for cleaner display
      min: (value: any) => Math.max(0, value.min - 1),
      max: (value: any) => {
        // Add padding after last time point - about 10% of data range
        const range = value.max - value.min;
        const padding = Math.max(2, Math.round(range * 0.1));
        return value.max + padding;
      }
    },
    yAxis: {
      type: 'value',
      name: 'Temperature (°C)',
      nameLocation: 'middle',
      nameGap: 50,
      nameTextStyle: { color: textColor },
      min: -100,
      max: 1400,
      interval: 25, // 25° major intervals
      axisLine: { lineStyle: { color: textColor } },
      axisTick: { lineStyle: { color: textColor } },
      axisLabel: { color: textColor },
      splitLine: { lineStyle: { color: gridColor } }
    },
    series: seriesData,
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: 0,
        filterMode: 'none',
        minValueSpan: 5, // Minimum zoom shows 5 data points
        maxValueSpan: data.length + 10, // Maximum zoom shows all data plus padding
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        preventDefaultMouseMove: false
      },
      {
        type: 'inside',
        yAxisIndex: 0,
        filterMode: 'none',
        minValueSpan: 50, // Minimum 50°C range
        zoomOnMouseWheel: 'shift', // Only zoom Y-axis with Shift+scroll
        moveOnMouseMove: false
      }
    ]
  };
}