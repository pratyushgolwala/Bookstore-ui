import { Users, PenTool } from 'lucide-react';
import styles from '../../Auth3DBook.module.css';

/**
 * RoleSelectionPage — Page 1 of signup book
 * Allows user to select between Customer or Author role
 */
function RoleSelectionPage({ onRoleSelect, onBackToLogin }) {
  return (
    <div className={styles.bookPage}>
      {/* Heading */}
      <h1 className={styles.pageHeading}>Join Our Community</h1>

      {/* Subheading */}
      <p className={styles.pageSubheading}>Choose how you'd like to get started</p>

      {/* Role Options Container */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
        {/* Customer Role Card */}
        <button
          onClick={() => onRoleSelect('CUSTOMER')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            backgroundColor: '#1a1a1a',
            border: '2px solid #5c5c8f',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            gap: '12px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2a2a2a';
            e.currentTarget.style.borderColor = '#d4933e';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(92, 92, 143, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#1a1a1a';
            e.currentTarget.style.borderColor = '#5c5c8f';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Users size={32} color="#d4933e" />
          <h3 style={{ margin: 0, color: '#e8e8e8', fontSize: '16px', fontWeight: '600' }}>
            Browse & Buy Books
          </h3>
          <p
            style={{
              margin: 0,
              color: '#a8a8a8',
              fontSize: '13px',
              textAlign: 'center',
            }}
          >
            Discover thousands of books and build your personal library
          </p>
        </button>

        {/* Author Role Card */}
        <button
          onClick={() => onRoleSelect('AUTHOR')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            backgroundColor: '#1a1a1a',
            border: '2px solid #5c5c8f',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            gap: '12px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2a2a2a';
            e.currentTarget.style.borderColor = '#d48080';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(92, 92, 143, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#1a1a1a';
            e.currentTarget.style.borderColor = '#5c5c8f';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <PenTool size={32} color="#d48080" />
          <h3 style={{ margin: 0, color: '#e8e8e8', fontSize: '16px', fontWeight: '600' }}>
            Publish Your Books
          </h3>
          <p
            style={{
              margin: 0,
              color: '#a8a8a8',
              fontSize: '13px',
              textAlign: 'center',
            }}
          >
            Share your stories with readers around the world
          </p>
        </button>
      </div>

      {/* Back to Login Link */}
      <button
        onClick={onBackToLogin}
        className={styles.linkSecondary}
        style={{
          marginTop: '24px',
          textDecoration: 'none',
        }}
      >
        Back to Login
      </button>
    </div>
  );
}

export default RoleSelectionPage;
