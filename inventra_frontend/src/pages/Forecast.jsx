import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, BarChart3, Target, ArrowUp, Calendar, Brain } from 'lucide-react';
import { SectionCard, KPICard, Badge } from '../components/ui';
import { salesData, categoryDemand, forecastMedicines } from '../data/dummy';

const monthlyForecast = [
  { month: 'Jan', actual: 1820, predicted: 1900 },
  { month: 'Feb', actual: 2100, predicted: 2050 },
  { month: 'Mar', actual: 2350, predicted: 2200 },
  { month: 'Apr', actual: 1980, predicted: 2100 },
  { month: 'May', actual: 2600, predicted: 2500 },
  { month: 'Jun', actual: 2880, predicted: 2750 },
  { month: 'Jul', actual: null, predicted: 3200 },
  { month: 'Aug', actual: null, predicted: 3500 },
  { month: 'Sep', actual: null, predicted: 3350 },
];

export default function Forecast() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Demand Forecasting</h1>
        <p className="text-sm text-gray-500 mt-0.5">AI-powered predictive analytics · Model accuracy: 91.4%</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard icon={<BarChart3 size={20} />} label="Predicted Demand (Jul)" value="4,820 units" sub="Top 10 medicines" color="blue" delay={0} />
        <KPICard icon={<Target size={20} />} label="Forecast Confidence" value="91.4%" sub="MAPE: 8.6%" trend="+0.8% this week" color="green" delay={0.05} />
        <KPICard icon={<ArrowUp size={20} />} label="Expected Growth" value="+17%" sub="Monsoon demand spike" color="amber" delay={0.1} />
        <KPICard icon={<Calendar size={20} />} label="Forecast Horizon" value="6 months" sub="Updated daily" color="purple" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Historical vs Forecast (Monthly Units)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyForecast} margin={{ top: 0, right: 5, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="actual" fill="#93c5fd" radius={[3, 3, 0, 0]} name="Actual" />
              <Bar dataKey="predicted" fill="#34d399" radius={[3, 3, 0, 0]} name="Predicted" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-300 inline-block" />Actual</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-400 inline-block" />Predicted</span>
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
                  <span>Current demand</span><span className="font-medium text-gray-700 dark:text-gray-300">{m.current}/mo</span>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Predicted (Jul)</span><span className="font-semibold text-blue-600 dark:text-blue-400">{m.predicted}/mo</span>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Confidence</span><span className="font-medium text-gray-700 dark:text-gray-300">{m.confidence}%</span>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Trend</span>
                  <span className={`flex items-center gap-1 font-medium ${m.trend === 'up' ? 'text-green-600' : m.trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
                    {m.trend === 'up' ? <TrendingUp size={11} /> : m.trend === 'down' ? <TrendingDown size={11} /> : <Minus size={11} />}
                    {m.trend.charAt(0).toUpperCase() + m.trend.slice(1)}
                  </span>
                </div>
              </div>
              {/* Confidence bar */}
              <div className="mt-3">
                <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${m.confidence}%` }} />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">{m.confidence}% confidence</p>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
