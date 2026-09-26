import './storagePolyfill';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Switch to a new version as soon as it's deployed, and check again whenever the app comes back to the
// foreground, so no phone keeps running an old copy with old sync rules.
registerSW({ immediate: true, onRegisteredSW(_url, reg) {
  if (!reg) return;
  const check = () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); };
  document.addEventListener('visibilitychange', check);
  setInterval(check, 30 * 60 * 1000);
} });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
