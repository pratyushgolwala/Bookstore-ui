import { COLORS } from '../../constants/colors';

/**
 * ProfilePage — Phase 0 placeholder.
 * TODO: Implement user profile form, address book, and preferences panel.
 */
function ProfilePage() {
  return (
    <div style={{ backgroundColor: COLORS.background, color: COLORS.text.primary }} className="p-8 min-h-screen">
      <h1 style={{ color: COLORS.text.primary }} className="text-3xl font-bold mb-4">My Profile</h1>
      <p style={{ color: COLORS.text.secondary }}>[ Profile — coming soon ]</p>
      {/* TODO: <ProfileForm /> <AddressBook /> <PreferencesPanel /> */}
    </div>
  );
}

export default ProfilePage;
