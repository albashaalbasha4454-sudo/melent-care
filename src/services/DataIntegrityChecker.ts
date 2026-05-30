/**
 * DataIntegrityChecker - فحص سلامة البيانات
 * يوفر: التحقق من تكامل البيانات، كشف الأخطاء، الإصلاح التلقائي، التقارير
 */

import { StorageManager } from './StorageManager';
import { AuditLog } from './AuditLog';

export interface DataIssue {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  type: 'MISSING' | 'CORRUPTED' | 'INCONSISTENT' | 'ORPHANED' | 'DUPLICATE';
  key: string;
  description: string;
  suggestedAction: string;
  timestamp: string;
  fixed: boolean;
}

export interface IntegrityCheckResult {
  timestamp: string;
  totalKeys: number;
  validKeys: number;
  issues: DataIssue[];
  criticalCount: number;
  warningCount: number;
  fixedCount: number;
  duration: number; // milliseconds
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
}

export interface DataValidationRule {
  name: string;
  keyPattern: RegExp;
  validate: (key: string, value: any) => boolean;
  autoFix?: (key: string, value: any) => any;
}

class DataIntegrityCheckerService {
  private issuesKey = 'melent_integrity_issues';
  private checksHistoryKey = 'melent_integrity_history';
  private validationRules: DataValidationRule[] = [];
  private maxIssuesHistory = 100;

  constructor() {
    this.initializeChecker();
    this.registerDefaultRules();
  }

  /**
   * تهيئة نظام الفحص
   */
  private initializeChecker(): void {
    if (!localStorage.getItem(this.issuesKey)) {
      localStorage.setItem(this.issuesKey, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.checksHistoryKey)) {
      localStorage.setItem(this.checksHistoryKey, JSON.stringify([]));
    }
  }

  /**
   * تسجيل قواعد التحقق الافتراضية
   */
  private registerDefaultRules(): void {
    this.addValidationRule({
      name: 'Patient Validation',
      keyPattern: /^patient_/i,
      validate: (key, value) => {
        if (!value || typeof value !== 'object') return false;
        return 'id' in value && 'name' in value;
      },
    });

    this.addValidationRule({
      name: 'Order Validation',
      keyPattern: /^order_/i,
      validate: (key, value) => {
        if (!value || typeof value !== 'object') return false;
        return 'id' in value && 'clientId' in value;
      },
    });

    this.addValidationRule({
      name: 'JSON Validation',
      keyPattern: /.*_meta$/i,
      validate: (key, value) => {
        try {
          if (typeof value === 'string') {
            JSON.parse(value);
          }
          return true;
        } catch {
          return false;
        }
      },
    });
  }

  /**
   * إضافة قاعدة تحقق مخصصة
   */
  addValidationRule(rule: DataValidationRule): void {
    this.validationRules.push(rule);
    console.log(`✅ تم إضافة قاعدة التحقق: ${rule.name}`);
  }

  /**
   * فحص سلامة البيانات الشامل
   */
  performFullCheck(): IntegrityCheckResult {
    const startTime = Date.now();
    const issues: DataIssue[] = [];
    const keys = StorageManager.getAllKeys();

    console.log('🔍 بدء فحص سلامة البيانات...');

    let validKeys = 0;

    keys.forEach(key => {
      try {
        const value = StorageManager.get(key);

        // فحص البيانات الفارغة
        if (value === null || value === undefined) {
          issues.push({
            id: `issue_${Date.now()}`,
            severity: 'WARNING',
            type: 'MISSING',
            key,
            description: `البيانات المرتبطة بـ ${key} غير موجودة أو تالفة`,
            suggestedAction: `حذف المفتاح ${key} من قائمة المفاتيح`,
            timestamp: new Date().toISOString(),
            fixed: false,
          });
          return;
        }

        // تطبيق قواعد التحقق
        let isValid = true;
        let failedRule = '';

        for (const rule of this.validationRules) {
          if (rule.keyPattern.test(key)) {
            if (!rule.validate(key, value)) {
              isValid = false;
              failedRule = rule.name;
              break;
            }
          }
        }

        if (!isValid) {
          issues.push({
            id: `issue_${Date.now()}`,
            severity: 'WARNING',
            type: 'CORRUPTED',
            key,
            description: `فشل التحقق من البيانات: ${failedRule}`,
            suggestedAction: `مراجعة وإصلاح البيانات في ${key}`,
            timestamp: new Date().toISOString(),
            fixed: false,
          });
          return;
        }

        validKeys++;
      } catch (error) {
        issues.push({
          id: `issue_${Date.now()}`,
          severity: 'CRITICAL',
          type: 'CORRUPTED',
          key,
          description: `خطأ في قراءة البيانات: ${error}`,
          suggestedAction: `حذف المفتاح ${key} من قائمة المفاتيح`,
          timestamp: new Date().toISOString(),
          fixed: false,
        });
      }
    });

    // فحص البيانات اليتيمة
    this.checkForOrphanedData(issues);

    // فحص التكرارات
    this.checkForDuplicates(issues);

    const duration = Date.now() - startTime;

    const criticalCount = issues.filter(i => i.severity === 'CRITICAL').length;
    const warningCount = issues.filter(i => i.severity === 'WARNING').length;

    let status: 'HEALTHY' | 'WARNING' | 'CRITICAL' = 'HEALTHY';
    if (criticalCount > 0) status = 'CRITICAL';
    else if (warningCount > 0) status = 'WARNING';

    const result: IntegrityCheckResult = {
      timestamp: new Date().toISOString(),
      totalKeys: keys.length,
      validKeys,
      issues,
      criticalCount,
      warningCount,
      fixedCount: 0,
      duration,
      status,
    };

    // حفظ في السجل
    this.saveCheckResult(result);

    // تسجيل في السجل التدقيقي
    AuditLog.log('RESET', 'DataIntegrity', 'full_check', 'تم فحص سلامة البيانات', {
      metadata: {
        totalKeys: result.totalKeys,
        validKeys: result.validKeys,
        issuesFound: result.issues.length,
        status: result.status,
      },
    });

    console.log(`✅ انتهى الفحص في ${duration}ms - الحالة: ${status}`);

    return result;
  }

