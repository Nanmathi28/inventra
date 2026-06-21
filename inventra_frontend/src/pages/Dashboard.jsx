import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Package, DollarSign, TrendingUp, Activity, AlertTriangle, Clock, ShoppingCart, Zap, Pill, Boxes, Target, AlertCircle, Calendar, RefreshCw, Brain, Lightbulb } from 'lucide-react';
import { KPICard, SectionCard, Badge } from '../components/ui';
import { api } from '../services/api';

const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#6b7280'];

function fmt(v) {
  if (!v && v !== 0) return '—';
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${v}`;
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/dashboard/summary')
      .then(data => setSummary(data))
      .catch(err => setError(err.message || 'Could not load dashboard summary'))
      .finally(() => setLoading(false));
  }, []);

  const kpis = [
    { icon: <Pill size={20} />, label: 'Total Medicines', value: summary ? summary.total_medicines.toString() : '284', sub: '+12 added this month', trend: '+4.4% vs last month', color: 'blue', delay: 0 },
    { icon: <DollarSign size={20} />, label: 'Inventory Items', value: summary ? summary.total_inventory_items.toString() : '312', sub: 'Active inventory rows', trend: '+3.2% vs last month', color: 'green', delay: 0.05 },
    { icon: <TrendingUp size={20} />, label: 'Low Stock Items', value: summary ? summary.low_stock_items.toString() : '18', sub: 'Reorder soon', trend: '5 new today', color: 'amber', delay: 0.1 },
    { icon: <AlertCircle size={20} />, label: 'Critical Medicines', value: summary ? summary.critical_stock_items.toString() : '6', sub: 'Immediate action', trend: 'Action required', color: 'red', delay: 0.15 },
    { icon: <Calendar size={20} />, label: 'Near Expiry', value: summary ? summary.near_expiry_items.toString() : '9', sub: 'Within 30 days', trend: 'Review soon', color: 'amber', delay: 0.2 },
    { icon: <Boxes size={20} />, label: 'Suppliers', value: summary ? summary.total_suppliers.toString() : '12', sub: 'Active suppliers', color: 'purple', delay: 0.25 },
  ];

  const alertColors = { critical: 'red', low: 'amber', expiry: 'amber', forecast: 'blue', restock: 'green' };

  const salesData = [
  { month: 'Jan', sales: 45000, forecast: 48000 },
  { month: 'Feb', sales: 52000, forecast: 55000 },
  { month: 'Mar', sales: 49000, forecast: 53000 },
  { month: 'Apr', sales: 61000, forecast: 64000 },
  { month: 'May', sales: 58000, forecast: 62000 },
  { month: 'Jun', sales: null, forecast: 68000 }
];

const inventoryHealth = [
  { name: 'Healthy', value: 220 },
  { name: 'Low Stock', value: 18 },
  { name: 'Critical', value: 6 },
  { name: 'Expired', value: 3 }
];

const categoryDemand = [
  { category: 'Antibiotics', demand: 420, color: '#3b82f6' },
  { category: 'Pain Relief', demand: 380, color: '#22c55e' },
  { category: 'Vitamins', demand: 310, color: '#f59e0b' },
  { category: 'Diabetes', demand: 270, color: '#ef4444' }
];

const expiryData = [
  { range: '0-30 Days', count: 9, color: '#ef4444' },
  { range: '31-60 Days', count: 12, color: '#f59e0b' },
  { range: '61-90 Days', count: 18, color: '#22c55e' }
];

const alerts = [
  {
    id: 1,
    type: 'critical',
    title: 'Critical Stock Alert',
    desc: 'Paracetamol stock below reorder level',
    time: '10 min ago',
    read: false
  },
  {
    id: 2,
    type: 'expiry',
    title: 'Expiry Warning',
    desc: 'Vitamin C batch expires in 20 days',
    time: '1 hour ago',
    read: false
  }
];

const restockItems = [
  {
    medicine: 'Paracetamol 500mg',
    stock: 12,
    suggested: 100,
    priority: 'red'
  },
  {
    medicine: 'Cetirizine',
    stock: 20,
    suggested: 80,
    priority: 'amber'
  },
  {
    medicine: 'Vitamin C',
    stock: 35,
    suggested: 60,
    priority: 'green'
  }
];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Predictive overview · June 10, 2026</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map((k, i) => (
          <KPICard key={i} icon={k.icon} label={k.label} value={k.value} sub={k.sub} trend={k.trend} color={k.color} delay={k.delay} />
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales + Forecast */}
        <SectionCard title="Sales & Demand Forecast — 2026" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={salesData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} />
              <YAxis tickFormatter={v => `₹${v / 1000}K`} tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v, n) => [fmt(v), n === 'sales' ? 'Sales' : 'Forecast']} />
              <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} fill="url(#gSales)" connectNulls={false} dot={{ r: 3, fill: '#3b82f6' }} name="sales" />
              <Area type="monotone" dataKey="forecast" stroke="#22c55e" strokeWidth={2} strokeDasharray="5 4" fill="url(#gForecast)" connectNulls dot={{ r: 3, fill: '#22c55e' }} name="forecast" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><span className="w-6 h-0.5 bg-blue-500 inline-block rounded" />Historical Sales</span>
            <span className="flex items-center gap-1.5"><span className="w-6 h-0.5 bg-green-500 inline-block rounded border-dashed" />AI Forecast</span>
          </div>
        </SectionCard>

        {/* Inventory Health Donut */}
        <SectionCard title="Inventory Health">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={inventoryHealth} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                {inventoryHealth.map((e, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">
            {inventoryHealth.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS[i] }} />
                  {item.name}
                </span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">{item.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category demand */}
        <SectionCard title="Category-wise Demand (Monthly)">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryDemand} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} width={90} />
              <Tooltip />
              <Bar dataKey="demand" radius={[0, 4, 4, 0]}>
                {categoryDemand.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Expiry Risk */}
        <SectionCard title="Expiry Risk Distribution">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={expiryData} margin={{ top: 0, right: 5, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {expiryData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
            {expiryData.map((e, i) => (
              <span key={i} className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: e.color }} />{e.range}</span>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* AI Insights */}
        <SectionCard title={<div className="flex items-center gap-2"><Brain size={18} className="text-blue-500" /> AI Insights</div>} className="lg:col-span-1">
          <div className="space-y-3">
            {[
              { icon: <TrendingUp size={16} className="text-blue-500" />, text: 'Flu medicine demand expected to increase by 25% due to monsoon season. Restock Paracetamol, Cetirizine immediately.', color: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-700/40' },
              { icon: <AlertTriangle size={16} className="text-amber-500" />, text: '3 medicines will expire within 30 days. Estimated potential loss: ₹18,400. Consider promotional discounts.', color: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-700/40' },
              { icon: <Lightbulb size={16} className="text-green-500" />, text: 'Vitamin C demand peaks in Jul–Aug historically. Pre-order 300 units from NutriPharma (lead time: 4 days).', color: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-700/40' },
              { icon: <Target size={16} className="text-purple-500" />, text: 'Forecast model achieved 94% accuracy for Paracetamol. Confidence improving with new seasonal data.', color: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-700/40' },
            ].map((ins, i) => (
              <div key={i} className={`flex gap-2.5 p-3 rounded-xl border ${ins.color} ${ins.border}`}>
                <span className="flex-shrink-0">{ins.icon}</span>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{ins.text}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Alerts */}
        <SectionCard title="Active Alerts"
          action={<Badge variant="red">{alerts.filter(a => !a.read).length} unread</Badge>}
        >
          <div className="space-y-2.5">
            {alerts.slice(0, 5).map(a => (
              <div key={a.id} className={`flex gap-3 p-3 rounded-xl ${!a.read ? 'bg-red-50/60 dark:bg-red-900/10' : 'bg-gray-50 dark:bg-gray-800/40'}`}>
                <span className={`mt-1 w-2 h-2 flex-shrink-0 rounded-full ${a.type === 'critical' ? 'bg-red-500' : a.type === 'expiry' ? 'bg-orange-500' : a.type === 'forecast' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate">{a.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-tight">{a.desc}</p>
                  <p className="text-[10px] text-gray-300 dark:text-gray-500 mt-1">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Restock suggestions */}
        <SectionCard title="Top Restock Suggestions">
          <div className="space-y-2">
            {restockItems.slice(0, 5).map((r, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700/40 last:border-0">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate">{r.medicine}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Stock: {r.stock} · Order: {r.suggested} units</p>
                </div>
                <Badge variant={r.priority}>{r.priority}</Badge>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
