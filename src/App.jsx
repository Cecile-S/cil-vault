<<<<<<< Updated upstream
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Equipment from './pages/Equipment'
import Documents from './pages/Documents'
import Alerts from './pages/Alerts'
import Property from './pages/Property'
import { useProperty } from './hooks/useProperty'
=======
import FicheEquipement from './components/FicheEquipement';
>>>>>>> Stashed changes

function App() {
  const { properties, loading } = useProperty()
  const hasProperty = properties && properties.length > 0

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-marine border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 mt-4">Chargement de CILIA...</p>
        </div>
      </Layout>
    )
  }

  // Si aucun bien n'existe, rediriger vers la creation d'un bien
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
<<<<<<< Updated upstream
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/property" element={<Property />} />
        {hasProperty && (
          <>
            <Route path="/equipment" element={<Equipment />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/alerts" element={<Alerts />} />
          </>
        )}
      </Routes>
    </Layout>
  )
=======
    <div className="App">
      <header className="App-header">
        <h1>CIL Vault</h1>
        <p>Système de gestion des équipements</p>
      </header>
      <main>
        <FicheEquipement />
      </main>
    </div>
  );
>>>>>>> Stashed changes
}

export default App
