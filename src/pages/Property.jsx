import { useState } from 'react'
import { useProperty } from '../hooks/useProperty'
import { Home, Plus, Edit2, Trash2, Building2 } from 'lucide-react'
import AdresseAutocomplete from '../components/AdresseAutocomplete'

export default function Property() {
  const { properties, loading, error, addProperty, updateProperty, deleteProperty } = useProperty()
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(properties.length === 0)
  const [formData, setFormData] = useState({
    adresse: '',
    type: '',
    surface: '',
    nb_pieces: '',
  })

  const resetForm = () => {
    setFormData({ adresse: '', type: '', surface: '', nb_pieces: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const openEdit = (prop) => {
    setFormData({
      adresse: prop.adresse || '',
      type: prop.type || '',
      surface: prop.surface?.toString() || '',
      nb_pieces: prop.nb_pieces?.toString() || '',
    })
    setEditingId(prop.id)
    setShowForm(true)
  }

  const openNew = () => {
    resetForm()
    setShowForm(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newProperty = {
      ...formData,
      surface: parseInt(formData.surface, 10) || null,
      nb_pieces: parseInt(formData.nb_pieces, 10) || null,
      id_proprietaire: 1,
      id_mandataire: null,
      created_at: new Date().toISOString(),
    }
    if (editingId) {
      updateProperty(editingId, newProperty)
    } else {
      addProperty(newProperty)
    }
    resetForm()
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const typeOptions = [
    { value: 'appartement', label: 'Appartement' },
    { value: 'maison', label: 'Maison' },
    { value: 'immeuble', label: 'Immeuble' },
    { value: 'local_commercial', label: 'Local commercial' },
    { value: 'autre', label: 'Autre' },
  ]

  const typeIcons = {
    appartement: '🏢',
    maison: '🏠',
    immeuble: '🏗️',
    local_commercial: '🏪',
    autre: '📍',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Mes biens</h2>
          <p className="text-sm text-slate-500">Gérez votre patrimoine immobilier</p>
        </div>
        {!showForm && (
          <button onClick={openNew} className="btn btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        )}
      </div>

      {/* Formulaire */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="font-semibold text-lg">
            {editingId ? 'Modifier le bien' : 'Nouveau bien'}
          </h3>

          <div>
            <label className="block text-sm font-medium mb-1">Adresse</label>
            <AdresseAutocomplete
              value={formData.adresse}
              onChange={(e) => setFormData(prev => ({ ...prev, adresse: e.target.value }))}
              placeholder="Ex: 123 Rue de Paris, 75001 Paris"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                className="input"
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="">Sélectionner</option>
                {typeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Surface (m²)</label>
              <input
                type="number"
                className="input"
                name="surface"
                placeholder="Ex: 80"
                value={formData.surface}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nombre de pièces</label>
            <input
              type="number"
              className="input"
              name="nb_pieces"
              placeholder="Ex: 3"
              value={formData.nb_pieces}
              onChange={handleChange}
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary flex-1">
              {editingId ? 'Mettre à jour' : 'Enregistrer'}
            </button>
            <button type="button" onClick={resetForm} className="btn btn-secondary">
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Liste des biens */}
      {properties.length > 0 && (
        <div className="space-y-3">
          {properties.map((prop) => (
            <div key={prop.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-cream border border-slate-200 rounded-xl text-xl">
                    {typeIcons[prop.type] || '🏠'}
                  </div>
                  <div>
                    <h3 className="font-semibold">{prop.adresse}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
                      {prop.type && (
                        <span>{typeOptions.find(o => o.value === prop.type)?.label || prop.type}</span>
                      )}
                      {prop.surface && <span>{prop.surface} m²</span>}
                      {prop.nb_pieces && <span>{prop.nb_pieces} pièce{prop.nb_pieces > 1 ? 's' : ''}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(prop)} className="p-2 text-slate-400 hover:text-cil-blue rounded-lg hover:bg-blue-50 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => { if (confirm('Supprimer ce bien ?')) deleteProperty(prop.id) }} className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* État vide */}
      {properties.length === 0 && !showForm && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">Aucun bien enregistré</p>
          <p className="text-sm text-slate-400 mt-1">Ajoutez votre premier bien pour commencer</p>
          <button onClick={openNew} className="btn btn-primary mt-4">
            Ajouter un bien
          </button>
        </div>
      )}
    </div>
  )
}
