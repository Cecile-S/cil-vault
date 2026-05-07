// Warranty duration extraction and calculation utilities

// Common warranty patterns in French invoices
const WARRANTY_PATTERNS = [
  { regex: /garantie\s*(?:totale\s*)?(\d+)\s*an(?:s)?/i, extract: 1 },
  { regex: /garantie\s*(?:totale\s*)?(\d+)\s*ans?\s*totale/i, extract: 1 },
  { regex: /(\d+)\s*ans?\s*de\s*garantie/i, extract: 1 },
  { regex: /garantie\s+(\d+)\s*mois/i, extract: 1, isMonths: true },
  { regex: /Durée\s*garantie[:\s]*(\d+)\s*(an|ans|mois)/i, extract: 1 },
  { regex: /warranty[:\s]*(\d+)\s*(year|years|month|months)/i, extract: 1 },
]

/**
 * Extract warranty duration in months from text
 * @param {string} text - Text to search (invoice notes, description, etc.)
 * @returns {number|null} - Warranty duration in months, null if not found
 */
export function extractWarrantyDuration(text) {
  if (!text) return null
  
  const lowerText = text.toLowerCase()
  
  for (const pattern of WARRANTY_PATTERNS) {
    const match = lowerText.match(pattern.regex)
    if (match) {
      let duration = parseInt(match[pattern.extract])
      if (pattern.isMonths || (match[2] && match[2].includes('mois'))) {
        return duration
      }
      // Convert years to months
      return duration * 12
    }
  }
  
  return null
}

/**
 * Calculate warranty end date
 * @param {string} purchaseDate - ISO date string or YYYY-MM-DD
 * @param {number} warrantyMonths - Warranty duration in months
 * @returns {Date|null} - End date of warranty
 */
export function calculateWarrantyEnd(purchaseDate, warrantyMonths) {
  if (!purchaseDate || !warrantyMonths) return null
  
  const date = new Date(purchaseDate)
  date.setMonth(date.getMonth() + warrantyMonths)
  return date
}

/**
 * Get warranty status
 * @param {string} purchaseDate - ISO date string or YYYY-MM-DD
 * @param {number} warrantyMonths - Warranty duration in months
 * @returns {object} - { status: 'valid'|'expiring'|'expired'|'unknown', daysLeft: number, endDate: Date }
 */
export function getWarrantyStatus(purchaseDate, warrantyMonths) {
  if (!purchaseDate || !warrantyMonths) {
    return { status: 'unknown', daysLeft: null, endDate: null }
  }
  
  const endDate = calculateWarrantyEnd(purchaseDate, warrantyMonths)
  if (!endDate) {
    return { status: 'unknown', daysLeft: null, endDate: null }
  }
  
  const today = new Date()
  const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24))
  
  let status = 'valid'
  if (daysLeft < 0) {
    status = 'expired'
  } else if (daysLeft <= 30) {
    status = 'expiring'
  }
  
  return { status, daysLeft, endDate }
}

/**
 * Check if a warranty alert should be generated
 * @param {object} equipment - Equipment object with purchase/ warranty info
 * @param {number} alertDaysBefore - Days before expiration to trigger alert
 * @returns {boolean}
 */
export function needsWarrantyAlert(equipment, alertDaysBefore = 30) {
  if (!equipment.dateAchat && !equipment.installationDate) return false
  
  const purchaseDate = equipment.dateAchat || equipment.installationDate
  const warrantyMonths = equipment.warrantyDuration || equipment.garantieMois || extractWarrantyDuration(equipment.notes)
  
  if (!warrantyMonths) return false
  
  const status = getWarrantyStatus(purchaseDate, warrantyMonths)
  
  if (status.status === 'unknown' || status.status === 'expired' && status.daysLeft < -30) {
    return false
  }
  
  return status.daysLeft <= alertDaysBefore
}

/**
 * Get warranty alert message
 * @param {object} equipment - Equipment object
 * @returns {string}
 */
export function getWarrantyAlertMessage(equipment) {
  const purchaseDate = equipment.dateAchat || equipment.installationDate
  const warrantyMonths = equipment.warrantyDuration || equipment.garantieMois || extractWarrantyDuration(equipment.notes)
  
  if (!warrantyMonths) {
    return '⚠️ Garantie: durée non définie'
  }
  
  const status = getWarrantyStatus(purchaseDate, warrantyMonths)
  
  if (status.status === 'expired') {
    return `🔴 Garantie expirée depuis le ${status.endDate.toLocaleDateString('fr-FR')}`
  } else if (status.status === 'expiring') {
    return `⚠️ Garantie expire dans ${status.daysLeft} jours (${status.endDate.toLocaleDateString('fr-FR')})`
  }
  
  return `✅ Garantie valide jusqu'au ${status.endDate.toLocaleDateString('fr-FR')}`
}

/**
 * Suggest warranty duration based on equipment type
 * @param {string} equipmentType - Equipment type ID
 * @returns {number} - Suggested warranty duration in months
 */
export function getSuggestedWarranty(equipmentType) {
  const warrantySuggestions = {
    boiler: 24,        // Chaudière: 2 ans minimum
    vmc: 24,           // VMC: 2 ans
    heatpump: 36,      // PAC: 3 ans
    waterheater: 24,   // Chauffe-eau: 2 ans
    stove: 24,         // Poêle: 2 ans
    ac: 36,            // Climatisation: 3 ans
    watersoftener: 24, // Adoucisseur: 2 ans
    pool: 24,          // Piscine: 2 ans
    other: 24,         // Par défaut: 2 ans
  }
  
  return warrantySuggestions[equipmentType] || 24
}