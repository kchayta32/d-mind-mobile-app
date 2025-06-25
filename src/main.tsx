
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Wait for React to be fully loaded
const waitForReact = () => {
  return new Promise<void>((resolve) => {
    if (React && React.useState && React.useContext) {
      resolve();
    } else {
      setTimeout(() => {
        waitForReact().then(resolve);
      }, 10);
    }
  });
};

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

const initializeApp = async () => {
  // Wait for React to be ready
  await waitForReact();
  
  const rootElement = document.getElementById("root");
  if (!rootElement) throw new Error('Failed to find the root element');

  const root = createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Initialize the app
initializeApp().catch(console.error);
