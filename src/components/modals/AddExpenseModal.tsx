import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, FileText, CheckCircle2, AlertCircle, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Expense, Currency } from '../../types';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (expense: Expense) => void;
  expenseToEdit?: Expense | null;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, onAdd, expenseToEdit }) => {
  const [formData, setFormData] = useState<Partial<Expense>>({
    category: 'Other',
    amount: 0,
    currency: 'USD',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (expenseToEdit) {
      setFormData(expenseToEdit);
    } else {
      setFormData({ category: 'Other', amount: 0, currency: 'USD', description: '', date: new Date().toISOString().split('T')[0] });
    }
  }, [expenseToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) {
      setError('يرجى إكمال جميع الحقول');
      return;
    }

    const finalExpense: Expense = {
      ...formData as Expense,
      id: expenseToEdit?.id || `EXP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    };

    onAdd(finalExpense);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-brand-navy/60 backdrop-blur-md" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} 
        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
      >
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4" dir="rtl">
            <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center text-white">
              <DollarSign size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-brand-navy">
                {expenseToEdit ? 'تعديل مصروف' : 'تسجيل مصروف جديد'}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">إدارة التدفقات المالية الخارجة</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-brand-navy transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6" dir="rtl">
          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-bold text-xs">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 mr-2">المبلغ</label>
                <input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:border-brand-navy/10 transition-all font-black text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 mr-2">العملة</label>
                <select value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value as Currency})} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:border-brand-navy/10 transition-all font-bold text-sm">
                  <option value="USD">USD</option>
                  <option value="TRY">TRY</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 mr-2">التصنيف</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:border-brand-navy/10 transition-all font-bold text-sm">
                <option value="Logistics">لوجستيات (Logistics)</option>
                <option value="Procurement">مشتريات وتوريد (Procurement)</option>
                <option value="Salaries">رواتب (Salaries)</option>
                <option value="Marketing">تسويق (Marketing)</option>
                <option value="Other">أخرى (Other)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 mr-2">التاريخ</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 pl-12 focus:bg-white focus:border-brand-navy/10 transition-all font-bold text-sm" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 mr-2">الوصف / التفاصيل</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:border-brand-navy/10 transition-all font-bold text-sm min-h-[100px]" placeholder="مثلاً: دفعة شحن لطلبية ML-2024-001" />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
             <button type="submit" className="flex-1 bg-brand-navy text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-brand-navy/10 hover:bg-brand-green transition-all flex items-center justify-center gap-3">
               <CheckCircle2 size={18} className="text-brand-cyan" />
               {expenseToEdit ? 'تحديث المصروف' : 'تسجيل المصروف'}
             </button>
             <button type="button" onClick={onClose} className="px-8 bg-slate-50 text-slate-400 py-4 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all">إلغاء</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
