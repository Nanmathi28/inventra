// Smart Restocking page
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SectionCard, KPICard, Badge, PriorityBadge } from '../components/ui';
import { api } from '../services/api';

export function Restock() {
  const [restockData, setRestockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/restocking/recommendations')
      .then(data => setRestockData(data))
      .catch(err => setError(err.message || 'Could not load restocking data'))
      .finally(() => setLoading(false));
  }, []);

  const restockItems = restockData?.recommendations || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500 dark:text-gray-400">Loading restocking recommendations...</div>
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
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Smart Restocking</h1>
        <p className="text-sm text-gray-500 mt-0.5">AI-powered reorder recommendations</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard label="Critical Reorders" value={restockData?.critical_count || 0} sub="Immediate action" color="red" delay={0} />
        <KPICard label="High Priority" value={restockData?.high_priority_count || 0} sub="Reorder this week" color="amber" delay={0.05} />
        <KPICard label="Est. Reorder Cost" value={`₹${(restockData?.total_estimated_cost || 0).toLocaleString()}`} sub={`${restockItems.length} medicines`} color="blue" delay={0.1} />
        <KPICard label="Total Recommendations" value={restockItems.length} sub="AI-generated" color="green" delay={0.15} />
      </div>

      <SectionCard title="AI Reorder Recommendations">
        {restockItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No restocking recommendations at this time. All medicines are adequately stocked.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full min-w-[650px]">
              <thead className="border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="table-th">Medicine</th>
                  <th className="table-th">Current Stock</th>
                  <th className="table-th">Predicted Demand</th>
                  <th className="table-th">Suggested Order</th>
                  <th className="table-th">Supplier</th>
                  <th className="table-th">Priority</th>
                  <th className="table-th">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/40">
                {restockItems.map((r, i) => (
                  <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="hover:bg-gray-50/70 dark:hover:bg-gray-700/20">
                    <td className="table-td font-semibold text-gray-800 dark:text-gray-100">{r.medicine_name}</td>
                    <td className="table-td">
                      <span className={r.current_stock <= 20 ? 'text-red-600 font-bold' : r.current_stock <= 80 ? 'text-amber-600 font-semibold' : 'text-gray-600 dark:text-gray-400'}>{r.current_stock}</span>
                    </td>
                    <td className="table-td text-gray-500 dark:text-gray-400">{r.predicted_demand}/mo</td>
                    <td className="table-td font-semibold text-blue-600 dark:text-blue-400">{r.recommended_reorder_qty} units</td>
                    <td className="table-td text-gray-500 dark:text-gray-400">{r.supplier_name}</td>
                    <td className="table-td"><Badge variant={r.priority_level === 'critical' ? 'red' : r.priority_level === 'high' ? 'amber' : 'green'}>{r.priority_level}</Badge></td>
                    <td className="table-td">
                      <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Place Order</button>
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
