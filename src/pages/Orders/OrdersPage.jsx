import { COLORS } from '../../constants/colors';

/**
 * OrdersPage — Phase 0 placeholder.
 * TODO: Implement order history table with status tracking and detail drawer.
 */
function OrdersPage() {
  return (
    <div style={{ backgroundColor: COLORS.background, color: COLORS.text.primary }} className="p-8 min-h-screen">
      <h1 style={{ color: COLORS.text.primary }} className="text-3xl font-bold mb-4">My Orders</h1>
      <p style={{ color: COLORS.text.secondary }}>[ Orders — coming soon ]</p>
      {/* TODO: <OrderTable /> <OrderStatusBadge /> <OrderDetailDrawer /> */}
    </div>
  );
}

export default OrdersPage;
