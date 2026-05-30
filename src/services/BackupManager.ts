/**
 * BackupManager - نظام النسخ الاحتياطية
 * يوفر: عمل نسخ احتياطية تلقائية، إدارة النسخ، ضغط النسخ، حفظ في localStorage
 */

import { StorageManager } from './StorageManager';

export interface BackupInfo {
  id: string;
  timestamp: string;
  label: string;
  size: number;
  type: 'AUTO' | 'MANUAL';
  dataKeys: string[];
  compressed: boolean;
  checksum: string;
}

export interface BackupMetadata {
  totalBackups: number;
  lastBackupTime: string;
  backups: BackupInfo[];
}

class BackupManagerService {
  private backupPrefix = 'melent_backup_';
  private metaKey = 'melent_backups_meta';
  private maxBackups = 10;
  private autoBackupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeBackupSystem();
  }

  /**
   * تهيئة نظام النسخ الاحتياطية
   */
  private initializeBackupSystem(): void {
    const meta = this.getMetadata();
    if (!meta) {
      const metadata: BackupMetadata = {
        totalBackups: 0,
        lastBackupTime: new Date().toISOString(),
        backups: [],
      };
      localStorage.setItem(this.metaKey, JSON.stringify(metadata));
    }
  }

  /**
   * إنشاء نسخة احتياطية يدوية
   */
  createManualBackup(label?: string): BackupInfo | null {
    try {
      const backupLabel = label || `نسخة يدوية - ${new Date().toLocaleString('ar-EG')}`;
      return this.createBackup(backupLabel, 'MANUAL');
    } catch (error) {
      console.error('❌ خطأ في إنشاء نسخة احتياطية:', error);
      return null;
    }
  }

  /**
   * إنشاء نسخة احتياطية تلقائية
   */
  createAutoBackup(): BackupInfo | null {
    try {
      const backupLabel = `نسخة تلقائية - ${new Date().toLocaleString('ar-EG')}`;
      return this.createBackup(backupLabel, 'AUTO');
    } catch (error) {
      console.error('❌ خطأ في إنشاء نسخة احتياطية تلقائية:', error);
      return null;
    }
  }

  /**
   * إنشاء نسخة احتياطية
   */
  private createBackup(label: string, type: 'AUTO' | 'MANUAL'): BackupInfo | null {
    try {
      const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const dataKeys = StorageManager.getAllKeys();

      // جمع جميع البيانات
      const backupData: Record<string, any> = {};
      dataKeys.forEach(key => {
        backupData[key] = StorageManager.get(key);
      });

      // حساب Checksum
      const checksum = this.calculateChecksum(backupData);

      // إنشاء معلومات النسخة
      const backupInfo: BackupInfo = {
        id: backupId,
        timestamp: new Date().toISOString(),
        label,
        size: this.getSize(backupData),
        type,
        dataKeys,
        compressed: true,
        checksum,
      };

      // ضغط وحفظ البيانات
      const compressed = JSON.stringify(backupData);
      const backupKey = this.backupPrefix + backupId;
      localStorage.setItem(backupKey, compressed);

      // تحديث البيانات الوصفية
      this.updateMetadata(backupInfo);

      // حذف النسخ القديمة إذا تجاوزنا الحد الأقصى
      if (this.getBackupCount() > this.maxBackups) {
        this.deleteOldestBackup();
      }

      console.log(`✅ تم إنشاء نسخة احتياطية: ${label}`);
      return backupInfo;
    } catch (error) {
      console.error('❌ خطأ في إنشاء النسخة الاحتياطية:', error);
      return null;
    }
  }

  /**
   * استرجاع من نسخة احتياطية
   */
  restoreFromBackup(backupId: string): boolean {
    try {
      const backupKey = this.backupPrefix + backupId;
      const stored = localStorage.getItem(backupKey);

      if (!stored) {
        console.error('❌ لم يتم العثور على النسخة الاحتياطية');
        return false;
      }

      const backupData = JSON.parse(stored);
      const checksum = this.calculateChecksum(backupData);
      const meta = this.getMetadata();
      const backupInfo = meta?.backups.find(b => b.id === backupId);

      // التحقق من سلامة البيانات
      if (backupInfo && backupInfo.checksum !== checksum) {
        console.error('❌ البيانات المستعادة قد تكون تالفة');
        return false;
      }

      // مسح البيانات الحالية
      const currentKeys = StorageManager.getAllKeys();
      currentKeys.forEach(key => StorageManager.delete(key));

      // استرجاع البيانات
      Object.entries(backupData).forEach(([key, value]) => {
        StorageManager.save(key, value);
      });

      console.log(`✅ تم استرجاع البيانات من النسخة الاحتياطية: ${backupInfo?.label}`);
      return true;
    } catch (error) {
      console.error('❌ خطأ في استرجاع البيانات:', error);
      return false;
    }
  }

  /**
   * الحصول على قائمة النسخ الاحتياطية
   */
  getBackups(): BackupInfo[] {
    const meta = this.getMetadata();
    return meta?.backups || [];
  }

  /**
   * الحصول على نسخة احتياطية معينة
   */
  getBackup(backupId: string): BackupInfo | null {
    const meta = this.getMetadata();
    return meta?.backups.find(b => b.id === backupId) || null;
  }

  /**
   * حذف نسخة احتياطية
   */
  deleteBackup(backupId: string): boolean {
    try {
      const backupKey = this.backupPrefix + backupId;
      localStorage.removeItem(backupKey);

      // تحديث البيانات الوصفية
      const meta = this.getMetadata();
      if (meta) {
        meta.backups = meta.backups.filter(b => b.id !== backupId);
        meta.totalBackups = meta.backups.length;
        localStorage.setItem(this.metaKey, JSON.stringify(meta));
      }

      console.log(`✅ تم حذف النسخة الاحتياطية`);
      return true;
    } catch (error) {
      console.error('❌ خطأ في حذف النسخة الاحتياطية:', error);
      return false;
    }
  }

  /**
   * حذف جميع النسخ الاحتياطية
   */
  deleteAllBackups(): boolean {
    try {
      const backups = this.getBackups();
      backups.forEach(backup => this.deleteBackup(backup.id));

      const meta = this.getMetadata();
      if (meta) {
        meta.backups = [];
        meta.totalBackups = 0;
        localStorage.setItem(this.metaKey, JSON.stringify(meta));
      }

      console.log(`✅ تم حذف جميع النسخ الاحتياطية`);
      return true;
    } catch (error) {
      console.error('❌ خطأ في حذف النسخ الاحتياطية:', error);
      return false;
    }
  }

  /**
   * تفعيل النسخ الاحتياطي التلقائي
   */
  enableAutoBackup(intervalMinutes: number = 30): void {
    if (this.autoBackupInterval) {
      clearInterval(this.autoBackupInterval);
    }

    this.autoBackupInterval = setInterval(() => {
      this.createAutoBackup();
    }, intervalMinutes * 60 * 1000);

    console.log(`✅ تم تفعيل النسخ الاحتياطي التلقائي (كل ${intervalMinutes} دقيقة)`);
  }

  /**
   * إيقاف النسخ الاحتياطي التلقائي
   */
  disableAutoBackup(): void {
    if (this.autoBackupInterval) {
      clearInterval(this.autoBackupInterval);
      this.autoBackupInterval = null;
      console.log('✅ تم إيقاف النسخ الاحتياطي التلقائي');
    }
  }

  /**
   * تحميل النسخة الاحتياطية (تصدير)
   */
  downloadBackup(backupId: string): void {
    try {
      const backupKey = this.backupPrefix + backupId;
      const stored = localStorage.getItem(backupKey);
      const backupInfo = this.getBackup(backupId);

      if (!stored || !backupInfo) {
        console.error('❌ لم يتم العثور على النسخة الاحتياطية');
        return;
      }

      const dataStr = JSON.stringify(
        {
          backup: JSON.parse(stored),
          metadata: backupInfo,
        },
        null,
        2
      );

      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `melent-backup-${backupId}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('✅ تم تحميل النسخة الاحتياطية');
    } catch (error) {
      console.error('❌ خطأ في تحميل النسخة الاحتياطية:', error);
    }
  }

  /**
   * استيراد نسخة احتياطية
   */
  importBackup(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);

          if (parsed.backup && parsed.metadata) {
            const backupId = parsed.metadata.id;
            const backupKey = this.backupPrefix + backupId;
            localStorage.setItem(backupKey, JSON.stringify(parsed.backup));

            this.updateMetadata(parsed.metadata);
            console.log('✅ تم استيراد النسخة الاحتياطية');
            resolve(true);
          } else {
            console.error('❌ صيغة الملف غير صحيحة');
            resolve(false);
          }
        };
        reader.readAsText(file);
      } catch (error) {
        console.error('❌ خطأ في استيراد النسخة الاحتياطية:', error);
        resolve(false);
      }
    });
  }

  /**
   * حساب حجم البيانات
   */
  private getSize(data: any): number {
    const json = JSON.stringify(data);
    return new Blob([json]).size;
  }

  /**
   * حساب Checksum للبيانات
   */
  private calculateChecksum(data: any): string {
    const json = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < json.length; i++) {
      const char = json.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // تحويل إلى 32-bit
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * عدد النسخ الاحتياطية
   */
  private getBackupCount(): number {
    const meta = this.getMetadata();
    return meta?.backups.length || 0;
  }

  /**
   * حذف أقدم نسخة احتياطية
   */
  private deleteOldestBackup(): void {
    const meta = this.getMetadata();
    if (meta && meta.backups.length > 0) {
      const oldest = meta.backups.reduce((prev, current) =>
        new Date(prev.timestamp) < new Date(current.timestamp) ? prev : current
      );
      this.deleteBackup(oldest.id);
    }
  }

  /**
   * تحديث البيانات الوصفية
   */
  private updateMetadata(backupInfo: BackupInfo): void {
    let meta = this.getMetadata();
    if (!meta) {
      meta = {
        totalBackups: 0,
        lastBackupTime: new Date().toISOString(),
        backups: [],
      };
    }

    const existingIndex = meta.backups.findIndex(b => b.id === backupInfo.id);
    if (existingIndex !== -1) {
      meta.backups[existingIndex] = backupInfo;
    } else {
      meta.backups.push(backupInfo);
    }

    meta.totalBackups = meta.backups.length;
    meta.lastBackupTime = new Date().toISOString();
    localStorage.setItem(this.metaKey, JSON.stringify(meta));
  }

  /**
   * الحصول على البيانات الوصفية
   */
  private getMetadata(): BackupMetadata | null {
    const meta = localStorage.getItem(this.metaKey);
    return meta ? JSON.parse(meta) : null;
  }

  /**
   * الحصول على معلومات النسخ الاحتياطية
   */
  getBackupStats() {
    const meta = this.getMetadata();
    const backups = meta?.backups || [];
    const totalSize = backups.reduce((sum, b) => sum + b.size, 0);

    return {
      totalBackups: backups.length,
      totalSize,
      lastBackupTime: meta?.lastBackupTime,
      backups: backups.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    };
  }
}

export const BackupManager = new BackupManagerService();
export default BackupManager;
