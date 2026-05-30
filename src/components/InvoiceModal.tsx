import { motion, AnimatePresence } from 'motion/react';
import { X, Printer, FileDown, Table, Download } from 'lucide-react';
import { MedicalOrder, OrderItem } from '../types';
import * as XLSX from 'xlsx';
import { Logo } from './Logo';

interface InvoiceModalProps {
  order: MedicalOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal = ({ order, isOpen, onClose }: InvoiceModalProps) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const exportToExcel = () => {
    const data = order.items.map(item => ({
      'اسم المنتج': item.name,
      'الكمية': item.quantity,
      'سعر الوحدة': item.unitPrice,
      'الإجمالي': item.unitPrice * item.quantity
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoice");
    
    // Header styling/metadata could go here if needed
    XLSX.writeFile(wb, `Invoice_${order.id}.xlsx`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-brand-navy/60 backdrop-blur-md" 
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.9, y: 20 }} 
            className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Toolbar - Hidden in Print */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between no-print">
              <div className="flex items-center gap-3">
                <button 
                  onClick={handlePrint}
                  className="px-5 py-2.5 bg-brand-navy text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-brand-navy/90 transition-all shadow-lg shadow-brand-navy/20"
                >
                  <Printer size={16} /> طباعة / PDF
                </button>
                <button 
                  onClick={exportToExcel}
                  className="px-5 py-2.5 bg-brand-green text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-brand-green/90 transition-all shadow-lg shadow-brand-green/20"
                >
                  <Table size={16} /> تصدير Excel
                </button>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white text-slate-400 hover:text-red-500 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Invoice Layout - THE PRINTABLE PART */}
            <div id="printable-invoice" className="flex-1 overflow-y-auto p-10 lg:p-16 bg-white selection:bg-brand-cyan/20">
              <div className="max-w-3xl mx-auto space-y-12">
                
                {/* Invoice Header */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                  <div className="flex items-center gap-6">
                    <Logo className="w-20 h-20" />
                    <div>
                      <h1 className="text-3xl font-black text-brand-navy tracking-tight">فاتورة ضريبية</h1>
                      <p className="text-[10px] text-brand-green font-black uppercase tracking-[0.3em] mt-1">فاتورة رسمية • الجسر بين الصحة والسياحة والتجارة</p>
                    </div>
                  </div>
                  <div className="text-right md:text-left">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">رقم الفاتورة / Invoice No.</p>
                    <p className="text-xl font-black text-brand-navy mt-1">#{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">تاريخ الإصدار / Date</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">{new Date(order.date).toLocaleDateString('ar-EG')}</p>
                  </div>
                </div>

                {/* Billing Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-10 border-y border-slate-100">
                  <div>
                    <h3 className="text-[10px] text-brand-green font-black uppercase tracking-widest mb-4">بيانات الشركة / From</h3>
                    <div className="space-y-1">
                      <p className="font-black text-brand-navy text-sm uppercase">Melent للرعاية العالمية</p>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">حلول التوريد الطبي الدولية</p>
                      <p className="text-sm text-slate-500 font-medium">إسطنبول - الرياض</p>
                      <p className="text-sm text-slate-500 font-medium tracking-tight">info@melent.healthcare</p>
                    </div>
                  </div>
                  <div className="text-right md:text-left">
                    <h3 className="text-[10px] text-brand-cyan font-black uppercase tracking-widest mb-4">العميل / Billed To</h3>
                    <div className="space-y-2">
                      <p className="font-black text-brand-navy text-lg leading-none">{order.clientName}</p>
                      {order.clientPhone && <p className="text-sm font-bold text-slate-700" dir="ltr">{order.clientPhone}</p>}
                      {order.clientAddress && <p className="text-xs text-slate-400 font-medium leading-tight max-w-[250px] ml-auto md:ml-0">{order.clientAddress}</p>}
                      <div className="flex flex-wrap justify-end md:justify-start gap-2 pt-2">
                        <span className="text-[9px] font-black uppercase px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-slate-400">
                          ID: {order.clientId}
                        </span>
                        {order.executionLocation === 'Turkey' && (
                          <span className="text-[9px] font-black uppercase px-2 py-1 bg-brand-gold/10 border border-brand-gold/20 rounded-lg text-brand-gold">
                             منشأ تركي
                          </span>
                        )}
                        <span className="text-[9px] font-black uppercase px-2 py-1 bg-brand-navy/5 border border-brand-navy/10 rounded-lg text-brand-navy">
                          {order.payment.method}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logistics Badge Row */}
                <div className="flex flex-wrap gap-6 no-print">
                   <div className="flex items-center gap-3 px-6 py-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex-1 min-w-[200px]">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-brand-navy shadow-sm"><Printer size={18} /></div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">اللوجستيات / Delivery</p>
                        <p className="text-xs font-black text-brand-navy uppercase">{order.shipping.method}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 px-6 py-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex-1 min-w-[200px]">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-brand-cyan shadow-sm"><Download size={18} /></div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">طريقة الدفع / Payment</p>
                        <p className="text-xs font-black text-brand-navy uppercase">{order.payment.method}</p>
                      </div>
                   </div>
                </div>

                {/* Table */}
                <div>
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">الوصف</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-center">الكمية</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-center">السعر</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-left text-brand-navy">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-50 group">
                          <td className="px-6 py-5">
                            <p className="font-bold text-slate-900 group-hover:text-brand-navy transition-colors">{item.name}</p>
                          </td>
                          <td className="px-6 py-5 text-center font-bold text-slate-500">{item.quantity}</td>
                          <td className="px-6 py-5 text-center font-bold text-slate-500">{item.unitPrice.toLocaleString()} {order.financials?.currency || '$'}</td>
                          <td className="px-6 py-5 text-left font-black text-brand-navy">{(item.unitPrice * item.quantity).toLocaleString()} {order.financials?.currency || '$'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary */}
                <div className="flex justify-end pt-6">
                  <div className="w-full md:w-80 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-bold uppercase tracking-widest">المجموع الفرعي (العناصر)</span>
                      <span className="font-bold text-slate-700">{(order.financials?.subtotal || 0).toLocaleString()} {order.financials?.currency || '$'}</span>
                    </div>
                    {((order.financials?.intlShippingFee || 0) > 0 || (order.financials?.localDeliveryFee || 0) > 0) && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-bold uppercase tracking-widest">الشحن واللوجستيات</span>
                        <span className="font-bold text-slate-700">+{((order.financials?.intlShippingFee || 0) + (order.financials?.localDeliveryFee || 0)).toLocaleString()} {order.financials?.currency || '$'}</span>
                      </div>
                    )}
                    {(order.financials?.serviceFee || 0) > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-bold uppercase tracking-widest">رسوم الخدمات</span>
                        <span className="font-bold text-slate-700">+{(order.financials?.serviceFee || 0).toLocaleString()} {order.financials?.currency || '$'}</span>
                      </div>
                    )}
                    {(order.financials?.tax || 0) > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-bold uppercase tracking-widest">الضريبة</span>
                        <span className="font-bold text-slate-700">+{(order.financials?.tax || 0).toLocaleString()} {order.financials?.currency || '$'}</span>
                      </div>
                    )}
                    {(order.financials?.discount || 0) > 0 && (
                      <div className="flex justify-between items-center text-sm text-brand-green">
                        <span className="font-bold uppercase tracking-widest">خصم خاص</span>
                        <span className="font-bold">-{(order.financials?.discount || 0).toLocaleString()} {order.financials?.currency || '$'}</span>
                      </div>
                    )}
                    <div className="pt-4 border-t-2 border-slate-900 flex justify-between items-center">
                      <span className="text-lg font-black text-brand-navy uppercase tracking-widest">الإجمالي النهائي</span>
                      <span className="text-2xl font-black text-brand-navy">{(order.financials?.total || 0).toLocaleString()} {order.financials?.currency || '$'}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="pt-20 text-center space-y-4">
                  <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.3em]">شكراً لاختياركم ميلينت كير للحلول الطبية</p>
                  <div className="flex justify-center gap-6">
                    <div className="w-32 h-1 bg-brand-navy/10 rounded-full"></div>
                    <div className="w-12 h-1 bg-brand-green/30 rounded-full"></div>
                    <div className="w-32 h-1 bg-brand-navy/10 rounded-full"></div>
                  </div>
                  <p className="text-[9px] text-slate-300 font-medium">هذه الفاتورة تم إنشاؤها آلياً ولا تتطلب توقيعاً حياً.</p>
                </div>

              </div>
            </div>
          </motion.div>

          {/* Add CSS for printing */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body * {
                visibility: hidden;
              }
              #printable-invoice, #printable-invoice * {
                visibility: visible;
              }
              #printable-invoice {
                position: absolute;
                left: 0;
                top: 0;
                width: 100% !important;
                height: auto !important;
                overflow: visible !important;
                padding: 20px !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}} />
        </div>
      )}
    </AnimatePresence>
  );
};
