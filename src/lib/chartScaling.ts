// Smart chart scaling utilities for Temperature Chart v1.1
// Implements logical interval progression for both temperature and time axes

interface ScaleConfig {
  min: number;
  max: number;
  interval: number;
  splitNumber: number;
}

interface TimeScaleConfig {
  interval: number; // in minutes
  splitNumber: number;
}

/**
 * Calculate optimal temperature scale based on visible data range
 * Progression: 50° → 25° → 10° → 5° (maximum zoom)
 */
export function calculateTemperatureScale(
  dataMin: number, 
  dataMax: number, 
  viewportRange?: number
): ScaleConfig {
  // Full range defaults to -100°C to 1400°C
  let min = -100;
  let max = 1400;
  
  // If we have a specific viewport range (zoomed state), use smart bounds
  if (viewportRange && dataMin !== undefined && dataMax !== undefined) {
    const dataMid = (dataMin + dataMax) / 2;
    const halfRange = viewportRange / 2;
    
    min = Math.max(-100, dataMid - halfRange);
    max = Math.min(1400, dataMid + halfRange);
    
    // Align to nice intervals
    min = Math.floor(min / 25) * 25;
    max = Math.ceil(max / 25) * 25;
  }
  
  const totalRange = max - min;
  let interval: number;
  let splitNumber: number;
  
  // Smart interval selection based on range
  if (totalRange <= 50) {
    interval = 5;   // 5° intervals (maximum zoom)
    splitNumber = Math.ceil(totalRange / interval);
  } else if (totalRange <= 200) {
    interval = 10;  // 10° intervals
    splitNumber = Math.ceil(totalRange / interval);
  } else if (totalRange <= 500) {
    interval = 25;  // 25° intervals  
    splitNumber = Math.ceil(totalRange / interval);
  } else {
    interval = 50;  // 50° intervals (default/zoomed out)
    splitNumber = Math.ceil(totalRange / interval);
  }
  
  // Ensure we don't have too many divisions (max ~20 for readability)
  if (splitNumber > 20) {
    interval = Math.ceil(totalRange / 20 / 5) * 5; // Round to nearest 5
    splitNumber = Math.ceil(totalRange / interval);
  }
  
  return { min, max, interval, splitNumber };
}

/**
 * Calculate optimal time scale based on visible time span
 * Fixed intervals for professional readability: 10min, 5min, 2min, 1min
 */
export function calculateTimeScale(
  timeSpanMinutes: number,
  targetIntervals: number = 8
): TimeScaleConfig {
  // Professional time intervals - always consistent
  const possibleIntervals = [
    30,   // 30min intervals
    20,   // 20min intervals  
    15,   // 15min intervals
    10,   // 10min intervals
    5,    // 5min intervals
    2,    // 2min intervals
    1,    // 1min intervals
    0.5,  // 30s intervals
    0.25  // 15s intervals (max zoom)
  ];
  
  // Find the interval that gives us closest to target number of divisions
  let bestInterval = possibleIntervals[0];
  let bestScore = Math.abs(timeSpanMinutes / possibleIntervals[0] - targetIntervals);
  
  for (const interval of possibleIntervals) {
    const divisions = timeSpanMinutes / interval;
    const score = Math.abs(divisions - targetIntervals);
    
    if (score < bestScore && divisions >= 4 && divisions <= 12) {
      bestScore = score;
      bestInterval = interval;
    }
  }
  
  const splitNumber = Math.ceil(timeSpanMinutes / bestInterval);
  
  return {
    interval: bestInterval,
    splitNumber: Math.min(splitNumber, 12) // Cap at 12 divisions
  };
}

/**
 * Generate nice time labels for axis
 */
export function generateTimeLabels(
  startTime: string,
  intervalMinutes: number,
  count: number
): string[] {
  const labels: string[] = [];
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  let totalMinutes = startHours * 60 + startMinutes;
  
  for (let i = 0; i < count; i++) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    labels.push(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
    totalMinutes += intervalMinutes;
  }
  
  return labels;
}

/**
 * Smart Y-axis positioning for jump-to-time functionality
 */
export function calculateOptimalYAxisView(
  targetTimeIndex: number,
  allData: Array<{time: number; temperature: number}>,
  contextRange: number = 10
): { yMin: number; yMax: number } {
  // Get temperature data around the target time
  const relevantData = allData.filter(d => 
    d.time >= targetTimeIndex - contextRange && 
    d.time <= targetTimeIndex + contextRange
  );
  
  if (relevantData.length === 0) {
    return { yMin: -100, yMax: 1400 }; // Default full range
  }
  
  const temps = relevantData.map(d => d.temperature);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  
  // Add 20% padding above and below
  const range = maxTemp - minTemp;
  const padding = Math.max(50, range * 0.2); // Minimum 50°C padding
  
  let yMin = minTemp - padding;
  let yMax = maxTemp + padding;
  
  // Align to nice intervals and stay within bounds
  yMin = Math.max(-100, Math.floor(yMin / 25) * 25);
  yMax = Math.min(1400, Math.ceil(yMax / 25) * 25);
  
  // Ensure minimum view range
  if (yMax - yMin < 100) {
    const mid = (yMin + yMax) / 2;
    yMin = mid - 50;
    yMax = mid + 50;
  }
  
  return { yMin, yMax };
}