import { LicenseValidationResult } from '../types/license';
import { decryptData, generateHash } from './licenseEncryption';
import { decryptOptimizedData } from './licenseEncryptionOptimized';

const CURRENT_APP_VERSION = "1.2.0";

export async function validateLicense(licenseKey: string): Promise<LicenseValidationResult> {
  try {
    const parts = licenseKey.trim().split("-");
    if (parts.length !== 2 || parts[0] !== "VT") {
      // Try old format (3 parts)
      if (parts.length === 3 && parts[0] === "VT") {
        return validateLegacyLicense(parts);
      }
      return { valid: false, error: "Invalid key format" };
    }

    // New optimized format: VT-ENCODED_DATA
    const encodedData = parts[1];
    
    // Try to decrypt optimized format
    const keyData = await decryptOptimizedData(encodedData);
    if (!keyData) {
      return { valid: false, error: "Unable to decrypt key data" };
    }

    // Validate key structure
    if (!keyData.referenceTime || !keyData.validDays || !keyData.keyId || !keyData.issuer) {
      return { valid: false, error: "Invalid key data structure" };
    }

    // Verify issuer
    if (keyData.issuer !== "VizTherm-Official") {
      return { valid: false, error: "Invalid key issuer" };
    }

    // Check app version compatibility (optional - can be relaxed)
    if (keyData.appVersion && keyData.appVersion !== CURRENT_APP_VERSION) {
      console.warn(`License issued for version ${keyData.appVersion}, current version is ${CURRENT_APP_VERSION}`);
      // Allow but warn - you might want to make this strict
    }

    // Calculate days elapsed from reference time
    const currentTime = Date.now();
    const referenceTime = keyData.referenceTime;
    const daysPassed = (currentTime - referenceTime) / (1000 * 60 * 60 * 24);

    // Check if within valid period
    if (daysPassed < 0) {
      return { valid: false, error: "Key not yet active" };
    }

    if (daysPassed > keyData.validDays) {
      return { valid: false, error: "Trial period has expired" };
    }

    const daysRemaining = Math.ceil(keyData.validDays - daysPassed);
    return {
      valid: true,
      daysRemaining: daysRemaining,
      keyType: keyData.keyType,
      keyId: keyData.keyId,
    };
  } catch (error) {
    console.error('License validation error:', error);
    return { valid: false, error: "Key validation error" };
  }
}

// Legacy license validation for backwards compatibility
async function validateLegacyLicense(parts: string[]): Promise<LicenseValidationResult> {
  try {
    const encryptedData = parts[1];
    const providedHash = parts[2];

    // Verify hash integrity
    const computedHash = await generateHash(encryptedData);
    if (computedHash !== providedHash) {
      return { valid: false, error: "Key integrity check failed" };
    }

    // Decrypt key data
    const keyData = await decryptData(encryptedData);
    if (!keyData) {
      return { valid: false, error: "Unable to decrypt key data" };
    }

    // Validate key structure
    if (!keyData.referenceTime || !keyData.validDays || !keyData.keyId || !keyData.issuer) {
      return { valid: false, error: "Invalid key data structure" };
    }

    // Verify issuer
    if (keyData.issuer !== "VizTherm-Official") {
      return { valid: false, error: "Invalid key issuer" };
    }

    // Check app version compatibility (optional - can be relaxed)
    if (keyData.appVersion && keyData.appVersion !== CURRENT_APP_VERSION) {
      console.warn(`License issued for version ${keyData.appVersion}, current version is ${CURRENT_APP_VERSION}`);
    }

    // Calculate days elapsed from reference time
    const currentTime = Date.now();
    const referenceTime = keyData.referenceTime;
    const daysPassed = (currentTime - referenceTime) / (1000 * 60 * 60 * 24);

    // Check if within valid period
    if (daysPassed < 0) {
      return { valid: false, error: "Key not yet active" };
    }

    if (daysPassed > keyData.validDays) {
      return { valid: false, error: "Trial period has expired" };
    }

    const daysRemaining = Math.ceil(keyData.validDays - daysPassed);
    return {
      valid: true,
      daysRemaining: daysRemaining,
      keyType: keyData.keyType,
      keyId: keyData.keyId,
    };
  } catch (error) {
    console.error('Legacy license validation error:', error);
    return { valid: false, error: "Key validation error" };
  }
}