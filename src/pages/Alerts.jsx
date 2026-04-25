import { useState, useEffect } from 'react'
import { Bell, Check, AlertTriangle, Info, X } from 'lucide-react'
import { useIndexedDBAlerts } from '../hooks/useIndexedDBAlerts'
import { useIndexedDBEquipment } from '../hooks/useIndexedDBEquipment'

// Generate alerts based on equipment
function generateAlerts(equipment) {
  const alerts = []
  const today = new Date()

  equipment.forEach(eq => {
    if (eq.nextMaintenance) {
      const nextDate = new Date(eq.nextMaintenance)
      const daysUntil = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24))

      if (daysUntil <= 30 && daysUntil > 0) {
        alerts.push({
          id: `maintenance-${eq.id}`,
          type: 'warning',
          title: `Entretien ${eq.name} à planifier`,
          message: `Dans ${daysUntil} jours (${nextDate.toLocaleDateString('fr-FR')})`,
          equipmentId: eq.id,
          createdAt: new Date().toISOString(),
        })
      } else if (daysUntil <= 0) {
        alerts.push({
          id: `maintenance-${eq.id}`,
          type: 'urgent',
          title: `Entretien ${eq.name} en retard`,
          message: `Prévu le ${nextDate.toLocaleDateString('fr-FR')}`,
          equipmentId: eq.id,
          createdAt: new Date().toISOString(),
        })
      }
    }
  })

  return alerts
}

export default function Alerts() {
  const { alerts: systemAlerts, loading: alertsLoading, error: alertsError, addAlert, dismissAlert, clearDismissed } = useIndexedDBAlerts()
  const { equipment: equipmentList, loading: equipmentLoading, error: equipmentError } = useIndexedDBEquipment()
  
  const [dismissedAlerts, setDismissedAlerts] = useState([])
  const [showAddAlertModal, setShowAddAlertModal] = useState(false)
  const [newAlert, setNewAlert] = useState({
    type: 'info',
    title: '',
    message: '',
  })

  // Generate maintenance alerts from equipment
  const maintenanceAlerts = generateAlerts(equipmentList)
  const allSystemAlerts = [...systemAlerts]
  const allAlerts = [...maintenanceAlerts, ...allSystemAlerts]
  
  // Combine dismissed alerts from hook and local state (for equipment-based alerts)
  const allDismissed = [...dismissedAlerts]

  const activeAlerts = allAlerts.filter(a => !allDismissed.includes(a.id))

  const handleDismiss = (alertId) => {
    // If it's a maintenance alert, we don't store it in IndexedDB (it's computed)
    // If it's a system alert, we store the dismissal in IndexedDB
    const isMaintenanceAlert = alertId.startsWith('maintenance-')
    if (!isMaintenanceAlert) {
      dismissAlert(alertId)
    }
    setDismissedAlerts([...dismissedAlerts, alertId])
  }

  const handleDismissAll = () => {
    // Dismiss all maintenance alerts (just update local state)
    const maintenanceIds = maintenanceAlerts.map(a => a.id)
    setDismissedAlerts([...dismissedAlerts, ...maintenanceIds])
    // Dismiss all system alerts via the hook
    clearDismissed()
  }

  const handleAddAlert = () => {
    if (!newAlert.title || !newAlert.message) return
    const alertToAdd = {
      ...newAlert,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    }
    addAlert(alertToAdd)
    setNewAlert({
      type: 'info',
      title: '',
      message: '',
    })
    setShowAddAlertModal(false)
  }

  const getAlertStyle = (type) => {
    switch (type) {
      case 'urgent':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: 'text-red-500',
          badge: 'badge-red',
          badgeText: 'Urgent',
        }
      case 'warning':
        return {
          bg: 'bg-orange-50 border-orange-200',
          icon: 'text-orange-500',
          badge: 'badge-orange',
          badgeText: 'À planifier',
        }
      default:
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-500',
          badge: 'badge-blue',
          badgeText: 'Info',
        }
    }
  }

  if (alertsLoading || equipmentLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Chargement des alertes...</p>
      </div>
    )
  }

  if (alertsError || equipmentError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Erreur lors du chargement des alertes</p>
        <p className="text-slate-400">
          {(alertsError || equipmentError).message}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Alertes</h2>
        <div className="flex items-center gap-2">
          {activeAlerts.length > 0 && (
            <button
              onClick={handleDismissAll}
              className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
            >
              <Check className="w-4 h-4" />
              Tout marquer lu
            </button>
          )}
          <button
            onClick={() => setShowAddAlertModal(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            Ajouter une alerte
          </button>
        </div>
      </div>

      {activeAlerts.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">Aucune alerte</p>
          <p className="text-sm text-slate-400 mt-1">
            Les rappels d'entretien apparaîtront ici
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeAlerts.map(alert => {
            const style = getAlertStyle(alert.type)
            const isMaintenanceAlert = alert.id.startsWith('maintenance-')
            return (
              <div
                key={alert.id}
                className={`card ${style.bg} border relative`}
              >
                <button
                  onClick={() => handleDismiss(alert.id)}
                  className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-3 pr-8">
                  {alert.type === 'urgent' ? (
                    <AlertTriangle className={`w-5 h-5 ${style.icon} flex-shrink-0 mt-0.5`} />
                  ) : (
                    <Info className={`w-5 h-5 ${style.icon} flex-shrink-0 mt-0.5`} />
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{alert.title}</h3>
                      <span className={`badge ${style.badge}`}>
                        {style.badgeText}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{alert.message}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Info section */}
      <div className="card bg-blue-50 border border-blue-100">
        <h3 className="font-semibold text-blue-900 mb-2">📅 Rappels automatiques</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Chaudière : entretien annuel obligatoire</li>
          <li>• VMC : contrôle tous les 3 ans</li>
          <li>• PAC : entretien annuel recommandé</li>
          <li>• Chauffe-eau : contrôle tous les 2 ans</li>
        </ul>
      </div>

      {/* Add Alert Modal */}
      {showAddAlertModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Ajouter une alerte système</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleAddAlert(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type d'alerte</label>
                <select
                  value={newAlert.type}
                  onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value })}
                  className="input w-full"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Titre</label>
                <input
                  value={newAlert.title}
                  onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                  className="input w-full"
                  placeholder="Ex: Vérification contrat assurance"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  value={newAlert.message}
                  onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                  className="input w-full"
                  rows={3}
                  placeholder="Détails de l'alerte..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddAlertModal(false)}
                  className="btn btn-secondary"
                >
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Ajouter l'alerte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}