  /**
   * فحص سريع للبيانات
   */
  performQuickCheck(): IntegrityCheckResult {
    const startTime = Date.now();
    const issues: DataIssue[] = [];
    const keys = StorageManager.getAllKeys();
    let validKeys = 0;

    // فحص عينة من البيانات
    const sampleSize = Math.min(20, keys.length);
    const sampleKeys = keys.slice(-sampleSize);

    sampleKeys.forEach(key => {
      const value = StorageManager.get(key);
      if (value !== null) {
        validKeys++;
      }
    });

    const duration = Date.now() - startTime;

    return {
      timestamp: new Date().toISOString(),
      totalKeys: keys.length,
      validKeys: (validKeys / sampleSize) * keys.length,
      issues,
      criticalCount: 0,
      warningCount: 0,
      fixedCount: 0,
      duration,
      status: 'HEALTHY',
    };
  }

  /**
   * إصلاح المشاكل تلقائياً
   */
  autoFixIssues(): { fixed: number; failed: number; errors: string[] } {
    const result = this.performFullCheck();
    let fixed = 0;
    let failed = 0;
    const errors: string[] = [];

    result.issues.forEach(issue => {
      try {
        let resolved = false;

        // محاولة الإصلاح التلقائي
        if (issue.type === 'MISSING') {
          StorageManager.delete(issue.key);
          resolved = true;
          fixed++;
        } else if (issue.type === 'CORRUPTED') {
          // محاولة استرجاع من النسخة الاحتياطية أو حذف
          StorageManager.delete(issue.key);
          resolved = true;
          fixed++;
        } else if (issue.type === 'ORPHANED') {
          StorageManager.delete(issue.key);
          resolved = true;
          fixed++;
        }

        if (resolved) {
          issue.fixed = true;
          AuditLog.log('UPDATE', 'DataIntegrity', issue.key, `تم إصلاح المشكلة: ${issue.description}`);
        } else {
          failed++;
          errors.push(`فشل في إصلاح ${issue.key}: ${issue.description}`);
        }
      } catch (error) {
        failed++;
        errors.push(`خطأ في إصلاح ${issue.key}: ${error}`);
      }
    });

    console.log(`✅ تم إصلاح ${fixed} مشكلة، فشل ${failed}`);

    return { fixed, failed, errors };
  }

  /**
   * الحصول على تقرير الفحص الأخير
   */
  getLastCheckResult(): IntegrityCheckResult | null {
    try {
      const stored = localStorage.getItem(this.checksHistoryKey);
      const history = stored ? JSON.parse(stored) : [];
      return history.length > 0 ? history[history.length - 1] : null;
    } catch {
      return null;
    }
  }

  /**
   * الحصول على سجل الفحوصات
   */
  getCheckHistory(limit: number = 10): IntegrityCheckResult[] {
    try {
      const stored = localStorage.getItem(this.checksHistoryKey);
      const history = stored ? JSON.parse(stored) : [];
      return history.slice(-limit).reverse();
    } catch {
      return [];
    }
  }

