import React, { useState, useEffect } from 'react';
import { X, Package, DollarSign, Archive, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../../types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (product: Product) => void;
  productToEdit?: Product | null;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onAdd, productToEdit }) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: '',
    price: 0,
    stock: 0
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productToEdit) {
      setFormData(productToEdit);
    } else {
      setFormData({ name: '', category: '', price: 0, stock: 0 });
    }
  }, [productToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category) {
      setError('يرجى إكمال جميع الحقول الإلزامية');
      return;
    }

    const finalProduct: Product = {
      ...formData as Product,
      id: productToEdit?.id || `PRD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    };

    onAdd(finalProduct);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="absolute inset-0 bg-brand-navy/60 backdrop-blur-md" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }} 
        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
      >
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4" dir="rtl">
            <div className="w-12 h-12 bg-brand-navy rounded-2xl flex items-center justify-center text-brand-cyan">
              <Package size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-brand-navy">
                {productToEdit ? 'تعديل بيانات منتج' : 'إضافة منتج جديد'}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Inventory Asset Management</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-brand-navy transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6" dir="rtl">
          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-bold text-xs animate-in slide-in-from-top">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 mr-2">اسم المنتج</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:border-brand-navy/10 transition-all font-bold text-sm" 
                placeholder="Product Name"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 mr-2">التصنيف</label>
              <select 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:border-brand-navy/10 transition-all font-bold text-sm"
              >
                <option value="">اختر التصنيف...</option>
                <option value="Medical Supply">معدات طبية (Medical Supply)</option>
                <option value="Health Products">منتجات صحية (Health Products)</option>
                <option value="Dermatology">الجلدية (Dermatology)</option>
                <option value="Surgical">جراحي (Surgical)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 mr-2">السعر الإفتراضي ($)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-black">$</span>
                  <input 
                    type="number" 
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 pl-10 focus:bg-white focus:border-brand-navy/10 transition-all font-black text-sm" 
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 mr-2">الكمية الحالية</label>
                <input 
                  type="number" 
                  value={formData.stock} 
                  onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:border-brand-navy/10 transition-all font-black text-sm text-center" 
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
             <button 
              type="submit" 
              className="flex-1 bg-brand-navy text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-brand-navy/10 hover:bg-brand-green transition-all flex items-center justify-center gap-3"
             >
               <CheckCircle2 size={18} className="text-brand-cyan" />
               {productToEdit ? 'تحديث المنتج' : 'إضافة لكتالوج المنتجات'}
             </button>
             <button 
              type="button"
              onClick={onClose}
              className="px-8 bg-slate-50 text-slate-400 py-4 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all"
             >
               إلغاء
             </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
