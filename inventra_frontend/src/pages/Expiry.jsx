import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { AlertCircle, AlertTriangle, Skull, DollarSign, Calendar } from 'lucide-react';
import { SectionCard, KPICard, Badge } from '../components/ui';
import { api } from '../services/api';

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#22c55e'];

export default function Expiry() {
  const [criticalMedicines, setCriticalMedicines] = useState([]);
  const [warningMedicines, setWarningMedicines] = useState([]);
  const [safeMedicines, setSafeMedicines] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/expiry/critical'),
      api.get('/expiry/warning'),
      api.get('/expiry/safe'),
      api.get('/analytics')
    ])
      .then(([criticalData, warningData, safeData, analyticsData]) => {
        setCriticalMedicines(criticalData);
        setWarningMedicines(warningData);
        setSafeMedicines(safeData);
        setAnalytics(analyticsData);
      })
      .catch(err => setError(err.message || 'Could not load expiry data'))
      .finally(() => setLoading(false));
  }, []);

  // Calculate days to expiry
  const calculateDaysLeft = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Combine all medicines with expiry info
  const allExpiryItems = [
    ...criticalMedicines.map(m => ({ ...m, risk: 'high' })),
    ...warningMedicines.map(m => ({ ...m, risk: 'medium' })),
    ...safeMedicines.slice(0, 10).map(m => ({ ...m, risk: 'low' }))
  ].map(m => ({
    medicine: m.medicine_name,
    batch: m.batch_number,
    expiry: new Date(m.expiry_date).toLocaleDateString(),
    daysLeft: calculateDaysLeft(m.expiry_date),
    risk: m.risk,
    stock: 0 // Would need inventory data
  }));

  // Use analytics data for expiry distribution
  const expiryData = analytics?.expiry_risk_distribution || [];

  // Calculate KPIs
  const criticalCount = criticalMedicines.length;
  const warningCount = warningMedicines.length;
  const expiredCount = allExpiryItems.filter(e => e.daysLeft < 0).length;
  const potentialLoss = criticalCount * 2000; // Placeholder calculation

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500 dark:text-gray-400">Loading expiry data...</div>
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
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Expiry Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">Reduce wastage and protect inventory value</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard icon={<AlertCircle size={20} />} label="Expiring in 30 days" value={criticalCount} sub="High risk" color="red" delay={0} />
        <KPICard icon={<AlertTriangle size={20} />} label="Expiring in 90 days" value={warningCount} sub="Medium risk" color="amber" delay={0.05} />
        <KPICard icon={<Skull size={20} />} label="Expired Medicines" value={expiredCount} sub="Dispose immediately" color="red" delay={0.1} />
        <KPICard icon={<DollarSign size={20} />} label="Potential Loss" value={`₹${potentialLoss.toLocaleString()}`} sub="Next 90 days" color="amber" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Expiry Risk Distribution">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={expiryData} cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={2} dataKey="count">
                {expiryData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v, _, props) => [v + ' medicines', props.payload.range]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 text-xs">
            {expiryData.map((e, i) => (
              <span key={i} className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: e.color }} />
                {e.range} ({e.count})
              </span>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Expiry Risk by Category">
          {expiryData.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No expiry data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
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
          )}
        </SectionCard>
      </div>

      <SectionCard title="Near-Expiry Medicines">
        {allExpiryItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No medicines near expiry. All medicines are within safe expiry dates.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full min-w-[550px]">
              <thead className="border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="table-th">Medicine</th>
                  <th className="table-th">Batch Number</th>
                  <th className="table-th">Expiry Date</th>
                  <th className="table-th">Days Left</th>
                  <th className="table-th">Risk Level</th>
                  <th className="table-th">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/40">
                {allExpiryItems.slice(0, 10).map((e, i) => (
                  <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="hover:bg-gray-50/70 dark:hover:bg-gray-700/20">
                    <td className="table-td font-semibold text-gray-800 dark:text-gray-100">{e.medicine}</td>
                    <td className="table-td text-xs font-mono text-gray-400">{e.batch}</td>
                    <td className="table-td text-gray-500 dark:text-gray-400">{e.expiry}</td>
                    <td className="table-td">
                      <span className={`font-bold text-sm ${e.daysLeft <= 21 ? 'text-red-600' : e.daysLeft <= 60 ? 'text-amber-600' : 'text-green-600'}`}>
                        {e.daysLeft}d
                      </span>
                    </td>
                    <td className="table-td"><Badge variant={e.risk}>{e.risk.charAt(0).toUpperCase() + e.risk.slice(1)} Risk</Badge></td>
                    <td className="table-td">
                      <button className="text-xs text-blue-600 hover:underline font-medium">Mark for Discount</button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
