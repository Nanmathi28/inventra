import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, Search, Sun, Moon, Bell, User, Settings, LogOut, ChevronDown, Shield } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onMenuClick }) {
  const { dark, toggle } = useTheme();
  const { user, logout, notifications, markAllRead, markRead } = useAuth();
  const navigate = useNavigate();

  const [showAlerts, setShowAlerts] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const alertRef = useRef(null);
  const profileRef = useRef(null);

  const unread = notifications.filter(n => !n.read).length;

  const roleColors = {
    admin: 'from-blue-500 to-blue-700',
    pharmacist: 'from-emerald-500 to-emerald-700',
    customer: 'from-purple-500 to-purple-700',
  };
  const roleLabels = { admin: 'Administrator', pharmacist: 'Senior Pharmacist', customer: 'Patient' };
  const alertDotColors = { critical: 'bg-red-500', expiry: 'bg-orange-500', forecast: 'bg-blue-500', low: 'bg-amber-500', restock: 'bg-green-500' };

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e) {
      if (alertRef.current && !alertRef.current.contains(e.target)) setShowAlerts(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center px-4 gap-3 sticky top-0 z-20 flex-shrink-0">
      <button onClick={onMenuClick} className="lg:hidden p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
        <Menu size={20} />
      </button>

      {/* Search */}
      {/* <div className="flex-1 max-w-md relative hidden sm:block">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search medicines, suppliers…"
          className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-700 dark:text-gray-200 placeholder-gray-400" />
      </div> */}

      <div className="ml-auto flex items-center gap-1.5">
        {/* Dark mode */}
        <button onClick={toggle} className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          {dark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={alertRef}>
          <button onClick={() => { setShowAlerts(s => !s); setShowProfile(false); }}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 relative transition-colors">
            <Bell size={17} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">{unread}</span>
            )}
          </button>

          {showAlerts && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <span className="font-semibold text-sm text-gray-800 dark:text-gray-100">Notifications</span>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Mark all read</button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} onClick={() => markRead(n.id)}
                    className={`px-4 py-3.5 flex gap-3 border-b border-gray-50 dark:border-gray-700/40 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                    <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${alertDotColors[n.type] || 'bg-gray-400'}`} />
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-semibold truncate ${!n.read ? 'text-gray-800 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>{n.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">{n.desc}</p>
                      <p className="text-[10px] text-gray-300 dark:text-gray-500 mt-1">{n.time}</p>
                    </div>
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />}
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700">
                <Link to="/alerts" onClick={() => setShowAlerts(false)} className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">View all alerts →</Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button onClick={() => { setShowProfile(s => !s); setShowAlerts(false); }}
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${roleColors[user?.role] || 'from-blue-500 to-blue-700'} flex items-center justify-center text-white text-xs font-bold`}>
              {user?.avatar}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 leading-tight">{user?.name?.split(' ').slice(0,2).join(' ')}</p>
              <p className="text-[10px] text-gray-400 leading-tight capitalize">{user?.role}</p>
            </div>
            <ChevronDown size={12} className="text-gray-400 hidden sm:block" />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
              {/* User info header */}
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${roleColors[user?.role]} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                    {user?.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-semibold ${user?.role === 'admin' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : user?.role === 'pharmacist' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                      {user?.role?.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className="bg-gray-50 dark:bg-gray-700/60 rounded-lg px-2.5 py-2">
                    <p className="text-[9px] text-gray-400 uppercase tracking-wider">Title</p>
                    <p className="font-medium text-gray-700 dark:text-gray-300 mt-0.5 text-[11px] leading-tight">{user?.title}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/60 rounded-lg px-2.5 py-2">
                    <p className="text-[9px] text-gray-400 uppercase tracking-wider">Experience</p>
                    <p className="font-medium text-gray-700 dark:text-gray-300 mt-0.5 text-[11px]">{user?.experience}</p>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-2">
                <Link to="/settings" onClick={() => setShowProfile(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors">
                  <Settings size={15} className="text-gray-400" />
                  Profile & Settings
                </Link>
                <Link to="/settings" onClick={() => setShowProfile(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors">
                  <Shield size={15} className="text-gray-400" />
                  Security
                </Link>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 py-2">
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
