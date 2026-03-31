import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: '1rem', background: '#0a0f1e', color: 'white',
          fontFamily: 'monospace', padding: '2rem'
        }}>
          <h2 style={{ color: '#ef4444' }}>⚠️ Runtime Error</h2>
          <pre style={{
            background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.3)',
            padding: '1.5rem', borderRadius: '8px', maxWidth: '800px',
            overflow: 'auto', fontSize: '0.85rem', color: '#fca5a5', whiteSpace: 'pre-wrap'
          }}>
            {this.state.error?.toString()}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster position="top-right" />
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
