import { COLORS } from '../../constants/colors';

/**
 * CartPage — Phase 0 placeholder.
 * TODO: Implement cart item list, quantity controls, and checkout CTA.
 */
function CartPage() {
  return (
    <div style={{ backgroundColor: COLORS.background, color: COLORS.text.primary }} className="p-8 min-h-screen">
      <h1 style={{ color: COLORS.text.primary }} className="text-3xl font-bold mb-4">Shopping Cart</h1>
      <p style={{ color: COLORS.text.secondary }}>[ Cart — coming soon ]</p>
      {/* TODO: <CartItemList /> <OrderSummary /> <CheckoutButton /> */}
    </div>
  );
}

export default CartPage;
