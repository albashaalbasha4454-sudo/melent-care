/**
 * AuditLog - نظام السجل التدقيقي
 * يوفر: تسجيل جميع العمليات، البحث المتقدم، التصفية، والتقارير
 */

export type AuditAction = 
  | 'CREATE' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'RESTORE' 
  | 'EXPORT' 
  | 'IMPORT' 
  | 'RESET' 
  | 'LOGIN' 
  | 'LOGOUT' 
  | 'ARCHIVE' 
  | 'BACKUP' 
  | 'READ';

export interface AuditLogEntry {
  id: string;
  userId: string;
  username: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  entityName?: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  metadata?: Record<string, any>;
}

export interface AuditLogFilter {
  startDate?: string;
  endDate?: string;
  action?: AuditAction;
  userId?: string;
  entityType?: string;
  status?: 'SUCCESS' | 'FAILED' | 'PENDING';
  limit?: number;
}

export interface AuditLogStats {
  totalEntries: number;
  successCount: number;
  failedCount: number;
  lastEntryTime: string;
  actionBreakdown: Record<AuditAction, number>;
  userBreakdown: Record<string, number>;
}

class AuditLogService {
  private logKey = 'melent_audit_logs';
  private maxEntries = 10000;
  private currentUserId = 'system';
  private currentUsername = 'نظام';

  constructor() {
    this.initializeAuditLog();
  }

  /**
   * تهيئة نظام السجل التدقيقي
   */
  private initializeAuditLog(): void {
    if (!localStorage.getItem(this.logKey)) {
      localStorage.setItem(this.logKey, JSON.stringify([]));
    }
  }

  /**
   * تعيين المستخدم الحالي
   */
  setCurrentUser(userId: string, username: string): void {
    this.currentUserId = userId;
    this.currentUsername = username;
  }

  /**
   * إضافة سجل جديد
   */
  log(
    action: AuditAction,
    entityType: string,
    entityId: string,
    details: string,
    options?: {
      entityName?: string;
      status?: 'SUCCESS' | 'FAILED' | 'PENDING';
      changes?: AuditLogEntry['changes'];
      metadata?: Record<string, any>;
      ipAddress?: string;
    }
  ): AuditLogEntry {
    const logEntry: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: this.currentUserId,
      username: this.currentUsername,
      action,
      entityType,
      entityId,
      entityName: options?.entityName,
      details,
      timestamp: new Date().toISOString(),
      status: options?.status || 'SUCCESS',
      changes: options?.changes,
      metadata: options?.metadata,
      ipAddress: options?.ipAddress,
    };

    this.addEntry(logEntry);
    this.logToConsole(logEntry);

