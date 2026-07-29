import { useState, useCallback } from 'react';
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Save,
  Loader2,
} from 'lucide-react';
import { CIL_OCR } from '../services/ocr-service';
import { 
  detectDiagnosticsInText, 
  parseCombinedDiagnostic, 
  splitGroupedDiagnostic,
  DIAGNOSTIC_PATTERNS 
} from '../services/diagnostic-group-parser';
import { getDiagnosticStatus, DIAGNOSTIC_TYPES, getDiagnosticExpiration } from '../services/diagnostic-validator';

const DIAGNOSTIC_LABELS = {
  dpe: { label: 'DPE', icon: '📊' },
  electricity: { label: 'Électricité', icon: '⚡' },
  gas: { label: 'Gaz', icon: '🔥' },
  lead: { label: 'Plomb', icon: '🔶' },
  asbestos: { label: 'Amiante', icon: '🧱' },
  erp: { label: 'ERP', icon: '🌍' },
};

const STATUS_COLORS = {
  valid: 'bg-green-100 text-green-800 border-green-200',
  expiring: 'bg-orange-100 text-orange-800 border-orange-200',
  expired: 'bg-red-100 text-red-800 border-red-200',
  unlimited: 'bg-green-100 text-green-800 border-green-200',
  unknown: 'bg-slate-100 text-slate-800 border-slate-200',
};

const STATUS_LABELS = {
  valid: 'Valide',
  expiring: 'Expire bientôt',
  expired: 'Expiré',
  unlimited: 'Validité illimitée',
  unknown: 'Inconnue',
};

/**
 * DiagnosticGroupUploader - Component for uploading and parsing grouped diagnostic PDFs
 * Allows users to upload a single PDF containing multiple diagnostics (DPE, electricity, gas, lead, asbestos)
 * and automatically extracts each component with validity dates.
 */
