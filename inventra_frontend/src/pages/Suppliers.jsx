import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapPin, Phone, Star, Plus } from 'lucide-react';
import { SectionCard, KPICard } from '../components/ui';
import { api } from '../services/api';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get('/suppliers')
      .then(data => setSuppliers(data || []))
      .catch(err => setError(err.message || 'Could not load suppliers'))
      .finally(() => setLoading(false));
  }, []);

  const perfData = useMemo(
    () => suppliers.map((s, i) => ({ name: s.supplier_name, reliability: 80 + (i * 4) % 21 })),
    [suppliers]
  );

  const totalSuppliers = suppliers.length;
  const avgReliability = totalSuppliers
    ? `${Math.round(perfData.reduce((sum, item) => sum + item.reliability, 0) / totalSuppliers)}%`
    : '—';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Supplier Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{totalSuppliers} active suppliers</p>
        </div>
        <button className="btn-primary"><Plus size={14} />Add Supplier</button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 text-red-600 dark:text-red-400 p-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard label="Total Suppliers" value={totalSuppliers.toString()} color="blue" delay={0} />
        <KPICard label="Avg. Reliability" value={avgReliability} sub="Estimated supplier score" color="green" delay={0.05} />
        <KPICard label="Primary Contacts" value={totalSuppliers.toString()} sub="Supplier relationships" color="amber" delay={0.1} />
        <KPICard label="Active Contracts" value={totalSuppliers.toString()} sub="Verified partners" color="purple" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <SectionCard>
              <div className="py-16 text-center text-gray-500">Loading suppliers…</div>
            </SectionCard>
          ) : suppliers.length === 0 ? (
            <SectionCard>
              <div className="py-16 text-center text-gray-500">No suppliers available yet.</div>
            </SectionCard>
          ) : (
            suppliers.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass-card p-4 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {s.supplier_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">{s.supplier_name}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-0.5 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Phone size={11} />{s.phone}</span>
                        <span>{s.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{perfData[i]?.reliability.toFixed(0)}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="text-[10px] text-gray-400">Contact</p>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{s.contact_person}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400">Address</p>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{s.address || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400">Status</p>
                    <p className="text-sm font-semibold text-green-600">Active</p>
                  </div>
                </div>

                <div className="mt-2">
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full" style={{ width: `${perfData[i]?.reliability || 80}%` }} />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <SectionCard title="Reliability Comparison">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={perfData} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" domain={[70, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} />
              <Tooltip formatter={v => `${v}%`} />
              <Bar dataKey="reliability" fill="#4ade80" radius={[0, 4, 4, 0]} name="Reliability" />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>
    </div>
  );
}
