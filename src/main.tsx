import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { NextUIProvider } from '@nextui-org/react'
import './index.css'
import App from './App.tsx'

import { ToastProvider } from './components/ui/ToastProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NextUIProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </NextUIProvider>
  </StrictMode>,
)
