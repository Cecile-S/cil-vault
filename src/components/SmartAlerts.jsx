import { useState, useEffect, useMemo } from 'react'
import { AlertTriangle, Info, CheckCircle, X, ChevronDown, ChevronUp, AlertCircle, Bell } from 'lucide-react'
import { useProperty } from '../hooks/useProperty'
import { useDocuments } from '../hooks/useDocuments'
import { useEquipment } from '../hooks/useEquipment'
import { getSmartAlerts, getProfileInfo } from '../services/property-profile'
import { useLocalStorage } from '../hooks/useLocalStorage'

const ALERT_ICONS = {
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const PRIORITY_LABELS = {
  high: 'Prioritaire',
  medium: 'À surveiller',
  low: 'Information',
}

const PRIORITY_CLASSES = {
  high: 'bg-red-50 border-red-200 text-red-800',
  medium: 'bg-amber-50 border-amber-200 text-amber-800',
  low: 'bg-blue-50 border-blue-200 text-blue-800',
}

const PRIORITY_BORDER = {
  high: 'border-l-4 border-red-500',
  medium: 'border-l-4 border-amber-500',
  low: 'border-l-4 border-blue-500',
}

const ALERT_ICON_CLASSES = {
  error: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
}

export default function SmartAlerts() {
  const { properties } = useProperty()
  const { documents } = useDocuments()
  const { equipment } = useEquipment()
  const [dismissedAlerts, setDismissedAlerts] = useLocalStorage('cil-dismissed-smart-alerts', [])
  const [expandedAlerts, setExpandedAlerts] = useState(new Set())
  const [snoozedAlerts, setSnoozedAlerts] = useLocalStorage('cil-snoozed-smart-alerts', {})

  // Get current property (first one for now, could be extended for multi-property)
  const currentProperty = properties[0]

  // Generate smart alerts based on profile
  const allAlerts = useMemo(() => {
    if (!currentProperty) return []
    const profile = currentProperty.profile || 'occupant'
    return getSmartAlerts(profile, currentProperty, documents, equipment)
  }, [currentProperty, documents, equipment])

  // Filter out dismissed and snoozed alerts
  const activeAlerts = allAlerts.filter(alert => {
    if (dismissedAlerts.includes(alert.id)) return false
    const snoozeUntil = snoozedAlerts[alert.id]
    if (snoozeUntil && new Date(snoozeUntil) > new Date()) return false
    return true
  })

  // Group alerts by priority
  const alertsByPriority = useMemo(() => {
    const groups = { high: [], medium: [], low: [] }
    activeAlerts.forEach(alert => {
      groups[alert.priority].push(alert)
    })
    return groups
  }, [activeAlerts])

  const handleDismiss = (alertId) => {
    setDismissedAlerts([...dismissedAlerts, alertId])
  }

  const handleSnooze = (alertId, days = 7) => {
    const snoozeUntil = new Date()
    snoozeUntil.setDate(snoozeUntil.getDate() + days)
    setSnoozedAlerts({ ...snoozedAlerts, [alertId]: snoozeUntil.toISOString() })
  }

  const handleAction = (alert, action) => {
    switch (action.action) {
      case 'setProfile':
        // Navigate to property page to change profile
        window.location.href = '/property'
        break
      case 'addDocument':
      case 'addDocuments':
        window.location.href = '/documents'
        break
      case 'viewEquipment':
        window.location.href = '/equipment'
        break
      case 'showExemptions':
        // Could open a modal with exemption details
        alert('Exonérations TLV/THLV :\n- Mise en location/vente prix marché\n- Travaux > 25% valeur vénale\n- Occupé > 90j/an\n- Indépendant de votre volonté')
        break
      case 'checkTHLV':
        alert('Consultez le site de votre mairie pour vérifier si la THLV a été votée.')
        break
      case 'contactInsurer':
        alert('Contactez votre assureur pour vérifier la couverture vacance / location courte durée.')
        break
      case 'openSyndicExtranet':
        alert('Connectez-vous à votre extranet syndic pour télécharger le PV AG.')
        break
      case 'snooze':
        handleSnooze(alert.id, action.payload?.days || 30)
        break
      case 'downloadPV':
      case 'viewAirbnbSteps':
      case 'scheduleMaintenance':
        // Navigate to relevant page
        break
      default:
        console.log('Action:', action)
    }
    // Dismiss after action
    handleDismiss(alert.id)
  }

  const toggleExpand = (alertId) => {
    setExpandedAlerts(prev => {
      const next = new Set(prev)
      if (next.has(alertId)) {
        next.delete(alertId)
      } else {
        next.add(alertId)
      }
      return next
    })
  }

  const isExpanded = (alertId) => expandedAlerts.has(alertId)

  if (!currentProperty) {
    return (
      <div className="text-center py-12">
        <Bell className="w-12 h-12 mx-auto text-slate-300 mb-3" />
        <p className="text-slate-500">Aucun bien configuré</p>
        <p className="text-sm text-slate-400 mt-1">Ajoutez un bien pour voir les alertes intelligentes</p>
      </div>
    )
  }

  const profileInfo = getProfileInfo(currentProperty.profile || 'occupant')

  return (
    <div className="space-y-6">
      {/* Header with profile */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{profileInfo.icon}</span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Alertes intelligentes</h2>
              <p className="text-sm text-slate-500">Profil : {profileInfo.label}</p>
            </div>
          </div>
          <p className="text-sm text-slate-500 ml-10">{profileInfo.description}</p>
        </div>
        {activeAlerts.length > 0 && (
          <button
            onClick={() => setDismissedAlerts([...dismissedAlerts, ...activeAlerts.map(a => a.id)])}
            className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap"
          >
            <CheckCircle className="w-4 h-4" />
            Tout marquer lu
          </button>
        )}
      </div>

      {/* Change profile button */}
      <button
        onClick={() => window.location.href = '/property'}
        className="w-full text-left p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>🔄</span>
          <span>Changer de situation (vente, location, Airbnb, vacant...)</span>
        </div>
      </div>

      {/* Alerts by priority */}
      {activeAlerts.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-3" />
          <p className="text-slate-500 font-medium">Aucune alerte</p>
          <p className="text-sm text-slate-400 mt-1">Tout est en ordre pour votre profil <strong>{profileInfo.label}</strong></p>
        </div>
      ) : (
        <div className="space-y-4">
          {(['high', 'medium', 'low'] as const).map(priority => {
            const alerts = alertsByPriority[priority]
            if (!alerts.length) return null

            return (
              <div key={priority} className="space-y-3">
                {/* Priority header */}
                <div className="flex items-center gap-2 px-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PRIORITY_CLASSES[priority]}`}>
                    {PRIORITY_LABELS[priority]} ({alerts.length})
                  </span>
                </div>

                {/* Alerts */}
                <div className="space-y-3">
                  {alerts.map(alert => (
                    <div
                      key={alert.id}
                      className={`card ${PRIORITY_BORDER[priority]} overflow-hidden transition-all`}
                    >
                      <div
                        className="p-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                        onClick={() => toggleExpand(alert.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${ALERT_ICON_CLASSES[alert.type]}/10`}>
                            <ALERT_ICONS[alert.type] className={`w-5 h-5 ${ALERT_ICON_CLASSES[alert.type]}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900">{alert.title}</h3>
                            <p className="text-sm text-slate-600 mt-0.5">{alert.message}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <ChevronDown
                              className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded(alert.id) ? 'rotate-180' : ''}`}
                            />
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDismiss(alert.id) }}
                              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                              aria-label="Ignorer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded actions */}
                      {isExpanded(alert.id) && alert.actions && alert.actions.length > 0 && (
                        <div className="px-4 pb-4 pt-0 border-t border-slate-100">
                          <div className="flex flex-wrap gap-2 mt-3">
                            {alert.actions.map((action, idx) => (
                              <button
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); handleAction(alert, action) }}
                                className="btn btn-secondary text-sm py-1.5 px-3"
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Legend */}
      <div className="card bg-slate-50 border-slate-200">
        <h4 className="font-semibold text-sm text-slate-700 mb-2">Légende</h4>
        <div className="flex flex-wrap gap-4 text-xs text-slate-600">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Prioritaire</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> À surveiller</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Information</span>
        </div>
      </div>
    </div>
  )
}