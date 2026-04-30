import { useState } from 'react'
import { Plus, Trash2, Calendar, Settings, Edit2, Save, X } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const DEFAULT_EQUIPMENT_TYPES = [
  { id: 'boiler', label: 'Chaudière', icon: '🔥', maintenanceInterval: 12 },
  { id: 'vmc', label: 'VMC', icon: '💨', maintenanceInterval: 36 },
  { id: 'heatpump', label: 'PAC', icon: '🌡️', maintenanceInterval: 12 },
  { id: 'waterheater', label: 'Chauffe-eau', icon: '🚿', maintenanceInterval: 24 },
  { id: 'stove', label: 'Poêle', icon: '🏮', maintenanceInterval: 12 },
  { id: 'ac', label: 'Climatisation', icon: '❄️', maintenanceInterval: 12 },
  { id: 'watersoftener', label: 'Adoucisseur', icon: '💧', maintenanceInterval: 12 },
  { id: 'pool', label: 'Piscine', icon: '🏊', maintenanceInterval: 12 },
  { id: 'other', label: 'Autre', icon: '⚙️', maintenanceInterval: 12 },
]

const AVAILABLE_ICONS = ['🔥', '💨', '🌡️', '🚿', '🏮', '❄️', '💧', '🏊', '⚙️', '🔧', '🛠️', '📦', '🚪', '🪟', '🔌', '💡']

