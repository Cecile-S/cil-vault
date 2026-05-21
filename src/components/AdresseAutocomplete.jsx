import { useState, useEffect, useRef } from 'react'
import { MapPin } from 'lucide-react'

export default function AdresseAutocomplete({ value, onChange, placeholder = 'Adresse du bien' }) {
  const [query, setQuery] = useState(value || '')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(false)
  const debounceRef = useRef(null)
  const wrapperRef = useRef(null)

  // Sync external value
  useEffect(() => {
    if (value && !selected) setQuery(value)
  }, [value])

  // Click outside closes dropdown
  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const search = (q) => {
    if (q.length < 3) {
      setResults([])
      setOpen(false)
      return
    }
    setLoading(true)
    fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=5&autocomplete=1`)
      .then(res => res.json())
      .then(data => {
        setResults(data.features || [])
        setOpen(data.features?.length > 0)
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    setSelected(false)
    if (onChange) onChange({ target: { value: val, name: 'adresse' } })

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 300)
  }

  const handleSelect = (feature) => {
    const label = feature.properties.label
    setQuery(label)
    setOpen(false)
    setSelected(true)
    if (onChange) onChange({ target: { value: label, name: 'adresse' } })
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          className="input pl-9"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          required
          autoComplete="off"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-cil-blue border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {results.map((feature) => (
            <li
              key={feature.properties.id}
              className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer flex items-start gap-2 border-b border-slate-100 last:border-0"
              onClick={() => handleSelect(feature)}
            >
              <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
              <span>{feature.properties.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
