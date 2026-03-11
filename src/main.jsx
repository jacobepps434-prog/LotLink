import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LotLink from './LotLink.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LotLink />
  </StrictMode>,
)