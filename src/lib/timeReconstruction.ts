// Smart time reconstruction for CSV data with/without seconds
// Future-proof solution that handles mixed timestamp formats

export interface ReconstructedTimePoint {
  originalIndex: number;
  displayTime: string; // "HH:MM"
  actualTime: string;  // "HH:MM:SS"
  isoTimestamp: string; // ISO timestamp for ECharts time axis
  timeInSeconds: number; // Total seconds from start for charting
  hasOriginalSeconds: boolean; // Whether seconds came from CSV or were reconstructed
}

/**
 * Detect timestamp format in CSV data
 */
function detectTimeFormat(timeString: string): 'HH:MM:SS' | 'HH:MM' | 'unknown' {
  const parts = timeString.trim().split(':');
  if (parts.length === 3) return 'HH:MM:SS';
  if (parts.length === 2) return 'HH:MM';
  return 'unknown';
}

/**
 * Parse time string to seconds from start of day
 */
function parseTimeToSeconds(timeString: string): number {
  const parts = timeString.split(':').map(Number);
  const hours = parts[0] || 0;
  const minutes = parts[1] || 0;
  const seconds = parts[2] || 0;
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Format seconds back to time string
 */
function formatSecondsToTime(totalSeconds: number, includeSeconds: boolean = true): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (includeSeconds) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  } else {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
}

/**
 * Create ISO timestamp from time string using a fixed base date
 */
function createISOTimestamp(timeString: string, baseDate: string = '2024-01-01'): string {
  // Handle both HH:MM and HH:MM:SS formats
  const timeParts = timeString.split(':');
  const hours = timeParts[0];
  const minutes = timeParts[1];  
  const seconds = timeParts[2] || '00';
  
  return `${baseDate}T${hours}:${minutes}:${seconds}Z`;
}

/**
 * Smart time reconstruction with gap handling for discontinuous data
 */
export function reconstructTimeAxis(timeMapping: Array<{index: number, displayTime: string, originalTime: string}>): ReconstructedTimePoint[] {
  if (timeMapping.length === 0) return [];
  
  const reconstructedPoints: ReconstructedTimePoint[] = [];
  const baseDate = '2024-01-01';
  
  // Parse original timestamps to detect actual time patterns
  const parsedTimes = timeMapping.map(tm => {
    // Parse "15/07/2021 10:38:00" format
    const parts = tm.originalTime.split(' ');
    if (parts.length >= 2) {
      const timePart = parts[1]; // "10:38:00" or "10:38"
      const timeComponents = timePart.split(':');
      
      const hours = parseInt(timeComponents[0]) || 0;
      const minutes = parseInt(timeComponents[1]) || 0;
      const seconds = parseInt(timeComponents[2]) || 0;
      
      return {
        ...tm,
        hours,
        minutes,
        seconds,
        totalSeconds: hours * 3600 + minutes * 60 + seconds
      };
    }
    return null;
  }).filter(Boolean);
  
  if (parsedTimes.length === 0) return [];
  
  console.log('Parsed time data:', {
    first: parsedTimes[0],
    last: parsedTimes[parsedTimes.length - 1],
    sample: parsedTimes.slice(0, 5)
  });
  
  // Create reconstructed points with proper ISO timestamps
  parsedTimes.forEach((pt, index) => {
    const hours = String(pt.hours).padStart(2, '0');
    const minutes = String(pt.minutes).padStart(2, '0');
    const seconds = String(pt.seconds).padStart(2, '0');
    
    const actualTime = `${hours}:${minutes}:${seconds}`;
    const displayTime = `${hours}:${minutes}`;
    const isoTimestamp = `${baseDate}T${actualTime}Z`;
    
    reconstructedPoints.push({
      originalIndex: pt.index,
      displayTime,
      actualTime,
      isoTimestamp,
      timeInSeconds: pt.totalSeconds,
      hasOriginalSeconds: pt.seconds > 0 // True if CSV had seconds
    });
  });
  
  return reconstructedPoints;
}

/**
 * Generate smart time axis labels based on reconstructed timeline
 */
