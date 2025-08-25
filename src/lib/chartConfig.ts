// ECharts configuration - scatter+line hybrid with smart scaling for v1.1

import type { EChartsOption } from 'echarts';
import type { TemperatureDataPoint, ChartDisplayMode } from '../types';
import type { TimeMapping, ReconstructedTimePoint } from '../types/csv';
import { calculateTemperatureScale } from './chartScaling';
import { createGapFilledTimeSeries } from './timeReconstruction';
import { addTrendIndicators } from '../utils/trendUtils';

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
  timeMapping: TimeMapping[] = [],
  reconstructedTime: ReconstructedTimePoint[] = [],
  logoUrl?: string,
  clientName?: string
): EChartsOption {
  const visibleChannels = channels.filter(c => c.visible);
  
  console.log('Chart data setup:', {
    dataPoints: data.length,
    visibleChannels: visibleChannels.length,
    reconstructedTimePoints: reconstructedTime.length,
    timeMappingPoints: timeMapping.length
  });
  
  // Create gap-filled series data using native time axis
  const seriesData = visibleChannels.map(channel => {
    const gapFilledData = createGapFilledTimeSeries(data, reconstructedTime, channel.id);
    
    // Add trend indicators using optimized utility function
    const dataWithTrends = addTrendIndicators(gapFilledData);
    
    console.log(`Channel ${channel.id} (${channel.label}):`, {
      originalDataPoints: data.filter(d => d.channel === channel.id).length,
      gapFilledPoints: gapFilledData.length,
      nullGaps: gapFilledData.filter(([, temp]) => temp === null).length
    });

    const baseConfig = {
      name: channel.label,
      data: dataWithTrends,
      color: channel.color,
      symbolSize: 5, // Increased from 4 to 5 for better visibility
      lineStyle: { width: 2 },
      connectNulls: false, // Important: don't connect across null gaps
      animation: true,
      animationDuration: 800,
      animationEasing: 'cubicOut' as const
    };

    // Return series based on display mode
    switch (displayMode.type) {
      case 'scatter':
        return { 
          ...baseConfig, 
          type: 'scatter' as const,
          itemStyle: {
            borderColor: isDark ? '#FFFFFF' : '#333333', // White border in dark mode, dark in light mode
            borderWidth: 0.5 // Minimalist thin border
          }
        };
      case 'line':
        return { ...baseConfig, type: 'line' as const, symbol: 'none', showSymbol: false };
      case 'both':
      default:
        return { 
          ...baseConfig, 
          type: 'line' as const, 
          symbol: 'circle', // Explicitly set symbol type
          showSymbol: true,
          symbolSize: 5, // Consistent with base config
          itemStyle: {
            borderColor: isDark ? '#FFFFFF' : '#333333', // White border in dark mode, dark in light mode
            borderWidth: 0.5 // Minimalist thin border
          }
        };
    }
  });


  const textColor = isDark ? '#FFFFFF' : '#333333';
  const gridColor = isDark ? '#404040' : '#E0E0E0';
  const backgroundColor = isDark ? '#1E1E1E' : '#FFFFFF';
  
  // Calculate temperature range for smart scaling
  const allTemps = data.map(d => d.temperature);
  const dataMin = allTemps.length > 0 ? Math.min(...allTemps) : -100;
  const dataMax = allTemps.length > 0 ? Math.max(...allTemps) : 1400;
  const tempScale = calculateTemperatureScale(dataMin, dataMax);
  
  // Note: Time range is now handled by ECharts native time axis
  // using ISO timestamps from reconstructedTime data

  // Create logo watermark graphic
  const logoGraphic = {
    type: 'group',
    right: 20,
    bottom: 10, // 10px from bottom edge
    children: [
      // Logo image (custom or default app icon)
      {
        type: 'image',
        style: {
          image: logoUrl || '/app-icon.png', // Use custom logo or default app icon
          width: 24,
          height: 24,
          opacity: 0.7
        },
        z: 100
      },
      // Client name text
      {
        type: 'text',
        style: {
          text: clientName || 'VizTherm',
          x: 30, // Position next to logo
          y: 12, // Center vertically with logo
          textAlign: 'left',
          textVerticalAlign: 'middle',
          fontSize: 11,
          fontWeight: 'normal',
          fill: isDark ? '#FFFFFF' : '#333333',
          opacity: 0.6
        },
        z: 100
      }
    ]
  };

  return {
    animation: true, // Enable animations for line drawing
    animationDuration: 800, // Smooth line drawing animation
    animationEasing: 'cubicOut',
    // Disable specific animations that cause flicker
    animationDurationUpdate: 0, // No animation for updates to prevent flicker
    lazyUpdate: false, // Force synchronous updates
    backgroundColor,
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const dataPoint = params.data;
        const [timestamp, temp, trendIndicator] = dataPoint;
        
        if (temp === null) return ''; // Don't show tooltip for gap markers
        
        // Parse timestamp to show readable time
        const date = new Date(timestamp);
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = date.getUTCSeconds();
        
        let displayTime = `${hours}:${minutes}`;
        if (seconds > 0) {
          displayTime += `:${String(seconds).padStart(2, '0')}`;
        }
        
        // Use pre-calculated trend indicator or fallback to stable
        const trend = trendIndicator || '→ Stable';
        
        return `${params.seriesName}<br/>Time: ${displayTime}<br/>Temperature: ${temp}°C<br/>${trend}`;
      }
    },
    legend: {
      type: 'scroll',
      orient: 'horizontal',
      bottom: 10,
      height: 30, // Force fixed height for legend
      textStyle: { color: textColor },
      show: true, // Ensure legend is always shown
      itemStyle: {
        borderColor: isDark ? '#FFFFFF' : '#333333', // Theme-appropriate border for legend symbols
        borderWidth: 0.5 // Minimalist thin border matching chart
      }
    },
    grid: {
      left: 80,
      right: 40, 
      top: 40,
      bottom: 100, // Space for legend + logo
      width: 'auto', // Let ECharts calculate width
      height: 'auto' // Let ECharts calculate height within constraints
    },
    xAxis: {
      type: 'time', // Use ECharts native time axis
      name: 'Time',
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: { color: textColor },
      axisLine: { lineStyle: { color: textColor } },
      axisTick: { 
        show: true,
        length: 8, // Longer ticks for time labels
        lineStyle: { 
          color: isDark ? '#FFFFFF' : '#333333', 
          width: 1.2,
          opacity: 0.9
        },
        inside: false
      },
      axisLabel: { 
        color: textColor,
        formatter: (value: number) => {
          const date = new Date(value);
          const hours = String(date.getUTCHours()).padStart(2, '0');
          const minutes = String(date.getUTCMinutes()).padStart(2, '0');
          const seconds = date.getUTCSeconds();
          
          // Show seconds only for intervals of 10 seconds or larger (no 5-second intervals)
          if (seconds > 0 && seconds % 10 === 0) {
            return `${hours}:${minutes}:${String(seconds).padStart(2, '0')}`;
          } else if (seconds === 0) {
            return `${hours}:${minutes}`;
          } else {
            // For non-10-second intervals, just show minutes
            return `${hours}:${minutes}`;
          }
        }
      },
      splitLine: { 
        show: true,
        lineStyle: { 
          color: gridColor, 
          width: 1.2,
          opacity: isDark ? 0.6 : 0.7,
          type: 'solid'
        } 
      },
      minorTick: {
        show: true,
        splitNumber: 6, // 6 minor divisions per major time interval for precise engineering readings
        length: 5, // Slightly longer for better visibility
        lineStyle: { 
          color: isDark ? '#DDDDDD' : '#555555', 
          width: 0.7, 
          opacity: 1.0 
        }
      },
      minorSplitLine: {
        show: true,
        lineStyle: { 
          color: gridColor, 
          width: 0.6, 
          opacity: isDark ? 0.45 : 0.55,
          type: 'solid'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: 'Temperature',
      nameLocation: 'middle',
      nameGap: 60, // Increased gap between title and temperature labels
      nameTextStyle: { color: textColor },
      min: tempScale.min,
      max: tempScale.max,
      interval: tempScale.interval,
      splitNumber: tempScale.splitNumber,
      axisLine: { lineStyle: { color: textColor } },
      axisTick: { 
        show: true,
        length: 8, // Longer ticks for temperature labels
        lineStyle: { 
          color: isDark ? '#FFFFFF' : '#333333', 
          width: 1.2,
          opacity: 0.9
        },
        inside: false
      },
      axisLabel: { 
        color: textColor,
        margin: 15, // Add margin between axis line and temperature labels
        // Ensure no decimal places on temperature labels
        formatter: (value: number) => {
          const rounded = Math.round(value);
          return `${rounded}°C`;
        }
      },
      splitLine: { 
        show: true,
        lineStyle: { 
          color: gridColor, 
          width: 1.2,
          opacity: isDark ? 0.6 : 0.7,
          type: 'solid'
        } 
      },
      // Professional engineering-style minor ticks for temperature axis
      minorTick: {
        show: true,
        splitNumber: 5, // 5 minor divisions per major interval (every 5°C for 25°C intervals)
        length: 5, // Length of tick marks on axis line only
        lineStyle: { 
          color: isDark ? '#DDDDDD' : '#555555', 
          width: 0.7, 
          opacity: 1.0 
        } // Keep ticks on the axis line, not extending into chart
      },
      minorSplitLine: {
        show: true,
        lineStyle: { 
          color: gridColor, 
          width: 0.6, 
          opacity: isDark ? 0.5 : 0.6,
          type: 'solid'
        }
      }
    },
    series: seriesData,
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: 0,
        filterMode: 'none',
        minValueSpan: 100000, // Minimum zoom shows 1 minute 40 seconds (100 seconds in milliseconds)
        maxValueSpan: undefined, // Allow full zoom out
        zoomOnMouseWheel: true, // Enable default zoom for vertical scroll
        moveOnMouseMove: true,
        preventDefaultMouseMove: false
      },
      {
        type: 'inside',
        yAxisIndex: 0,
        filterMode: 'none',
        minValueSpan: 50, // Minimum 50°C range
        zoomOnMouseWheel: 'shift', // Only zoom Y-axis with Shift+scroll
        moveOnMouseMove: 'shift' // Allow dragging up/down when holding Shift
      }
    ],
    graphic: [logoGraphic]
  };
}