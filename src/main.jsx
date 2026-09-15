import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

if (new URLSearchParams(window.location.search).get('font') === 'wenkai') {
  document.documentElement.dataset.fontPreview = 'wenkai'
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
