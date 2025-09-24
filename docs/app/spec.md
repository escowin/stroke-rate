# Coxswain Heart Rate Monitoring App - Technical Specification

## Project Overview

A Progressive Web Application (PWA) that enables coxswains to monitor real-time heart rate data from all rowers in a 4+ boat during training and racing. The app provides comprehensive biometric insights to optimize crew performance and training effectiveness.

## Core Requirements

### Functional Requirements

#### 1. Device Discovery & Connection
- **Bluetooth LE Discovery**: Automatically scan for and identify nearby heart rate monitors
- **Multi-Device Support**: Connect to up to 4 heart rate devices simultaneously
- **SpeedCoach Conflict Detection**: Identify when heart rate monitors are already connected to SpeedCoach devices
- **Connection Management**: Maintain stable connections with automatic reconnection capabilities
- **Device Identification**: Display device names, battery levels, and connection status
- **Connection Priority System**: Handle conflicts between app and SpeedCoach connections

#### 2. Rower Assignment & Management
- **Seat Assignment**: Map each heart rate device to specific rower positions (Bow, 2-seat, 3-seat, 4-seat)
- **Rower Profiles**: Store rower names, target heart rate zones, and historical data
- **Quick Setup**: Streamlined device-to-seat assignment workflow

#### 3. Real-Time Monitoring
- **Live Heart Rate Display**: Show current BPM for each rower with color-coded zones
- **Heart Rate Zones**: Visual indicators for recovery, aerobic, threshold, and anaerobic zones
- **Historical Tracking**: Display heart rate trends and averages during sessions
- **Alert System**: Notifications for heart rate anomalies or zone violations

#### 4. Data Visualization
- **Dashboard View**: Centralized display of all rowers' heart rate data
- **Individual Views**: Detailed view for each rower's biometric data
- **Session Analytics**: Post-workout analysis with charts and statistics
- **Export Capabilities**: Save session data for external analysis

#### 5. Training Integration
- **Workout Templates**: Pre-defined training sessions (steady state, intervals, race pace)
- **Zone Targeting**: Set target heart rate zones for different workout phases
- **Progress Tracking**: Monitor improvement over time
- **Performance Metrics**: Calculate and display training load, recovery time, etc.

### Technical Requirements

#### 1. Platform & Deployment
- **PWA Architecture**: Installable web app with offline capabilities
- **Mobile-First Design**: Optimized for smartphone/tablet use in boats
- **GitHub Pages Hosting**: Easy deployment and updates
- **Cross-Platform**: Works on iOS and Android devices

#### 2. Bluetooth Integration
- **Web Bluetooth API**: Native browser support for BLE devices
- **Heart Rate Service**: Standard GATT service implementation
- **Connection Pooling**: Efficient management of multiple device connections
- **SpeedCoach Conflict Resolution**: Detect and manage existing SpeedCoach connections
- **Connection State Monitoring**: Track all active Bluetooth connections and their destinations
- **Error Handling**: Robust connection failure recovery

#### 3. Data Management
- **Local Storage**: Session data persistence using IndexedDB
- **Real-Time Updates**: WebSocket-like updates for live data
- **Data Compression**: Efficient storage of heart rate time series
- **Privacy**: All data stored locally, no cloud transmission

#### 4. Performance Requirements
- **Low Latency**: < 2 second delay for heart rate updates
- **Battery Optimization**: Minimal impact on device battery life
- **Offline Capability**: Core functionality without internet connection
- **Responsive UI**: Smooth performance on mid-range mobile devices

## User Experience Design

### Primary User: Coxswain
- **Quick Access**: One-tap access to heart rate data during rowing
- **Glanceable Interface**: Large, clear numbers visible in various lighting conditions
- **Minimal Interaction**: Hands-free operation during active rowing

### Secondary Users: Rowers & Coaches
- **Post-Session Review**: Detailed analysis of training data
- **Progress Tracking**: Long-term performance trends
- **Training Planning**: Data-driven workout optimization

## Development Phases

### Phase 1: Foundation
**Goal**: Establish core PWA infrastructure and basic Bluetooth connectivity

