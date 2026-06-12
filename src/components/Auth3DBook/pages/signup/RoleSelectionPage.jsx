import { Users, PenTool } from 'lucide-react';
import styles from '../../Auth3DBook.module.css';

function RoleSelectionPage({ onRoleSelect, onBackToLogin }) {
  const roles = [
    {
      id: 'CUSTOMER',
      icon: <Users size={22} />,
      iconColor: '#d4933e',
      title: 'Browse & Buy Books',
      desc: 'Discover books and build your personal library',
      accent: 'rgba(212,147,62,0.12)',
      border: 'rgba(212,147,62,0.25)',
    },
    {
      id: 'AUTHOR',
      icon: <PenTool size={22} />,
      iconColor: '#d48080',
      title: 'Publish Your Books',
      desc: 'Share your stories with readers worldwide',
      accent: 'rgba(212,128,128,0.12)',
      border: 'rgba(212,128,128,0.25)',
    },
  ];

  return (
    <div className={styles.bookPage}>
      <h1 className={styles.pageHeading}>Join our community</h1>
      <p className={styles.pageSubheading}>How would you like to get started?</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => onRoleSelect(role.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '18px 20px', textAlign: 'left',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px', cursor: 'pointer',
              transition: 'all 0.18s ease', width: '100%',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = role.accent;
              e.currentTarget.style.borderColor = role.border;
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${role.iconColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: role.iconColor }}>
              {role.icon}
            </div>
            <div>
              <p style={{ margin: '0 0 3px', fontSize: '14px', fontWeight: '600', color: '#f0f0f0', fontFamily: 'Inter, sans-serif' }}>{role.title}</p>
              <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif' }}>{role.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <div className={styles.divider} style={{ margin: 0 }} />

      <p className={styles.helperText} style={{ margin: '16px 0 0' }}>
        Already have an account?{' '}
        <button onClick={onBackToLogin} className={styles.linkPrimary}>Sign in</button>
      </p>
    </div>
  );
}

export default RoleSelectionPage;
