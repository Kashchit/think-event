import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './utils/debug.js'
import { registerServiceWorker } from './utils/errorHandler.js'

// Register service worker for production
registerServiceWorker();
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
