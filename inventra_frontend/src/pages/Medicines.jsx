import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { SectionCard, Badge } from '../components/ui';
import { api } from '../services/api';

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editMedicine, setEditMedicine] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const perPage = 8;
  const [newMedicine, setNewMedicine] = useState({ 
    medicine_name: '', 
    category: '', 
    manufacturer: '', 
    medicine_form: '', 
    price: '', 
    description: '' 
  });
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get('/medicines')
      .then(data => setMedicines(data || []))
      .catch(err => setError(err.message || 'Could not load medicines'))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...new Set(medicines.map(m => m.category))];

  const filtered = medicines.filter(m => {
    const matchSearch = m.medicine_name.toLowerCase().includes(search.toLowerCase()) || m.id.toString().includes(search);
    const matchCat = category === 'All' || m.category === category;
    return matchSearch && matchCat;
  });

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const handleAddMedicine = async () => {
    if (!newMedicine.medicine_name || newMedicine.medicine_name.trim() === '') {
      setError('Medicine name is required');
      return;
    }
    if (!newMedicine.category || newMedicine.category.trim() === '') {
      setError('Category is required');
      return;
    }
    if (!newMedicine.manufacturer || newMedicine.manufacturer.trim() === '') {
      setError('Manufacturer is required');
      return;
    }

    setAddLoading(true);
    setError(null);
    try {
      const payload = {
        medicine_name: newMedicine.medicine_name,
        category: newMedicine.category,
        manufacturer: newMedicine.manufacturer,
        medicine_form: newMedicine.medicine_form || null,
        price: newMedicine.price ? parseFloat(newMedicine.price) : null,
        description: newMedicine.description || null
      };
      await api.post('/medicines', payload);
      setShowAdd(false);
      setNewMedicine({ medicine_name: '', category: '', manufacturer: '', medicine_form: '', price: '', description: '' });
      const data = await api.get('/medicines');
      setMedicines(data || []);
    } catch (err) {
      setError(err.message || 'Failed to add medicine');
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditMedicine = async () => {
    if (!editMedicine.medicine_name || editMedicine.medicine_name.trim() === '') {
      setError('Medicine name is required');
      return;
    }
    if (!editMedicine.category || editMedicine.category.trim() === '') {
      setError('Category is required');
      return;
    }
    if (!editMedicine.manufacturer || editMedicine.manufacturer.trim() === '') {
      setError('Manufacturer is required');
      return;
    }

    setEditLoading(true);
    setError(null);
    try {
      const payload = {
        medicine_name: editMedicine.medicine_name,
        category: editMedicine.category,
        manufacturer: editMedicine.manufacturer,
        medicine_form: editMedicine.medicine_form || null,
        price: editMedicine.price ? parseFloat(editMedicine.price) : null,
        description: editMedicine.description || null
      };
      await api.put(`/medicines/${editMedicine.id}`, payload);
      setShowEdit(false);
      setEditMedicine(null);
      const data = await api.get('/medicines');
      setMedicines(data || []);
    } catch (err) {
      setError(err.message || 'Failed to update medicine');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteMedicine = async (id) => {
    if (!confirm('Are you sure you want to delete this medicine? This will also delete associated inventory records.')) return;
    try {
      await api.delete(`/medicines/${id}`);
      setMedicines(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete medicine');
    }
  };

  const openEditModal = (medicine) => {
    setEditMedicine({
      id: medicine.id,
      medicine_name: medicine.medicine_name,
      category: medicine.category,
      manufacturer: medicine.manufacturer,
      medicine_form: medicine.medicine_form || '',
      price: medicine.price || '',
      description: medicine.description || ''
    });
    setShowEdit(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Medicines Catalog</h1>
          <p className="text-sm text-gray-500 mt-0.5">{loading ? 'Loading medicines…' : `${medicines.length} medicines registered`}</p>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAdd(true)} className="btn-primary"><Plus size={14} />Add Medicine</button>
        </div>
      </div>

      <SectionCard>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search medicines or ID…"
              className="input-field pl-8"
            />
          </div>
          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} className="input-field sm:w-44">
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading medicines from backend…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="text-lg font-medium">No Medicines Found</p>
            <p className="text-sm mt-1">Add your first medicine to get started</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto -mx-5">
              <table className="w-full min-w-[700px]">
                <thead className="border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="table-th">ID</th>
                    <th className="table-th">Medicine Name</th>
                    <th className="table-th">Category</th>
                    <th className="table-th">Manufacturer</th>
                    <th className="table-th">Form</th>
                    <th className="table-th">Price</th>
                    <th className="table-th">Description</th>
                    <th className="table-th">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/40">
                  {paged.map(m => (
                    <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50/70 dark:hover:bg-gray-700/20 transition-colors">
                      <td className="table-td text-xs text-gray-400 font-mono">{m.id}</td>
                      <td className="table-td font-semibold text-gray-800 dark:text-gray-100">{m.medicine_name}</td>
                      <td className="table-td text-gray-500 dark:text-gray-400">{m.category}</td>
                      <td className="table-td text-gray-500 dark:text-gray-400">{m.manufacturer}</td>
                      <td className="table-td text-gray-500 dark:text-gray-400">{m.medicine_form || '—'}</td>
                      <td className="table-td text-gray-500 dark:text-gray-400">{m.price ? `₹${m.price.toFixed(2)}` : '—'}</td>
                      <td className="table-td text-gray-500 dark:text-gray-400 max-w-xs truncate">{m.description || '—'}</td>
                      <td className="table-td">
                        <div className="flex gap-1.5">
                          <button onClick={() => openEditModal(m)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => handleDeleteMedicine(m.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-400">Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}</p>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30">
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setPage(n)} className={`w-7 h-7 text-xs rounded-lg font-medium transition-colors ${page === n ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{n}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30">
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </>
        )}
      </SectionCard>

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-6 w-full max-w-lg">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-5">Add Medicine</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Medicine Name</label>
                <input type="text" value={newMedicine.medicine_name} onChange={e => setNewMedicine(p => ({ ...p, medicine_name: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Category</label>
                <input type="text" value={newMedicine.category} onChange={e => setNewMedicine(p => ({ ...p, category: e.target.value }))} className="input-field" placeholder="e.g., Antibiotics, Pain Relief" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Manufacturer</label>
                <input type="text" value={newMedicine.manufacturer} onChange={e => setNewMedicine(p => ({ ...p, manufacturer: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Medicine Form</label>
                <input type="text" value={newMedicine.medicine_form} onChange={e => setNewMedicine(p => ({ ...p, medicine_form: e.target.value }))} className="input-field" placeholder="e.g., Tablet, Syrup, Injection" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Price (₹)</label>
                <input type="number" step="0.01" value={newMedicine.price} onChange={e => setNewMedicine(p => ({ ...p, price: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</label>
                <textarea rows={2} value={newMedicine.description} onChange={e => setNewMedicine(p => ({ ...p, description: e.target.value }))} className="input-field resize-none" placeholder="Optional description..." />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handleAddMedicine} disabled={addLoading} className="btn-primary flex-1 justify-center disabled:opacity-50">{addLoading ? 'Saving...' : 'Save'}</button>
            </div>
          </motion.div>
        </div>
      )}

      {showEdit && editMedicine && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-6 w-full max-w-lg">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-5">Edit Medicine</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Medicine Name</label>
                <input type="text" value={editMedicine.medicine_name} onChange={e => setEditMedicine(p => ({ ...p, medicine_name: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Category</label>
                <input type="text" value={editMedicine.category} onChange={e => setEditMedicine(p => ({ ...p, category: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Manufacturer</label>
                <input type="text" value={editMedicine.manufacturer} onChange={e => setEditMedicine(p => ({ ...p, manufacturer: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Medicine Form</label>
                <input type="text" value={editMedicine.medicine_form} onChange={e => setEditMedicine(p => ({ ...p, medicine_form: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Price (₹)</label>
                <input type="number" step="0.01" value={editMedicine.price} onChange={e => setEditMedicine(p => ({ ...p, price: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</label>
                <textarea rows={2} value={editMedicine.description} onChange={e => setEditMedicine(p => ({ ...p, description: e.target.value }))} className="input-field resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowEdit(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handleEditMedicine} disabled={editLoading} className="btn-primary flex-1 justify-center disabled:opacity-50">{editLoading ? 'Updating...' : 'Update Medicine'}</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
