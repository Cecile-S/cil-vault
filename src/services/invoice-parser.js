// Invoice data extraction utilities

// Patterns for extracting common invoice fields
const INVOICE_PATTERNS = {
  // Date patterns
  date: [
    /Date[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
    /Du\s+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
    /Facture\s+du\s+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
    /(\d{1,2}\/\d{1,2}\/\d{4})/,
  ],
  // Invoice number
  invoiceNumber: [
    /Facture\s*[N°#]*\s*:?\s*([A-Z0-9\-]+)/i,
    /N°\s*Facture[:\s]*([A-Z0-9\-]+)/i,
    /Invoice\s*(?:no|Number|N°)?[:\s]*([A-Z0-9\-]+)/i,
  ],
  // Amount (total)
  amount: [
    /Total[:\s]*(\d+[,\.]\d{2})\s*€?/i,
    /Montant[:\s]*(\d+[,\.]\d{2})\s*€?/i,
    / somme\s+(?:de\s+)?(\d+[,\.]\d{2})\s*€?/i,
    /(\d+[,\.]\d{2})\s*€\s*HT/i,
    /TTC[:\s]*(\d+[,\.]\d{2})/i,
  ],
  // Supplier/Vendor
  supplier: [
    /^(?:Fournisseur|Société|Entreprise)[:\s]*([^\n]+)/im,
    /^([A-Z][A-Za-z\s]+(?:SARL|SA|SAS|EURL))[^\n]*/m,
    /([A-Z][A-Za-z0-9\s]+)\s+-?\s*\d+/m,
  ],
  // Warranty info
  warranty: [
    /garantie\s*(?:totale\s*)?(\d+)\s*an/i,
    /(\d+)\s*ans?\s*de\s*garantie/i,
    /garantie\s+(\d+)\s*mois/i,
  ],
}

// Parse French date format to ISO
function parseFrenchDate(dateStr) {
  if (!dateStr) return null
  
  const cleaned = dateStr.trim().replace(/[\.\-]/g, '/')
  const parts = cleaned.split('/')
  
  if (parts.length !== 3) return null
  
  let day = parseInt(parts[0])
  let month = parseInt(parts[1])
  let year = parseInt(parts[2])
  
  // Handle 2-digit years
  if (year < 100) {
    year += year > 50 ? 1900 : 2000
  }
  
  // Validate
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  
  return new Date(year, month - 1, day).toISOString().split('T')[0]
}

/**
 * Extract data from invoice text
 * @param {string} text - Raw invoice text
 * @returns {object} - Extracted data { date, invoiceNumber, amount, supplier, warrantyMonths }
 */
export function extractInvoiceData(text) {
  if (!text) return {}
  
  const result = {}
  
  // Extract date
  for (const pattern of INVOICE_PATTERNS.date) {
    const match = text.match(pattern)
    if (match) {
      result.date = parseFrenchDate(match[1])
      break
    }
  }
  
  // Extract invoice number
  for (const pattern of INVOICE_PATTERNS.invoiceNumber) {
    const match = text.match(pattern)
    if (match) {
      result.invoiceNumber = match[1].trim()
      break
    }
  }
  
  // Extract amount
  for (const pattern of INVOICE_PATTERNS.amount) {
    const match = text.match(pattern)
    if (match) {
      result.amount = parseFloat(match[1].replace(',', '.'))
      break
    }
  }
  
  // Extract supplier
  for (const pattern of INVOICE_PATTERNS.supplier) {
    const match = text.match(pattern)
    if (match && match[1] && match[1].length > 2) {
      result.supplier = match[1].trim().substring(0, 50)
      break
    }
  }
  
  // Extract warranty
  for (const pattern of INVOICE_PATTERNS.warranty) {
    const match = text.match(pattern)
    if (match) {
      const duration = parseInt(match[1])
      // Check if months
      const isMonths = pattern.toString().includes('mois')
      result.warrantyMonths = isMonths ? duration : duration * 12
      break
    }
  }
  
  return result
}

/**
 * Parse invoice from uploaded file (base64 content)
 * @param {string} base64Data - Base64 encoded file
 * @param {string} filename - Original filename
 * @returns {Promise<object>} - Extracted data
 */
export async function parseInvoiceFile(base64Data, filename) {
  const result = {
    filename: filename,
    type: 'invoice',
  }
  
  // Try to extract text based on file type
  if (filename.endsWith('.txt') || filename.endsWith('.json')) {
    try {
      // Decode base64 to text
      const text = atob(base64Data.split(',')[1] || base64Data)
      const extracted = extractInvoiceData(text)
      Object.assign(result, extracted)
    } catch (e) {
      console.error('Failed to parse invoice text:', e)
    }
  }
  
  // For PDF/Images, would need OCR service
  // For now, return basic info
  result.note = 'Traitement OCR non disponible pour ce format'
  
  return result
}

/**
 * Validate extracted invoice data
 * @param {object} data - Invoice data
 * @returns {object} - { valid: boolean, errors: string[] }
 */
export function validateInvoiceData(data) {
  const errors = []
  
  if (!data.date) {
    errors.push('Date manquante')
  }
  
  if (!data.amount || data.amount <= 0) {
    errors.push('Montant invalide')
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}