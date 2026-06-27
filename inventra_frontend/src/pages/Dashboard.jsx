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
  const [analytics, setAnalytics] = useState(null);
  const [restock, setRestock] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const lossByCategory = analytics?.loss_by_category || [];
  useEffect(() => {
    const fetchDashboardData = () => {
      Promise.all([
        api.get('/dashboard/summary'),
        api.get('/analytics'),
        api.get('/restocking/recommendations'),
        api.get('/alerts'),
        api.get("/orders/admin")
      ])
        .then(([summaryData, analyticsData, restockData, alertsData, ordersData]) => {
          setSummary(summaryData);
          setAnalytics(analyticsData);
          setRestock(restockData);
          setAlerts(alertsData.slice(0, 5));
          setOrders(ordersData.orders || []);
        })
        .catch(err => {
          console.error('Dashboard error:', err);
          setError(err.message || 'Could not load dashboard data');
        })
        .finally(() => setLoading(false));
    };
    fetchDashboardData();

    // Auto-refresh dashboard every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);

    return () => clearInterval(interval);
  }, []);

  const pendingOrders = orders.filter(
    order => order.status === "pending"
  );

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const kpis = [
    { icon: <Pill size={20} />, label: 'Total Medicines', value: summary ? summary.total_medicines.toString() : '0', sub: 'Total registered', trend: '', color: 'blue', delay: 0 },
    { icon: <DollarSign size={20} />, label: 'Inventory Items', value: summary ? summary.total_inventory_items.toString() : '0', sub: 'Active inventory rows', trend: '', color: 'green', delay: 0.05 },
    { icon: <TrendingUp size={20} />, label: 'Low Stock Items', value: summary ? summary.low_stock_items.toString() : '0', sub: 'Reorder soon', trend: '', color: 'amber', delay: 0.1 },
    { icon: <AlertCircle size={20} />, label: 'Critical Medicines', value: summary ? summary.critical_stock_items.toString() : '0', sub: 'Immediate action', trend: '', color: 'red', delay: 0.15 },
    { icon: <Calendar size={20} />, label: 'Near Expiry', value: summary ? summary.near_expiry_items.toString() : '0', sub: 'Within 30 days', trend: '', color: 'amber', delay: 0.2 },
    { icon: <Boxes size={20} />, label: 'Suppliers', value: summary ? summary.total_suppliers.toString() : '0', sub: 'Active suppliers', color: 'purple', delay: 0.25 },
  ];

  const alertColors = { critical: 'red', low: 'amber', expiry: 'amber', forecast: 'blue', restock: 'green' };

  // Use analytics data or empty arrays
  const salesData = analytics?.monthly_trends?.map(t => ({
    month: t.month,
    sales: t.value > 0 ? t.value : null,
    forecast: null
  })) || [];
  const inventoryHealth = analytics?.stock_status_distribution || [];
  const categoryDemand = analytics?.category_distribution || [];
  const expiryData = analytics?.expiry_risk_distribution || [];

  const restockItems = restock?.recommendations?.slice(0, 5).map(r => ({
    medicine: r.medicine_name,
    stock: r.current_stock,
    suggested: r.recommended_reorder_qty,
    priority: r.priority_level === 'critical' ? 'red' : r.priority_level === 'high' ? 'amber' : 'green'
  })) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500 dark:text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-500 dark:text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map((k, i) => (
          <KPICard key={i} icon={k.icon} label={k.label} value={k.value} sub={k.sub} trend={k.trend} color={k.color} delay={k.delay} />
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sales + Forecast */}
        <SectionCard title="Sales Value Trend & Forecast">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={salesData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} />
              <YAxis tickFormatter={v => `₹${v / 1000}K`} tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <Tooltip formatter={v => v ? `₹${(v / 1000).toFixed(0)}K` : '—'} />
              <Area type="monotone" dataKey="forecast" stroke="#8b5cf6" strokeWidth={2} fill="url(#gArea)" name="Forecast" connectNulls dot={{ r: 3, fill: '#8b5cf6' }} />
              <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} name="Sales" connectNulls={false} />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Inventory Health Donut */}
        <SectionCard title="Inventory Health">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={inventoryHealth} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={2} dataKey="value">
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
        <SectionCard title="Potential Loss by Category">
          {lossByCategory.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No expiry data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={lossByCategory}
                margin={{ top: 10, right: 20, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="category"
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 11 }}
                />

                <YAxis
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />

                <Tooltip
                  formatter={(value) => [
                    `₹${Number(value).toLocaleString()}`,
                    "Potential Loss"
                  ]}
                />

                <Bar dataKey="loss" radius={[4, 4, 0, 0]}>
                  {lossByCategory.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={[
                        "#3b82f6",
                        "#10b981",
                        "#f59e0b",
                        "#8b5cf6",
                        "#ef4444",
                        "#06b6d4",
                        "#84cc16",
                        "#ec4899"
                      ][index % 8]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
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
        <SectionCard title="Pending Patient Requests">

          <div className="space-y-2">

            {pendingOrders.length === 0 ? (

              <p className="text-sm text-gray-400 text-center py-6">
                No pending patient requests.
              </p>

            ) : (

              pendingOrders.map(order => (

                <div
                  key={order.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >

                  <div>
                    <p className="text-sm font-medium">
                      {order.order_number}
                    </p>

                    <p className="text-xs text-gray-500">
                      {order.user_name}
                    </p>

                  </div>

                  <Badge variant="amber">
                    Pending
                  </Badge>

                </div>

              ))

            )}

          </div>

        </SectionCard>

        {/* Restock suggestions */}
        <SectionCard title="Recent Orders">

          <div className="space-y-2">

            {recentOrders.map(order => (

              <div
                key={order.id}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >

                <div>

                  <p className="text-sm font-medium">
                    {order.order_number}
                  </p>

                  <p className="text-xs text-gray-500">
                    {order.user_name}
                  </p>

                </div>

                <Badge
                  variant={
                    order.status === "confirmed"
                      ? "green"
                      : order.status === "cancelled"
                        ? "red"
                        : "amber"
                  }
                >
                  {order.status}
                </Badge>

              </div>

            ))}

          </div>

        </SectionCard>
      </div>
    </div>
  );
}
