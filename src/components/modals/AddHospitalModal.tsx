import React, { useState, useEffect } from 'react';
import { X, Hospital, MapPin, Contact, Activity, CheckCircle2, AlertCircle, Star, Phone, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PartnerHospital } from '../../types';

interface AddHospitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (hospital: PartnerHospital) => void;
  hospitalToEdit?: PartnerHospital | null;
}

export const AddHospitalModal: React.FC<AddHospitalModalProps> = ({ isOpen, onClose, onAdd, hospitalToEdit }) => {
  const [formData, setFormData] = useState<Partial<PartnerHospital>>({
    name: '',
    location: '',
    specialties: [],
    rating: 0,
    contact: '',
    contractStatus: 'Active'
  });
  const [specialtyInput, setSpecialtyInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hospitalToEdit) {
      setFormData(hospitalToEdit);
    } else {
      setFormData({ name: '', location: '', specialties: [], rating: 4.5, contact: '', contractStatus: 'Active' });
    }
  }, [hospitalToEdit, isOpen]);

  const addSpecialty = () => {
    if (specialtyInput.trim()) {
      setFormData({
        ...formData,
        specialties: [...(formData.specialties || []), specialtyInput.trim()]
      });
      setSpecialtyInput('');
    }
  };

  const removeSpecialty = (idx: number) => {
    setFormData({
      ...formData,
      specialties: (formData.specialties || []).filter((_, i) => i !== idx)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.location) {
      setError('يرجى إكمال البيانات الأساسية للمستشفى');
      return;
    }

    const finalHospital: PartnerHospital = {
      ...formData as PartnerHospital,
      id: hospitalToEdit?.id || `HOSP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    };

    onAdd(finalHospital);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-brand-navy/60 backdrop-blur-md" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} 
        className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden"
      >
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4" dir="rtl">
            <div className="w-14 h-14 bg-brand-navy rounded-2xl flex items-center justify-center text-brand-cyan">
              <Hospital size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-brand-navy">
                {hospitalToEdit ? 'تعديل بيانات المستشفى' : 'إضافة مستشفى شريك جديد'}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">إدارة شركاء الرعاية الصحية</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white rounded-xl text-slate-300 hover:text-brand-navy shadow-sm transition-all"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8" dir="rtl">
          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-bold text-xs">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-black uppercase text-slate-400 mr-2 tracking-widest">اسم المستشفى / المركز الطبي</label>
              <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:border-brand-navy/10 transition-all font-bold text-sm" placeholder="Hospital Full Name" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 mr-2 tracking-widest">الموقع (الدولة / المدينة)</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input type="text" value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 pl-12 focus:bg-white focus:border-brand-navy/10 transition-all font-bold text-sm" placeholder="Location" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 mr-2 tracking-widest">حالة الشراكة</label>
              <select value={formData.contractStatus || 'Active'} onChange={e => setFormData({...formData, contractStatus: e.target.value as any})} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:border-brand-navy/10 transition-all font-bold text-sm">
                <option value="Active">نشط (Active)</option>
                <option value="Under Negotiation">تحت التفاوض (Under Negotiation)</option>
                <option value="Expired">منتهي (Expired)</option>
              </select>
            </div>

              <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 mr-2 tracking-widest">التقييم (0-5)</label>
                <div className="relative">
                  <Star className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold" size={18} />
                  <input type="number" step="0.1" max="5" value={formData.rating || 0} onChange={e => setFormData({...formData, rating: Number(e.target.value)})} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:border-brand-navy/10 transition-all font-black text-sm text-center" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 mr-2 tracking-widest">بيانات التواصل الرئيسي</label>
                <input type="text" value={formData.contact || ''} onChange={e => setFormData({...formData, contact: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:border-brand-navy/10 transition-all font-bold text-sm" placeholder="Phone or Email" />
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-black uppercase text-slate-400 mr-2 tracking-widest">التخصصات الطبية</label>
              <div className="flex gap-2">
                <input type="text" value={specialtyInput} onChange={e => setSpecialtyInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addSpecialty())} className="flex-1 bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:border-brand-navy/10 transition-all font-bold text-sm" placeholder="أضف تخصص (مثلاً: جراحة التجميل)" />
                <button type="button" onClick={addSpecialty} className="px-6 bg-brand-navy text-white rounded-2xl font-black text-xs uppercase tracking-widest">إضافة</button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.specialties?.map((s, i) => (
                  <span key={i} className="px-4 py-2 bg-brand-cyan/10 text-brand-navy border border-brand-cyan/20 rounded-xl text-xs font-black flex items-center gap-2">
                    {s}
                    <button type="button" onClick={() => removeSpecialty(i)} className="text-brand-navy/40 hover:text-red-500"><X size={14} /></button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 flex gap-4">
             <button type="submit" className="flex-1 bg-brand-navy text-white py-5 rounded-[1.5rem] font-black text-sm shadow-2xl shadow-brand-navy/20 hover:bg-brand-green transition-all flex items-center justify-center gap-3">
               <CheckCircle2 size={20} className="text-brand-cyan" />
               {hospitalToEdit ? 'تحديث بيانات الشريك' : 'تسجيل المستشفى الشريك'}
             </button>
             <button type="button" onClick={onClose} className="px-10 bg-slate-50 text-slate-400 py-5 rounded-[1.5rem] font-black text-sm hover:bg-slate-100 transition-all">إلغاء</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
