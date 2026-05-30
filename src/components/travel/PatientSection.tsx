import React, { useState, useEffect } from 'react';
import { Users, Plus, MapPin, Calendar, FileText, FileDown, ArrowRight, ChevronRight } from 'lucide-react';
import { DataTable } from '../DataTable';
import { LocalStorageManager, MELENT_KEYS } from '../../services/localStorageManager';
import { Patient, PartnerHospital, MedicalProgram, Doctor, Hotel } from '../../types';
import { AddPatientModal } from '../modals/AddPatientModal';
import { PatientProfile } from './PatientProfile';

export const PatientSection: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // For Context in Profile
  const [hospitals, setHospitals] = useState<PartnerHospital[]>([]);
  const [programs, setPrograms] = useState<MedicalProgram[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);

  useEffect(() => {
    setPatients(LocalStorageManager.get(MELENT_KEYS.TRAVEL_PATIENTS) || []);
    setHospitals(LocalStorageManager.get(MELENT_KEYS.TRAVEL_HOSPITALS) || []);
    setPrograms(LocalStorageManager.get(MELENT_KEYS.TRAVEL_PROGRAMS) || []);
    setDoctors(LocalStorageManager.get(MELENT_KEYS.TRAVEL_DOCTORS) || []);
    setHotels(LocalStorageManager.get(MELENT_KEYS.TRAVEL_HOTELS) || []);
  }, []);

  const handleAddOrUpdate = (patient: Patient) => {
    const updated = editingPatient 
      ? patients.map(p => p.id === patient.id ? patient : p)
      : [patient, ...patients];
    
    setPatients(updated);
    LocalStorageManager.save(MELENT_KEYS.TRAVEL_PATIENTS, updated);
    setEditingPatient(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من نقل ملف المريض: "${name}" إلى الأرشيف المتقدم؟`)) {
      if (LocalStorageManager.softDelete(MELENT_KEYS.TRAVEL_PATIENTS, id, 'PATIENT', name)) {
        setPatients(prev => prev.filter(p => p.id !== id));
      }
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(patients, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "melent_global_patients.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const columns = [
    { header: 'المريض الاستراتيجي', accessor: (p: Patient) => (
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-brand-navy/5 text-brand-navy rounded-2xl flex items-center justify-center font-black shadow-sm group-hover:bg-brand-navy group-hover:text-white transition-all">
          {p.name.charAt(0)}
        </div>
        <div>
          <p className="font-black text-brand-navy tracking-tight">{p.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md">{p.id}</span>
            <span className="text-[9px] font-bold text-brand-cyan uppercase tracking-tighter">{p.nationality || p.country}</span>
          </div>
        </div>
      </div>
    ), exportValue: (p: Patient) => p.name },
    { header: 'حالة العلاج', accessor: (p: Patient) => (
      <div className="flex flex-col">
        <span className="text-xs font-bold text-brand-navy mb-0.5">{p.condition}</span>
        <div className="flex items-center gap-2">
           <div className={`w-1.5 h-1.5 rounded-full ${p.assignedHospitalId ? 'bg-brand-green' : 'bg-slate-200'}`} />
           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
             {p.assignedHospitalId ? 'تم تحديد المستشفى' : 'بانتظار التحليل'}
           </span>
        </div>
      </div>
    ), exportValue: (p: Patient) => p.condition },
    { header: 'التقدم العملياتي', accessor: (p: Patient) => (
      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm border ${
        p.status === 'Active' ? 'bg-green-50 text-green-600 border-green-100' : 
        p.status === 'Confirmed' ? 'bg-brand-cyan text-white border-transparent' :
        p.status === 'Inquiry' ? 'bg-amber-50 text-amber-600 border-amber-100' :
        'bg-slate-50 text-slate-400 border-slate-100'
      }`}>
        {p.status === 'Active' ? 'نشط' : 
         p.status === 'Confirmed' ? 'مؤكد' : 
         p.status === 'Inquiry' ? 'استفسار' : p.status}
      </span>
    ), exportValue: (p: Patient) => p.status },
    { header: 'آخر تحديث', accessor: (p: Patient) => (
      <div className="flex items-center gap-2 text-slate-400">
        <Calendar size={12} className="opacity-40" />
        <span className="text-[11px] font-bold tabular-nums italic">{new Date(p.lastContact).toLocaleDateString()}</span>
      </div>
    ), exportValue: (p: Patient) => new Date(p.lastContact).toLocaleDateString() },
  ];

  if (selectedPatient) {
    const assignedHospital = hospitals.find(h => h.id === selectedPatient.assignedHospitalId);
    const assignedProgram = programs.find(p => p.id === selectedPatient.assignedProgramId);
    const assignedDoctor = doctors.find(d => d.id === selectedPatient.assignedDoctorId);
    const assignedHotel = hotels.find(h => h.id === selectedPatient.assignedHotelId);

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500" dir="rtl">
         <button 
          onClick={() => setSelectedPatient(null)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-brand-navy transition-all mb-4"
         >
           <ChevronRight size={14} />
           العودة إلى قائمة المرضى
         </button>
         <PatientProfile 
            patient={selectedPatient} 
            onClose={() => setSelectedPatient(null)}
            hospital={assignedHospital}
            program={assignedProgram}
            doctor={assignedDoctor}
            hotel={assignedHotel}
         />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <Users className="text-brand-green" size={24} />
              <h2 className="text-3xl font-black text-brand-navy tracking-tight uppercase">مركز قيادة المرضى</h2>
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">تنسيق الحالات الطبية العالمية وإدارة العملاء المحتملين</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={handleExport}
            className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-brand-navy shadow-sm transition-all hover:shadow-md"
            title="تصدير البيانات الاستراتيجية"
          >
            <FileDown size={20} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-navy text-white px-8 py-5 rounded-2xl font-black text-xs shadow-2xl shadow-brand-navy/30 hover:bg-brand-green transition-all flex items-center gap-4 group uppercase tracking-[0.2em]"
          >
            <Plus size={20} className="text-brand-cyan group-hover:rotate-90 transition-transform" />
            إنشاء ملف مريض جديد
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden p-2">
        <DataTable 
          data={patients} 
          columns={columns}
          onEdit={(p) => {
            setEditingPatient(p);
            setIsModalOpen(true);
          }}
          onDelete={(p) => handleDelete(p.id, p.name)}
          onView={(p) => setSelectedPatient(p)}
        />
      </div>

      <AddPatientModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPatient(null);
        }}
        onAdd={handleAddOrUpdate}
        patientToEdit={editingPatient}
      />
    </div>
  );
};

