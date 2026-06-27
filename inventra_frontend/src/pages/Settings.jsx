import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, User, Shield, Palette, CheckCircle, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SectionCard } from '../components/ui';
import { api } from '../services/api';
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";

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
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const { dark, toggle } = useTheme();

  const [tab, setTab] = useState('profile');
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  // Profile state - pre-fill from logged in user
  const [profile, setProfile] = useState({
    name: user?.full_name || '',
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

  // Security
  const [passwords, setPasswords] = useState({ current: '', newPw: '', confirm: '' });
  const [pwError, setPwError] = useState('');

  const handlePasswordChange = async () => {

    setPwError("");

    if (!passwords.current.trim()) {
      setPwError("Current password is required.");
      return;
    }

    if (!passwords.newPw.trim()) {
      setPwError("New password is required.");
      return;
    }

    if (passwords.newPw.length < 8) {
      setPwError("Password must be at least 8 characters.");
      return;
    }

    if (passwords.newPw !== passwords.confirm) {
      setPwError("Passwords do not match.");
      return;
    }

    try {

      await api.put("/auth/change-password", {
        current_password: passwords.current,
        new_password: passwords.newPw,
      });

      alert("Password updated successfully.");

      setPasswords({
        current: "",
        newPw: "",
        confirm: "",
      });

    } catch (err) {
      setPwError(
        err.message || "Failed to update password."
      );
    }
  };

  function showToast(msg) {
    setToast(msg);
  }

  async function saveProfile() {

    // Clear old errors
    setErrors({});

    // Full Name is required
    if (!profile.name.trim()) {
      setErrors({
        name: "Full Name is required."
      });
      return;
    }

    // Email is required
    if (!profile.email.trim()) {
      setErrors({
        email: "Email is required."
      });
      return;
    }

    setSaving(true);

    try {
      updateProfile({
        ...user,
        full_name: profile.name
      });

      showToast("Profile updated successfully");

    } catch (err) {

      showToast("Failed to update profile");

    } finally {

      setSaving(false);

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
              const allowed = user?.role === 'admin' || ['profile', 'security', 'appearance'].includes(t.id);
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
                        {profile.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute inset-0 rounded-3xl bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera size={18} className="text-white" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{profile.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{roleLabels[user?.role]}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${user?.role === 'admin' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : user?.role === 'pharmacist' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                          {user?.role?.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-400">ID: {user?.id}</span>
                      </div>
                    </div>
                    
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: "name", label: "Full Name", type: "text", required: true },
                      { key: "email", label: "Email Address", type: "email", required: true },
                      { key: "phone", label: "Phone Number", type: "tel", required: false },
                      { key: "specialization", label: "Specialization", type: "text", required: false }

                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                          {f.label}

                          {f.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </label>
                        {f.key === "phone" ? (

                          <PhoneInput
                            international
                            defaultCountry="IN"
                            value={profile.phone}
                            onChange={(value) => {
                              setProfile(prev => ({
                                ...prev,
                                phone: value || ""
                              }));

                              if (value && !isValidPhoneNumber(value)) {
                                setErrors(prev => ({
                                  ...prev,
                                  phone: "Enter a valid phone number."
                                }));
                              } else {
                                setErrors(prev => ({
                                  ...prev,
                                  phone: ""
                                }));
                              }
                            }}
                            className="input-field"
                          />

                        ) : (

                          <input
                            type={f.type}
                            value={profile[f.key]}
                            onChange={(e) =>
                              setProfile(p => ({
                                ...p,
                                [f.key]: e.target.value
                              }))
                            }
                            className="input-field"
                          />

                        )}
                        {errors[f.key] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[f.key]}
                          </p>
                        )}

                      </div>
                    ))}
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
                      { label: "Role", value: roleLabels[user?.role] },
                      { label: "Specialization", value: profile.specialization },
                    ].map((item, i) => (
                      <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.value || '—'}</p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </motion.div>
            )}

            {tab === "security" && (

              <SectionCard title="Security">

                <div className="space-y-5">

                  <div>

                    <label>Current Password</label>

                    <input
                      type="password"
                      value={passwords.current}
                      onChange={(e) =>
                        setPasswords({
                          ...passwords,
                          current: e.target.value
                        })
                      }
                      className="input-field"
                    />

                  </div>

                  <div>

                    <label>New Password</label>

                    <input
                      type="password"
                      value={passwords.newPw}
                      onChange={(e) =>
                        setPasswords({
                          ...passwords,
                          newPw: e.target.value
                        })
                      }
                      className="input-field"
                    />

                  </div>

                  <div>

                    <label>Confirm Password</label>

                    <input
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) =>
                        setPasswords({
                          ...passwords,
                          confirm: e.target.value
                        })
                      }
                      className="input-field"
                    />

                  </div>

                  {pwError && (
                    <p className="text-red-500 text-sm mt-2">
                      {pwError}
                    </p>
                  )}

                  <button
                    onClick={handlePasswordChange}
                    className="btn-primary"
                  >
                    Update Password
                  </button>

                </div>

              </SectionCard>

            )}

            {tab === "appearance" && (
              <SectionCard title="Appearance">
                <div className="space-y-6">

                  <div>
                    <label className="block text-sm font-semibold mb-3">
                      Theme
                    </label>

                    <div className="flex gap-3">

                      <button
                        onClick={() => {
                          document.documentElement.classList.remove("dark");
                          localStorage.setItem("theme", "light");
                        }}
                        className="btn-secondary"
                      >
                        ☀ Light
                      </button>

                      <button
                        onClick={() => {
                          <Toggle
                            checked={dark}
                            onChange={toggle}
                            label="Dark Mode"
                            desc="Switch between light and dark mode."
                          />
                          localStorage.setItem("theme", "dark");
                        }}
                        className="btn-secondary"
                      >
                        🌙 Dark
                      </button>

                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    Theme preference is saved automatically.
                  </div>

                </div>
              </SectionCard>
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
