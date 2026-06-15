import { configureStore } from '@reduxjs/toolkit';
import authReducer   from './slices/authSlice';
import booksReducer  from './slices/booksSlice';
import cartReducer   from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import ordersReducer from './slices/ordersSlice';
import uiReducer     from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth:     authReducer,
    books:    booksReducer,
    cart:     cartReducer,
    wishlist: wishlistReducer,
    orders:   ordersReducer,
    ui:       uiReducer,
  },
});
