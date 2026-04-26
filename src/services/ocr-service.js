// OCR Service - Extract text from PDFs and images
// Uses pdfjs-dist for PDF text rendering and tesseract.js for OCR

const CIL_OCR = {
  // Initialize Tesseract worker (lazy)
  _tesseractWorker: null,
  
  async _getTesseractWorker() {
    if (!this._tesseractWorker) {
      const Tesseract = await import('tesseract.js');
      this._tesseractWorker = Tesseract.createWorker({
        langPath: 'https://unpkg.com/tesseract.js@3.0.2/lang-data',
        corePath: 'https://unpkg.com/tesseract.js@3.0.2/core.js',
      });
      await this._tesseractWorker.load();
      await this._tesseractWorker.loadLanguage('fra+eng');
      await this._tesseractWorker.initialize('fra+eng');
    }
    return this._tesseractWorker;
  },

  // Extract text from a file (text, image, PDF)
  async extractText(file) {
    // For text files, read directly
    if (file.type.startsWith('text/') || file.type === 'application/json' || file.type === 'application/xml') {
      return await file.text();
    }

    // For PDFs, try to extract text using pdfjs-dist, fallback to OCR
    if (file.type === 'application/pdf') {
      // First, try to extract text with pdfjs-dist
      const pdfText = await this._extractTextWithPdfJs(file);
      if (pdfText && pdfText.trim().length > 50) {
        // Good enough text extracted
        return pdfText;
      }
      // Otherwise, fall back to OCR (render first page to image)
      return await this._ocrPdfViaTesseract(file);
    }

    // For images, use OCR directly
    if (file.type.startsWith('image/')) {
      return await this._ocrImageViaTesseract(file);
    }

    // For other file types, try to read as text (may fail)
    try {
      return await file.text();
    } catch (e) {
      // If not readable, return empty string
      return '';
    }
  },

  // Extract text from PDF using pdfjs-dist (text layer)
  async _extractTextWithPdfJs(file) {
    try {
      const { default: pdfjsLib } = await import('pdfjs-dist/legacy/build/pdf');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      // Extract text from first page only (for performance)
      if (pdf.numPages < 1) return '';
      const page = await pdf.getPage(1);
      const textContent = await page.getTextContent();
      const text = textContent.items.map(item => item.str).join(' ');
      return text;
    } catch (error) {
      console.warn('PDF.js text extraction failed:', error);
      return '';
    }
  },

  // OCR on PDF via Tesseract.js (render first page to image)
  async _ocrPdfViaTesseract(file) {
    try {
      const { default: pdfjsLib } = await import('pdfjs-dist/legacy/build/pdf');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      if (pdf.numPages < 1) return '';
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 2.0 }); // Increase scale for better OCR
      
      // Create canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      // Render PDF page to canvas
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      // Get image data
      const imageData = canvas.toDataURL('image/png');
      
      // Run Tesseract OCR
      const worker = await this._getTesseractWorker();
      const { data: { text } } = await worker.recognize(imageData);
      return text;
    } catch (error) {
      console.error('OCR on PDF failed:', error);
      return '';
    }
  },

  // OCR on image via Tesseract.js
  async _ocrImageViaTesseract(file) {
    try {
      // Convert file to data URL
      const imageData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      const worker = await this._getTesseractWorker();
      const { data: { text } } = await worker.recognize(imageData);
      return text;
    } catch (error) {
      console.error('OCR on image failed:', error);
      return '';
    }
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

// Export for modules
export { CIL_OCR };