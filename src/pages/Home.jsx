import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Thermometer, FileText, Bell, ArrowRight, Download, FileText as FileTextIcon } from 'lucide-react'
import { useProperty } from '../hooks/useProperty'
import { useEquipment } from '../hooks/useEquipment'
import { useDocuments } from '../hooks/useDocuments'
import ExportPDF from '../components/ExportPDF'

export default function Home() {
  const { properties, loading: propLoading } = useProperty()
  const { equipment, loading: equipLoading } = useEquipment()
  const { documents, loading: docLoading } = useDocuments()
  
  const loading = propLoading || equipLoading || docLoading
  const hasProperty = properties && properties.length > 0

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

  // Count active alerts from equipment maintenance
  const today = new Date()
  const activeAlerts = equipment.filter(eq => {
    if (!eq.nextMaintenance) return false
    const next = new Date(eq.nextMaintenance)
    const days = Math.ceil((next - today) / (1000 * 60 * 60 * 24))
    return days <= 30
  }).length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-cil-blue border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 mt-4">Chargement de CILIA...</p>
        </div>
      </div>
    )
  }

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
            <p className="text-sm text-slate-500">Équipements suivis</p>
            <span className="text-2xl font-bold text-cil-blue">{equipment.length}</span>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-3 gap-3">
        <Link to="/equipment" className="card text-center hover:shadow-md transition-shadow">
          <FileTextIcon className="w-5 h-5 mx-auto text-slate-400" />
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
          <p className="text-xs text-slate-500">Alertes entretien</p>
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
                <Thermometer className="w-5 h-5 text-cil-blue" />
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

      {/* Export PDF Section */}
      <section>
        <h3 className="text-lg font-semibold mb-3">Export officiel</h3>
        <ExportPDF />
      </section>

      {/* Info */}
      <section className="text-center text-sm text-slate-400 py-4 border-t border-slate-200">
        <p>CIL Vault - Carnet d'Information Logement</p>
        <p>Obligatoire en France depuis 2023</p>
      </section>
    </div>
  )
}