    return logEntry;
  }

  /**
   * تسجيل عملية إنشاء
   */
  logCreate(
    entityType: string,
    entityId: string,
    entityName: string,
    data?: Record<string, any>
  ): AuditLogEntry {
    return this.log('CREATE', entityType, entityId, `تم إنشاء ${entityName}`, {
      entityName,
      status: 'SUCCESS',
      changes: { after: data },
    });
  }

  /**
   * تسجيل عملية تحديث
   */
  logUpdate(
    entityType: string,
    entityId: string,
    entityName: string,
    before?: Record<string, any>,
    after?: Record<string, any>
  ): AuditLogEntry {
    return this.log('UPDATE', entityType, entityId, `تم تحديث ${entityName}`, {
      entityName,
      status: 'SUCCESS',
      changes: { before, after },
    });
  }

  /**
   * تسجيل عملية حذف
   */
  logDelete(
    entityType: string,
    entityId: string,
    entityName: string,
    data?: Record<string, any>
  ): AuditLogEntry {
    return this.log('DELETE', entityType, entityId, `تم حذف ${entityName}`, {
      entityName,
      status: 'SUCCESS',
      changes: { before: data },
    });
  }

  /**
   * تسجيل عملية استرجاع
   */
  logRestore(
    entityType: string,
    entityId: string,
    entityName: string
  ): AuditLogEntry {
    return this.log('RESTORE', entityType, entityId, `تم استرجاع ${entityName}`, {
      entityName,
      status: 'SUCCESS',
    });
  }

  /**
   * تسجيل عملية أرشفة
   */
  logArchive(
    entityType: string,
    entityId: string,
    entityName: string
  ): AuditLogEntry {
    return this.log('ARCHIVE', entityType, entityId, `تم أرشفة ${entityName}`, {
      entityName,
      status: 'SUCCESS',
    });
  }

  /**
   * تسجيل عملية تصدير
   */
  logExport(
    entityType: string,
    count: number
  ): AuditLogEntry {
    return this.log(
      'EXPORT',
      entityType,
      'batch',
      `تم تصدير ${count} عنصر من ${entityType}`,
      {
        status: 'SUCCESS',
        metadata: { count },
      }
    );
  }

  /**
   * تسجيل عملية استيراد
   */
  logImport(
    entityType: string,
    count: number
  ): AuditLogEntry {
    return this.log(
      'IMPORT',
      entityType,
      'batch',
      `تم استيراد ${count} عنصر إلى ${entityType}`,
      {
        status: 'SUCCESS',
        metadata: { count },
      }
    );
  }

  /**
   * تسجيل عملية تسجيل الدخول
   */
  logLogin(userId: string, username: string, ipAddress?: string): AuditLogEntry {
    const entry = this.log('LOGIN', 'User', userId, `تسجيل دخول المستخدم ${username}`, {
      entityName: username,
      status: 'SUCCESS',
      ipAddress,
    });

    this.setCurrentUser(userId, username);
    return entry;
  }

  /**
   * تسجيل عملية تسجيل الخروج
   */
  logLogout(): AuditLogEntry {
    return this.log('LOGOUT', 'User', this.currentUserId, `تسجيل خروج المستخدم`, {
      status: 'SUCCESS',
    });
  }

  /**
   * تسجيل عملية نسخة احتياطية
   */
  logBackup(backupId: string, backupLabel: string): AuditLogEntry {
    return this.log('BACKUP', 'Backup', backupId, `تم إنشاء نسخة احتياطية: ${backupLabel}`, {
      entityName: backupLabel,
      status: 'SUCCESS',
    });
  }

  /**
   * تسجيل خطأ
   */
  logError(
    action: AuditAction,
    entityType: string,
    entityId: string,
    error: string
  ): AuditLogEntry {
    return this.log(action, entityType, entityId, `فشل: ${error}`, {
      status: 'FAILED',
    });
  }

  /**
   * الحصول على جميع السجلات
   */
  getAllLogs(limit: number = 100): AuditLogEntry[] {
    const logs = this.getLogs();
    return logs.slice(-limit).reverse();
  }

  /**
   * البحث والتصفية المتقدمة
   */
  search(filter: AuditLogFilter): AuditLogEntry[] {
    let logs = this.getLogs();

    if (filter.startDate) {
      const startTime = new Date(filter.startDate).getTime();
      logs = logs.filter(log => new Date(log.timestamp).getTime() >= startTime);
    }

    if (filter.endDate) {
      const endTime = new Date(filter.endDate).getTime();
      logs = logs.filter(log => new Date(log.timestamp).getTime() <= endTime);
    }

    if (filter.action) {
      logs = logs.filter(log => log.action === filter.action);
    }

    if (filter.userId) {
      logs = logs.filter(log => log.userId === filter.userId);
    }

    if (filter.entityType) {
      logs = logs.filter(log => log.entityType === filter.entityType);
    }

    if (filter.status) {
      logs = logs.filter(log => log.status === filter.status);
    }

    const limit = filter.limit || 100;
    return logs.slice(-limit).reverse();
  }

  /**
   * البحث عن عملية معينة
   */
  searchByEntity(entityType: string, entityId: string): AuditLogEntry[] {
    const logs = this.getLogs();
    return logs
      .filter(log => log.entityType === entityType && log.entityId === entityId)
      .reverse();
  }

  /**
   * الحصول على السجلات حسب المستخدم
   */
  getLogsByUser(userId: string, limit: number = 50): AuditLogEntry[] {
    const logs = this.getLogs();
    return logs.filter(log => log.userId === userId).slice(-limit).reverse();
  }

  /**
   * الحصول على السجلات حسب نوع العملية
   */
  getLogsByAction(action: AuditAction, limit: number = 50): AuditLogEntry[] {
    const logs = this.getLogs();
    return logs.filter(log => log.action === action).slice(-limit).reverse();
  }

  /**
   * الحصول على الإحصائيات
   */
  getStats(): AuditLogStats {
    const logs = this.getLogs();

    const actionBreakdown: Record<AuditAction, number> = {
      CREATE: 0,
      UPDATE: 0,
      DELETE: 0,
      RESTORE: 0,
      EXPORT: 0,
      IMPORT: 0,
      RESET: 0,
      LOGIN: 0,
      LOGOUT: 0,
      ARCHIVE: 0,
      BACKUP: 0,
      READ: 0,
    };

    const userBreakdown: Record<string, number> = {};
    let successCount = 0;
    let failedCount = 0;

    logs.forEach(log => {
      actionBreakdown[log.action]++;

      if (!userBreakdown[log.username]) {
        userBreakdown[log.username] = 0;
      }
      userBreakdown[log.username]++;

      if (log.status === 'SUCCESS') successCount++;
      if (log.status === 'FAILED') failedCount++;
    });

    return {
      totalEntries: logs.length,
      successCount,
      failedCount,
      lastEntryTime: logs.length > 0 ? logs[logs.length - 1].timestamp : new Date().toISOString(),
      actionBreakdown,
      userBreakdown,
    };
  }

  /**
   * تصدير السجلات إلى ملف
   */
  exportToFile(filter?: AuditLogFilter): void {
    try {
      const logs = filter ? this.search(filter) : this.getAllLogs(10000);

      const dataStr = JSON.stringify(
        {
          exportDate: new Date().toISOString(),
          totalRecords: logs.length,
          logs,
        },
        null,
        2
      );

      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `melent-audit-logs-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('✅ تم تصدير السجلات');
    } catch (error) {
      console.error('❌ خطأ في تصدير السجلات:', error);
    }
  }

  /**
   * حذف السجلات القديمة
   */
  cleanupOldLogs(daysToKeep: number = 90): number {
    try {
      const logs = this.getLogs();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      const cutoffTime = cutoffDate.getTime();

      const filtered = logs.filter(
        log => new Date(log.timestamp).getTime() > cutoffTime
      );

      const removed = logs.length - filtered.length;
      localStorage.setItem(this.logKey, JSON.stringify(filtered));

      console.log(`✅ تم حذف ${removed} سجل قديم`);
      return removed;
    } catch (error) {
      console.error('❌ خطأ في حذف السجلات القديمة:', error);
      return 0;
    }
  }

  /**
   * مسح جميع السجلات
   */
  clearAll(): boolean {
    try {
      localStorage.setItem(this.logKey, JSON.stringify([]));
      console.log('✅ تم مسح جميع السجلات');
      return true;
    } catch (error) {
      console.error('❌ خطأ في مسح السجلات:', error);
      return false;
    }
  }

  /**
   * الحصول على تقرير النشاط
   */
  getActivityReport(days: number = 7) {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    const logs = this.search({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      limit: 10000,
    });

    const dailyBreakdown: Record<string, number> = {};
    const hourlyBreakdown: Record<number, number> = {};

    logs.forEach(log => {
      const date = new Date(log.timestamp);
      const dateStr = date.toLocaleDateString('ar-EG');
      const hour = date.getHours();

      dailyBreakdown[dateStr] = (dailyBreakdown[dateStr] || 0) + 1;
      hourlyBreakdown[hour] = (hourlyBreakdown[hour] || 0) + 1;
    });

    return {
      totalLogs: logs.length,
      period: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
      dailyBreakdown,
      hourlyBreakdown,
      stats: this.getStats(),
    };
  }

  /**
   * إضافة سجل إلى المصفوفة
   */
  private addEntry(entry: AuditLogEntry): void {
    try {
      const logs = this.getLogs();
      logs.push(entry);

      // احتفظ بآخر maxEntries فقط
      if (logs.length > this.maxEntries) {
        logs.splice(0, logs.length - this.maxEntries);
      }

      localStorage.setItem(this.logKey, JSON.stringify(logs));
    } catch (error) {
      console.error('❌ خطأ في إضافة السجل:', error);
    }
  }

  /**
   * الحصول على جميع السجلات
   */
  private getLogs(): AuditLogEntry[] {
    try {
      const stored = localStorage.getItem(this.logKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * طباعة السجل في وحدة التحكم
   */
  private logToConsole(entry: AuditLogEntry): void {
    const icons: Record<AuditAction, string> = {
      CREATE: '🟢',
      UPDATE: '🔵',
      DELETE: '🔴',
      RESTORE: '🟡',
      EXPORT: '📤',
      IMPORT: '📥',
      RESET: '⚠️',
      LOGIN: '🔓',
      LOGOUT: '🔒',
      ARCHIVE: '📦',
      BACKUP: '💾',
      READ: '👁️',
    };

    const icon = icons[entry.action] || '📋';
    console.log(
      `${icon} [${entry.timestamp}] ${entry.username} - ${entry.action} - ${entry.entityType}#${entry.entityId}`
    );
  }
}

export const AuditLog = new AuditLogService();
export default AuditLog;
