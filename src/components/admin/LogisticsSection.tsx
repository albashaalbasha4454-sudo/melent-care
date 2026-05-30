import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Package, Clock, ShieldCheck } from 'lucide-react';
import { DataTable } from '../DataTable';
import { LocalStorageManager, MELENT_KEYS } from '../../services/localStorageManager';

export const LogisticsSection: React.FC = () => {
  const [shipments, setShipments] = useState<any[]>([]);

  useEffect(() => {
    const raw = LocalStorageManager.get(MELENT_KEYS.ORDERS);
    const orders = Array.isArray(raw) ? raw : [];
    
    const derived = orders.map((o: any) => ({
      id: `SHP-${o.id.slice(0, 4)}`,
      destination: 'المستودع الرئيسي',
      status: o.status === 'Delivered' ? 'Arrived' : 'In Transit',
      carrier: 'DHL Global',
      weight: '45kg'
    }));
    setShipments(derived);
  }, []);

  const columns = [
    { header: 'رقم الشحنة', accessor: (s: any) => <span className="font-mono text-[10px] font-black">{s.id}</span> },
    { header: 'الناقل', accessor: (s: any) => s.carrier },
    { header: 'الوجهة', accessor: (s: any) => (
      <div className="flex items-center gap-2">
        <MapPin size={14} className="text-brand-cyan" />
        <span>{s.destination}</span>
      </div>
    )},
    { header: 'الحالة', accessor: (s: any) => (
      <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${
        s.status === 'Arrived' ? 'bg-green-50 text-green-500' : 'bg-brand-cyan/10 text-brand-cyan'
      }`}>
        {s.status === 'Arrived' ? 'وصلت' : 'في الطريق'}
      </span>
    )}
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div className="bg-brand-navy rounded-[3rem] p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <Truck size={64} className="text-brand-cyan" />
          <div className="grow text-right" dir="rtl">
            <h2 className="text-2xl font-black mb-2 uppercase tracking-tighter">مركز الدعم اللوجستي</h2>
            <p className="text-white/40 text-xs font-bold leading-relaxed max-w-xl">
              تتبع الشحنات الدولية والمحلية، إدارة التخليص الجمركي، ومراقبة حركة المخزون بين المسارات المختلفة. جميع البيانات مشفرة محلياً.
            </p>
          </div>
          <button 
            onClick={() => alert('تمت مزامنة المسارات اللوجستية وتحديث حالة الشحنات النشطة.')}
            className="bg-white text-brand-navy px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-green hover:text-white transition-all shadow-xl shadow-white/5"
          >
            تحديث المسار
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-right" dir="rtl">
        {[
          { label: 'شحنات قيد الوصول', value: '4', icon: Clock, color: 'text-amber-500' },
          { label: 'شحنات مستلمة', value: '12', icon: ShieldCheck, color: 'text-green-500' },
          { label: 'إجمالي الوزن المعالج', value: '850kg', icon: Package, color: 'text-brand-cyan' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex items-center gap-6">
            <div className={`w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center ${item.color}`}>
              <item.icon size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 tracking-widest leading-none mb-1.5 uppercase">{item.label}</p>
              <p className="text-2xl font-black text-brand-navy tracking-tighter">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <DataTable 
        data={shipments} 
        columns={columns} 
        title="تتبع الشحنات الجارية" 
        icon={<Truck size={24} />} 
      />
    </div>
  );
};
