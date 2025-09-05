import React, { useState } from 'react';
import { validateLicense } from '../lib/licenseValidation';
import { saveLicense } from '../lib/licenseStorage';
import { LicenseValidationResult } from '../types/license';

interface LicenseModalProps {
  onLicenseValidated: (result: LicenseValidationResult) => void;
  initialError?: string;
}

function isExpiredError(error: string): boolean {
  return error.includes('expired') || error.includes('Trial period has expired');
}

export default function LicenseModal({ onLicenseValidated, initialError }: LicenseModalProps) {
  const [licenseKey, setLicenseKey] = useState('');
  const [validating, setValidating] = useState(false);
  const [inputError, setInputError] = useState(''); // Separate state for input-specific errors
  const isExpired = isExpiredError(initialError || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim()) {
      setInputError('Please enter a license key');
      return;
    }

    setValidating(true);
    setInputError('');

    try {
      const result = await validateLicense(licenseKey.trim());
      
      if (result.valid) {
        saveLicense(licenseKey.trim());
        onLicenseValidated(result);
      } else {
        setInputError(result.error || 'Invalid license key');
      }
    } catch (err) {
      setInputError('License validation failed. Please try again.');
    } finally {
      setValidating(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(to bottom right, #111827, #1f2937, #111827)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
    }}>
      <div style={{
        background: 'rgba(17, 24, 39, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(75, 85, 99, 0.3)',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        width: '100%',
        maxWidth: '480px',
        maxHeight: '90vh',
        overflow: 'auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          {/* App Icon */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '24px',
          }}>
            <img 
              src="/src-tauri/icons/icon.png" 
              alt="VizTherm" 
              style={{
                width: '56px',
                height: '56px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))'
              }}
            />
          </div>
          
          <h2 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: isExpired ? '#fca5a5' : '#f9fafb',
            marginBottom: '8px',
            background: isExpired 
              ? 'linear-gradient(135deg, #fca5a5, #ef4444)'
              : 'linear-gradient(135deg, #f9fafb, #d1d5db)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {isExpired ? 'License Expired' : 'VizTherm Demo License'}
          </h2>
          <p style={{
            color: '#9ca3af',
            fontSize: '16px',
            lineHeight: '1.5',
          }}>
            Please enter a new license key to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="licenseKey" style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#e5e7eb',
              marginBottom: '8px',
            }}>
              License Key
            </label>
            <input
              id="licenseKey"
              type="text"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              placeholder="VT-XXXXXXXXXXXXXXX"
              disabled={validating}
              style={{
                width: '100%',
                padding: '16px',
                border: inputError ? '2px solid #ef4444' : '1px solid rgba(75, 85, 99, 0.5)',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
                background: validating ? 'rgba(17, 24, 39, 0.5)' : 'rgba(17, 24, 39, 0.8)',
                color: validating ? '#6b7280' : '#f9fafb',
                backdropFilter: 'blur(10px)',
                outline: 'none',
                transition: 'all 0.2s ease',
                boxShadow: inputError ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : 'inset 0 1px 2px rgba(0, 0, 0, 0.2)',
              }}
              onFocus={(e) => {
                if (!inputError) {
                  e.target.style.border = '1px solid #3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }
              }}
              onBlur={(e) => {
                if (!inputError) {
                  e.target.style.border = '1px solid rgba(75, 85, 99, 0.5)';
                  e.target.style.boxShadow = 'inset 0 1px 2px rgba(0, 0, 0, 0.2)';
                }
              }}
            />
          </div>


          <button
            type="submit"
            disabled={validating}
            style={{
              width: '100%',
              padding: '16px 24px',
              background: validating 
                ? 'rgba(156, 163, 175, 0.8)' 
                : 'linear-gradient(135deg, #3b82f6, #1e40af)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: validating ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
              backdropFilter: 'blur(10px)',
              boxShadow: validating 
                ? 'none' 
                : 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseOver={(e) => {
              if (!validating) {
                e.currentTarget.style.transform = 'translateY(-0.5px)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
              }
            }}
            onMouseOut={(e) => {
              if (!validating) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.1)';
              }
            }}
          >
            {validating ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{ 
                  width: '16px', 
                  height: '16px', 
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Validating...
              </span>
            ) : 'Activate License'}
          </button>
        </form>

        <div style={{
          marginTop: '32px',
          padding: '20px',
          background: isExpired ? 'rgba(239, 68, 68, 0.1)' : 'rgba(14, 165, 233, 0.1)',
          borderRadius: '8px',
          border: isExpired ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(14, 165, 233, 0.3)',
          backdropFilter: 'blur(10px)',
        }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: isExpired ? '#fca5a5' : '#7dd3fc',
            marginBottom: '8px',
            margin: '0 0 8px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{ fontSize: '16px' }}>{isExpired ? '⚠️' : 'ℹ️'}</span>
            {isExpired ? 'License Expired' : 'Demo Information'}
          </h4>
          <p style={{
            fontSize: '13px',
            color: '#9ca3af',
            lineHeight: '1.5',
            margin: 0,
          }}>
            {isExpired 
              ? 'Your demo license has expired. Please enter a new license key to continue using VizTherm. Contact support if you need assistance obtaining a new key.'
              : 'This is a demo version of VizTherm with time-limited access. Contact support if you need assistance with your license key.'
            }
          </p>
        </div>

        {/* Add CSS animation for spinner */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}