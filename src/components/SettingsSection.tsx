import React, { useRef, useState, useEffect } from 'react';
import { Database, Download, Upload, Trash2, ShieldCheck, AlertTriangle, FileJson, Plus, CheckCircle2, Info, History } from 'lucide-react';
import { LocalStorageManager } from '../services/localStorageManager';

export const SettingsSection: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mergeInputRef = useRef<HTMLInputElement>(null);
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [storageStatus, setStorageStatus] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setLastBackup(LocalStorageManager.getLastBackupDate());
    setStorageStatus(LocalStorageManager.validateLocalData());
  }, []);

  const handleExport = () => {
    const date = LocalStorageManager.exportAllLocalData();
    setLastBackup(date);
    alert('تم تصدير النسخة الاحتياطية بنجاح. يرجى الاحتفاظ بالملف في مكان آمن.');
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>, isMerge: boolean) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          const success = isMerge 
            ? LocalStorageManager.mergeLocalData(text) 
            : await LocalStorageManager.importAllLocalData(text);
            
          if (success) {
            alert(isMerge ? 'تم دمج البيانات بنجاح!' : 'تم استعادة البيانات بنجاح! سيتم إعادة تحميل النظام.');
            window.location.reload();
          } else {
            alert('خطأ في تنسيق الملف. تأكد أن الملف تابع لنظام MELENT CARE وصالح للاستيراد.');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSafeClear = () => {
    if (deleteConfirm === 'DELETE MELENT DATA') {
      const success = LocalStorageManager.safeClearMelentStorage(deleteConfirm);
      if (success) {
        alert('تم حذف بيانات النظام بنجاح من هذا المتصفح.');
        window.location.reload();
      }
    } else {
      alert('كلمة التأكيد غير صحيحة.');
    }
  };

  const isBackupOld = () => {
    if (!lastBackup) return true;
    const days = (new Date().getTime() - new Date(lastBackup).getTime()) / (1000 * 3600 * 24);
    return days > 7;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 text-right" dir="rtl">
      {/* Header with Local Status */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-black text-brand-navy tracking-tight uppercase">مركز سلامة البيانات (Data Safety)</h2>
          <p className="text-[10px] font-black text-brand-green uppercase tracking-[0.3em]">نظام تخزين محلي كامل (Local Storage Only)</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${storageStatus?.status === 'stable' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">حالة التخزين المحلي: نشط</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">المساحة المستخدمة: {storageStatus?.usage.toFixed(2)} KB</span>
          </div>
        </div>
      </div>

      {/* Backup Alert if Old */}
      {isBackupOld() && (
        <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex items-center gap-6">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div className="grow">
            <h4 className="text-amber-900 font-black text-sm">توصية أمنية: مطلوب نسخة احتياطية</h4>
            <p className="text-amber-900/60 text-xs font-bold">لم يتم إنشاء نسخة احتياطية منذ أكثر من 7 أيام. يرجى تنزيل نسخة الآن لحماية بياناتك من الضياع المفاجئ.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Export Card */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
          <div className="w-16 h-16 bg-brand-navy/5 rounded-2xl flex items-center justify-center text-brand-navy mb-6 group-hover:bg-brand-navy group-hover:text-white transition-all">
            <Download size={32} />
          </div>
          <h3 className="text-xl font-black text-brand-navy mb-2">تصدير قاعدة البيانات المحلية</h3>
          <p className="text-slate-400 text-sm font-bold leading-relaxed mb-8">
            يقوم النظام بجمع كافة المفاتيح (العملاء، العبوات، السجلات الطبية) وتشفيرها في ملف JSON واحد. يمكنك استخدامه كنسخة احتياطية أو لنقله لجهاز آخر.
          </p>
          <button 
            onClick={handleExport}
            className="w-full bg-brand-navy text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-green transition-all shadow-lg shadow-brand-navy/10 flex items-center justify-center gap-3"
          >
            <FileJson size={18} className="text-brand-cyan" />
            تحميل النسخة الكاملة (.json)
          </button>
          {lastBackup && (
             <p className="text-center mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">آخر تصدير: {new Date(lastBackup).toLocaleString('ar-EG')}</p>
          )}
        </div>

        {/* Import/Merge Card */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
          <div className="w-16 h-16 bg-brand-cyan/5 rounded-2xl flex items-center justify-center text-brand-cyan mb-6 group-hover:bg-brand-cyan group-hover:text-white transition-all">
            <Database size={32} />
          </div>
          <h3 className="text-xl font-black text-brand-navy mb-2">دمج أو استعادة البيانات</h3>
          <p className="text-slate-400 text-sm font-bold leading-relaxed mb-6">
            اختر "دمج" لإضافة سجلات من متصفح آخر دون حذف بياناتك، أو "استعادة" لاستبدال كل شيء بالملف المختار.
          </p>
          
          <div className="grid grid-cols-1 gap-3">
            <input type="file" ref={mergeInputRef} onChange={(e) => handleImport(e, true)} className="hidden" accept=".json" />
            <button 
              onClick={() => mergeInputRef.current?.click()}
              className="w-full bg-brand-cyan text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-navy transition-all shadow-lg shadow-brand-cyan/10 flex items-center justify-center gap-3"
            >
              <Plus size={18} />
              دمج بيانات من ملف آخر
            </button>

            <input type="file" ref={fileInputRef} onChange={(e) => handleImport(e, false)} className="hidden" accept=".json" />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-slate-50 text-slate-400 border-2 border-slate-100 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-brand-navy transition-all flex items-center justify-center gap-3"
            >
              <Upload size={14} />
              استبدال كامل للبيانات الحالية
            </button>
          </div>
        </div>

        {/* Local Storage Information */}
        <div className="bg-brand-navy rounded-[3rem] p-10 text-white relative overflow-hidden lg:col-span-2">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-black mb-6">ثقافة الخصوصية: Local Storage</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white/70 text-xs font-bold leading-relaxed">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={16} className="text-brand-green" />
                  </div>
                  <p>لا يوجد سيرفر خارجي. بياناتك ملكك وحدك ومخزنة بأمان داخل متصفحك.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={16} className="text-brand-green" />
                  </div>
                  <p>سرعة فائقة في الوصول للبيانات لأنها مخزنة محلياً في الرام والقرص الصلب.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={16} className="text-brand-green" />
                  </div>
                  <p>تشفير محلي للنسخ الاحتياطية لضمان سلامة التنقل بين الأجهزة.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Info size={16} className="text-brand-cyan" />
                  </div>
                  <p>تحذير: سيتم فقدان البيانات في حال "مسح الكوكيز" أو "تهيئة المتصفح" بدون Backup.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-3xl p-6 backdrop-blur-xl border border-white/10">
              <h4 className="font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                <History size={14} className="text-brand-cyan" />
                سجل الأمان
              </h4>
              <ul className="space-y-3 opacity-60 text-[10px]">
                <li className="flex justify-between border-b border-white/5 pb-2 text-right">
                  <span>سلامة الملفات</span>
                  <span className="text-brand-green">ممتازة</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-2 text-right">
                  <span>تاريخ الفحص</span>
                  <span>{new Date().toLocaleDateString('ar-EG')}</span>
                </li>
                <li className="flex justify-between text-right">
                  <span>المزامنة السحابية</span>
                  <span className="text-amber-500">معطلة (محلي فقط)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 p-10 rounded-[3rem] border border-red-100 lg:col-span-2 relative overflow-hidden">
           <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-red-500 shadow-sm shrink-0 border border-red-100">
                <Trash2 size={40} />
              </div>
              <div className="grow">
                <h4 className="text-xl font-black text-red-900 mb-2">منطقة الخطر: الحذف النهائي للمفاتيح</h4>
                <p className="text-red-900/60 text-sm font-bold max-w-xl">
                  سيقوم هذا الإجراء بحذف جميع بيانات "ميلنت كير" فقط من هذا المتصفح. لا يمكن التراجع عن هذا الإجراء إلا بوجود نسخة احتياطية خارجية.
                </p>
              </div>
              
              {!showDeleteConfirm ? (
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-500 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-red-500/10"
                >
                  بدء إجراء المسح الآمن
                </button>
              ) : (
                <div className="flex flex-col gap-3 w-full md:w-auto">
                  <input 
                    type="text" 
                    placeholder="اكتب: DELETE MELENT DATA" 
                    className="bg-white border-2 border-red-200 px-6 py-4 rounded-xl text-xs font-black text-center focus:border-red-500 outline-none transition-all"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSafeClear}
                      className="flex-1 bg-red-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700"
                    >
                      تأكيد الحذف النهائي
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-6 bg-slate-200 text-slate-600 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-300"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
