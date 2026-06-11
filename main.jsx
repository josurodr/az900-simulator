import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './AZ900_Simulator.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
