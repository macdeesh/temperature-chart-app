// ECharts configuration - scatter+line hybrid, Y=-100..1400 with 25° major, 10° minor

import type { EChartsOption } from 'echarts';
import type { TemperatureDataPoint, ChannelConfig, ChartDisplayMode } from '../types';

export function createChartOption(
  data: TemperatureDataPoint[],
  channels: ChannelConfig[],
  displayMode: ChartDisplayMode,
  isDark: boolean = false
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
        const [time, temp] = params.data;
        return `${params.seriesName}<br/>Time: ${time}s<br/>Temperature: ${temp}°C`;
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
      name: 'Time (s)',
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: { color: textColor },
      axisLine: { lineStyle: { color: textColor } },
      axisTick: { lineStyle: { color: textColor } },
      axisLabel: { color: textColor },
      splitLine: { lineStyle: { color: gridColor } }
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
        filterMode: 'none'
      },
      {
        type: 'inside',
        yAxisIndex: 0,
        filterMode: 'none'
      }
    ]
  };
}