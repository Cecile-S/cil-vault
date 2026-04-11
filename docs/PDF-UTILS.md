# PDF Utilities for CIL Vault

## PDF Generation (Export CIL)

### Option 1: jsPDF (Client-side, no API needed)
```javascript
import { jsPDF } from 'jspdf';

function generateCILPdf(equipment, documents) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('Carnet d\'Information Logement', 105, 20, { align: 'center' });
  
  // Property info
  doc.setFontSize(12);
  doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, 40);
  
  // Equipment section
  doc.setFontSize(14);
  doc.text('Équipements', 20, 55);
  doc.setFontSize(10);
  
  let y = 65;
  equipment.forEach(eq => {
    doc.text(`• ${eq.icon} ${eq.name} - Entretien: ${eq.nextMaintenance || 'Non planifié'}`, 25, y);
    y += 7;
  });
  
  // Documents section
  y += 10;
  doc.setFontSize(14);
  doc.text('Documents', 20, y);
  y += 10;
  doc.setFontSize(10);
  
  documents.forEach(doc => {
    doc.text(`• ${doc.icon} ${doc.name} (${doc.date})`, 25, y);
    y += 7;
  });
  
  // Footer
  doc.setFontSize(8);
  doc.text('Généré par CIL Vault - cecilesow.fr/cil', 105, 280, { align: 'center' });
  
  return doc;
}
```

### Option 2: pdf-lib (More control)
```javascript
import { PDFDocument, StandardFonts } from 'pdf-lib';

async function generateCIL(equipment, documents) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  page.drawText('Carnet d\'Information Logement', {
    x: 170,
    y: 800,
    size: 24,
    font
  });
  
  // ... add content
  
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
```

## PDF Parsing (OCR)

### Option 1: pdf.js (Client-side extraction)
```javascript
import * as pdfjsLib from 'pdfjs-dist';

async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText;
}

// Usage
const text = await extractTextFromPDF(file);
const classification = await classifyDocument(text);
```

### Option 2: Server-side OCR (Tesseract via backend)
Backend endpoint needed: POST /ocr
```python
# Backend (FastAPI)
from fastapi import FastAPI, UploadFile
import pytesseract
from pdf2image import convert_from_bytes

@app.post("/ocr")
async def ocr_pdf(file: UploadFile):
    images = convert_from_bytes(await file.read())
    text = ""
    for image in images:
        text += pytesseract.image_to_string(image, lang='fra')
    return {"text": text, "pages": len(images)}
```

### Option 3: Browser-based Tesseract.js
```javascript
import Tesseract from 'tesseract.js';

async function ocrImage(file) {
  const result = await Tesseract.recognize(file, 'fra', {
    logger: m => console.log(m)
  });
  return result.data.text;
}
```

## DPE Parsing (Specific format)

DPE documents have structured data that can be extracted:

```javascript
function parseDPE(text) {
  const dpe = {
    reference: text.match(/N°\s*(\d+\s*\d+)/)?.[1],
    date: text.match(/Date\s*:\s*(\d{2}\/\d{2}\/\d{4})/)?.[1],
    energyClass: text.match(/Classe\s*énergie\s*:\s*([A-G])/i)?.[1],
    gesClass: text.match(/GES\s*:\s*([A-G])/i)?.[1],
    surface: text.match(/Surface\s*:\s*(\d+)/)?.[1],
    consumption: text.match(/Consommation\s*:\s*([\d,]+)\s*kWh/)?.[1],
    emissions: text.match(/Émissions\s*:\s*([\d,]+)\s*kg/)?.[1]
  };
  
  return dpe;
}
```

## Implementation Priority

1. **Phase 1**: Export PDF CIL (jsPDF, pure client)
2. **Phase 2**: PDF text extraction (pdf.js)
3. **Phase 3**: OCR for scanned docs (Tesseract.js or backend)

## NPM Dependencies

```json
{
  "jspdf": "^2.5.1",
  "pdf-lib": "^1.17.1",
  "pdfjs-dist": "^3.11.174",
  "tesseract.js": "^5.0.0"
}
```