#### Deliverables:
- [x] PWA setup with service worker and manifest
- [x] Basic UI framework with responsive design
- [x] Bluetooth LE device discovery implementation
- [x] SpeedCoach connection conflict detection system
- [x] Single heart rate device connection and data display
- [x] GitHub Pages deployment pipeline

#### Technical Tasks:
- Set up React 18 + TypeScript PWA structure with Vite
- Implement Web Bluetooth API integration with custom React hooks
- Add SpeedCoach connection conflict detection and management
- Create connection conflict resolution UI with user choice interface
- Create basic heart rate data visualization with Recharts
- Design and implement core UI components and vanilla CSS
- Set up automated deployment to GitHub Pages

#### Success Criteria:
- [x] App installs as PWA on mobile device
- [x] Successfully detects existing SpeedCoach connections
- [x] Provides clear conflict resolution interface
- [x] Successfully connects to one heart rate monitor
- [x] Displays real-time heart rate data
- [x] Maintains connection during 30+ minute session

**Status**: ✅ **COMPLETED** - All Phase 1 deliverables and success criteria have been achieved

### Phase 2: Multi-Device Support
**Goal**: Enable connection to multiple heart rate devices simultaneously

#### Deliverables:
- [ ] Multi-device connection management
- [ ] Device-to-seat assignment interface
- [ ] Simultaneous display of 4 rowers' heart rate data
- [ ] Connection status monitoring and error handling

#### Technical Tasks:
- Implement connection pool management with Zustand state management
- Create device assignment workflow with React forms
- Design multi-rower dashboard layout with responsive vanilla CSS
- Add connection health monitoring with custom React hooks
- Implement automatic reconnection logic with Web Bluetooth API

#### Success Criteria:
- Connects to 4 heart rate devices simultaneously
- Maintains stable connections for 60+ minute sessions
- Clear visual indication of connection status
- Intuitive device assignment process

### Phase 3: Enhanced Visualization
**Goal**: Implement comprehensive data visualization and heart rate zone analysis

#### Deliverables:
- [ ] Heart rate zone calculation and display
- [ ] Historical data tracking during sessions
- [ ] Enhanced dashboard with trends and averages
- [ ] Alert system for heart rate anomalies

#### Technical Tasks:
- Implement heart rate zone algorithms with TypeScript type safety
- Create time-series data storage and retrieval with IndexedDB (idb library)
- Design trend visualization components with Recharts
- Add notification system for alerts using Web Notifications API
- Implement session data persistence with React state management

#### Success Criteria:
- Accurate heart rate zone classification
- Real-time trend visualization
- Persistent session data storage
- Effective alert system for zone violations

### Phase 4: Training Integration
**Goal**: Add workout templates and training analytics

#### Deliverables:
- [ ] Pre-defined workout templates
- [ ] Session analytics and reporting
- [ ] Progress tracking over time
- [ ] Data export functionality

#### Technical Tasks:
- Create workout template system with React components and TypeScript interfaces
- Implement session analytics algorithms with mathematical libraries
- Design progress tracking interface with Recharts visualizations
- Add data export capabilities (CSV, JSON) using browser APIs
- Create historical data visualization with responsive React components

#### Success Criteria:
- Multiple workout templates available
- Comprehensive session analytics
- Long-term progress tracking
- Successful data export functionality

### Phase 5: Polish & Optimization
**Goal**: Performance optimization, testing, and user experience refinement

#### Deliverables:
- [ ] Performance optimization and testing
- [ ] User experience improvements
- [ ] Documentation and user guide
- [ ] Beta testing with real rowing sessions

#### Technical Tasks:
- Performance profiling and optimization with React DevTools and Lighthouse
- Cross-device compatibility testing (iOS Safari, Android Chrome)
- User interface refinements with Tailwind CSS and accessibility improvements
- Create user documentation with React-based help system
- Conduct real-world testing sessions with actual rowing crews

#### Success Criteria:
- App performs smoothly on target devices
- Positive feedback from beta testers
- Complete user documentation
- Ready for production deployment

### Phase 6: Dedicated Device Solution
**Goal**: Address iOS Safari limitations with dedicated Raspberry Pi hardware