export function generateSmartTimeLabels(
  reconstructedPoints: ReconstructedTimePoint[]
): Array<{value: number, label: string}> {
  if (reconstructedPoints.length === 0) return [];
  
  const startTime = reconstructedPoints[0].timeInSeconds;
  const endTime = reconstructedPoints[reconstructedPoints.length - 1].timeInSeconds;
  const totalSpanSeconds = endTime - startTime;
  
  // Determine if we have sub-minute precision in our data
  const hasSubMinutePrecision = reconstructedPoints.some(p => p.timeInSeconds % 60 !== 0);
  
  // Choose optimal interval based on data span and precision
  const possibleIntervals = hasSubMinutePrecision ? [
    600,  // 10 minutes
    300,  // 5 minutes  
    120,  // 2 minutes
    60,   // 1 minute
    30,   // 30 seconds
    20,   // 20 seconds
    10    // 10 seconds
  ] : [
    1800, // 30 minutes
    900,  // 15 minutes
    600,  // 10 minutes
    300,  // 5 minutes  
    120,  // 2 minutes
    60    // 1 minute
  ];
  
  let bestInterval = possibleIntervals[0];
  for (const interval of possibleIntervals) {
    const divisions = totalSpanSeconds / interval;
    if (divisions >= 4 && divisions <= 12) {
      bestInterval = interval;
      break;
    }
  }
  
  // Generate labels at consistent intervals
  const labels: Array<{value: number, label: string}> = [];
  const startRounded = Math.floor(startTime / bestInterval) * bestInterval;
  
  for (let time = startRounded; time <= endTime + bestInterval; time += bestInterval) {
    let label: string;
    if (bestInterval >= 60) {
      // Show only hours:minutes for intervals >= 1 minute
      label = formatSecondsToTime(time, false);
    } else {
      // Show hours:minutes:seconds for sub-minute intervals
      label = formatSecondsToTime(time, true);
    }
    
    labels.push({ value: time, label });
  }
  
  return labels;
}

/**
 * Get minor graduation intervals for ruler-like display
 */
export function getMinorGraduations(majorInterval: number): number {
  if (majorInterval >= 600) return 2; // 10min intervals → 2 minor (5min graduations)
  if (majorInterval >= 300) return 5; // 5min intervals → 5 minor (1min graduations)  
  if (majorInterval >= 120) return 4; // 2min intervals → 4 minor (30s graduations)
  if (majorInterval >= 60) return 6;  // 1min intervals → 6 minor (10s graduations)
  if (majorInterval >= 30) return 3;  // 30s intervals → 3 minor (10s graduations)
  if (majorInterval >= 20) return 4;  // 20s intervals → 4 minor (5s graduations)
  return 2; // 10s intervals → 2 minor (5s graduations)
}

/**
 * Create gap-filled time series data for ECharts with proper discontinuities
 * Adds 2-minute buffer after last data point for better visual spacing
 */
export function createGapFilledTimeSeries(
  temperatureData: Array<{time: number, temperature: number, channel: number}>,
  reconstructedTime: ReconstructedTimePoint[],
  channelId: number
): Array<[string, number | null]> {
  // Filter data for specific channel
  const channelData = temperatureData.filter(d => d.channel === channelId);
  
  if (channelData.length === 0) return [];
  
  // Create map of data point index to temperature
  const dataMap = new Map<number, number>();
  channelData.forEach(d => {
    dataMap.set(d.time, d.temperature);
  });
  
  const result: Array<[string, number | null]> = [];
  let lastValidTime: number | null = null;
  let lastTimestamp: string | null = null;
  
  reconstructedTime.forEach((timePoint) => {
    const temperature = dataMap.get(timePoint.originalIndex);
    
    if (temperature !== undefined) {
      // Check for significant time gap (more than 2 minutes)
      if (lastValidTime !== null) {
        const timeDiff = timePoint.timeInSeconds - lastValidTime;
        const gapThreshold = 120; // 2 minutes in seconds
        
        if (timeDiff > gapThreshold) {
          // Insert a null value to break the line before the new data point
          const gapTime = new Date(new Date(timePoint.isoTimestamp).getTime() - 1000).toISOString();
          result.push([gapTime, null]);
        }
      }
      
      result.push([timePoint.isoTimestamp, temperature]);
      lastValidTime = timePoint.timeInSeconds;
      lastTimestamp = timePoint.isoTimestamp;
    }
  });
  
  // Add 2-minute buffer after last data point for better visual spacing
  if (lastTimestamp && result.length > 0) {
    const lastTime = new Date(lastTimestamp);
    const bufferTime = new Date(lastTime.getTime() + 2 * 60 * 1000); // Add 2 minutes
    result.push([bufferTime.toISOString(), null]); // Add invisible point to extend axis
  }
  
  console.log(`Channel ${channelId} gap-filled data:`, {
    originalPoints: channelData.length,
    resultPoints: result.length,
    gaps: result.filter(([, temp]) => temp === null).length,
    lastDataTime: lastTimestamp,
    bufferExtension: lastTimestamp ? new Date(new Date(lastTimestamp).getTime() + 2 * 60 * 1000).toISOString() : null
  });
  
  return result;
}