import { useState, useEffect } from 'react';
import { CompatibilityTest } from './CompatibilityTest';
import { getCompatibilityStatus, type CompatibilityReport } from '../utils/browserCompatibility';
import { 
  DevicePhoneMobileIcon, 
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export const CompatibilityTestPage = () => {
  const [, setCompatibilityReport] = useState<CompatibilityReport | null>(null);
  const [testResults, setTestResults] = useState<{
    androidChrome: CompatibilityReport | null;
    iosSafari: CompatibilityReport | null;
    desktopChrome: CompatibilityReport | null;
  }>({
    androidChrome: null,
    iosSafari: null,
    desktopChrome: null
  });

  useEffect(() => {
    // Run initial compatibility test
    const report = getCompatibilityStatus();
    console.log('Initial compatibility status:', report);
  }, []);

  const handleTestComplete = (report: CompatibilityReport) => {
    setCompatibilityReport(report);
    
    // Store test results based on current browser
    if (report.browser.isAndroid && report.browser.isChrome) {
      setTestResults(prev => ({ ...prev, androidChrome: report }));
    } else if (report.browser.isIOS && report.browser.isSafari) {
      setTestResults(prev => ({ ...prev, iosSafari: report }));
    } else if (!report.browser.isMobile && report.browser.isChrome) {
      setTestResults(prev => ({ ...prev, desktopChrome: report }));
    }
  };

  const getTestSummary = () => {
    const results = Object.values(testResults).filter(Boolean);
    if (results.length === 0) return null;

    const fullySupported = results.filter(r => r?.isFullySupported).length;
    const partiallySupported = results.filter(r => r?.isPartiallySupported).length;
    const unsupported = results.filter(r => r?.isNotSupported).length;

    return {
      total: results.length,
      fullySupported,
      partiallySupported,
      unsupported
    };
  };

  const summary = getTestSummary();

  return (
    <div className="compatibility-test-page">
      <div className="compatibility-test-page-header">
        <h1 className="compatibility-test-page-title">
          Cross-Device Compatibility Testing
        </h1>
        <p className="compatibility-test-page-description">
          Test the Stroke Rate app across different browsers and devices to ensure optimal compatibility.
        </p>
      </div>

      {/* Current Browser Test */}
      <section className="compatibility-current-test">
        <h2 className="compatibility-section-title">Current Browser Test</h2>
        <CompatibilityTest 
          onTestComplete={handleTestComplete}
          showDetailedReport={true}
        />
      </section>

      {/* Test Results Summary */}
      {summary && (
        <section className="compatibility-summary">
          <h2 className="compatibility-section-title">Test Results Summary</h2>
          <div className="compatibility-summary-grid">
            <div className="compatibility-summary-item">
              <div className="compatibility-summary-icon">
                <CheckCircleIcon className="success-icon" />
              </div>
              <div className="compatibility-summary-content">
                <h3 className="compatibility-summary-title">Fully Supported</h3>
                <p className="compatibility-summary-count">{summary.fullySupported}</p>
              </div>
            </div>
            
            <div className="compatibility-summary-item">
              <div className="compatibility-summary-icon">
                <ExclamationTriangleIcon className="warning-icon" />
              </div>
              <div className="compatibility-summary-content">
                <h3 className="compatibility-summary-title">Partially Supported</h3>
                <p className="compatibility-summary-count">{summary.partiallySupported}</p>
              </div>
            </div>
            
            <div className="compatibility-summary-item">
              <div className="compatibility-summary-icon">
                <XCircleIcon className="error-icon" />
              </div>
              <div className="compatibility-summary-content">
                <h3 className="compatibility-summary-title">Not Supported</h3>
                <p className="compatibility-summary-count">{summary.unsupported}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Testing Instructions */}
      <section className="compatibility-instructions">
        <h2 className="compatibility-section-title">Testing Instructions</h2>
        <div className="compatibility-instructions-grid">
          <div className="compatibility-instruction">
            <div className="compatibility-instruction-icon">
              <DevicePhoneMobileIcon className="instruction-icon" />
            </div>
            <div className="compatibility-instruction-content">
              <h3 className="compatibility-instruction-title">Android Chrome</h3>
              <p className="compatibility-instruction-description">
                Test on Android device with Chrome browser. This should provide full Web Bluetooth API support.
              </p>
              <ul className="compatibility-instruction-steps">
                <li>Open Chrome browser on Android device</li>
                <li>Navigate to the app URL</li>
                <li>Test heart rate device connection</li>
                <li>Verify all features work correctly</li>
              </ul>
            </div>
          </div>

          <div className="compatibility-instruction">
            <div className="compatibility-instruction-icon">
              <ExclamationTriangleIcon className="instruction-icon warning" />
            </div>
            <div className="compatibility-instruction-content">
              <h3 className="compatibility-instruction-title">iOS Safari</h3>
              <p className="compatibility-instruction-description">
                Test on iOS device with Safari browser. Web Bluetooth API is not supported, but other features should work.
              </p>
              <ul className="compatibility-instruction-steps">
                <li>Open Safari browser on iOS device</li>
                <li>Navigate to the app URL</li>
                <li>Verify graceful degradation works</li>
                <li>Test data viewing and export features</li>
              </ul>
            </div>
          </div>

          <div className="compatibility-instruction">
            <div className="compatibility-instruction-icon">
              <ComputerDesktopIcon className="instruction-icon" />
            </div>
            <div className="compatibility-instruction-content">
              <h3 className="compatibility-instruction-title">Desktop Chrome</h3>
              <p className="compatibility-instruction-description">
                Test on desktop with Chrome browser. Should provide full functionality for development and testing.
              </p>
              <ul className="compatibility-instruction-steps">
                <li>Open Chrome browser on desktop</li>
                <li>Navigate to the app URL</li>
                <li>Test all features and performance</li>
                <li>Verify PWA installation works</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Known Issues and Limitations */}
      <section className="compatibility-limitations">
        <h2 className="compatibility-section-title">Known Issues and Limitations</h2>
        <div className="compatibility-limitations-content">
          <div className="compatibility-limitation">
            <h3 className="compatibility-limitation-title">
              <ExclamationTriangleIcon className="limitation-icon" />
              iOS Safari Web Bluetooth Support
            </h3>
            <p className="compatibility-limitation-description">
              iOS Safari does not support the Web Bluetooth API, which is required for heart rate monitoring. 
              Users on iOS will see a warning message and cannot connect to heart rate devices.
            </p>
            <div className="compatibility-limitation-workarounds">
              <h4>Workarounds:</h4>
              <ul>
                <li>Use Chrome or Edge browser on iOS (limited support)</li>
                <li>Use a dedicated Android device for heart rate monitoring</li>
                <li>Use the app in data-only mode (view historical data)</li>
              </ul>
            </div>
          </div>

          <div className="compatibility-limitation">
            <h3 className="compatibility-limitation-title">
              <ExclamationTriangleIcon className="limitation-icon" />
              Android Browser Compatibility
            </h3>
            <p className="compatibility-limitation-description">
              Web Bluetooth API is only fully supported in Chrome on Android. Other browsers may have limited or no support.
            </p>
            <div className="compatibility-limitation-workarounds">
              <h4>Recommendations:</h4>
              <ul>
                <li>Use Chrome browser for best compatibility</li>
                <li>Ensure Android version is 6.0 or higher</li>
                <li>Enable Bluetooth and location services</li>
              </ul>
            </div>
          </div>

          <div className="compatibility-limitation">
            <h3 className="compatibility-limitation-title">
              <ExclamationTriangleIcon className="limitation-icon" />
              PWA Installation Requirements
            </h3>
            <p className="compatibility-limitation-description">
              Progressive Web App features require HTTPS and modern browser support. Some older browsers may not support installation.
            </p>
            <div className="compatibility-limitation-workarounds">
              <h4>Requirements:</h4>
              <ul>
                <li>HTTPS connection (required for PWA)</li>
                <li>Modern browser with service worker support</li>
                <li>Sufficient storage space for offline functionality</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Future iOS Support Plan */}
      <section className="compatibility-future-plan">
        <h2 className="compatibility-section-title">Future iOS Support Plan</h2>
        <div className="compatibility-future-content">
          <p className="compatibility-future-description">
            After Phase 5 completion, we plan to implement graceful degradation for iOS Safari users, 
            allowing them to use the app with disabled Bluetooth features.
          </p>
          
          <div className="compatibility-future-features">
            <h3>Planned iOS Features:</h3>
            <ul>
              <li>✅ View historical session data</li>
              <li>✅ Export data to CSV/JSON</li>
              <li>✅ Progress tracking and analytics</li>
              <li>✅ Offline data management</li>
              <li>❌ Real-time heart rate monitoring (disabled)</li>
              <li>❌ Bluetooth device connection (disabled)</li>
            </ul>
          </div>

          <div className="compatibility-future-ui">
            <h3>UI Changes for iOS:</h3>
            <ul>
              <li>Grayed out Bluetooth connection buttons</li>
              <li>Clear messaging about iOS limitations</li>
              <li>Alternative workflow for data-only usage</li>
              <li>Recommendations for compatible devices</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
