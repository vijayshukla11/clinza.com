import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initAnalytics } from './services/analyticsService';
import { initMetaPixel } from './services/metaPixelService';
import { initClarity } from './services/clarityService';

// Initialize performance tracker, session recorder, GTM, and Facebook Pixels
if (typeof window !== "undefined") {
  initAnalytics();
  initMetaPixel();
  initClarity();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
