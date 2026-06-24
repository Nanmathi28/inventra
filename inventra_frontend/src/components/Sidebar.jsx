import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, TrendingUp, RefreshCw, Clock,
  Bell, BarChart2, Truck, Bot, Settings, X, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const allNavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'pharmacist'] },
  { to: '/medicines', label: 'Medicines', icon: Package, roles: ['admin', 'pharmacist'] },
  { to: '/inventory', label: 'Inventory', icon: Package, roles: ['admin', 'pharmacist'] },
  { to: '/forecast', label: 'Demand Forecast', icon: TrendingUp, roles: ['admin', 'pharmacist'] },
  { to: '/restock', label: 'Smart Restocking', icon: RefreshCw, roles: ['admin', 'pharmacist'] },
  { to: '/expiry', label: 'Expiry Management', icon: Clock, roles: ['admin', 'pharmacist'] },
  { to: '/alerts', label: 'Alert Center', icon: Bell, roles: ['admin', 'pharmacist'] },
  { to: '/reports', label: 'Reports & Analytics', icon: BarChart2, roles: ['admin'] },
  { to: '/suppliers', label: 'Suppliers', icon: Truck, roles: ['admin'] },
  { to: '/assistant', label: 'AI Assistant', icon: Bot, roles: ['admin', 'pharmacist'] },
  { to: '/settings', label: 'Settings', icon: Settings, roles: ['admin', 'pharmacist'] },
];

// Sidebar no longer renders the bottom user profile; user info is shown in the top-right navbar.

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = allNavItems.filter(item => item.roles.includes(user?.role));
  // Items user's role can't access (show locked)
  const lockedItems = allNavItems.filter(item => !item.roles.includes(user?.role) && user?.role !== 'admin');

  function handleLogout() { logout(); navigate('/'); }

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={onClose} />}

      <aside className={`
        fixed lg:relative z-30 lg:z-auto h-full
        w-64 flex flex-col
        bg-white dark:bg-gray-900
        border-r border-gray-100 dark:border-gray-800
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <span className="text-white text-sm font-bold">Ix</span>
              </div>
              <span className="text-lg font-bold text-gray-800 dark:text-white tracking-tight">Inventra</span>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 pl-[42px]">Predictive Inventory Intelligence</p>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg">
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}
              onClick={() => window.innerWidth < 1024 && onClose()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer
                ${isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:text-gray-800 dark:hover:text-gray-100'
                }`
              }
            >
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}

          {/* Locked items for pharmacist */}
          {user?.role === 'pharmacist' && lockedItems.filter(i => ['admin'].includes(i.roles[0])).length > 0 && (
            <>
              <div className="pt-3 pb-1 px-3">
                <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Admin Only</p>
              </div>
              {lockedItems.map(({ to, label, icon: Icon }) => (
                <div key={to} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-300 dark:text-gray-600 cursor-not-allowed select-none">
                  <Icon size={17} />
                  <span className="flex-1">{label}</span>
                  <Lock size={11} />
                </div>
              ))}
            </>
          )}
        </nav>

        {/* Footer spacer to keep visual balance after profile removal */}
        <div className="px-3 py-4" />
      </aside>
    </>
  );
}
