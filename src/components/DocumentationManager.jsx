import { useState } from 'react'
import { FileText, Search, ExternalLink, Download, Trash2, Plus, BookOpen } from 'lucide-react'

// Base de données de liens vers notices constructeur (exemples)
const MANUFACTURER_NOTICES = {
  // Chaudières
  'chaudiere frisquet': 'https://www.frisquet.com/documentation',
  'chaudiere de dietrich': 'https://www.de Dietrich.com/fr/notices',
  'chaudiere saunier': 'https://www.saunier-duval.fr/documentation',
  'chaudiere viessmann': 'https://www.viessmann.com/fr/documentation/',
  'chaudiere elm leblanc': 'https://www.elm-leblanc.com/notices',
  
  // VMC
  'vmc atlantic': 'https://www.atlantic.fr/documentation-vmc',
  'vmc aldès': 'https://www.aldes.fr/documentation/',
  'vmc helix': 'https://www.helex.fr/documentation/',
  
  // PAC
  'pac daikin': 'https://www.daikin.fr/fr/documentation',
  'pac mitsubishi': 'https://www.mitsubishi-electric.fr/documentation',
  'pac atlantic': 'https://www.atlantic.fr/documentation-pompes-a-chaleur',
  'pac panasonic': 'https://www.panasonic.com/fr/documentation/',
  
  // Chauffe-eau
  'chauffe-eau ariston': 'https://www.ariston.com/documentation',
  'chaudiere chaudiere': 'https://www.sauter.fr/documentation',
}

export default function DocumentationManager({ equipment = [] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [notices, setNotices] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newNotice, setNewNotice] = useState({
    equipmentId: '',
    title: '',
    url: '',
    notes: '',
  })

  // Search for equipment manuals online
  const searchManual = async (query) => {
    if (!query || query.length < 3) return
    
    setSearchQuery(query)
    
    // Check known manufacturers
    const queryLower = query.toLowerCase()
    for (const [key, url] of Object.entries(MANUFACTURER_NOTICES)) {
      if (queryLower.includes(key)) {
        setNotices(prev => [...prev, {
          id: Date.now(),
          title: `Notice ${key}`,
          url: url,
          source: 'manufacturer',
          foundAt: new Date().toISOString(),
        }])
        return
      }
    }
    
    // For unknown manufacturers, suggest Google search
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(query + ' notice mode emploi PDF')}`
    setNotices(prev => [...prev, {
      id: Date.now(),
      title: query,
      url: googleSearchUrl,
      source: 'google',
      foundAt: new Date().toISOString(),
    }])
  }

  const handleAddNotice = () => {
    if (!newNotice.title) return
    
    const equipmentItem = equipment.find(e => e.id === parseInt(newNotice.equipmentId))
    
    setNotices([...notices, {
      id: Date.now(),
      equipmentId: newNotice.equipmentId,
      equipmentName: equipmentItem ? equipmentItem.name : null,
      title: newNotice.title,
      url: newNotice.url,
      notes: newNotice.notes,
      source: 'manual',
      addedAt: new Date().toISOString(),
    }])
    
    setNewNotice({ equipmentId: '', title: '', url: '', notes: '' })
    setShowAddForm(false)
  }

  const handleDeleteNotice = (id) => {
    if (confirm('Supprimer cette notice ?')) {
      setNotices(notices.filter(n => n.id !== id))
    }
  }

  const openExternalLink = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const getSourceLabel = (source) => {
    switch (source) {
      case 'manufacturer': return 'Site constructeur'
      case 'google': return 'Recherche Google'
      case 'manual': return 'Ajout manuel'
      default: return 'Inconnu'
    }
  }

  const getSourceIcon = (source) => {
    return <ExternalLink className="w-3 h-3" />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Documentation du bien
        </h3>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-secondary flex items-center gap-1 text-sm"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Search for manuals */}
      <div className="card space-y-3">
        <label className="block text-sm font-medium">
          Rechercher une notice automatiquement
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            className="input flex-1"
            placeholder="Ex: Chaudière Frisquet Optima..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchManual(searchQuery)}
          />
          <button 
            onClick={() => searchManual(searchQuery)}
            className="btn btn-primary flex items-center gap-2"
            disabled={searchQuery.length < 3}
          >
            <Search className="w-4 h-4" />
            Chercher
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Entrez le modèle de votre équipement pour trouver la notice
        </p>
      </div>

      {/* Add manual form */}
      {showAddForm && (
        <div className="card space-y-3">
          <h4 className="font-medium">Ajouter une notice manuellement</h4>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Équipement associé
            </label>
            <select
              className="input"
              value={newNotice.equipmentId}
              onChange={(e) => setNewNotice({ ...newNotice, equipmentId: e.target.value })}
            >
              <option value="">Général (pas d'équipement)</option>
              {equipment.map(eq => (
                <option key={eq.id} value={eq.id}>
                  {eq.name || eq.typeLabel || eq.type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Titre</label>
            <input
              type="text"
              className="input"
              placeholder="Ex: Mode d'emploi Chaudière"
              value={newNotice.title}
              onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">URL</label>
            <input
              type="url"
              className="input"
              placeholder="https://..."
              value={newNotice.url}
              onChange={(e) => setNewNotice({ ...newNotice, url: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              className="input"
              rows={2}
              placeholder="Remarques..."
              value={newNotice.notes}
              onChange={(e) => setNewNotice({ ...newNotice, notes: e.target.value })}
            />
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleAddNotice}
              className="btn btn-primary flex-1"
              disabled={!newNotice.title}
            >
              Enregistrer
            </button>
            <button 
              onClick={() => setShowAddForm(false)}
              className="btn btn-secondary"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Notices list */}
      {notices.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <p>Aucune notice enregistrée</p>
          <p className="text-sm">Recherchez ou ajoutez des notices d'équipements</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notices.map(notice => (
            <div key={notice.id} className="card flex items-start justify-between">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">{notice.title}</h4>
                  {notice.equipmentName && (
                    <p className="text-xs text-slate-500">
                      Pour: {notice.equipmentName}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs badge badge-blue">
                      {getSourceIcon(notice.source)}
                      <span className="ml-1">{getSourceLabel(notice.source)}</span>
                    </span>
                  </div>
                  {notice.notes && (
                    <p className="text-sm text-slate-600 mt-1">{notice.notes}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openExternalLink(notice.url)}
                  className="p-2 text-slate-400 hover:text-blue-500"
                  title="Ouvrir le lien"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteNotice(notice.id)}
                  className="p-2 text-slate-400 hover:text-red-500"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}