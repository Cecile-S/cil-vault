import { useState } from 'react'
import { Plus, Trash2, Calendar, Settings } from 'lucide-react'
import { useIndexedDBEquipment } from '../hooks/useIndexedDBEquipment'

const EQUIPMENT_TYPES = [
  { id: 'boiler', label: 'Chaudière', icon: '🔥', maintenanceInterval: 12 }, // months
  { id: 'vmc', label: 'VMC', icon: '💨', maintenanceInterval: 36 },
  { id: 'heatpump', label: 'PAC', icon: '🌡️', maintenanceInterval: 12 },
  { id: 'waterheater', label: 'Chauffe-eau', icon: '🚿', maintenanceInterval: 24 },
  { id: 'other', label: 'Autre', icon: '⚙️', maintenanceInterval: 12 },
]

export default function Equipment() {
  const { equipment, loading, error, addEquipment, deleteEquipment } = useIndexedDBEquipment()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    type: 'boiler',
    name: '',
    installDate: '',
    lastMaintenance: '',
    nextMaintenance: '',
    notes: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const type = EQUIPMENT_TYPES.find(t => t.id === formData.type)
    const intervalMonths = type?.maintenanceInterval || 12

    // Compute nextMaintenance if not provided
    let nextMaintenance = formData.nextMaintenance
    if (!nextMaintenance) {
      const baseDate = formData.lastMaintenance || formData.installDate
      if (baseDate) {
        const date = new Date(baseDate)
        date.setMonth(date.getMonth() + intervalMonths)
        nextMaintenance = date.toISOString().split('T')[0] // YYYY-MM-DD
      }
    }

    const newEquipment = {
      id: Date.now(),
      ...formData,
      maintenanceInterval: intervalMonths,
      nextMaintenance: nextMaintenance || '',
      createdAt: new Date().toISOString(),
    }
    addEquipment(newEquipment)
    setFormData({
      type: 'boiler',
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
      deleteEquipment(id)
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Chargement des équipements...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Erreur lors du chargement des équipements</p>
        <p className="text-slate-400">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Équipements</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              className="input"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              {EQUIPMENT_TYPES.map(type => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.label}
                </option>
              ))}
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
              required
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
            <label className="block text-sm font-medium mb-1">Prochain entretien (calculé automatiquement)</label>
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
            const type = EQUIPMENT_TYPES.find(t => t.id === eq.type)
            const days = getDaysUntilMaintenance(eq.nextMaintenance)
            const status = getMaintenanceStatus(days)

            return (
              <div key={eq.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{type?.icon || '⚙️'}</span>
                    <div>
                      <h3 className="font-semibold">{eq.name || type?.label}</h3>
                      <p className="text-sm text-slate-500">{type?.label}</p>
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