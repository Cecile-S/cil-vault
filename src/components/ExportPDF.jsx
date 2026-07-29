import { useState } from 'react';
import { Download, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useProperty } from '../hooks/useProperty';
import { useEquipment } from '../hooks/useEquipment';
import { useDocuments } from '../hooks/useDocuments';
import html2pdf from 'html2pdf.js';

export default function ExportPDF() {
  const { properties } = useProperty();
  const { equipment } = useEquipment();
  const { documents } = useDocuments();
  
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState(null); // null, 'success', 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const getPropertyInfo = () => {
    if (properties.length === 0) return null;
    const prop = properties[0]; // primary property
    return {
      adresse: prop.adresse || 'Non renseignée',
      type: prop.type || 'Non renseigné',
      surface: prop.surface ? `${prop.surface} m²` : 'Non renseignée',
      nbPieces: prop.nb_pieces || 'Non renseigné',
    };
  };

  const getDPEInfo = () => {
    const dpe = documents.find(d => d.type === 'dpe');
    if (!dpe) return null;
    return {
      name: dpe.name,
      date: dpe.date ? new Date(dpe.date).toLocaleDateString('fr-FR') : 'Non renseignée',
      notes: dpe.notes || '',
    };
  };

  const getOtherDiagnostics = () => {
    const diagTypes = ['electricity', 'gas', 'lead', 'asbestos', 'erp'];
    return documents
      .filter(d => diagTypes.includes(d.type))
      .map(d => ({
        type: d.type,
        name: d.name,
        date: d.date ? new Date(d.date).toLocaleDateString('fr-FR') : 'Non renseignée',
        icon: d.icon || '📋',
      }));
  };

  const getEquipmentByType = () => {
    const grouped = {};
    equipment.forEach(eq => {
      const type = eq.typeLabel || eq.type || 'Autre';
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(eq);
    });
    return grouped;
  };

  const getEquipmentMaintenanceStatus = (eq) => {
    if (!eq.nextMaintenance) return { status: 'Non planifié', class: 'text-slate-500' };
    const next = new Date(eq.nextMaintenance);
    const today = new Date();
    const days = Math.ceil((next - today) / (1000 * 60 * 60 * 24));
    if (days < 0) return { status: `En retard (${Math.abs(days)} jours)`, class: 'text-red-600 font-bold' };
    if (days <= 30) return { status: `À planifier (${days} jours)`, class: 'text-orange-600 font-bold' };
    return { status: `OK (${days} jours)`, class: 'text-green-600' };
  };

  const generatePDF = async () => {
    setGenerating(true);
    setStatus(null);
    setErrorMsg('');

    try {
      // Create a hidden container with the PDF content
      const container = document.createElement('div');
      container.id = 'cil-pdf-content';
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '210mm'; // A4 width
      container.style.padding = '20mm';
      container.style.background = 'white';
      container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      container.style.fontSize = '11px';
      container.style.lineHeight = '1.5';
      container.style.color = '#1f2937';

      const propertyInfo = getPropertyInfo();
      const dpeInfo = getDPEInfo();
      const otherDiagnostics = getOtherDiagnostics();
      const equipmentByType = getEquipmentByType();

      const today = new Date().toLocaleDateString('fr-FR');

      let htmlContent = `
        <div style="border: 2px solid #1e40af; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1e40af; padding-bottom: 15px;">
            <h1 style="margin: 0; color: #1e40af; font-size: 24px; font-weight: 700;">CARNET D'INFORMATION DU LOGEMENT</h1>
            <p style="margin: 8px 0 0; color: #64748b; font-size: 14px;">Document officiel - Article L. 731-1 du Code de la construction et de l'habitation</p>
            <p style="margin: 4px 0 0; color: #94a3b8; font-size: 12px;">Généré le ${today} par CIL Vault</p>
          </div>

          <div style="margin-bottom: 20px;">
            <h2 style="margin: 0 0 12px; color: #1e40af; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">📍 INFORMATIONS DU LOGEMENT</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <tr><td style="padding: 6px 0; font-weight: 600; width: 150px;">Adresse :</td><td>${propertyInfo?.adresse || 'Non renseignée'}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: 600;">Type :</td><td>${propertyInfo?.type || 'Non renseigné'}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: 600;">Surface :</td><td>${propertyInfo?.surface || 'Non renseignée'}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: 600;">Nombre de pièces :</td><td>${propertyInfo?.nbPieces || 'Non renseigné'}</td></tr>
            </table>
          </div>
      `;

      // DPE Section
      if (dpeInfo) {
        htmlContent += `
          <div style="margin-bottom: 20px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 15px;">
            <h2 style="margin: 0 0 12px; color: #0369a1; font-size: 16px; border-bottom: 1px solid #bae6fd; padding-bottom: 6px;">📊 DIAGNOSTIC DE PERFORMANCE ÉNERGÉTIQUE (DPE)</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <tr><td style="padding: 5px 0; font-weight: 600; width: 150px;">Document :</td><td>${dpeInfo.name}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: 600;">Date :</td><td>${dpeInfo.date}</td></tr>
              ${dpeInfo.notes ? `<tr><td style="padding: 5px 0; font-weight: 600;">Détails :</td><td>${dpeInfo.notes}</td></tr>` : ''}
            </table>
          </div>
        `;
      }

      // Other Diagnostics
      if (otherDiagnostics.length > 0) {
        htmlContent += `
          <div style="margin-bottom: 20px;">
            <h2 style="margin: 0 0 12px; color: #1e40af; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">📋 AUTRES DIAGNOSTICS TECHNIQUES</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <thead>
                <tr style="background: #f1f5f9;">
                  <th style="padding: 8px; text-align: left; border: 1px solid #e2e8f0;">Type</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid #e2e8f0;">Document</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid #e2e8f0;">Date</th>
                </tr>
              </thead>
              <tbody>
        `;
        otherDiagnostics.forEach((diag, i) => {
          htmlContent += `
                <tr style="${i % 2 === 0 ? 'background: #fafafa;' : ''}">
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">${diag.icon} ${diag.type}</td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">${diag.name}</td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">${diag.date}</td>
                </tr>
          `;
        });
        htmlContent += `
              </tbody>
            </table>
          </div>
        `;
      }

      // Equipment Section
      htmlContent += `
        <div style="margin-bottom: 20px;">
          <h2 style="margin: 0 0 12px; color: #1e40af; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">⚙️ ÉQUIPEMENTS ET ENTRETIENS</h2>
      `;

      if (equipment.length === 0) {
        htmlContent += `<p style="color: #94a3b8; font-style: italic;">Aucun équipement enregistré</p>`;
      } else {
        Object.entries(equipmentByType).forEach(([type, eqList]) => {
          htmlContent += `
            <div style="margin-bottom: 15px;">
              <h3 style="margin: 0 0 8px; color: #334155; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">${type}</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                <thead>
                  <tr style="background: #f1f5f9;">
                    <th style="padding: 6px; text-align: left; border: 1px solid #e2e8f0;">Équipement</th>
                    <th style="padding: 6px; text-align: left; border: 1px solid #e2e8f0;">Marque/Modèle</th>
                    <th style="padding: 6px; text-align: left; border: 1px solid #e2e8f0;">Installation</th>
                    <th style="padding: 6px; text-align: left; border: 1px solid #e2e8f0;">Prochain entretien</th>
                    <th style="padding: 6px; text-align: left; border: 1px solid #e2e8f0;">Statut</th>
                  </tr>
                </thead>
                <tbody>
          `;
          eqList.forEach((eq, i) => {
            const status = getEquipmentMaintenanceStatus(eq);
            htmlContent += `
                  <tr style="${i % 2 === 0 ? 'background: #fafafa;' : ''}">
                    <td style="padding: 6px; border: 1px solid #e2e8f0; font-weight: 500;">${eq.name || eq.typeLabel || 'Sans nom'}</td>
                    <td style="padding: 6px; border: 1px solid #e2e8f0;">${eq.marque || ''} ${eq.modele || ''} ${eq.reference ? `(${eq.reference})` : ''}</td>
                    <td style="padding: 6px; border: 1px solid #e2e8f0;">${eq.installDate ? new Date(eq.installDate).toLocaleDateString('fr-FR') : 'N/A'}</td>
                    <td style="padding: 6px; border: 1px solid #e2e8f0;">${eq.nextMaintenance ? new Date(eq.nextMaintenance).toLocaleDateString('fr-FR') : 'Non planifié'}</td>
                    <td style="padding: 6px; border: 1px solid #e2e8f0; ${status.class};">${status.status}</td>
                  </tr>
            `;
          });
          htmlContent += `
                </tbody>
              </table>
            </div>
          `;
        });
      }

      htmlContent += `</div>`;

      // Documents Section
      if (documents.length > 0) {
        htmlContent += `
          <div style="margin-bottom: 20px;">
            <h2 style="margin: 0 0 12px; color: #1e40af; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">📄 DOCUMENTS ARCHIVÉS</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <thead>
                <tr style="background: #f1f5f9;">
                  <th style="padding: 8px; text-align: left; border: 1px solid #e2e8f0;">Type</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid #e2e8f0;">Nom</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid #e2e8f0;">Date</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid #e2e8f0;">Équipement lié</th>
                </tr>
              </thead>
              <tbody>
        `;
        documents.forEach((doc, i) => {
          const typeLabel = {
            dpe: 'DPE', electricity: 'Électricité', gas: 'Gaz', lead: 'Plomb',
            asbestos: 'Amiante', erp: 'ERP', invoice: 'Facture', contract: 'Contrat',
            warranty: 'Garantie', maintenance: 'Entretien', other: 'Autre'
          }[doc.type] || doc.type;
          const equipName = doc.equipmentName || (doc.equipmentId ? `Équipement #${doc.equipmentId}` : '—');
          htmlContent += `
                <tr style="${i % 2 === 0 ? 'background: #fafafa;' : ''}">
                  <td style="padding: 6px; border: 1px solid #e2e8f0;">${doc.icon || '📎'} ${typeLabel}</td>
                  <td style="padding: 6px; border: 1px solid #e2e8f0;">${doc.name}</td>
                  <td style="padding: 6px; border: 1px solid #e2e8f0;">${doc.date ? new Date(doc.date).toLocaleDateString('fr-FR') : 'N/A'}</td>
                  <td style="padding: 6px; border: 1px solid #e2e8f0;">${equipName}</td>
                </tr>
          `;
        });
        htmlContent += `
              </tbody>
            </table>
          </div>
        `;
      }

      // Legal notice
      htmlContent += `
        <div style="border-top: 2px solid #1e40af; padding-top: 15px; margin-top: 20px; font-size: 10px; color: #64748b; line-height: 1.6;">
          <p style="margin: 0 0 8px; font-weight: 600; color: #334155;">⚖️ MENTIONS LÉGALES</p>
          <p style="margin: 4px 0;">Ce document constitue le Carnet d'Information du Logement (CIL) prévu par l'article L. 731-1 du Code de la construction et de l'habitation.</p>
          <p style="margin: 4px 0;">Il doit être tenu à jour par le propriétaire et transmis à tout acquéreur ou locataire lors de la vente ou de la location du logement.</p>
          <p style="margin: 4px 0;">Les informations contenues dans ce document sont issues des déclarations du propriétaire et des documents fournis. CIL Vault ne saurait être tenu responsable de leur exactitude.</p>
          <p style="margin: 8px 0 0; font-style: italic;">Généré par CIL Vault - https://cecilesow.fr/cil</p>
        </div>
      `;

      container.innerHTML = htmlContent;
      document.body.appendChild(container);

      const opt = {
        margin: [15, 15, 20, 15], // top, left, bottom, right in mm
        filename: `CIL-${propertyInfo?.adresse?.replace(/[^a-zA-Z0-9]/g, '-') || 'Logement'}-${today.replace(/\//g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          letterRendering: true,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'avoid-all', avoid: ['tr', 'div', 'table'] },
      };

      await html2pdf().set(opt).from(container).save();
      
      document.body.removeChild(container);
      setStatus('success');
    } catch (err) {
      console.error('PDF generation error:', err);
      setStatus('error');
      setErrorMsg(err.message || 'Erreur lors de la génération du PDF');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <FileText className="w-5 h-5 text-cil-blue" />
          Export PDF du CIL
        </h3>
      </div>

      <p className="text-sm text-slate-500 mb-4">
        Générez le Carnet d'Information Logement complet (PDF officiel A4) pour transmission lors de la vente ou location.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-sm">
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="font-medium text-slate-700">{properties.length} bien(s)</p>
          <p className="text-slate-500">Enregistré(s)</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="font-medium text-slate-700">{equipment.length} équipement(s)</p>
          <p className="text-slate-500">Suivi maintenance</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="font-medium text-slate-700">{documents.length} document(s)</p>
          <p className="text-slate-500">Archivés</p>
        </div>
      </div>

      <button
        onClick={generatePDF}
        disabled={generating}
        className="btn btn-primary w-full flex items-center justify-center gap-2 py-3"
      >
        {generating && <Loader2 className="w-5 h-5 animate-spin" />}
        {!generating && <Download className="w-5 h-5" />}
        {generating ? 'Génération en cours...' : 'Télécharger le PDF'}
      </button>

      {status === 'success' && (
        <div className="mt-3 flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>PDF généré et téléchargé avec succès !</span>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-3 flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800">
        <p className="font-medium mb-1">Ce PDF inclut :</p>
        <ul className="space-y-1 pl-4 list-disc">
          <li>Informations du logement (adresse, type, surface, pièces)</li>
          <li>DPE et tous diagnostics techniques avec dates de validité</li>
          <li>Tous les équipements avec planning d'entretien et statuts</li>
          <li>Documents archivés (factures, contrats, garanties, notices)</li>
          <li>Mentions légales conformes à l'article L. 731-1 CCH</li>
        </ul>
      </div>
    </div>
  );
}