import { NavLink, useLocation } from 'react-router-dom'
import { Home, Wrench, FileText, Bell, Building2 } from 'lucide-react'
import { useProperty } from '../hooks/useProperty'
import logoCilia from '../assets/logo-cilia.svg'

export default function Layout({ children }) {
  const { properties } = useProperty()
  const hasProperty = properties && properties.length > 0
  const location = useLocation()

  const navItems = hasProperty ? [
    { to: '/', icon: Building2, label: 'Mon immo' },
    { to: '/equipment', icon: Wrench, label: 'Équipements' },
    { to: '/documents', icon: FileText, label: 'Documents' },
    { to: '/alerts', icon: Bell, label: 'Alertes' },
  ] : [
    { to: '/', icon: Building2, label: 'Mon immo' },
  ]

  // Navigation title
  const getTitle = () => {
    if (!hasProperty) return 'Mes biens'
    if (location.pathname === '/') return 'Mon bien'
    if (location.pathname.startsWith('/equipment')) return 'Équipements'
    if (location.pathname.startsWith('/documents')) return 'Documents'
    if (location.pathname.startsWith('/alerts')) return 'Alertes'
    return 'CILIA'
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      {/* Header */}
      <header className="bg-marine text-white px-4 py-3 sticky top-0 z-50 shadow-sm">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img src={logoCilia} alt="" className="h-7 w-7 rounded" />
            <span className="font-brand text-lg font-bold tracking-tight">CILIA</span>
          </div>
          {hasProperty && (
            <>
              <span className="text-white/30">|</span>
              <span className="text-sm font-medium">{getTitle()}</span>
            </>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        {children}
      </main>

      {/* Bottom navigation */}
      {hasProperty && (
        <nav className="bg-white border-t border-slate-200 px-4 safe-bottom sticky bottom-0 shadow-sm">
          <div className="max-w-lg mx-auto flex justify-around py-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                    isActive
                      ? 'text-marine bg-cream-dark font-medium'
                      : 'text-slate-500 hover:text-slate-700'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs mt-0.5">{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
