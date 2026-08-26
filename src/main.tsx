import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles.css'
import { DemoProvider } from './context/DemoContext'
import { BackendProvider } from './context/BackendContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <BackendProvider><DemoProvider><App /></DemoProvider></BackendProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
