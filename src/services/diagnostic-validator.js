// Diagnostic validity periods (in months)
// Source: French law as of 2026
export const DIAGNOSTIC_VALIDITY = {
  dpe: { sale: 120, rental: 120 }, // 10 years
  electricity: { sale: 36, rental: 72 }, // 3 years sale, 6 years rental
  gas: { sale: 36, rental: 72 }, // 3 years sale, 6 years rental
  lead: { sale: 12, rental: 72 }, // 1 year sale, 6 years rental (unless negative)
  asbestos: { sale: null, rental: null }, // Unlimited if negative
  erp: { sale: 72, rental: 72 }, // 6 years (Environmental Risk State)
}

// Diagnostic types with labels
export const DIAGNOSTIC_TYPES = [
  { id: 'dpe', label: 'DPE', icon: '📊', validity: DIAGNOSTIC_VALIDITY.dpe },
  { id: 'electricity', label: 'Électricité', icon: '⚡', validity: DIAGNOSTIC_VALIDITY.electricity },
  { id: 'gas', label: 'Gaz', icon: '🔥', validity: DIAGNOSTIC_VALIDITY.gas },
  { id: 'lead', label: 'Plomb', icon: '🔶', validity: DIAGNOSTIC_VALIDITY.lead },
  { id: 'asbestos', label: 'Amiante', icon: '🧱', validity: DIAGNOSTIC_VALIDITY.asbestos },
  { id: 'erp', label: 'ERP', icon: '🌍', validity: DIAGNOSTIC_VALIDITY.erp },
]

/**
 * Calculate diagnostic validity period based on type and transaction type
 * @param {string} diagnosticType - dpe, electricity, gas, lead, asbestos, erp
 * @param {string} transactionType - 'sale' or 'rental'
 * @returns {number|null} - Validity in months, null if unlimited
 */
export function getDiagnosticValidity(diagnosticType, transactionType = 'sale') {
  const validity = DIAGNOSTIC_VALIDITY[diagnosticType]
  if (!validity) return null
  return validity[transactionType] ?? null
}

/**
 * Calculate expiration date from diagnosis date
 * @param {string} diagnosticDate - ISO date string or YYYY-MM-DD
 * @param {string} diagnosticType - dpe, electricity, gas, lead, asbestos, erp
 * @param {string} transactionType - 'sale' or 'rental'
 * @returns {Date|null} - Expiration date or null if unlimited
 */
export function getDiagnosticExpiration(diagnosticDate, diagnosticType, transactionType = 'sale') {
  const months = getDiagnosticValidity(diagnosticType, transactionType)
  if (months === null) return null // Unlimited validity
  
  const date = new Date(diagnosticDate)
  date.setMonth(date.getMonth() + months)
  return date
}

/**
 * Get diagnostic status
 * @param {string} diagnosticDate - ISO date string or YYYY-MM-DD
 * @param {string} diagnosticType - dpe, electricity, gas, lead, asbestos, erp
 * @param {string} transactionType - 'sale' or 'rental'
 * @returns {object} - { status: 'valid'|'expiring'|'expired'|'unlimited', daysLeft: number, expirationDate: Date }
 */
export function getDiagnosticStatus(diagnosticDate, diagnosticType, transactionType = 'sale') {
  if (!diagnosticDate) {
    return { status: 'unknown', daysLeft: null, expirationDate: null }
  }

  const expirationDate = getDiagnosticExpiration(diagnosticDate, diagnosticType, transactionType)
  
  if (!expirationDate) {
    return { status: 'unlimited', daysLeft: null, expirationDate: null }
  }

  const today = new Date()
  const daysLeft = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24))

  let status = 'valid'
  if (daysLeft < 0) {
    status = 'expired'
  } else if (daysLeft <= 90) { // 3 months
    status = 'expiring'
  }

  return { status, daysLeft, expirationDate }
}

/**
 * Check if a diagnostic needs renewal alert
 * @param {object} document - Document object with date and type
 * @param {string} transactionType - 'sale' or 'rental'
 * @param {number} alertDaysBefore - Days before expiration to trigger alert (default 90)
 * @returns {boolean} - True if alert should be generated
 */
export function needsDiagnosticAlert(document, transactionType = 'sale', alertDaysBefore = 90) {
  if (!document.date || !document.type) return false
  
  const status = getDiagnosticStatus(document.date, document.type, transactionType)
  
  if (status.status === 'unknown' || status.status === 'unlimited') {
    return false
  }
  
  return status.daysLeft <= alertDaysBefore && status.daysLeft >= -30 // Alert from 90 days before to 30 days after expiration
}

/**
 * Generate diagnostic alert message
 * @param {object} document - Document object
 * @param {string} transactionType - 'sale' or 'rental'
 * @returns {string} - Alert message
 */
export function getDiagnosticAlertMessage(document, transactionType = 'sale') {
  const typeLabel = DIAGNOSTIC_TYPES.find(t => t.id === document.type)?.label || document.type
  const status = getDiagnosticStatus(document.date, document.type, transactionType)
  
  if (status.status === 'expired') {
    return `🔴 ${typeLabel} expiré depuis le ${status.expirationDate.toLocaleDateString('fr-FR')}`
  } else if (status.status === 'expiring') {
    return `⚠️ ${typeLabel} expire dans ${status.daysLeft} jours (${status.expirationDate.toLocaleDateString('fr-FR')})`
  }
  
  return `${typeLabel} valide jusqu'au ${status.expirationDate.toLocaleDateString('fr-FR')}`
}