import { useState } from 'react'
import { useProperty } from '../hooks/useProperty'
import { Home, Save, Plus } from 'lucide-react'

export default function Property() {
  const { properties, loading, error, addProperty, updateProperty } = useProperty()
  const property = properties[0] || null
  const [showForm, setShowForm] = useState(!property) // Show form if no property exists
  const [formData, setFormData] = useState({
    adresse: '',
    adresse_lat: '',
    adresse_lng: '',
    type: '',
    surface: '',
    nb_pieces: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const newProperty = {
      ...formData,
      adresse_lat: parseFloat(formData.adresse_lat) || null,
      adresse_lng: parseFloat(formData.adresse_lng) || null,
      surface: parseInt(formData.surface, 10) || null,
      nb_pieces: parseInt(formData.nb_pieces, 10) || null,
      id_proprietaire: 1, // TODO: replace with actual user ID from auth
      id_mandataire: null,
      created_at: new Date().toISOString(),
    }
    if (property) {
      // Update existing property (first one)
      updateProperty(property.id, newProperty)
    } else {
      // Add new property
      addProperty(newProperty)
    }
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Mon bien</h2>
        <div className="flex items-center gap-3">
          {property && (
            <>
              <Home className="w-5 h-5 text-cil-blue" />
              <span className="text-sm text-slate-500">{property.adresse}</span>
            </>
          )}
          {!property && (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouveau bien
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Adresse</label>
            <input
              type="text"
              className="input"
              placeholder="Ex: 123 Rue de Paris, 75001 Paris"
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                className="input"
                placeholder="48.8566"
                value={formData.adresse_lat}
                onChange={(e) => setFormData({ ...formData, adresse_lat: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                className="input"
                placeholder="2.3522"
                value={formData.adresse_lng}
                onChange={(e) => setFormData({ ...formData, adresse_lng: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                className="input"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="">-- Sélectionner un type --</option>
                <option value="appartement">Appartement</option>
                <option value="maison">Maison</option>
                <option value="immeuble">Immeuble</option>
                <option value="local_commercial">Local commercial</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Surface (m²)</label>
              <input
                type="number"
                className="input"
                placeholder="Ex: 80"
                value={formData.surface}
                onChange={(e) => setFormData({ ...formData, surface: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nombre de pièces</label>
            <input
              type="number"
              className="input"
              placeholder="Ex: 3"
              value={formData.nb_pieces}
              onChange={(e) => setFormData({ ...formData, nb_pieces: e.target.value })}
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary flex-1">
              {property ? 'Mettre à jour' : 'Enregistrer'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn btn-secondary"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {property && !showForm && (
        <div className="card text-center py-8">
          <h3 className="text-lg font-semibold mb-3">Votre bien enregistré</h3>
          <p className="text-slate-500 mb-2"><strong>Adresse:</strong> {property.adresse}</p>
          <p className="text-slate-500 mb-2"><strong>Type:</strong> {property.type}</p>
          <p className="text-slate-500 mb-2"><strong>Surface:</strong> {property.surface} m²</p>
          <p className="text-slate-500 mb-2"><strong>Pièces:</strong> {property.nb_pieces}</p>
          <div className="flex justify-center">
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-outline"
            >
              Modifier
            </button>
          </div>
        </div>
      )}

      {!property && properties.length === 0 && (
        <div className="text-center py-12">
          <Home className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">Pour commencer, veuillez enregistrer votre bien immobilier.</p>
          <p className="text-sm text-slate-400 mt-2">
            Cette étape est obligatoire pour utiliser CIL Vault.
          </p>
        </div>
      )}
    </div>
  )
}