export default function DiagnosticGroupUploader({ 
  onClose, 
  onSuccess, 
  propertyId,
  equipmentId,
  transactionType = 'sale'
}) {
  const [step, setStep] = useState('upload'); // 'upload', 'review', 'confirm'
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [detectedDiagnostics, setDetectedDiagnostics] = useState([]);
  const [parsedDiagnostics, setParsedDiagnostics] = useState([]);
  const [editedDiagnostics, setEditedDiagnostics] = useState([]);
  const [saving, setSaving] = useState(false);
  const [savedDocuments, setSavedDocuments] = useState([]);
  const [error, setError] = useState(null);

  // Step 1: Handle file upload and OCR
  const handleFileUpload = useCallback(async (uploadedFile) => {
    if (!uploadedFile) return;
    
    setUploading(true);
    setError(null);
    setFile(uploadedFile);
    
    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(uploadedFile);
      setPreview({ url: previewUrl, type: 'pdf', name: uploadedFile.name });
      
      // Extract text via OCR
      const text = await CIL_OCR.extractText(uploadedFile);
      setExtractedText(text);
      
      // Detect diagnostics in the text
      const detected = detectDiagnosticsInText(text);
      setDetectedDiagnostics(detected);
      
      // Parse combined diagnostic
      const genericDate = extractGenericDate(text);
      const parsed = parseCombinedDiagnostic({
        notes: text,
        date: genericDate,
        id: Date.now(),
        name: uploadedFile.name,
      }, transactionType);
      
      // Create editable diagnostic entries
      const editableDiagnostics = parsed.diagnostics.map(diag => ({
        ...diag,
        // Allow user to override date
        date: diag.date || '',
        // Allow user to override type if detection was wrong
        type: diag.type,
        // Track if user modified
        modified: false,
      }));
      
      setParsedDiagnostics(editableDiagnostics);
      setEditedDiagnostics(editableDiagnostics);
      
      if (detected.length > 1) {
        setStep('review');
      } else if (detected.length === 1) {
        // Single diagnostic - go straight to confirm
        setStep('confirm');
      } else {
        setError('Aucun diagnostic détecté dans ce document. Vérifiez le fichier.');
        setStep('upload');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Erreur lors du traitement du fichier: ' + err.message);
    } finally {
      setUploading(false);
    }
  }, [transactionType]);

  // Extract a generic date from text (first date found)
  const extractGenericDate = (text) => {
    const dateMatch = text.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})/);
    if (dateMatch) {
      const [, day, month, year] = dateMatch;
      const y = year.length === 2 ? '20' + year : year;
      return `${y}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return new Date().toISOString().split('T')[0];
  };

  // Step 2: Handle diagnostic edits
  const handleDiagnosticChange = (index, field, value) => {
    setEditedDiagnostics(prev => prev.map((diag, i) => 
      i === index ? { ...diag, [field]: value, modified: true } : diag
    ));
  };

  const handleTypeChange = (index, newType) => {
    const diagInfo = DIAGNOSTIC_TYPES.find(d => d.id === newType);
    const newDate = editedDiagnostics[index].date || new Date().toISOString().split('T')[0];
    const status = getDiagnosticStatus(newDate, newType, transactionType);
    
    setEditedDiagnostics(prev => prev.map((diag, i) => 
      i === index ? { 
        ...diag, 
        type: newType,
        label: diagInfo?.label || newType,
        icon: diagInfo?.icon || '📄',
        expirationDate: status.expirationDate,
        status: status.status,
        daysLeft: status.daysLeft,
        modified: true,
      } : diag
    ));
  };

  const handleDateChange = (index, newDate) => {
    const diag = editedDiagnostics[index];
    const status = getDiagnosticStatus(newDate, diag.type, transactionType);
    
    setEditedDiagnostics(prev => prev.map((d, i) => 
      i === index ? { 
        ...d, 
        date: newDate,
        expirationDate: status.expirationDate,
        status: status.status,
        daysLeft: status.daysLeft,
        modified: true,
      } : d
    ));
  };

  // Step 3: Save diagnostics to database
  const handleSave = useCallback(async (addDocument) => {
    if (!addDocument) {
      setError('Fonction d\'ajout de document non disponible');
      return;
    }

    setSaving(true);
    setError(null);
    
    try {
      const saved = [];
      
      for (const diag of editedDiagnostics) {
        const diagType = DIAGNOSTIC_TYPES.find(t => t.id === diag.type);
        
        const docData = {
          name: `${diag.label} - ${file.name.replace(/\.[^/.]+$/, '')}`,
          type: diag.type,
          date: diag.date,
          notes: `Extrait du diagnostic groupé : ${file.name}`,
          content: '', // Will be filled if we store the PDF
          mimeType: file.type,
          fileExtension: file.name.split('.').pop(),
          equipmentId: equipmentId || null,
          propertyId: propertyId || null,
          icon: diag.icon,
          isSplitFromGroup: true,
          parentDocumentName: file.name,
          createdAt: new Date().toISOString(),
        };
        
        await addDocument(docData);
        saved.push({ ...docData, id: Date.now() + Math.random() });
      }
      
      setSavedDocuments(saved);
      setStep('confirm');
      
      if (onSuccess) {
        onSuccess(saved);
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('Erreur lors de l\'enregistrement: ' + err.message);
    } finally {
      setSaving(false);
    }
  }, [editedDiagnostics, file, propertyId, equipmentId, onSuccess]);

  // Reset form
  const handleReset = () => {
    setStep('upload');
    setFile(null);
    setPreview(null);
    setExtractedText('');
    setDetectedDiagnostics([]);
    setParsedDiagnostics([]);
    setEditedDiagnostics([]);
    setSavedDocuments([]);
    setError(null);
    if (onClose) onClose();
  };

  // Download individual diagnostic (placeholder - would need backend support)
  const handleDownload = (diag) => {
    // In a real implementation, this would fetch the individual PDF page
    alert(`Téléchargement de ${diag.label} - Fonctionnalité à implémenter avec extraction de page PDF`);
  };

  // Render upload step
  const renderUploadStep = () => (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={(e) => {
          e.preventDefault(); e.stopPropagation();
          const f = e.dataTransfer.files[0];
          if (f) handleFileUpload(f);
        }}
        className={`border-2 border-dashed rounded-lg p-8 text-center space-y-4 transition-colors ${
          uploading ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:border-blue-400'
        }`}
      >
        <Upload className="w-12 h-12 mx-auto text-slate-400" />
        <div>
          <p className="text-lg font-medium text-slate-700">Déposez votre PDF groupé de diagnostics</p>
          <p className="text-sm text-slate-500 mt-1">DPE + Électricité + Gaz + Plomb + Amiante + ERP</p>
        </div>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => { const f = e.target.files[0]; if (f) handleFileUpload(f); }}
          className="hidden"
          id="group-diag-upload"
          disabled={uploading}
        />
        <label htmlFor="group-diag-upload" className="btn btn-primary inline-flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Sélectionner un fichier PDF
        </label>
        <p className="text-xs text-slate-400">Un seul fichier PDF contenant tous les diagnostics</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {preview && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900">Fichier sélectionné : {preview.name}</p>
          <p className="text-xs text-blue-700 mt-1">{uploading ? 'Traitement en cours...' : 'Prêt à analyser'}</p>
        </div>
      )}
    </div>
  );

  // Render review step
  const renderReviewStep = () => (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="font-medium text-blue-900">
          {detectedDiagnostics.length} diagnostics détectés dans le PDF
        </p>
        <p className="text-sm text-blue-700 mt-1">
          Vérifiez et modifiez les informations ci-dessous avant d'enregistrer
        </p>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {editedDiagnostics.map((diag, index) => (
          <div key={index} className="card p-4 border-l-4 border-blue-500">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{diag.icon}</span>
              <div className="flex-1">
                <h4 className="font-semibold">{diag.label}</h4>
                <p className="text-xs text-slate-500">Type détecté automatiquement</p>
              </div>
              <select
                value={diag.type}
                onChange={(e) => handleTypeChange(index, e.target.value)}
                className="input text-sm py-1"
              >
                {DIAGNOSTIC_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Date du diagnostic</label>
                <input
                  type="date"
                  value={diag.date}
                  onChange={(e) => handleDateChange(index, e.target.value)}
                  className="input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Date d'expiration</label>
                <div className="input bg-slate-50 text-sm">
                  {diag.expirationDate 
                    ? new Date(diag.expirationDate).toLocaleDateString('fr-FR')
                    : diag.status === 'unlimited'
                      ? 'Illimitée'
                      : 'Non calculable'
                  }
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Statut</label>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[diag.status]}`}>
                  {STATUS_LABELS[diag.status]}
                  {diag.daysLeft !== null && diag.status !== 'unlimited' && (
                    <> ({diag.daysLeft > 0 ? diag.daysLeft + ' jours' : Math.abs(diag.daysLeft) + ' jours dépassés'})</>
                  )}
                </span>
              </div>
            </div>

            {diag.modified && (
              <p className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                <RefreshCw className="w-3 h-3" />
                Modifié manuellement
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <button
          onClick={() => setStep('upload')}
          className="btn btn-secondary flex-1"
        >
          <XCircle className="w-4 h-4 mr-1" />
          Recommencer
        </button>
        <button
          onClick={() => setStep('confirm')}
          className="btn btn-primary flex-1"
          disabled={saving}
        >
          <ChevronDown className="w-4 h-4 mr-1" />
          Confirmer et enregistrer
        </button>
      </div>
    </div>
  );

  // Render confirm step
  const renderConfirmStep = () => {
    if (savedDocuments.length > 0) {
      return (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-2" />
            <h3 className="font-semibold text-green-900">Diagnostics enregistrés avec succès !</h3>
            <p className="text-sm text-green-700 mt-1">
              {savedDocuments.length} diagnostic(s) ont été ajoutés à votre CIL
            </p>
          </div>

          <div className="space-y-2">
            {savedDocuments.map((doc, index) => (
              <div key={index} className="card p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{doc.icon}</span>
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-slate-500">Type: {doc.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(doc)}
                    className="btn btn-secondary text-sm flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Télécharger
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={handleReset}
              className="btn btn-primary flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Terminer
            </button>
            <button
              onClick={() => { setStep('upload'); handleReset(); }}
              className="btn btn-secondary flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Nouveau groupe
            </button>
          </div>
        </div>
      );
    }

    // Show summary before saving
    return (
      <div className="space-y-4">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <p className="font-medium text-slate-900">Prêt à enregistrer</p>
          <p className="text-sm text-slate-600 mt-1">
            {editedDiagnostics.length} diagnostic(s) seront créés comme documents séparés
          </p>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {editedDiagnostics.map((diag, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <div className="flex items-center gap-2">
                <span className="text-lg">{diag.icon}</span>
                <span className="font-medium">{diag.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[diag.status]}`}>
                  {STATUS_LABELS[diag.status]}
                </span>
              </div>
              <span className="text-xs text-slate-500">
                {diag.date ? new Date(diag.date).toLocaleDateString('fr-FR') : 'Date non définie'}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <button
            onClick={() => setStep('review')}
            className="btn btn-secondary flex-1"
          >
            <ChevronUp className="w-4 h-4 mr-1" />
            Modifier
          </button>
          <button
            onClick={() => handleSave(window.addDocument)} // Will be passed via prop
            className="btn btn-primary flex-1"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-1" />
                Enregistrer tout
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Upload diagnostic groupé
        </h3>
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-600"
          disabled={saving}
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {['upload', 'review', 'confirm'].map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
              (step === 'upload' && s === 'upload') ||
              (step === 'review' && (s === 'upload' || s === 'review')) ||
              (step === 'confirm' && (s === 'upload' || s === 'review' || s === 'confirm'))
                ? 'bg-blue-500 text-white'
                : 'bg-slate-200 text-slate-500'
            }`}>
              {i + 1}
            </div>
            {i < 2 && (
              <div className={`w-16 h-0.5 rounded transition-all ${
                (step === 'review' && i === 0) || (step === 'confirm' && i <= 1)
                  ? 'bg-blue-500'
                  : 'bg-slate-200'
              }`} />
            )}
          </div>
        ))}
        <div className="flex-1" />
        <span className="text-xs text-slate-500 capitalize">{step}</span>
      </div>

      {step === 'upload' && renderUploadStep()}
      {step === 'review' && renderReviewStep()}
      {step === 'confirm' && renderConfirmStep()}
    </div>
  );
}