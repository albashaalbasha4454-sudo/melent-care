import React, { useState, useEffect } from 'react';
import { Hospital, Plus, MapPin, Star, Phone, FileDown, ShieldCheck, Award, Users, ChevronRight, Activity } from 'lucide-react';
import { DataTable } from '../DataTable';
import { LocalStorageManager, MELENT_KEYS } from '../../services/localStorageManager';
import { PartnerHospital } from '../../types';
import { AddHospitalModal } from '../modals/AddHospitalModal';

export const HospitalSection: React.FC = () => {
  const [hospitals, setHospitals] = useState<PartnerHospital[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState<PartnerHospital | null>(null);

  useEffect(() => {
    setHospitals(LocalStorageManager.get(MELENT_KEYS.TRAVEL_HOSPITALS) || []);
  }, []);

  const handleAddOrUpdate = (hospital: PartnerHospital) => {
    const updated = editingHospital 
      ? hospitals.map(h => h.id === hospital.id ? hospital : h)
      : [hospital, ...hospitals];
    
    setHospitals(updated);
    LocalStorageManager.save(MELENT_KEYS.TRAVEL_HOSPITALS, updated);
    setEditingHospital(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف الشريك: "${name}" من الشبكة الدولية؟`)) {
      if (LocalStorageManager.softDelete(MELENT_KEYS.TRAVEL_HOSPITALS, id, 'HOSPITAL', name)) {
        setHospitals(prev => prev.filter(h => h.id !== id));
      }
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(hospitals, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "melent_hospital_network.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const columns = [
    { header: 'المستشفى الشريك', accessor: (h: PartnerHospital) => (
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-brand-navy/5 text-brand-navy rounded-[1.5rem] flex items-center justify-center shadow-sm border border-slate-100 group-hover:bg-brand-navy group-hover:text-white transition-all">
          <Hospital size={20} />
        </div>
        <div>
          <p className="font-black text-brand-navy tracking-tight">{h.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">{h.id}</span>
             {h.rating >= 4.5 && (
               <span className="text-[8px] font-black bg-brand-gold/10 text-brand-gold px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                 <Award size={10} /> Tier 1
               </span>
             )}
          </div>
        </div>
      </div>
    )},
    { header: 'الموقع الجغرافي', accessor: (h: PartnerHospital) => (
      <div className="flex items-center gap-2 text-slate-500">
        <MapPin size={14} className="text-brand-cyan" />
        <span className="text-sm font-bold">{h.location}</span>
      </div>
    )},
    { header: 'القدرات الطبية', accessor: (h: PartnerHospital) => (
      <div className="flex flex-wrap gap-1.5 max-w-xs">
        {h.specialties.slice(0, 3).map((s, i) => (
          <span key={i} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black text-brand-navy uppercase tracking-widest leading-none">
            {s}
          </span>
        ))}
        {h.specialties.length > 3 && (
          <span className="text-[9px] font-black text-slate-300 py-1 px-1">+ {h.specialties.length - 3} More</span>
        )}
      </div>
    )},
    { header: 'مؤشر الأداء (KPI)', accessor: (h: PartnerHospital) => (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 text-brand-gold font-black bg-brand-gold/5 px-2 py-1 rounded-lg">
          <Star size={12} fill="currentColor" />
          <span className="text-xs">{h.rating}</span>
        </div>
        <div className="flex items-center gap-2 text-brand-green">
           <Activity size={14} />
           <span className="text-[10px] font-black uppercase">98% Satisfied</span>
        </div>
      </div>
    )},
    { header: 'حالة العقد', accessor: (h: PartnerHospital) => (
      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm border ${
        h.contractStatus === 'Active' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-50 text-slate-400 border-slate-100'
      }`}>
        {h.contractStatus}
      </span>
    )},
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <Hospital className="text-red-500" size={24} />
              <h2 className="text-3xl font-black text-brand-navy tracking-tight uppercase">Hospital Network Matrix</h2>
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Manage Global Healthcare Infrastructure Partnerships</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={handleExport}
            className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-brand-navy shadow-sm transition-all hover:shadow-md"
            title="Export Network Topology"
          >
            <FileDown size={20} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-navy text-white px-8 py-5 rounded-2xl font-black text-xs shadow-2xl shadow-brand-navy/30 hover:bg-brand-green transition-all flex items-center gap-4 group uppercase tracking-[0.2em]"
          >
            <Plus size={20} className="text-brand-cyan group-hover:rotate-90 transition-transform" />
            Integrate New Partner
          </button>
        </div>
      </div>

      {/* Network Stats Card */}
      <div className="bg-brand-navy rounded-[3.5rem] p-10 text-white relative overflow-hidden flex flex-col md:flex-row items-center gap-10 shadow-2xl shadow-brand-navy/30">
         <div className="absolute top-0 right-0 w-96 h-96 bg-brand-cyan/10 rounded-full blur-[100px] -mr-48 -mt-48" />
         <div className="flex-1 space-y-6 relative z-10 text-center md:text-right">
            <h3 className="text-3xl font-black tracking-tight leading-tight">Global Infrastructure <span className="text-brand-cyan">Optimization</span></h3>
            <p className="text-brand-cyan/60 font-medium text-sm max-w-xl">
              Our hospital partners represent the core surgical nodes of Melent Care. Each facility is audited for international standards and specialized JCI accreditation.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-8 pt-4">
               <div>
                  <p className="text-[10px] font-black text-brand-cyan uppercase tracking-widest mb-1">Total Beds Reserved</p>
                  <p className="text-3xl font-black tracking-tighter">1,240+</p>
               </div>
               <div className="h-12 w-px bg-white/10 hidden md:block" />
               <div>
                  <p className="text-[10px] font-black text-brand-cyan uppercase tracking-widest mb-1">Average JCI Rating</p>
                  <p className="text-3xl font-black tracking-tighter">4.9/5</p>
               </div>
               <div className="h-12 w-px bg-white/10 hidden md:block" />
               <div>
                  <p className="text-[10px] font-black text-brand-cyan uppercase tracking-widest mb-1">Surgical Throughput</p>
                  <p className="text-3xl font-black tracking-tighter">84%</p>
               </div>
            </div>
         </div>
         <div className="w-full md:w-80 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 relative z-10">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-cyan mb-6">Network Health</h4>
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <ShieldCheck className="text-brand-cyan" size={18} />
                     <p className="text-xs font-bold">Standard Compliance</p>
                  </div>
                  <span className="text-xs font-black">100%</span>
               </div>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <Users className="text-brand-cyan" size={18} />
                     <p className="text-xs font-bold">Active Patient Nodes</p>
                  </div>
                  <span className="text-xs font-black">{hospitals.length * 4}</span>
               </div>
            </div>
            <button className="w-full mt-8 py-3 bg-white text-brand-navy rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-cyan transition-all">Audit Network</button>
         </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden p-2">
        <DataTable 
          data={hospitals} 
          columns={columns}
          onEdit={(h) => {
            setEditingHospital(h);
            setIsModalOpen(true);
          }}
          onDelete={(h) => handleDelete(h.id, h.name)}
          onView={(h) => console.log('View Node Portfolio', h)}
        />
      </div>

      <AddHospitalModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingHospital(null);
        }}
        onAdd={handleAddOrUpdate}
        hospitalToEdit={editingHospital}
      />
    </div>
  );
};

