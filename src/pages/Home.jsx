import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Thermometer, FileText, Bell, ArrowRight } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'

export default function Home() {
  const [equipment] = useLocalStorage('cil-equipment', [])
  const [alerts] = useLocalStorage('cil-alerts', [])
  const [documents] = useLocalStorage('cil-documents', [])
  const [apiStatus, setApiStatus] = useState('checking')

  useEffect(() => {
    // Check API health
    fetch('http://84.247.161.15:8001/')
      .then(res => res.json())
      .then(data => setApiStatus('online'))
      .catch(() => setApiStatus('offline'))
  }, [])

  // Calculate energy score (simulated for demo)
  const energyScore = equipment.length > 0 ? 'D' : '-'
  const scoreColor = {
    'A': 'text-green-600',
    'B': 'text-green-500',
    'C': 'text-yellow-500',
    'D': 'text-orange-500',
    'E': 'text-orange-600',
    'F': 'text-red-500',
    'G': 'text-red-600',
  }[energyScore] || 'text-slate-400'

  // Count active alerts
  const activeAlerts = alerts.filter(a => !a.dismissed).length

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900">Mon Carnet Logement</h2>
        <p className="text-slate-500 mt-1">
          Centralisez vos documents et suivez vos équipements
        </p>
      </section>

      {/* Energy Score Card */}
      <section className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Thermometer className="w-6 h-6 text-cil-blue" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Score énergétique</p>
              <p className={`text-3xl font-bold ${scoreColor}`}>
                {energyScore}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">API</p>
            <span className={`inline-flex items-center gap-1 text-sm ${
              apiStatus === 'online' ? 'text-green-600' :
              apiStatus === 'offline' ? 'text-red-600' : 'text-slate-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                apiStatus === 'online' ? 'bg-green-500' :
                apiStatus === 'offline' ? 'bg-red-500' : 'bg-slate-300'
              }`} />
              {apiStatus === 'online' ? 'En ligne' :
               apiStatus === 'offline' ? 'Hors ligne' : 'Vérification...'}
            </span>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-3 gap-3">
        <Link to="/equipment" className="card text-center hover:shadow-md transition-shadow">
          <Wrench className="w-5 h-5 mx-auto text-slate-400" />
          <p className="text-2xl font-bold mt-2">{equipment.length}</p>
          <p className="text-xs text-slate-500">Équipements</p>
        </Link>
        <Link to="/documents" className="card text-center hover:shadow-md transition-shadow">
          <FileText className="w-5 h-5 mx-auto text-slate-400" />
          <p className="text-2xl font-bold mt-2">{documents.length}</p>
          <p className="text-xs text-slate-500">Documents</p>
        </Link>
        <Link to="/alerts" className="card text-center hover:shadow-md transition-shadow relative">
          <Bell className="w-5 h-5 mx-auto text-slate-400" />
          <p className="text-2xl font-bold mt-2">{activeAlerts}</p>
          <p className="text-xs text-slate-500">Alertes</p>
          {activeAlerts > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {activeAlerts}
            </span>
          )}
        </Link>
      </section>

      {/* Quick Actions */}
      <section>
        <h3 className="text-lg font-semibold mb-3">Actions rapides</h3>
        <div className="space-y-2">
          <Link to="/documents" className="card flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium">Ajouter un document</p>
                <p className="text-sm text-slate-500">DPE, facture, contrat...</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </Link>

          <Link to="/equipment" className="card flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Wrench className="w-5 h-5 text-cil-blue" />
              </div>
              <div>
                <p className="font-medium">Ajouter un équipement</p>
                <p className="text-sm text-slate-500">Chaudière, VMC, PAC...</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </Link>
        </div>
      </section>

      {/* Info */}
      <section className="text-center text-sm text-slate-400 py-4">
        <p>CIL Vault - Carnet d'Information Logement</p>
        <p>Obligatoire en France depuis 2023</p>
      </section>
    </div>
  )
}

function Wrench({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}
