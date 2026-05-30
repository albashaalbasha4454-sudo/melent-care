import React, { useState, useEffect } from 'react';
import { User, Plus, FileDown, Award, Star, Activity, Briefcase, GraduationCap, Hospital, HeartPulse } from 'lucide-react';
import { DataTable } from '../DataTable';
import { LocalStorageManager, MELENT_KEYS } from '../../services/localStorageManager';
import { Doctor, PartnerHospital } from '../../types';

export const DoctorSection: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<PartnerHospital[]>([]);

  useEffect(() => {
    setDoctors(LocalStorageManager.get(MELENT_KEYS.TRAVEL_DOCTORS) || []);
    setHospitals(LocalStorageManager.get(MELENT_KEYS.TRAVEL_HOSPITALS) || []);
  }, []);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(doctors, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "melent_specialist_roster.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const columns = [
    { header: 'الاستشاري / الطبيب', accessor: (d: Doctor) => (
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center font-black border border-purple-100 shadow-sm overflow-hidden group-hover:scale-110 transition-transform">
           {d.name.includes('Dr.') ? d.name.split(' ')[1].charAt(0) : d.name.charAt(0)}
        </div>
        <div>
          <p className="font-black text-brand-navy tracking-tight">{d.name}</p>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest leading-none px-2 py-0.5 bg-purple-50/50 border border-purple-100/30 rounded-md">
               {d.specialty}
             </span>
          </div>
        </div>
      </div>
    )},
    { header: 'المستشفى الأكاديمي', accessor: (d: Doctor) => {
      const h = hospitals.find(hosp => hosp.id === d.hospitalId);
      return (
        <div className="flex items-center gap-2 text-slate-500">
          <Hospital size={14} className="text-brand-cyan" />
          <span className="text-sm font-bold">{h?.name || "Independent"}</span>
        </div>
      );
    }},
    { header: 'الخبرة والدرجة', accessor: (d: Doctor) => (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 font-bold text-slate-500">
           <GraduationCap size={14} className="text-slate-300" />
           <span className="text-xs">{d.experienceYears} Years Exp.</span>
        </div>
      </div>
    )},
    { header: 'مؤشر الكفاءة', accessor: (d: Doctor) => (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-brand-gold font-black bg-brand-gold/5 px-2 py-1 rounded-lg">
          <Star size={12} fill="currentColor" />
          <span className="text-xs">{d.rating}</span>
        </div>
        <div className="flex items-center gap-2 text-brand-green">
           <HeartPulse size={14} />
           <span className="text-[10px] font-black uppercase">Elite Status</span>
        </div>
      </div>
    )},
    { header: 'Status', accessor: (d: Doctor) => (
      <span className="px-4 py-1.5 rounded-xl bg-slate-50 text-slate-400 border border-slate-100 text-[9px] font-black uppercase tracking-[0.2em] shadow-sm">
        Authorized
      </span>
    )},
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <User className="text-purple-500" size={24} />
              <h2 className="text-3xl font-black text-brand-navy tracking-tight uppercase">قائمة الاستشاريين</h2>
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">الاستشارات الطبية المتخصصة والتنسيق الجراحي</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={handleExport}
            className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-brand-navy shadow-sm transition-all hover:shadow-md"
          >
            <FileDown size={20} />
          </button>
          <button 
            onClick={() => {
              const name = prompt('أدخل اسم الطبيب الجديد:');
              if (name) {
                const newDoc: Doctor = {
                  id: 'doc' + Date.now(),
                  name,
                  specialty: 'استشاري JCI',
                  experienceYears: 10,
                  hospitalId: hospitals[0]?.id || '',
                  rating: 5.0,
                  bio: 'طبيب مختص ذو خبرة عالية',
                  availability: 'Full-time',
                  contact: '+90 000 000 0000',
                  education: 'دكتوراه في العلوم الطبية',
                  languages: ['English', 'Arabic', 'Turkish']
                };
                const updated = [...doctors, newDoc];
                setDoctors(updated);
                LocalStorageManager.save(MELENT_KEYS.TRAVEL_DOCTORS, updated);
              }
            }}
            className="bg-brand-navy text-white px-8 py-5 rounded-2xl font-black text-xs shadow-2xl shadow-brand-navy/30 hover:bg-brand-green transition-all flex items-center gap-4 group uppercase tracking-[0.2em]"
          >
            <Plus size={20} className="text-brand-cyan group-hover:rotate-90 transition-transform" />
            توظيف استشاري جديد
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden p-2">
        <DataTable 
          data={doctors} 
          columns={columns}
          onEdit={() => {}}
          onDelete={() => {}}
          onView={(d) => console.log('View Surgeon Portfolio', d)}
        />
      </div>

      {/* Roster Optimization Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-purple-600 rounded-[3rem] p-8 text-white relative overflow-hidden flex flex-col justify-between min-h-[240px] shadow-2xl shadow-purple-600/20">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10 flex items-center gap-4">
               <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                 <Briefcase size={28} />
               </div>
               <div>
                 <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Active Surgical Slots</p>
                 <p className="text-3xl font-black">24 Scheduled</p>
               </div>
            </div>
            <div className="relative z-10 p-6 bg-black/10 rounded-[2rem] border border-white/10">
               <p className="text-xs font-bold text-white/80 leading-relaxed italic">
                 "تضمن قائمة الاستشاريين لدينا حصول كل مريض في ميلنت على رعاية صحية فائقة تحت إشراف نخبة من الأطباء العموميين المختصين."
               </p>
            </div>
         </div>

         <div className="bg-white rounded-[3rem] border border-slate-100 p-8 flex flex-col justify-between shadow-sm">
            <h4 className="text-[11px] font-black text-brand-navy uppercase tracking-widest mb-6">توزيع الخبرات الطبية</h4>
            <div className="space-y-4">
               {[
                 { field: 'Plastic Surgery', value: 45 },
                 { field: 'Dental Implantology', value: 30 },
                 { field: 'Orthopedics', value: 15 },
                 { field: 'Cardiology', value: 10 },
               ].map((item, i) => (
                 <div key={i} className="flex items-center gap-4">
                   <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: `${item.value}%` }} />
                   </div>
                   <div className="w-32 text-right">
                      <p className="text-[10px] font-black text-brand-navy uppercase tabular-nums">{item.field}</p>
                   </div>
                 </div>
               ))}
            </div>
            <button 
              onClick={() => alert('بدأ تحميل تحليلات الاستشاريين...')}
              className="w-full mt-8 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
            >
               تحميل تحليلات الاستشاريين
            </button>
         </div>
      </div>
    </div>
  );
};
