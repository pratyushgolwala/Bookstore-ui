import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, Shield, Bell, Volume2, VolumeX,
  Save, LogOut, BookOpen, Check,
} from 'lucide-react';
import { selectCurrentUser, logout } from '../../store/slices/authSlice';
import { emitToast } from '../../utils/toastBus';
import COLORS from '../../constants/colors';
import Button from '../../components/ui/Button';

/**
 * SettingsPage — view and edit account details + preferences.
 *
 * Profile edits are stored locally (the backend has no profile-update
 * endpoint yet); when one lands, swap the save handler for an API call.
 */
function SettingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });
  const [saved, setSaved] = useState(false);
  const [muted, setMuted] = useState(false);

  // Seed the form from the current user + persisted overrides
  useEffect(() => {
    let overrides = {};
    try {
      overrides = JSON.parse(localStorage.getItem('profileOverrides') || '{}');
    } catch { /* ignore */ }

    setForm({
      first_name: overrides.first_name ?? user?.first_name ?? '',
      last_name:  overrides.last_name  ?? user?.last_name  ?? '',
      email:      user?.email ?? '',
      phone:      overrides.phone ?? user?.phone ?? '',
    });

    try {
      setMuted(localStorage.getItem('toastMuted') === 'true');
    } catch { /* ignore */ }
  }, [user]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('profileOverrides', JSON.stringify({
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
      }));
    } catch { /* ignore */ }
    setSaved(true);
    emitToast('success', 'Your settings have been saved.');
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    try { localStorage.setItem('toastMuted', String(next)); } catch { /* ignore */ }
    if (!next) emitToast('info', 'Notification sounds enabled.');
  };

  const roleLabel = user?.role
    ? user.role.charAt(0) + user.role.slice(1).toLowerCase()
    : 'Customer';

  return (
    <div
      className="px-4 sm:px-6 py-8 max-w-3xl mx-auto"
      style={{ minHeight: '100vh', backgroundColor: COLORS.parchment.bg, color: COLORS.parchment.text, paddingTop: '100px' }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: COLORS.parchment.text }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: COLORS.parchment.textSoft }}>
          Manage your account details and preferences.
        </p>
      </div>

      {/* Profile summary card */}
      <div
        className="rounded-2xl p-6 mb-6 flex items-center gap-4"
        style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shrink-0"
          style={{ background: COLORS.gradient.primary, color: '#fff' }}
        >
          {(form.first_name || user?.email || 'U').charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-bold truncate">
            {form.first_name || form.last_name
              ? `${form.first_name} ${form.last_name}`.trim()
              : user?.email?.split('@')[0] || 'Reader'}
          </h2>
          <p className="text-sm truncate" style={{ color: COLORS.text.tertiary }}>{form.email}</p>
          <span
            className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: `${COLORS.primary[500]}22`, color: COLORS.primary[600] }}
          >
            <Shield size={11} /> {roleLabel}
          </span>
        </div>
      </div>

      {/* Edit profile form */}
      <form
        onSubmit={handleSave}
        className="rounded-2xl p-6 mb-6"
        style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
      >
        <h3 className="text-base font-bold mb-5 flex items-center gap-2">
          <User size={17} style={{ color: COLORS.secondary[500] }} /> Profile Information
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="First name" icon={<User size={15} />} value={form.first_name} onChange={handleChange('first_name')} placeholder="John" />
          <Field label="Last name"  icon={<User size={15} />} value={form.last_name}  onChange={handleChange('last_name')}  placeholder="Doe" />
        </div>

        {/* Email — read-only (identity field) */}
        <div className="mt-4">
          <label className="text-xs uppercase tracking-wide mb-1.5 flex items-center gap-1.5" style={{ color: COLORS.text.tertiary }}>
            <Mail size={13} /> Email
          </label>
          <input
            value={form.email}
            disabled
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none cursor-not-allowed"
            style={{ backgroundColor: COLORS.surfaceLight, color: COLORS.text.tertiary, border: `1px solid ${COLORS.border}` }}
          />
          <p className="text-xs mt-1" style={{ color: COLORS.text.tertiary }}>
            Email is your account identity and can't be changed here.
          </p>
        </div>

        <div className="mt-4">
          <Field label="Phone" icon={<Phone size={15} />} value={form.phone} onChange={handleChange('phone')} placeholder="+1 555 000 0000" />
        </div>

        <Button type="submit" className="mt-6" leftIcon={saved ? <Check size={16} /> : <Save size={16} />}>
          {saved ? 'Saved' : 'Save Changes'}
        </Button>
      </form>

      {/* Preferences */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
      >
        <h3 className="text-base font-bold mb-5 flex items-center gap-2">
          <Bell size={17} style={{ color: COLORS.secondary[500] }} /> Preferences
        </h3>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            {muted ? <VolumeX size={18} style={{ color: COLORS.text.tertiary }} /> : <Volume2 size={18} style={{ color: COLORS.primary[600] }} />}
            <div>
              <p className="text-sm font-medium">Notification sounds</p>
              <p className="text-xs" style={{ color: COLORS.text.tertiary }}>
                Play a chime on success and error toasts.
              </p>
            </div>
          </div>
          <button
            onClick={toggleMute}
            role="switch"
            aria-checked={!muted}
            className="relative w-12 h-6 rounded-full transition-colors duration-200"
            style={{ backgroundColor: muted ? COLORS.surfaceLight : COLORS.primary[500] }}
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200"
              style={{ transform: muted ? 'translateX(2px)' : 'translateX(26px)' }}
            />
          </button>
        </div>
      </div>

      {/* Account actions */}
      <div
        className="rounded-2xl p-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between"
        style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
      >
        <div>
          <p className="text-sm font-medium">Account</p>
          <p className="text-xs" style={{ color: COLORS.text.tertiary }}>
            Sign out of your Folio account on this device.
          </p>
        </div>
        <button
          onClick={() => { dispatch(logout()); navigate('/'); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
          style={{ color: COLORS.error, border: `1px solid ${COLORS.error}44`, backgroundColor: `${COLORS.error}11` }}
        >
          <LogOut size={15} /> Logout
        </button>
      </div>
    </div>
  );
}

/* ─── Reusable labelled input ─────────────────────────────── */
function Field({ label, icon, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wide mb-1.5 flex items-center gap-1.5" style={{ color: COLORS.text.tertiary }}>
        {icon} {label}
      </label>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all focus:ring-2"
        style={{
          backgroundColor: COLORS.surfaceLight,
          color: COLORS.text.primary,
          border: `1px solid ${COLORS.border}`,
        }}
      />
    </div>
  );
}

export default SettingsPage;
