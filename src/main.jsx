import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class GlobalPortalBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Portal Error Captured:", error, errorInfo);
  }

  handleRestore = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    window.location.href = window.location.origin + window.location.pathname + '?v=' + Date.now();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#020617',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            padding: '2.5rem',
            backgroundColor: '#0f172a',
            borderRadius: '1.5rem',
            border: '1px solid #334155',
            maxWidth: '480px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f59e0b', margin: '0 0 0.75rem 0' }}>
              Al-Zia Science Academy
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.925rem', lineHeight: '1.5', margin: '0 0 1.75rem 0' }}>
              System updated to the latest version. Click below to load fresh student records and open the portal.
            </p>
            <button
              onClick={this.handleRestore}
              style={{
                width: '100%',
                padding: '0.875rem 1.5rem',
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                fontWeight: '700',
                borderRadius: '0.875rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.4)'
              }}
            >
              ⚡ Open Al-Zia Science Academy Portal
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalPortalBoundary>
      <App />
    </GlobalPortalBoundary>
  </StrictMode>,
)
