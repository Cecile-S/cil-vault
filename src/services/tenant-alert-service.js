// Tenant maintenance oversight service

import { USER_ROLES, getDefaultResponsibility } from '../hooks/useUserRole'

const DAYS_BEFORE_ALERT = 30 // Alert if tenant is 30+ days overdue

/**
 * Check if equipment is under tenant responsibility
 * @param {object} equipment - Equipment object
 * @returns {boolean}
 */
export function isTenantResponsibility(equipment) {
  // Check explicit responsibility field
  if (equipment.responsible === USER_ROLES.TENANT) {
    return true
  }
  if (equipment.responsible === USER_ROLES.OWNER) {
    return false
  }
  
  // Fall back to default based on type
  const defaultResp = getDefaultResponsibility(equipment.type)
  return defaultResp === USER_ROLES.TENANT
}

/**
 * Check if tenant maintenance is overdue
 * @param {object} equipment - Equipment object
 * @returns {object} - { isOverdue: boolean, daysOverdue: number }
 */
export function isTenantMaintenanceOverdue(equipment) {
  if (!equipment.nextMaintenance) {
    return { isOverdue: false, daysOverdue: 0 }
  }
  
  const nextDate = new Date(equipment.nextMaintenance)
  const today = new Date()
  const daysOverdue = Math.ceil((today - nextDate) / (1000 * 60 * 60 * 24))
  
  return {
    isOverdue: daysOverdue > 0,
    daysOverdue: daysOverdue,
  }
}

/**
 * Generate owner alerts for tenant negligence
 * @param {array} equipment - List of equipment
 * @param {string} tenantName - Tenant name (optional)
 * @returns {array} - List of alerts for owner
 */
export function generateTenantNegligenceAlerts(equipment, tenantName = 'votre locataire') {
  const alerts = []
  
  equipment.forEach(eq => {
    // Only check equipment under tenant responsibility
    if (!isTenantResponsibility(eq)) return
    
    const { isOverdue, daysOverdue } = isTenantMaintenanceOverdue(eq)
    
    if (isOverdue && daysOverdue >= DAYS_BEFORE_ALERT) {
      alerts.push({
        id: `tenant-overdue-${eq.id}`,
        type: 'tenant_maintenance',
        severity: daysOverdue > 60 ? 'urgent' : 'warning',
        equipmentId: eq.id,
        equipmentName: eq.name || eq.typeLabel || eq.type,
        message: `🔴 ${tenantName} n'a pas effectué l'entretien de "${eq.name || eq.typeLabel}" depuis ${daysOverdue} jours`,
        daysOverdue: daysOverdue,
        destinataire: USER_ROLES.OWNER,
        createdAt: new Date().toISOString(),
        actionRequired: `Contacter ${tenantName} pour l'entretien de ${eq.name || eq.typeLabel}`,
      })
    } else if (isOverdue) {
      // Less urgent - equipment overdue but not yet at alert threshold
      alerts.push({
        id: `tenant-due-${eq.id}`,
        type: 'tenant_maintenance_due',
        severity: 'info',
        equipmentId: eq.id,
        equipmentName: eq.name || eq.typeLabel || eq.type,
        message: `⚠️ Entretien de "${eq.name || eq.typeLabel}" prévu depuis ${daysOverdue} jours`,
        daysOverdue: daysOverdue,
        destinataire: USER_ROLES.OWNER,
        createdAt: new Date().toISOString(),
      })
    }
  })
  
  return alerts
}

/**
 * Get summary of tenant-maintained equipment status
 * @param {array} equipment - List of equipment
 * @returns {object} - Summary statistics
 */
export function getTenantEquipmentSummary(equipment) {
  const tenantEquipment = equipment.filter(isTenantResponsibility)
  
  let okCount = 0
  let dueCount = 0
  let overdueCount = 0
  
  tenantEquipment.forEach(eq => {
    const { isOverdue, daysOverdue } = isTenantMaintenanceOverdue(eq)
    if (!eq.nextMaintenance) {
      dueCount++ // No maintenance scheduled
    } else if (isOverdue) {
      overdueCount++
    } else {
      okCount++
    }
  })
  
  return {
    total: tenantEquipment.length,
    ok: okCount,
    due: dueCount,
    overdue: overdueCount,
    status: overdueCount > 0 ? 'critical' : dueCount > 0 ? 'warning' : 'ok',
  }
}

/**
 * Check if owner should be notified about tenant
 * @param {array} equipment - List of equipment
 * @returns {boolean}
 */
export function needsOwnerNotification(equipment) {
  const alerts = generateTenantNegligenceAlerts(equipment)
  return alerts.some(a => a.severity === 'urgent' || a.severity === 'warning')
}