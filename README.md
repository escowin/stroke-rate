# Stroke Rate - Heart Rate Monitor

A Progressive Web Application (PWA) that enables coxswains to monitor real-time heart rate data from all rowers in a 4+ boat during training and racing.

## Phase 1, 2, 3 & 4 Implementation ✅ **COMPLETED**

This repository contains the **completed Phase 1, Phase 2, Phase 3, and Phase 4** implementation of Stroke Rate, which establishes the core PWA infrastructure, basic Bluetooth connectivity, multi-device support, enhanced visualization with heart rate zone analysis, and comprehensive training integration with advanced analytics. All Phase 1, Phase 2, Phase 3, and Phase 4 deliverables and success criteria have been achieved.

### ✅ Completed Features

#### Phase 1 Features:
- **PWA Setup**: React 18 + TypeScript with Vite, service worker, and manifest
- **Bluetooth Integration**: Web Bluetooth API with custom React hooks
- **SpeedCoach Conflict Detection**: System to identify and manage existing SpeedCoach connections
- **Streamlined Conflict Management**: Simple warning message and coxswain-to-rower communication workflow
- **Heart Rate Visualization**: Basic real-time heart rate display with Recharts
- **Core UI Components**: Responsive design with vanilla CSS
- **GitHub Pages Deployment**: Automated deployment pipeline

#### Phase 2 Features:
- **Multi-Device Support**: Connect to up to 4 heart rate devices simultaneously
- **Device Assignment**: Intuitive device-to-seat assignment interface
- **Connection Health Monitoring**: Real-time connection status with automatic reconnection
- **Global State Management**: Unified state management for consistent device health across all screens
- **Enhanced Dashboard**: Multi-rower heart rate display with connection status indicators
- **Robust Error Handling**: Comprehensive connection management and error recovery

#### Phase 3 Features:
- **Heart Rate Zone Analysis**: Age-based zone calculations with Karvonen method for athletic rowers
- **Enhanced Visualization**: Comprehensive dashboard with performance metrics and individual rower analysis
- **Historical Data Tracking**: IndexedDB-based session persistence with 100MB realistic storage cap
- **Session Comparison**: Progress tracking with visual indicators and trend analysis
- **Alert System**: Battery monitoring, connection alerts, and database storage warnings
- **Settings Management**: Configurable notifications and data management with granular controls
- **Session Persistence**: Automatic session restoration and most recent session display for post-practice analysis

#### Phase 4 Features:
- **Session Analytics & Reporting**: Advanced analytics algorithms (TRIMP, TSS, intensity factor, normalized power)
- **Recovery Metrics**: Heart rate variability analysis and recovery time estimation
- **Crew Analysis**: Synchronization, cohesion, and individual variance tracking
- **Progress Tracking Over Time**: Multi-session trend analysis with linear regression and predictive analytics
- **Goal Setting System**: Milestone tracking and training phase management
- **Data Export Functionality**: CSV and JSON export with advanced filtering and external tool compatibility
- **Comprehensive Reporting**: Automated insights, recommendations, and performance scoring

### 🏗️ Technical Architecture

- **Frontend**: React 18 + TypeScript 5.x
- **Build Tool**: Vite (optimized for PWA and performance)
- **State Management**: Zustand (lightweight, perfect for this scope)
- **PWA**: Workbox for service worker management
- **Bluetooth**: Web Bluetooth API with custom React hooks
- **Styling**: Vanilla CSS (lightweight, mobile-first, accessible)
- **Charts**: Recharts (React-native, lightweight for heart rate trends)
- **Deployment**: GitHub Actions for automated deployment

### 🚀 Getting Started

#### Prerequisites
- Node.js 20.19+ or 22.12+
- npm or yarn
- Modern browser with Web Bluetooth API support (Chrome/Edge on Android)

#### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/stroke-rate.git
cd stroke-rate

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

#### Development

```bash
# Start development server with hot reload
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
```

### 📱 PWA Features

- **Installable**: Can be installed on mobile devices as a native app
- **Offline Capable**: Core functionality works without internet connection
- **Responsive**: Optimized for mobile devices and tablets
- **Fast Loading**: Optimized bundle size and caching strategies

### 🔗 Bluetooth Integration

The app uses the Web Bluetooth API to connect to heart rate monitors:

- **Device Discovery**: Automatically scans for nearby heart rate devices
- **Multi-Device Support**: Can connect to up to 4 heart rate devices simultaneously
- **SpeedCoach Conflict Detection**: Identifies when devices are already connected to SpeedCoach
- **Connection Management**: Maintains stable connections with automatic reconnection

### 🎯 Heart Rate Monitoring

- **Real-Time Display**: Shows current BPM for each rower with color-coded zones
- **Heart Rate Zones**: Visual indicators for recovery, aerobic, threshold, and anaerobic zones
- **Historical Tracking**: Displays heart rate trends during sessions
- **Alert System**: Notifications for heart rate anomalies (Phase 2+)

### 🚣‍♀️ Rower Management

- **Seat Assignment**: Map each heart rate device to specific rower positions (Bow, 2-seat, 3-seat, 4-seat)
- **Rower Profiles**: Store rower names, target heart rate zones, and historical data
- **Quick Setup**: Streamlined device-to-seat assignment workflow

### 🔧 SpeedCoach Integration

The app handles the critical challenge of Bluetooth connection conflicts with SpeedCoach devices:

- **Conflict Detection**: Automatically detects when heart rate monitors are connected to SpeedCoach
- **Streamlined Workflow**: Simple warning message when no devices found, coxswain communicates with rowers
- **Practical Solution**: Rowers disconnect from SpeedCoach, coxswain scans again and proceeds with setup