export default function Equipment() {
  const [equipment, setEquipment] = useLocalStorage('cil-equipment', [])
  const [customTypes, setCustomTypes] = useLocalStorage('cil-equipment-custom-types', [])
  const [showForm, setShowForm] = useState(false)
  const [showTypeManager, setShowTypeManager] = useState(false)
  const [formData, setFormData] = useState({
    type: 'boiler',
    customType: '',
    name: '',
    installDate: '',
    lastMaintenance: '',
    nextMaintenance: '',
    notes: '',
  })
  const [newTypeData, setNewTypeData] = useState({
    label: '',
    icon: '⚙️',
    maintenanceInterval: 12,
  })

  // Combine default and custom types
  const equipmentTypes = [...DEFAULT_EQUIPMENT_TYPES, ...customTypes]

  const handleSubmit = (e) => {
    e.preventDefault()
    const type = equipmentTypes.find(t => t.id === formData.type)
    const isCustomType = formData.type.startsWith('custom-')
    const typeLabel = isCustomType 
      ? customTypes.find(t => t.id === formData.type)?.label || formData.type
      : type?.label || 'Autre'

    const newEquipment = {
      id: Date.now(),
      type: formData.type,
      typeLabel: typeLabel,
      name: formData.name || typeLabel,
      installDate: formData.installDate,
      lastMaintenance: formData.lastMaintenance,
      nextMaintenance: formData.nextMaintenance,
      maintenanceInterval: type?.maintenanceInterval || 12,
      notes: formData.notes,
      createdAt: new Date().toISOString(),
    }
    setEquipment([...equipment, newEquipment])
    setFormData({
      type: 'boiler',
      customType: '',
      name: '',
      installDate: '',
      lastMaintenance: '',
      nextMaintenance: '',
      notes: '',
    })
    setShowForm(false)
  }

  const handleDelete = (id) => {
    if (confirm('Supprimer cet équipement ?')) {
      setEquipment(equipment.filter(eq => eq.id !== id))
    }
  }

  const handleAddCustomType = () => {
    if (!newTypeData.label.trim()) return
    const newType = {
      id: `custom-${Date.now()}`,
      label: newTypeData.label.trim(),
      icon: newTypeData.icon,
      maintenanceInterval: parseInt(newTypeData.maintenanceInterval) || 12,
      isCustom: true,
    }
    setCustomTypes([...customTypes, newType])
    setNewTypeData({ label: '', icon: '⚙️', maintenanceInterval: 12 })
  }

  const handleDeleteCustomType = (typeId) => {
    if (confirm('Supprimer ce type personnalisé ?')) {
      setCustomTypes(customTypes.filter(t => t.id !== typeId))
    }
  }

  const getDaysUntilMaintenance = (nextDate) => {
    if (!nextDate) return null
    const next = new Date(nextDate)
    const today = new Date()
    const diff = Math.ceil((next - today) / (1000 * 60 * 60 * 24))
    return diff
  }

  const getMaintenanceStatus = (days) => {
    if (days === null) return { label: 'Non planifiée', color: 'badge-blue' }
    if (days < 0) return { label: 'En retard', color: 'badge-red' }
    if (days <= 30) return { label: 'À planifier', color: 'badge-orange' }
    return { label: 'OK', color: 'badge-green' }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Équipements</h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowTypeManager(true)} 
            className="btn btn-secondary flex items-center gap-2"
            title="Gérer les types"
          >
            <Edit2 className="w-4 h-4" />
            Types
          </button>
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </div>

      {/* Type Manager Modal */}
      {showTypeManager && (
        <div className="card space-y-4 border-2 border-blue-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-blue-800">Types d'équipements</h3>
            <button onClick={() => setShowTypeManager(false)} className="text-slate-500">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-2">Types prédéfinis:</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {DEFAULT_EQUIPMENT_TYPES.map(type => (
                <span key={type.id} className="badge badge-blue">
                  {type.icon} {type.label}
                </span>
              ))}
            </div>
          </div>

          {customTypes.length > 0 && (
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-2">Types personnalisés:</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {customTypes.map(type => (
                  <span key={type.id} className="badge badge-green flex items-center gap-1">
                    {type.icon} {type.label}
                    <button 
                      onClick={() => handleDeleteCustomType(type.id)}
                      className="ml-1 text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-blue-200 pt-4">
            <p className="font-medium text-blue-800 mb-2">Ajouter un type personnalisé:</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <input
                type="text"
                className="input"
                placeholder="Nom du type"
                value={newTypeData.label}
                onChange={(e) => setNewTypeData({ ...newTypeData, label: e.target.value })}
              />
              <select
                className="input"
                value={newTypeData.icon}
                onChange={(e) => setNewTypeData({ ...newTypeData, icon: e.target.value })}
              >
                {AVAILABLE_ICONS.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
              <input
                type="number"
                className="input"
                placeholder="Intervalle (mois)"
                value={newTypeData.maintenanceInterval}
                onChange={(e) => setNewTypeData({ ...newTypeData, maintenanceInterval: e.target.value })}
                min="1"
                max="120"
              />
              <button 
                onClick={handleAddCustomType}
                className="btn btn-primary flex items-center justify-center gap-2"
                disabled={!newTypeData.label.trim()}
              >
                <Save className="w-4 h-4" />
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select 
              className="input" 
              value={formData.type} 
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <optgroup label="Types prédéfinis">
                {DEFAULT_EQUIPMENT_TYPES.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </optgroup>
              {customTypes.length > 0 && (
                <optgroup label="Types personnalisés">
                  {customTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nom / Modèle</label>
            <input 
              type="text" 
              className="input" 
              placeholder="Ex: Chaudière Frisquet" 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date d'installation</label>
            <input 
              type="date" 
              className="input" 
              value={formData.installDate} 
              onChange={(e) => setFormData({ ...formData, installDate: e.target.value })} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Dernier entretien</label>
            <input 
              type="date" 
              className="input" 
              value={formData.lastMaintenance} 
              onChange={(e) => setFormData({ ...formData, lastMaintenance: e.target.value })} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Prochain entretien</label>
            <input 
              type="date" 
              className="input" 
              value={formData.nextMaintenance} 
              onChange={(e) => setFormData({ ...formData, nextMaintenance: e.target.value })} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea 
              className="input" 
              rows={2} 
              placeholder="Remarques, contrat d'entretien..." 
              value={formData.notes} 
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary flex-1">
              Enregistrer
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

      {equipment.length === 0 ? (
        <div className="text-center py-12">
          <Settings className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">Aucun équipement enregistré</p>
          <p className="text-sm text-slate-400 mt-1">
            Ajoutez votre chaudière, VMC ou PAC pour recevoir des rappels d'entretien
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {equipment.map(eq => {
            const type = equipmentTypes.find(t => t.id === eq.type)
            const days = getDaysUntilMaintenance(eq.nextMaintenance)
            const status = getMaintenanceStatus(days)
            return (
              <div key={eq.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{type?.icon || '⚙️'}</span>
                    <div>
                      <h3 className="font-semibold">{eq.name}</h3>
                      <p className="text-sm text-slate-500">{type?.label || eq.typeLabel}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(eq.id)} 
                    className="p-2 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {eq.nextMaintenance && (
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span>Entretien le {new Date(eq.nextMaintenance).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <span className={`badge ${status.color}`}>{status.label}</span>
                  </div>
                )}

                {eq.notes && (
                  <p className="mt-2 text-sm text-slate-500 bg-slate-50 rounded-lg p-2">
                    {eq.notes}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}