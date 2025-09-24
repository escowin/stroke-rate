import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="card-base error-boundary-content">
            <div className="error-boundary-header">
              <ExclamationTriangleIcon className="error-boundary-icon" />
              <h1 className="error-boundary-title">
                Something went wrong
              </h1>
            </div>
            
            <p className="error-boundary-description">
              The app encountered an unexpected error. Please try refreshing the page.
            </p>
            
            {this.state.error && (
              <div className="error-boundary-details">
                <summary className="error-boundary-details-summary">
                  Error Details
                </summary>
                <pre className="error-boundary-details-content">
                  {this.state.error.message}
                </pre>
              </div>
            )}
            
            <div className="error-boundary-actions">
              <button
                onClick={() => window.location.reload()}
                className="error-boundary-button"
              >
                Refresh Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: undefined })}
                className="error-boundary-button error-boundary-button--secondary"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
