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
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ supplier_name: '', contact_person: '', phone: '', email: '', address: '', reliability_score: 80 });
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get('/suppliers')
      .then(data => setSuppliers(data || []))
      .catch(err => setError(err.message || 'Could not load suppliers'))
      .finally(() => setLoading(false));
  }, []);

  const perfData = useMemo(
    () => suppliers.map((s) => ({
      name: s.supplier_name,
      reliability: s.reliability_score ?? 80
    })),
    [suppliers]
  );

  const totalSuppliers = suppliers.length;
  const avgReliability = totalSuppliers
    ? `${Math.round(perfData.reduce((sum, item) => sum + item.reliability, 0) / totalSuppliers)}%`
    : '—';

  const handleAddSupplier = async () => {
    // Client-side validation
    if (!newSupplier.supplier_name || newSupplier.supplier_name.trim() === '') {
      setError('Supplier name is required');
      return;
    }
    if (!newSupplier.contact_person || newSupplier.contact_person.trim() === '') {
      setError('Contact person is required');
      return;
    }
    if (!newSupplier.phone || newSupplier.phone.trim() === '') {
      setError('Phone number is required');
      return;
    }
    if (!newSupplier.email || newSupplier.email.trim() === '') {
      setError('Email is required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newSupplier.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (newSupplier.reliability_score === undefined || newSupplier.reliability_score === null || Number.isNaN(newSupplier.reliability_score)) {
      setError('Reliability score is required');
      return;
    }
    if (newSupplier.reliability_score < 0 || newSupplier.reliability_score > 100) {
      setError('Reliability score must be between 0 and 100');
      return;
    }

    setAddLoading(true);
    setError(null);
    try {
      await api.post('/suppliers', newSupplier);
      setShowAdd(false);
      setNewSupplier({ supplier_name: '', contact_person: '', phone: '', email: '', address: '', reliability_score: 80 });
      // Refresh data
      const data = await api.get('/suppliers');
      setSuppliers(data || []);
    } catch (err) {
      setError(err.message || 'Failed to add supplier');
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditSupplier = async () => {
    // Client-side validation
    if (!editSupplier.supplier_name || editSupplier.supplier_name.trim() === '') {
      setError('Supplier name is required');
      return;
    }
    if (!editSupplier.contact_person || editSupplier.contact_person.trim() === '') {
      setError('Contact person is required');
      return;
    }
    if (!editSupplier.phone || editSupplier.phone.trim() === '') {
      setError('Phone number is required');
      return;
    }
    if (!editSupplier.email || editSupplier.email.trim() === '') {
      setError('Email is required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editSupplier.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (editSupplier.reliability_score === undefined || editSupplier.reliability_score === null || Number.isNaN(editSupplier.reliability_score)) {
      setError('Reliability score is required');
      return;
    }
    if (editSupplier.reliability_score < 0 || editSupplier.reliability_score > 100) {
      setError('Reliability score must be between 0 and 100');
      return;
    }

    setEditLoading(true);
    setError(null);
    try {
      await api.put(`/suppliers/${editSupplier.id}`, editSupplier);
      setShowEdit(false);
      setEditSupplier(null);
      // Refresh data
      const data = await api.get('/suppliers');
      setSuppliers(data || []);
    } catch (err) {
      setError(err.message || 'Failed to update supplier');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteSupplier = async (id) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    try {
      await api.delete(`/suppliers/${id}`);
      setSuppliers(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete supplier');
    }
  };

  const openEditModal = (supplier) => {
    setEditSupplier({
      id: supplier.id,
      supplier_name: supplier.supplier_name,
      contact_person: supplier.contact_person,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address || '',
      reliability_score: supplier.reliability_score ?? 80
    });
    setShowEdit(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Supplier Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{totalSuppliers} active suppliers</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary"><Plus size={14} />Add Supplier</button>
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
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEditModal(s)} className="text-xs text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDeleteSupplier(s.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <SectionCard title="Reliability Comparison">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={perfData} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} />
              <Tooltip formatter={v => `${v}%`} />
              <Bar dataKey="reliability" fill="#4ade80" radius={[0, 4, 4, 0]} name="Reliability" />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-6 w-full max-w-lg">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-5">Add Supplier</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Supplier Name</label>
                <input type="text" value={newSupplier.supplier_name} onChange={e => setNewSupplier(p => ({ ...p, supplier_name: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Contact Person</label>
                <input type="text" value={newSupplier.contact_person} onChange={e => setNewSupplier(p => ({ ...p, contact_person: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
                <input type="email" value={newSupplier.email} onChange={e => setNewSupplier(p => ({ ...p, email: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Phone</label>
                <input type="text" value={newSupplier.phone} onChange={e => setNewSupplier(p => ({ ...p, phone: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Address</label>
                <input type="text" value={newSupplier.address} onChange={e => setNewSupplier(p => ({ ...p, address: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Reliability Score</label>
                <input type="number" min="0" max="100" value={newSupplier.reliability_score} onChange={e => setNewSupplier(p => ({ ...p, reliability_score: Number(e.target.value) }))} className="input-field" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handleAddSupplier} disabled={addLoading} className="btn-primary flex-1 justify-center disabled:opacity-50">{addLoading ? 'Saving...' : 'Save'}</button>
            </div>
          </motion.div>
        </div>
      )}

      {showEdit && editSupplier && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-6 w-full max-w-lg">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-5">Edit Supplier</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Supplier Name</label>
                <input type="text" value={editSupplier.supplier_name} onChange={e => setEditSupplier(p => ({ ...p, supplier_name: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Contact Person</label>
                <input type="text" value={editSupplier.contact_person} onChange={e => setEditSupplier(p => ({ ...p, contact_person: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Phone</label>
                <input type="text" value={editSupplier.phone} onChange={e => setEditSupplier(p => ({ ...p, phone: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
                <input type="email" value={editSupplier.email} onChange={e => setEditSupplier(p => ({ ...p, email: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Address</label>
                <input type="text" value={editSupplier.address} onChange={e => setEditSupplier(p => ({ ...p, address: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Reliability Score</label>
                <input type="number" min="0" max="100" value={editSupplier.reliability_score} onChange={e => setEditSupplier(p => ({ ...p, reliability_score: Number(e.target.value) }))} className="input-field" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowEdit(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handleEditSupplier} disabled={editLoading} className="btn-primary flex-1 justify-center disabled:opacity-50">{editLoading ? 'Updating...' : 'Update Supplier'}</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
