import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, FileDown, DollarSign, Wallet, ArrowUpRight, ArrowDownLeft, FileText, CheckCircle2, Clock, ShieldCheck, TrendingUp } from 'lucide-react';
import { DataTable } from '../DataTable';
import { LocalStorageManager, MELENT_KEYS } from '../../services/localStorageManager';
import { TravelInvoice, Patient } from '../../types';

export const TravelFinanceSection: React.FC = () => {
  const [invoices, setInvoices] = useState<TravelInvoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    setInvoices(LocalStorageManager.get(MELENT_KEYS.TRAVEL_INVOICES) || []);
    setPatients(LocalStorageManager.get(MELENT_KEYS.TRAVEL_PATIENTS) || []);
  }, []);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(invoices, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "melent_financial_ledger.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const columns = [
    { header: 'الفاتورة / المريض', accessor: (inv: TravelInvoice) => {
      const p = patients.find(pat => pat.id === inv.patientId);
      return (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-black border border-emerald-100 shadow-sm">
             <FileText size={20} />
          </div>
          <div>
            <p className="font-black text-brand-navy tracking-tight">{p?.name || 'Client'}</p>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md">{inv.id}</span>
            </div>
          </div>
        </div>
      );
    }},
    { header: 'القيمة الإجمالية', accessor: (inv: TravelInvoice) => (
      <div className="flex flex-col">
         <div className="flex items-center gap-1 font-black text-brand-navy tabular-nums">
            <DollarSign size={14} className="text-emerald-500" />
            <span>{inv.totalAmount.toLocaleString()}</span>
         </div>
         <span className="text-[9px] font-black text-slate-300 uppercase mt-0.5">USD Strategic Value</span>
      </div>
    )},
    { header: 'التدفق المالي', accessor: (inv: TravelInvoice) => {
      const remaining = inv.totalAmount - inv.paidAmount;
      const progress = (inv.paidAmount / inv.totalAmount) * 100;
      return (
        <div className="w-48 space-y-2">
           <div className="flex justify-between text-[10px] font-bold">
              <span className="text-emerald-500">${inv.paidAmount.toLocaleString()}</span>
              <span className="text-red-400">${remaining.toLocaleString()}</span>
           </div>
           <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
              <div 
                className={`h-full transition-all duration-1000 ${progress === 100 ? 'bg-emerald-500' : 'bg-brand-navy'}`}
                style={{ width: `${progress}%` }} 
              />
           </div>
        </div>
      );
    }},
    { header: 'التاريخ المالي', accessor: (inv: TravelInvoice) => (
      <div className="flex items-center gap-2 text-slate-400">
        <Clock size={12} />
        <span className="text-[11px] font-bold tabular-nums italic text-left">{new Date(inv.date).toLocaleDateString()}</span>
      </div>
    )},
    { header: 'الحالة', accessor: (inv: TravelInvoice) => (
      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm border ${
        inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
        inv.status === 'Partially Paid' ? 'bg-amber-50 text-amber-600 border-amber-100' :
        'bg-slate-50 text-slate-400 border-slate-100'
      }`}>
        {inv.status}
      </span>
    )},
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6" dir="rtl">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <CreditCard className="text-emerald-500" size={24} />
              <h2 className="text-3xl font-black text-brand-navy tracking-tight uppercase">Strategic Financial Center</h2>
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Audit, Track & Optimize Patient Revenue Streams</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={handleExport}
            className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-brand-navy shadow-sm transition-all hover:shadow-md"
            title="Export Strategic Ledger"
          >
            <FileDown size={20} />
          </button>
          <button 
            className="bg-brand-navy text-white px-8 py-5 rounded-2xl font-black text-xs shadow-2xl shadow-brand-navy/30 hover:bg-brand-green transition-all flex items-center gap-4 group uppercase tracking-[0.2em]"
          >
            <Plus size={20} className="text-brand-cyan group-hover:rotate-90 transition-transform" />
            Issue Macro Invoice
          </button>
        </div>
      </div>

      {/* Financial Health Bento */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-white p-8 rounded-[3rem] border border-slate-100 flex flex-col justify-between shadow-sm group hover:border-emerald-500 transition-all">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
               <Wallet size={28} />
            </div>
            <div className="mt-6">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Recovered Revenue</p>
               <p className="text-2xl font-black text-brand-navy">${invoices.reduce((acc, curr) => acc + curr.paidAmount, 0).toLocaleString()}</p>
            </div>
         </div>

         <div className="bg-white p-8 rounded-[3rem] border border-slate-100 flex flex-col justify-between shadow-sm group hover:border-red-400 transition-all">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
               <TrendingUp size={28} className="rotate-180" />
            </div>
            <div className="mt-6">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Strategic Exposure</p>
               <p className="text-2xl font-black text-brand-navy">${invoices.reduce((acc, curr) => acc + (curr.totalAmount - curr.paidAmount), 0).toLocaleString()}</p>
            </div>
         </div>

         <div className="md:col-span-2 bg-brand-navy rounded-[3rem] p-10 text-white relative overflow-hidden flex flex-col justify-between shadow-2xl shadow-brand-navy/30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/20 rounded-full blur-[80px] -mr-32 -mt-32" />
            <div className="relative z-10 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-brand-cyan backdrop-blur-md">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-brand-cyan tracking-widest">Financial Posture</span>
                    <p className="text-xl font-black tracking-tight">Audit Compliant</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black text-white/50 uppercase">Total Volume</p>
                  <p className="text-2xl font-black text-white">$4.2M</p>
               </div>
            </div>
            <div className="relative z-10 mt-8 flex gap-4">
               <div className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-[9px] font-black text-white/40 uppercase mb-1">Average Ticket</p>
                  <p className="font-black">$24,800</p>
               </div>
               <div className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-[9px] font-black text-white/40 uppercase mb-1">Settlement Yield</p>
                  <p className="font-black text-brand-green">92.4%</p>
               </div>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden p-2">
        <DataTable 
          data={invoices} 
          columns={columns}
          onEdit={() => {}}
          onDelete={() => {}}
          onView={(inv) => console.log('View Secure Invoice', inv)}
        />
      </div>

      {/* Corporate Compliance Note */}
      <div className="p-8 bg-brand-navy/5 border border-blue-100/30 rounded-[2.5rem] flex items-start gap-4" dir="rtl">
         <CheckCircle2 className="text-emerald-500 mt-1" size={20} />
         <div>
            <p className="text-[11px] font-black text-brand-navy uppercase tracking-widest mb-1">Financial Integrity Standard</p>
            <p className="text-xs font-bold text-slate-500 leading-relaxed max-w-2xl">
              جميع الفواتير الصادرة تخضع لمعايير التدقيق الدولية لمؤسسة Melent Care. يجب توثيق كل دفعة مقابل سجل المريض المناظر والمستشفى الشريك المعني لضمان الشفافية الكاملة في سلسلة القيمة السياحية الطبية.
            </p>
         </div>
      </div>
    </div>
  );
};