#### Problem Statement:
iOS Safari does not support the Web Bluetooth API, limiting the app's reach to ~60% of mobile users in key markets. A dedicated device solution would provide universal compatibility and enhanced functionality.

#### Solution: Raspberry Pi-Based Coxswain Device

**Hardware Specifications:**
- **Platform**: Raspberry Pi 4 Model B (4GB RAM)
- **Display**: 7" Official Touch Display (800x480 resolution)
- **Enclosure**: Waterproof case (IP65 rating) for marine environment
- **Connectivity**: Built-in Bluetooth 5.0 + optional external antenna
- **Power**: 10,000mAh battery pack for all-day operation
- **Storage**: 32GB+ microSD card for OS and application data
- **Mounting**: Marine-grade mounting hardware for coxswain's area

**Software Architecture:**
- **Base OS**: Raspberry Pi OS Lite with Chromium browser
- **Application**: PWA running in kiosk mode (fullscreen, no browser UI)
- **Bluetooth**: Native Web Bluetooth API support via Chromium
- **Auto-start**: Systemd service to launch app on boot
- **Updates**: OTA update mechanism for app and system updates

#### Deliverables:
- [ ] Raspberry Pi image with pre-configured PWA
- [ ] Kiosk mode implementation with auto-launch
- [ ] Marine-grade hardware assembly guide
- [ ] Fleet management system for multiple devices
- [ ] Enhanced features leveraging Pi's capabilities

#### Technical Tasks:
- Create Raspberry Pi OS image with Chromium kiosk mode
- Implement auto-start systemd service for PWA
- Design marine-grade hardware assembly and mounting
- Add Pi-specific features (GPS, accelerometer, data logging)
- Create fleet management dashboard for multiple boats
- Implement OTA update system for remote device management

#### Enhanced Features for Dedicated Device:
- **GPS Integration**: Track boat speed and correlate with heart rate data
- **Accelerometer**: Monitor boat movement and stroke synchronization
- **Data Logging**: Local storage of all session data with SD card backup
- **Wireless Sync**: Automatic data synchronization to cloud/coach dashboard
- **Status Indicators**: LED indicators for connection status and battery level
- **Voice Announcements**: Audio feedback for heart rate zones and alerts
- **Weather Integration**: Display weather conditions and their impact on performance

#### Advantages:
- **Universal Compatibility**: Works regardless of coxswain's personal device
- **Enhanced Reliability**: Dedicated hardware optimized for the application
- **Better Performance**: More processing power and storage than mobile devices
- **Marine Environment**: Designed for water, vibration, and temperature extremes
- **Fleet Management**: Centralized control and monitoring of multiple boats
- **Cost Effective**: ~$150-200 per device vs. commercial rowing computers
- **Customizable**: Can add features specific to rowing club needs

#### Implementation Strategy:
1. **Prototype Phase**: Build and test single device with existing PWA
2. **Hardware Optimization**: Refine enclosure, mounting, and power management
3. **Software Enhancement**: Add Pi-specific features and optimizations
4. **Fleet Deployment**: Scale to multiple boats with management system
5. **Integration**: Connect with existing rowing club infrastructure

#### Success Criteria:
- Device operates reliably in marine environment for 8+ hours
- Seamless Bluetooth connectivity with all heart rate monitors
- Positive feedback from coxswains and coaches
- Successful fleet deployment across multiple boats
- Integration with existing rowing club data systems

## Technical Architecture

### Frontend Stack
- **Framework**: React 18 + TypeScript 5.x
- **Build Tool**: Vite (optimized for PWA and performance)
- **State Management**: Zustand (lightweight, perfect for this scope)
- **PWA**: Workbox for service worker management
- **Bluetooth**: Web Bluetooth API with custom React hooks
- **Storage**: IndexedDB via idb library (better TypeScript support)
- **Styling**: Vanilla CSS (mobile-first, accessible)
- **Charts**: Recharts (React-native, lightweight for heart rate trends)

### Development Tools
- **Build**: Vite (faster builds, better PWA support than CRA)
- **Testing**: Vitest + React Testing Library + MSW (mock Bluetooth API)
- **Linting**: ESLint + Prettier
- **Deployment**: GitHub Actions for automated deployment
- **Version Control**: Git with conventional commits

