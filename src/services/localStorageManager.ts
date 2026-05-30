import { 
  MedicalOrder, Client, Product, 
  Expense, AuditLog, SystemMetadata, 
  RecycleBinItem, SystemData, BackupInfo, User
} from '../types';

export const MELENT_KEYS = {
  SYSTEM: 'melent_system',
  CLIENTS: 'melent_clients',
  ORDERS: 'melent_orders',
  PRODUCTS: 'melent_products',
  INVENTORY: 'melent_inventory',
  EXPENSES: 'melent_expenses',
  FINANCE: 'melent_finance',
  REPORTS: 'melent_reports',
  SETTINGS: 'melent_settings',
  USERS: 'melent_users',
  AUDIT_LOGS: 'melent_audit_logs',
  RECYCLE_BIN: 'melent_recycle_bin',
  BACKUPS: 'melent_backups',
  // Compatibility & Professional Keys
  TRAVEL_PATIENTS: 'melent_travel_patients',
  TRAVEL_PROGRAMS: 'melent_travel_programs',
  TRAVEL_HOSPITALS: 'melent_travel_hospitals',
  TRAVEL_DOCTORS: 'melent_travel_doctors',
  TRAVEL_HOTELS: 'melent_travel_hotels',
  TRAVEL_FLIGHTS: 'melent_travel_flights',
  TRAVEL_TRANSFERS: 'melent_travel_transfers',
  TRAVEL_INVOICES: 'melent_travel_invoices',
  TRAVEL_SETTINGS: 'melent_travel_settings',
  LAST_BACKUP: 'melent_last_backup_date',
  AUDIT_LOG: 'melent_audit_log',
};

// Simplified security helper
const Security = {
  hash: (str: string) => {
    // Basic obfuscation for local storage privacy
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; 
    }
    return 'ML_HASH_' + hash.toString(16);
  },
  encrypt: (data: any) => {
    // In a real local-only app, we might use AES with a user-derived key.
    // For this implementation, we use Base64 to prevent simple "peek" in inspector
    return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  },
  decrypt: (cipher: string) => {
    try {
      return JSON.parse(decodeURIComponent(escape(atob(cipher))));
    } catch {
      return null;
    }
  }
};

