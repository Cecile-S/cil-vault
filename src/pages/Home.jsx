import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Wrench, FileText, Bell, Plus, AlertTriangle, ChevronRight, Building2, MapPin, Ruler, Layers } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useProperty } from '../hooks/useProperty'

export default function Home() {
  const { properties } = useProperty()
  const [equipment] = useLocalStorage('cil-equipment', [])
  const [documents] = useLocalStorage('cil-documents', [])
  const [alerts] = useLocalStorage('cil-alerts', [])

  const activeAlerts = alerts.filter(a => !a.dismissed).length
  const property = properties[0]

  // If multiple properties, show list
  if (properties.length > 1) {
    return <PropertyList properties={properties} />
  }

  const typeLabels = {
    appartement: 'Appartement',
    maison: 'Maison',
    immeuble: 'Immeuble',
    local_commercial: 'Local commercial',
    autre: 'Autre',
  }

  const typeIcons = {
    appartement: '🏢',
    maison: '🏠',
    immeuble: '🏗️',
    local_commercial: '🏪',
    autre: '📍',
  }

  // Récupère une adresse courte (avant le code postal)
  const shortAddress = property?.adresse
    ? property.adresse.split(',')[0]
    : null

  return (
    <div className="space-y-5">

      {/* Property card */}
      {property && (
        <Link to="/property" className="card block hover:shadow-md transition-shadow">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-cream-dark rounded-xl text-2xl">
              {typeIcons[property.type] || '🏠'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-lg truncate">{shortAddress || property.adresse}</h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
                {property.type && <span>{typeLabels[property.type] || property.type}</span>}
                {property.surface && <span className="flex items-center gap-1"><Ruler className="w-3.5 h-3.5" />{property.surface} m²</span>}
                {property.nb_pieces && <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" />{property.nb_pieces} pièce{property.nb_pieces > 1 ? 's' : ''}</span>}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
          </div>
        </Link>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <Link to="/equipment" className="card text-center hover:shadow-md transition-shadow py-4">
          <Wrench className="w-5 h-5 mx-auto text-menthe" />
          <p className="text-2xl font-bold mt-2 font-brand">{equipment.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Équipements</p>
        </Link>
        <Link to="/documents" className="card text-center hover:shadow-md transition-shadow py-4">
          <FileText className="w-5 h-5 mx-auto text-cil-blue" />
          <p className="text-2xl font-bold mt-2 font-brand">{documents.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Documents</p>
        </Link>
        <Link to="/alerts" className="card text-center hover:shadow-md transition-shadow py-4 relative">
          <Bell className="w-5 h-5 mx-auto text-corail" />
          <p className="text-2xl font-bold mt-2 font-brand">{activeAlerts}</p>
          <p className="text-xs text-slate-500 mt-0.5">Alertes</p>
          {activeAlerts > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-corail text-white text-xs rounded-full flex items-center justify-center font-bold">
              {activeAlerts}
            </span>
          )}
        </Link>
      </div>

      {/* Quick actions */}
      <section>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Ajouter</h3>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/equipment" className="card flex flex-col items-center justify-center py-6 gap-2 hover:shadow-md transition-shadow border-2 border-dashed border-slate-200 hover:border-menthe/50">
            <div className="p-3 bg-menthe/10 rounded-full">
              <Wrench className="w-6 h-6 text-menthe" />
            </div>
            <span className="text-sm font-medium">Équipement</span>
          </Link>
          <Link to="/documents" className="card flex flex-col items-center justify-center py-6 gap-2 hover:shadow-md transition-shadow border-2 border-dashed border-slate-200 hover:border-cil-blue/50">
            <div className="p-3 bg-cil-blue/10 rounded-full">
              <FileText className="w-6 h-6 text-cil-blue" />
            </div>
            <span className="text-sm font-medium">Document</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <section className="text-center pt-4">
        <p className="text-xs text-slate-400">CILIA — Carnet d'Information Logement</p>
        <p className="text-xs text-slate-300 mt-0.5">Obligatoire en France depuis 2023</p>
      </section>
    </div>
  )
}

function PropertyList({ properties }) {
  const typeIcons = {
    appartement: '🏢',
    maison: '🏠',
    immeuble: '🏗️',
    local_commercial: '🏪',
    autre: '📍',
  }

  const typeLabels = {
    appartement: 'Appartement',
    maison: 'Maison',
    immeuble: 'Immeuble',
    local_commercial: 'Local commercial',
    autre: 'Autre',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Mes biens</h2>
          <p className="text-sm text-slate-500">{properties.length} bien{properties.length > 1 ? 's' : ''}</p>
        </div>
        <Link to="/property" className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Ajouter
        </Link>
      </div>

      <div className="space-y-3">
        {properties.map((prop) => (
          <Link key={prop.id} to="/property" className="card block hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-cream-dark rounded-xl text-xl">
                {typeIcons[prop.type] || '🏠'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{prop.adresse?.split(',')[0] || prop.adresse}</h3>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-0.5 text-sm text-slate-500">
                  {prop.type && <span>{typeLabels[prop.type]}</span>}
                  {prop.surface && <span>{prop.surface} m²</span>}
                  {prop.nb_pieces && <span>{prop.nb_pieces} pc{prop.nb_pieces > 1 ? 's' : ''}</span>}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 shrink-0 mt-2" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
