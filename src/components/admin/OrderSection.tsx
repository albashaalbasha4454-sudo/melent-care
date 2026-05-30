import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Search, Filter, Printer, Edit2, Trash2, FileDown, Layers, User, Building2 } from 'lucide-react';
import { DataTable } from '../DataTable';
import { MedicalOrder } from '../../types';
import { LocalStorageManager, MELENT_KEYS } from '../../services/localStorageManager';
import { mockMedicalOrders } from '../../data';

export const OrderSection: React.FC<{ onEditOrder?: (order: MedicalOrder) => void }> = ({ onEditOrder }) => {
  const [orders, setOrders] = useState<MedicalOrder[]>([]);
  const [typeFilter, setTypeFilter] = useState<'All' | 'Individual' | 'Corporate'>('All');

  useEffect(() => {
    const stored = LocalStorageManager.get(MELENT_KEYS.ORDERS);
    if (stored && stored.length > 0) {
      setOrders(stored);
    } else {
      setOrders(mockMedicalOrders);
      LocalStorageManager.save(MELENT_KEYS.ORDERS, mockMedicalOrders);
    }
  }, []);

  const filteredOrders = useMemo(() => {
    if (typeFilter === 'All') return orders;
    return orders.filter(o => {
      const isCorporate = o.clientType !== 'Individual';
      return typeFilter === 'Corporate' ? isCorporate : !isCorporate;
    });
  }, [orders, typeFilter]);

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
    { header: 'العميل', accessor: (o: MedicalOrder) => (
      <div className="flex items-center gap-2">
        {o.clientType === 'Individual' ? <User size={12} className="text-brand-cyan" /> : <Building2 size={12} className="text-brand-green" />}
        <span className="font-bold">{o.clientName}</span>
      </div>
    )},
    { header: 'التاريخ', accessor: (o: MedicalOrder) => new Date(o.date).toLocaleDateString('ar-EG') },
    { header: 'القيمة', accessor: (o: MedicalOrder) => <span className="font-black text-brand-navy">{(o.financials?.total || 0).toLocaleString()} $</span> },
    { 
      header: 'الحالة', 
      accessor: (o: MedicalOrder) => {
        const statusColors: any = {
          'Delivered': 'bg-green-50 text-green-500',
          'Processing': 'bg-amber-50 text-amber-500',
          'Admin Review': 'bg-purple-50 text-purple-600',
          'Cancelled': 'bg-red-50 text-red-500',
        };
        return (
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColors[o.status] || 'bg-slate-50 text-slate-400'}`}>
            {o.status === 'Delivered' ? 'تم التسليم' : 
             o.status === 'Processing' ? 'قيد المعالجة' :
             o.status === 'Admin Review' ? 'مراجعة الإدارة' : o.status}
          </span>
        );
      }
    },
    {
      header: 'الإجراءات',
      accessor: (o: MedicalOrder) => (
        <div className="flex items-center gap-2">
          <button className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-brand-navy"><Printer size={14} /></button>
          <button 
            onClick={() => onEditOrder?.(o)}
            className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-brand-navy"
          >
            <Edit2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-black text-brand-navy tracking-tighter uppercase">سجل المشتريات والطلبات</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">إدارة الطلبات الفردية وعقود الشركات</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white border border-slate-100 p-1 rounded-2xl flex gap-1 shadow-sm">
            {[
              { id: 'All', label: 'الكل', icon: Layers },
              { id: 'Individual', label: 'أفراد', icon: User },
              { id: 'Corporate', label: 'شركات', icon: Building2 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${
                  typeFilter === tab.id ? 'bg-brand-navy text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          <button 
            onClick={handleExport}
            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-brand-navy transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
          >
            <FileDown size={16} />
            تصدير التقرير
          </button>
        </div>
      </div>

      <DataTable 
        data={filteredOrders} 
        columns={columns} 
        title="قائمة الطلبات" 
        icon={<ShoppingCart size={24} />} 
        onDelete={(o) => handleDelete(o.id, o.clientName)}
        onEdit={(o) => onEditOrder?.(o)}
      />
    </div>
  );
};
