import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  Plane, 
  MapPin, 
  Calendar, 
  Bus, 
  Hotel, 
  Hospital, 
  FileText, 
  BarChart3,
  LogOut,
  Search,
  Bell,
  Settings,
  Menu,
  X,
  User,
  DollarSign,
  Activity
} from 'lucide-react';
import { TravelView, PatientStatus } from '../types';
import { PatientSection } from './travel/PatientSection';
import { HospitalSection } from './travel/HospitalSection';
import { ProgramSection } from './travel/ProgramSection';
import { DoctorSection } from './travel/DoctorSection';
import { HotelSection } from './travel/HotelSection';
import { FlightSection } from './travel/FlightSection';
import { TransferSection } from './travel/TransferSection';
import { TravelFinanceSection } from './travel/TravelFinanceSection';
import { TravelReportsSection } from './travel/TravelReportsSection';
import { TravelReservationsSection } from './travel/TravelReservationsSection';
import { SettingsSection } from './SettingsSection';
import { LocalStorageManager, MELENT_KEYS } from '../services/localStorageManager';
import { Logo } from './Logo';
import { mockPatients, mockHospitals } from '../data';

// New Sections (To be implemented)
const PlaceholderSection: React.FC<{ title: string }> = ({ title }) => (
  <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 min-h-[500px] flex items-center justify-center p-12 text-center">
    <div>
      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-6">
        <LayoutDashboard size={48} />
      </div>
      <h3 className="text-xl font-black text-brand-navy mb-2 tracking-tighter">وحدة {title} نشطة</h3>
      <p className="text-slate-400 font-bold max-w-sm mx-auto text-sm italic">
        هذه الوحدة قيد التطوير لتوفير إدارة كاملة لـ {title}.
      </p>
    </div>
  </div>
);

