import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error details
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Log to error monitoring service (Sentry, etc.) if configured
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack
          }
        }
      });
    }

    // Log to custom analytics if available
    if (window.analytics && window.analytics.track) {
      window.analytics.track('Error Boundary Triggered', {
        error: error.toString(),
        errorInfo: errorInfo.componentStack,
        errorCount: this.state.errorCount + 1
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          resetError: this.handleReset
        });
      }

      // Default fallback UI
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <h1 style={styles.title}>⚠️ Something went wrong</h1>
            <p style={styles.description}>
              We're sorry, but something unexpected happened. The error has been logged and we'll look into it.
            </p>

            {process.env.NODE_ENV === 'development' && (
              <details style={styles.details}>
                <summary style={styles.summary}>Error Details (Development Only)</summary>
                <pre style={styles.pre}>
                  <strong>Error:</strong> {this.state.error && this.state.error.toString()}
                  {'\n\n'}
                  <strong>Stack Trace:</strong>
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div style={styles.buttonGroup}>
              <button onClick={this.handleReset} style={styles.button}>
                Try Again
              </button>
              <button onClick={this.handleReload} style={{...styles.button, ...styles.buttonSecondary}}>
                Reload Page
              </button>
              {this.props.onError && (
                <button 
                  onClick={() => this.props.onError(this.state.error)} 
                  style={{...styles.button, ...styles.buttonSecondary}}
                >
                  Report Issue
                </button>
              )}
            </div>

            <p style={styles.footer}>
              Error Count: {this.state.errorCount} | Time: {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '40px',
    maxWidth: '600px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#d32f2f',
    marginBottom: '16px'
  },
  description: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '24px',
    lineHeight: '1.5'
  },
  details: {
    textAlign: 'left',
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    border: '1px solid #e0e0e0'
  },
  summary: {
    cursor: 'pointer',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#333'
  },
  pre: {
    fontSize: '12px',
    color: '#d32f2f',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    overflowX: 'auto'
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  button: {
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    outline: 'none'
  },
  buttonSecondary: {
    backgroundColor: '#757575'
  },
  footer: {
    fontSize: '12px',
    color: '#999',
    marginTop: '24px'
  }
};

export default ErrorBoundary;
