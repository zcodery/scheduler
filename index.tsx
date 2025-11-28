import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

const params = new URLSearchParams(window.location.search);
const readonlyParam = params.get('readonly');
const readonlyFromUrl = readonlyParam === '1' || readonlyParam === 'true';
const readonlyFromEnv = typeof import.meta !== 'undefined' && (import.meta as any).env && ((import.meta as any).env.VITE_READONLY === 'true');
const readonly = readonlyParam != null ? readonlyFromUrl : readonlyFromEnv;

root.render(
  <React.StrictMode>
    <App readonly={readonly} />
  </React.StrictMode>
);
