import { COLORS } from '../../constants/colors';

/**
 * AdminPage — Phase 0 placeholder.
 * TODO: Implement admin dashboard with stats, inventory, orders, and user management.
 */
function AdminPage() {
  return (
    <div style={{ backgroundColor: COLORS.background, color: COLORS.text.primary }} className="p-8 min-h-screen">
      <h1 style={{ color: COLORS.text.primary }} className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <p style={{ color: COLORS.text.secondary }}>[ Admin — coming soon ]</p>
      {/* TODO: <StatsCards /> <RecentOrdersTable /> <InventoryAlerts /> <UserManagement /> */}
    </div>
  );
}

export default AdminPage;
