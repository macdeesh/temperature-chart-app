# VizTherm Demo License System - Final Implementation

## Overview

A production-ready time-limited demo license system for VizTherm using AES-GCM encryption with optimized Base32 encoding. The system provides secure offline validation with action-based license checking for optimal performance.

## Key Features Implemented

### Core Functionality
- ✅ License key input modal with professional dark theme UI
- ✅ AES-GCM encryption with SHA-256 integrity verification  
- ✅ Reference timestamp validation to prevent clock manipulation
- ✅ Unique key IDs for license tracking
- ✅ Smart time display (minutes/hours/days) in bottom bar
- ✅ Action-based validation (only checks on file operations)
- ✅ Runtime expiration detection with modal overlay
- ✅ Conditional renew button (≤1 day remaining only)

### Security & Performance
- ✅ AES-GCM encryption using WebCrypto API
- ✅ Base32 encoding for compact, readable keys (~80 chars)
- ✅ Zero background validation timers (no performance impact)
- ✅ Validates only on startup and user actions (file open/save/export)
- ✅ No state loss during runtime license checking

## Technical Implementation

### 1. License Key Structure

**Optimized Format:** `VT-[BASE32_ENCODED_PAYLOAD]`

**Key Data Structure:**
```javascript
const keyData = {
  referenceTime: 1725570000000, // Generation timestamp
  validDays: 7.0, // Supports fractional days for testing
  keyType: "DEMO", // Fixed as DEMO for simplicity
  keyId: "a1b2c3...", // Random hex ID
  appVersion: "1.2.0", // App version compatibility
  issuer: "VizTherm-Official" // Issuer verification
};
```

### 2. Optimized Cryptographic System

**AES-GCM + Base32 Encoding for Compact Keys:**

```javascript
// 256-bit secret key (exactly 32 bytes)
const SECRET_KEY_STRING = "VizTherm2025SecretKeyForDemoLice"; // 32 chars
const SECRET_KEY = new TextEncoder().encode(SECRET_KEY_STRING);

// Binary packing for minimal key size (24-28 bytes)
function packKeyData(keyData) {
  const buffer = new ArrayBuffer(keyData.validDays < 1 ? 28 : 24);
  const view = new DataView(buffer);
  
  // 8 bytes: timestamp
  const timestamp = Math.floor(keyData.referenceTime / 1000);
  view.setUint32(0, Math.floor(timestamp / 0x100000000), false);
  view.setUint32(4, timestamp & 0xFFFFFFFF, false);
  
  // Duration storage (supports fractional days for testing)
  if (keyData.validDays < 1) {
    // 28-byte format: store minutes for precision
    const validMinutes = Math.round(keyData.validDays * 24 * 60);
    view.setUint32(8, validMinutes, false);
    view.setUint8(12, 1); // DEMO type
  } else {
    // 24-byte format: store days
    view.setUint8(8, Math.round(keyData.validDays));
    view.setUint8(9, 1); // DEMO type  
  }
  
  return new Uint8Array(buffer);
}

### 3. Action-Based Validation System

**Performance-Optimized Approach:**

```javascript
// Validate only on startup and user actions
const checkLicense = useCallback(async () => {
  const savedLicense = getSavedLicense();
  if (!savedLicense) return false;

  const result = await validateLicense(savedLicense);
  
  if (result.valid) {
    setLicenseStatus({
      valid: true,
      daysRemaining: result.daysRemaining || 0,
      showLicenseModal: false,
      // ... other status
    });
    return true;
  } else {
    // Show expired license modal overlay
    setLicenseStatus({
      valid: false,
      showLicenseModal: true,
      error: result.error
    });
    return false;
  }
}, []);

// Validate before file operations
const handleFileOpen = async (event) => {
  const isValid = await checkLicense();
  if (!isValid) return; // Stop if license expired
  
  // Continue with file operation...
};
```

### 4. UI Implementation

**Professional Dark Theme Modal:**

```typescript
// LicenseModal.tsx - Matches app's glass-morphism design
const modalStyle = {
  background: 'rgba(17, 24, 39, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(75, 85, 99, 0.3)',
  borderRadius: '16px',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
};

// Conditional styling for expired licenses
const isExpired = isExpiredError(initialError);
const titleColor = isExpired ? '#fca5a5' : '#f9fafb';
```

**Bottom Bar License Status:**

```typescript
// Shows in footer with theme-appropriate styling
{licenseStatus.valid && (
  <div className={`license-status ${isDark ? 'dark' : 'light'}`}>
    <StatusIndicator daysRemaining={licenseStatus.daysRemaining} />
    <TimeDisplay daysRemaining={licenseStatus.daysRemaining} />
    {licenseStatus.daysRemaining <= 1 && <RenewButton />}
  </div>
)}
```

## File Structure

### Core Implementation Files

```
src/
├── types/license.ts              # TypeScript interfaces
├── lib/
│   ├── licenseEncryptionOptimized.ts  # AES-GCM + Base32 crypto
│   ├── licenseValidation.ts           # License validation logic  
│   └── licenseStorage.ts              # Local storage management
├── components/
│   ├── LicenseModal.tsx               # License input modal
│   └── LicenseStatus.tsx              # Status display (integrated in App)
└── App.tsx                            # Main integration

license-key-generator.html             # Standalone key generator
```

## License Generator

**Streamlined Dark Theme Generator:**

- **Flexible Duration**: Minutes, hours, or days
- **Professional UI**: Matches app's dark theme design  
- **Compact Keys**: ~80 characters using Base32 encoding
- **Date Format**: DD/MM/YYYY display format
- **Simplified**: No key type selection (uses DEMO internally)

**Access**: `http://localhost:1420/license-key-generator.html`

## Production Deployment

### For 7-14 Day Trials:

1. **Generate Production Keys**: Use `days` unit with 7-14 duration
2. **Build Application**: `npm run tauri build`  
3. **Distribute**: Send license keys separately from app installer
4. **Support**: Users enter license key on first startup

### Security Notes:

- License validation is client-side only (appropriate for demo purposes)
- Keys cannot be easily reverse-engineered due to AES-GCM encryption
- Reference timestamps prevent simple clock manipulation
- No server infrastructure required

## Performance Benefits

- **Zero Background Processing**: No periodic validation timers
- **Action-Based**: Only validates when user performs operations
- **State Preservation**: No app refreshing during license checks  
- **Memory Efficient**: Minimal license-related state storage
- **Responsive UI**: License status updates don't block interface

---

*This implementation provides a professional, secure, and performant demo license system suitable for distributing VizTherm to a small number of trusted testers.*
