import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Package, FileText, Clock, Bell, ChevronRight, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

function StatusIcon({ status }) {
  if (status === 'healthy') return <CheckCircle size={15} className="text-green-500" />;
  if (status === 'low') return <AlertCircle size={15} className="text-amber-500" />;
  if (status === 'critical') return <XCircle size={15} className="text-red-500" />;
  return <XCircle size={15} className="text-gray-500" />;
}

export default function CustomerPortal() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('availability');
  const [portalData, setPortalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/portal')
      .then(data => setPortalData(data))
      .catch(err => setError(err.message || 'Could not load portal data'))
      .finally(() => setLoading(false));
  }, []);

  const availabilityData = portalData?.available_medicines || [];
  const orders = portalData?.orders || [];
  const prescriptions = portalData?.prescriptions || [];

  const filtered = availabilityData.filter(m => 
    m.medicine_name.toLowerCase().includes(search.toLowerCase())
  );

  function handleLogout() { logout(); navigate('/'); }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading portal data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-red-500 dark:text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <span className="text-white text-xs font-bold">Ix</span>
            </div>
            <span className="font-bold text-gray-800 dark:text-white">Inventra</span>
            <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-full font-semibold">Patient Portal</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button onClick={toggle} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${user?.avatarColor || 'from-purple-500 to-purple-700'} flex items-center justify-center text-white text-xs font-bold`}>{user?.avatar}</div>
              <span className="hidden sm:block text-gray-700 dark:text-gray-300 font-medium">{user?.name}</span>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-48 h-48 bg-purple-500/20 rounded-full -translate-y-16 translate-x-16 blur-2xl" />
          <div className="relative">
            <p className="text-purple-200 text-sm mb-1">Welcome back</p>
            <h1 className="text-2xl font-bold">{user?.name}</h1>
            <p className="text-purple-200 text-sm mt-1">{user?.title} · ID: {user?.id}</p>
            <div className="flex gap-4 mt-4 text-xs">
              <span className="bg-white/15 px-3 py-1 rounded-full">{orders.length} Past Orders</span>
              <span className="bg-white/15 px-3 py-1 rounded-full">{prescriptions.filter(p => p.valid).length} Active Prescriptions</span>
            </div>
          </div>
        </motion.div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Package, label: 'Available Medicines', value: filtered.filter(m => m.available).length, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
            { icon: FileText, label: 'Active Prescriptions', value: prescriptions.filter(p => p.valid).length, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
            { icon: Clock, label: 'Total Orders', value: orders.length, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-white dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 text-center">
                <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center mx-auto mb-2`}>
                  <Icon size={16} className={s.color.split(' ')[0]} />
                </div>
                <p className="text-xl font-bold text-gray-800 dark:text-white">{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
          {[
            { id: 'availability', label: 'Medicine Availability', icon: Package },
            { id: 'orders', label: 'Order History', icon: Clock },
            { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
          ].map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t.id ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                <Icon size={14} />
                <span className="hidden sm:block">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {tab === 'availability' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search medicines…"
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-gray-100 placeholder-gray-400" />
            </div>
            <div className="bg-white dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No medicines available matching your search.
                </div>
              ) : (
                filtered.map((m, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 dark:border-gray-700/40 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                    <StatusIcon status={m.status} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{m.medicine_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{m.category}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-semibold ${m.status === 'healthy' ? 'text-green-600' : m.status === 'low' ? 'text-amber-600' : 'text-red-600'}`}>
                        {m.available ? `${m.stock} in stock` : 'Unavailable'}
                      </p>
                      <p className="text-[10px] text-gray-400 capitalize mt-0.5">{m.status}</p>
                    </div>
                    {m.available && (
                      <button className="ml-2 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors">
                        Request
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {tab === 'orders' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
            {orders.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No order history available.
              </div>
            ) : (
              orders.map((o, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 dark:border-gray-700/40 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={16} className="text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{o.id}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{o.medicines}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{o.total}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{o.date}</p>
                  </div>
                  <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-semibold capitalize">{o.status}</span>
                </div>
              ))
            )}
          </motion.div>
        )}

        {tab === 'prescriptions' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {prescriptions.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No prescriptions available.
              </div>
            ) : (
              prescriptions.map((p, i) => (
                <div key={i} className={`bg-white dark:bg-gray-800/90 border rounded-2xl p-5 ${p.valid ? 'border-emerald-200 dark:border-emerald-700/50' : 'border-gray-200 dark:border-gray-700 opacity-60'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">{p.id}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Prescribed by {p.doctor}</p>
                      <p className="text-xs text-gray-400 mt-1">{p.medicines}</p>
                      <p className="text-xs text-gray-400 mt-1">Date: {p.date}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${p.valid ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                      {p.valid ? 'Active' : 'Expired'}
                    </span>
                  </div>
                  {p.valid && (
                    <button className="mt-3 w-full py-2 border border-emerald-200 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors flex items-center justify-center gap-2">
                      Fill Prescription <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
