import { useState } from 'react'
import { Plus, Trash2, Calendar, Settings, Edit2, Save, X, Clock, ChevronDown, ChevronUp, Wrench, Home, Camera, Loader2 } from 'lucide-react'
import { useEquipment } from '../hooks/useEquipment'
import { useProperty } from '../hooks/useProperty'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useMaintenanceHistory } from '../hooks/useMaintenanceHistory'
import { getDefaultResponsibility, USER_ROLES, ROLE_LABELS } from '../hooks/useUserRole'
import { CIL_OCR } from '../services/ocr-service'

const DEFAULT_EQUIPMENT_TYPES = [
  { id: 'boiler', label: 'Chaudière', icon: '🔥', maintenanceInterval: 12 },
  { id: 'vmc', label: 'VMC', icon: '💨', maintenanceInterval: 36 },
  { id: 'heatpump', label: 'PAC', icon: '🌡️', maintenanceInterval: 12 },
  { id: 'waterheater', label: 'Chauffe-eau', icon: '🚿', maintenanceInterval: 24 },
  { id: 'stove', label: 'Poêle', icon: '🏮', maintenanceInterval: 12 },
  { id: 'ac', label: 'Climatisation', icon: '❄️', maintenanceInterval: 12 },
  { id: 'watersoftener', label: 'Adoucisseur', icon: '💧', maintenanceInterval: 12 },
  { id: 'pool', label: 'Piscine', icon: '🏊', maintenanceInterval: 12 },
  { id: 'other', label: 'Autre', icon: '⚙️', maintenanceInterval: 12 },
]

const AVAILABLE_ICONS = ['🔥', '💨', '🌡️', '🚿', '🏮', '❄️', '💧', '🏊', '⚙️', '🔧', '🛠️', '📦', '🚪', '🪟', '🔌', '💡']