export const TravelDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<TravelView>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Initialize Data
  useEffect(() => {
    const storedPatients = LocalStorageManager.get(MELENT_KEYS.TRAVEL_PATIENTS);
    const storedHospitals = LocalStorageManager.get(MELENT_KEYS.TRAVEL_HOSPITALS); 

    if (!storedPatients || storedPatients.length === 0) {
      LocalStorageManager.save(MELENT_KEYS.TRAVEL_PATIENTS, mockPatients);
    }
    
    if (!storedHospitals || storedHospitals.length === 0) {
      LocalStorageManager.save(MELENT_KEYS.TRAVEL_HOSPITALS, mockHospitals);
    }

    // Initialize all other keys if empty
    const ensureKey = (key: string, data: any = []) => {
      if (!LocalStorageManager.get(key)) {
        LocalStorageManager.save(key, data);
      }
    };

    ensureKey(MELENT_KEYS.TRAVEL_DOCTORS);
    ensureKey(MELENT_KEYS.TRAVEL_HOTELS);
    ensureKey(MELENT_KEYS.TRAVEL_FLIGHTS);
    ensureKey(MELENT_KEYS.TRAVEL_TRANSFERS);
    ensureKey(MELENT_KEYS.TRAVEL_PROGRAMS, LocalStorageManager.get(MELENT_KEYS.TRAVEL_PROGRAMS) || []);
  }, []);

  const menuItems: { id: TravelView; icon: any; label: string; color: string }[] = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'لوحة التحكم', color: 'text-brand-cyan' },
    { id: 'patients', icon: Users, label: 'إدارة المرضى', color: 'text-blue-500' },
    { id: 'programs', icon: Stethoscope, label: 'البرامج الطبية', color: 'text-brand-green' },
    { id: 'hospitals', icon: Hospital, label: 'المستشفيات', color: 'text-red-500' },
    { id: 'doctors', icon: User, label: 'الأطباء', color: 'text-purple-500' },
    { id: 'hotels', icon: Hotel, label: 'الفنادق', color: 'text-amber-500' },
    { id: 'flights', icon: Plane, label: 'الرحلات الجوية', color: 'text-cyan-500' },
    { id: 'transfers', icon: Bus, label: 'النقل والترانسفير', color: 'text-orange-500' },
    { id: 'reservations', icon: Calendar, label: 'جدول الحجوزات', color: 'text-indigo-500' },
    { id: 'finance', icon: FileText, label: 'الحسابات والفواتير', color: 'text-emerald-500' },
    { id: 'reports', icon: BarChart3, label: 'التقارير الذكية', color: 'text-rose-500' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <OperationalPulse />;
      case 'patients':
        return <PatientSection />;
      case 'hospitals':
        return <HospitalSection />;
      case 'programs':
        return <ProgramSection />;
      case 'doctors':
        return <DoctorSection />;
      case 'hotels':
        return <HotelSection />;
      case 'flights':
        return <FlightSection />;
      case 'transfers':
        return <TransferSection />;
      case 'finance':
        return <TravelFinanceSection />;
      case 'reports':
        return <TravelReportsSection />;
      case 'reservations':
        return <TravelReservationsSection />;
      default:
        const item = menuItems.find(i => i.id === activeTab);
        return <PlaceholderSection title={item?.label || activeTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.div 
            initial={{ x: 280 }}
            animate={{ x: 0 }}
            exit={{ x: 280 }}
            className="w-72 bg-white h-screen border-l border-slate-100 flex flex-col relative z-50 shadow-2xl"
          >
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-3 mb-10">
                <Logo className="h-10" />
                <div>
                   <h2 className="text-xl font-black text-brand-navy leading-none">MELENT</h2>
                   <p className="text-[10px] font-black text-brand-green uppercase tracking-[0.2em] mt-1">Medical Travel</p>
                </div>
              </div>

              <div className="space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-black text-[11px] uppercase tracking-wider ${
                      activeTab === item.id 
                        ? 'bg-brand-navy text-white shadow-xl shadow-brand-navy/20' 
                        : 'text-slate-400 hover:bg-slate-50 hover:text-brand-navy'
                    }`}
                  >
                    <item.icon size={18} className={activeTab === item.id ? item.color : 'opacity-40'} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto p-8 pt-0 space-y-4">
               <button 
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-red-500 bg-red-50/50 hover:bg-red-50 transition-all font-black text-[11px] uppercase tracking-widest justify-center"
               >
                 <LogOut size={18} />
                 <span>تسجيل الخروج</span>
               </button>

               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-navy flex items-center justify-center text-brand-cyan shadow-lg">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-brand-navy uppercase tracking-tighter">Travel Ops Director</p>
                    <p className="text-[9px] font-bold text-slate-400">ops@melent.care</p>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-brand-navy transition-all"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="relative w-96 hidden lg:block">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                placeholder="Search patient records, PNR, flight status..." 
                className="w-full bg-slate-50 border-transparent rounded-xl py-2.5 pr-12 pl-4 text-xs font-black uppercase tracking-widest focus:bg-white focus:border-brand-navy/10 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Ops Online</span>
             </div>
             <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-brand-navy relative">
                <Bell size={20} />
                <span className="absolute top-2.5 left-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
             </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

const OperationalPulse: React.FC = () => {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p className="text-[10px] font-black uppercase text-brand-green tracking-[0.4em] mb-2">Operational Command Center</p>
          <div className="flex items-center gap-4">
             <h2 className="text-4xl font-black text-brand-navy tracking-tight uppercase">TRAVEL OPS PULSE</h2>
             <div className="px-3 py-1 bg-brand-cyan/20 border border-brand-cyan/30 rounded-full text-[9px] font-black text-brand-cyan animate-pulse">
                REAL-TIME MONITORING
             </div>
          </div>
        </div>
        <div className="flex gap-4">
           <div className="bg-white p-5 rounded-[1.8rem] border border-slate-100 shadow-sm flex items-center gap-4">
             <div className="w-10 h-10 bg-brand-green/10 rounded-xl flex items-center justify-center text-brand-green">
                <Activity size={20} />
             </div>
             <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Health System</p>
                <p className="text-xl font-black text-brand-navy tracking-tighter uppercase whitespace-nowrap">Node 01 Active</p>
             </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className="lg:col-span-3 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-brand-navy p-8 rounded-[3rem] text-white shadow-2xl shadow-brand-navy/30 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/20 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                  <p className="text-[10px] font-black text-brand-cyan uppercase tracking-widest mb-4">Total Revenue yield</p>
                  <p className="text-4xl font-black tabular-nums tracking-tighter mb-2">$842k</p>
                  <p className="text-[10px] font-black text-brand-green flex items-center gap-1">+14.2% Growth Index</p>
               </div>

               <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between group">
                  <div>
                    <Users size={24} className="text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Medical Leads</p>
                    <p className="text-3xl font-black text-brand-navy tracking-tighter">142</p>
                  </div>
                  <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden mt-4">
                    <div className="h-full bg-blue-500" style={{ width: '68%' }} />
                  </div>
               </div>

               <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between group">
                  <div>
                    <Hospital size={24} className="text-red-500 mb-4 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Operating Network</p>
                    <p className="text-3xl font-black text-brand-navy tracking-tighter">42 Nodes</p>
                  </div>
                  <div className="flex gap-1 mt-4">
                     {[1,2,3,4,5].map(i => <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= 4 ? 'bg-red-500' : 'bg-slate-100'}`} />)}
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white rounded-[3.5rem] border border-slate-100 p-10 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-lg font-black text-brand-navy tracking-tight uppercase">Operational Pipeline</h3>
                     <span className="text-[9px] font-black text-brand-cyan tracking-widest uppercase">Live Metrics</span>
                  </div>
                  <div className="space-y-6">
                     {[
                       { stage: 'Inquiry Matrix', val: 45, color: 'bg-brand-navy' },
                       { stage: 'Visa Deployment', val: 24, color: 'bg-brand-cyan' },
                       { stage: 'Surgical Block', val: 18, color: 'bg-brand-green' },
                     ].map((item, i) => (
                       <div key={i} className="flex items-center gap-6">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest w-24">{item.stage}</span>
                          <div className="flex-1 h-3 bg-slate-50 rounded-full overflow-hidden">
                             <motion.div initial={{ width: 0 }} animate={{ width: `${item.val * 2}%` }} className={`h-full ${item.color}`} />
                          </div>
                          <span className="text-xs font-black tabular-nums w-8 text-right underline">{item.val}</span>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="bg-slate-50 rounded-[3.5rem] border border-slate-100 p-10 flex flex-col justify-between">
                  <div>
                     <h3 className="text-lg font-black text-brand-navy tracking-tight uppercase mb-2">Strategic Insight</h3>
                     <p className="text-xs font-bold text-slate-400 leading-relaxed italic">
                       "Focus on Q3 optimization for the Riyadh corridor. Oncology case yield is increasing by 12% MoM."
                     </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-8">
                     <div className="bg-white p-5 rounded-[2rem] border border-slate-200">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Yield / Case</p>
                        <p className="text-xl font-black text-brand-navy">$8,400</p>
                     </div>
                     <div className="bg-white p-5 rounded-[2rem] border border-slate-200">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Satisfaction</p>
                        <p className="text-xl font-black text-brand-green">98.4%</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Sidebar Alerts */}
         <div className="space-y-8">
            <div className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-sm">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xs font-black text-brand-navy uppercase tracking-widest">Active Alerts</h3>
                  <Bell className="text-brand-navy animate-bounce" size={18} />
               </div>
               <div className="space-y-4">
                  <div className="p-5 bg-orange-50 border border-orange-100 rounded-3xl group cursor-pointer hover:bg-orange-100 transition-all">
                     <div className="flex items-center gap-3 mb-2">
                        <Plane size={16} className="text-orange-600" />
                        <span className="text-[10px] font-black text-orange-600 uppercase">Flight Delay Logged</span>
                     </div>
                     <p className="text-xs font-black text-brand-navy leading-tight group-hover:underline transition-all">Patient Nasser K. flight (TK1924) delayed 3 hours.</p>
                  </div>

                  <div className="p-5 bg-red-50 border border-red-100 rounded-3xl group cursor-pointer hover:bg-red-100 transition-all">
                     <div className="flex items-center gap-3 mb-2">
                        <Hospital size={16} className="text-red-600" />
                        <span className="text-[10px] font-black text-red-600 uppercase">Conflict Detected</span>
                     </div>
                     <p className="text-xs font-black text-brand-navy leading-tight group-hover:underline transition-all">Memorial OT Schedule conflict for Case #TK-924.</p>
                  </div>
               </div>
               <button className="w-full mt-8 py-4 border-2 border-slate-50 hover:bg-slate-50 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-navy transition-all">
                  Dismiss All Notifications
               </button>
            </div>

            {/* Quick Action Matrix */}
            <div className="bg-brand-navy p-8 rounded-[3.5rem] text-white space-y-6 shadow-2xl shadow-brand-navy/30">
               <h4 className="text-[10px] font-black text-brand-cyan uppercase tracking-[0.3em]">Macro Ops Dispatch</h4>
               <div className="grid grid-cols-1 gap-4">
                  <button className="w-full py-4 bg-white/10 hover:bg-white text-white hover:text-brand-navy rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                    Initiate Case Audit
                  </button>
                  <button className="w-full py-4 bg-white/10 hover:bg-white text-white hover:text-brand-navy rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                    Global Network Sync
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
