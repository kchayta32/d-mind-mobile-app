
import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent auto-scroll and restore behavior
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Prevent any automatic scrolling
const preventScroll = () => {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

// Apply scroll prevention immediately
preventScroll();

// Add event listeners to prevent scroll
document.addEventListener('DOMContentLoaded', preventScroll);
window.addEventListener('load', preventScroll);
window.addEventListener('beforeunload', () => {
  preventScroll();
});

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
