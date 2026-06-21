import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { AlertCircle, AlertTriangle, Skull, DollarSign, Calendar } from 'lucide-react';
import { SectionCard, KPICard, Badge } from '../components/ui';
import { expiryItems, expiryData } from '../data/dummy';

const monthlyExpiry = [
  { month: 'Jun', count: 9, loss: 18400 },
  { month: 'Jul', count: 14, loss: 22000 },
  { month: 'Aug', count: 6, loss: 8900 },
  { month: 'Sep', count: 3, loss: 4200 },
];

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#22c55e'];

export default function Expiry() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Expiry Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">Reduce wastage and protect inventory value</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard icon={<AlertCircle size={20} />} label="Expiring in 30 days" value="9" sub="High risk" color="red" delay={0} />
        <KPICard icon={<AlertTriangle size={20} />} label="Expiring in 60 days" value="14" sub="Medium risk" color="amber" delay={0.05} />
        <KPICard icon={<Skull size={20} />} label="Expired Medicines" value="6" sub="Dispose immediately" color="red" delay={0.1} />
        <KPICard icon={<DollarSign size={20} />} label="Potential Loss" value="₹38,400" sub="Next 90 days" color="amber" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Expiry Risk Distribution">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={expiryData} cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={2} dataKey="count">
                {expiryData.map((e, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v, _, props) => [v + ' medicines', props.payload.range]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 text-xs">
            {expiryData.map((e, i) => (
              <span key={i} className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                {e.range} ({e.count})
              </span>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Monthly Expiry Analysis">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyExpiry} margin={{ top: 0, right: 5, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v, n) => n === 'loss' ? `₹${v.toLocaleString()}` : v + ' medicines'} />
              <Bar dataKey="count" fill="#f87171" radius={[4, 4, 0, 0]} name="count" />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <SectionCard title="Near-Expiry Medicines">
        <div className="overflow-x-auto -mx-5">
          <table className="w-full min-w-[550px]">
            <thead className="border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="table-th">Medicine</th>
                <th className="table-th">Batch Number</th>
                <th className="table-th">Expiry Date</th>
                <th className="table-th">Days Left</th>
                <th className="table-th">Stock</th>
                <th className="table-th">Risk Level</th>
                <th className="table-th">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/40">
              {expiryItems.map((e, i) => (
                <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="hover:bg-gray-50/70 dark:hover:bg-gray-700/20">
                  <td className="table-td font-semibold text-gray-800 dark:text-gray-100">{e.medicine}</td>
                  <td className="table-td text-xs font-mono text-gray-400">{e.batch}</td>
                  <td className="table-td text-gray-500 dark:text-gray-400">{e.expiry}</td>
                  <td className="table-td">
                    <span className={`font-bold text-sm ${e.daysLeft <= 21 ? 'text-red-600' : e.daysLeft <= 60 ? 'text-amber-600' : 'text-green-600'}`}>
                      {e.daysLeft}d
                    </span>
                  </td>
                  <td className="table-td text-gray-500">{e.stock} units</td>
                  <td className="table-td"><Badge variant={e.risk}>{e.risk.charAt(0).toUpperCase() + e.risk.slice(1)} Risk</Badge></td>
                  <td className="table-td">
                    <button className="text-xs text-blue-600 hover:underline font-medium">Mark for Discount</button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
