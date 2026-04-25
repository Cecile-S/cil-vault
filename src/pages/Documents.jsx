import { useState, useRef } from 'react'
import { Upload, FileText, Trash2, Tag, Calendar, Image, Clipboard, AlertTriangle, Loader2 } from 'lucide-react'
import { useIndexedDB } from '../hooks/useIndexedDB'
import { CIL_OCR } from '../services/ocr-service'

const DOCUMENT_TYPES = [
  { id: 'dpe', label: 'DPE', icon: '📊' },
  { id: 'invoice', label: 'Facture', icon: '🧾' },
  { id: 'contract', label: 'Contrat', icon: '📄' },
  { id: 'warranty', label: 'Garantie', icon: '🛡️' },
  { id: 'maintenance', label: 'Entretien', icon: '🔧' },
  { id: 'other', label: 'Autre', icon: '📎' },
]

export default function Documents() {
  const { documents, loading, error, addDocument, deleteDocument } = useIndexedDB()
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [classifying, setClassifying] = useState(false)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview] = useState(null) // {url, type, name}
  const [fileToUpload, setFileToUpload] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'invoice',
    date: '',
    notes: '',
    content: '',
  })
  const fileInputRef = useRef(null)

  const classifyDocument = async (text) => {
    setClassifying(true)
    try {
      const response = await fetch('http://84.247.161.15:8001/ai/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      })
      const data = await response.json()
      // Map AI classification to our types
      const typeMap = {
        'notice': 'invoice',
        'contract': 'contract',
        'dpe': 'dpe',
        'warranty': 'warranty',
        'maintenance': 'maintenance',
      }
      return typeMap[data.type] || 'other'
    } catch (error) {
      console.error('Classification error:', error)
      return 'other'
    } finally {
      setClassifying(false)
    }
  }

  const handleFile = async (file) => {
    if (!file) return
    setUploading(true)
    setOcrLoading(true)
    try {
      const fileName = file.name
      // Extract text using OCR service
      const extractedText = await CIL_OCR.extractText(file)
      
      // Auto-parse to get suggested type and structured data
      const { type: suggestedType, data: parsedData } = await CIL_OCR.autoParse(extractedText)
      
      // Determine preview
      let previewUrl = null
      let previewType = suggestedType
      if (file.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(file)
      } else if (file.type === 'application/pdf') {
        previewUrl = URL.createObjectURL(file)
        previewType = 'dpe' // Assume PDF could be DPE, but user can change
      } else {
        // For text files, no preview image
        previewType = 'other'
      }
      
      setFormData({
        name: fileName.replace(/\.[^/.]+$/, ''),
        type: suggestedType || 'invoice', // fallback to invoice if undefined
        date: '',
        notes: '',
        content: extractedText,
      })
      setFileToUpload(file)
      setPreview({ url: previewUrl, type: previewType, name: fileName })
    } catch (error) {
      console.error('File processing error:', error)
      // Fallback to basic handling
      const fileName = file.name
      setFormData(prev => ({
        ...prev,
        name: fileName.replace(/\.[^/.]+$/, ''),
        type: 'other',
        content: '', // We'll let user fill or use manual classify
      }))
      setFileToUpload(file)
      setPreview(null)
    } finally {
      setUploading(false)
      setOcrLoading(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      await handleFile(file)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      await handleFile(file)
    }
  }

  const handleTextClassify = async () => {
    if (!formData.content) return
    const type = await classifyDocument(formData.content)
    setFormData(prev => ({ ...prev, type }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const type = DOCUMENT_TYPES.find(t => t.id === formData.type)
    const newDoc = {
      ...formData,
      icon: type?.icon || '📎',
      createdAt: new Date().toISOString(),
    }
    addDocument(newDoc)
    // Reset form
    setFormData({
      name: '',
      type: 'invoice',
      date: '',
      notes: '',
      content: '',
    })
    setShowForm(false)
    setPreview(null)
    setFileToUpload(null)
    // Revoke object URL if any
    if (preview?.url) {
      URL.revokeObjectURL(preview.url)
    }
  }

  const handleDelete = (id) => {
    if (confirm('Supprimer ce document ?')) {
      deleteDocument(id)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Chargement des documents...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Erreur lors du chargement des documents</p>
        <p className="text-slate-400">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Documents</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Ajouter
          </button>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded p-4 text-center ${dragOver ? 'border-cil-blue bg-blue-50' : 'border-slate-300 bg-slate-50'}`}
          >
            <p className="text-sm text-slate-500">Ou déposez un fichier ici</p>
          </div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom du document</label>
            <input
              type="text"
              className="input"
              placeholder="Ex: Facture EDF Janvier 2026"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              className="input"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              {DOCUMENT_TYPES.map(type => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date du document</label>
            <input
              type="date"
              className="input"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Contenu (pour classification IA)
            </label>
            <textarea
              className="input"
              rows={6}
              placeholder="Contenu extrait du fichier (modifiable)..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
            {formData.content && (
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTextClassify}
                  disabled={classifying}
                  className="mt-2 text-sm text-cil-blue hover:underline disabled:opacity-50"
                >
                  {classifying ? 'Classification en cours...' : '🤖 Classifier avec l\'IA'}
                </button>
                <span className="text-xs text-slate-500">({formData.content.length} caractères)</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              className="input"
              rows={2}
              placeholder="Remarques, montant, référence..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {ocrLoading && (
            <div className="mt-4">
              <Loader2 className="w-5 h-5 mr-2" />
              <span className="text-sm">Traitement du fichier en cours...</span>
            </div>
          )}

          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary flex-1">
              Enregistrer
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setFormData({
                  name: '',
                  type: 'invoice',
                  date: '',
                  notes: '',
                  content: '',
                })
                setPreview(null)
                setFileToUpload(null)
                if (preview?.url) {
                  URL.revokeObjectURL(preview.url)
                }
              }}
              className="btn btn-secondary"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">Aucun document enregistré</p>
          <p className="text-sm text-slate-400 mt-1">
            Ajoutez vos DPE, factures, contrats...
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map(doc => {
            const type = DOCUMENT_TYPES.find(t => t.id === doc.type)
            return (
              <div key={doc.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{doc.icon}</span>
                    <div>
                      <h3 className="font-semibold">{doc.name}</h3>
                      <p className="text-sm text-slate-500">{type?.label}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {doc.date && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(doc.date).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}

                {doc.notes && (
                  <p className="mt-2 text-sm text-slate-500 bg-slate-50 rounded-lg p-2">
                    {doc.notes}
                  </p>
                )}

                <div className="mt-3 flex items-center gap-2">
                  <Tag className="w-3 h-3 text-slate-400" />
                  <span className="badge badge-blue">{type?.label}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}