export const LocalDB = {
  // --- Core Lifecycle ---
  
  initialize: () => {
    const system = localStorage.getItem(MELENT_KEYS.SYSTEM);
    if (!system) {
      const metadata: SystemMetadata = {
        version: '2.0.0-PRO',
        createdAt: new Date().toISOString(),
        recordCount: {},
        status: 'Healthy'
      };
      localStorage.setItem(MELENT_KEYS.SYSTEM, JSON.stringify(metadata));
      LocalDB.logAction('SYSTEM', 'IMPORT', 'SYSTEM_CORE', 'System initialized for first time');
    }
    LocalDB.integrityCheck();
  },

  integrityCheck: () => {
    const keys = Object.values(MELENT_KEYS);
    const issues: string[] = [];
    
    keys.forEach(k => {
      const data = localStorage.getItem(k);
      if (data) {
        try { JSON.parse(data); } 
        catch { 
          issues.push(`Corrupted key: ${k}`);
          // Attempt recovery from last backup if critical
        }
      }
    });

    const metadata = LocalDB.getMetadata();
    if (metadata) {
      metadata.status = issues.length > 0 ? 'Warning' : 'Healthy';
      localStorage.setItem(MELENT_KEYS.SYSTEM, JSON.stringify(metadata));
    }
    
    return { healthy: issues.length === 0, issues };
  },

  // --- CRUD Operations ---

  save: (key: string, data: any, entityId?: string) => {
    // 1. Create Auto-Backup before mutation
    LocalDB._createAutoBackup();

    // 2. Save Data
    localStorage.setItem(key, JSON.stringify(data));

    // 3. Log Audit
    LocalDB.logAction('USER_ACTION', 'UPDATE', key, `Bulk update or single save for ${key}`);

    // 4. Update Metadata Count
    const metadata = LocalDB.getMetadata();
    if (metadata) {
      metadata.recordCount[key] = Array.isArray(data) ? data.length : 1;
      localStorage.setItem(MELENT_KEYS.SYSTEM, JSON.stringify(metadata));
    }
  },

  get: (key: string): any => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  softDelete: (key: string, itemId: string, entityType: string, entityName: string) => {
    const data = LocalDB.get(key) || [];
    if (!Array.isArray(data)) return false;

    const index = data.findIndex((i: any) => i.id === itemId);
    if (index === -1) return false;

    const itemToDelete = data[index];
    
    // 1. Move to Recycle Bin
    const recycleBin = LocalDB.get(MELENT_KEYS.RECYCLE_BIN) || [];
    const binItem: RecycleBinItem = {
      id: Math.random().toString(36).substr(2, 9),
      originalKey: key,
      deletedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
      data: itemToDelete,
      entityType,
      entityName: entityName || itemToDelete.name || itemId
    };
    recycleBin.push(binItem);
    localStorage.setItem(MELENT_KEYS.RECYCLE_BIN, JSON.stringify(recycleBin));

    // 2. Remove from active list
    const updatedData = data.filter((i: any) => i.id !== itemId);
    localStorage.setItem(key, JSON.stringify(updatedData));

    // 3. Log Audit
    LocalDB.logAction('USER_ACTION', 'DELETE', entityType, `Moved ${entityName} to Recycle Bin`);
    
    return true;
  },

  restoreFromRecycleBin: (binItemId: string) => {
    const bin = LocalDB.get(MELENT_KEYS.RECYCLE_BIN) || [];
    const binIndex = bin.findIndex((i: RecycleBinItem) => i.id === binItemId);
    if (binIndex === -1) return false;

    const binItem = bin[binIndex];
    const targetData = LocalDB.get(binItem.originalKey) || [];
    
    targetData.push(binItem.data);
    localStorage.setItem(binItem.originalKey, JSON.stringify(targetData));

    const updatedBin = bin.filter((i: RecycleBinItem) => i.id !== binItemId);
    localStorage.setItem(MELENT_KEYS.RECYCLE_BIN, JSON.stringify(updatedBin));

    LocalDB.logAction('USER_ACTION', 'RESTORE', binItem.entityType, `Restored ${binItem.entityName}`);
    return true;
  },

  // --- Audit & Logs ---

  logAction: (actionType: any, action: AuditLog['action'], entityType: string, details: string) => {
    const logs: AuditLog[] = LocalDB.get(MELENT_KEYS.AUDIT_LOGS) || [];
    const currentUser = JSON.parse(localStorage.getItem('melent_auth_user') || '{"username": "Guest", "id": "0"}');
    
    const newLog: AuditLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: currentUser.id,
      username: currentUser.username,
      timestamp: new Date().toISOString(),
      action,
      entityType,
      entityId: 'SYSTEM',
      details
    };

    logs.unshift(newLog);
    // Keep last 1000 logs
    localStorage.setItem(MELENT_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 1000)));
  },

  // --- Backup System ---

  _createAutoBackup: () => {
    const state = LocalDB._getFullState();
    const backups: any[] = LocalDB.get(MELENT_KEYS.BACKUPS) || [];
    
    const newBackup = {
      id: `BACKUP_${Date.now()}`,
      timestamp: new Date().toISOString(),
      data: Security.encrypt(state),
      type: 'AUTO'
    };

    backups.unshift(newBackup);
    // Rotate 10 backups
    localStorage.setItem(MELENT_KEYS.BACKUPS, JSON.stringify(backups.slice(0, 10)));
  },

  createManualBackup: (label: string) => {
    const state = LocalDB._getFullState();
    const backupStr = JSON.stringify({
      app: 'MELENT_CARE',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      label,
      data: state
    });

    const blob = new Blob([backupStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MELENT_BACKUP_${label}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    LocalDB.logAction('SYSTEM', 'EXPORT', 'FULL_SYSTEM', `Manual backup created: ${label}`);
  },

  importBackup: (jsonData: string): { success: boolean, message: string } => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.app !== 'MELENT_CARE') return { success: false, message: 'Invalid backup file' };
      
      // Before importing, create a recovery point
      LocalDB._createAutoBackup();

      const data = parsed.data;
      Object.entries(data).forEach(([key, val]) => {
        localStorage.setItem(key, val as string);
      });

      LocalDB.logAction('SYSTEM', 'IMPORT', 'FULL_SYSTEM', 'System restored from file');
      return { success: true, message: 'System restored successfully' };
    } catch (e) {
      return { success: false, message: 'Error parsing backup file' };
    }
  },

  // --- Reset & Maintenance ---

  resetBusinessData: () => {
    LocalDB._createAutoBackup();
    
    const businessKeys = [
      MELENT_KEYS.CLIENTS,
      MELENT_KEYS.ORDERS,
      MELENT_KEYS.PRODUCTS,
      MELENT_KEYS.INVENTORY,
      MELENT_KEYS.EXPENSES,
      MELENT_KEYS.FINANCE,
      MELENT_KEYS.REPORTS,
      MELENT_KEYS.AUDIT_LOGS,
      MELENT_KEYS.RECYCLE_BIN
    ];

    businessKeys.forEach(k => localStorage.setItem(k, JSON.stringify([])));
    
    LocalDB.logAction('SYSTEM', 'RESET', 'BUSINESS_DATA', 'Complete business data wipe performed');
  },

  // --- Utilities ---

  getMetadata: (): SystemMetadata | null => {
    return LocalDB.get(MELENT_KEYS.SYSTEM);
  },

  _getFullState: () => {
    const state: any = {};
    Object.values(MELENT_KEYS).forEach(k => {
      // Don't backup the backups themselves in nested state to save space
      if (k !== MELENT_KEYS.BACKUPS) {
        state[k] = localStorage.getItem(k);
      }
    });
    return state;
  },

  hashPassword: (password: string) => Security.hash(password),
};

// Also export as LocalStorageManager for compatibility with existing components
export const LocalStorageManager = {
    ...LocalDB,
    save: (key: string, data: any) => LocalDB.save(key, data),
    get: (key: string) => LocalDB.get(key),
    getLastBackupDate: () => localStorage.getItem(MELENT_KEYS.LAST_BACKUP),
    validateLocalData: () => {
      const issues = LocalDB.integrityCheck().issues;
      return { status: issues.length > 0 ? 'error' : 'stable', issues, usage: 0 };
    },
    exportAllLocalData: () => LocalDB.createManualBackup('LEGACY_EXPORT'),
    importAllLocalData: (json: string) => LocalDB.importBackup(json).success,
    mergeLocalData: (json: string) => LocalDB.importBackup(json).success, // Simple alias for now
    safeClearMelentStorage: (conf: string) => {
      if (conf === "DELETE MELENT DATA") {
         LocalDB.resetBusinessData();
         return true;
      }
      return false;
    }
};
