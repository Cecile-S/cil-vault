import { useState, useEffect } from 'react'
import { MapPin, Check, Loader2, AlertCircle } from 'lucide-react'

// API endpoint for French address validation
const API_ADRESSE = 'https://api-adresse.data.gouv.fr'

export default function AdresseInput({ 
  value = '', 
  onChange, 
  label = 'Adresse',
  placeholder = 'Entrez votre adresse...',
  required = false 
}) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [error, setError] = useState(null)

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 5) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(
          `${API_ADRESSE}/search/?q=${encodeURIComponent(query)}&limit=5&autocomplete=1`,
          { mode: 'cors' }
        )
        
        if (!response.ok) {
          throw new Error('Erreur lors de la recherche')
        }
        
        const data = await response.json()
        
        if (data.features && data.features.length > 0) {
          setSuggestions(data.features.map(f => ({
            id: f.properties.id,
            label: f.properties.label,
            city: f.properties.city,
            citycode: f.properties.citycode,
            postcode: f.properties.postcode,
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
            context: f.properties.context,
          })))
        } else {
          setSuggestions([])
        }
      } catch (err) {
        console.error('Address search error:', err)
        setError('Impossible de rechercher les adresses')
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (address) => {
    setSelectedAddress(address)
    setQuery(address.label)
    setShowSuggestions(false)
    setSuggestions([])
    
    // Return complete address object
    if (onChange) {
      onChange({
        raw: address.label,
        street: address.label.replace(/^[^,]+,?\s*/, ''),
        city: address.city,
        citycode: address.citycode,
        postalCode: address.postcode,
        lat: address.lat,
        lng: address.lng,
        formatted: `${address.label}`,
      })
    }
  }

  const handleManualInput = (e) => {
    setQuery(e.target.value)
    setSelectedAddress(null)
    if (onChange) {
      onChange({
        raw: e.target.value,
        street: e.target.value,
        city: '',
        citycode: '',
        postcode: '',
        lat: null,
        lng: null,
        formatted: e.target.value,
      })
    }
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          className="input pl-10"
          placeholder={placeholder}
          value={query}
          onChange={handleManualInput}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          required={required}
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
          </div>
        )}
        {selectedAddress && !loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Check className="h-4 w-4 text-green-500" />
          </div>
        )}
      </div>

      {error && (
        <div className="mt-1 flex items-center gap-1 text-sm text-red-500">
          <AlertCircle className="h-3 w-3" />
          <span>{error}</span>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {suggestions.map((address) => (
            <li
              key={address.id}
              className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm"
              onClick={() => handleSelect(address)}
            >
              <div className="font-medium">{address.label}</div>
              <div className="text-slate-500 text-xs">
                {address.postcode} {address.city}
              </div>
            </li>
          ))}
        </ul>
      )}

      {showSuggestions && query.length >= 5 && suggestions.length === 0 && !loading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-sm text-slate-500">
          Aucune adresse trouvée
        </div>
      )}

      {selectedAddress && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg text-sm">
          <div className="flex items-center gap-2 text-green-700">
            <Check className="h-4 w-4" />
            <span>Adresse validée</span>
          </div>
          <div className="text-green-600 mt-1 text-xs">
            {selectedAddress.postcode} • {selectedAddress.city}
          </div>
        </div>
      )}
    </div>
  )
}