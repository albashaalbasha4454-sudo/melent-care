import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Filter, Edit2, Trash2, LayoutGrid, List, FileDown, TrendingUp, DollarSign, ArrowUpRight } from 'lucide-react';
import { Product } from '../../types';
import { mockProducts } from '../../data';
import { DataTable } from '../DataTable';
import { LocalStorageManager, MELENT_KEYS } from '../../services/localStorageManager';
import { AddProductModal } from '../modals/AddProductModal';

export const ProductSection: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'selling'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const stored = LocalStorageManager.get(MELENT_KEYS.PRODUCTS);
    if (stored && stored.length > 0) {
      setProducts(stored);
    } else {
      setProducts(mockProducts);
      LocalStorageManager.save(MELENT_KEYS.PRODUCTS, mockProducts);
    }
  }, []);

  const handleAddOrUpdateProduct = (product: Product) => {
    const updated = editingProduct 
      ? products.map(p => p.id === product.id ? product : p)
      : [product, ...products];
    
    setProducts(updated);
    LocalStorageManager.save(MELENT_KEYS.PRODUCTS, updated);
    setEditingProduct(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من نقل "${name}" إلى سلة المهملات؟`)) {
      if (LocalStorageManager.softDelete(MELENT_KEYS.PRODUCTS, id, 'PRODUCT', name)) {
        setProducts(prev => prev.filter(p => p.id !== id));
      }
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "melent_products.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const columns = [
    { header: 'المنتج', accessor: (p: Product) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-brand-navy">
          <Package size={18} />
        </div>
        <div>
          <p className="font-bold">{p.name}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">{p.id}</p>
        </div>
      </div>
    )},
    { header: 'التصنيف', accessor: (p: Product) => p.category },
    { header: 'سعر البيع', accessor: (p: Product) => <span className="font-black text-brand-green">${p.price.toLocaleString()}</span> },
    { header: 'سعر الشراء', accessor: (p: Product) => <span className="font-bold text-slate-400 opacity-60">${(p.purchasePrice || 0).toLocaleString()}</span> },
    { header: 'المخزون', accessor: (p: Product) => (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${p.stock > 10 ? 'bg-brand-green' : 'bg-red-500'}`} />
        <span>{p.stock} وحدة</span>
      </div>
    )},
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-brand-navy tracking-tight uppercase">إدارة المنتجات والتسعير</h2>
          <p className="text-[10px] font-black text-brand-green uppercase tracking-[0.3em] mt-1">كتالوج المخزون وهامش الربح</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setViewMode('selling')}
            className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl ${
              viewMode === 'selling' ? 'bg-brand-green text-white scale-105' : 'bg-white border border-brand-green/20 text-brand-green hover:bg-brand-green/5'
            }`}
          >
            <TrendingUp size={16} />
            تحليل المبيعات (Selling)
          </button>

          <button 
            onClick={handleExport}
            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-brand-navy hover:bg-slate-50 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest"
          >
            <FileDown size={18} />
            تصدير
          </button>
          
          <div className="bg-white border border-slate-100 p-1 rounded-xl flex gap-1 shadow-sm">
            <button 
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-brand-navy text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <List size={18} />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-brand-navy text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-navy text-white px-6 py-4 rounded-2xl font-black text-sm shadow-xl shadow-brand-navy/10 hover:bg-brand-green transition-all flex items-center gap-3 group"
          >
            <Plus size={18} className="text-brand-cyan group-hover:rotate-90 transition-transform" />
            منتج جديد (غير مدرج للحجز)
          </button>
        </div>
      </div>

      {viewMode === 'selling' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => {
            const profit = p.price - (p.purchasePrice || 0);
            const margin = ((profit / p.price) * 100).toFixed(1);
            return (
              <div key={p.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="flex items-center justify-between mb-6">
                   <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-brand-navy shrink-0">
                      <DollarSign size={24} />
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.category}</p>
                      <h4 className="font-black text-brand-navy">{p.name}</h4>
                   </div>
                </div>

                <div className="space-y-4 mb-8">
                   <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">سعر الشراء (Purchase)</p>
                      <p className="font-black text-brand-navy">${(p.purchasePrice || 0).toLocaleString()}</p>
                   </div>
                   <div className="flex justify-between items-center bg-brand-green/5 p-4 rounded-2xl border border-brand-green/10">
                      <p className="text-[10px] font-black text-brand-green uppercase tracking-widest">سعر البيع (Selling)</p>
                      <p className="font-black text-brand-navy">${p.price.toLocaleString()}</p>
                   </div>
                </div>

                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                   <div>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">صافي الربح</p>
                      <p className="text-2xl font-black text-brand-greentracking-tighter">${profit.toLocaleString()}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-brand-cyan uppercase tracking-widest mb-1">هامش الربح</p>
                      <div className="flex items-center gap-1.5 justify-end">
                         <ArrowUpRight size={14} className="text-brand-cyan" />
                         <p className="text-lg font-black text-brand-navy">{margin}%</p>
                      </div>
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'table' ? (
        <DataTable 
          data={products} 
          columns={columns}
          onDelete={(p) => handleDelete(p.id, p.name)}
          onEdit={(p) => {
            setEditingProduct(p);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(p => (
            <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-cyan to-brand-green transform -translate-y-full group-hover:translate-y-0 transition-transform" />
               <div className="flex justify-between items-start mb-6">
                 <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-brand-navy group-hover:bg-brand-navy group-hover:text-white transition-colors">
                   <Package size={28} />
                 </div>
                 <div className="flex gap-1">
                   <button 
                    onClick={() => { setEditingProduct(p); setIsModalOpen(true); }}
                    className="p-2 text-slate-200 hover:text-brand-navy transition-colors"
                   >
                     <Edit2 size={16} />
                   </button>
                   <button onClick={() => handleDelete(p.id, p.name)} className="p-2 text-slate-200 hover:text-red-500 transition-colors">
                     <Trash2 size={16} />
                   </button>
                 </div>
               </div>
               <h4 className="font-black text-brand-navy text-lg mb-1">{p.name}</h4>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{p.category}</p>
               <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                 <p className="text-xl font-black text-brand-green">${p.price.toLocaleString()}</p>
                 <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg">
                   <div className={`w-1.5 h-1.5 rounded-full ${p.stock > 10 ? 'bg-brand-green' : 'bg-red-500'}`} />
                   <span className="text-[10px] font-black text-slate-400">{p.stock} في المخزون</span>
                 </div>
               </div>
            </div>
          ))}
        </div>
      )}

      <AddProductModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onAdd={handleAddOrUpdateProduct}
        productToEdit={editingProduct}
      />
    </div>
  );
};

