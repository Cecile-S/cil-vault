import { useState, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

export const USER_ROLES = {
  OWNER: 'proprietaire',
  TENANT: 'locataire',
  MANDATARY: 'mandataire',
}

export const ROLE_LABELS = {
  [USER_ROLES.OWNER]: 'Propriétaire',
  [USER_ROLES.TENANT]: 'Locataire',
  [USER_ROLES.MANDATARY]: 'Mandataire',
}

export const ROLE_ICONS = {
  [USER_ROLES.OWNER]: '🏠',
  [USER_ROLES.TENANT]: '🔑',
  [USER_ROLES.MANDATARY]: '🤝',
}

// Equipment responsibilities (who is responsible for maintenance)
export const EQUIPMENT_RESPONSIBILITIES = {
  OWNER: [
    'boiler',      // Chaudière
    'vmc',         // VMC
    'heatpump',    // PAC
    'waterheater', // Chauffe-eau
    'watersoftener', // Adoucisseur
    'pool',        // Piscine
  ],
  TENANT: [
    'ac',          // Climatisation (si splitsysteme mobile)
    'stove',       // Poêle (si electrique)
  ],
  BOTH: [
    'other',       // Autre - a clarifier
  ],
}

/**
 * Get default responsibility for an equipment type
 * @param {string} equipmentType - Equipment type ID
 * @returns {string} - Responsible role
 */
export function getDefaultResponsibility(equipmentType) {
  if (EQUIPMENT_RESPONSIBILITIES.OWNER.includes(equipmentType)) {
    return USER_ROLES.OWNER
  }
  if (EQUIPMENT_RESPONSIBILITIES.TENANT.includes(equipmentType)) {
    return USER_ROLES.TENANT
  }
  return USER_ROLES.OWNER // Default to owner
}

/**
 * Hook to manage user role and alerts filtering
 */
export function useUserRole() {
  const [storedRole, setStoredRole] = useLocalStorage('cil-user-role', USER_ROLES.OWNER)
  const [showAllAlerts, setShowAllAlerts] = useState(false)
  
  const role = storedRole
  const setRole = (newRole) => {
    setStoredRole(newRole)
  }
  
  // Filter alerts based on role
  const filterAlertsByRole = (alerts) => {
    if (showAllAlerts) return alerts
    
    return alerts.filter(alert => {
      if (!alert.destinataire) return true // Show alerts without destination
      if (alert.destinataire === role) return true
      if (alert.destinataire === 'both') return true
      return false
    })
  }
  
  // Check if user should see a specific alert
  const canSeeAlert = (alert) => {
    if (!alert.destinataire) return true
    if (showAllAlerts) return true
    if (alert.destinataire === role) return true
    if (alert.destinataire === 'both') return true
    return false
  }
  
  // Get alert message with role context
  const getRoleContextAlert = (alert) => {
    if (alert.destinataire === USER_ROLES.OWNER) {
      return { ...alert, roleContext: 'propriétaire' }
    }
    if (alert.destinataire === USER_ROLES.TENANT) {
      return { ...alert, roleContext: 'locataire' }
    }
    return { ...alert, roleContext: 'propriétaire & locataire' }
  }
  
  return {
    role,
    setRole,
    showAllAlerts,
    setShowAllAlerts,
    filterAlertsByRole,
    canSeeAlert,
    getRoleContextAlert,
    roleLabel: ROLE_LABELS[role],
    roleIcon: ROLE_ICONS[role],
  }
}

export default useUserRole