export default function Equipment() {
  const { equipment, loading, error, addEquipment, updateEquipment, deleteEquipment } = useEquipment()
  const { properties } = useProperty()
  const { addRecord, deleteRecord, getRecordsByEquipment } = useMaintenanceHistory()
  const [customTypes, setCustomTypes] = useLocalStorage('cil-equipment-custom-types', [])
  const [showForm, setShowForm] = useState(false)
  const [editingEquipmentId, setEditingEquipmentId] = useState(null)
  const [labelPhoto, setLabelPhoto] = useState(null) // base64 data URL de la photo etiquette
  const [labelExtractedText, setLabelExtractedText] = useState('')
  const [labelOcrLoading, setLabelOcrLoading] = useState(false)
  const [notices, setNotices] = useLocalStorage('cil-documentation-notices', [])
  const [linkInputs, setLinkInputs] = useState({}) // { [equipmentId]: url en cours de saisie }
  const [showTypeManager, setShowTypeManager] = useState(false)
  const [filterPropertyId, setFilterPropertyId] = useState('all')
  const [editingPropertyId, setEditingPropertyId] = useState(null)
  const [editPropertyValue, setEditPropertyValue] = useState('')
  const [expandedEquipment, setExpandedEquipment] = useState(null)
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(null) // equipmentId
  const [maintenanceForm, setMaintenanceForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'entretien',
    cost: '',
    company: '',
    notes: '',
  })
  const [formData, setFormData] = useState({
    type: 'boiler',
    customType: '',
    name: '',
    marque: '',
    modele: '',
    reference: '',
    numeroSerie: '',
    installDate: '',
    lastMaintenance: '',
    nextMaintenance: '',
    warrantyMonths: '',
    responsible: '',
    notes: '',
    propertyId: '',
  })
  const [newTypeData, setNewTypeData] = useState({
    label: '',
    icon: '⚙️',
    maintenanceInterval: 12,
  })

  // Combine default and custom types
  const equipmentTypes = [...DEFAULT_EQUIPMENT_TYPES, ...customTypes]

  const MANUFACTURER_NOTICES = {
    'chaudiere frisquet': 'https://www.frisquet.com/documentation',
    'chaudiere de dietrich': 'https://www.dedietrich-thermique.fr/notices',
    'chaudiere saunier': 'https://www.saunierduval.fr/documentation',
    'chaudiere viessmann': 'https://www.viessmann.com/fr/documentation/',
    'chaudiere elm leblanc': 'https://www.elmleblanc-particuliers.fr/notices',
    'vmc atlantic': 'https://www.atlantic.fr/documentation-vmc',
    'vmc aldes': 'https://www.aldes.fr/documentation/',
    'pac daikin': 'https://www.daikin.fr/fr/documentation',
    'pac mitsubishi': 'https://www.mitsubishi-electric.fr/documentation',
    'pac atlantic': 'https://www.atlantic.fr/documentation-pompes-a-chaleur',
    'chauffe-eau ariston': 'https://www.ariston.com/documentation',
  }

  const findManufacturerNotice = (marque, modele) => {
    const query = `${marque || ''} ${modele || ''}`.toLowerCase()
    for (const [key, url] of Object.entries(MANUFACTURER_NOTICES)) {
      if (query.includes(key.split(' ')[1] || '') && query.includes(key.split(' ')[0])) {
        return url
      }
    }
    return null
  }

  const getNoticesForEquipment = (equipmentId) => notices.filter(n => n.equipmentId === equipmentId)

  const handleAddNoticeLink = (eq) => {
    const url = (linkInputs[eq.id] || '').trim()
    if (!url) return
    setNotices([...notices, {
      id: Date.now(),
      equipmentId: eq.id,
      title: `Notice ${eq.marque || ''} ${eq.modele || ''}`.trim() || eq.name,
      url,
      source: 'manual',
      addedAt: new Date().toISOString(),
    }])
    setLinkInputs({ ...linkInputs, [eq.id]: '' })
  }

  const handleDeleteNotice = (noticeId) => {
    setNotices(notices.filter(n => n.id !== noticeId))
  }

  const handleLabelPhoto = async (file) => {
    if (!file) return
    setLabelOcrLoading(true)
    try {
      const reader = new FileReader()
      const dataUrl = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      setLabelPhoto(dataUrl)
      const text = await CIL_OCR.extractText(file)
      setLabelExtractedText(text || '')
    } catch (err) {
      console.error('Erreur lecture etiquette:', err)
      setLabelExtractedText('')
    } finally {
      setLabelOcrLoading(false)
    }
  }

  const handleEditEquipment = (eq) => {
    setEditingEquipmentId(eq.id)
    setFormData({
      type: eq.type || 'boiler',
      customType: '',
      name: eq.name || '',
      marque: eq.marque || '',
      modele: eq.modele || '',
      reference: eq.reference || '',
      numeroSerie: eq.numeroSerie || '',
      installDate: eq.installDate || '',
      lastMaintenance: eq.lastMaintenance || '',
      nextMaintenance: eq.nextMaintenance || '',
      warrantyMonths: eq.warrantyMonths ? String(eq.warrantyMonths) : '',
      responsible: eq.responsible || '',
      notes: eq.notes || '',
      propertyId: eq.propertyId || '',
    })
    setLabelPhoto(eq.labelPhoto || null)
    setLabelExtractedText('')
    setShowForm(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const type = equipmentTypes.find(t => t.id === formData.type)
    const isCustomType = formData.type.startsWith('custom-')
    const typeLabel = isCustomType 
      ? customTypes.find(t => t.id === formData.type)?.label || formData.type
      : type?.label || 'Autre'

    const newEquipment = {
      id: Date.now(),
      type: formData.type,
      typeLabel: typeLabel,
      name: formData.name || typeLabel,
      marque: formData.marque,
      modele: formData.modele,
      reference: formData.reference,
      numeroSerie: formData.numeroSerie,
      labelPhoto: labelPhoto,
      installDate: formData.installDate,
      lastMaintenance: formData.lastMaintenance,
      nextMaintenance: formData.nextMaintenance,
      maintenanceInterval: type?.maintenanceInterval || 12,
      warrantyMonths: formData.warrantyMonths ? parseInt(formData.warrantyMonths) : null,
      responsible: formData.responsible || getDefaultResponsibility(formData.type),
      notes: formData.notes,
      propertyId: formData.propertyId || null,
      createdAt: new Date().toISOString(),
    }
    if (editingEquipmentId) {
      const { id, createdAt, ...updates } = newEquipment
      updateEquipment(editingEquipmentId, updates)
      setEditingEquipmentId(null)
    } else {
      addEquipment(newEquipment)
    }
    setFormData({
      type: 'boiler',
      customType: '',
      name: '',
      marque: '',
      modele: '',
      reference: '',
      numeroSerie: '',
      installDate: '',
      lastMaintenance: '',
      nextMaintenance: '',
      warrantyMonths: '',
      responsible: '',
      notes: '',
      propertyId: '',
    })
    setLabelPhoto(null)
    setLabelExtractedText('')
    setShowForm(false)
  }

  const handleDelete = (id) => {
    if (confirm('Supprimer cet équipement ?')) {
      deleteEquipment(id)
    }
  }

  const handleLogMaintenance = (equipmentId) => {
    addRecord({
      equipmentId,
      date: maintenanceForm.date,
      type: maintenanceForm.type,
      cost: parseFloat(maintenanceForm.cost) || 0,
      company: maintenanceForm.company,
      notes: maintenanceForm.notes,
    })
    setMaintenanceForm({
      date: new Date().toISOString().split('T')[0],
      type: 'entretien',
      cost: '',
      company: '',
      notes: '',
    })
    setShowMaintenanceForm(null)
  }

  const toggleEquipmentExpansion = (id) => {
    setExpandedEquipment(expandedEquipment === id ? null : id)
    setShowMaintenanceForm(null)
  }

  const handleAddCustomType = () => {
    if (!newTypeData.label.trim()) return
    const newType = {
      id: `custom-${Date.now()}`,
      label: newTypeData.label.trim(),
      icon: newTypeData.icon,
      maintenanceInterval: parseInt(newTypeData.maintenanceInterval) || 12,
      isCustom: true,
    }
    setCustomTypes([...customTypes, newType])
    setNewTypeData({ label: '', icon: '⚙️', maintenanceInterval: 12 })
  }

  const handleDeleteCustomType = (typeId) => {
    if (confirm('Supprimer ce type personnalisé ?')) {
      setCustomTypes(customTypes.filter(t => t.id !== typeId))
    }
  }

  const getDaysUntilMaintenance = (nextDate) => {
    if (!nextDate) return null
    const next = new Date(nextDate)
    const today = new Date()
    const diff = Math.ceil((next - today) / (1000 * 60 * 60 * 24))
    return diff
  }

  const getMaintenanceStatus = (days) => {
    if (days === null) return { label: 'Non planifiée', color: 'badge-blue' }
    if (days < 0) return { label: 'En retard', color: 'badge-red' }
    if (days <= 30) return { label: 'À planifier', color: 'badge-orange' }
    return { label: 'OK', color: 'badge-green' }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Chargement des équipements...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Erreur lors du chargement des équipements</p>
        <p className="text-slate-400">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Équipements</h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowTypeManager(true)} 
            className="btn btn-secondary flex items-center gap-2"
            title="Gérer les types"
          >
            <Edit2 className="w-4 h-4" />
            Types
          </button>
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </div>

      {/* Type Manager Modal */}
      {showTypeManager && (
        <div className="card space-y-4 border-2 border-blue-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-blue-800">Types d'équipements</h3>
            <button onClick={() => setShowTypeManager(false)} className="text-slate-500">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-2">Types prédéfinis:</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {DEFAULT_EQUIPMENT_TYPES.map(type => (
                <span key={type.id} className="badge badge-blue">
                  {type.icon} {type.label}
                </span>
              ))}
            </div>
          </div>

          {customTypes.length > 0 && (
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-2">Types personnalisés:</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {customTypes.map(type => (
                  <span key={type.id} className="badge badge-green flex items-center gap-1">
                    {type.icon} {type.label}
                    <button 
                      onClick={() => handleDeleteCustomType(type.id)}
                      className="ml-1 text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-blue-200 pt-4">
            <p className="font-medium text-blue-800 mb-2">Ajouter un type personnalisé:</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <input
                type="text"
                className="input"
                placeholder="Nom du type"
                value={newTypeData.label}
                onChange={(e) => setNewTypeData({ ...newTypeData, label: e.target.value })}
              />
              <select
                className="input"
                value={newTypeData.icon}
                onChange={(e) => setNewTypeData({ ...newTypeData, icon: e.target.value })}
              >
                {AVAILABLE_ICONS.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
              <input
                type="number"
                className="input"
                placeholder="Intervalle (mois)"
                value={newTypeData.maintenanceInterval}
                onChange={(e) => setNewTypeData({ ...newTypeData, maintenanceInterval: e.target.value })}
                min="1"
                max="120"
              />
              <button 
                onClick={handleAddCustomType}
                className="btn btn-primary flex items-center justify-center gap-2"
                disabled={!newTypeData.label.trim()}
              >
                <Save className="w-4 h-4" />
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select 
              className="input" 
              value={formData.type} 
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <optgroup label="Types prédéfinis">
                {DEFAULT_EQUIPMENT_TYPES.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </optgroup>
              {customTypes.length > 0 && (
                <optgroup label="Types personnalisés">
                  {customTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Bien associé</label>
            <select 
              className="input" 
              value={formData.propertyId} 
              onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
            >
              <option value="">— Sélectionner un bien —</option>
              {properties.map(prop => (
                <option key={prop.id} value={prop.id}>
                  {prop.adresse || prop.nom || `Bien #${prop.id}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nom / Modèle</label>
            <input 
              type="text" 
              className="input" 
              placeholder="Ex: Chaudière Frisquet" 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-lg space-y-2">
            <label className="block text-sm font-medium">
              Photo etiquette produit (pour retrouver la reference/notice)
            </label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="input"
              onChange={(e) => handleLabelPhoto(e.target.files?.[0])}
            />
            {labelOcrLoading && (
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Lecture de l'etiquette...
              </p>
            )}
            {labelExtractedText && (
              <div className="text-xs bg-white border border-slate-200 rounded p-2 max-h-24 overflow-y-auto">
                <p className="font-medium text-slate-600 mb-1">Texte detecte (copiez la marque/reference ci-dessous) :</p>
                <p className="text-slate-500 whitespace-pre-wrap">{labelExtractedText}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Marque</label>
              <input
                type="text"
                className="input"
                placeholder="Ex: Frisquet"
                value={formData.marque}
                onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Modele</label>
              <input
                type="text"
                className="input"
                placeholder="Ex: Optima"
                value={formData.modele}
                onChange={(e) => setFormData({ ...formData, modele: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reference</label>
              <input
                type="text"
                className="input"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Numero de serie</label>
              <input
                type="text"
                className="input"
                value={formData.numeroSerie}
                onChange={(e) => setFormData({ ...formData, numeroSerie: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date d'installation</label>
            <input 
              type="date" 
              className="input" 
              value={formData.installDate} 
              onChange={(e) => setFormData({ ...formData, installDate: e.target.value })} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Dernier entretien</label>
            <input 
              type="date" 
              className="input" 
              value={formData.lastMaintenance} 
              onChange={(e) => setFormData({ ...formData, lastMaintenance: e.target.value })} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Prochain entretien</label>
            <input 
              type="date" 
              className="input" 
              value={formData.nextMaintenance} 
              onChange={(e) => setFormData({ ...formData, nextMaintenance: e.target.value })} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Garantie (mois)</label>
            <input 
              type="number" 
              className="input" 
              placeholder="Ex: 24"
              value={formData.warrantyMonths} 
              onChange={(e) => setFormData({ ...formData, warrantyMonths: e.target.value })} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Responsable de l'entretien</label>
            <select
              className="input"
              value={formData.responsible || getDefaultResponsibility(formData.type)}
              onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
            >
              <option value={USER_ROLES.OWNER}>{ROLE_LABELS[USER_ROLES.OWNER]}</option>
              <option value={USER_ROLES.TENANT}>{ROLE_LABELS[USER_ROLES.TENANT]}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea 
              className="input" 
              rows={2} 
              placeholder="Remarques, contrat d'entretien..." 
              value={formData.notes} 
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary flex-1">
              {editingEquipmentId ? 'Modifier' : 'Enregistrer'}
            </button>
            <button 
              type="button" 
              onClick={() => {
                setShowForm(false)
                setEditingEquipmentId(null)
                setLabelPhoto(null)
                setLabelExtractedText('')
              }} 
              className="btn btn-secondary"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Property filter bar — only show if more than 1 property */}
      {properties.length > 1 && (
        <div className="flex items-center gap-2">
          <Home className="w-4 h-4 text-slate-400" />
          <select
            className="input text-sm max-w-xs"
            value={filterPropertyId}
            onChange={(e) => setFilterPropertyId(e.target.value)}
          >
            <option value="all">Tous les biens</option>
            {properties.map(prop => (
              <option key={prop.id} value={prop.id}>
                {prop.adresse || prop.nom || `Bien #${prop.id}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Filtered equipment list */}
      {(() => {
        const filteredEquipment = filterPropertyId === 'all'
          ? equipment
          : equipment.filter(eq => eq.propertyId === parseInt(filterPropertyId) || eq.propertyId === filterPropertyId)
        
        if (filteredEquipment.length === 0) {
          return (
            <div className="text-center py-12">
              <Settings className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">
                {equipment.length === 0
                  ? 'Aucun équipement enregistré'
                  : 'Aucun équipement pour ce bien'
                }
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Ajoutez votre chaudière, VMC ou PAC pour recevoir des rappels d'entretien
              </p>
            </div>
          )
        }

        return (
        <div className="space-y-3">
          {filteredEquipment.map(eq => {
            const type = equipmentTypes.find(t => t.id === eq.type)
            const days = getDaysUntilMaintenance(eq.nextMaintenance)
            const status = getMaintenanceStatus(days)
            const history = getRecordsByEquipment(eq.id)
            const isExpanded = expandedEquipment === eq.id
            return (
              <div key={eq.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{type?.icon || '⚙️'}</span>
                    <div>
                      <h3 className="font-semibold">{eq.name}</h3>
                      <p className="text-sm text-slate-500">{type?.label || eq.typeLabel}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {(eq.marque || eq.modele) && (
                      <button
                        onClick={() => toggleEquipmentExpansion(eq.id)}
                        className="p-2 text-slate-400 hover:text-blue-500"
                        title="Chercher la notice"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleEditEquipment(eq)}
                      className="p-2 text-slate-400 hover:text-blue-500"
                      title="Modifier l'equipement"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingPropertyId(editingPropertyId === eq.id ? null : eq.id)
                        setEditPropertyValue(eq.propertyId || '')
                      }}
                      className="p-2 text-slate-400 hover:text-blue-500"
                      title="Modifier le bien associé"
                    >
                      <Home className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleEquipmentExpansion(eq.id)}
                      className="p-2 text-slate-400 hover:text-blue-500"
                      title="Historique d'entretien"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => handleDelete(eq.id)} 
                      className="p-2 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {eq.nextMaintenance && (
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span>Entretien le {new Date(eq.nextMaintenance).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <span className={`badge ${status.color}`}>{status.label}</span>
                  </div>
                )}

                {eq.notes && (
                  <p className="mt-2 text-sm text-slate-500 bg-slate-50 rounded-lg p-2">
                    {eq.notes}
                  </p>
                )}

                {/* Associated property badge */}
                {eq.propertyId && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                    <Home className="w-3.5 h-3.5" />
                    <span>
                      {properties.find(p => p.id === eq.propertyId)?.adresse 
                        || properties.find(p => p.id === eq.propertyId)?.nom 
                        || `Bien #${eq.propertyId}`}
                    </span>
                  </div>
                )}

                {/* Expandable maintenance history */}
                {isExpanded && (
                  <div className="mt-4 border-t border-slate-200 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-sm flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        Historique d'entretien
                      </h4>
                      <button
                        onClick={() => setShowMaintenanceForm(showMaintenanceForm === eq.id ? null : eq.id)}
                        className="btn btn-sm btn-secondary flex items-center gap-1.5"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        {showMaintenanceForm === eq.id ? 'Annuler' : 'Ajouter'}
                      </button>
                    </div>

                    {/* Quick log form */}
                    {showMaintenanceForm === eq.id && (
                      <div className="bg-slate-50 rounded-lg p-3 mb-3 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-medium mb-0.5">Date</label>
                            <input
                              type="date"
                              className="input text-sm"
                              value={maintenanceForm.date}
                              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, date: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-0.5">Type</label>
                            <select
                              className="input text-sm"
                              value={maintenanceForm.type}
                              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, type: e.target.value })}
                            >
                              <option value="entretien">Entretien</option>
                              <option value="reparation">Réparation</option>
                              <option value="remplacement">Remplacement</option>
                              <option value="diagnostic">Diagnostic</option>
                              <option value="autre">Autre</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-medium mb-0.5">Coût (€)</label>
                            <input
                              type="number"
                              className="input text-sm"
                              placeholder="0"
                              value={maintenanceForm.cost}
                              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, cost: e.target.value })}
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-0.5">Entreprise</label>
                            <input
                              type="text"
                              className="input text-sm"
                              placeholder="Nom prestataire"
                              value={maintenanceForm.company}
                              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, company: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-0.5">Notes</label>
                          <textarea
                            className="input text-sm"
                            rows={2}
                            placeholder="Détails de l'intervention..."
                            value={maintenanceForm.notes}
                            onChange={(e) => setMaintenanceForm({ ...maintenanceForm, notes: e.target.value })}
                          />
                        </div>
                        <button
                          onClick={() => handleLogMaintenance(eq.id)}
                          className="btn btn-primary w-full text-sm"
                          disabled={!maintenanceForm.date}
                        >
                          Enregistrer l'intervention
                        </button>
                      </div>
                    )}

                    {/* History records */}
                    {history.length === 0 ? (
                      <p className="text-sm text-slate-400 italic">
                        Aucun entretien enregistré. Ajoutez votre première intervention.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {history.map((record) => {
                          const typeColors = {
                            entretien: 'bg-blue-100 text-blue-700',
                            reparation: 'bg-orange-100 text-orange-700',
                            remplacement: 'bg-purple-100 text-purple-700',
                            diagnostic: 'bg-green-100 text-green-700',
                            autre: 'bg-slate-100 text-slate-700',
                          }
                          const typeColor = typeColors[record.type] || typeColors.autre
                          return (
                            <div key={record.id} className="flex items-start justify-between bg-slate-50 rounded-lg p-2.5">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium bg-white px-2 py-0.5 rounded">
                                    {new Date(record.date).toLocaleDateString('fr-FR')}
                                  </span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor}`}>
                                    {record.type === 'entretien' ? 'Entretien' :
                                     record.type === 'reparation' ? 'Réparation' :
                                     record.type === 'remplacement' ? 'Remplacement' :
                                     record.type === 'diagnostic' ? 'Diagnostic' :
                                     'Autre'}
                                  </span>
                                  {record.cost > 0 && (
                                    <span className="text-xs text-slate-500">{record.cost.toFixed(2)} €</span>
                                  )}
                                </div>
                                {record.company && (
                                  <p className="text-xs text-slate-500 mt-1">{record.company}</p>
                                )}
                                {record.notes && (
                                  <p className="text-xs text-slate-600 mt-0.5">{record.notes}</p>
                                )}
                              </div>
                              <button
                                onClick={() => deleteRecord(record.id)}
                                className="p-1 text-slate-300 hover:text-red-500 ml-2 shrink-0"
                                title="Supprimer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Notice / documentation - integree a la fiche equipement */}
                    <div className="mt-4 border-t border-slate-200 pt-4">
                      <h4 className="font-semibold text-sm flex items-center gap-1.5 mb-3">
                        <Camera className="w-4 h-4 text-slate-400" />
                        Notice / documentation
                      </h4>

                      {getNoticesForEquipment(eq.id).length > 0 && (
                        <div className="space-y-2 mb-3">
                          {getNoticesForEquipment(eq.id).map(notice => (
                            <div key={notice.id} className="flex items-center justify-between bg-slate-50 rounded-lg p-2 text-sm">
                              <a href={notice.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                                {notice.title}
                              </a>
                              <button
                                onClick={() => handleDeleteNotice(notice.id)}
                                className="p-1 text-slate-300 hover:text-red-500 shrink-0"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {(eq.marque || eq.modele) ? (
                        <div className="space-y-2">
                          {findManufacturerNotice(eq.marque, eq.modele) && (
                            <a
                              href={findManufacturerNotice(eq.marque, eq.modele)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-secondary text-sm w-full text-center block"
                            >
                              Notice trouvee : site du fabricant
                            </a>
                          )}
                          <a
                            href={`https://www.google.com/search?q=${encodeURIComponent((eq.marque || '') + ' ' + (eq.modele || '') + ' notice mode emploi filetype:pdf')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary text-sm w-full text-center block"
                          >
                            Chercher sur internet (PDF uniquement)
                          </a>
                          <div className="flex gap-2">
                            <input
                              type="url"
                              className="input text-sm flex-1"
                              placeholder="Coller le lien de la notice trouvee"
                              value={linkInputs[eq.id] || ''}
                              onChange={(e) => setLinkInputs({ ...linkInputs, [eq.id]: e.target.value })}
                            />
                            <button
                              onClick={() => handleAddNoticeLink(eq)}
                              className="btn btn-primary text-sm"
                            >
                              Lier
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">
                          Renseignez la marque/modele (via photo etiquette) pour rechercher une notice.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )})()}
    </div>
  )
}