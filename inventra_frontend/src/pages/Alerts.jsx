import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, Clock, TrendingUp, RefreshCw, CheckCircle, AlertCircle, AlertOctagon, Calendar, BarChart3, FileText } from 'lucide-react';
import { SectionCard, KPICard, Badge } from '../components/ui';
import { api } from '../services/api';
import {
  ShoppingCart,
  User,
  Pill,
  Package,
  Hash,
  Check,
  X,
  Trash2,
} from "lucide-react";

const typeConfig = {
  critical: { label: 'Critical Stock', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800/40', dot: 'bg-red-500', icon: AlertTriangle },
  low: { label: 'Low Stock', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-700/40', dot: 'bg-amber-500', icon: Bell },
  expiry: { label: 'Expiry Alert', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-700/40', dot: 'bg-orange-500', icon: Clock },
  requests: { label: 'Patient Requests', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-700/40', dot: 'bg-blue-500', icon: ShoppingCart },
  prescription: { label: "Prescription Upload", color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20", border: "border-indigo-200 dark:border-indigo-700/40", dot: "bg-indigo-500", icon: FileText, },
};

const typeKey = {
  critical_stock: 'critical',
  low_stock: 'low',
  near_expiry: 'expiry',
  patient_request: 'requests',
  prescription_upload: "prescription",
};

export default function Alerts() {
  const [filter, setFilter] = useState('all');
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/alerts')
      .then(data => setAlerts(data || []))
      .catch(err => setError(err.message || 'Could not load alerts'))
      .finally(() => setLoading(false));
  }, []);

  const unreadCount = alerts.filter(a => a.status === 'active').length;
  const filtered =
    filter === 'all'
      ? alerts
      : filter === 'unread'
        ? alerts.filter(a => a.status === 'active')
        : alerts.filter(a => typeKey[a.alert_type] === filter);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Alert Center</h1>
          <p className="text-sm text-gray-500 mt-0.5">{loading ? 'Loading alerts…' : `${unreadCount} unread notifications`}</p>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
        <button onClick={async () => {
          try {
            await api.post('/alerts/generate');
            const data = await api.get('/alerts');
            setAlerts(data || []);
          } catch (err) {
            setError(err.message || 'Failed to generate alerts');
          }
        }} className="btn-secondary">
          <RefreshCw size={14} /> Generate Alerts
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5">
        {[
          { label: 'All Alerts', value: alerts.length, color: 'blue', icon: <Bell size={20} /> },
          { label: 'Critical', value: alerts.filter(a => typeKey[a.alert_type] === 'critical').length, color: 'red', icon: <AlertOctagon size={20} /> },
          { label: 'Low Stock', value: alerts.filter(a => typeKey[a.alert_type] === 'low').length, color: 'amber', icon: <AlertTriangle size={20} /> },
          { label: 'Expiry', value: alerts.filter(a => typeKey[a.alert_type] === 'expiry').length, color: 'amber', icon: <Calendar size={20} /> },
          { label: 'Patient Requests', value: alerts.filter(a => a.alert_type === 'patient_request').length, color: 'blue', icon: <ShoppingCart size={20} /> },
          { label: "Prescription Uploads", value: alerts.filter(a => a.alert_type === "prescription_upload").length, color: "indigo", icon: <FileText size={20} /> },
        ].map((s, i) => (
          <KPICard key={i} icon={s.icon} label={s.label} value={s.value.toString()} color={s.color} delay={i * 0.05} />
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'unread', 'critical', 'low', 'expiry', 'requests', 'prescription'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <SectionCard>
        <div className="space-y-8 max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading alerts from backend…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Bell size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No alerts in this category</p>
            </div>
          ) : (
            filtered.map((a, i) => {
              const key = typeKey[a.alert_type] || "low";
              const cfg = typeConfig[key];
              const Icon = cfg.icon;
              const isRead = a.status !== 'active';
              const createdAt = new Date(a.created_at).toLocaleString();
              const orderId = a.message.match(/Order ID:\s*(\d+)/)?.[1];
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border shadow-sm p-6"
                >

                  {/* PATIENT REQUEST CARD */}
                  {a.alert_type === "patient_request" ? (

                    <>
                      <div className="flex justify-between items-start">

                        <div className="flex gap-4">

                          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Icon className={cfg.color} size={22} />
                          </div>

                          <div>

                            <div className="flex items-center gap-3">

                              <h3 className="font-semibold text-lg">
                                {cfg.label}
                              </h3>

                              {!isRead && (
                                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                                  Pending
                                </span>
                              )}

                            </div>

                            <p className="text-sm text-gray-400 mt-1">
                              {new Date(a.created_at).toLocaleString("en-IN", {
                                day: "numeric",
                                month: "short",
                                hour: "numeric",
                                minute: "2-digit"
                              })}
                            </p>

                          </div>

                        </div>

                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-6 text-sm">

                        <div className="flex items-center gap-2">
                          <User size={16} />
                          <span>{a.message.match(/Patient:\s*(.*)/)?.[1]}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Pill size={16} />
                          <span>{a.message.match(/Medicine:\s*(.*)/)?.[1]}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Package size={16} />
                          <span>Qty {a.message.match(/Quantity:\s*(.*)/)?.[1]}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Hash size={16} />
                          <span>{a.message.match(/Order No:\s*(.*)/)?.[1]}</span>
                        </div>

                      </div>

                      <div className="flex justify-end gap-3 mt-6">

                        {/* Approve */}
                        <button
                          onClick={async () => {
                            try {
                              await api.post(`/orders/${orderId}/approve`);
                              const data = await api.get("/alerts");
                              setAlerts(data);
                            } catch (err) {
                              setError(err.message);
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check size={16} />
                          Approve
                        </button>

                        {/* Reject */}
                        <button
                          onClick={async () => {
                            try {
                              await api.post(`/orders/${orderId}/reject`);
                              const data = await api.get("/alerts");
                              setAlerts(data);
                            } catch (err) {
                              setError(err.message);
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
                        >
                          <X size={16} />
                          Reject
                        </button>

                        {/* Delete */}
                        <button
                          onClick={async () => {
                            if (!confirm("Delete this alert?")) return;

                            try {
                              await api.delete(`/alerts/${a.id}`);
                              setAlerts(prev => prev.filter(alert => alert.id !== a.id));
                            } catch (err) {
                              setError(err.message);
                            }
                          }}
                          className="w-10 h-10 rounded-lg border border-red-300 text-red-500 hover:bg-red-50 flex items-center justify-center"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>
                    </>

                  ) : a.alert_type === "prescription_upload" ? (

                    <>
                      <div className="flex justify-between items-start">

                        <div className="flex gap-4">

                          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                            <FileText className="text-indigo-600" size={22} />
                          </div>

                          <div>

                            <div className="flex items-center gap-3">

                              <h3 className="font-semibold text-lg">
                                Prescription Uploaded
                              </h3>

                              {!isRead && (
                                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                                  Pending Review
                                </span>
                              )}

                            </div>

                            <p className="text-sm text-gray-400 mt-1">
                              {createdAt}
                            </p>

                          </div>

                        </div>

                      </div>

                      <div className="grid grid-cols-1 gap-3 mt-6 text-sm">

                        <div className="flex items-center gap-2">
                          <User size={16} />
                          <span>
                            {a.message.match(/Patient:\s*(.*)/)?.[1]}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <FileText size={16} />
                          <span>
                            {a.message.match(/File:\s*(.*)/)?.[1]}
                          </span>
                        </div>

                      </div>

                      <div className="flex justify-end gap-3 mt-6">

                        {/* View File */}

                        <button
                          onClick={() => {
                            const file = a.message.match(/File:\s*(.*)/)?.[1];

                            if (file) {
                              window.open(file, "_blank");
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                        >
                          <FileText size={16} />
                          View File
                        </button>

                        {/* Verify */}

                        <button
                          onClick={async () => {

                            const prescriptionId =
                              a.message.match(/Prescription ID:\s*(\d+)/)?.[1];

                            try {

                              await api.post(
                                `/prescriptions/${prescriptionId}/verify`
                              );

                              const data =
                                await api.get("/alerts");

                              setAlerts(data);

                            } catch (err) {

                              setError(err.message);

                            }

                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check size={16} />
                          Verify
                        </button>

                      </div>

                    </>

                  ) : (
                    <>
                      {/* OLD ALERT UI */}

                      <div className="flex justify-between">

                        <div className="flex gap-4">

                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cfg.bg}`}>
                            <Icon className={cfg.color} size={18} />
                          </div>

                          <div>

                            <h3 className="font-semibold text-lg">
                              {cfg.label}
                            </h3>

                            <p className="text-sm text-gray-400 mt-1">
                              {createdAt}
                            </p>

                            <p className="mt-4 text-gray-700 leading-7">
                              {a.message}
                            </p>

                          </div>

                        </div>

                        <div className="flex flex-col items-end gap-3">

                          {!isRead && (

                            <button
                              onClick={async () => {
                                try {

                                  await api.put(`/alerts/${a.id}`, {
                                    status: "resolved"
                                  });

                                  setAlerts(prev =>
                                    prev.map(alert =>
                                      alert.id === a.id
                                        ? { ...alert, status: "resolved" }
                                        : alert
                                    )
                                  );

                                } catch (err) {
                                  setError(err.message);
                                }
                              }}
                              className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Mark Read
                            </button>

                          )}

                          <button
                            onClick={async () => {

                              if (!confirm("Delete this alert?")) return;

                              await api.delete(`/alerts/${a.id}`);

                              setAlerts(prev =>
                                prev.filter(alert => alert.id !== a.id)
                              );

                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>

                        </div>

                      </div>

                    </>

                  )}

                </motion.div>
              );
            })
          )}
        </div>
      </SectionCard>
    </div>
  );
}
