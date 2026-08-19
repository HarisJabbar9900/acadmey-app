import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught React Error:", error, errorInfo);
  }

  handleReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', backgroundColor: '#020617', color: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
          <div style={{ padding: '2rem', backgroundColor: '#0f172a', borderRadius: '1.5rem', border: '1px solid #334155', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '0.75rem' }}>Al-Zia Science Academy</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              System updated. Click below to restore & sync fresh portal records.
            </p>
            <button
              onClick={this.handleReset}
              style={{ width: '100%', padding: '0.75rem 1.5rem', backgroundColor: '#4f46e5', color: '#ffffff', fontWeight: 'bold', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
            >
              🔄 Restore Portal Data & Load App
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
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
