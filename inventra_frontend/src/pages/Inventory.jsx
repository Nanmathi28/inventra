import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Download, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { SectionCard, Badge } from '../components/ui';
import { api } from '../services/api';

const statusLabel = { GREEN: 'Healthy', YELLOW: 'Low Stock', RED: 'Critical' };
const statusVariant = { GREEN: 'healthy', YELLOW: 'low', RED: 'critical' };

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editInventory, setEditInventory] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const perPage = 8;
  const [newInventory, setNewInventory] = useState({ medicine_id: '', current_stock: '', reorder_level: '', safety_stock: '', batch_number: '', expiry_date: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [medicineSearch, setMedicineSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.get('/inventory'), api.get('/medicines')])
      .then(([inventoryData = [], medicinesData = []]) => {
        setInventory(inventoryData);
        setMedicines(medicinesData);
      })
      .catch(err => setError(err.message || 'Could not load inventory'))
      .finally(() => setLoading(false));
  }, []);
  const filteredMedicines = medicines.filter(m =>
    m.medicine_name.toLowerCase().includes(medicineSearch.toLowerCase())
  );
  const items = useMemo(
    () => inventory.map(item => {
      const medicine = medicines.find(m => m.id === item.medicine_id);
      return {
        ...item,
        medicine_name: medicine?.medicine_name || `Medicine #${item.medicine_id}`,
        category: medicine?.category || 'Unknown',
        batch: item.batch_number || 'N/A',
        expiry: item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'N/A',
      };
    }),
    [inventory, medicines]
  );

  const categories = ['All', ...new Set(items.map(m => m.category))];
  const statuses = ['All', 'GREEN', 'YELLOW', 'RED'];

  const filtered = items.filter(m => {
    const matchSearch = m.medicine_name.toLowerCase().includes(search.toLowerCase()) || m.id.toString().includes(search);
    const matchCat = category === 'All' || m.category === category;
    const matchStatus = status === 'All' || m.stock_status === status;
    return matchSearch && matchCat && matchStatus;
  });

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const lowCriticalCount = items.filter(m => m.stock_status !== 'GREEN').length;

  const handleAddInventory = async () => {
    // Client-side validation
    if (!newInventory.medicine_id) {
      setError('Please select a medicine');
      return;
    }
    if (!newInventory.current_stock || newInventory.current_stock < 0) {
      setError('Current stock must be a positive number');
      return;
    }
    if (!newInventory.reorder_level || newInventory.reorder_level < 0) {
      setError('Reorder level must be a positive number');
      return;
    }
    if (!newInventory.safety_stock || newInventory.safety_stock < 0) {
      setError('Safety stock must be a positive number');
      return;
    }

    setAddLoading(true);
    setError(null);
    try {
      const payload = {
        medicine_id: parseInt(newInventory.medicine_id),
        current_stock: parseInt(newInventory.current_stock),
        reorder_level: parseInt(newInventory.reorder_level),
        safety_stock: parseInt(newInventory.safety_stock)
      };
      if (newInventory.batch_number) {
        payload.batch_number = newInventory.batch_number;
      }

      if (newInventory.expiry_date) {
        payload.expiry_date = `${newInventory.expiry_date}T00:00:00`;
      }
      await api.post('/inventory', payload);
      setShowAdd(false);
      setNewInventory({ medicine_id: '', current_stock: '', reorder_level: '', safety_stock: '', batch_number: '', expiry_date: '' });
      setMedicineSearch('');
      // Refresh data
      const [inventoryData, medicinesData] = await Promise.all([api.get('/inventory'), api.get('/medicines')]);
      setInventory(inventoryData);
      setMedicines(medicinesData);
    } catch (err) {
      setError(err.message || 'Failed to add inventory');
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditInventory = async () => {
    // Client-side validation
    if (!editInventory.current_stock || editInventory.current_stock < 0) {
      setError('Current stock must be a positive number');
      return;
    }
    if (!editInventory.reorder_level || editInventory.reorder_level < 0) {
      setError('Reorder level must be a positive number');
      return;
    }
    if (!editInventory.safety_stock || editInventory.safety_stock < 0) {
      setError('Safety stock must be a positive number');
      return;
    }

    setEditLoading(true);
    setError(null);
    try {
      const payload = {
        current_stock: parseInt(editInventory.current_stock),
        reorder_level: parseInt(editInventory.reorder_level),
        safety_stock: parseInt(editInventory.safety_stock)
      };
      if (editInventory.batch_number) {
        payload.batch_number = editInventory.batch_number;
      }
      if (editInventory.expiry_date) {
        payload.expiry_date = `${editInventory.expiry_date}T00:00:00`;
      }

      await api.put(`/inventory/${editInventory.id}`, payload);
      setShowEdit(false);
      setEditInventory(null);
      // Refresh data
      const [inventoryData, medicinesData] = await Promise.all([api.get('/inventory'), api.get('/medicines')]);
      setInventory(inventoryData);
      setMedicines(medicinesData);
    } catch (err) {
      setError(err.message || 'Failed to update inventory');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteInventory = async (id) => {
    if (!confirm('Are you sure you want to delete this inventory record?')) return;
    try {
      await api.delete(`/inventory/${id}`);
      setInventory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete inventory');
    }
  };

  const openEditModal = (item) => {
    setEditInventory({
      id: item.id,
      medicine_id: item.medicine_id,
      current_stock: item.current_stock,
      reorder_level: item.reorder_level,
      safety_stock: item.safety_stock,
      batch_number: item.batch_number || '',
      expiry_date: item.expiry_date ? item.expiry_date.split('T')[0] : ''
    });
    setShowEdit(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Medicine Inventory</h1>
          <p className="text-sm text-gray-500 mt-0.5">{loading ? 'Loading inventory…' : `${items.length} inventory records · ${lowCriticalCount} low/critical`}</p>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAdd(true)} className="btn-primary"><Plus size={14} />Add Inventory</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Records', value: items.length, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
          { label: 'Healthy', value: items.filter(m => m.stock_status === 'GREEN').length, color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' },
          { label: 'Low/Critical', value: lowCriticalCount, color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' },
          
        ].map((s, i) => (
          <div key={i} className={`rounded-xl px-4 py-3 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium mt-0.5 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      <SectionCard>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
            />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search medicines or ID…"
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} className="input-field sm:w-44">
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="input-field sm:w-36">
            {statuses.map(s => <option key={s} value={s}>{s === 'All' ? 'All Status' : statusLabel[s]}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading inventory from backend…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="text-lg font-medium">No Inventory Records</p>
            <p className="text-sm mt-1">Add inventory records for your medicines</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto -mx-5">
              <table className="w-full min-w-[700px]">
                <thead className="border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="table-th">ID</th>
                    <th className="table-th">Medicine</th>
                    <th className="table-th">Category</th>
                    <th className="table-th">Stock</th>
                    <th className="table-th">Reorder</th>
                    <th className="table-th">Safety</th>
                    <th className="table-th">Expiry</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Updated</th>
                    <th className="table-th">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/40">
                  {paged.map(m => (
                    <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50/70 dark:hover:bg-gray-700/20 transition-colors">
                      <td className="table-td text-xs text-gray-400 font-mono">{m.id}</td>
                      <td className="table-td font-semibold text-gray-800 dark:text-gray-100">{m.medicine_name}</td>
                      <td className="table-td text-gray-500 dark:text-gray-400">{m.category}</td>
                      <td className="table-td">
                        <span
  className={`font-semibold ${
    m.stock_status === 'RED'
      ? 'text-red-600'
      : m.stock_status === 'YELLOW'
      ? 'text-amber-600'
      : 'text-gray-700 dark:text-gray-300'
  }`}
>
  {m.current_stock}
</span>
                      </td>
                      <td className="table-td text-gray-500">{m.reorder_level}</td>
                      <td className="table-td text-gray-500">{m.safety_stock}</td>
                      <td className="table-td text-gray-500">{m.expiry}</td>
                      <td className="table-td"><Badge variant={statusVariant[m.stock_status]}>{statusLabel[m.stock_status]}</Badge></td>
                      <td className="table-td text-gray-500">{m.updated_at ? new Date(m.updated_at).toLocaleDateString() : '—'}</td>
                      <td className="table-td">
                        <div className="flex gap-1.5">
                          <button onClick={() => openEditModal(m)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => handleDeleteInventory(m.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
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
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-5">Add Inventory Record</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Medicine</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Type medicine name..."
                    value={medicineSearch}
                    onChange={(e) => {
                      setMedicineSearch(e.target.value);
                      setShowSuggestions(true);
                      setNewInventory(prev => ({
                        ...prev,
                        medicine_id: ''
                      }));
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="input-field"
                  />

                  {showSuggestions && medicineSearch && (
                    <div className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border bg-white shadow-lg">
                      {filteredMedicines.length > 0 ? (
                        filteredMedicines.map(m => (
                          <div
                            key={m.id}
                            className="cursor-pointer px-4 py-2 hover:bg-blue-100"
                            onClick={() => {
                              setMedicineSearch(m.medicine_name);
                              setNewInventory(prev => ({
                                ...prev,
                                medicine_id: m.id
                              }));
                              setShowSuggestions(false);
                            }}
                          >
                            {m.medicine_name}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500">
                          No medicine found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Current Stock</label>
                <input
                  type="number"
                  min="0"
                  value={newInventory.current_stock}
                  onChange={e => setNewInventory(p => ({ ...p, current_stock: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Reorder Level</label>
                <input
                  type="number"
                  min="0"
                  value={newInventory.reorder_level}
                  onChange={e => setNewInventory(p => ({ ...p, reorder_level: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Safety Stock</label>
                <input
                  type="number"
                  min="0"
                  value={newInventory.safety_stock}
                  onChange={e => setNewInventory(p => ({ ...p, safety_stock: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Batch Number</label>
                <input
                  type="text"
                  value={newInventory.batch_number || ''}
                  onChange={e => setNewInventory(p => ({ ...p, batch_number: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={newInventory.expiry_date || ''}
                  onChange={e => setNewInventory(p => ({ ...p, expiry_date: e.target.value }))}
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handleAddInventory} disabled={addLoading} className="btn-primary flex-1 justify-center disabled:opacity-50">{addLoading ? 'Saving...' : 'Save'}</button>
            </div>
          </motion.div>
        </div>
      )}

      {showEdit && editInventory && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-6 w-full max-w-lg">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-5">Edit Inventory Record</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Medicine</label>
                <select value={editInventory.medicine_id} disabled className="input-field bg-gray-100 dark:bg-gray-700">
                  <option value="">Select Medicine</option>
                  {medicines.map(m => <option key={m.id} value={m.id}>{m.medicine_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Current Stock</label>
                <input type="number" value={editInventory.current_stock} onChange={e => setEditInventory(p => ({ ...p, current_stock: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Reorder Level</label>
                <input type="number" value={editInventory.reorder_level} onChange={e => setEditInventory(p => ({ ...p, reorder_level: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Safety Stock</label>
                <input type="number" value={editInventory.safety_stock} onChange={e => setEditInventory(p => ({ ...p, safety_stock: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Batch Number</label>
                <input type="text" value={editInventory.batch_number} onChange={e => setEditInventory(p => ({ ...p, batch_number: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Expiry Date</label>
                <input type="date" value={editInventory.expiry_date} onChange={e => setEditInventory(p => ({ ...p, expiry_date: e.target.value }))} className="input-field" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowEdit(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handleEditInventory} disabled={editLoading} className="btn-primary flex-1 justify-center disabled:opacity-50">{editLoading ? 'Updating...' : 'Update Inventory'}</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
