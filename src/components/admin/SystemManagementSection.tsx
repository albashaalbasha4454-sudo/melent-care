import React, { useState, useEffect } from 'react';
import { 
  Database, Shield, RotateCcw, Download, Upload, 
  Trash2, History, AlertTriangle, CheckCircle2, 
  RefreshCw, Info, FileJson, Clock, User
} from 'lucide-react';
import { LocalDB, MELENT_KEYS } from '../../services/localStorageManager';
import { AuditLog, SystemMetadata, RecycleBinItem } from '../../types';

export const SystemManagementSection: React.FC = () => {
  const [metadata, setMetadata] = useState<SystemMetadata | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [recycleBin, setRecycleBin] = useState<RecycleBinItem[]>([]);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [integrityStatus, setIntegrityStatus] = useState<'IDLE' | 'CHECKING' | 'DONE'>('IDLE');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'LOGS' | 'BACKUP' | 'RECYCLE' | 'REVIEW'>('OVERVIEW');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setMetadata(LocalDB.getMetadata());
    setLogs(LocalDB.get(MELENT_KEYS.AUDIT_LOGS) || []);
    setRecycleBin(LocalDB.get(MELENT_KEYS.RECYCLE_BIN) || []);
    
    const allOrders = LocalDB.get(MELENT_KEYS.ORDERS) || [];
    setPendingOrders(allOrders.filter((o: any) => o.status === 'Admin Review' || o.status === 'Draft'));
  };

  const handleReviewOrder = (orderId: string, approved: boolean) => {
    const allOrders = LocalDB.get(MELENT_KEYS.ORDERS) || [];
    const updated = allOrders.map((o: any) => {
      if (o.id === orderId) {
        return { ...o, status: approved ? 'Processing' : 'Rejected' };
      }
      return o;
    });
    LocalDB.save(MELENT_KEYS.ORDERS, updated);
    refreshData();
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الطلب المعلق؟')) {
      const allOrders = LocalDB.get(MELENT_KEYS.ORDERS) || [];
      const updated = allOrders.filter((o: any) => o.id !== orderId);
      LocalDB.save(MELENT_KEYS.ORDERS, updated);
      refreshData();
    }
  };

  const handleIntegrityCheck = () => {
    setIntegrityStatus('CHECKING');
    setTimeout(() => {
      const result = LocalDB.integrityCheck();
      setIntegrityStatus('DONE');
      refreshData();
      if (!result.healthy) {
        alert("تنبيه: تم اكتشاف خلل في البيانات في: " + result.issues.join(", "));
      }
    }, 1500);
  };

  const handleExport = () => {
    LocalDB.createManualBackup('SYSTEM_EXPORT');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = LocalDB.importBackup(content);
      if (result.success) {
        alert("تم استعادة النظام بنجاح");
        window.location.reload();
      } else {
        alert("فشل الاستيراد: " + result.message);
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm("تحذير: هذا سيحذف كافة بيانات العمل (العملاء، الطلبات، المخزون). هل أنت متأكد؟") &&
        window.prompt("اكتب 'WIPE' للتأكيد") === 'WIPE') {
      LocalDB.resetBusinessData();
      refreshData();
      alert("تم تصفير بيانات العمل بنجاح");
    }
  };

  const restoreItem = (binId: string) => {
    if (LocalDB.restoreFromRecycleBin(binId)) {
      refreshData();
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 pb-12 text-right" dir="rtl">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-3xl font-black text-brand-navy tracking-tighter uppercase">مركز إدارة النظام</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">إدارة التخزين المشفر والأرشفة والنسخ الاحتياطي</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          <button 
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all ${activeTab === 'OVERVIEW' ? 'bg-brand-navy text-white' : 'text-slate-400'}`}
          >
            نظرة عامة
          </button>
          <button 
            onClick={() => setActiveTab('LOGS')}
            className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all ${activeTab === 'LOGS' ? 'bg-brand-navy text-white' : 'text-slate-400'}`}
          >
            سجل العمليات
          </button>
          <button 
            onClick={() => setActiveTab('BACKUP')}
            className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all ${activeTab === 'BACKUP' ? 'bg-brand-navy text-white' : 'text-slate-400'}`}
          >
            النسخ والتهيئة
          </button>
          <button 
            onClick={() => setActiveTab('RECYCLE')}
            className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all ${activeTab === 'RECYCLE' ? 'bg-brand-navy text-white' : 'text-slate-400'}`}
          >
            سلة المهملات
          </button>
          <button 
            onClick={() => setActiveTab('REVIEW')}
            className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all ${activeTab === 'REVIEW' ? 'bg-brand-navy text-white' : 'text-slate-400'} relative`}
          >
            قيد المراجعة
            {pendingOrders.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] flex items-center justify-center rounded-full border-2 border-white">{pendingOrders.length}</span>}
          </button>
        </div>
      </div>

      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* System Status Card */}
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-brand-navy flex items-center gap-3">
                    <Shield size={24} className="text-brand-green" />
                    حالة سلامة البيانات (Integrity Check)
                  </h3>
                  <button 
                    onClick={handleIntegrityCheck}
                    className="p-3 bg-slate-50 text-brand-navy rounded-2xl hover:bg-brand-navy hover:text-white transition-all transform active:scale-95"
                  >
                    <RefreshCw size={20} className={integrityStatus === 'CHECKING' ? 'animate-spin' : ''} />
                  </button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100/50">
                    <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1">نسخة النظام</p>
                    <p className="font-black text-brand-navy">{metadata?.version || '2.0.0-PRO'}</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100/50">
                    <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1">حالة التخزين</p>
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${metadata?.status === 'Healthy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                       <p className="font-black text-brand-navy">{metadata?.status === 'Healthy' ? 'مشفر ومستقر' : 'تنبيه - افحص السلامة'}</p>
                    </div>
                  </div>
               </div>

               {integrityStatus === 'DONE' && (
                 <div className="mt-8 p-6 bg-green-50 border border-green-100 rounded-[2rem] flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="text-green-500" size={32} />
                    <div>
                       <p className="font-black text-green-700 text-sm">تم فحص سلامة البيانات بنجاح</p>
                       <p className="text-xs text-green-600/70 font-bold">لم يتم العثور على أي ملفات تالفة داخل التخزين المحلي.</p>
                    </div>
                 </div>
               )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[
                 { label: 'إجمالي السجلات', value: Object.values(metadata?.recordCount || {}).reduce((a: number, b: number) => a + b, 0), icon: Database, color: 'text-brand-cyan' },
                 { label: 'سجل العمليات', value: logs.length, icon: History, color: 'text-brand-navy' },
                 { label: 'عناصر المحذوفات', value: recycleBin.length, icon: Trash2, color: 'text-red-400' },
               ].map((stat, i) => (
                 <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
                    <div className={`w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center ${stat.color}`}>
                       <stat.icon size={24} />
                    </div>
                    <div>
                       <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase mb-1">{stat.label}</p>
                       <p className="text-xl font-black text-brand-navy">{stat.value}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          <div className="space-y-8">
             <div className="bg-brand-navy p-8 rounded-[3rem] text-white relative overflow-hidden">
                <Info size={40} className="text-brand-cyan mb-4 opacity-50" />
                <h4 className="text-xl font-black mb-2">إدارة البيانات 2.0</h4>
                <p className="text-xs font-bold text-white/50 leading-relaxed mb-6">
                   يعتمد النظام تقنية "LocalDB Provider" التي تضمن تشفير البيانات محلياً مع تدوير تلقائي للنسخ الاحتياطية (Auto-Sync) لضمان عدم فقدان العمل.
                </p>
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-green"></div>
                      <span className="text-[10px] font-bold">تشفير AES-Compatible</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-green"></div>
                      <span className="text-[10px] font-bold">أرشفة ذكية لمدة 90 يوم</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-green"></div>
                      <span className="text-[10px] font-bold">تتبع مسار Audit Log</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
             <h3 className="text-xl font-black text-brand-navy flex items-center gap-3">
                <History className="text-brand-navy" size={24} />
                سجل النشاط التقني
             </h3>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">آخر 1000 عملية</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
               <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <tr>
                     <th className="px-8 py-4">المستخدم</th>
                     <th className="px-8 py-4">العملية</th>
                     <th className="px-8 py-4">التفاصيل</th>
                     <th className="px-8 py-4">التوقيت</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                       <td className="px-8 py-4">
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-lg bg-brand-navy text-white flex items-center justify-center"><User size={12} /></div>
                             <span className="font-bold text-xs">{log.username}</span>
                          </div>
                       </td>
                       <td className="px-8 py-4">
                          <span className={`px-2 py-1 rounded-lg text-[9px] font-black ${
                             log.action === 'CREATE' ? 'bg-green-50 text-green-600' :
                             log.action === 'DELETE' ? 'bg-red-50 text-red-600' :
                             log.action === 'IMPORT' ? 'bg-brand-cyan/10 text-brand-cyan' : 'bg-slate-50 text-slate-500'
                          }`}>
                             {log.action === 'CREATE' ? 'إنشاء' : log.action === 'DELETE' ? 'حذف' : log.action === 'IMPORT' ? 'استيراد' : log.action}
                          </span>
                       </td>
                       <td className="px-8 py-4 text-xs font-bold text-slate-500">{log.details}</td>
                       <td className="px-8 py-4 text-[10px] font-black text-slate-400">{new Date(log.timestamp).toLocaleString('ar-EG')}</td>
                    </tr>
                  ))}
               </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'BACKUP' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in">
           <div className="bg-white p-10 rounded-[4rem] border border-slate-100 space-y-8">
              <div className="w-16 h-16 bg-brand-navy rounded-[2rem] flex items-center justify-center text-white">
                 <Download size={32} />
              </div>
              <div>
                 <h4 className="text-2xl font-black text-brand-navy mb-2">تصدير النظام بالكامل</h4>
                 <p className="text-sm font-bold text-slate-400">تحميل نسخة احتياطية كاملة (JSON) تحتوي على كافة العملاء والطلبات والإيرادات والملفات المسجلة محلياً.</p>
              </div>
              <button 
                onClick={handleExport}
                className="w-full h-16 bg-brand-navy text-white rounded-3xl font-black tracking-widest flex items-center justify-center gap-4 hover:bg-brand-green transition-all shadow-xl shadow-brand-navy/10"
              >
                 <Download size={20} />
                 تنزيل النسخة الاحتياطية (.json)
              </button>
           </div>

           <div className="bg-slate-50 p-10 rounded-[4rem] border border-slate-200 border-dashed space-y-8">
              <div className="w-16 h-16 bg-brand-cyan/10 rounded-[2rem] flex items-center justify-center text-brand-cyan">
                 <Upload size={32} />
              </div>
              <div>
                 <h4 className="text-2xl font-black text-brand-navy mb-2">استعادة النظام</h4>
                 <p className="text-sm font-bold text-slate-400 mb-6">قم برفع ملف النسخة الاحتياطية لاسترجاع كافة البيانات. سيتم فحص توافق الإصدار قبل الاستيراد.</p>
                 <label className="w-full h-16 cursor-pointer bg-white border border-slate-200 text-brand-navy rounded-3xl font-black tracking-widest flex items-center justify-center gap-4 hover:border-brand-navy transition-all">
                    <input type="file" className="hidden" accept=".json" onChange={handleImport} />
                    <FileJson size={20} />
                    اختر ملف النسخة لاستعادتها
                 </label>
              </div>
           </div>

           <div className="md:col-span-2 bg-red-50 p-10 rounded-[4rem] border border-red-100">
              <div className="flex flex-col md:flex-row items-center gap-8">
                 <div className="w-16 h-16 bg-red-500 rounded-[2rem] flex items-center justify-center text-white shrink-0">
                    <AlertTriangle size={32} />
                 </div>
                 <div className="grow">
                    <h4 className="text-2xl font-black text-red-700 mb-2">منطقة الخطر: تصفير النظام</h4>
                    <p className="text-sm font-bold text-red-600/70">هذه العملية ستحذف كافة بيانات العملاء والطلبات وتجعل النظام جاهزاً لعميل جديد. لا يمكن التراجع إلا من خلال نسخة احتياطية.</p>
                 </div>
                 <button 
                   onClick={handleReset}
                   className="px-10 h-16 bg-red-600 text-white rounded-3xl font-black tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-200"
                 >
                    تهيئة النظام لعميل جديد
                 </button>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'RECYCLE' && (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in">
           <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-xl font-black text-brand-navy flex items-center gap-3">
                 <Trash2 className="text-red-400" size={24} />
                 الأرشفة المؤقتة
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase">تُحذف العناصر نهائياً بعد مرور 90 يوماً</p>
           </div>
           
           {recycleBin.length === 0 ? (
             <div className="p-20 text-center">
                <Trash2 size={64} className="mx-auto text-slate-100 mb-6" />
                <p className="font-black text-slate-300">سلة المهملات فارغة حالياً</p>
             </div>
           ) : (
             <div className="overflow-x-auto">
               <table className="w-full text-right">
                  <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     <tr>
                        <th className="px-8 py-4">النوع</th>
                        <th className="px-8 py-4">العنصر</th>
                        <th className="px-8 py-4">تاريخ الحذف</th>
                        <th className="px-8 py-4">ينتهي في</th>
                        <th className="px-8 py-4">الإجراءات</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {recycleBin.map((item) => (
                       <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-4">
                             <span className="text-[9px] font-black text-brand-cyan uppercase bg-brand-cyan/5 px-2 py-1 rounded-lg">{item.entityType}</span>
                          </td>
                          <td className="px-8 py-4 font-bold text-brand-navy">{item.entityName}</td>
                          <td className="px-8 py-4 text-xs text-slate-400 font-bold">{new Date(item.deletedAt).toLocaleDateString('ar-EG')}</td>
                          <td className="px-8 py-4">
                             <div className="flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase">
                                <Clock size={12} />
                                {Math.ceil((new Date(item.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} يوم متبقي
                             </div>
                          </td>
                          <td className="px-8 py-4">
                             <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => restoreItem(item.id)}
                                  className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all scale-95"
                                  title="استرجاع"
                                >
                                   <RotateCcw size={14} />
                                </button>
                                <button className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all scale-95" title="حذف نهائي">
                                   <Trash2 size={14} />
                                </button>
                             </div>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
             </div>
           )}
        </div>
      )}
      {activeTab === 'REVIEW' && (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in">
           <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-xl font-black text-brand-navy flex items-center gap-3">
                 <Clock className="text-amber-500" size={24} />
                 طلبات قيد المراجعة الإدارية
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase">تحتاج إلى موافقة أو تعديل للمتابعة</p>
           </div>

           {pendingOrders.length === 0 ? (
             <div className="p-20 text-center">
                <CheckCircle2 size={64} className="mx-auto text-slate-100 mb-6" />
                <p className="font-black text-slate-300">لا توجد طلبات معلقة حالياً</p>
             </div>
           ) : (
             <div className="overflow-x-auto">
                <table className="w-full text-right">
                   <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <tr>
                         <th className="px-8 py-4">العميل</th>
                         <th className="px-8 py-4">القيمة</th>
                         <th className="px-8 py-4">التاريخ</th>
                         <th className="px-8 py-4">الحالة الحالية</th>
                         <th className="px-8 py-4 text-center">الإجراءات الإدارية</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {pendingOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                           <td className="px-8 py-4">
                              <p className="font-bold text-brand-navy">{order.clientName}</p>
                              <p className="text-[10px] text-slate-400">{order.id}</p>
                           </td>
                           <td className="px-8 py-4 font-black">{(order.financials?.total || 0).toLocaleString()} $</td>
                           <td className="px-8 py-4 text-xs font-bold text-slate-400">{new Date(order.date).toLocaleDateString('ar-EG')}</td>
                           <td className="px-8 py-4">
                              <span className="px-2 py-1 bg-amber-50 text-amber-600 rounded-lg text-[9px] font-black">{order.status}</span>
                           </td>
                           <td className="px-8 py-4">
                              <div className="flex items-center justify-center gap-2">
                                 <button 
                                   onClick={() => handleReviewOrder(order.id, true)}
                                   className="px-4 py-2 bg-brand-green text-white rounded-xl text-[10px] font-black hover:bg-brand-navy transition-all"
                                 >
                                    اعتماد الطلب
                                 </button>
                                 <button 
                                   onClick={() => handleReviewOrder(order.id, false)}
                                   className="px-4 py-2 bg-slate-100 text-slate-400 rounded-xl text-[10px] font-black hover:bg-red-50 hover:text-red-500 transition-all"
                                 >
                                    رفض
                                 </button>
                                 <button 
                                   onClick={() => handleDeleteOrder(order.id)}
                                   className="p-2 text-slate-200 hover:text-red-500 transition-colors"
                                 >
                                    <Trash2 size={16} />
                                 </button>
                              </div>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           )}
        </div>
      )}
    </div>
  );
};
