import { useState, useRef } from 'react'
import { Upload, FileText, Trash2, Tag, Calendar } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useDropzone } from 'react-dropzone'

const DOCUMENT_TYPES = [
  { id: 'dpe', label: 'DPE', icon: '📊' },
  { id: 'invoice', label: 'Facture', icon: '🧾' },
  { id: 'contract', label: 'Contrat', icon: '📄' },
  { id: 'warranty', label: 'Garantie', icon: '🛡️' },
  { id: 'maintenance', label: 'Entretien', icon: '🔧' },
  { id: 'other', label: 'Autre', icon: '📎' },
]

export default function Documents() {
  const [documents, setDocuments] = useLocalStorage('cil-documents', [])
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [classifying, setClassifying] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'invoice',
    date: '',
    notes: '',
    content: '',
  })
  const fileInputRef = useRef(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        // Process file upload and classification
        await handleFileUpload(file)
      }
    }
  })

  const handleFileUpload = async (file) => {
    setUploading(true)
    try {
      // For demo, just use file name
      const fileName = file.name
      setFormData({
        ...formData,
        name: fileName.replace(/\.[^/.]+$/, ''),
      })

      // If it's a text file, try to classify
      if (file.type === 'text/plain') {
        const text = await file.text()
        const type = await classifyDocument(text)
        setFormData(prev => ({ ...prev, type, content: text }))
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

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

  const handleTextClassify = async () => {
    if (!formData.content) return
    const type = await classifyDocument(formData.content)
    setFormData(prev => ({ ...prev, type }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const type = DOCUMENT_TYPES.find(t => t.id === formData.type)
    const newDoc = {
      id: Date.now(),
      ...formData,
      icon: type?.icon || '📎',
      createdAt: new Date().toISOString(),
    }
    setDocuments([...documents, newDoc])
    setFormData({
      name: '',
      type: 'invoice',
      date: '',
      notes: '',
      content: '',
    })
    setShowForm(false)
  }

  const handleDelete = (id) => {
    if (confirm('Supprimer ce document ?')) {
      setDocuments(documents.filter(doc => doc.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Documents</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Dropzone Area */}
      <div 
        {...getRootProps()} 
        className={`card border-2 border-dashed text-center cursor-pointer p-8 ${
          isDragActive ? 'border-cil-blue bg-blue-50' : 'border-slate-300'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto text-slate-400" />
        <p className="mt-2 text-slate-500">
          {isDragActive ? 'Déposez le fichier ici' : 'Glissez un fichier ici ou cliquez pour sélectionner'}
        </p>
        <p className="text-sm text-slate-400 mt-1">Formats supportés: PDF, JPG, PNG, TXT</p>
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

          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary flex-1">
              Enregistrer
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
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
}
