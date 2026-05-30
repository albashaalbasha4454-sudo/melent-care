import React, { useState, useEffect } from 'react';
import { FileText, FileCheck, Clock, Download, Plus } from 'lucide-react';
import { DataTable } from '../DataTable';
import { LocalStorageManager, MELENT_KEYS } from '../../services/localStorageManager';

export const ContractSection: React.FC = () => {
  const [contracts, setContracts] = useState<any[]>([]);

  useEffect(() => {
    const raw = LocalStorageManager.get(MELENT_KEYS.ORDERS);
    const stored = Array.isArray(raw) ? raw : [];
    
    // Deriving contracts from orders for demo
    const derived = stored.map((o: any) => ({
      id: `CON-${o.id.slice(0, 4)}`,
      client: o.clientName,
      date: o.date,
      status: o.status === 'Delivered' ? 'Active' : 'Draft',
      value: o.financials?.total || 0
    }));
    setContracts(derived);
  }, []);

  const columns = [
    { header: 'كود العقد', accessor: (c: any) => <span className="font-mono text-[10px] font-black">{c.id}</span> },
    { header: 'الجهة/العميل', accessor: (c: any) => c.client },
    { header: 'تاريخ الإبرام', accessor: (c: any) => new Date(c.date).toLocaleDateString('ar-EG') },
    { header: 'الحالة', accessor: (c: any) => (
      <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
        c.status === 'Active' ? 'bg-green-50 text-green-500' : 'bg-slate-50 text-slate-400'
      }`}>
        {c.status === 'Active' ? 'ساري' : 'مسودة'}
      </span>
    )},
    { header: 'الإجراءات', accessor: (c: any) => (
      <button className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-brand-navy">
        <Download size={14} />
      </button>
    )}
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-brand-navy tracking-tighter uppercase">إدارة العقود القانونية</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">توثيق وأرشفة محلية للاتفاقيات</p>
        </div>
        <button className="bg-brand-navy text-white px-6 py-3 rounded-2xl flex items-center gap-3 font-bold text-sm shadow-xl shadow-brand-navy/10">
          <Plus size={18} className="text-brand-cyan" />
          عقد جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 text-right" dir="rtl">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-6">
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-500">
            <FileCheck size={28} />
          </div>
          <div>
            <h4 className="font-black text-brand-navy">عقود سارية</h4>
            <p className="text-xs font-bold text-slate-400">{contracts.filter(c => c.status === 'Active').length} اتفاقية مفعلة</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-6">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
            <Clock size={28} />
          </div>
          <div>
            <h4 className="font-black text-brand-navy">قيد المراجعة</h4>
            <p className="text-xs font-bold text-slate-400">{contracts.filter(c => c.status === 'Draft').length} مسودة عمل</p>
          </div>
        </div>
      </div>

      <DataTable 
        data={contracts} 
        columns={columns} 
        title="أرشيف العقود" 
        icon={<FileText size={24} />} 
      />
    </div>
  );
};
