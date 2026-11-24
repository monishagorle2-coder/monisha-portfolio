import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/main.css';

// Prevent unwanted browser auto-scroll restoration on reload so portfolio cleanly starts at hero
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
