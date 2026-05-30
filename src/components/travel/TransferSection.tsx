import React, { useState, useEffect } from 'react';
import { Bus, Plus, FileDown, MapPin, Calendar, Clock, User, ShieldCheck, Map, ChevronRight, Activity } from 'lucide-react';
import { DataTable } from '../DataTable';
import { LocalStorageManager, MELENT_KEYS } from '../../services/localStorageManager';
import { TransferService, Patient } from '../../types';

export const TransferSection: React.FC = () => {
  const [transfers, setTransfers] = useState<TransferService[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    setTransfers(LocalStorageManager.get(MELENT_KEYS.TRAVEL_TRANSFERS) || []);
    setPatients(LocalStorageManager.get(MELENT_KEYS.TRAVEL_PATIENTS) || []);
  }, []);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transfers, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "melent_ground_ops_manifest.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const columns = [
    { header: 'المهمة / المريض', accessor: (t: TransferService) => {
      const p = patients.find(pat => pat.id === t.patientId);
      return (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center font-black border border-orange-100 shadow-sm">
             <Bus size={20} />
          </div>
          <div>
            <p className="font-black text-brand-navy tracking-tight">{p?.name || 'Unknown Request'}</p>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{t.id}</span>
               <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest leading-none px-1.5 py-0.5 bg-orange-50 rounded-md">
                 {t.vehicleType}
               </span>
            </div>
          </div>
        </div>
      );
    }},
    { header: 'المسار الأرضي', accessor: (t: TransferService) => (
      <div className="flex flex-col gap-1">
         <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="text-xs font-bold text-slate-400 capitalize">{t.pickupLocation}</span>
         </div>
         <div className="h-4 border-r-2 border-slate-100 mr-[3px]" />
         <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
            <span className="text-xs font-black text-brand-navy capitalize">{t.dropoffLocation}</span>
         </div>
      </div>
    )},
    { header: 'التوقيت التشغيلي', accessor: (t: TransferService) => (
      <div className="flex flex-col gap-1">
         <div className="flex items-center gap-2 text-slate-400">
            <Calendar size={12} />
            <span className="text-[11px] font-black tabular-nums">{new Date(t.date).toLocaleDateString()}</span>
         </div>
         <div className="flex items-center gap-2 text-brand-navy">
            <Clock size={12} />
            <span className="text-[11px] font-black tabular-nums">{t.time || 'TBA'}</span>
         </div>
      </div>
    )},
    { header: 'الخدمة والسائق', accessor: (t: TransferService) => (
       <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
             <User size={14} />
          </div>
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Global Fleet Authorized</span>
       </div>
    )},
    { header: 'الحالة', accessor: (t: TransferService) => (
      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm border ${
        t.status === 'Completed' ? 'bg-green-50 text-green-600 border-green-100' :
        t.status === 'Scheduled' ? 'bg-blue-50 text-blue-600 border-blue-100' :
        'bg-slate-50 text-slate-400 border-slate-100'
      }`}>
        {t.status}
      </span>
    )},
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <Bus className="text-orange-500" size={24} />
              <h2 className="text-3xl font-black text-brand-navy tracking-tight uppercase">قيادة الحركة البرية</h2>
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">تنسيق الأسطول اللحظي وتدفق العمليات اللوجستية</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={handleExport}
            className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-brand-navy shadow-sm transition-all hover:shadow-md"
            title="تصدير بيان الأسطول"
          >
            <FileDown size={20} />
          </button>
          <button 
            onClick={() => {
              const driver = prompt('أدخل اسم السائق الجديد:');
              if (driver) {
                const newTransfer: TransferService = {
                  id: 'trn' + Date.now() + Math.random().toString(36).substring(2, 9),
                  patientId: patients[0]?.id || '',
                  patientName: patients[0]?.name || 'Unknown Patient',
                  type: 'Airport-Hotel',
                  driverName: driver,
                  driverPhone: '+90 555 000 0000',
                  plateNumber: '34 MEL ' + Math.floor(100 + Math.random() * 899),
                  pickupLocation: 'مطار اسطنبول',
                  dropoffLocation: 'فندق الشيراتون',
                  date: new Date().toISOString().split('T')[0],
                  time: '11:00 AM',
                  pickupTime: '11:00 AM',
                  status: 'Scheduled',
                  vehicleType: 'Luxury Van'
                };
                const updated = [...transfers, newTransfer];
                setTransfers(updated);
                LocalStorageManager.save(MELENT_KEYS.TRAVEL_TRANSFERS, updated);
              }
            }}
            className="bg-brand-navy text-white px-8 py-5 rounded-2xl font-black text-xs shadow-2xl shadow-brand-navy/30 hover:bg-brand-green transition-all flex items-center gap-4 group uppercase tracking-[0.2em]"
          >
            <Plus size={20} className="text-brand-cyan group-hover:rotate-90 transition-transform" />
            إرسال وحدة جديدة
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden p-2">
        <DataTable 
          data={transfers} 
          columns={columns}
          onEdit={() => {}}
          onDelete={() => {}}
          onView={(t) => console.log('View Route Matrix', t)}
        />
      </div>

      {/* Fleet Efficiency Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white border border-slate-100 p-8 rounded-[3rem] flex items-center gap-6 group hover:border-brand-cyan transition-all cursor-default">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
               <Map size={32} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">كفاءة المسار</p>
               <p className="text-2xl font-black text-brand-navy">94.2%</p>
            </div>
         </div>

         <div className="bg-white border border-slate-100 p-8 rounded-[3rem] flex items-center gap-6 group hover:border-brand-green transition-all cursor-default">
            <div className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green group-hover:scale-110 transition-transform">
               <ShieldCheck size={32} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">بروتوكولات السلامة</p>
               <p className="text-2xl font-black text-brand-navy">معتمد</p>
            </div>
         </div>

         <div className="bg-brand-navy p-8 rounded-[3.5rem] text-white relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-32 h-32 bg-brand-cyan/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            <div className="relative z-10">
               <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase text-brand-cyan tracking-widest">التدفق اللحظي</span>
                  <Activity size={18} className="text-brand-cyan animate-pulse" />
               </div>
               <p className="text-3xl font-black">{transfers.length} مهمة نشطة</p>
            </div>
         </div>
      </div>
    </div>
  );
};
