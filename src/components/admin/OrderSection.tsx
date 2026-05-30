import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Filter, Printer, Edit2, Trash2, FileDown } from 'lucide-react';
import { DataTable } from '../DataTable';
import { MedicalOrder } from '../../types';
import { LocalStorageManager, MELENT_KEYS } from '../../services/localStorageManager';
import { mockMedicalOrders } from '../../data';

export const OrderSection: React.FC = () => {
  const [orders, setOrders] = useState<MedicalOrder[]>([]);

  useEffect(() => {
    const stored = LocalStorageManager.get(MELENT_KEYS.ORDERS);
    if (stored && stored.length > 0) {
      setOrders(stored);
    } else {
      setOrders(mockMedicalOrders);
      LocalStorageManager.save(MELENT_KEYS.ORDERS, mockMedicalOrders);
    }
  }, []);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(orders, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "melent_orders.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleDelete = (id: string, clientName: string) => {
    if (confirm(`هل أنت متأكد من أرشفة الطلب الخاص بـ ${clientName}؟`)) {
      if (LocalStorageManager.softDelete(MELENT_KEYS.ORDERS, id, 'ORDER', `طلب: ${clientName}`)) {
        setOrders(prev => prev.filter(o => o.id !== id));
      }
    }
  };

  const columns = [
    { header: 'رقم الطلب', accessor: (o: MedicalOrder) => <span className="font-mono text-[10px] font-black">{o.id.slice(0, 8)}</span> },
    { header: 'العميل', accessor: (o: MedicalOrder) => o.clientName },
    { header: 'التاريخ', accessor: (o: MedicalOrder) => new Date(o.date).toLocaleDateString('ar-EG') },
    { header: 'القيمة', accessor: (o: MedicalOrder) => <span className="font-black text-brand-navy">{(o.financials?.total || 0).toLocaleString()} $</span> },
    { 
      header: 'الحالة', 
      accessor: (o: MedicalOrder) => (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
          o.status === 'Delivered' ? 'bg-green-50 text-green-500' : 
          o.status === 'Processing' ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-400'
        }`}>
          {o.status === 'Delivered' ? 'تم التسليم' : 'قيد المعالجة'}
        </span>
      )
    },
    {
      header: 'الإجراءات',
      accessor: (o: MedicalOrder) => (
        <div className="flex items-center gap-2">
          <button className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-brand-navy"><Printer size={14} /></button>
          <button className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-brand-navy"><Edit2 size={14} /></button>
        </div>
      )
    }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-brand-navy tracking-tighter uppercase">سجل المشتريات والطلبات</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">إدارة كاملة لمعاملات التوريد</p>
        </div>
        <button 
          onClick={handleExport}
          className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-brand-navy transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
        >
          <FileDown size={16} />
          تصدير التقرير
        </button>
      </div>
      <DataTable 
        data={orders} 
        columns={columns} 
        title="قائمة الطلبات" 
        icon={<ShoppingCart size={24} />} 
        onDelete={(o) => handleDelete(o.id, o.clientName)}
      />
    </div>
  );
};
