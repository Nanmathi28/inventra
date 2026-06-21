import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Download, Printer, BarChart3, Package, Recycle, Target } from 'lucide-react';
import { SectionCard, KPICard } from '../components/ui';
import { salesData, categoryDemand, inventoryHealth } from '../data/dummy';

const wasteData = [
  { month: 'Jan', waste: 2100 }, { month: 'Feb', waste: 3400 },
  { month: 'Mar', waste: 1800 }, { month: 'Apr', waste: 4200 },
  { month: 'May', waste: 2900 }, { month: 'Jun', waste: 1600 },
];

const supplierPerf = [
  { supplier: 'MedSupply', reliability: 96, onTime: 94, quality: 98 },
  { supplier: 'PharmaLink', reliability: 91, onTime: 89, quality: 93 },
  { supplier: 'BioMed', reliability: 88, onTime: 85, quality: 91 },
  { supplier: 'NutriPharma', reliability: 84, onTime: 82, quality: 87 },
  { supplier: 'CardioMed', reliability: 89, onTime: 90, quality: 92 },
];

export default function Reports() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Comprehensive inventory intelligence</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary"><Printer size={14} />Print</button>
          <button className="btn-secondary"><Download size={14} />Excel</button>
          <button className="btn-primary"><Download size={14} />Export PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard icon={<BarChart3 size={20} />} label="Total Sales (YTD)" value="₹18.9L" trend="+14% vs last year" color="blue" delay={0} />
        <KPICard icon={<Package size={20} />} label="Inventory Turnover" value="4.2x" sub="Annual rate" color="green" delay={0.05} />
        <KPICard icon={<Recycle size={20} />} label="Waste Value (YTD)" value="₹16,000" trend="-22% improvement" color="amber" delay={0.1} />
        <KPICard icon={<Target size={20} />} label="Fill Rate" value="97.3%" sub="Order fulfillment" color="purple" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Sales Trend — 2026">
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={salesData.filter(d => d.sales)} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gSalesRep" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} />
              <YAxis tickFormatter={v => `₹${v / 1000}K`} tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <Tooltip formatter={v => `₹${(v / 1000).toFixed(0)}K`} />
              <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} fill="url(#gSalesRep)" name="Sales" />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Category-wise Inventory Value">
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={categoryDemand} margin={{ top: 0, right: 5, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="category" tick={{ fontSize: 9, fill: '#9ca3af' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="demand" radius={[4, 4, 0, 0]}>
                {categoryDemand.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Waste Analysis (Monthly)">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={wasteData} margin={{ top: 0, right: 5, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} />
              <YAxis tickFormatter={v => `₹${v}`} tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <Tooltip formatter={v => `₹${v}`} />
              <Bar dataKey="waste" fill="#fca5a5" radius={[4, 4, 0, 0]} name="Waste Loss" />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Supplier Performance">
          <div className="space-y-3 pt-1">
            {supplierPerf.map((s, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{s.supplier}</span>
                  <span className="text-gray-400">{s.reliability}% reliability</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all" style={{ width: `${s.reliability}%` }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
