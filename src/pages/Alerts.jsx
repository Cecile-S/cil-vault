import { useState, useEffect } from 'react'
import { Bell, Check, AlertTriangle, Info, X } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useEquipment } from '../hooks/useEquipment'
import { useDocuments } from '../hooks/useDocuments'
import { needsWarrantyAlert, getWarrantyAlertMessage } from '../services/warranty-calculator'
import { needsDiagnosticAlert, getDiagnosticAlertMessage } from '../services/diagnostic-validator'
import { generateTenantNegligenceAlerts } from '../services/tenant-alert-service'
import { useUserRole } from '../hooks/useUserRole'

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
          destinataire: eq.responsible,
          createdAt: new Date().toISOString(),
        })
      } else if (daysUntil <= 0) {
        alerts.push({
          id: `maintenance-${eq.id}`,
          type: 'urgent',
          title: `Entretien ${eq.name} en retard`,
          message: `Prévu le ${nextDate.toLocaleDateString('fr-FR')}`,
          equipmentId: eq.id,
          destinataire: eq.responsible,
          createdAt: new Date().toISOString(),
        })
      }
    }

    if (needsWarrantyAlert(eq)) {
      alerts.push({
        id: `warranty-${eq.id}`,
        type: 'warning',
        title: `Garantie ${eq.name}`,
        message: getWarrantyAlertMessage(eq),
        equipmentId: eq.id,
        destinataire: eq.responsible,
        createdAt: new Date().toISOString(),
      })
    }
  })

  const tenantAlerts = generateTenantNegligenceAlerts(equipment)
  tenantAlerts.forEach(ta => {
    alerts.push({
      id: `tenant-${ta.equipmentId || ta.id}`,
      type: ta.severite === 'urgent' ? 'urgent' : 'warning',
      title: ta.title || 'Entretien locataire en retard',
      message: ta.message,
      equipmentId: ta.equipmentId,
      destinataire: 'proprietaire',
      createdAt: new Date().toISOString(),
    })
  })

  return alerts
}

function generateDiagnosticAlerts(documents) {
  const alerts = []
  documents.forEach(doc => {
    if (needsDiagnosticAlert(doc)) {
      alerts.push({
        id: `diagnostic-${doc.id}`,
        type: 'warning',
        title: `Diagnostic ${doc.name}`,
        message: getDiagnosticAlertMessage(doc),
        createdAt: new Date().toISOString(),
      })
    }
  })
  return alerts
}

export default function Alerts() {
  const { equipment } = useEquipment()
  const { documents } = useDocuments()
  const [dismissedAlerts, setDismissedAlerts] = useLocalStorage('cil-dismissed-alerts', [])
  const [systemAlerts, setSystemAlerts] = useLocalStorage('cil-system-alerts', [])
  const { role, setRole, showAllAlerts, setShowAllAlerts, filterAlertsByRole, roleLabel } = useUserRole()
  const [showAddAlert, setShowAddAlert] = useState(false)
  const [newAlert, setNewAlert] = useState({ type: 'info', title: '', message: '' })

  const maintenanceAlerts = generateAlerts(equipment)
  const diagnosticAlerts = generateDiagnosticAlerts(documents)
  const allAlerts = [...maintenanceAlerts, ...diagnosticAlerts, ...systemAlerts]
  const roleFilteredAlerts = filterAlertsByRole(allAlerts)
  const activeAlerts = roleFilteredAlerts.filter(a => !dismissedAlerts.includes(a.id))

  const handleDismiss = (alertId) => {
    setDismissedAlerts([...dismissedAlerts, alertId])
  }

  const handleDismissAll = () => {
    setDismissedAlerts(allAlerts.map(a => a.id))
  }

  const handleAddAlert = () => {
    if (!newAlert.title || !newAlert.message) return
    setSystemAlerts([
      ...systemAlerts,
      {
        id: `custom-${Date.now()}`,
        type: newAlert.type,
        title: newAlert.title,
        message: newAlert.message,
        createdAt: new Date().toISOString(),
      },
    ])
    setNewAlert({ type: 'info', title: '', message: '' })
    setShowAddAlert(false)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold">Alertes</h2>
        <div className="flex items-center gap-2">
          <select
            className="input text-sm py-1"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="proprietaire">Propriétaire</option>
            <option value="locataire">Locataire</option>
          </select>
          <label className="flex items-center gap-1 text-xs text-slate-500">
            <input
              type="checkbox"
              checked={showAllAlerts}
              onChange={(e) => setShowAllAlerts(e.target.checked)}
            />
            Tout voir
          </label>
          <button
            onClick={() => setShowAddAlert(!showAddAlert)}
            className="btn btn-secondary text-sm py-1 px-2"
          >
            + Alerte
          </button>
        </div>
        {activeAlerts.length > 0 && (
          <button
            onClick={handleDismissAll}
            className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
          >
            <Check className="w-4 h-4" />
            Tout marquer lu
          </button>
        )}
      </div>

      {showAddAlert && (
        <div className="card space-y-3">
          <h3 className="font-semibold">Nouvelle alerte personnalisee</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Titre</label>
            <input
              type="text"
              className="input"
              value={newAlert.title}
              onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              className="input"
              rows={2}
              value={newAlert.message}
              onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              className="input"
              value={newAlert.type}
              onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value })}
            >
              <option value="info">Info</option>
              <option value="warning">A planifier</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddAlert} className="btn btn-primary flex-1">
              Ajouter
            </button>
            <button onClick={() => setShowAddAlert(false)} className="btn btn-secondary">
              Annuler
            </button>
          </div>
        </div>
      )}

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
    </div>
  )
}
