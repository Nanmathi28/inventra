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
      .then(data => {
        console.log("Medicines received:", data.length);
        console.log(data);
        const sorted = [...(data || [])].sort((a, b) => a.id - b.id);
        setMedicines(sorted);
      })
      .catch(err => {
        setError(err.message || 'Could not load medicines');
      })
      .finally(() => {
        setLoading(false);
      });

  }, []);
  useEffect(() => {
    console.log("Medicines state length:", medicines.length);
  }, [medicines]);
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
      console.log('Adding medicine:', payload);
      await api.post('/medicines', payload);
      setShowAdd(false);
      setNewMedicine({ medicine_name: '', category: '', manufacturer: '', medicine_form: '', price: '', description: '' });
      const data = await api.get('/medicines');
      const sorted = [...(data || [])].sort((a, b) => a.id - b.id);
      setMedicines(sorted);
      setError('Medicine added successfully');
      setTimeout(() => setError(null), 2000);
    } catch (err) {
      console.error('Add medicine error:', err);
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
      console.log('Updating medicine:', editMedicine.id, payload);
      await api.put(`/medicines/${editMedicine.id}`, payload);
      setShowEdit(false);
      setEditMedicine(null);
      const data = await api.get('/medicines');
      const sorted = [...(data || [])].sort((a, b) => a.id - b.id);
      setMedicines(sorted);
      setError('Medicine updated successfully');
      setTimeout(() => setError(null), 2000);
    } catch (err) {
      console.error('Edit medicine error:', err);
      setError(err.message || 'Failed to update medicine');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteMedicine = async (id) => {
    if (!confirm('Are you sure you want to delete this medicine? This will also delete associated inventory records.')) return;
    try {
      console.log('Deleting medicine:', id);
      await api.delete(`/medicines/${id}`);
      const data = await api.get('/medicines');
      const sorted = [...(data || [])].sort((a, b) => a.id - b.id);
      setMedicines(sorted);
      setError('Medicine deleted successfully');
      setTimeout(() => setError(null), 2000);
    } catch (err) {
      console.error('Delete medicine error:', err);
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
          {error && <p className={`text-xs mt-1 ${error.includes('success') ? 'text-green-500' : 'text-red-500'}`}>{error}</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAdd(true)} className="btn-primary px-4 py-2"><Plus size={14} className="mr-1" />Add Medicine</button>
        </div>
      </div>

      <SectionCard>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search medicines or ID..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} className="input-field sm:w-48 py-2.5">
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
                <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
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
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {paged.map(m => (
                    <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="table-td text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-50/50 dark:bg-gray-800/30">{m.id}</td>
                      <td className="table-td font-semibold text-gray-900 dark:text-white">{m.medicine_name}</td>
                      <td className="table-td text-gray-600 dark:text-gray-300">{m.category}</td>
                      <td className="table-td text-gray-600 dark:text-gray-300">{m.manufacturer}</td>
                      <td className="table-td text-gray-600 dark:text-gray-300">{m.medicine_form || '—'}</td>
                      <td className="table-td text-gray-600 dark:text-gray-300 font-medium">{m.price ? `₹${m.price.toFixed(2)}` : '—'}</td>
                      <td className="table-td text-gray-600 dark:text-gray-300 max-w-xs truncate">{m.description || '—'}</td>
                      <td className="table-td">
                        <div className="flex gap-2">
                          <button onClick={() => openEditModal(m)} className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors" title="Edit">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDeleteMedicine(m.id)} className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length} medicines</p>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setPage(n)} className={`w-8 h-8 text-xs rounded-lg font-medium transition-colors ${page === n ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{n}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </SectionCard>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Add New Medicine</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Medicine Name *</label>
                <input type="text" value={newMedicine.medicine_name} onChange={e => setNewMedicine(p => ({ ...p, medicine_name: e.target.value }))} className="input-field" placeholder="Enter medicine name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category *</label>
                <input type="text" value={newMedicine.category} onChange={e => setNewMedicine(p => ({ ...p, category: e.target.value }))} className="input-field" placeholder="e.g., Antibiotics, Pain Relief" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Manufacturer *</label>
                <input type="text" value={newMedicine.manufacturer} onChange={e => setNewMedicine(p => ({ ...p, manufacturer: e.target.value }))} className="input-field" placeholder="Enter manufacturer name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Medicine Form</label>
                <input type="text" value={newMedicine.medicine_form} onChange={e => setNewMedicine(p => ({ ...p, medicine_form: e.target.value }))} className="input-field" placeholder="e.g., Tablet, Syrup, Injection" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Price (₹)</label>
                <input type="number" step="0.01" value={newMedicine.price} onChange={e => setNewMedicine(p => ({ ...p, price: e.target.value }))} className="input-field" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                <textarea rows={3} value={newMedicine.description} onChange={e => setNewMedicine(p => ({ ...p, description: e.target.value }))} className="input-field resize-none" placeholder="Optional description..." />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1 justify-center py-2.5">Cancel</button>
              <button onClick={handleAddMedicine} disabled={addLoading} className="btn-primary flex-1 justify-center py-2.5 disabled:opacity-50 disabled:cursor-not-allowed">{addLoading ? 'Saving...' : 'Save Medicine'}</button>
            </div>
          </motion.div>
        </div>
      )}

      {showEdit && editMedicine && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Edit Medicine</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Medicine Name *</label>
                <input type="text" value={editMedicine.medicine_name} onChange={e => setEditMedicine(p => ({ ...p, medicine_name: e.target.value }))} className="input-field" placeholder="Enter medicine name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category *</label>
                <input type="text" value={editMedicine.category} onChange={e => setEditMedicine(p => ({ ...p, category: e.target.value }))} className="input-field" placeholder="e.g., Antibiotics, Pain Relief" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Manufacturer *</label>
                <input type="text" value={editMedicine.manufacturer} onChange={e => setEditMedicine(p => ({ ...p, manufacturer: e.target.value }))} className="input-field" placeholder="Enter manufacturer name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Medicine Form</label>
                <input type="text" value={editMedicine.medicine_form} onChange={e => setEditMedicine(p => ({ ...p, medicine_form: e.target.value }))} className="input-field" placeholder="e.g., Tablet, Syrup, Injection" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Price (₹)</label>
                <input type="number" step="0.01" value={editMedicine.price} onChange={e => setEditMedicine(p => ({ ...p, price: e.target.value }))} className="input-field" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                <textarea rows={3} value={editMedicine.description} onChange={e => setEditMedicine(p => ({ ...p, description: e.target.value }))} className="input-field resize-none" placeholder="Optional description..." />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowEdit(false)} className="btn-secondary flex-1 justify-center py-2.5">Cancel</button>
              <button onClick={handleEditMedicine} disabled={editLoading} className="btn-primary flex-1 justify-center py-2.5 disabled:opacity-50 disabled:cursor-not-allowed">{editLoading ? 'Updating...' : 'Update Medicine'}</button>
            </div>

          </motion.div>
        </div>

      )}
    </div>
  );
}
