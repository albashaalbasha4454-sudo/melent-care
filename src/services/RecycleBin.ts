/**
 * RecycleBin - سلة المحذوفات
 * يوفر: حفظ البيانات المحذوفة، استرجاعها، تنظيف دوري، تتبع الحذف
 */

import { AuditLog } from './AuditLog';

export interface RecycleBinItem {
  id: string;
  originalKey: string;
  deletedAt: string;
  expiresAt: string;
  data: any;
  entityType: string;
  entityName?: string;
  deletedBy: string;
  reason?: string;
  size: number;
}

export interface RecycleBinStats {
  totalItems: number;
  totalSize: number;
  oldestItem: string | null;
  newestItem: string | null;
  itemsByType: Record<string, number>;
}

class RecycleBinService {
  private binKey = 'melent_recycle_bin';
  private retentionDays = 30; // احتفظ بالبيانات لمدة 30 يوم
  private maxItems = 1000;

  constructor(retentionDays?: number) {
    if (retentionDays) {
      this.retentionDays = retentionDays;
    }
    this.initializeRecycleBin();
  }

  /**
   * تهيئة سلة المحذوفات
   */
  private initializeRecycleBin(): void {
    if (!localStorage.getItem(this.binKey)) {
      localStorage.setItem(this.binKey, JSON.stringify([]));
    }
  }

  /**
   * إضافة عنصر إلى سلة المحذوفات
   */
  moveToTrash(
    key: string,
    data: any,
    entityType: string,
    options?: {
      entityName?: string;
      deletedBy?: string;
      reason?: string;
    }
  ): RecycleBinItem {
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.retentionDays * 24 * 60 * 60 * 1000);

