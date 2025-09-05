export interface LicenseKeyData {
  referenceTime: number;
  validDays: number;
  keyType: string;
  keyId: string;
  appVersion: string;
  issuer: string;
}

export interface LicenseValidationResult {
  valid: boolean;
  error?: string;
  daysRemaining?: number;
  keyType?: string;
  keyId?: string;
}

export interface LicenseStatus {
  valid: boolean;
  daysRemaining: number;
  showLicenseModal: boolean;
  error: string;
  keyId: string | null;
  loading: boolean;
}

export type LicenseKeyType = 'DEMO' | 'TRIAL' | 'EXTENDED';