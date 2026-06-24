import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, Clock, TrendingUp, RefreshCw, CheckCircle, AlertCircle, AlertOctagon, Calendar, BarChart3 } from 'lucide-react';
import { SectionCard, KPICard, Badge } from '../components/ui';
import { api } from '../services/api';

const typeConfig = {
  critical: { label: 'Critical Stock', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800/40', dot: 'bg-red-500', icon: AlertTriangle },
  low: { label: 'Low Stock', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-700/40', dot: 'bg-amber-500', icon: Bell },
  expiry: { label: 'Expiry Alert', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-700/40', dot: 'bg-orange-500', icon: Clock },
  forecast: { label: 'Forecast Alert', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-700/40', dot: 'bg-blue-500', icon: TrendingUp },
};

const typeKey = {
  critical_stock: 'critical',
  low_stock: 'low',
  near_expiry: 'expiry',
};

export default function Alerts() {
  const [filter, setFilter] = useState('all');
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/alerts')
      .then(data => setAlerts(data || []))
      .catch(err => setError(err.message || 'Could not load alerts'))
      .finally(() => setLoading(false));
  }, []);

  const unreadCount = alerts.filter(a => a.status === 'active').length;
  const filtered =
    filter === 'all'
      ? alerts
      : filter === 'unread'
      ? alerts.filter(a => a.status === 'active')
      : alerts.filter(a => typeKey[a.alert_type] === filter);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Alert Center</h1>
          <p className="text-sm text-gray-500 mt-0.5">{loading ? 'Loading alerts…' : `${unreadCount} unread notifications`}</p>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
        <button onClick={async () => {
          try {
            await api.post('/alerts/generate');
            const data = await api.get('/alerts');
            setAlerts(data || []);
          } catch (err) {
            setError(err.message || 'Failed to generate alerts');
          }
        }} className="btn-secondary">
          <RefreshCw size={14} /> Generate Alerts
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'All Alerts', value: alerts.length, color: 'blue', icon: <Bell size={20} /> },
          { label: 'Critical', value: alerts.filter(a => typeKey[a.alert_type] === 'critical').length, color: 'red', icon: <AlertOctagon size={20} /> },
          { label: 'Low Stock', value: alerts.filter(a => typeKey[a.alert_type] === 'low').length, color: 'amber', icon: <AlertTriangle size={20} /> },
          { label: 'Expiry', value: alerts.filter(a => typeKey[a.alert_type] === 'expiry').length, color: 'amber', icon: <Calendar size={20} /> },
          { label: 'Forecast', value: alerts.filter(a => a.alert_type === undefined).length, color: 'blue', icon: <BarChart3 size={20} /> },
        ].map((s, i) => (
          <KPICard key={i} icon={s.icon} label={s.label} value={s.value.toString()} color={s.color} delay={i * 0.05} />
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'unread', 'critical', 'low', 'expiry'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <SectionCard>
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading alerts from backend…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Bell size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No alerts in this category</p>
            </div>
          ) : (
            filtered.map((a, i) => {
              const key = typeKey[a.alert_type] || 'forecast';
              const cfg = typeConfig[key] || typeConfig.forecast;
              const Icon = cfg.icon;
              const isRead = a.status !== 'active';
              const createdAt = new Date(a.created_at).toLocaleString();
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`flex gap-3 p-4 rounded-xl border transition-all ${isRead ? 'bg-gray-50/50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-700/40 opacity-70' : `${cfg.bg} ${cfg.border}`}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isRead ? 'bg-gray-100 dark:bg-gray-700' : cfg.bg}`}>
                    <Icon size={15} className={isRead ? 'text-gray-400' : cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${isRead ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}>{cfg.label}</p>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">{createdAt}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{a.message}</p>
                  </div>
                  {!isRead && (
                    <button
                      onClick={async () => {
                        try {
                          await api.put(`/alerts/${a.id}`, { status: 'resolved' });
                          setAlerts(prev => prev.map(alert => alert.id === a.id ? { ...alert, status: 'resolved' } : alert));
                        } catch (err) {
                          setError(err.message || 'Failed to update alert');
                        }
                      }}
                      className="flex-shrink-0 text-xs text-blue-600 hover:underline self-start"
                    >
                      Mark read
                    </button>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </SectionCard>
    </div>
  );
}
