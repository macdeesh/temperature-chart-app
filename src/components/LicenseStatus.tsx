
interface LicenseStatusProps {
  daysRemaining: number;
  keyType: string;
  onRenewLicense: () => void;
}

export default function LicenseStatus({ daysRemaining, keyType, onRenewLicense }: LicenseStatusProps) {
  const isExpiringSoon = daysRemaining <= 2;
  const statusColor = isExpiringSoon ? '#dc2626' : daysRemaining <= 5 ? '#d97706' : '#059669';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 12px',
      backgroundColor: '#f8fafc',
      borderRadius: '6px',
      border: `1px solid ${isExpiringSoon ? '#fecaca' : '#e2e8f0'}`,
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: statusColor,
      }} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          fontSize: '13px',
          color: '#64748b',
          fontWeight: '500',
        }}>
          {keyType} License:
        </span>
        
        <span style={{
          fontSize: '13px',
          fontWeight: '600',
          color: statusColor,
        }}>
          {daysRemaining === 1 ? '1 day remaining' : `${daysRemaining} days remaining`}
        </span>
      </div>

      {isExpiringSoon && (
        <button
          onClick={onRenewLicense}
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            fontWeight: '500',
            color: '#dc2626',
            backgroundColor: 'transparent',
            border: '1px solid #dc2626',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#dc2626';
            e.currentTarget.style.color = 'white';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#dc2626';
          }}
        >
          Renew
        </button>
      )}
    </div>
  );
}