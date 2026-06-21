import { motion } from 'framer-motion';

export function Badge({ variant = 'gray', children }) {
  const variants = {
    healthy: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    low: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    critical: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    expired: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
    medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    gray: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  };
  return (
    <span className={`badge ${variants[variant] || variants.gray}`}>{children}</span>
  );
}

export function KPICard({ icon, label, value, sub, trend, color = 'blue', delay = 0 }) {
  const colors = {
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400',
    amber: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400',
    red: 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400',
    purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400',
    cyan: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/30 dark:text-cyan-400',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="kpi-card"
    >
      {icon && typeof icon !== 'string' && (
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
      )}
      <div className={`${icon && typeof icon !== 'string' ? 'mt-2' : ''}`}>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-white mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
        {trend && (
          <p className={`text-xs font-medium mt-1 ${trend.startsWith('+') ? 'text-green-600' : trend.startsWith('-') ? 'text-red-500' : 'text-gray-400'}`}>
            {trend}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export function SectionCard({ title, children, action, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`glass-card p-5 ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="section-title">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </motion.div>
  );
}

export function StatusDot({ status }) {
  const map = { healthy: 'bg-green-500', low: 'bg-amber-500', critical: 'bg-red-500', expired: 'bg-gray-400' };
  return <span className={`inline-block w-2 h-2 rounded-full ${map[status] || 'bg-gray-400'} mr-2`} />;
}

export function PriorityBadge({ priority }) {
  const map = { critical: 'critical', high: 'high', medium: 'medium', low: 'gray' };
  const labels = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' };
  return <Badge variant={map[priority]}>{labels[priority]}</Badge>;
}
