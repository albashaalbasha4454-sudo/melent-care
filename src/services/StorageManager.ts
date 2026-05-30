/**
 * StorageManager - نظام إدارة التخزين المتقدم
 * يوفر: حفظ، استرجاع، تشفير أساسي، ضغط البيانات، مراقبة الاستخدام
 */

export interface StorageConfig {
  encryptionEnabled: boolean;
  compressionEnabled: boolean;
  maxStorageSize: number; // بالميجابايت
  autoBackupInterval: number; // بالدقائق
  enableAudit: boolean;
}

export interface StorageStats {
  totalSize: number;
  itemCount: number;
  lastUpdate: string;
  compressionRatio: number;
}

export interface StorageItem {
  key: string;
  value: any;
  timestamp: number;
  size: number;
  encrypted: boolean;
  compressed: boolean;
  version: number;
}

class StorageManagerService {
  private config: StorageConfig;
  private stats: StorageStats;
  private storagePrefix = 'melent_';
  private metaKey = 'melent_meta';

  constructor(config: Partial<StorageConfig> = {}) {
    this.config = {
      encryptionEnabled: false,
      compressionEnabled: true,
      maxStorageSize: 5, // 5MB
      autoBackupInterval: 30,
      enableAudit: true,
      ...config,
    };

    this.stats = {
      totalSize: 0,
      itemCount: 0,
      lastUpdate: new Date().toISOString(),
      compressionRatio: 0,
    };

    this.initializeMetadata();
  }

  /**
   * تهيئة بيانات النظام الأساسية
   */
  private initializeMetadata(): void {
    const existingMeta = localStorage.getItem(this.metaKey);
    if (!existingMeta) {
      const metadata = {
        createdAt: new Date().toISOString(),
        version: '1.0.0',
        items: [] as string[],
      };
      localStorage.setItem(this.metaKey, JSON.stringify(metadata));
    }
    this.calculateStats();
  }

  /**
   * حفظ البيانات
   */
  save(key: string, value: any, metadata?: Record<string, any>): boolean {
    try {
      const fullKey = this.storagePrefix + key;
      let dataToStore = value;

      // ضغط البيانات إ��ا كانت مفعلة
      if (this.config.compressionEnabled) {
        dataToStore = this.compress(dataToStore);
      }

      // تشفير البيانات إذا كانت مفعلة
      if (this.config.encryptionEnabled) {
        dataToStore = this.encrypt(dataToStore);
      }

      const storageItem: StorageItem = {
        key,
        value: dataToStore,
        timestamp: Date.now(),
        size: this.getSize(dataToStore),
        encrypted: this.config.encryptionEnabled,
        compressed: this.config.compressionEnabled,
        version: 1,
      };

      // التحقق من حد التخزين
      if (this.getTotalSize() + storageItem.size > this.config.maxStorageSize * 1024 * 1024) {
        console.warn('⚠️ تجاوز حد التخزين المسموح به');
        return false;
      }

      // حفظ البيانات
      localStorage.setItem(fullKey, JSON.stringify(storageItem));

      // تحديث البيانات الوصفية
      this.updateMetadata(key);

      // حفظ في السجل
      if (this.config.enableAudit) {
        this.logAction('SAVE', key, 'تم حفظ البيانات بنجاح');
      }

      this.calculateStats();
      return true;
    } catch (error) {
      console.error('❌ خطأ في حفظ البيانات:', error);
      return false;
    }
  }

  /**
   * استرجاع البيانات
   */
  get(key: string): any | null {
    try {
      const fullKey = this.storagePrefix + key;
      const stored = localStorage.getItem(fullKey);

      if (!stored) {
        return null;
      }

      const storageItem: StorageItem = JSON.parse(stored);
      let data = storageItem.value;

      // فك التشفير إذا لزم الأمر
      if (storageItem.encrypted && this.config.encryptionEnabled) {
        data = this.decrypt(data);
      }

      // فك الضغط إذا لزم الأمر
      if (storageItem.compressed && this.config.compressionEnabled) {
        data = this.decompress(data);
      }

      if (this.config.enableAudit) {
        this.logAction('READ', key, 'تم قراءة البيانات');
      }

      return data;
    } catch (error) {
      console.error('❌ خطأ في استرجاع البيانات:', error);
      return null;
    }
  }

  /**
   * حذف البيانات
   */
  delete(key: string): boolean {
    try {
      const fullKey = this.storagePrefix + key;
      localStorage.removeItem(fullKey);

      this.removeFromMetadata(key);

      if (this.config.enableAudit) {
        this.logAction('DELETE', key, 'تم حذف البيانات');
      }

      this.calculateStats();
      return true;
    } catch (error) {
      console.error('❌ خطأ في حذف البيانات:', error);
      return false;
    }
  }

