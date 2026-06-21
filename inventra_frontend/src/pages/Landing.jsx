import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
  Brain, Package, TrendingUp, Clock, Bell, BarChart3, Shield,
  ChevronRight, ArrowRight, Sun, Moon, Check, Star, Zap, Globe2, Users
} from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI Demand Forecasting', desc: 'Predict medicine demand up to 6 months ahead using machine learning trained on seasonal patterns and historical sales.', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { icon: RefreshCwIcon, title: 'Smart Restocking', desc: 'Automated reorder suggestions with optimal quantities, supplier selection, and lead-time awareness.', color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { icon: Clock, title: 'Expiry Management', desc: 'Track expiry dates across all batches. Get early warnings and waste-reduction recommendations automatically.', color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  { icon: Bell, title: 'Intelligent Alerts', desc: 'Real-time notifications for critical stock, expiry risks, forecast anomalies, and supplier delays.', color: 'from-red-500 to-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Executive-grade analytics with inventory health, sales trends, supplier performance, and waste analysis.', color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { icon: Shield, title: 'Role-Based Access', desc: 'Granular access control for Admins, Pharmacists, and Customers — each seeing exactly what they need.', color: 'from-cyan-500 to-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
];

function RefreshCwIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

const roles = [
  { role: 'Admin', color: 'from-blue-500 to-blue-700', border: 'border-blue-200 dark:border-blue-700', desc: 'Full system control — manage users, configure thresholds, view all analytics, and oversee pharmacy operations end-to-end.', perms: ['Full inventory access', 'User management', 'All analytics & reports', 'System configuration', 'Supplier management'] },
  { role: 'Pharmacist', color: 'from-emerald-500 to-emerald-700', border: 'border-emerald-200 dark:border-emerald-700', desc: 'Operational access — monitor stock, manage dispensing, track expiries, and act on AI restock suggestions.', perms: ['Inventory monitoring', 'Expiry management', 'Alert center', 'Demand forecasting', 'Restock actions'] },
  { role: 'Customer', color: 'from-purple-500 to-purple-700', border: 'border-purple-200 dark:border-purple-700', desc: 'Patient portal — check medicine availability, track orders, view prescriptions, and access health records.', perms: ['Medicine availability', 'Order history', 'Prescription tracking', 'Availability alerts', 'Personal health portal'] },
];

const stats = [
  { value: '99.2%', label: 'System Uptime', icon: Zap },
  { value: '91.4%', label: 'Forecast Accuracy', icon: Brain },
  { value: '40%', label: 'Waste Reduction', icon: Globe2 },
  { value: '3 Roles', label: 'Access Levels', icon: Users },
];

const testimonials = [
  { name: 'Dr. Sunita Rao', title: 'Chief Pharmacist, Apollo Mumbai', text: 'Inventra cut our medicine waste by 38% in the first quarter. The AI forecasting is remarkably accurate for monsoon season demand spikes.', rating: 5 },
  { name: 'Rahul Verma', title: 'Operations Head, MedStore Chain', text: 'Managing 6 branches was a nightmare. Inventra unified everything — now we can see cross-branch stock health in one dashboard.', rating: 5 },
  { name: 'Dr. Aisha Khan', title: 'Pharmacy Manager, Lilavati Hospital', text: 'The expiry tracking alone saved us ₹2.4L in the first month. The alert system is incredibly proactive.', rating: 5 },
];

