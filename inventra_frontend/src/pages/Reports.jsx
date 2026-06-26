import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Download, Printer, BarChart3, Package, Recycle, Target } from 'lucide-react';
import { SectionCard, KPICard } from '../components/ui';
import { api } from '../services/api';

export default function Reports() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lossByCategory = analytics?.loss_by_category || [];

  useEffect(() => {
    api.get('/analytics')
      .then(data => setAnalytics(data))
      .catch(err => setError(err.message || 'Could not load analytics data'))
      .finally(() => setLoading(false));
  }, []);

  // Use analytics data
  const salesData = analytics?.monthly_trends?.map(t => ({
    month: t.month,
    sales: t.value > 0 ? t.value : null
  })) || [];

  const categoryDemand = analytics?.category_distribution || [];
  const inventoryHealth = analytics?.stock_status_distribution || [];
  const supplierPerf = analytics?.supplier_performance || [];

  // Calculate KPIs
  const totalSales = salesData.reduce((sum, s) => sum + (s.sales || 0), 0);
  const totalMedicines = categoryDemand.reduce((sum, c) => sum + c.count, 0);
  const criticalStock = inventoryHealth.find(i => i.name.toLowerCase().includes('critical'))?.value || 0;

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500 dark:text-gray-400">Loading analytics data...</div>
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Comprehensive inventory intelligence</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="btn-secondary"><Printer size={14} />Print</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard icon={<BarChart3 size={20} />} label="Total Sales" value={`₹${totalSales.toLocaleString()}`} sub="Year to date" color="blue" delay={0} />
        <KPICard icon={<Package size={20} />} label="Total Medicines" value={totalMedicines} sub="Registered" color="green" delay={0.05} />
        <KPICard icon={<Recycle size={20} />} label="Critical Stock" value={criticalStock} sub="Needs attention" color="amber" delay={0.1} />
        <KPICard icon={<Target size={20} />} label="Active Suppliers" value={supplierPerf.length} sub="Registered" color="purple" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Sales Trend">
          {salesData.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No sales data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={salesData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="gSalesRep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} />
                <YAxis tickFormatter={v => `₹${v / 1000}K`} tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                <Tooltip formatter={v => v ? `₹${(v / 1000).toFixed(0)}K` : '—'} />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} fill="url(#gSalesRep)" name="Sales" connectNulls />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

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
        <SectionCard title="Inventory Health Distribution">
          {inventoryHealth.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No inventory data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={inventoryHealth} margin={{ top: 0, right: 5, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {inventoryHealth.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard title="Supplier Performance">
          {supplierPerf.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No supplier data available.
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {supplierPerf.map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{s.supplier_name}</span>
                    <span className="text-gray-400">{s.reliability.toFixed(1)}% reliability</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all" style={{ width: `${s.reliability}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}