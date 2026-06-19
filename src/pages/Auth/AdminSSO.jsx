import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials } from '../../store/slices/authSlice';
import COLORS from '../../constants/colors';

/**
 * AdminSSO — single sign-on handoff from the Django admin.
 *
 * The backend (/admin/analytics/dashboard/) mints a JWT for the logged-in staff
 * user and redirects here with the tokens in the URL fragment:
 *   /admin/sso#access=...&refresh=...&user=<json>
 *
 * We read them from the hash (fragments are never sent to servers), store the
 * session, scrub the hash from history, then forward to /admin.
 */
function AdminSSO() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const hash = window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : window.location.hash;
    const params = new URLSearchParams(hash);

    const access = params.get('access');
    const refresh = params.get('refresh');
    const userRaw = params.get('user');

    if (!access || !refresh) {
      setError('Missing sign-in details. Please open the dashboard from the admin again.');
      return;
    }

    let user = null;
    try {
      user = userRaw ? JSON.parse(userRaw) : null;
    } catch {
      user = null;
    }

    dispatch(setCredentials({ access, refresh, user }));

    // Scrub tokens from the URL/history before moving on.
    window.history.replaceState(null, '', '/admin/sso');

    navigate('/admin', { replace: true });
  }, [dispatch, navigate]);

  return (
    <div
      className="flex flex-col items-center justify-center text-center px-6"
      style={{ minHeight: '100vh', backgroundColor: COLORS.background }}
    >
      {error ? (
        <p style={{ color: COLORS.error }}>{error}</p>
      ) : (
        <>
          <div
            className="w-12 h-12 rounded-full animate-spin mb-4"
            style={{ border: `3px solid ${COLORS.border}`, borderTopColor: COLORS.brass }}
          />
          <p style={{ color: COLORS.text.secondary }}>Signing you in…</p>
        </>
      )}
    </div>
  );
}

export default AdminSSO;
