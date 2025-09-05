import { LicenseKeyData } from '../types/license';

// Same secret key as optimized generator
const SECRET_KEY_STRING = "VizTherm2025SecretKeyForDemoLice"; // Exactly 32 chars
const SECRET_KEY = new TextEncoder().encode(SECRET_KEY_STRING);

// Base32 decoding
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Decode(str: string): Uint8Array {
  const cleanStr = str.replace(/[^A-Z2-7]/g, '');
  const bytes: number[] = [];
  let bits = 0;
  let value = 0;
  
  for (let i = 0; i < cleanStr.length; i++) {
    const char = cleanStr[i];
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) continue;
    
    value = (value << 5) | index;
    bits += 5;
    
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  
  return new Uint8Array(bytes);
}

function unpackKeyData(packedData: Uint8Array): LicenseKeyData {
  const view = new DataView(packedData.buffer);
  
  // Extract timestamp (8 bytes)
  const timestampHigh = view.getUint32(0, false);
  const timestampLow = view.getUint32(4, false);
  const timestamp = (timestampHigh * 0x100000000 + timestampLow) * 1000; // Convert back to milliseconds
  
  // Check if this is the new format (28 bytes) or old format (24 bytes)
  let validDays: number;
  let typeCode: number;
  let keyIdBytes: Uint8Array;
  
  if (packedData.length === 28) {
    // New format with minutes for short test keys
    const validMinutes = view.getUint32(8, false);
    validDays = validMinutes / (24 * 60); // Convert minutes back to days
    typeCode = view.getUint8(12);
    keyIdBytes = new Uint8Array(packedData.buffer, 13, 15);
  } else {
    // Original format (24 bytes) with days
    validDays = view.getUint8(8);
    typeCode = view.getUint8(9);
    keyIdBytes = new Uint8Array(packedData.buffer, 10, 14);
  }
  
  const typeMap: { [key: number]: string } = { 1: 'DEMO', 2: 'TRIAL', 3: 'EXTENDED', 4: 'TEST' };
  const keyType = typeMap[typeCode] || 'DEMO';
  
  const keyId = Array.from(keyIdBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return {
    referenceTime: timestamp,
    validDays: validDays,
    keyType: keyType,
    keyId: keyId,
    appVersion: "1.2.0",
    issuer: "VizTherm-Official"
  };
}

export async function decryptOptimizedData(encryptedData: string): Promise<LicenseKeyData | null> {
  try {
    // Import the secret key
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      SECRET_KEY,
      'AES-GCM',
      false,
      ['decrypt']
    );

    // Decode base32
    const combined = base32Decode(encryptedData);
    
    // Extract hash (last 8 bytes)
    const hashLength = 8;
    const encryptedPart = combined.slice(0, -hashLength);
    const providedHash = combined.slice(-hashLength);
    
    // Verify hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', encryptedPart);
    const computedHash = new Uint8Array(hashBuffer.slice(0, 8));
    
    // Compare hashes
    for (let i = 0; i < 8; i++) {
      if (providedHash[i] !== computedHash[i]) {
        throw new Error('Hash verification failed');
      }
    }
    
    // Extract IV and encrypted data
    const iv = encryptedPart.slice(0, 12);
    const encrypted = encryptedPart.slice(12);
    
    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      cryptoKey,
      encrypted
    );
    
    // Unpack binary data
    const packedData = new Uint8Array(decrypted);
    return unpackKeyData(packedData);
  } catch (error) {
    console.error('Optimized decryption failed:', error);
    return null;
  }
}

export async function generateOptimizedHash(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer.slice(0, 8)));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}