### 📊 Data Visualization

- **Dashboard View**: Centralized display of all rowers' heart rate data
- **Individual Views**: Detailed view for each rower's biometric data
- **Real-Time Charts**: Live heart rate trend visualization
- **Zone Indicators**: Color-coded heart rate zone display

### 🚀 Deployment

The app is automatically deployed to GitHub Pages on every push to the main branch:

- **GitHub Actions**: Automated build and deployment pipeline
- **PWA Ready**: Full PWA manifest and service worker support
- **CDN Optimized**: Optimized for fast loading and caching

### 🔮 Next Phases

#### Phase 5: Polish & Optimization (Weeks 13-14)
- Performance optimization and testing
- User experience improvements
- Documentation and user guide
- Beta testing with real rowing sessions

### 🛠️ Browser Compatibility

- **Primary**: Chrome/Edge (Android)
- **Minimum**: Chrome 56+, Edge 79+
- **Features**: Web Bluetooth API support required

### 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### 📞 Support

For support, please open an issue in the GitHub repository or contact me, [Edwin Escobar](https://github.com/escowin).

---

## 🎉 Phase 1, 2, 3 & 4 Completion Summary

**Phase 1, 2, 3 & 4 Status**: ✅ **COMPLETED** - Core PWA infrastructure, Bluetooth connectivity, multi-device support, enhanced visualization, and comprehensive training integration established

### Phase 1 Key Achievements:
- ✅ **PWA Infrastructure**: Fully functional Progressive Web App with service worker and manifest
- ✅ **Bluetooth Integration**: Web Bluetooth API implementation with device discovery and connection management
- ✅ **SpeedCoach Conflict Detection**: System to identify and handle connection conflicts with existing SpeedCoach devices
- ✅ **Real-Time Monitoring**: Live heart rate data display with clean, professional UI
- ✅ **Rower Management**: Device-to-seat assignment and rower configuration system
- ✅ **Data Visualization**: Heart rate trend charts with proper styling and responsive design
- ✅ **Deployment Pipeline**: Automated GitHub Pages deployment with GitHub Actions

### Phase 2 Key Achievements:
- ✅ **Multi-Device Support**: Successfully connects to up to 4 heart rate devices simultaneously
- ✅ **Global State Management**: Unified state management ensuring consistent device health across all screens
- ✅ **Connection Health Monitoring**: Real-time connection status with automatic reconnection capabilities
- ✅ **Enhanced Device Assignment**: Intuitive device-to-seat assignment interface with health indicators
- ✅ **Robust Error Handling**: Comprehensive connection management and error recovery systems
- ✅ **Consistent UI**: Resolved discrepancies between Dashboard and Setup screens for device health status

### Phase 3 Key Achievements:
- ✅ **Heart Rate Zone Analysis**: Age-based zone calculations with Karvonen method for athletic rowers (14-80+ age range)
- ✅ **Enhanced Visualization**: Comprehensive dashboard with performance metrics, individual rower analysis, and progress indicators
- ✅ **Historical Data Tracking**: IndexedDB-based session persistence with realistic 100MB storage cap (~4 months of data)
- ✅ **Session Comparison**: Progress tracking with visual indicators, trend analysis, and session selection
- ✅ **Alert System**: Battery monitoring, connection alerts, database storage warnings, and configurable notifications
- ✅ **Settings Management**: Granular data management controls, storage monitoring, and notification preferences
- ✅ **Session Persistence**: Automatic session restoration and most recent session display for post-practice analysis

### Phase 4 Key Achievements:
- ✅ **Session Analytics & Reporting**: Advanced mathematical algorithms for TRIMP, TSS, intensity factor, and normalized power calculations
- ✅ **Recovery Metrics**: Heart rate variability analysis, recovery time estimation, and physiological stress assessment
- ✅ **Crew Analysis**: Synchronization metrics, cohesion tracking, and individual variance analysis for team performance optimization
- ✅ **Progress Tracking Over Time**: Multi-session trend analysis with linear regression, R-squared confidence scoring, and predictive analytics
- ✅ **Goal Setting System**: Comprehensive milestone tracking, training phase management (base, build, peak, recovery), and progress monitoring
- ✅ **Data Export Functionality**: CSV and JSON export capabilities with advanced filtering, date ranges, and external tool compatibility
- ✅ **Comprehensive Reporting**: Automated insights generation, performance recommendations, and detailed session scoring
- ✅ **Advanced Visualizations**: Interactive charts, progress indicators, trend analysis, and responsive design for all screen sizes

### Testing Results:
- ✅ App installs as PWA on mobile devices
- ✅ Successfully connects to multiple heart rate monitors simultaneously
- ✅ Maintains stable connections for 60+ minute sessions
- ✅ Detects SpeedCoach conflicts and provides clear user guidance
- ✅ Global state management ensures consistent device health display
- ✅ Clean, professional UI with proper chart styling and responsive design
- ✅ Heart rate zone calculations work accurately for athletic rowers across all age ranges
- ✅ Session data persists through app refreshes and provides seamless post-practice analysis
- ✅ Enhanced dashboard provides comprehensive performance insights and progress tracking
- ✅ Advanced session analytics provide detailed performance metrics and recovery insights
- ✅ Progress tracking system enables long-term performance monitoring and trend analysis
- ✅ Data export functionality works seamlessly with external tools and analysis software
- ✅ Comprehensive reporting system provides actionable insights for training optimization

**Ready for Phase 5**: Polish & Optimization and Beta Testing