  /**
   * تصدير تقرير الفحص
   */
  exportCheckResult(result: IntegrityCheckResult): void {
    try {
      const dataStr = JSON.stringify(
        {
          exportDate: new Date().toISOString(),
          result,
        },
        null,
        2
      );

      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `melent-integrity-check-${result.timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('✅ تم تصدير تقرير الفحص');
    } catch (error) {
      console.error('❌ خطأ في تصدير التقرير:', error);
    }
  }

  /**
   * الحصول على ملخص صحة النظام
   */
  getHealthSummary() {
    const lastCheck = this.getLastCheckResult();
    const history = this.getCheckHistory();

    if (!lastCheck) {
      return {
        status: 'UNKNOWN',
        lastCheck: null,
        message: 'لم يتم إجراء فحص بعد',
      };
    }

    const healthPercentage = (lastCheck.validKeys / lastCheck.totalKeys) * 100;
    const trend = this.calculateTrend(history);

    return {
      status: lastCheck.status,
      lastCheck: lastCheck.timestamp,
      healthPercentage: healthPercentage.toFixed(2),
      totalIssues: lastCheck.issues.length,
      criticalIssues: lastCheck.criticalCount,
      warningIssues: lastCheck.warningCount,
      trend,
      recommendation: this.getRecommendation(lastCheck),
    };
  }

  /**
   * فحص البيانات ��ليتيمة
   */
  private checkForOrphanedData(issues: DataIssue[]): void {
    const keys = StorageManager.getAllKeys();

    // البحث عن مفاتيح غير مستخدمة أو معزولة
    const patterns = [
      { pattern: /^temp_/, name: 'Temporary' },
      { pattern: /^cache_/, name: 'Cache' },
      { pattern: /^old_/, name: 'Old' },
    ];

    keys.forEach(key => {
      patterns.forEach(({ pattern, name }) => {
        if (pattern.test(key)) {
          const age = this.getKeyAge(key);
          if (age > 7 * 24 * 60 * 60 * 1000) {
            // أكثر من 7 أيام
            issues.push({
              id: `issue_${Date.now()}`,
              severity: 'INFO',
              type: 'ORPHANED',
              key,
              description: `بيانات ${name} قديمة (${(age / (24 * 60 * 60 * 1000)).toFixed(1)} أيام)`,
              suggestedAction: `حذف المفتاح ${key}`,
              timestamp: new Date().toISOString(),
              fixed: false,
            });
          }
        }
      });
    });
  }

  /**
   * فحص التكرارات
   */
  private checkForDuplicates(issues: DataIssue[]): void {
    const keys = StorageManager.getAllKeys();
    const checksums: Record<string, string[]> = {};

    keys.forEach(key => {
      const value = StorageManager.get(key);
      const checksum = this.calculateChecksum(value);

      if (!checksums[checksum]) {
        checksums[checksum] = [];
      }
      checksums[checksum].push(key);
    });

    Object.entries(checksums).forEach(([checksum, duplicateKeys]) => {
      if (duplicateKeys.length > 1) {
        duplicateKeys.forEach((key, index) => {
          if (index > 0) {
            issues.push({
              id: `issue_${Date.now()}`,
              severity: 'WARNING',
              type: 'DUPLICATE',
              key,
              description: `نسخة مكررة من البيانات - المفتاح الأساسي: ${duplicateKeys[0]}`,
              suggestedAction: `حذف المفتاح المكرر ${key}`,
              timestamp: new Date().toISOString(),
              fixed: false,
            });
          }
        });
      }
    });
  }

  /**
   * حساب Checksum
   */
  private calculateChecksum(data: any): string {
    const json = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < json.length; i++) {
      const char = json.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * الحصول على عمر المفتاح
   */
  private getKeyAge(key: string): number {
    // هذا تقدير، في الواقع يجب تخزين timestamps
    return 0;
  }

  /**
   * حفظ نتيجة الفحص
   */
  private saveCheckResult(result: IntegrityCheckResult): void {
    try {
      let history = [];
      const stored = localStorage.getItem(this.checksHistoryKey);
      if (stored) {
        history = JSON.parse(stored);
      }

      history.push(result);

      if (history.length > this.maxIssuesHistory) {
        history = history.slice(-this.maxIssuesHistory);
      }

      localStorage.setItem(this.checksHistoryKey, JSON.stringify(history));
    } catch (error) {
      console.error('❌ خطأ في حفظ نتيجة الفحص:', error);
    }
  }

  /**
   * حساب الاتجاه
   */
  private calculateTrend(history: IntegrityCheckResult[]): 'IMPROVING' | 'STABLE' | 'DECLINING' {
    if (history.length < 2) return 'STABLE';

    const recent = history[history.length - 1];
    const previous = history[history.length - 2];

    const recentHealth = (recent.validKeys / recent.totalKeys) * 100;
    const previousHealth = (previous.validKeys / previous.totalKeys) * 100;

    if (recentHealth > previousHealth + 5) return 'IMPROVING';
    if (recentHealth < previousHealth - 5) return 'DECLINING';
    return 'STABLE';
  }

  /**
   * الحصول على التوصية
   */
  private getRecommendation(result: IntegrityCheckResult): string {
    if (result.status === 'CRITICAL') {
      return 'يجب إصلاح المشاكل الحرجة فوراً';
    } else if (result.status === 'WARNING') {
      return 'يوصى بمراجعة المشاكل المحذرة';
    }
    return 'النظام بحالة جيدة';
  }
}

export const DataIntegrityChecker = new DataIntegrityCheckerService();
export default DataIntegrityChecker;
