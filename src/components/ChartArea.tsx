// FILE: src/components/ChartArea.tsx
// Main chart area using ECharts with zoom/pan functionality
import { forwardRef, useImperativeHandle, useRef, useEffect, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { createChartOption } from '../lib/chartConfig';
import type { TemperatureDataPoint, ChartDisplayMode } from '../types';
import type { TimeMapping, ReconstructedTimePoint } from '../types/csv';

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
  reconstructedTime?: ReconstructedTimePoint[];
  logoUrl?: string;
  clientName?: string;
}

const ChartArea = forwardRef<any, ChartAreaProps>(({
  data,
  channels,
  displayMode,
  isDark = false,
  timeMapping,
  reconstructedTime = [],
  logoUrl,
  clientName
}, ref) => {
  const chartRef = useRef<ReactECharts>(null);

  useImperativeHandle(ref, () => chartRef.current);

  // Create stable dependencies for expensive chart option generation
  const channelSignature = useMemo(() => 
    channels.map(c => `${c.id}-${c.visible}-${c.color}-${c.label}`).join('|'), 
    [channels]
  );
  
  const option = useMemo(() => 
    createChartOption(data, channels, displayMode, isDark, timeMapping, reconstructedTime, logoUrl, clientName),
    [data, channelSignature, displayMode, isDark, timeMapping, reconstructedTime, logoUrl, clientName]
  );

  // Use a previous values ref to detect what specifically changed
  const prevValues = useRef({ channels, displayMode, isDark, logoUrl, clientName });
  


  // Smart update that only changes what's needed without full re-render
  useEffect(() => {
    if (!chartRef.current) return;
    
    const chartInstance = chartRef.current.getEchartsInstance();
    if (!chartInstance) return;

    const prev = prevValues.current;
    
    // Check if only UI elements changed (not data)
    const onlyUIChanged = (
      data === data && // Data reference didn't change
      timeMapping === timeMapping && // Time mapping didn't change
      reconstructedTime === reconstructedTime && // Reconstructed time didn't change
      (
        prev.channels !== channels ||
        prev.displayMode !== displayMode ||  
        prev.isDark !== isDark ||
        prev.logoUrl !== logoUrl ||
        prev.clientName !== clientName
      )
    );

    if (onlyUIChanged) {
      // Partial update for UI-only changes to preserve zoom
      const partialOption: any = {};
      
      if (prev.channels !== channels) {
        partialOption.series = option.series;
        partialOption.legend = option.legend;
      }
      
      if (prev.isDark !== isDark) {
        partialOption.backgroundColor = option.backgroundColor;
        partialOption.xAxis = { ...option.xAxis };
        partialOption.yAxis = { ...option.yAxis };
      }
      
      if (prev.logoUrl !== logoUrl || prev.clientName !== clientName) {
        partialOption.graphic = option.graphic;
      }

      if (prev.displayMode !== displayMode) {
        partialOption.series = option.series;
      }

      // Use partial update to preserve zoom
      chartInstance.setOption(partialOption, false); // false = merge, don't replace
    } else {
      // Full update for data changes
      chartInstance.setOption(option, true);
    }

    // Update previous values
    prevValues.current = { channels, displayMode, isDark, logoUrl, clientName };
  }, [option, channels, displayMode, isDark, logoUrl, clientName, data, timeMapping, reconstructedTime]);

  // Handle visibility changes to prevent chart size flickering
  useEffect(() => {
    if (!chartRef.current) return;
    
    const chartInstance = chartRef.current.getEchartsInstance();
    if (!chartInstance) return;

    // Use ResizeObserver to detect when the chart container becomes visible
    const chartContainer = chartInstance.getDom()?.parentElement;
    if (!chartContainer) return;

    const resizeObserver = new ResizeObserver(() => {
      // Small delay to ensure container is fully visible
      setTimeout(() => {
        chartInstance.resize();
      }, 50);
    });

    resizeObserver.observe(chartContainer);

    return () => {
      resizeObserver.disconnect();
    };
  }, [data]); // Re-run when data changes

  // Mouse cursor feedback for dragging
  useEffect(() => {
    if (!chartRef.current) return;
    
    const chartInstance = chartRef.current.getEchartsInstance();
    if (!chartInstance) return;

    // Wait for chart to fully render
    setTimeout(() => {
      const chartDom = chartInstance.getDom();
      if (!chartDom) return;

      // Find the actual canvas element where dragging happens
      const canvasElements = chartDom.querySelectorAll('canvas');
      const targetElement = canvasElements[0] || chartDom;

      // Remove the default grab cursor - let ECharts handle hover states
      targetElement.style.setProperty('cursor', '', 'important');

      let isDragging = false;

      const handleMouseDown = () => {
        isDragging = true;
        targetElement.style.setProperty('cursor', 'grabbing', 'important');
        
        // Add temporary global listeners for drag end
        const handleGlobalMouseUp = () => {
          isDragging = false;
          targetElement.style.setProperty('cursor', '', 'important'); // Reset to default
          document.removeEventListener('mouseup', handleGlobalMouseUp);
          document.removeEventListener('mousemove', handleGlobalMouseMove);
        };
        
        const handleGlobalMouseMove = () => {
          if (isDragging) {
            targetElement.style.setProperty('cursor', 'grabbing', 'important');
          }
        };
        
        document.addEventListener('mouseup', handleGlobalMouseUp);
        document.addEventListener('mousemove', handleGlobalMouseMove);
      };

      const handleMouseMove = () => {
        // Only show grab cursor if we're not over a data point and not dragging
        if (!isDragging) {
          // Let ECharts handle cursor for data points, we'll only override for empty areas
          targetElement.style.setProperty('cursor', '', 'important');
        }
      };

      targetElement.addEventListener('mousedown', handleMouseDown);
      targetElement.addEventListener('mousemove', handleMouseMove);

      return () => {
        targetElement.removeEventListener('mousedown', handleMouseDown);
        targetElement.removeEventListener('mousemove', handleMouseMove);
      };
    }, 100);
  }, [data, channels]); // Re-run when chart updates

  // Prevent horizontal trackpad scroll from triggering zoom
  useEffect(() => {
    if (!chartRef.current) return;
    
    const chartInstance = chartRef.current.getEchartsInstance();
    if (!chartInstance) return;

    const chartDom = chartInstance.getDom();
    if (!chartDom) return;

    const handleWheel = (event: WheelEvent) => {
      const isHorizontalScroll = Math.abs(event.deltaX) > Math.abs(event.deltaY);
      
      // Only prevent horizontal trackpad scrolling when Shift is NOT pressed
      // Temperature axis uses Shift+VERTICAL scroll, not horizontal
      if (isHorizontalScroll && !event.shiftKey) {
        event.stopPropagation(); // Stop ECharts from seeing this event
        return;
      }
      // Let ECharts handle:
      // - Vertical scroll (without Shift) for time axis zoom  
      // - Shift+vertical scroll for temperature axis zoom
      // - Allow Shift+horizontal scroll to pass through (though not used)
    };

    chartDom.addEventListener('wheel', handleWheel, { capture: true });

    return () => {
      chartDom.removeEventListener('wheel', handleWheel);
    };
  }, [data]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!chartRef.current) return;
      
      const chartInstance = chartRef.current.getEchartsInstance();
      if (!chartInstance) return;

      const currentOption = chartInstance.getOption();
      const xDataZoom = (currentOption.dataZoom as any)?.[0];
      const yDataZoom = (currentOption.dataZoom as any)?.[1];

      if (!xDataZoom || !yDataZoom) return;

      let handled = false;
      const panStep = 5; // Percentage to pan

      switch (event.key) {
        case 'ArrowLeft':
          // Pan left
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            const newStart = Math.max(0, xDataZoom.start - panStep);
            const newEnd = Math.max(panStep, xDataZoom.end - panStep);
            chartInstance.dispatchAction({
              type: 'dataZoom',
              dataZoomIndex: 0,
              start: newStart,
              end: newEnd
            });
            handled = true;
          }
          break;

        case 'ArrowRight':
          // Pan right
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            const newStart = Math.min(100 - panStep, xDataZoom.start + panStep);
            const newEnd = Math.min(100, xDataZoom.end + panStep);
            chartInstance.dispatchAction({
              type: 'dataZoom',
              dataZoomIndex: 0,
              start: newStart,
              end: newEnd
            });
            handled = true;
          }
          break;

        case 'ArrowUp':
          // Pan up (higher temperatures)
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            const newStart = Math.min(100 - panStep, yDataZoom.start + panStep);
            const newEnd = Math.min(100, yDataZoom.end + panStep);
            chartInstance.dispatchAction({
              type: 'dataZoom',
              dataZoomIndex: 1,
              start: newStart,
              end: newEnd
            });
            handled = true;
          }
          break;

        case 'ArrowDown':
          // Pan down (lower temperatures)
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            const newStart = Math.max(0, yDataZoom.start - panStep);
            const newEnd = Math.max(panStep, yDataZoom.end - panStep);
            chartInstance.dispatchAction({
              type: 'dataZoom',
              dataZoomIndex: 1,
              start: newStart,
              end: newEnd
            });
            handled = true;
          }
          break;

        case '+':
        case '=':
          // Zoom in
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            const xCenter = (xDataZoom.start + xDataZoom.end) / 2;
            const yCenter = (yDataZoom.start + yDataZoom.end) / 2;
            
            chartInstance.dispatchAction({
              type: 'dataZoom',
              dataZoomIndex: 0,
              start: xCenter - (xDataZoom.end - xDataZoom.start) * 0.4,
              end: xCenter + (xDataZoom.end - xDataZoom.start) * 0.4
            });
            
            chartInstance.dispatchAction({
              type: 'dataZoom',
              dataZoomIndex: 1,
              start: yCenter - (yDataZoom.end - yDataZoom.start) * 0.4,
              end: yCenter + (yDataZoom.end - yDataZoom.start) * 0.4
            });
            handled = true;
          }
          break;

        case '-':
          // Zoom out
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            const xCenter = (xDataZoom.start + xDataZoom.end) / 2;
            const yCenter = (yDataZoom.start + yDataZoom.end) / 2;
            
            const newXRange = Math.min(100, (xDataZoom.end - xDataZoom.start) * 1.25);
            const newYRange = Math.min(100, (yDataZoom.end - yDataZoom.start) * 1.25);
            
            chartInstance.dispatchAction({
              type: 'dataZoom',
              dataZoomIndex: 0,
              start: Math.max(0, xCenter - newXRange / 2),
              end: Math.min(100, xCenter + newXRange / 2)
            });
            
            chartInstance.dispatchAction({
              type: 'dataZoom',
              dataZoomIndex: 1,
              start: Math.max(0, yCenter - newYRange / 2),
              end: Math.min(100, yCenter + newYRange / 2)
            });
            handled = true;
          }
          break;

        case '0':
          // Reset zoom
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            chartInstance.dispatchAction({
              type: 'dataZoom',
              dataZoomIndex: 0,
              start: 0,
              end: 100
            });
            chartInstance.dispatchAction({
              type: 'dataZoom',
              dataZoomIndex: 1,
              start: 0,
              end: 100
            });
            handled = true;
          }
          break;
      }

      if (handled) {
        event.stopPropagation();
      }
    };

    // Add event listener to document when chart is focused
    const chartElement = chartRef.current?.ele;
    if (chartElement) {
      chartElement.setAttribute('tabindex', '0'); // Make focusable
      chartElement.addEventListener('keydown', handleKeyDown);
      
      return () => {
        chartElement.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, []);


  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div 
        id="temperature-chart"
        style={{ 
          width: '100%', 
          height: '100%', 
          border: `1px solid ${isDark ? '#4B5563' : '#E0E0E0'}`,
          borderRadius: '12px',
          backgroundColor: isDark ? '#111827' : '#FFFFFF',
          overflow: 'hidden',
          cursor: 'grab'
        }}
        onFocus={(e) => {
          e.currentTarget.style.outline = `2px solid ${isDark ? '#60A5FA' : '#3B82F6'}`;
          e.currentTarget.style.outlineOffset = '2px';
        }}
        onBlur={(e) => {
          e.currentTarget.style.outline = 'none';
        }}
        tabIndex={0}
        title="Click to focus, then use Ctrl+Arrow keys to navigate, Ctrl +/- to zoom, Ctrl+0 to reset"
      >
        <ReactECharts
          key="temp-chart" // Stable key to prevent re-mounting
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