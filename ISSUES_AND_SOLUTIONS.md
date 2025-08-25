# Temperature Chart App - Issues and Solutions

## Time Axis and Scaling Issues

### Issue: ECharts Parallel Lines with Time Gaps

**Problem**: CSV data with time jumps (e.g., 10:38 → 10:52) created parallel lines instead of proper gaps.
**Symptoms**:

- Lines connecting across large time gaps
- Unrealistic temperature transitions
- Confusing visual representation

**Root Cause**: Using synthetic time rulers with sequential indexing instead of actual timestamps.

**Solution**:

```typescript
// OLD: Sequential indexing
data: [
  [0, 25.9],
  [1, 28.2],
  [2, 28.3],
]; // Creates parallel lines

// NEW: Gap-filled with nulls
data: [
  ["2024-01-01T10:38:00Z", 25.9],
  ["2024-01-01T10:52:00Z", null], // Break line
  ["2024-01-01T10:52:00Z", 28.2], // Start new segment
];
```

**Files Modified**: `timeReconstruction.ts`, `chartConfig.ts`

### Issue: Missing Seconds in CSV Data

**Problem**: CSV exports showing repeated times like "10:54, 10:54, 10:54..." losing 10-second intervals.
**Symptoms**:

- Apparent duplicate timestamps
- Lost measurement frequency information
- Incorrect time axis scaling

**Root Cause**: CSV export process strips seconds precision but data was collected every 10 seconds.

**Solution**: Pattern detection algorithm

```typescript
// Detect repeat patterns to infer intervals
if (mostCommonCount === 6) {
  intervalSeconds = 10; // 6 measurements per minute = 10s intervals
} else if (mostCommonCount === 4) {
  intervalSeconds = 15; // 4 measurements per minute = 15s intervals
}
```

**Files Modified**: `timeReconstruction.ts`

### Issue: Jump-to-Time Limiting Chart Visibility (UPDATED)

**Problem**: Jump to time feature locked chart to fixed axis ranges, preventing zoom reset and normal navigation.
**Symptoms**:

- After using "Jump to time", couldn't reset zoom to full view
- Chart stuck with limited axis ranges
- Normal zoom/pan functionality disabled

**Root Cause**: Setting axis min/max directly instead of using dataZoom actions.

**Solution**: Replace axis range setting with dataZoom dispatch actions

```typescript
// OLD: Direct axis range setting (locks chart)
chartInstance.setOption({
  xAxis: { min: startTime, max: endTime },
  yAxis: { min: yAxisView.yMin, max: yAxisView.yMax },
});

// NEW: DataZoom actions (preserves zoom functionality)
const dataStartPercent =
  ((targetTime - fullTimeRange.start) /
    (fullTimeRange.end - fullTimeRange.start)) *
  100;
chartInstance.dispatchAction({
  type: "dataZoom",
  dataZoomIndex: 0,
  start: Math.max(0, dataStartPercent - windowPercent / 2),
  end: Math.min(100, dataStartPercent + windowPercent / 2),
});
```

**Files Modified**: `App.tsx`

## Build and Development Issues

### Issue: TypeScript Unused Variable Warnings

**Problem**: TypeScript warnings about unused variables after refactoring.
**Symptoms**:

- Build warnings in console
- IDE highlighting unused code
- Code quality degradation

**Solution**: Remove legacy time calculation code

```typescript
// REMOVED: Unused synthetic time calculations
let timeSpanSeconds = 3600;
let minTime = 0;
let maxTime = data.length;
```

**Files Modified**: `chartConfig.ts`

### Issue: Tauri Build Performance

**Problem**: Long compilation times for Rust backend.
**Symptoms**:

- 20+ second build times
- Blocking development workflow
- Resource intensive compilation

**Workaround**: Use hot reload for frontend changes, only rebuild Tauri when necessary.

## CSV Parsing Issues

### Issue: Italian DateTime Format Support

**Problem**: CSV files with "15/07/2021 10:38:00" format not parsing correctly.
**Symptoms**:

- Import failures
- Invalid date parsing
- Loss of temporal data

**Solution**: Enhanced datetime parsing

```typescript
function parseDateTime(dateTimeStr: string): string | null {
  const parts = dateTimeStr.trim().split(" ");
  if (parts.length >= 2) {
    const timePart = parts[1]; // Extract time portion
    // Handle both HH:MM and HH:MM:SS formats
  }
}
```

