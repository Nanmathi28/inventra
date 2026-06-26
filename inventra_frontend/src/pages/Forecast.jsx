import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, BarChart3, Target, ArrowUp, Calendar, Brain } from 'lucide-react';
import { SectionCard, KPICard, Badge } from '../components/ui';
import { api } from '../services/api';

export default function Forecast() {
  const [forecastData, setForecastData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/forecast'),
      api.get('/forecast/chart-data')
    ])
      .then(([forecastResponse, chartDataResponse]) => {
        setForecastData(forecastResponse);
        setAnalytics({ monthly_sales_trend: chartDataResponse?.monthly_sales_trend || [] });
      })
      .catch(err => setError(err.message || 'Could not load forecast data'))
      .finally(() => setLoading(false));
  }, []);

  // Top 6 medicines by predicted demand for Historical vs Forecast chart
  const topMedicines = forecastData?.forecasts
    ?.slice()
    .sort((a, b) => b.predicted_demand - a.predicted_demand)
    .slice(0, 6)
    .map(f => ({
      name: f.medicine_name.length > 15 ? f.medicine_name.substring(0, 15) + '...' : f.medicine_name,
      actual: f.current_demand,
      predicted: f.predicted_demand
    })) || [];

  // Use forecast API's monthly sales trend data
  const salesData = analytics?.monthly_sales_trend?.map(t => ({
    month: t.month,
    sales: t.total_sales > 0 ? t.total_sales : null,
    forecast: null
  })) || [];

  // Use forecast data for medicine predictions
  const forecastMedicines = forecastData?.forecasts?.map(f => ({
    name: f.medicine_name,
    current: f.current_demand,
    predicted: f.predicted_demand,
    confidence: f.confidence,
    trend: f.trend,
    growth: f.growth_percentage > 0 ? `+${f.growth_percentage}%` : `${f.growth_percentage}%`
  })) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500 dark:text-gray-400">Loading forecast data...</div>
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

  const totalPredictedDemand = forecastMedicines.reduce((sum, m) => sum + m.predicted, 0);
  const avgConfidence = forecastMedicines.length > 0 
    ? (forecastMedicines.reduce((sum, m) => sum + m.confidence, 0) / forecastMedicines.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Demand Forecasting</h1>
        <p className="text-sm text-gray-500 mt-0.5">AI-powered predictive analytics · Model accuracy: {forecastData?.model_accuracy || 85}%</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard icon={<BarChart3 size={20} />} label="Predicted Demand" value={`${totalPredictedDemand} units`} sub={`${forecastMedicines.length} medicines`} color="blue" delay={0} />
        <KPICard icon={<Target size={20} />} label="Forecast Confidence" value={`${avgConfidence}%`} sub="Average across medicines" color="green" delay={0.05} />
        <KPICard icon={<ArrowUp size={20} />} label="Forecast Horizon" value={`${forecastData?.horizon_months || 6} months`} sub="Updated daily" color="amber" delay={0.1} />
        <KPICard icon={<Calendar size={20} />} label="Medicines Tracked" value={forecastMedicines.length} sub="Active forecasts" color="purple" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Top 6 Medicines by Predicted Demand">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topMedicines} margin={{ top: 0, right: 5, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="actual" fill="#93c5fd" radius={[3, 3, 0, 0]} name="Current Demand" />
              <Bar dataKey="predicted" fill="#34d399" radius={[3, 3, 0, 0]} name="Predicted Demand" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-300 inline-block" />Current Demand</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-400 inline-block" />Predicted Demand</span>
          </div>
        </SectionCard>

        <SectionCard title="Sales Value Trend & Forecast">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={salesData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} />
              <YAxis tickFormatter={v => `₹${v / 1000}K`} tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <Tooltip formatter={v => v ? `₹${(v / 1000).toFixed(0)}K` : '—'} />
              <Area type="monotone" dataKey="forecast" stroke="#8b5cf6" strokeWidth={2} fill="url(#gArea)" name="Forecast" connectNulls dot={{ r: 3, fill: '#8b5cf6' }} />
              <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} name="Sales" connectNulls={false} />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <SectionCard title="Medicine-level Demand Predictions">
        {forecastMedicines.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No forecast data available. Add medicines and inventory to generate forecasts.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {forecastMedicines.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight pr-2">{m.name}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${m.trend === 'up' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : m.trend === 'down' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                    {m.growth}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                    <span>Historical monthly sales</span><span className="font-medium text-gray-700 dark:text-gray-300">{m.current}/mo</span>
                  </div>
                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                    <span>Predicted</span><span className="font-semibold text-blue-600 dark:text-blue-400">{m.predicted}/mo</span>
                  </div>
                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                    <span>Trend</span>
                    <span className={`flex items-center gap-1 font-medium ${m.trend === 'up' ? 'text-green-600' : m.trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
                      {m.trend === 'up' ? <TrendingUp size={11} /> : m.trend === 'down' ? <TrendingDown size={11} /> : <Minus size={11} />}
                      {m.trend.charAt(0).toUpperCase() + m.trend.slice(1)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
