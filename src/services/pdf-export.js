// PDF Export Service - CIL Generator
// Using jsPDF for client-side PDF generation

const CIL_PDF = {
  generate(equipment, documents, propertyInfo = {}) {
    // Create PDF document (A4 format)
    const doc = {
      content: [],
      addText(text, options = {}) {
        this.content.push({ type: 'text', text, ...options });
      }
    };
    
    // Build document structure
    const lines = [];
    
    // Header
    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push('                    CARNET D\'INFORMATION LOGEMENT                    ');
    lines.push('                          (Document officiel)                          ');
    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push('');
    
    // Property info
    lines.push('┌─────────────────────────────────────────────────────────────┐');
    lines.push('│  INFORMATIONS DU LOGEMENT                                                        │');
    lines.push('├─────────────────────────────────────────────────────────────┤');
    lines.push(`│  Adresse: ${propertyInfo.address || 'Non renseignée'}`);
    lines.push(`│  Propriétaire: ${propertyInfo.owner || 'Non renseigné'}`);
    lines.push(`│  Surface: ${propertyInfo.surface || 'Non renseignée'} m²`);
    lines.push(`│  Date de création: ${new Date().toLocaleDateString('fr-FR')}`);
    lines.push('└─────────────────────────────────────────────────────────────┘');
    lines.push('');
    
    // Energy Performance
    if (documents.some(d => d.type === 'dpe')) {
      const dpe = documents.find(d => d.type === 'dpe');
      lines.push('┌─────────────────────────────────────────────────────────────┐');
      lines.push('│  DIAGNOSTIC DE PERFORMANCE ÉNERGÉTIQUE (DPE)                          │');
      lines.push('├─────────────────────────────────────────────────────────────┤');
      lines.push(`│  ${dpe.icon} ${dpe.name}`);
      lines.push(`│  Date: ${dpe.date ? new Date(dpe.date).toLocaleDateString('fr-FR') : 'Non renseignée'}`);
      lines.push('└─────────────────────────────────────────────────────────────┘');
      lines.push('');
    }
    
    // Equipment section
    lines.push('┌─────────────────────────────────────────────────────────────┐');
    lines.push('│  ÉQUIPEMENTS                                                                          │');
    lines.push('├─────────────────────────────────────────────────────────────┤');
    
    if (equipment.length === 0) {
      lines.push('│  Aucun équipement enregistré                                                  │');
    } else {
      equipment.forEach(eq => {
        const status = getMaintenanceStatus(eq);
        const statusIcon = status === 'OK' ? '✅' : status === 'À planifier' ? '⚠️' : '🔴';
        lines.push(`│  ${eq.icon} ${eq.name}`);
        lines.push(`│      Entretien: ${eq.nextMaintenance ? new Date(eq.nextMaintenance).toLocaleDateString('fr-FR') : 'Non planifié'} ${statusIcon}`);
        lines.push('│');
      });
    }
    lines.push('└─────────────────────────────────────────────────────────────┘');
    lines.push('');
    
    // Documents section
    lines.push('┌─────────────────────────────────────────────────────────────┐');
    lines.push('│  DOCUMENTS                                                                            │');
    lines.push('├─────────────────────────────────────────────────────────────┤');
    
    if (documents.length === 0) {
      lines.push('│  Aucun document enregistré                                                      │');
    } else {
      documents.forEach(doc => {
        lines.push(`│  ${doc.icon} ${doc.name}`);
        lines.push(`│      Type: ${doc.type} | Date: ${doc.date ? new Date(doc.date).toLocaleDateString('fr-FR') : 'N/A'}`);
        lines.push('│');
      });
    }
    lines.push('└─────────────────────────────────────────────────────────────┘');
    lines.push('');
    
    // Legal notice
    lines.push('───────────────────────────────────────────────────────────────────');
    lines.push('Ce document constitue le carnet d\'information du logement prévu');
    lines.push('par l\'article L. 731-1 du code de la construction et de l\'habitation.');
    lines.push('Il doit être transmis au nouveau propriétaire ou locataire.');
    lines.push('');
    lines.push('Généré par CIL Vault - https://cecilesow.fr/cil');
    lines.push('───────────────────────────────────────────────────────────────────');
    
    return lines.join('\n');
  },
  
  // Generate downloadable file
  download(text, filename = 'carnet-information-logement.txt') {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },
  
  // PDF generation (requires jspdf library)
  async generatePDF(equipment, documents, propertyInfo = {}) {
    // For now, return text format
    // PDF generation requires jspdf library
    return this.generate(equipment, documents, propertyInfo);
  }
};

function getMaintenanceStatus(eq) {
  if (!eq.nextMaintenance) return 'Non planifié';
  const next = new Date(eq.nextMaintenance);
  const today = new Date();
  const days = Math.ceil((next - today) / (1000 * 60 * 60 * 24));
  
  if (days < 0) return 'En retard';
  if (days <= 30) return 'À planifier';
  return 'OK';
}

// Export for use in browser
if (typeof window !== 'undefined') {
  window.CIL_PDF = CIL_PDF;
}
