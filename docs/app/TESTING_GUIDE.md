# Enhanced Multi-Device Chart Testing Guide

## Current Status

⚠️ **Chart Temporarily Disabled for Practice**
- The enhanced multi-device chart has been temporarily commented out
- Core multi-device functionality (4 heart rate cards) is working perfectly
- Chart development will resume after practice session

✅ **Completed Enhancements:**
- Multiple colored lines (one per rower/device) - *Implementation complete, debugging needed*
- Device/rower identification in tooltips - *Implementation complete*
- Legend showing which color represents which rower - *Implementation complete*
- Separate trend lines for each connected device - *Implementation complete*
- Mock data generation system for testing - *Working perfectly*

## Post-Practice Development Plan

### Chart Issue to Resolve
- **Problem**: Chart receives data but doesn't render lines
- **Root Cause**: Data transformation or Recharts configuration issue
- **Next Steps**: Debug data flow from store → chart component

### 1. Re-enable Chart Testing
```bash
# Uncomment the chart in DashboardEnhanced.tsx
# Switch to AppEnhanced in main.tsx for testing
```

### 2. Debug Process
- Enable debug logging in HeartRateChartEnhanced
- Verify data structure matches Recharts expectations
- Test with simplified data structure
- Check Recharts Line component configuration

### 3. Test with Mock Data (When Re-enabled)

**Step 1: Enable Mock Data**
- Toggle the "Use Mock Data" switch in the Development Tools section
- This will enable mock data generation

**Step 2: Load Mock Rowers**
- Click "Load Mock Rowers" to add 4 test rowers:
  - Edwin (Seat 1) - Red line
  - John (Seat 2) - Blue line  
  - Craig (Seat 3) - Green line
  - Rob (Seat 4) - Orange line

**Step 3: Start Mock Session**
- Click "Start Mock Session" to begin generating heart rate data
- This will create a session and start real-time data generation

**Step 4: Generate Scenario Data**
- Try different scenario buttons:
  - **Practice**: Steady aerobic pace with variations
  - **Race**: Higher intensity sustained effort
  - **Intervals**: High/low cycles every 60 seconds
  - **Warmup**: Gradual increase from low to target HR

### 4. What to Look For

**Enhanced Chart Features:**
- ✅ **Multiple Lines**: Each rower should have their own colored line
- ✅ **Color Coding**: 
  - Seat 1 (Bow) = Red
  - Seat 2 = Blue
  - Seat 3 = Green
  - Seat 4 (Stroke) = Orange
- ✅ **Legend**: Shows rower names and seat positions with color indicators
- ✅ **Enhanced Tooltips**: Hover over data points to see:
  - Rower name and seat position
  - Current heart rate
  - Heart rate zone
  - Timestamp

**Real-time Updates:**
- Lines should update every 2 seconds with new data points
- Each rower has different base heart rates (140, 145, 135, 150 BPM)
- Data should show realistic variations and patterns

### 5. Expected Chart Behavior

**During Practice Session Tomorrow:**
- Each connected heart rate monitor will appear as a separate colored line
- Tooltips will show which rower each line represents
- Legend will help identify each rower quickly
- Multiple devices will display simultaneously without interference

### 6. Troubleshooting

**If chart doesn't show:**
- Ensure mock data is enabled
- Check that rowers are loaded
- Verify session is started
- Look for any console errors

**If lines don't appear:**
- Check that each rower has a deviceId assigned
- Verify heart rate data is being generated
- Ensure the session is active

## Files Created/Modified

### New Files (Ready for Post-Practice Development)
- `src/utils/mockData.ts` - Mock data generation system ✅
- `src/components/HeartRateChartEnhanced.tsx` - Enhanced multi-device chart (needs debugging)
- `src/components/DevToggle.tsx` - Development tools UI ✅
- `src/components/DashboardEnhanced.tsx` - Dashboard with enhanced chart (chart disabled)
- `src/AppEnhanced.tsx` - App using enhanced components

### Current Production Files
- `src/main.tsx` - Using original App component ✅
- `src/components/Dashboard.tsx` - Original dashboard (chart disabled) ✅

## Current Status for Practice

✅ **Ready for Practice:**
- 4 individual heart rate cards working perfectly
- Multi-device connection management
- Device-to-seat assignment
- Connection health monitoring
- Session management
- Real-time heart rate updates

⚠️ **Post-Practice Development:**
- Re-enable and debug enhanced chart
- Complete multi-device trend visualization
- Test with real heart rate monitors
