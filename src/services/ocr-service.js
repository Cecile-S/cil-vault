// OCR Service - Extract text from PDFs and images
// Uses PDF.js for text extraction, Tesseract.js for OCR

const CIL_OCR = {
  // Extract text from PDF using PDF.js
  async extractPDFText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // Simple text extraction without pdf.js dependency
          // For production, use pdf.js library
          const text = await this._extractTextSimple(e.target.result);
          resolve(text);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  },
  
  // Simple binary text extraction (works for text-based PDFs)
  async _extractTextSimple(arrayBuffer) {
    const uint8Array = new Uint8Array(arrayBuffer);
    let text = '';
    
    // Look for text streams in PDF
    let inTextObject = false;
    let textBuffer = '';
    
    for (let i = 0; i < uint8Array.length - 6; i++) {
      const chunk = String.fromCharCode(...uint8Array.slice(i, i + 6));
      
      if (chunk === 'BT\n') {
        inTextObject = true;
        textBuffer = '';
      } else if (chunk === 'ET\n' && inTextObject) {
        inTextObject = false;
        text += this._parsePDFTextCommands(textBuffer);
      } else if (inTextObject) {
        textBuffer += String.fromCharCode(uint8Array[i]);
      }
    }
    
    return text.trim() || 'PDF binaire - OCR nécessaire';
  },
  
  // Parse PDF text commands (Tj, TJ, etc.)
  _parsePDFTextCommands(buffer) {
    // Simplified parser - in production use pdf.js
    const matches = buffer.match(/\(([^)]+)\)/g);
    if (!matches) return '';
    
    return matches
      .map(m => m.slice(1, -1))
      .join(' ')
      .replace(/\\n/g, '\n');
  },
  
  // Parse DPE specific format
  parseDPE(text) {
    const patterns = {
      reference: /N°\s*(\d[\d\s]+\d)/i,
      date: /Date\s*[:.]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      energyClass: /[Cc]lasse\s*[eé]nerg[iy]\s*[:.]?\s*([A-G])/i,
      gesClass: /[Cc]lasse\s*GES\s*[:.]?\s*([A-G])/i,
      surface: /Surface\s*(?:habit(?:able|le))?\s*[:.]?\s*(\d+(?:[.,]\d+)?)\s*m[²2]/i,
      consumption: /Consommation\s*[:.]?\s*(\d+(?:[.,]\d+)?)\s*kWh/i,
      emissions: /[EÉ]missions?\s*(?:CO2)?\s*[:.]?\s*(\d+(?:[.,]\d+)?)\s*kg/i,
      heatingType: /(Chauffage|[Cc]haud[iè][eè]re|PAC|Pompe [àa] chaleur|[ÉÉ]lectrique|Gaz|Fioul)/i,
      constructionYear: /Ann[eé]e\s*(?:de\s*)?construction\s*[:.]?\s*(\d{4})/i
    };
    
    const dpe = {};
    
    for (const [key, pattern] of Object.entries(patterns)) {
      const match = text.match(pattern);
      if (match) {
        dpe[key] = match[1] || match[0];
      }
    }
    
    return Object.keys(dpe).length > 0 ? dpe : null;
  },
  
  // Parse invoice format
  parseInvoice(text) {
    const patterns = {
      supplier: /(?:Fournisseur|[ÉE]metteur)\s*[:.]?\s*([A-Za-zÀ-ÿ\s]+(?:EDF|Engie|Total|Enedis))/i,
      amount: /(?:Total|[Mm]ontant)\s*(?:[àa] payer)?\s*[:.]?\s*(\d+(?:[.,]\d{2})?)\s*€?/i,
      date: /[Dd]ate\s*(?:d\'émission)?\s*[:.]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      reference: /[Rr][ée]f(?:érence)?\.?\s*[:.]?\s*([A-Z0-9\-]+)/i,
      dueDate: /[EÉ]ch[eé]ance\s*[:.]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i
    };
    
    const invoice = {};
    
    for (const [key, pattern] of Object.entries(patterns)) {
      const match = text.match(pattern);
      if (match) {
        invoice[key] = match[1] || match[0];
      }
    }
    
    return Object.keys(invoice).length > 0 ? invoice : null;
  },
  
  // Auto-detect document type and parse
  async autoParse(text) {
    const lowerText = text.toLowerCase();
    
    // Check for DPE
    if (lowerText.includes('diagnostic') && lowerText.includes('performance') && lowerText.includes('énergétique')) {
      return { type: 'dpe', data: this.parseDPE(text) };
    }
    
    // Check for invoice
    if (lowerText.includes('facture') || lowerText.includes('montant') || lowerText.includes('€')) {
      return { type: 'invoice', data: this.parseInvoice(text) };
    }
    
    // Check for contract
    if (lowerText.includes('contrat') || lowerText.includes('avenant') || lowerText.includes('signature')) {
      return { type: 'contract', data: { rawText: text } };
    }
    
    // Check for warranty
    if (lowerText.includes('garantie') || lowerText.includes('garanti')) {
      return { type: 'warranty', data: { rawText: text } };
    }
    
    // Unknown type
    return { type: 'other', data: { rawText: text } };
  },
  
  // Classify using backend API
  async classifyWithAI(text) {
    try {
      const response = await fetch('http://84.247.161.15:8001/ai/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text })
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Classification error:', error);
      return { type: 'error', confidence: 0 };
    }
  }
};

// Export for browser
if (typeof window !== 'undefined') {
  window.CIL_OCR = CIL_OCR;
}