export default function Landing() {
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5, delay },
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-100 overflow-x-hidden">

      {/* Navbar */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-sm border-b border-gray-100 dark:border-gray-800' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white text-sm font-bold">Ix</span>
            </div>
            <span className="text-lg font-bold tracking-tight">Inventra</span>
            <span className="hidden sm:block text-[10px] text-gray-400 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-full font-medium">BETA</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500 dark:text-gray-400">
            <a href="#features" className="hover:text-gray-900 dark:hover:text-white transition-colors">Features</a>
            <a href="#roles" className="hover:text-gray-900 dark:hover:text-white transition-colors">Roles</a>
            <a href="#about" className="hover:text-gray-900 dark:hover:text-white transition-colors">About</a>
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={toggle} className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button onClick={() => navigate('/login')} className="hidden sm:block text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-1.5">
              Sign in
            </button>
            <button onClick={() => navigate('/login')} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2">
              Get Started <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-blue-500/8 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-500/6 dark:bg-purple-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/50 text-blue-700 dark:text-blue-300 text-xs font-semibold px-4 py-2 rounded-full mb-6">
            <Zap size={12} className="fill-current" /> AI-Powered Pharmacy Intelligence Platform
          </motion.div>

          <motion.h1 {...fadeUp(0.1)} className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.05] mb-6">
            Smart Inventory,<br />
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Zero Wastage.
            </span>
          </motion.h1>

          <motion.p {...fadeUp(0.2)} className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Inventra uses AI to predict demand, automate restocking, track expiries, and give every pharmacist a complete command center — from a single dashboard.
          </motion.p>

          <motion.div {...fadeUp(0.3)} className="flex flex-wrap justify-center gap-4 mb-16">
            <button onClick={() => navigate('/login')} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-2xl transition-all shadow-xl shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 flex items-center gap-2 text-base">
              Launch Dashboard <ArrowRight size={16} />
            </button>
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold px-8 py-3.5 rounded-2xl transition-all hover:-translate-y-0.5 text-base">
              See Features
            </button>
          </motion.div>

          {/* Stats bar */}
          <motion.div {...fadeUp(0.4)} className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60 rounded-2xl p-4 text-center">
                  <Icon size={20} className="text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">Platform Features</p>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Everything your pharmacy needs</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-xl mx-auto">Built for modern healthcare — combining AI prediction, real-time monitoring, and intelligent automation in one platform.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={i} {...fadeUp(i * 0.07)}
                  whileHover={{ y: -4 }}
                  className="bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/60 rounded-2xl p-6 shadow-sm hover:shadow-lg dark:hover:shadow-gray-900/40 transition-all duration-300 cursor-pointer group"
                >
                  <div className={`w-12 h-12 rounded-2xl ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <div className={`w-6 h-6 bg-gradient-to-br ${f.color} rounded-lg flex items-center justify-center`}>
                      <Icon size={14} className="text-white" />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3">Access Control</p>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Three roles, one platform</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-xl mx-auto">Each user type gets a tailored dashboard and exactly the permissions they need — no more, no less.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((r, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)}
                whileHover={{ y: -6 }}
                className={`bg-white dark:bg-gray-800/80 border-2 ${r.border} rounded-3xl p-7 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group`}
                onClick={() => navigate('/login')}
              >
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{r.role}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">{r.desc}</p>
                <ul className="space-y-2">
                  {r.perms.map((p, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Check size={13} className="text-emerald-500 flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
                <button className={`mt-6 w-full py-2.5 rounded-xl bg-gradient-to-r ${r.color} text-white text-sm font-semibold flex items-center justify-center gap-2 group-hover:shadow-lg transition-all`}>
                  Login as {r.role} <ChevronRight size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp()}>
              <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-4">About Inventra</p>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">Built for the modern healthcare supply chain</h2>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                Inventra was built as a research-grade AI platform to solve one of healthcare's most persistent challenges: pharmacy inventory mismanagement. Medicine stockouts and wastage cost the Indian healthcare system billions annually.
              </p>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
                By combining predictive ML models, real-time monitoring, and intuitive dashboards, Inventra gives pharmacy teams the intelligence they need to keep medicines available — and cut waste to near zero.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { v: '₹2.4L', l: 'Avg. monthly savings' },
                  { v: '38%', l: 'Waste reduction' },
                  { v: '6 mo', l: 'Forecast horizon' },
                  { v: '284+', l: 'Medicine profiles' },
                ].map((s, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{s.v}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.l}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div {...fadeUp(0.15)}>
              <div className="space-y-4">
                {testimonials.map((t, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
                    <div className="flex gap-0.5 mb-3">
                      {Array(t.rating).fill(0).map((_, j) => (
                        <Star key={j} size={13} className="text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">"{t.text}"</p>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div {...fadeUp()} className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-12 shadow-2xl shadow-blue-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to transform your pharmacy?</h2>
              <p className="text-blue-200 mb-8 text-base">Login to your role-based dashboard and experience AI-powered inventory management.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <button onClick={() => navigate('/login')} className="bg-white text-blue-700 font-semibold px-8 py-3.5 rounded-2xl hover:bg-blue-50 transition-all shadow-lg flex items-center gap-2">
                  Launch Platform <ArrowRight size={16} />
                </button>
              </div>
              <p className="text-blue-300 text-xs mt-6">No setup required · Demo credentials provided on login page</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">Ix</span>
            </div>
            <span className="font-bold text-gray-800 dark:text-white">Inventra</span>
            <span className="text-gray-400 text-xs">— Predictive Inventory Intelligence Platform</span>
          </div>
          <p className="text-xs text-gray-400">Final Year Research Project · 2026</p>
        </div>
      </footer>
    </div>
  );
}
