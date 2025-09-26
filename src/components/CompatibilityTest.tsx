import { useState, useEffect } from 'react';
import { 
  generateCompatibilityReport, 
  testWebBluetoothSupport, 
  getCompatibilityStatus,
  getDetailedCompatibilityReport,
  type CompatibilityReport 
} from '../utils/browserCompatibility';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  InformationCircleIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

interface CompatibilityTestProps {
  onTestComplete?: (report: CompatibilityReport) => void;
  showDetailedReport?: boolean;
}

export const CompatibilityTest = ({ onTestComplete, showDetailedReport = false }: CompatibilityTestProps) => {
  const [report, setReport] = useState<CompatibilityReport | null>(null);
  const [bluetoothTest, setBluetoothTest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullReport, setShowFullReport] = useState(showDetailedReport);

  useEffect(() => {
    const runTests = async () => {
      setIsLoading(true);
      
      try {
        // Generate compatibility report
        const compatibilityReport = generateCompatibilityReport();
        setReport(compatibilityReport);
        
        // Test Web Bluetooth support
        const bluetoothTestResult = await testWebBluetoothSupport();
        setBluetoothTest(bluetoothTestResult);
        
        // Notify parent component
        if (onTestComplete) {
          onTestComplete(compatibilityReport);
        }
      } catch (error) {
        console.error('Compatibility test failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    runTests();
  }, [onTestComplete]);

  const copyReportToClipboard = async () => {
    if (!report) return;
    
    try {
      const detailedReport = getDetailedCompatibilityReport();
      await navigator.clipboard.writeText(detailedReport);
      alert('Compatibility report copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy report:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="compatibility-test">
        <div className="compatibility-test-loading">
          <div className="loading-spinner"></div>
          <p>Testing browser compatibility...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="compatibility-test">
        <div className="compatibility-test-error">
          <XCircleIcon className="error-icon" />
          <p>Failed to generate compatibility report</p>
        </div>
      </div>
    );
  }

  const status = getCompatibilityStatus();

  return (
    <div className="compatibility-test">
      <div className="compatibility-test-header">
        <h3 className="compatibility-test-title">
          Browser Compatibility Test
        </h3>
        <div className="compatibility-test-actions">
          <button
            onClick={() => setShowFullReport(!showFullReport)}
            className="btn btn-secondary btn-sm"
          >
            {showFullReport ? 'Hide' : 'Show'} Details
          </button>
          <button
            onClick={copyReportToClipboard}
            className="btn btn-secondary btn-sm"
          >
            <ClipboardDocumentIcon className="btn-icon" />
            Copy Report
          </button>
        </div>
      </div>

      {/* Status Summary */}
      <div className={`compatibility-status compatibility-status--${status.status}`}>
        <div className="compatibility-status-icon">
          {status.status === 'supported' && <CheckCircleIcon className="status-icon" />}
          {status.status === 'partial' && <ExclamationTriangleIcon className="status-icon" />}
          {status.status === 'unsupported' && <XCircleIcon className="status-icon" />}
        </div>
        <div className="compatibility-status-content">
          <h4 className="compatibility-status-title">
            {status.message}
          </h4>
          <p className="compatibility-status-description">
            {report.browser.name} {report.browser.version} on {report.browser.platform}
          </p>
        </div>
      </div>

      {/* Feature Support Grid */}
      <div className="compatibility-features">
        <h4 className="compatibility-features-title">Feature Support</h4>
        <div className="compatibility-features-grid">
          <div className="compatibility-feature">
            <div className="compatibility-feature-icon">
              {report.browser.supportsWebBluetooth ? '✅' : '❌'}
            </div>
            <div className="compatibility-feature-content">
              <h5 className="compatibility-feature-name">Web Bluetooth API</h5>
              <p className="compatibility-feature-description">
                Required for heart rate monitoring
              </p>
            </div>
          </div>

          <div className="compatibility-feature">
            <div className="compatibility-feature-icon">
              {report.browser.supportsPWA ? '✅' : '❌'}
            </div>
            <div className="compatibility-feature-content">
              <h5 className="compatibility-feature-name">Progressive Web App</h5>
              <p className="compatibility-feature-description">
                Offline functionality and app installation
              </p>
            </div>
          </div>

          <div className="compatibility-feature">
            <div className="compatibility-feature-icon">
              {report.browser.supportsIndexedDB ? '✅' : '❌'}
            </div>
            <div className="compatibility-feature-content">
              <h5 className="compatibility-feature-name">Local Storage</h5>
              <p className="compatibility-feature-description">
                Data persistence and session storage
              </p>
            </div>
          </div>

          <div className="compatibility-feature">
            <div className="compatibility-feature-icon">
              {report.browser.supportsNotifications ? '✅' : '❌'}
            </div>
            <div className="compatibility-feature-content">
              <h5 className="compatibility-feature-name">Notifications</h5>
              <p className="compatibility-feature-description">
                Alerts and heart rate zone warnings
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Web Bluetooth Test Results */}
      {bluetoothTest && (
        <div className="compatibility-bluetooth-test">
          <h4 className="compatibility-bluetooth-title">Web Bluetooth API Test</h4>
          <div className="compatibility-bluetooth-results">
            <div className="compatibility-bluetooth-result">
              <span className="compatibility-bluetooth-label">API Available:</span>
              <span className={`compatibility-bluetooth-value ${bluetoothTest.isSupported ? 'success' : 'error'}`}>
                {bluetoothTest.isSupported ? 'Yes' : 'No'}
              </span>
            </div>
            {bluetoothTest.error && (
              <div className="compatibility-bluetooth-error">
                <ExclamationTriangleIcon className="error-icon" />
                <span>{bluetoothTest.error}</span>
              </div>
            )}
            <div className="compatibility-bluetooth-capabilities">
              <h5>Capabilities:</h5>
              <ul>
                <li>Request Device: {bluetoothTest.capabilities.canRequestDevice ? '✅' : '❌'}</li>
                <li>Connect: {bluetoothTest.capabilities.canConnect ? '✅' : '❌'}</li>
                <li>Read Characteristics: {bluetoothTest.capabilities.canReadCharacteristics ? '✅' : '❌'}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Report */}
      {showFullReport && (
        <div className="compatibility-detailed-report">
          <h4 className="compatibility-detailed-title">Detailed Report</h4>
          
          {/* Warnings */}
          {report.warnings.length > 0 && (
            <div className="compatibility-warnings">
              <h5 className="compatibility-warnings-title">
                <ExclamationTriangleIcon className="warning-icon" />
                Warnings
              </h5>
              <ul className="compatibility-warnings-list">
                {report.warnings.map((warning, index) => (
                  <li key={index} className="compatibility-warning-item">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {report.recommendations.length > 0 && (
            <div className="compatibility-recommendations">
              <h5 className="compatibility-recommendations-title">
                <InformationCircleIcon className="info-icon" />
                Recommendations
              </h5>
              <ul className="compatibility-recommendations-list">
                {report.recommendations.map((recommendation, index) => (
                  <li key={index} className="compatibility-recommendation-item">
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Graceful Degradation */}
          <div className="compatibility-degradation">
            <h5 className="compatibility-degradation-title">Available Features</h5>
            <div className="compatibility-degradation-grid">
              <div className="compatibility-degradation-item">
                <span className="compatibility-degradation-label">View Data:</span>
                <span className={`compatibility-degradation-value ${report.gracefulDegradation.canViewData ? 'success' : 'error'}`}>
                  {report.gracefulDegradation.canViewData ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="compatibility-degradation-item">
                <span className="compatibility-degradation-label">Export Data:</span>
                <span className={`compatibility-degradation-value ${report.gracefulDegradation.canExportData ? 'success' : 'error'}`}>
                  {report.gracefulDegradation.canExportData ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="compatibility-degradation-item">
                <span className="compatibility-degradation-label">Offline Features:</span>
                <span className={`compatibility-degradation-value ${report.gracefulDegradation.canUseOfflineFeatures ? 'success' : 'error'}`}>
                  {report.gracefulDegradation.canUseOfflineFeatures ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="compatibility-degradation-item">
                <span className="compatibility-degradation-label">Bluetooth Features:</span>
                <span className={`compatibility-degradation-value ${report.gracefulDegradation.bluetoothFeatures === 'full' ? 'success' : report.gracefulDegradation.bluetoothFeatures === 'limited' ? 'warning' : 'error'}`}>
                  {report.gracefulDegradation.bluetoothFeatures === 'full' ? 'Full' : 
                   report.gracefulDegradation.bluetoothFeatures === 'limited' ? 'Limited' : 'None'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
