// Multi-diagnostic PDF parser service
// Handles cases where a single PDF contains multiple diagnostics

import { DIAGNOSTIC_TYPES, getDiagnosticExpiration, getDiagnosticStatus } from './diagnostic-validator'

// Patterns to identify different diagnostics in a combined PDF
const DIAGNOSTIC_PATTERNS = {
  dpe: [
    /DPE[:\s]*Diagnostic.*performance.*énergétique/i,
    /diagnostic.*performance.*énergétique/i,
    /classe.*énergie/i,
    /étiquette.*DPE/i,
    /kWh.*m².*an/i,
  ],
  electricity: [
    /état de l'installation électrique/i,
    /diagnostic.*électricité/i,
    /installation.*électrique.*intérieure/i,
    /contrôle.*électricite/i,
  ],
  gas: [
    /état de l'installation.*gaz/i,
    /diagnostic.*gaz/i,
    /installation.*gaz.*intérieure/i,
    /contrôle.*gaz/i,
  ],
  lead: [
    /Constat de risque d'exposition au plomb/i,
    /diagnostic.*plomb/i,
    /CREP/i,
    /taux.*plomb/i,
  ],
  asbestos: [
    /État d'amiante/i,
    /diagnostic.*amiante/i,
    /DTA/i,
    /repérage.*amiante/i,
  ],
  erp: [
    /état des risques et pollutions/i,
    /ERP/i,
    /risques.*pollutions/i,
    /plan.*prévention.*risques/i,
  ],
}

/**
 * Detect which diagnostics are present in a document
 * @param {string} text - Extracted text from PDF
 * @returns {array} - List of detected diagnostic types
 */
export function detectDiagnosticsInText(text) {
  if (!text) return []
  
  const detected = []
  const lowerText = text.toLowerCase()
  
  for (const [diagType, patterns] of Object.entries(DIAGNOSTIC_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(lowerText) || pattern.test(text)) {
        detected.push(diagType)
        break
      }
    }
  }
  
  return [...new Set(detected)] // Remove duplicates
}

/**
 * Parse a combined diagnostic document
 * @param {object} document - Document object with content/notes
 * @param {string} transactionType - 'sale' or 'rental'
 * @returns {object} - Parsed diagnostics { detected: [], diagnostics: [] }
 */
export function parseCombinedDiagnostic(document, transactionType = 'sale') {
  const result = {
    originalDocument: document,
    detectedTypes: [],
    diagnostics: [],
    isGrouped: false,
  }
  
  // Try to detect from notes first (if OCR already ran)
  const textToAnalyze = document.notes || document.content || ''
  const detected = detectDiagnosticsInText(textToAnalyze)
  
  if (detected.length === 0 && document.type === 'other') {
    // If no specific type and marked as 'other', try content
    result.detectedTypes = ['dpe', 'electricity', 'gas'] // Assume common combo
  } else {
    result.detectedTypes = detected
  }
  
  // If multiple diagnostics detected, mark as grouped
  result.isGrouped = result.detectedTypes.length > 1
  
  // Generate individual diagnostic entries
  result.diagnostics = result.detectedTypes.map(diagType => {
    const diagInfo = DIAGNOSTIC_TYPES.find(d => d.id === diagType)
    const status = document.date 
      ? getDiagnosticStatus(document.date, diagType, transactionType)
      : { status: 'unknown', daysLeft: null, expirationDate: null }
    
    return {
      type: diagType,
      label: diagInfo?.label || diagType,
      icon: diagInfo?.icon || '📄',
      date: document.date,
      expirationDate: status.expirationDate,
      status: status.status,
      daysLeft: status.daysLeft,
      documentId: document.id,
      documentName: document.name,
    }
  })
  
  return result
}

/**
 * Check if a grouped diagnostic document needs renewal
 * @param {object} document - Document object
 * @param {string} transactionType - 'sale' or 'rental'
 * @returns {array} - List of diagnostics needing renewal
 */
export function getExpiringDiagnostics(document, transactionType = 'sale') {
  const parsed = parseCombinedDiagnostic(document, transactionType)
  
  return parsed.diagnostics.filter(d => 
    d.status === 'expired' || d.status === 'expiring'
  )
}

/**
 * Get a summary of all diagnostics from grouped document
 * @param {object} document - Document object
 * @param {string} transactionType - 'sale' or 'rental'
 * @returns {object} - Summary { valid: number, expiring: number, expired: number }
 */
export function getDiagnosticSummary(document, transactionType = 'sale') {
  const parsed = parseCombinedDiagnostic(document, transactionType)
  
  let valid = 0
  let expiring = 0
  let expired = 0
  
  parsed.diagnostics.forEach(d => {
    if (d.status === 'expired') expired++
    else if (d.status === 'expiring') expiring++
    else if (d.status === 'valid') valid++
  })
  
  return {
    total: parsed.diagnostics.length,
    valid,
    expiring,
    expired,
    isGrouped: parsed.isGrouped,
    types: parsed.detectedTypes,
  }
}

/**
 * Create individual document entries from a grouped diagnostic
 * @param {object} document - Original grouped document
 * @param {string} transactionType - 'sale' or 'rental'
 * @returns {array} - Array of individual document-like objects
 */
export function splitGroupedDiagnostic(document, transactionType = 'sale') {
  const parsed = parseCombinedDiagnostic(document, transactionType)
  
  return parsed.diagnostics.map(diag => ({
    ...diag,
    parentDocumentId: document.id,
    isSplit: true,
    createdAt: new Date().toISOString(),
  }))
}