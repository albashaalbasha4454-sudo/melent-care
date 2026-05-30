import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Hospital, Stethoscope, DollarSign, PieChart, Info, Download, Globe, Target, Map } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell, PieChart as RechartsPie, Pie
} from 'recharts';
import { LocalStorageManager, MELENT_KEYS } from '../../services/localStorageManager';

const ChartWrapper: React.FC<{ children: React.ReactNode; height: number | string }> = ({ children, height }) => {
  const [isReady, setIsReady] = React.useState(false);
  React.useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ height, width: '100%', minWidth: 0, overflow: 'hidden' }}>
      {isReady && children}
    </div>
  );
};
import { Patient, TravelInvoice, PartnerHospital, MedicalProgram } from '../../types';

export const TravelReportsSection: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [invoices, setInvoices] = useState<TravelInvoice[]>([]);
  const [hospitals, setHospitals] = useState<PartnerHospital[]>([]);
  const [programs, setPrograms] = useState<MedicalProgram[]>([]);

  useEffect(() => {
    setPatients(LocalStorageManager.get(MELENT_KEYS.TRAVEL_PATIENTS) || []);
    setInvoices(LocalStorageManager.get(MELENT_KEYS.TRAVEL_INVOICES) || []);
    setHospitals(LocalStorageManager.get(MELENT_KEYS.TRAVEL_HOSPITALS) || []);
    setPrograms(LocalStorageManager.get(MELENT_KEYS.TRAVEL_PROGRAMS) || []);
  }, []);

  // Intelligence Processing
  const revenueData = [
    { month: 'Jan', revenue: 45000, target: 40000 },
    { month: 'Feb', revenue: 52000, target: 40000 },
    { month: 'Mar', revenue: 48000, target: 40000 },
    { month: 'Apr', revenue: 61000, target: 50000 },
    { month: 'May', revenue: 75000, target: 50000 },
  ];

  const countryData = [
    { country: 'Saudi Arabia', value: 45 },
    { country: 'Kuwait', value: 25 },
    { country: 'UAE', value: 15 },
    { country: 'Qatar', value: 10 },
    { country: 'Others', value: 5 },
  ];

  const categoryData = [
    { name: 'Oncology', patients: 120, revenue: 450000 },
    { name: 'Cardiology', patients: 85, revenue: 320000 },
    { name: 'Plastic', patients: 240, revenue: 580000 },
    { name: 'Orthopedic', patients: 65, revenue: 190000 },
  ];

  const COLORS = ['#083344', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="text-brand-gold" size={24} />
              <h2 className="text-3xl font-black text-brand-navy tracking-tight uppercase">Melent Intelligence Portfolio</h2>
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Strategic Data Visualization & Performance Audit</p>
        </div>
        <button className="bg-brand-navy text-white px-8 py-5 rounded-2xl font-black text-xs shadow-2xl shadow-brand-navy/30 hover:bg-brand-green transition-all flex items-center gap-4 group uppercase tracking-[0.2em]">
          <Download size={20} className="text-brand-cyan transition-transform group-hover:-translate-y-1" />
          Export Intelligence Brief
        </button>
      </div>

      {/* High-Level Pulse */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'Patient Conversion', value: '68.4%', icon: Target, color: 'text-brand-cyan', bg: 'bg-brand-cyan/10' },
           { label: 'Network Throughput', value: '92.1%', icon: Globe, color: 'text-emerald-500', bg: 'bg-emerald-50' },
           { label: 'Medical ARPU', value: '$8,420', icon: DollarSign, color: 'text-brand-gold', bg: 'bg-brand-gold/10' },
           { label: 'Strategic Growth', value: '+24.5%', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50' },
         ].map((stat, i) => (
           <div key={i} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm group hover:scale-105 transition-all">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6`}>
                 <stat.icon size={24} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-brand-navy">{stat.value}</p>
           </div>
         ))}
      </div>

      {/* Main Charts Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* Monthly Revenue Matrix */}
         <div className="lg:col-span-2 bg-white rounded-[3.5rem] border border-slate-100 p-10 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-xl font-black text-brand-navy tracking-tight">Revenue Dynamics</h3>
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Monthly Yield vs Targets</p>
               </div>
               <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-brand-cyan" />
                     <span className="text-[9px] font-black uppercase text-slate-400">Actual Revenue</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-slate-100" />
                     <span className="text-[9px] font-black uppercase text-slate-400">Strategic Target</span>
                  </div>
               </div>
            </div>
            
            <ChartWrapper height={350}>
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8', tabularNums: true}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
                      cursor={{ stroke: '#06b6d4', strokeWidth: 2 }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                    <Area type="monotone" dataKey="target" stroke="#e2e8f0" strokeDasharray="5 5" fill="transparent" />
                  </AreaChart>
               </ResponsiveContainer>
            </ChartWrapper>
         </div>

         {/* Demographic Topology */}
         <div className="bg-brand-navy rounded-[3.5rem] p-10 text-white shadow-2xl shadow-brand-navy/30 relative flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/20 rounded-full blur-[100px] -mr-32 -mt-32" />
            
            <div className="relative z-10">
               <h3 className="text-xl font-black tracking-tight mb-1">Global Topology</h3>
               <p className="text-[10px] font-black text-brand-cyan uppercase tracking-widest opacity-60">Lead Source Distribution</p>
            </div>

            <ChartWrapper height={250}>
               <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={countryData}
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {countryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
               </ResponsiveContainer>
            </ChartWrapper>

            <div className="relative z-10 space-y-4">
               {countryData.slice(0, 3).map((item, i) => (
                 <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                       <span className="text-[10px] font-black uppercase tracking-widest">{item.country}</span>
                    </div>
                    <span className="text-xs font-black">{item.value}%</span>
                 </div>
               ))}
               <button className="w-full mt-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                  View Full Geo Matrix
                  <Map size={14} />
               </button>
            </div>
         </div>

         {/* Category Performance Matrix */}
         <div className="lg:col-span-3 bg-white rounded-[3.5rem] border border-slate-100 p-10 shadow-sm">
            <div className="flex items-center justify-between mb-10">
               <div>
                  <h3 className="text-xl font-black text-brand-navy tracking-tight">Clinical Vertical Performance</h3>
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Macro Analysis of Medical Departments</p>
               </div>
               <Info className="text-slate-200" size={24} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {categoryData.map((cat, i) => (
                 <div key={i} className="space-y-6">
                    <div className="flex items-center justify-between">
                       <p className="text-[11px] font-black text-brand-navy uppercase tracking-widest">{cat.name}</p>
                       <span className="text-[10px] font-black text-emerald-500 tabular-nums">+{i * 4 + 10}% Growth</span>
                    </div>
                    <div className="space-y-3">
                       <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Throughput</span>
                          <span className="text-xs font-black text-brand-navy">{cat.patients} Cases</span>
                       </div>
                       <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Gross Yield</span>
                          <span className="text-xs font-black text-brand-navy">${(cat.revenue / 1000).toFixed(0)}k</span>
                       </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-brand-navy" style={{ width: `${(cat.patients / 240) * 100}%` }} />
                    </div>
                    <button className="w-full py-3 border-2 border-slate-50 hover:border-brand-cyan/20 rounded-xl transition-all text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-navy">
                       Drill Down
                    </button>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};
