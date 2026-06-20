import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, LogOut, Package, Heart, Settings } from 'lucide-react';
import { selectCurrentUser, logout } from '../../store/slices/authSlice';
import COLORS from '../../constants/colors';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  const displayName =
    user?.full_name || user?.first_name || user?.email?.split('@')[0] || 'Reader';
  const email = user?.email || 'guest@bookstore.com';
  const role = user?.role || 'CUSTOMER';

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="px-6 py-8 max-w-4xl mx-auto"
      style={{ minHeight: '100vh', backgroundColor: COLORS.parchment.bg, color: COLORS.parchment.text, paddingTop: '100px' }}
    >
      {/* Header card */}
      <div
        className="rounded-sm p-8 mb-6 flex items-center gap-6"
        style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
      >
        <div
          className="w-20 h-20 rounded-md flex items-center justify-center text-2xl font-bold shrink-0 font-display"
          style={{ backgroundColor: COLORS.brass, color: COLORS.ink }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-bold">{displayName}</h1>
          <p className="text-sm flex items-center gap-1.5 mt-1" style={{ color: COLORS.text.secondary }}>
            <Mail size={14} /> {email}
          </p>
          <div className="mt-2">
            <Badge variant="secondary">
              <Shield size={11} className="inline mr-1" />
              {role}
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <QuickLink icon={<Package size={20} />} label="My Orders" onClick={() => navigate('/orders')} />
        <QuickLink icon={<Heart size={20} />} label="Wishlist" onClick={() => navigate('/wishlist')} />
        <QuickLink icon={<Settings size={20} />} label="Settings" onClick={() => navigate('/settings')} />
      </div>

      {/* Account details form */}
      <div
        className="rounded-xl p-6"
        style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
      >
        <h2 className="font-display text-xl font-bold mb-4">Account Details</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full Name" value={displayName} icon={<User size={15} />} />
          <Field label="Email" value={email} icon={<Mail size={15} />} />
          <Field label="Role" value={role} icon={<Shield size={15} />} />
          {user?.phone && <Field label="Phone" value={user.phone} icon={<User size={15} />} />}
        </div>

        <div className="mt-6 pt-6 border-t flex flex-col sm:flex-row gap-3 sm:justify-between" style={{ borderColor: COLORS.border }}>
          <Button
            variant="outline"
            leftIcon={<Settings size={16} />}
            onClick={() => navigate('/settings')}
          >
            Edit Profile
          </Button>
          <Button
            variant="danger"
            leftIcon={<LogOut size={16} />}
            onClick={() => {
              dispatch(logout());
              navigate('/');
            }}
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}

function QuickLink({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-4 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg"
      style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
    >
      <span style={{ color: COLORS.secondary[500] }}>{icon}</span>
      <span className="font-medium" style={{ color: COLORS.text.primary }}>
        {label}
      </span>
    </button>
  );
}

function Field({ label, value, icon }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wide flex items-center gap-1.5 mb-1" style={{ color: COLORS.text.tertiary }}>
        {icon} {label}
      </label>
      <div
        className="px-3 py-2.5 rounded-lg text-sm"
        style={{ backgroundColor: COLORS.surfaceLight, color: COLORS.text.primary }}
      >
        {value}
      </div>
    </div>
  );
}

export default ProfilePage;
