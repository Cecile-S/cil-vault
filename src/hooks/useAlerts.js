import { useLocalStorage } from './useLocalStorage'
import { useEquipment } from './useEquipment'
import { useDocuments } from './useDocuments'
import { useUserRole } from './useUserRole'
import { needsWarrantyAlert, getWarrantyAlertMessage } from '../services/warranty-calculator'
import { needsDiagnosticAlert, getDiagnosticAlertMessage } from '../services/diagnostic-validator'
import { generateTenantNegligenceAlerts } from '../services/tenant-alert-service'

// Generate alerts based on equipment (maintenance, warranty, tenant negligence)
export function generateEquipmentAlerts(equipment) {
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

// Generate alerts based on documents (diagnostic expiration)
export function generateDocumentAlerts(documents) {
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

/**
 * Source unique de verite pour les alertes : utilise a la fois par la page
 * Alerts (affichage complet, gestion) et par Home (compteur/badge), pour
 * eviter que les deux se desynchronisent comme precedemment (Home lisait
 * une cle localStorage jamais alimentee par personne).
 */
export function useAlerts() {
  const { equipment } = useEquipment()
  const { documents } = useDocuments()
  const [dismissedAlerts, setDismissedAlerts] = useLocalStorage('cil-dismissed-alerts', [])
  const [systemAlerts, setSystemAlerts] = useLocalStorage('cil-system-alerts', [])
  const userRole = useUserRole()

  const maintenanceAlerts = generateEquipmentAlerts(equipment)
  const diagnosticAlerts = generateDocumentAlerts(documents)
  const allAlerts = [...maintenanceAlerts, ...diagnosticAlerts, ...systemAlerts]
  const roleFilteredAlerts = userRole.filterAlertsByRole(allAlerts)
  const activeAlerts = roleFilteredAlerts.filter(a => !dismissedAlerts.includes(a.id))

  return {
    allAlerts,
    roleFilteredAlerts,
    activeAlerts,
    dismissedAlerts,
    setDismissedAlerts,
    systemAlerts,
    setSystemAlerts,
    ...userRole,
  }
}