      const item: RecycleBinItem = {
        id: `trash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        originalKey: key,
        deletedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        data,
        entityType,
        entityName: options?.entityName || key,
        deletedBy: options?.deletedBy || 'نظام',
        reason: options?.reason,
        size: this.getSize(data),
      };

      this.addItem(item);

      // تسجيل في السجل التدقيقي
      AuditLog.log(
        'DELETE',
        entityType,
        key,
        `تم نقل ${options?.entityName || key} إلى سلة المحذوفات`,
        {
          entityName: options?.entityName,
          metadata: { trashedItemId: item.id },
        }
      );

      console.log(`✅ تم نقل "${options?.entityName || key}" إلى سلة المحذوفات`);
      return item;
    } catch (error) {
      console.error('❌ خطأ في نقل العنصر إلى سلة المحذوفات:', error);
      throw error;
    }
  }

  /**
   * استرجاع عنصر من سلة المحذوفات
   */
  restore(trashItemId: string): RecycleBinItem | null {
    try {
      const items = this.getItems();
      const itemIndex = items.findIndex(item => item.id === trashItemId);

      if (itemIndex === -1) {
        console.error('❌ لم يتم العثور على العنصر في سلة المحذوفات');
        return null;
      }

      const item = items[itemIndex];

      // إزالة من السلة
      items.splice(itemIndex, 1);
      localStorage.setItem(this.binKey, JSON.stringify(items));

      // تسجيل في السجل التدقيقي
      AuditLog.log(
        'RESTORE',
        item.entityType,
        item.originalKey,
        `تم استرجاع "${item.entityName}" من سلة المحذوفات`,
        {
          entityName: item.entityName,
          metadata: { trashedItemId: item.id },
        }
      );

      console.log(`✅ تم استرجاع "${item.entityName}" من سلة المحذوفات`);
      return item;
    } catch (error) {
      console.error('❌ خطأ في استرجاع العنصر:', error);
      return null;
    }
  }

  /**
   * استرجاع عنصر وإعادة حفظه في التخزين الرئيسي
   */
  restoreToStorage(trashItemId: string, storageManager: any): boolean {
    try {
      const item = this.restore(trashItemId);
      if (!item) {
        return false;
      }

      // إعادة الحفظ في التخزين الرئيسي
      storageManager.save(item.originalKey, item.data);
      console.log(`✅ تم استرجاع "${item.entityName}" بنجاح`);
      return true;
    } catch (error) {
      console.error('❌ خطأ في استرجاع العنصر إلى التخزين:', error);
      return false;
    }
  }

  /**
   * الحصول على عنصر من السلة
   */
  getItem(trashItemId: string): RecycleBinItem | null {
    const items = this.getItems();
    return items.find(item => item.id === trashItemId) || null;
  }

  /**
   * الحصول على جميع العناصر في السلة
   */
  getAllItems(): RecycleBinItem[] {
    return this.getItems().sort(
      (a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime()
    );
  }

  /**
   * الحصول على عناصر بنوع معين
   */
  getItemsByType(entityType: string): RecycleBinItem[] {
    const items = this.getItems();
    return items
      .filter(item => item.entityType === entityType)
      .sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
  }

  /**
   * الحصول على عناصر مفصولة بمستخدم
   */
  getItemsByUser(deletedBy: string): RecycleBinItem[] {
    const items = this.getItems();
    return items
      .filter(item => item.deletedBy === deletedBy)
      .sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
  }

  /**
   * البحث عن عنصر
   */
  search(query: string): RecycleBinItem[] {
    const items = this.getItems();
    const lowerQuery = query.toLowerCase();
    return items.filter(
      item =>
        item.entityName?.toLowerCase().includes(lowerQuery) ||
        item.originalKey.toLowerCase().includes(lowerQuery) ||
        item.entityType.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * حذف عنصر نهائياً من السلة
   */
  permanentlyDelete(trashItemId: string): boolean {
    try {
      const items = this.getItems();
      const itemIndex = items.findIndex(item => item.id === trashItemId);

      if (itemIndex === -1) {
        console.error('❌ لم يتم العثور على العنصر');
        return false;
      }

      const item = items[itemIndex];
      items.splice(itemIndex, 1);
      localStorage.setItem(this.binKey, JSON.stringify(items));

      AuditLog.log(
        'DELETE',
        item.entityType,
        item.originalKey,
        `تم حذف "${item.entityName}" نهائياً من سلة المحذوفات`,
        {
          entityName: item.entityName,
        }
      );

      console.log(`✅ تم حذف "${item.entityName}" نهائياً`);
      return true;
    } catch (error) {
      console.error('❌ خطأ في الحذف النهائي:', error);
      return false;
    }
  }

  /**
   * حذف جميع العناصر من السلة
   */
  emptyBin(): number {
    try {
      const items = this.getItems();
      const count = items.length;
      localStorage.setItem(this.binKey, JSON.stringify([]));

      AuditLog.log('RESET', 'RecycleBin', 'all', `تم مسح سلة المحذوفات بالكامل`, {
        metadata: { itemsDeleted: count },
      });

      console.log(`✅ تم مسح ${count} عنصر من سلة المحذوفات`);
      return count;
    } catch (error) {
      console.error('❌ خطأ في مسح السلة:', error);
      return 0;
    }
  }

  /**
   * تنظيف العناصر المنتهية صلاحيتها
   */
  cleanup(): number {
    try {
      const items = this.getItems();
      const now = new Date();
      const filtered = items.filter(item => new Date(item.expiresAt) > now);

      const removed = items.length - filtered.length;
      localStorage.setItem(this.binKey, JSON.stringify(filtered));

      if (removed > 0) {
        AuditLog.log('RESET', 'RecycleBin', 'expired', `تم حذف ${removed} عنصر منتهي الصلاحية`, {
          metadata: { itemsRemoved: removed },
        });

        console.log(`✅ تم حذف ${removed} عنصر منتهي الصلاحية`);
      }

      return removed;
    } catch (error) {
      console.error('❌ خطأ في تنظيف السلة:', error);
      return 0;
    }
  }

  /**
   * الحصول على الإحصائيات
   */
  getStats(): RecycleBinStats {
    const items = this.getItems();

    const itemsByType: Record<string, number> = {};
    let totalSize = 0;

    items.forEach(item => {
      itemsByType[item.entityType] = (itemsByType[item.entityType] || 0) + 1;
      totalSize += item.size;
    });

    const sortedByDate = items.sort(
      (a, b) => new Date(a.deletedAt).getTime() - new Date(b.deletedAt).getTime()
    );

    return {
      totalItems: items.length,
      totalSize,
      oldestItem: sortedByDate.length > 0 ? sortedByDate[0].deletedAt : null,
      newestItem: items.length > 0 ? sortedByDate[items.length - 1].deletedAt : null,
      itemsByType,
    };
  }

  /**
   * تصدير سلة المحذوفات
   */
  exportToFile(): void {
    try {
      const items = this.getAllItems();
      const stats = this.getStats();

      const dataStr = JSON.stringify(
        {
          exportDate: new Date().toISOString(),
          stats,
          items,
        },
        null,
        2
      );

      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `melent-recyclebin-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('✅ تم تصدير سلة المحذوفات');
    } catch (error) {
      console.error('❌ خطأ في تصدير السلة:', error);
    }
  }

  /**
   * الحصول على معلومات عن المساحة المستخدمة
   */
  getStorageInfo() {
    const stats = this.getStats();
    const percentOfStorage = (stats.totalSize / (5 * 1024 * 1024)) * 100; // بناءً على حد 5MB

    return {
      ...stats,
      storageUsage: {
        bytes: stats.totalSize,
        kilobytes: (stats.totalSize / 1024).toFixed(2),
        megabytes: (stats.totalSize / (1024 * 1024)).toFixed(2),
        percentOfMax: percentOfStorage.toFixed(2),
      },
    };
  }

  /**
   * حساب حجم البيانات
   */
  private getSize(data: any): number {
    const json = JSON.stringify(data);
    return new Blob([json]).size;
  }

  /**
   * إضافة عنصر
   */
  private addItem(item: RecycleBinItem): void {
    try {
      const items = this.getItems();
      items.push(item);

      // احتفظ بآخر maxItems فقط
      if (items.length > this.maxItems) {
        items.splice(0, items.length - this.maxItems);
      }

      localStorage.setItem(this.binKey, JSON.stringify(items));
    } catch (error) {
      console.error('❌ خطأ في إضافة العنصر:', error);
    }
  }

  /**
   * الحصول على جميع العناصر
   */
  private getItems(): RecycleBinItem[] {
    try {
      const stored = localStorage.getItem(this.binKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * تعيين فترة الاحتفاظ بالبيانات (بالأيام)
   */
  setRetentionDays(days: number): void {
    this.retentionDays = days;
    console.log(`✅ تم تعيين فترة الاحتفاظ بـ ${days} يوم`);
  }

  /**
   * الحصول على معلومات عنصر محذوف
   */
  getItemDetails(trashItemId: string) {
    const item = this.getItem(trashItemId);
    if (!item) return null;

    const now = new Date();
    const expiresAt = new Date(item.expiresAt);
    const daysUntilExpiry = Math.ceil(
      (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      ...item,
      daysUntilExpiry: Math.max(0, daysUntilExpiry),
      isExpired: daysUntilExpiry <= 0,
    };
  }
}

export const RecycleBin = new RecycleBinService();
export default RecycleBin;
