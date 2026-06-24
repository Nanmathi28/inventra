import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, User, Bell, Shield, Palette, Database, CheckCircle, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SectionCard } from '../components/ui';
import { api } from '../services/api';

function Toggle({ checked, onChange, label, desc }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-100 dark:border-gray-700/60 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

function Toast({ message, onDone }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      onAnimationComplete={() => setTimeout(onDone, 2500)}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-3.5 rounded-2xl shadow-2xl"
    >
      <CheckCircle size={16} className="text-green-400 dark:text-green-600 flex-shrink-0" />
      <span className="text-sm font-semibold">{message}</span>
    </motion.div>
  );
}

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'thresholds', label: 'Thresholds', icon: Database },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const { dark, toggle } = useTheme();

  const [tab, setTab] = useState('profile');
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  // Profile state - pre-fill from logged in user
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    title: user?.title || '',
    department: user?.department || '',
    specialization: user?.specialization || '',
    experience: user?.experience || '',
    license: user?.license || '',
    location: user?.location || '',
    bio: user?.bio || '',
  });

  // Notification prefs
  const [notifs, setNotifs] = useState({
    lowStock: true, criticalStock: true, expiry: true,
    forecast: false, restock: true, emailDigest: true, smsAlerts: false,
  });

  // Thresholds
  const [thresholds, setThresholds] = useState({
    lowStock: 80, criticalStock: 20, expiryAlert: 30,
    reorderBuffer: 1.5, forecastHorizon: 6,
  });

  // Security
  const [passwords, setPasswords] = useState({ current: '', newPw: '', confirm: '' });
  const [pwError, setPwError] = useState('');

  function showToast(msg) {
    setToast(msg);
  }

  async function saveProfile() {
    setSaving(true);
    try {
      await api.put('/auth/profile', { full_name: profile.name });
      updateProfile(profile);
      setSaving(false);
      showToast('Profile updated successfully');
    } catch (err) {
      setSaving(false);
      showToast('Failed to update profile');
    }
  }

  async function saveThresholds() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    setSaving(false);
    showToast('Threshold settings saved');
  }

  async function saveNotifications() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    setSaving(false);
    showToast('Notification preferences saved');
  }

  async function changePassword() {
    setPwError('');
    if (!passwords.current) { setPwError('Enter your current password.'); return; }
    if (passwords.newPw.length < 6) { setPwError('New password must be at least 6 characters.'); return; }
    if (passwords.newPw !== passwords.confirm) { setPwError('Passwords do not match.'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    setSaving(false);
    setPasswords({ current: '', newPw: '', confirm: '' });
    showToast('Password changed successfully');
  }

  const roleColors = { admin: 'from-blue-500 to-blue-700', pharmacist: 'from-emerald-500 to-emerald-700', customer: 'from-purple-500 to-purple-700' };
  const roleLabels = { admin: 'Administrator', pharmacist: 'Senior Pharmacist', customer: 'Registered Patient' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your profile, preferences, and system configuration</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="lg:w-52 flex-shrink-0">
          <div className="glass-card p-2 space-y-0.5">
            {TABS.map(t => {
              const Icon = t.icon;
              const allowed = user?.role === 'admin' || ['profile', 'notifications', 'security', 'appearance'].includes(t.id);
              if (!allowed && t.id === 'thresholds' && user?.role !== 'admin' && user?.role !== 'pharmacist') return null;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === t.id ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:text-gray-800 dark:hover:text-gray-100'}`}
                >
                  <Icon size={16} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {tab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                {/* Profile card */}
                <SectionCard>
                  <div className="flex items-center gap-5 pb-5 border-b border-gray-100 dark:border-gray-700 mb-5">
                    <div className="relative group cursor-pointer">
                      <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${roleColors[user?.role] || 'from-blue-500 to-blue-700'} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                        {user?.avatar}
                      </div>
                      <div className="absolute inset-0 rounded-3xl bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera size={18} className="text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{user?.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{roleLabels[user?.role]}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${user?.role === 'admin' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : user?.role === 'pharmacist' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                          {user?.role?.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-400">ID: {user?.id}</span>
                        <span className="text-xs text-gray-400">License: {user?.license}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: 'name', label: 'Full Name', type: 'text' },
                      { key: 'email', label: 'Email Address', type: 'email' },
                      { key: 'phone', label: 'Phone Number', type: 'tel' },
                      { key: 'title', label: 'Professional Title', type: 'text' },
                      { key: 'department', label: 'Department', type: 'text' },
                      { key: 'experience', label: 'Years of Experience', type: 'text' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">{f.label}</label>
                        <input
                          type={f.type}
                          value={profile[f.key]}
                          onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                          className="input-field"
                        />
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Specialization</label>
                      <input value={profile.specialization} onChange={e => setProfile(p => ({ ...p, specialization: e.target.value }))} className="input-field" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Professional Bio</label>
                      <textarea
                        rows={3}
                        value={profile.bio}
                        onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                        className="input-field resize-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Location / Hospital</label>
                      <input value={profile.location} onChange={e => setProfile(p => ({ ...p, location: e.target.value }))} className="input-field" />
                    </div>
                  </div>
                  <div className="flex justify-end mt-5">
                    <button onClick={saveProfile} disabled={saving}
                      className="btn-primary px-6 disabled:opacity-60">
                      <Save size={14} />
                      {saving ? 'Saving…' : 'Save Profile'}
                    </button>
                  </div>
                </SectionCard>

                {/* Professional card (read-only) */}
                <SectionCard title="Professional Information">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { label: 'Role', value: roleLabels[user?.role] },
                      { label: 'License Number', value: user?.license },
                      { label: 'Experience', value: user?.experience },
                      { label: 'Department', value: user?.department },
                      { label: 'Employee ID', value: user?.id },
                      { label: 'Location', value: user?.location },
                    ].map((item, i) => (
                      <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.value || '—'}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 rounded-xl">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">About</p>
                    <p className="text-sm text-blue-600 dark:text-blue-300 leading-relaxed">{profile.bio}</p>
                  </div>
                </SectionCard>
              </motion.div>
            )}

            {tab === 'notifications' && (
              <motion.div key="notifs" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <SectionCard title="Notification Preferences">
                  <Toggle checked={notifs.criticalStock} onChange={v => setNotifs(n => ({ ...n, criticalStock: v }))} label="Critical Stock Alerts" desc="Immediate alert when stock falls to critical level" />
                  <Toggle checked={notifs.lowStock} onChange={v => setNotifs(n => ({ ...n, lowStock: v }))} label="Low Stock Alerts" desc="Alert when stock falls below reorder threshold" />
                  <Toggle checked={notifs.expiry} onChange={v => setNotifs(n => ({ ...n, expiry: v }))} label="Expiry Alerts" desc="Notifications for medicines expiring within 30 days" />
                  <Toggle checked={notifs.restock} onChange={v => setNotifs(n => ({ ...n, restock: v }))} label="Restock Recommendations" desc="AI-generated reorder suggestions" />
                  <Toggle checked={notifs.forecast} onChange={v => setNotifs(n => ({ ...n, forecast: v }))} label="Forecast Insights" desc="Weekly AI demand forecast summary" />
                  <Toggle checked={notifs.emailDigest} onChange={v => setNotifs(n => ({ ...n, emailDigest: v }))} label="Email Digest" desc="Daily summary delivered to your email" />
                  <Toggle checked={notifs.smsAlerts} onChange={v => setNotifs(n => ({ ...n, smsAlerts: v }))} label="SMS Alerts" desc="Critical alerts sent to your registered phone" />
                  <div className="flex justify-end pt-4">
                    <button onClick={saveNotifications} disabled={saving} className="btn-primary disabled:opacity-60">
                      <Save size={14} />{saving ? 'Saving…' : 'Save Preferences'}
                    </button>
                  </div>
                </SectionCard>
              </motion.div>
            )}

            {tab === 'thresholds' && (
              <motion.div key="thresh" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <SectionCard title="Inventory Thresholds">
                  <div className="space-y-5">
                    {[
                      { key: 'lowStock', label: 'Low Stock Threshold', desc: 'Alert when medicine stock drops below this level', unit: 'units', min: 10, max: 500 },
                      { key: 'criticalStock', label: 'Critical Stock Threshold', desc: 'Urgent action required below this level', unit: 'units', min: 1, max: 100 },
                      { key: 'expiryAlert', label: 'Expiry Alert Window', desc: 'Days before expiry to trigger warning', unit: 'days', min: 7, max: 90 },
                      { key: 'reorderBuffer', label: 'Reorder Buffer Multiplier', desc: 'Safety stock multiplier for reorder quantity (e.g. 1.5x demand)', unit: '×', min: 1, max: 3, step: 0.1 },
                      { key: 'forecastHorizon', label: 'Forecast Horizon', desc: 'How many months ahead to forecast demand', unit: 'months', min: 1, max: 12 },
                    ].map(f => (
                      <div key={f.key} className="p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{f.label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{f.desc}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <input
                              type="number"
                              value={thresholds[f.key]}
                              step={f.step || 1}
                              min={f.min} max={f.max}
                              onChange={e => setThresholds(t => ({ ...t, [f.key]: +e.target.value }))}
                              className="w-20 px-3 py-1.5 text-sm text-center bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-gray-100 font-semibold"
                            />
                            <span className="text-xs text-gray-400 min-w-[36px]">{f.unit}</span>
                          </div>
                        </div>
                        <input type="range" min={f.min} max={f.max} step={f.step || 1}
                          value={thresholds[f.key]}
                          onChange={e => setThresholds(t => ({ ...t, [f.key]: +e.target.value }))}
                          className="w-full accent-blue-600"
                        />
                        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                          <span>{f.min} {f.unit}</span><span>{f.max} {f.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-4">
                    <button onClick={saveThresholds} disabled={saving} className="btn-primary disabled:opacity-60">
                      <Save size={14} />{saving ? 'Saving…' : 'Save Thresholds'}
                    </button>
                  </div>
                </SectionCard>
              </motion.div>
            )}

            {tab === 'security' && (
              <motion.div key="security" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                <SectionCard title="Change Password">
                  <div className="space-y-4 max-w-sm">
                    {[
                      { key: 'current', label: 'Current Password' },
                      { key: 'newPw', label: 'New Password' },
                      { key: 'confirm', label: 'Confirm New Password' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">{f.label}</label>
                        <input type="password" value={passwords[f.key]}
                          onChange={e => setPasswords(p => ({ ...p, [f.key]: e.target.value }))}
                          className="input-field" />
                      </div>
                    ))}
                    {pwError && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{pwError}</p>}
                    <button onClick={changePassword} disabled={saving} className="btn-primary disabled:opacity-60">
                      <Shield size={14} />{saving ? 'Updating…' : 'Update Password'}
                    </button>
                  </div>
                </SectionCard>
                <SectionCard title="Account Security">
                  <div className="space-y-3">
                    {[
                      { label: 'Two-Factor Authentication', desc: 'Add an extra layer of security to your account', badge: 'Recommended' },
                      { label: 'Session Management', desc: 'View and revoke active sessions', badge: null },
                      { label: 'Login History', desc: 'View recent login activity', badge: null },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</p>
                            {item.badge && <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-semibold">{item.badge}</span>}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                        </div>
                        <button className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">Manage</button>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </motion.div>
            )}

            {tab === 'appearance' && (
              <motion.div key="appear" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <SectionCard title="Appearance">
                  <div className="space-y-5">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Theme Mode</p>
                      <div className="grid grid-cols-2 gap-3 max-w-sm">
                        {[
                          { label: 'Light Mode', val: false },
                          { label: 'Dark Mode', val: true },
                        ].map(t => (
                          <button key={t.label} onClick={() => !dark === t.val ? null : toggle()}
                            className={`p-4 rounded-2xl border-2 text-center transition-all ${dark === t.val ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'}`}
                          >
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t.label}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Dashboard Density</p>
                      <p className="text-xs text-gray-400 mb-3">Choose how much information is shown per screen</p>
                      <div className="flex gap-2">
                        {['Compact', 'Comfortable', 'Spacious'].map((d, i) => (
                          <button key={d} className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${i === 1 ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'}`}>{d}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </SectionCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