### Browser Compatibility
- **Primary**: Chrome/Edge (Android)
- **Minimum**: Chrome 56+, Edge 79+
- **Features**: Web Bluetooth API support required

## Connection Conflict Management

### SpeedCoach Integration Challenge
Based on the [SpeedCoach GPS documentation](https://nksports.com/mwdownloads/download/link/id/144), heart rate monitors (Garmin HRM-Dual, WHOOP bands) typically connect to individual SpeedCoach devices during practice. This creates a **critical Bluetooth connection conflict** since most heart rate monitors can only maintain one active connection at a time.

### Conflict Resolution Strategy

#### **Primary Approach: App Priority with User Choice**
- **Detection**: App scans for heart rate devices and identifies existing SpeedCoach connections
- **User Interface**: Clear warning dialog when conflicts are detected
- **User Choice**: Allow coxswain to choose whether to disconnect from SpeedCoach
- **Graceful Handling**: Provide options to reconnect to SpeedCoach after session

#### **User Workflow for Connection Conflicts**
```
1. Coxswain opens app
2. App scans for heart rate devices
3. App detects existing SpeedCoach connections
4. App shows connection conflict warning:
   "3 heart rate monitors are connected to SpeedCoach devices.
   To use this app, you'll need to disconnect them from SpeedCoach.
   Continue? [Yes] [No]"
5. If Yes: App disconnects from SpeedCoach and connects to app
6. If No: App shows limited functionality or alternative options
7. After session: Option to restore SpeedCoach connections
```

#### **Technical Implementation**
- **Connection State Monitoring**: Track all active Bluetooth connections and their destinations
- **Conflict Detection**: Identify when heart rate monitors are connected to other devices
- **User Interface**: Clear conflict resolution dialogs with connection status display
- **Connection Management**: Safely disconnect from SpeedCoach and establish app connections
- **Reconnection Options**: Provide way to restore SpeedCoach connections post-session

### **Advantages of This Approach**
- **Centralized Monitoring**: Coxswain gets unified view of all 4 rowers' heart rate data
- **Enhanced Functionality**: App provides features SpeedCoach cannot (multi-device monitoring)
- **User Control**: Coxswain decides connection priority based on training needs
- **Flexibility**: Can switch between SpeedCoach and app usage as needed

## Risk Mitigation

### Technical Risks
- **Bluetooth Stability**: Implement robust reconnection logic and connection monitoring
- **SpeedCoach Conflicts**: Handle existing connections gracefully with user choice
- **Browser Compatibility**: Progressive enhancement with fallback options
- **Performance**: Optimize for mobile devices with limited resources
- **Data Loss**: Implement comprehensive local storage with backup mechanisms

### User Experience Risks
- **Learning Curve**: Design intuitive interface with minimal training required
- **Environmental Factors**: Ensure visibility in various lighting conditions
- **Device Limitations**: Optimize for common mobile device constraints

## Success Metrics

### Technical Metrics
- Connection success rate > 95%
- Data update latency < 2 seconds
- App crash rate < 1%
- Battery usage < 5% per hour

### User Experience Metrics
- Setup time < 5 minutes for new users
- User satisfaction score > 4.5/5
- Daily active usage during training season
- Positive feedback from coxswains and coaches

## Future Enhancements

### Phase 6+ Potential Features
- **Dedicated Device Solution**: Raspberry Pi-based coxswain devices for universal compatibility
- **ANT+ Integration**: Support ANT+ protocol for simultaneous connections with SpeedCoach
- **GPS Integration**: Track boat speed and correlate with heart rate data
- **Stroke Rate Monitoring**: Integrate with boat sensors for comprehensive analysis
- **Team Management**: Multi-boat support for larger rowing programs
- **Cloud Sync**: Optional cloud backup and team sharing
- **Advanced Analytics**: Machine learning insights for performance optimization
- **SpeedCoach Integration**: Direct data sharing with SpeedCoach devices when possible
- **Fleet Management**: Centralized monitoring and control of multiple boat devices

---

*This specification serves as the foundation for developing a comprehensive heart rate monitoring solution tailored specifically for rowing coxswains and their crews.*