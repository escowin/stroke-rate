import { useState } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  InformationCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface AccessibilityTestProps {
  onTestComplete?: (results: AccessibilityTestResults) => void;
}

interface AccessibilityTestResults {
  totalTests: number;
  passed: number;
  failed: number;
  warnings: number;
  score: number;
  details: AccessibilityTestDetail[];
}

interface AccessibilityTestDetail {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  element?: string;
  recommendation?: string;
}

export const AccessibilityTest = ({ onTestComplete }: AccessibilityTestProps) => {
  const [results, setResults] = useState<AccessibilityTestResults | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const runAccessibilityTests = async () => {
    setIsRunning(true);
    const testResults: AccessibilityTestDetail[] = [];

    // Test 1: Check for proper heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headingLevels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)));
    let hasProperHierarchy = true;
    let currentLevel = 0;
    
    for (const level of headingLevels) {
      if (level > currentLevel + 1) {
        hasProperHierarchy = false;
        break;
      }
      currentLevel = level;
    }

    testResults.push({
      test: 'Heading Hierarchy',
      status: hasProperHierarchy ? 'pass' : 'fail',
      message: hasProperHierarchy 
        ? 'Proper heading hierarchy detected'
        : 'Heading hierarchy is not properly structured',
      recommendation: 'Ensure headings follow logical order (h1 → h2 → h3, etc.)'
    });

    // Test 2: Check for ARIA labels
    const interactiveElements = document.querySelectorAll('button, input, select, textarea, [role="button"]');
    let ariaLabelsCount = 0;
    let totalInteractive = interactiveElements.length;

    interactiveElements.forEach(element => {
      if (element.hasAttribute('aria-label') || 
          element.hasAttribute('aria-labelledby') || 
          element.textContent?.trim()) {
        ariaLabelsCount++;
      }
    });

    const ariaCoverage = totalInteractive > 0 ? (ariaLabelsCount / totalInteractive) * 100 : 100;
    
    testResults.push({
      test: 'ARIA Labels',
      status: ariaCoverage >= 80 ? 'pass' : ariaCoverage >= 60 ? 'warning' : 'fail',
      message: `${ariaLabelsCount}/${totalInteractive} interactive elements have proper labels (${ariaCoverage.toFixed(1)}%)`,
      recommendation: 'Add aria-label or aria-labelledby to interactive elements without visible text'
    });

    // Test 3: Check for alt text on images
    const images = document.querySelectorAll('img');
    let imagesWithAlt = 0;
    
    images.forEach(img => {
      if (img.hasAttribute('alt')) {
        imagesWithAlt++;
      }
    });

    const altCoverage = images.length > 0 ? (imagesWithAlt / images.length) * 100 : 100;
    
    testResults.push({
      test: 'Image Alt Text',
      status: altCoverage >= 90 ? 'pass' : altCoverage >= 70 ? 'warning' : 'fail',
      message: `${imagesWithAlt}/${images.length} images have alt text (${altCoverage.toFixed(1)}%)`,
      recommendation: 'Add alt attributes to all images'
    });

    // Test 4: Check for form labels
    const formInputs = document.querySelectorAll('input, select, textarea');
    let labeledInputs = 0;
    
    formInputs.forEach(input => {
      const id = input.getAttribute('id');
      const hasLabel = id && document.querySelector(`label[for="${id}"]`);
      const hasAriaLabel = input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby');
      
      if (hasLabel || hasAriaLabel) {
        labeledInputs++;
      }
    });

    const labelCoverage = formInputs.length > 0 ? (labeledInputs / formInputs.length) * 100 : 100;
    
    testResults.push({
      test: 'Form Labels',
      status: labelCoverage >= 90 ? 'pass' : labelCoverage >= 70 ? 'warning' : 'fail',
      message: `${labeledInputs}/${formInputs.length} form inputs have labels (${labelCoverage.toFixed(1)}%)`,
      recommendation: 'Associate labels with form inputs using for/id attributes'
    });

    // Test 5: Check for keyboard navigation
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    let keyboardAccessible = 0;
    
    focusableElements.forEach(element => {
      const tabIndex = element.getAttribute('tabindex');
      if (tabIndex !== '-1' && !element.hasAttribute('disabled')) {
        keyboardAccessible++;
      }
    });

    const keyboardCoverage = focusableElements.length > 0 ? (keyboardAccessible / focusableElements.length) * 100 : 100;
    
    testResults.push({
      test: 'Keyboard Navigation',
      status: keyboardCoverage >= 90 ? 'pass' : keyboardCoverage >= 70 ? 'warning' : 'fail',
      message: `${keyboardAccessible}/${focusableElements.length} elements are keyboard accessible (${keyboardCoverage.toFixed(1)}%)`,
      recommendation: 'Ensure all interactive elements are keyboard accessible'
    });

    // Test 6: Check for color contrast (simplified)
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
    let contrastIssues = 0;
    
    // This is a simplified check - in a real implementation, you'd use a proper contrast checker
    textElements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      // Basic check for high contrast colors
      if (color === 'rgb(255, 255, 255)' && backgroundColor === 'rgb(0, 0, 0)') {
        // High contrast - good
      } else if (color === 'rgb(0, 0, 0)' && backgroundColor === 'rgb(255, 255, 255)') {
        // High contrast - good
      } else {
        // This is simplified - would need proper contrast calculation
        contrastIssues++;
      }
    });

    const contrastStatus = contrastIssues < textElements.length * 0.1 ? 'pass' : 'warning';
    
    testResults.push({
      test: 'Color Contrast',
      status: contrastStatus,
      message: contrastStatus === 'pass' 
        ? 'Color contrast appears adequate'
        : 'Some text may have insufficient contrast',
      recommendation: 'Use tools like WebAIM Contrast Checker to verify contrast ratios'
    });

    // Test 7: Check for screen reader support
    const liveRegions = document.querySelectorAll('[aria-live]');
    const statusElements = document.querySelectorAll('[role="status"]');
    const alertElements = document.querySelectorAll('[role="alert"]');
    
    const screenReaderSupport = liveRegions.length + statusElements.length + alertElements.length;
    
    testResults.push({
      test: 'Screen Reader Support',
      status: screenReaderSupport >= 3 ? 'pass' : screenReaderSupport >= 1 ? 'warning' : 'fail',
      message: `Found ${screenReaderSupport} live regions and status elements`,
      recommendation: 'Add aria-live regions for dynamic content updates'
    });

    // Test 8: Check for semantic HTML
    const semanticElements = document.querySelectorAll('main, nav, header, footer, section, article, aside');
    const divElements = document.querySelectorAll('div');
    
    const semanticRatio = semanticElements.length / (semanticElements.length + divElements.length);
    
    testResults.push({
      test: 'Semantic HTML',
      status: semanticRatio >= 0.3 ? 'pass' : semanticRatio >= 0.1 ? 'warning' : 'fail',
      message: `${semanticElements.length} semantic elements found (${(semanticRatio * 100).toFixed(1)}% of containers)`,
      recommendation: 'Use semantic HTML elements instead of generic divs where appropriate'
    });

    // Calculate results
    const passed = testResults.filter(t => t.status === 'pass').length;
    const failed = testResults.filter(t => t.status === 'fail').length;
    const warnings = testResults.filter(t => t.status === 'warning').length;
    const totalTests = testResults.length;
    const score = Math.round((passed / totalTests) * 100);

    const finalResults: AccessibilityTestResults = {
      totalTests,
      passed,
      failed,
      warnings,
      score,
      details: testResults
    };

    setResults(finalResults);
    setIsRunning(false);

    if (onTestComplete) {
      onTestComplete(finalResults);
    }
  };

  const getStatusIcon = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass':
        return <CheckCircleIcon className="accessibility-test-icon accessibility-test-icon--pass" />;
      case 'fail':
        return <XCircleIcon className="accessibility-test-icon accessibility-test-icon--fail" />;
      case 'warning':
        return <ExclamationTriangleIcon className="accessibility-test-icon accessibility-test-icon--warning" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'accessibility-test-score--excellent';
    if (score >= 80) return 'accessibility-test-score--good';
    if (score >= 70) return 'accessibility-test-score--fair';
    return 'accessibility-test-score--poor';
  };

  return (
    <div className="accessibility-test">
      <div className="accessibility-test-header">
        <h2 className="accessibility-test-title">
          <EyeIcon className="accessibility-test-title-icon" />
          Accessibility Test
        </h2>
        <button
          onClick={runAccessibilityTests}
          disabled={isRunning}
          className="btn btn-primary"
        >
          {isRunning ? 'Running Tests...' : 'Run Tests'}
        </button>
      </div>

      {isRunning && (
        <div className="accessibility-test-loading">
          <div className="loading-spinner"></div>
          <p>Running accessibility tests...</p>
        </div>
      )}

      {results && (
        <div className="accessibility-test-results">
          <div className="accessibility-test-summary">
            <div className="accessibility-test-score">
              <span className={`accessibility-test-score-value ${getScoreColor(results.score)}`}>
                {results.score}%
              </span>
              <span className="accessibility-test-score-label">Accessibility Score</span>
            </div>
            
            <div className="accessibility-test-stats">
              <div className="accessibility-test-stat">
                <CheckCircleIcon className="accessibility-test-stat-icon accessibility-test-stat-icon--pass" />
                <span className="accessibility-test-stat-value">{results.passed}</span>
                <span className="accessibility-test-stat-label">Passed</span>
              </div>
              <div className="accessibility-test-stat">
                <ExclamationTriangleIcon className="accessibility-test-stat-icon accessibility-test-stat-icon--warning" />
                <span className="accessibility-test-stat-value">{results.warnings}</span>
                <span className="accessibility-test-stat-label">Warnings</span>
              </div>
              <div className="accessibility-test-stat">
                <XCircleIcon className="accessibility-test-stat-icon accessibility-test-stat-icon--fail" />
                <span className="accessibility-test-stat-value">{results.failed}</span>
                <span className="accessibility-test-stat-label">Failed</span>
              </div>
            </div>
          </div>

          <div className="accessibility-test-actions">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="btn btn-secondary"
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </button>
          </div>

          {showDetails && (
            <div className="accessibility-test-details">
              <h3 className="accessibility-test-details-title">Test Details</h3>
              <div className="accessibility-test-details-list">
                {results.details.map((detail, index) => (
                  <div key={index} className="accessibility-test-detail">
                    <div className="accessibility-test-detail-header">
                      {getStatusIcon(detail.status)}
                      <span className="accessibility-test-detail-test">{detail.test}</span>
                    </div>
                    <p className="accessibility-test-detail-message">{detail.message}</p>
                    {detail.recommendation && (
                      <p className="accessibility-test-detail-recommendation">
                        <InformationCircleIcon className="accessibility-test-detail-icon" />
                        {detail.recommendation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