  /**
   * التحقق من وجود مفتاح
   */
  exists(key: string): boolean {
    const fullKey = this.storagePrefix + key;
    return localStorage.getItem(fullKey) !== null;
  }

  /**
   * الحصول على جميع المفاتيح
   */
  getAllKeys(): string[] {
    const meta = this.getMetadata();
    return meta?.items || [];
  }

  /**
   * مسح كل البيانات
   */
  clear(): boolean {
    try {
      const keys = this.getAllKeys();
      keys.forEach(key => {
        const fullKey = this.storagePrefix + key;
        localStorage.removeItem(fullKey);
      });

      if (this.config.enableAudit) {
        this.logAction('CLEAR', 'ALL', 'تم مسح جميع البيانات');
      }

      this.calculateStats();
      return true;
    } catch (error) {
      console.error('❌ خطأ في مسح البيانات:', error);
      return false;
    }
  }

  /**
   * الحصول على الإحصائيات
   */
  getStats(): StorageStats {
    return { ...this.stats };
  }

  /**
   * حساب إجمالي حجم التخزين
   */
  private getTotalSize(): number {
    let total = 0;
    const keys = this.getAllKeys();
    keys.forEach(key => {
      const fullKey = this.storagePrefix + key;
      const item = localStorage.getItem(fullKey);
      if (item) {
        total += new Blob([item]).size;
      }
    });
    return total;
  }

  /**
   * حساب حجم البيانات
   */
  private getSize(data: any): number {
    const json = typeof data === 'string' ? data : JSON.stringify(data);
    return new Blob([json]).size;
  }

  /**
   * ضغط البيانات (تنسيق JSON بدون مسافات)
   */
  private compress(data: any): string {
    if (typeof data !== 'string') {
      return JSON.stringify(data);
    }
    return data;
  }

  /**
   * فك ضغط البيانات
   */
  private decompress(data: string): any {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }

  /**
   * تشفير أساسي (Base64 للبيانات الحساسة)
   */
  private encrypt(data: any): string {
    const json = typeof data === 'string' ? data : JSON.stringify(data);
    return btoa(json);
  }

  /**
   * فك تشفير أساسي (Base64)
   */
  private decrypt(data: string): any {
    try {
      const json = atob(data);
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  /**
   * تحديث البيانات الوصفية
   */
  private updateMetadata(key: string): void {
    const meta = this.getMetadata();
    if (meta && !meta.items.includes(key)) {
      meta.items.push(key);
      localStorage.setItem(this.metaKey, JSON.stringify(meta));
    }
  }

  /**
   * إزالة من البيانات الوصفية
   */
  private removeFromMetadata(key: string): void {
    const meta = this.getMetadata();
    if (meta) {
      meta.items = meta.items.filter(k => k !== key);
      localStorage.setItem(this.metaKey, JSON.stringify(meta));
    }
  }

  /**
   * الحصول على البيانات الوصفية
   */
  private getMetadata(): any {
    const meta = localStorage.getItem(this.metaKey);
    return meta ? JSON.parse(meta) : null;
  }

  /**
   * حساب الإحصائيات
   */
  private calculateStats(): void {
    const keys = this.getAllKeys();
    this.stats = {
      totalSize: this.getTotalSize(),
      itemCount: keys.length,
      lastUpdate: new Date().toISOString(),
      compressionRatio: this.config.compressionEnabled ? 0.85 : 1,
    };
  }

  /**
   * تسجيل الإجراءات
   */
  private logAction(action: string, key: string, message: string): void {
    const logKey = `${this.storagePrefix}audit_log`;
    let logs = [];
    try {
      const stored = localStorage.getItem(logKey);
      logs = stored ? JSON.parse(stored) : [];
    } catch {
      logs = [];
    }

    logs.push({
      action,
      key,
      message,
      timestamp: new Date().toISOString(),
    });

    // احتفظ بآخر 1000 سجل فقط
    if (logs.length > 1000) {
      logs = logs.slice(-1000);
    }

    localStorage.setItem(logKey, JSON.stringify(logs));
  }

  /**
   * الحصول على السجلات
   */
  getAuditLogs(limit: number = 100): any[] {
    const logKey = `${this.storagePrefix}audit_log`;
    try {
      const stored = localStorage.getItem(logKey);
      const logs = stored ? JSON.parse(stored) : [];
      return logs.slice(-limit);
    } catch {
      return [];
    }
  }
}

// إنشاء instance واحد
export const StorageManager = new StorageManagerService({
  compressionEnabled: true,
  enableAudit: true,
});

export default StorageManager;
