import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Equipment from './pages/Equipment'
import Documents from './pages/Documents'
import Alerts from './pages/Alerts'
import Property from './pages/Property'
import { useProperty } from './hooks/useProperty'

function App() {
  const { properties, loading } = useProperty()
  const hasProperty = properties && properties.length > 0

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center py-12">
          <p className="text-slate-500">Chargement de l'application...</p>
        </div>
      </Layout>
    )
  }

  // If no property exists, redirect to property creation page
  if (!hasProperty) {
    return (
      <Layout>
        <Routes>
          <Route path="/" element={<Property />} />
          <Route path="/property" element={<Property />} />
        </Routes>
      </Layout>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/equipment" element={<Equipment />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/property" element={<Property />} />
      </Routes>
    </Layout>
  )
}

export default App