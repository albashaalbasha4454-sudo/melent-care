import React, { useState } from 'react';
import { HelpCircle, Phone, MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const HelpFab: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 left-8 z-[200]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-6 w-80 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden"
          >
            <div className="bg-brand-navy p-6 text-white relative">
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 left-4 text-white/50 hover:text-white transition-all"
              >
                <X size={18} />
              </button>
              <div className="w-12 h-12 bg-brand-cyan/20 rounded-2xl flex items-center justify-center text-brand-cyan mb-4">
                <HelpCircle size={24} />
              </div>
              <h3 className="text-xl font-black tracking-tight mb-1">مركز المساعدة</h3>
              <p className="text-[10px] text-brand-cyan/60 font-black uppercase tracking-widest">الدعم الفني والتقني</p>
            </div>
            
            <div className="p-6 space-y-6" dir="rtl">
              <p className="text-sm font-bold text-slate-500 leading-relaxed">
                عزيزي العميل، إذا واجهت أي صعوبة في استخدام المنصة أو لديك استفسار تقني، يسعدنا تواصلك مع المهندس المطور مباشرة:
              </p>
              
              <div className="space-y-3">
                <a 
                  href="tel:0096340392619"
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all group"
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-navy shadow-sm group-hover:scale-110 transition-transform">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">اتصال هاتفي</p>
                    <p className="font-black text-brand-navy" dir="ltr">00963 403 92619</p>
                  </div>
                </a>
                
                <a 
                  href="https://wa.me/96340392619"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-brand-green/5 rounded-2xl hover:bg-brand-green/10 transition-all group"
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-green shadow-sm group-hover:scale-110 transition-transform">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-brand-green/60 uppercase tracking-widest leading-none mb-1">واتساب</p>
                    <p className="font-black text-brand-navy">تواصل سريع ومباشر</p>
                  </div>
                </a>
              </div>
              
              <div className="pt-2">
                <p className="text-[9px] text-center font-black text-slate-300 uppercase tracking-widest">Melent Care Tech Support v2.0</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all ${isOpen ? 'bg-white text-brand-navy' : 'bg-brand-navy text-brand-cyan'}`}
      >
        {isOpen ? <X size={28} /> : <HelpCircle size={28} />}
      </motion.button>
    </div>
  );
};
