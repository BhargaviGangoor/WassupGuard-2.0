export enum ThreatLevel {
  SAFE = 'SAFE',
  SUSPICIOUS = 'SUSPICIOUS',
  MALICIOUS = 'MALICIOUS',
  UNKNOWN = 'UNKNOWN'
}

export interface ScanLog {
  id: string;
  fileName: string;
  fileSize: number;
  hash: string;
  timestamp: number;
  threatLevel: ThreatLevel;
  details?: string;
}

export interface SafetyTip {
  id: string;
  title: string;
  description: string;
  icon: string;
  severity: 'low' | 'medium' | 'high';
}

export interface AppSettings {
  apiKey: string;
  backgroundScan: boolean;
  scanIntervalMinutes: number;
}

export interface ScanStats {
  totalScanned: number;
  maliciousCount: number;
  cleanCount: number;
  safeScore: number;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'danger' | 'success';
}