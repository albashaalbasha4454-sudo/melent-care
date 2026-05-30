import React, { useState, useEffect } from 'react';
import { 
  X, User, MapPin, Calendar, Activity, 
  CheckCircle2, AlertCircle, FileText, Globe, 
  ShieldCheck, Phone, Mail, Award, Hospital, 
  Stethoscope, Hotel, Plane 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Patient, PatientStatus, MedicalProgram, PartnerHospital, Doctor, Hotel as HotelType } from '../../types';
import { LocalStorageManager, MELENT_KEYS } from '../../services/localStorageManager';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (patient: Patient) => void;
  patientToEdit?: Patient | null;
}

export const AddPatientModal: React.FC<AddPatientModalProps> = ({ isOpen, onClose, onAdd, patientToEdit }) => {
  const [formData, setFormData] = useState<Partial<Patient>>({
    name: '',
    country: '',
    nationality: '',
    passportNumber: '',
    passportExpiry: '',
    email: '',
    phone: '',
    age: 0,
    gender: 'Male',
    condition: '',
    status: 'Inquiry',
    lastContact: new Date().toISOString(),
    notes: '',
    treatmentPlan: {
      overview: '',
      steps: []
    }
  });

  const [hospitals, setHospitals] = useState<PartnerHospital[]>([]);
  const [programs, setPrograms] = useState<MedicalProgram[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setHospitals(LocalStorageManager.get(MELENT_KEYS.TRAVEL_HOSPITALS) || []);
      setPrograms(LocalStorageManager.get(MELENT_KEYS.TRAVEL_PROGRAMS) || []);
    }
    
    if (patientToEdit) {
      setFormData(patientToEdit);
    } else {
      setFormData({ 
        name: '', 
        country: '', 
        nationality: '',
        passportNumber: '',
        email: '',
        phone: '',
        age: 0, 
        gender: 'Male', 
        condition: '', 
        status: 'Inquiry', 
        lastContact: new Date().toISOString(),
        notes: '',
        treatmentPlan: {
          overview: '',
          steps: []
        }
      });
    }
  }, [patientToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.country) {
      setError('يرجى إكمال البيانات الأساسية للهوية');
      return;
    }

    const finalPatient: Patient = {
      ...formData as Patient,
      id: patientToEdit?.id || `PAT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    };

    onAdd(finalPatient);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-brand-navy/80 backdrop-blur-xl" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }} 
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-5" dir="rtl">
            <div className="w-16 h-16 bg-brand-navy rounded-[1.5rem] flex items-center justify-center text-brand-cyan shadow-xl shadow-brand-navy/20">
              <User size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-brand-navy tracking-tight">
                {patientToEdit ? 'تعديل الملف الاستراتيجي' : 'فتح ملف مريض استراتيجي'}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-1">نظام إدارة علاقات المرضى المتطور</p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl text-slate-300 hover:text-brand-navy shadow-sm transition-all hover:scale-105 active:scale-95"><X /></button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar" dir="rtl">
          {error && (
            <div className="p-5 bg-red-50 border-2 border-red-100 rounded-[2rem] flex items-center gap-4 text-red-600 font-black text-xs">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {/* Section: Identity */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
               <ShieldCheck className="text-brand-cyan" size={20} />
               <h4 className="text-[11px] font-black uppercase text-brand-navy tracking-widest">بيانات الهوية والاتصال</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 mr-2 tracking-widest">الاسم الكامل</label>
                <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border-transparent rounded-[1.5rem] p-4 font-bold text-sm focus:bg-white focus:ring-4 focus:ring-brand-cyan/5 transition-all outline-none" placeholder="أدخل الاسم القانوني الكامل" />
                <p className="text-[9px] text-slate-300 font-bold px-2 italic">يجب أن يطابق الاسم الوارد في الهوية الرسمية أو جواز السفر.</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 mr-2 tracking-widest">رقم جواز السفر</label>
                <input type="text" value={formData.passportNumber || ''} onChange={e => setFormData({...formData, passportNumber: e.target.value})} className="w-full bg-slate-50 border-transparent rounded-[1.5rem] p-4 font-bold text-sm focus:bg-white focus:ring-4 focus:ring-brand-cyan/5 transition-all outline-none" placeholder="رقم جواز السفر" />
                <p className="text-[9px] text-slate-300 font-bold px-2 italic">ضروري لإتمام إجراءات الحجز الفندقي والطيران الدولي.</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 mr-2 tracking-widest">الدولة / الجنسية</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input type="text" value={formData.country || ''} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full bg-slate-50 border-transparent rounded-[1.5rem] p-4 pl-12 font-bold text-sm focus:bg-white outline-none transition-all" placeholder="الجنسية" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 mr-2 tracking-widest">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border-transparent rounded-[1.5rem] p-4 pl-12 font-bold text-sm focus:bg-white outline-none transition-all" placeholder="البريد الإلكتروني" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 mr-2 tracking-widest">رقم الهاتف الدولي</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input type="text" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border-transparent rounded-[1.5rem] p-4 pl-12 font-bold text-sm focus:bg-white outline-none transition-all" dir="ltr" placeholder="+000 000 0000" />
                </div>
              </div>
            </div>
          </section>

          {/* Section: Clinical Assignment */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
               <Activity className="text-brand-green" size={20} />
               <h4 className="text-[11px] font-black uppercase text-brand-navy tracking-widest">التخصيص الطبي</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 mr-2 tracking-widest">المستشفى المخصص</label>
                <div className="relative">
                  <Hospital className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <select value={formData.assignedHospitalId || ''} onChange={e => setFormData({...formData, assignedHospitalId: e.target.value})} className="w-full bg-slate-50 border-transparent rounded-[1.5rem] p-4 pl-12 font-bold text-sm focus:bg-white outline-none transition-all appearance-none">
                    <option value="">-- اختر المستشفى --</option>
                    {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 mr-2 tracking-widest">البرنامج الطبي</label>
                <div className="relative">
                  <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <select value={formData.assignedProgramId || ''} onChange={e => setFormData({...formData, assignedProgramId: e.target.value})} className="w-full bg-slate-50 border-transparent rounded-[1.5rem] p-4 pl-12 font-bold text-sm focus:bg-white outline-none transition-all appearance-none">
                    <option value="">-- اختر البرنامج --</option>
                    {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 mr-2 tracking-widest">حالة الملف</label>
                <select value={formData.status || 'Inquiry'} onChange={e => setFormData({...formData, status: e.target.value as PatientStatus})} className="w-full bg-brand-navy text-white rounded-[1.5rem] p-4 font-black uppercase tracking-widest text-[10px] outline-none transition-all">
                  <option value="Inquiry">استفسار</option>
                  <option value="Lead">عميل محتمل</option>
                  <option value="Confirmed">مؤكد للسفر</option>
                  <option value="Active">تحت العلاج</option>
                  <option value="Discharged">منتهي</option>
                  <option value="Cancelled">ملغي</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 mr-2 tracking-widest">التشخيص المبدئي</label>
              <textarea value={formData.condition || ''} onChange={e => setFormData({...formData, condition: e.target.value})} className="w-full bg-slate-50 border-transparent rounded-[1.5rem] p-6 font-bold text-sm focus:bg-white outline-none transition-all min-h-[120px]" placeholder="التشخيص الطبي المفصل وملخص تاريخ المريض..." />
              <p className="text-[9px] text-slate-300 font-bold px-2 italic">يرجى تقديم ملخص دقيق للحالة الطبية للمساعدة في ترشيح أفضل كادر طبي مختص.</p>
            </div>
          </section>

          {/* Section: Logistics Summary */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
               <Plane className="text-brand-cyan" size={20} />
               <h4 className="text-[11px] font-black uppercase text-brand-navy tracking-widest">موجز العمليات</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 mr-2 tracking-widest">آخر تواصل مسجل</label>
                <input type="date" value={formData.lastContact?.split('T')[0]} onChange={e => setFormData({...formData, lastContact: new Date(e.target.value).toISOString()})} className="w-full bg-slate-50 border-transparent rounded-[1.5rem] p-4 font-bold text-sm focus:bg-white transition-all outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 mr-2 tracking-widest">ملاحظات فريق العمل</label>
                <input type="text" value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-slate-50 border-transparent rounded-[1.5rem] p-4 font-bold text-sm focus:bg-white transition-all outline-none" placeholder="موجز التنسيق الداخلي..." />
              </div>
            </div>
          </section>
        </form>

        {/* Footer */}
        <div className="p-8 bg-slate-50/80 border-t border-slate-100 flex gap-4">
           <button 
            onClick={handleSubmit} 
            className="flex-1 bg-brand-navy text-white py-5 rounded-[1.5rem] font-black text-[13px] uppercase tracking-widest shadow-2xl shadow-brand-navy/20 hover:bg-brand-green transition-all flex items-center justify-center gap-3 group"
           >
             <CheckCircle2 size={20} className="text-brand-cyan group-hover:scale-110 transition-transform" />
             {patientToEdit ? 'تحديث السجل الاستراتيجي' : 'تفعيل السجل الطبي'}
           </button>
           <button type="button" onClick={onClose} className="px-10 bg-white border border-slate-200 text-slate-400 py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all">إلغاء</button>
        </div>
      </motion.div>
    </div>
  );
};
