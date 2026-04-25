import { useState, useRef } from 'react'
import { Upload, FileText, Trash2, Tag, Calendar, Image, Clipboard, AlertTriangle, Loader2 } from 'lucide-react'
import { useIndexedDB } from '../hooks/useIndexedDB'

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

  const handleFile = async (file) => {
    setUploading(true)
    try {
      const fileName = file.name
      const fileType = file.type
      let content = ''
      let previewUrl = null
      let previewType = 'other'

      // For text files, read content
      if (fileType.startsWith('text/') || fileType === 'application/json' || fileType === 'application/xml') {
        const text = await file.text()
        content = text
        // Try to classify
        const classifiedType = await classifyDocument(text)
        setFormData(prev => ({ ...prev, type: classifiedType, content: text }))
        previewType = classifiedType
      } else if (fileType.startsWith('image/')) {
        // For images, create preview URL
        previewUrl = URL.createObjectURL(file)
        previewType = 'other' // we will show image preview
        // Store as base64 for persistence
        const base64 = await fileToBase64(file)
        content = base64 // store base64
      } else if (fileType === 'application/pdf') {
        // For PDF, we can't extract text easily without library, store as base64
        previewUrl = URL.createObjectURL(file)
        previewType = 'dpe' // assume PDF could be DPE, but user can change type
        const base64 = await fileToBase64(file)
        content = base64
      } else {
        // For other file types, store as base64
        const base64 = await fileToBase64(file)
        content = base64
        previewType = 'other'
      }

      setFormData(prev => ({
        ...prev,
        name: fileName.replace(/\.[^/.]+$/, ''),
        // keep existing type if already set by classification, otherwise default
        ...(content && !formData.type ? { type: 'other' } : {}),
      }))

      setFileToUpload(file)
      setPreview({ url: previewUrl, type: previewType, name: fileName })
    } catch (error) {
      console.error('File handling error:', error)
    } finally {
      setUploading(false)
    }
  }

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1] // remove data:image/jpeg;base64,
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
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
              rows={3}
              placeholder="Collez le contenu du document pour classification automatique..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
            {formData.content && (
              <button
                type="button"
                onClick={handleTextClassify}
                disabled={classifying}
                className="mt-2 text-sm text-cil-blue hover:underline disabled:opacity-50"
              >
                {classifying ? 'Classification en cours...' : '🤖 Classifier avec l\'IA'}
              </button>
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

          {preview && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Aperçu</h3>
              <div className="space-y-2">
                {preview.type.startsWith('image') && preview.url && (
                  <Image src={preview.url} alt={preview.name} className="w-32 h-32 object-cover rounded border" />
                )}
                {!preview.type.startsWith('image') && preview.url && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded">
                    <div className="text-2xl">
                      {preview.type === 'dpe' ? <AlertTriangle className="text-orange-500" /> : preview.type === 'invoice' ? <FileText className="text-green-500" /> : preview.type === 'contract' ? <Clipboard className="text-blue-500" /> : <Trash2 className="text-slate-500" />}
                    </div>
                    <div>
                      <p className="font-semibold">{preview.name}</p>
                      <p className="text-sm text-slate-500">{preview.type}</p>
                    </div>
                  </div>
                )}
              </div>
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