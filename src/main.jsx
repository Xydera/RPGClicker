import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import DiscordRPGWrapper from './discordRPGWrapper.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DiscordRPGWrapper />
  </StrictMode>,
)
