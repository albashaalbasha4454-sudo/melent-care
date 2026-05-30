import React, { useState, useEffect } from 'react';
import { History, Package, AlertCircle, ArrowDown, ArrowUp, FileDown } from 'lucide-react';
import { DataTable } from '../DataTable';
import { Product } from '../../types';
import { LocalStorageManager, MELENT_KEYS } from '../../services/localStorageManager';
import { mockProducts } from '../../data';

export const InventorySection: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const stored = LocalStorageManager.get(MELENT_KEYS.PRODUCTS);
    if (stored && stored.length > 0) {
      setProducts(stored);
    } else {
      setProducts(mockProducts);
    }
  }, []);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "melent_inventory.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const lowStock = products.filter(p => p.stock < 10);

  const columns = [
    { header: 'المنتج', accessor: (p: Product) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-brand-navy">
          <Package size={18} />
        </div>
        <span className="font-black">{p.name}</span>
      </div>
    )},
    { header: 'المخزون الحالي', accessor: (p: Product) => (
      <span className={`font-black ${p.stock < 10 ? 'text-red-500' : 'text-brand-navy'}`}>
        {p.stock} قطعة
      </span>
    )},
    { header: 'الحالة', accessor: (p: Product) => (
      <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${
        p.stock < 10 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'
      }`}>
        {p.stock < 10 ? 'مخزون منخفض' : 'متوفر'}
      </span>
    )}
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-black text-brand-navy tracking-tighter uppercase">المخزون واللوجستيات</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Stock Levels & Critical Alerts</p>
        </div>
        <button 
          onClick={handleExport}
          className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-brand-navy transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
        >
          <FileDown size={16} />
          تقرير الجرد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100">
           <div className="w-12 h-12 bg-brand-navy rounded-2xl flex items-center justify-center text-white mb-4">
              <Package size={24} />
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">إجمالي القطع</p>
           <p className="text-2xl font-black text-brand-navy tracking-tighter">
             {products.reduce((acc, p) => acc + p.stock, 0).toLocaleString()}
           </p>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100">
           <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-4">
              <AlertCircle size={24} />
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">تنبيهات النقص</p>
           <p className="text-2xl font-black text-red-500 tracking-tighter">
             {lowStock.length} منتجات
           </p>
        </div>
      </div>

      <DataTable 
        data={products} 
        columns={columns} 
        title="حركة المخزون المحلي" 
        icon={<History size={24} />} 
      />
    </div>
  );
};
