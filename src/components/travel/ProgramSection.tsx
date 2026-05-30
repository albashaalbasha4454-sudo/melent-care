import React, { useState, useEffect } from 'react';
import { Stethoscope, Plus, FileDown, Activity, Clock, DollarSign, Award, ChevronRight, Info, Hospital } from 'lucide-react';
import { DataTable } from '../DataTable';
import { LocalStorageManager, MELENT_KEYS } from '../../services/localStorageManager';
import { MedicalProgram, PartnerHospital } from '../../types';

export const ProgramSection: React.FC = () => {
  const [programs, setPrograms] = useState<MedicalProgram[]>([]);
  const [hospitals, setHospitals] = useState<PartnerHospital[]>([]);

  useEffect(() => {
    setPrograms(LocalStorageManager.get(MELENT_KEYS.TRAVEL_PROGRAMS) || []);
    setHospitals(LocalStorageManager.get(MELENT_KEYS.TRAVEL_HOSPITALS) || []);
  }, []);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(programs, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "melent_medical_programs.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const columns = [
    { header: 'البرنامج الطبي', accessor: (p: MedicalProgram) => (
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-brand-green/5 text-brand-green rounded-2xl flex items-center justify-center font-black border border-brand-green/10 shadow-sm">
          <Activity size={24} />
        </div>
        <div>
          <p className="font-black text-brand-navy tracking-tight">{p.name}</p>
          <span className="text-[9px] font-black text-brand-cyan uppercase tracking-widest leading-none px-2 py-0.5 bg-brand-cyan/5 border border-brand-cyan/10 rounded-md">
            {p.category}
          </span>
        </div>
      </div>
    )},
    { header: 'المدة المقدرة', accessor: (p: MedicalProgram) => (
      <div className="flex items-center gap-2 text-slate-500">
        <Clock size={14} className="opacity-40" />
        <span className="text-sm font-bold">{p.durationDays} Days</span>
      </div>
    )},
    { header: 'التكلفة الأساسية', accessor: (p: MedicalProgram) => (
      <div className="flex items-center gap-1.5 font-black text-brand-navy tabular-nums">
        <DollarSign size={14} className="text-brand-green" />
        <span>{p.basePrice.toLocaleString()}</span>
      </div>
    )},
    { header: 'المستشفيات المتاحة', accessor: (p: MedicalProgram) => (
      <div className="flex -space-x-2 flex-row-reverse" dir="ltr">
        {p.hospitals.slice(0, 3).map((hId, i) => {
          const h = hospitals.find(hosp => hosp.id === hId);
          return (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-brand-navy shadow-sm overflow-hidden" title={h?.name}>
              {h ? h.name.charAt(0) : '?'}
            </div>
          );
        })}
        {p.hospitals.length > 3 && (
          <div className="w-8 h-8 rounded-full border-2 border-white bg-brand-navy text-white flex items-center justify-center text-[9px] font-black z-10 shadow-lg">
            +{p.hospitals.length - 3}
          </div>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <Stethoscope className="text-brand-green" size={24} />
              <h2 className="text-3xl font-black text-brand-navy tracking-tight uppercase">مركز تصميم البرامج</h2>
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">تصميم وتسعير ونشر باقات الرعاية الصحية المتخصصة</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={handleExport}
            className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-brand-navy shadow-sm transition-all"
          >
            <FileDown size={20} />
          </button>
          <button 
            onClick={() => {
              const name = prompt('أدخل اسم البرنامج الجديد:');
              if (name) {
                const newProgram: MedicalProgram = {
                  id: 'prog' + Date.now() + Math.random().toString(36).substring(2, 9),
                  name,
                  category: 'General',
                  durationDays: 7,
                  basePrice: 2000,
                  hospitals: [],
                  doctors: [],
                  description: 'برنامج طبي جديد',
                  includedServices: [],
                  excludedServices: []
                };
                const updated = [...programs, newProgram];
                setPrograms(updated);
                LocalStorageManager.save(MELENT_KEYS.TRAVEL_PROGRAMS, updated);
              }
            }}
            className="bg-brand-navy text-white px-8 py-5 rounded-2xl font-black text-xs shadow-2xl shadow-brand-navy/30 hover:bg-brand-green transition-all flex items-center gap-4 group uppercase tracking-[0.2em]"
          >
            <Plus size={20} className="text-brand-cyan group-hover:rotate-90 transition-transform" />
            إضافة برنامج جديد
          </button>
        </div>
      </div>

      {/* Program Summary Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-brand-navy p-8 rounded-[3rem] text-white flex items-center gap-6 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-cyan/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-brand-cyan relative z-10">
               <Award size={32} />
            </div>
            <div className="relative z-10">
               <p className="text-[10px] font-black text-brand-cyan uppercase tracking-widest mb-1">سلامة الكتالوج</p>
               <p className="text-2xl font-black">{programs.length} وحدة نشطة</p>
            </div>
         </div>

         <div className="bg-white p-8 rounded-[3rem] border border-slate-100 flex items-center gap-6 group">
            <div className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green group-hover:scale-110 transition-transform">
               <DollarSign size={32} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">قيمة المحفظة</p>
               <p className="text-2xl font-black text-brand-navy">${programs.reduce((acc, curr) => acc + curr.basePrice, 0).toLocaleString()}</p>
            </div>
         </div>

         <div className="bg-white p-8 rounded-[3rem] border border-slate-100 flex items-center gap-6 group">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
               <Hospital size={32} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">كثافة المستشفيات</p>
               <p className="text-2xl font-black text-brand-navy">{hospitals.length} عقدة مرتبطة</p>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden p-2">
        <DataTable 
          data={programs} 
          columns={columns}
          onEdit={() => {}}
          onDelete={() => {}}
          onView={() => {}}
        />
      </div>

      {/* Design Tip */}
      <div className="p-8 bg-brand-navy/5 border border-blue-100/30 rounded-[2.5rem] flex items-start gap-4">
         <Info className="text-brand-navy mt-1" size={20} />
         <div>
            <p className="text-[11px] font-black text-brand-navy uppercase tracking-widest mb-1">Architectural Insight</p>
            <p className="text-xs font-bold text-slate-500 leading-relaxed">
              Programs are the "Products" of our medical travel agency. Each program must specify exactly what is included (surgery, hotel, transfers) and which hospitals/doctors are authorized to perform it. Pricing should reflect the average market value in Turkey.
            </p>
         </div>
      </div>
    </div>
  );
};
