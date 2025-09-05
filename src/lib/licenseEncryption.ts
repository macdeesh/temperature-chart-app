import { LicenseKeyData } from '../types/license';

// 256-bit secret key (embed in app, same for key generator)
const SECRET_KEY_STRING = "VizTherm2025SecretKeyForDemoLicenses"; // 36 chars, need exactly 32
const SECRET_KEY_PADDED = SECRET_KEY_STRING.padEnd(32, '0').substring(0, 32); // Ensure exactly 32 chars
const SECRET_KEY = new TextEncoder().encode(SECRET_KEY_PADDED);

export async function encryptData(data: LicenseKeyData): Promise<string | null> {
  try {
    // Import the secret key
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      SECRET_KEY,
      'AES-GCM',
      false,
      ['encrypt']
    );

    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt the data
    const jsonString = JSON.stringify(data);
    const encodedData = new TextEncoder().encode(jsonString);
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      cryptoKey,
      encodedData
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption failed:', error);
    return null;
  }
}

export async function decryptData(encryptedData: string): Promise<LicenseKeyData | null> {
  try {
    // Import the secret key
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      SECRET_KEY,
      'AES-GCM',
      false,
      ['decrypt']
    );

    // Decode base64
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    );
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      cryptoKey,
      encrypted
    );
    
    const jsonString = new TextDecoder().decode(decrypted);
    return JSON.parse(jsonString) as LicenseKeyData;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

export async function generateHash(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}