**Files Modified**: `csvParser.ts`

### Issue: Mixed Data Columns (Text + Numbers)

**Problem**: CSV columns containing both "Sotto Scala" text and numeric temperatures.
**Symptoms**:

- Parsing errors
- Invalid data points
- Chart rendering failures

**Solution**: Smart column detection

```typescript
function isValidTemperature(value: string): boolean {
  if (!value || value.trim() === "") return false;
  const num = Number(value.trim());
  return !isNaN(num) && num >= TEMP_MIN && num <= TEMP_MAX;
}
```

**Files Modified**: `csvParser.ts`

## Chart Configuration Issues

### Issue: Temperature Axis Decimal Values

**Problem**: Temperature labels showing "403.4°C, 408.4°C" instead of whole numbers.
**Symptoms**:

- Unprofessional appearance
- Difficult to read
- Non-standard engineering notation

**Solution**: Axis label formatting

```typescript
axisLabel: {
  formatter: (value: number) => {
    const rounded = Math.round(value);
    return `${rounded}°C`;
  };
}
```

**Files Modified**: `chartConfig.ts`

### Issue: Maximum Zoom Too Granular

**Problem**: Chart could zoom to 5-second intervals, too detailed for practical use.
**Symptoms**:

- Over-detailed time axis
- Poor readability at max zoom
- Non-standard time intervals

**Solution**: Limit minimum zoom span

```typescript
dataZoom: [
  {
    minValueSpan: 100000, // 1 min 40 sec minimum (prevents <10s intervals)
  },
];
```

**Files Modified**: `chartConfig.ts`

## Performance Issues

### Issue: Large Dataset Memory Usage

**Problem**: Approaching 5000 row limit with potential memory concerns.
**Current Status**: Not yet encountered, but monitoring required.
**Preventive Measures**:

- Row limit enforcement in parser
- Efficient data structures
- Lazy loading for future consideration

## Environment-Specific Issues

### Issue: MacOS Tauri Compilation Dependencies

**Problem**: Complex Rust dependency chain for macOS builds.
**Symptoms**:

- Long initial compilation
- Multiple Objective-C library compilations
- Resource intensive first build

**Solution**: Expected behavior, subsequent builds are faster with incremental compilation.

## Third-Party Library Quirks

### ECharts Time Axis Behavior

**Quirk**: ECharts time axis requires ISO timestamp strings, not Unix timestamps.
**Workaround**: Always use `toISOString()` format for time data.

### ECharts ConnectNulls Setting

**Quirk**: Default `connectNulls: true` connects across null values, defeating gap visualization.
**Solution**: Explicitly set `connectNulls: false` for proper gap display.

## Recent Session Issues (Latest Fixes)

### Issue: Channel Session Persistence Bug

**Problem**: Custom channel names and colors weren't saving in .tdproj session files.
**Symptoms**:

- Channel renamed successfully during session
- After save/load, reverted to default names
- Custom colors also not persisting

**Root Cause**: Race condition in session loading where useEffect was overwriting loaded channel data.

**Solution**: Added loading flag and timing control

```typescript
// Added loading flag to prevent channel regeneration
const [isLoadingSession, setIsLoadingSession] = useState(false);

// Fixed loading sequence
const handleLoadSession = async () => {
  setIsLoadingSession(true);
  setChannels(sessionData.channels); // Set channels first
  setTimeout(() => {
    setData(sessionData.data); // Then data
    setTimeout(() => {
      setIsLoadingSession(false); // Finally enable normal updates
    }, 50);
  }, 50);
};
```

**Files Modified**: `App.tsx`

### Issue: Zoom Flicker During UI Updates

**Problem**: Chart briefly flashed to default zoom before restoring when changing UI elements.
**Symptoms**:

- Bad UX during channel name edits, theme changes, etc.
- Chart would zoom out then quickly zoom back in
- Jarring visual experience

**Root Cause**: Full chart re-render for UI-only changes was resetting zoom state.

**Solution**: Smart partial chart updates in ChartArea component

