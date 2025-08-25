# Time Axis Scaling Challenge - Context for Claude Code

## Background Problem

We've been working on fixing the chart's time axis scaling. The current implementation has major issues with time display that make the charts unreadable for engineers.

## What We Tried Yesterday (Failed Approaches)

Approach 1: Sequential Number Mapping

Assigned each time value to sequential numbers (0, 1, 2, 3...)
Mapped display labels back to original times
Problem: Lost connection to actual time intervals and gaps

Approach 2: ECharts Native Time Handling

Tried using ECharts' built-in time axis features
Problem: Couldn't handle the data quality issues in our CSV files

## Root Cause - CSV Data Quality Issues

Time Jumps and Gaps:
The sample CSV files have inconsistent time intervals:
10:38, 10:54, 10:56, 10:58, 11:02, 11:05...
Instead of consistent intervals like:
10:38, 10:39, 10:40, 10:41, 10:42, 10:43...
Missing Seconds Information:
Critical Discovery: When CSV shows repeated times like:
10:54, 10:54, 10:54, 10:54, 10:54, 10:54
These are NOT actually duplicates! They represent:
10:54:00, 10:54:10, 10:54:20, 10:54:30, 10:54:40, 10:54:50
The CSV export process lost the seconds precision, but the data was collected every 10 seconds.
Different Repeat Patterns:

6 repeats = 10-second intervals (10:54:00, 10:54:10, 10:54:20, 10:54:30, 10:54:40, 10:54:50)
2 repeats = 30-second intervals (10:54:00, 10:54:30)
3 repeats = 20-second intervals (10:54:00, 10:54:20, 10:54:40)

## Required Solution

Smart Time Reconstruction:

Analyze CSV patterns to detect repeat counts
Infer actual sampling intervals from repeat patterns
Reconstruct proper time series with seconds precision
Create coherent time axis that engineers can read

Example Logic:
javascript// If we see: 10:54, 10:54, 10:54, 10:54, 10:54, 10:54
// Reconstruct as: 10:54:00, 10:54:10, 10:54:20, 10:54:30, 10:54:40, 10:54:50

// If we see: 10:54, 10:54
// Reconstruct as: 10:54:00, 10:54:30
Time Axis Requirements:

Logical intervals: Choose appropriate time spacing based on zoom level
No weird gaps: 10:38 → 10:54 → 10:56 should become logical intervals
Zoom progression: 10min → 5min → 2min → 1min → 30s → 20s → 10s
Engineers can read: Clear, consistent time markings

## Implementation Challenge

Create a time axis that:

Respects actual data timing (even when CSV has gaps)
Reconstructs missing seconds from repeat patterns
Shows logical intervals for chart readability
Handles zoom levels with appropriate time precision

The goal is to make charts readable for engineers while respecting the actual timing of the temperature measurements, even when the CSV export process has degraded the time precision.
