import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/analytics.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx';

// Inicializar medición de Web Vitals (US-001)
if (import.meta.env.PROD || import.meta.env.VITE_MEASURE_PERFORMANCE === 'true') {
  import('./utils/webVitals').then(({ initWebVitals }) => {
    initWebVitals();
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
