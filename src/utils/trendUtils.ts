// Utility functions for temperature trend analysis
// Extracted from chartConfig.ts for better organization and potential memoization

export function calculateTrendIndicator(
  temperature: number,
  index: number,
  gapFilledData: Array<[string, number | null]>
): string {
  let trendIndicator = '→ Stable';
  
  // Look for previous and next non-null temperatures
  let prevTemp: number | null = null;
  let nextTemp: number | null = null;
  
  // Find previous temperature (look back up to 3 points)
  for (let i = index - 1; i >= Math.max(0, index - 3); i--) {
    const prevPoint = gapFilledData[i];
    if (prevPoint && prevPoint[1] !== null) {
      prevTemp = prevPoint[1];
      break;
    }
  }
  
  // Find next temperature (look ahead up to 3 points)
  for (let i = index + 1; i < Math.min(gapFilledData.length, index + 4); i++) {
    const nextPoint = gapFilledData[i];
    if (nextPoint && nextPoint[1] !== null) {
      nextTemp = nextPoint[1];
      break;
    }
  }
  
  // Determine trend based on surrounding points
  if (prevTemp !== null && nextTemp !== null) {
    const prevDiff = temperature - prevTemp;
    const nextDiff = nextTemp - temperature;
    const avgDiff = (prevDiff + nextDiff) / 2;
    
    if (avgDiff > 1) {
      trendIndicator = '↗ Rising';
    } else if (avgDiff < -1) {
      trendIndicator = '↘ Falling';
    }
  } else if (prevTemp !== null) {
    const diff = temperature - prevTemp;
    if (diff > 1) {
      trendIndicator = '↗ Rising';
    } else if (diff < -1) {
      trendIndicator = '↘ Falling';
    }
  } else if (nextTemp !== null) {
    const diff = nextTemp - temperature;
    if (diff > 1) {
      trendIndicator = '↗ Rising';
    } else if (diff < -1) {
      trendIndicator = '↘ Falling';
    }
  }
  
  return trendIndicator;
}

// Process all data points with trend indicators
export function addTrendIndicators(
  gapFilledData: Array<[string, number | null]>
): Array<[string, number | null, string]> {
  return gapFilledData.map((point, index) => {
    const [timestamp, temp] = point;
    
    if (temp === null) {
      return [timestamp, temp, '→ Stable'] as [string, number | null, string];
    }
    
    const trendIndicator = calculateTrendIndicator(temp, index, gapFilledData);
    return [timestamp, temp, trendIndicator] as [string, number | null, string];
  });
}