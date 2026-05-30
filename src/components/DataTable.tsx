import React from 'react';
import { Search, Filter, MoreVertical, Edit2, Trash2, Eye, Download } from 'lucide-react';
import { motion } from 'motion/react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  exportValue?: (item: T) => string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  icon?: React.ReactNode;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  searchPlaceholder?: string;
}

export function DataTable<T extends { id: string | number }>({ 
  data, 
  columns, 
  title,
  icon,
  onEdit,
  onDelete,
  onView,
  searchPlaceholder = "بحث..."
}: DataTableProps<T>) {
  const [search, setSearch] = React.useState('');

  const filteredData = React.useMemo(() => {
    if (!search) return data;
    return data.filter(item => {
      const searchStr = JSON.stringify(item).toLowerCase();
      return searchStr.includes(search.toLowerCase());
    });
  }, [data, search]);

  const exportToCSV = () => {
    if (filteredData.length === 0) return;

    // Headers
    const headers = columns.map(col => col.header).join(',');

    // Rows
    const rows = filteredData.map(item => {
      return columns.map(col => {
        let val = '';
        if (col.exportValue) {
          val = col.exportValue(item);
        } else if (typeof col.accessor === 'string') {
          val = String(item[col.accessor as keyof T] || '');
        } else {
          // Fallback if it's a function and no exportValue provided
          val = '-';
        }
        
        // Escape quotes and wrap in quotes if contains comma
        val = val.replace(/"/g, '""');
        if (val.includes(',') || val.includes('"')) {
          val = `"${val}"`;
        }
        return val;
      }).join(',');
    });

    const csvContent = "\uFEFF" + [headers, ...rows].join('\n'); // Add BOM for Excel UTF-8 support
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${title || 'export'}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      {(title || searchPlaceholder) && (
        <div className="p-6 lg:p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {icon && <div className="text-brand-navy">{icon}</div>}
            {title && <h3 className="text-xl font-black text-brand-navy tracking-tight">{title}</h3>}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full sm:w-80 bg-slate-50 border-transparent rounded-xl py-2.5 pr-11 pl-4 text-sm font-bold focus:bg-white focus:border-brand-navy/10 transition-all outline-none"
              />
            </div>
            <button 
              onClick={exportToCSV}
              className="px-4 h-10 flex items-center gap-2 bg-slate-50 rounded-xl text-slate-400 hover:text-brand-navy transition-all group"
              title="تصدير للبيانات"
            >
              <Download size={18} className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">CSV</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl text-slate-400 hover:text-brand-navy transition-all">
              <Filter size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto scrollbar-hide">
        <div className="min-w-[800px] lg:min-w-full">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                {columns.map((col, i) => (
                  <th key={i} className={`px-4 lg:px-6 py-5 text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 ${col.className || ''}`}>
                    {col.header}
                  </th>
                ))}
                {(onEdit || onDelete || onView) && (
                  <th className="px-4 lg:px-6 py-5 text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-center">الإجراءات</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((item, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={item.id} 
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  {columns.map((col, i) => (
                    <td key={i} className={`px-4 lg:px-6 py-5 text-xs lg:text-sm font-bold text-slate-600 ${col.className || ''}`}>
                      {typeof col.accessor === 'function' ? col.accessor(item) : (item[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                  {(onEdit || onDelete || onView) && (
                    <td className="px-4 lg:px-6 py-5">
                      <div className="flex items-center justify-center gap-2">
                        {onView && (
                          <button onClick={() => onView(item)} className="p-1.5 lg:p-2 text-slate-300 hover:text-brand-cyan hover:bg-white rounded-lg transition-all shadow-sm shadow-transparent hover:shadow-slate-200">
                            <Eye size={14} className="lg:w-4 lg:h-4" />
                          </button>
                        )}
                        {onEdit && (
                          <button onClick={() => onEdit(item)} className="p-1.5 lg:p-2 text-slate-300 hover:text-brand-navy hover:bg-white rounded-lg transition-all shadow-sm shadow-transparent hover:shadow-slate-200">
                            <Edit2 size={14} className="lg:w-4 lg:h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button onClick={() => onDelete(item)} className="p-1.5 lg:p-2 text-slate-300 hover:text-red-500 hover:bg-white rounded-lg transition-all shadow-sm shadow-transparent hover:shadow-slate-200">
                            <Trash2 size={14} className="lg:w-4 lg:h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-20 text-center text-slate-300 font-bold italic">
                  لا توجد نتائج مطابقة لمصطلح البحث
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
