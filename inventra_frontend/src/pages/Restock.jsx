// Smart Restocking page
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SectionCard, KPICard, Badge, PriorityBadge } from '../components/ui';
import { restockItems, suppliers } from '../data/dummy';

export function Restock() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Smart Restocking</h1>
        <p className="text-sm text-gray-500 mt-0.5">AI-powered reorder recommendations</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard label="Critical Reorders" value="3" sub="Immediate action" color="red" delay={0} />
        <KPICard label="High Priority" value="4" sub="Reorder this week" color="amber" delay={0.05} />
        <KPICard label="Est. Reorder Cost" value="₹2.8L" sub="22 medicines" color="blue" delay={0.1} />
        <KPICard label="Optimization Score" value="74/100" sub="Improve by restocking" color="green" delay={0.15} />
      </div>

      <SectionCard title="AI Reorder Recommendations">
        <div className="overflow-x-auto -mx-5">
          <table className="w-full min-w-[650px]">
            <thead className="border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="table-th">Medicine</th>
                <th className="table-th">Current Stock</th>
                <th className="table-th">Predicted Demand</th>
                <th className="table-th">Suggested Order</th>
                <th className="table-th">Supplier</th>
                <th className="table-th">Lead Time</th>
                <th className="table-th">Priority</th>
                <th className="table-th">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/40">
              {restockItems.map((r, i) => (
                <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="hover:bg-gray-50/70 dark:hover:bg-gray-700/20">
                  <td className="table-td font-semibold text-gray-800 dark:text-gray-100">{r.medicine}</td>
                  <td className="table-td">
                    <span className={r.stock <= 20 ? 'text-red-600 font-bold' : r.stock <= 80 ? 'text-amber-600 font-semibold' : 'text-gray-600 dark:text-gray-400'}>{r.stock}</span>
                  </td>
                  <td className="table-td text-gray-500 dark:text-gray-400">{r.predicted}/mo</td>
                  <td className="table-td font-semibold text-blue-600 dark:text-blue-400">{r.suggested} units</td>
                  <td className="table-td text-gray-500 dark:text-gray-400">{r.supplier}</td>
                  <td className="table-td text-gray-500 dark:text-gray-400">{r.leadTime}</td>
                  <td className="table-td"><PriorityBadge priority={r.priority} /></td>
                  <td className="table-td">
                    <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Place Order</button>
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
