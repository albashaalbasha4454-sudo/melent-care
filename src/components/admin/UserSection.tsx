import React, { useState, useEffect } from 'react';
import { Users, Briefcase, Plus, MapPin, Phone, Building2, FileDown } from 'lucide-react';
import { DataTable } from '../DataTable';
import { mockClients, mockSuppliers } from '../../data';
import { LocalStorageManager, MELENT_KEYS } from '../../services/localStorageManager';
import { AddClientModal } from '../modals/AddClientModal';
import { Client } from '../../types';

interface UserSectionProps {
  type: 'Clients' | 'Suppliers';
}

export const UserSection: React.FC<UserSectionProps> = ({ type }) => {
  const [data, setData] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Client | null>(null);

  const effectiveKey = type === 'Clients' ? MELENT_KEYS.CLIENTS : MELENT_KEYS.SUPPLIERS;

  useEffect(() => {
    const stored = LocalStorageManager.get(effectiveKey);
    
    if (stored && stored.length > 0) {
      setData(stored);
    } else {
      const initialData = type === 'Clients' ? mockClients : mockSuppliers;
      setData(initialData as Client[]);
      LocalStorageManager.save(effectiveKey, initialData);
    }
  }, [type, effectiveKey]);

  const handleAddOrUpdate = (item: Client) => {
    const updated = editingItem 
      ? data.map(i => i.id === item.id ? item : i)
      : [item, ...data];
    
    setData(updated);
    LocalStorageManager.save(effectiveKey, updated);
    setEditingItem(null);
  };

  const handleDelete = (id: string, name: string) => {
    const entityType = type === 'Clients' ? 'CLIENT' : 'SUPPLIER';
    if (confirm(`هل أنت متأكد من نقل "${name}" إلى سلة المهملات؟`)) {
      if (LocalStorageManager.softDelete(effectiveKey, id, entityType, name)) {
        setData(prev => prev.filter(i => i.id !== id));
      }
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", `melent_${type.toLowerCase()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const columns = [
    { header: type === 'Clients' ? 'العميل' : 'المورد', accessor: (u: Client) => (
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${type === 'Clients' ? 'bg-brand-cyan/10 text-brand-cyan' : 'bg-brand-gold/10 text-brand-gold'}`}>
          {type === 'Clients' ? <Users size={18} /> : <Briefcase size={18} />}
        </div>
        <div>
          <p className="font-bold">{u.name}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">{u.id}</p>
        </div>
      </div>
    )},
    { header: 'الموقع', accessor: (u: Client) => (
      <div className="flex items-center gap-2">
        <MapPin size={14} className="text-slate-300" />
        <span>{u.location}</span>
      </div>
    )},
    { header: 'جهة الاتصال', accessor: (u: Client) => (
      <div className="flex items-center gap-2">
        <Building2 size={14} className="text-slate-300" />
        <span>{u.contactPerson}</span>
      </div>
    )},
    { header: 'التواصل', accessor: (u: Client) => (
      <div className="flex items-center gap-2">
        <Phone size={14} className="text-slate-300" />
        <span dir="ltr">{u.phone || 'غير متوفر'}</span>
      </div>
    )},
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-brand-navy tracking-tight uppercase">
            {type === 'Clients' ? 'إدارة العملاء' : 'إدارة الموردين'}
          </h2>
          <p className="text-[10px] font-black text-brand-green uppercase tracking-[0.3em] mt-1">
            {type === 'Clients' ? 'الشبكة العالمية للعملاء الطبيين' : 'الموردين الدوليين للرعاية الصحية'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleExport}
            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-brand-navy hover:bg-slate-50 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest"
          >
            <FileDown size={18} />
            تصدير البيانات
          </button>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-navy text-white px-6 py-4 rounded-2xl font-black text-sm shadow-xl shadow-brand-navy/10 hover:bg-brand-green transition-all flex items-center gap-3 group"
          >
            <Plus size={18} className="text-brand-cyan group-hover:rotate-90 transition-transform" />
            {type === 'Clients' ? 'إضافة عميل جديد' : 'إضافة مورد جديد'}
          </button>
        </div>
      </div>

      <DataTable 
        data={data} 
        columns={columns}
        onEdit={(u) => {
          setEditingItem(u);
          setIsModalOpen(true);
        }}
        onDelete={(u) => handleDelete(u.id, u.name)}
      />

      <AddClientModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onAdd={handleAddOrUpdate}
        clientToEdit={editingItem}
      />
    </div>
  );
};

