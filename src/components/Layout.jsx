import { NavLink } from 'react-router-dom'
import { Home, Wrench, FileText, Bell } from 'lucide-react'

export default function Layout({ children }) {
  const navItems = [
    { to: '/', icon: Home, label: 'Accueil' },
    { to: '/equipment', icon: Wrench, label: 'Équipements' },
    { to: '/documents', icon: FileText, label: 'Documents' },
    { to: '/alerts', icon: Bell, label: 'Alertes' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-cil-blue text-white px-4 py-3 sticky top-0 z-50">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-lg font-semibold">CIL Vault</h1>
          <span className="text-sm opacity-80">Paris</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="bg-white border-t border-slate-200 px-4 safe-bottom sticky bottom-0">
        <div className="max-w-lg mx-auto flex justify-around py-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isActive
                    ? 'text-cil-blue bg-blue-50'
                    : 'text-slate-500 hover:text-slate-700'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs mt-1">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
