import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { PropertyProvider } from './hooks/useProperty'
import { EquipmentProvider } from './hooks/useEquipment'
import { DocumentsProvider } from './hooks/useDocuments'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <PropertyProvider>
        <EquipmentProvider>
          <DocumentsProvider>
            <App />
          </DocumentsProvider>
        </EquipmentProvider>
      </PropertyProvider>
    </BrowserRouter>
  </React.StrictMode>
)