```typescript
// Detect UI-only changes
const onlyUIChanged =
  data === data &&
  timeMapping === timeMapping &&
  reconstructedTime === reconstructedTime &&
  (prev.channels !== channels || prev.isDark !== isDark);

if (onlyUIChanged) {
  // Partial update preserves zoom
  chartInstance.setOption(partialOption, false); // false = merge mode
} else {
  // Full update for data changes
  chartInstance.setOption(option, true);
}
```

**Files Modified**: `ChartArea.tsx`

### Issue: Temperature Axis Dragging Disabled

**Problem**: Couldn't drag up/down on temperature axis when zoomed.
**Symptoms**:

- Horizontal dragging worked fine
- Vertical dragging completely disabled
- Inconsistent navigation experience

**Root Cause**: Y-axis dataZoom moveOnMouseMove set to false.

**Solution**: Enable Shift+drag for Y-axis navigation

```typescript
// Y-axis dataZoom configuration
{
  type: 'inside',
  yAxisIndex: 0,
  zoomOnMouseWheel: 'shift', // Shift+scroll for Y-axis zoom
  moveOnMouseMove: 'shift' // Shift+drag for Y-axis pan
}
```

**Files Modified**: `chartConfig.ts`

### Issue: Channel Input Deletion Bug

**Problem**: Deleting all text in channel name input reverted to default name instead of allowing empty input.
**Symptoms**:

- User couldn't clear channel name
- Input would revert immediately
- Poor editing experience

**Root Cause**: `.trim()` logic converting empty strings to undefined.

**Solution**: Removed trim logic for channel name handling

```typescript
// OLD: Problematic trim logic
const newName = newValue.trim() || `Channel ${channel.id}`;

// NEW: Allow empty strings
const newName = newValue || `Channel ${channel.id}`;
```

**Files Modified**: `App.tsx`

## Keyboard Navigation Implementation

### Feature: Complete Keyboard Navigation System

**Implementation**: Added comprehensive keyboard shortcuts to ChartArea component
**Shortcuts Added**:

- **Ctrl + Arrow Keys**: Pan in all directions (5% steps)
- **Ctrl + Plus/Minus**: Zoom in/out (20% increments)
- **Ctrl + 0**: Reset to full view
- **Visual Focus**: Blue outline when chart focused
- **Tooltip**: Explains shortcuts to users

**Solution**: Keyboard event handling with dataZoom actions

```typescript
// Pan left example
case 'ArrowLeft':
  if (event.ctrlKey || event.metaKey) {
    const newStart = Math.max(0, xDataZoom.start - panStep);
    const newEnd = Math.max(panStep, xDataZoom.end - panStep);
    chartInstance.dispatchAction({
      type: 'dataZoom',
      dataZoomIndex: 0,
      start: newStart,
      end: newEnd
    });
  }
```

**Files Modified**: `ChartArea.tsx`

## Professional Engineering Features

### Feature: Minor Grid Lines and Tick Marks

**Implementation**: Added engineering-style precision grid system
**Features**:

- Minor grid lines every 5°C for temperature precision
- Time axis minor ticks with 6 subdivisions per major interval
- Professional tick marks on both axes
- Proper opacity and styling for engineering readability

**Configuration**:

```typescript
minorTick: {
  show: true,
  splitNumber: 5, // 5 minor divisions per major interval
  length: 5,
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
    opacity: isDark ? 0.5 : 0.6
  }
}
```

**Files Modified**: `chartConfig.ts`

## Debugging Techniques That Worked

### Console Logging Strategy

Effective debug logging for time reconstruction:

```typescript
console.log("Parsed time data:", {
  first: parsedTimes[0],
  last: parsedTimes[parsedTimes.length - 1],
  sample: parsedTimes.slice(0, 5),
});
```

### Chart Instance Inspection

Direct ECharts instance access for debugging:

```typescript
const chartInstance = chartRef.current?.getEchartsInstance();
if (chartInstance) {
  console.log("Chart option:", chartInstance.getOption());
}
```

### Data Structure Validation

Validate data at each transformation step:

```typescript
console.log(`Channel ${channelId} gap-filled data:`, {
  originalPoints: channelData.length,
  resultPoints: result.length,
  gaps: result.filter(([, temp]) => temp === null).length,
});
```

### Race Condition Debugging

Use timing flags to debug loading sequence issues:

```typescript
console.log("Loading sequence:", {
  isLoadingSession,
  channelsSet: channels.length > 0,
  dataSet: data.length > 0,
  timestamp: Date.now(),
});
```
