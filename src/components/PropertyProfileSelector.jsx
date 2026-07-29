import { useState } from 'react'
import { useProperty } from '../hooks/useProperty'
import { ChevronRight, Check } from 'lucide-react'
import { PROPERTY_PROFILES, PROFILE_LABELS, PROFILE_ICONS, getProfileDescription } from '../services/property-profile'

const PROFILE_OPTIONS = [
  { value: PROPERTY_PROFILES.OCCUPANT, label: PROFILE_LABELS[PROPERTY_PROFILES.OCCUPANT], icon: PROFILE_ICONS[PROPERTY_PROFILES.OCCUPANT], description: getProfileDescription(PROPERTY_PROFILES.OCCUPANT) },
  { value: PROPERTY_PROFILES.LOCATAIRE, label: PROFILE_LABELS[PROPERTY_PROFILES.LOCATAIRE], icon: PROFILE_ICONS[PROPERTY_PROFILES.LOCATAIRE], description: getProfileDescription(PROPERTY_PROFILES.LOCATAIRE) },
  { value: PROPERTY_PROFILES.AIRBNB, label: PROFILE_LABELS[PROPERTY_PROFILES.AIRBNB], icon: PROFILE_ICONS[PROPERTY_PROFILES.AIRBNB], description: getProfileDescription(PROPERTY_PROFILES.AIRBNB) },
  { value: PROPERTY_PROFILES.VACANT, label: PROFILE_LABELS[PROPERTY_PROFILES.VACANT], icon: PROFILE_ICONS[PROPERTY_PROFILES.VACANT], description: getProfileDescription(PROPERTY_PROFILES.VACANT) },
  { value: PROPERTY_PROFILES.VENTE, label: PROFILE_LABELS[PROPERTY_PROFILES.VENTE], icon: PROFILE_ICONS[PROPERTY_PROFILES.VENTE], description: getProfileDescription(PROPERTY_PROFILES.VENTE) },
]

/**
 * Profile Selection Step - shown after creating a property
 * Asks "How do you use this property?" to configure smart alerts
 */
export default function PropertyProfileSelector({ propertyId, onComplete, onSkip }) {
  const { updateProperty } = useProperty()
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleSelect = (profile) => {
    setSelectedProfile(profile)
  }

  const handleContinue = async () => {
    if (!selectedProfile) return
    
    setSaving(true)
    try {
      await updateProperty(propertyId, { profile: selectedProfile })
      if (onComplete) onComplete(selectedProfile)
    } catch (err) {
      console.error('Failed to save profile:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleSkip = () => {
    if (onSkip) onSkip()
  }

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-2xl flex items-center justify-center">
          <span className="text-4xl">🏠</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Comment utilisez-vous ce bien ?</h2>
        <p className="text-slate-500 mt-2">
          Ces informations nous aident à adapter vos alertes à votre situation.
        </p>
      </div>

      {/* Profile Options */}
      <div className="space-y-3">
        {PROFILE_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              selectedProfile === option.value
                ? 'border-cil-blue bg-blue-50 shadow-lg shadow-blue-100'
                : 'border-slate-200 hover:border-cil-blue hover:bg-blue-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl bg-white border border-slate-200 shrink-0">
                {option.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 truncate">{option.label}</h3>
                  {selectedProfile === option.value && (
                    <Check className="w-5 h-5 text-cil-blue flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-1">{option.description}</p>
              </div>
              {selectedProfile === option.value && (
                <ChevronRight className="w-5 h-5 text-cil-blue flex-shrink-0" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-medium">💡 Vous pourrez changer ce profil plus tard</p>
        <p className="mt-1">Depuis la fiche du bien ou les paramètres d'alertes.</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSkip}
          className="btn btn-secondary flex-1"
          disabled={saving}
        >
          Ignorer pour l'instant
        </button>
        <button
          onClick={handleContinue}
          className="btn btn-primary flex-1"
          disabled={!selectedProfile || saving}
        >
          {saving ? 'Enregistrement...' : 'Continuer'}
        </button>
      </div>
    </div>
  )
}