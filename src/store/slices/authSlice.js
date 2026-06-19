import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';
import { getPreviewAuthState } from '../../utils/previewAuth';

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const signupThunk = createAsyncThunk(
  'auth/signup',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await authService.signup(formData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await authService.login(credentials);
      return res.data; // { email }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const verifyOTPThunk = createAsyncThunk(
  'auth/verifyOTP',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await authService.verifyOTP(payload);
      return res.data; // { access, refresh, user }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const verifyEmailThunk = createAsyncThunk(
  'auth/verifyEmail',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await authService.verifyEmail(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const resendVerificationThunk = createAsyncThunk(
  'auth/resendVerification',
  async (email, { rejectWithValue }) => {
    try {
      const res = await authService.resendVerification(email);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const refreshTokenThunk = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { refresh } = getState().auth;
      if (!refresh) throw new Error('No refresh token available.');
      const res = await authService.refreshToken(refresh);
      return res.data; // { access }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const loadFromStorage = () => {
  try {
    return {
      access:  localStorage.getItem('access')  || null,
      refresh: localStorage.getItem('refresh') || null,
      user:    JSON.parse(localStorage.getItem('user') || 'null'),
    };
  } catch {
    return { access: null, refresh: null, user: null };
  }
};

// ─── Slice ───────────────────────────────────────────────────────────────────

// Local-dev preview auth (off unless VITE_PREVIEW_AUTH=true) takes precedence
// over localStorage so gated pages can be viewed without a backend.
const stored = getPreviewAuthState() || loadFromStorage();

const initialState = {
  // Persisted
  access:  stored.access,
  refresh: stored.refresh,
  user:    stored.user,

  // Transient
  pendingEmail: null,   // email waiting for OTP after login step 1
  loading:      false,
  error:        null,
  successMsg:   null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.access       = null;
      state.refresh      = null;
      state.user         = null;
      state.pendingEmail = null;
      state.error        = null;
      state.successMsg   = null;
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      localStorage.removeItem('user');
    },
    /**
     * Set auth directly from an external handoff (e.g. Django-admin SSO).
     * Payload: { access, refresh, user }.
     */
    setCredentials(state, action) {
      const { access, refresh, user } = action.payload || {};
      if (access)  { state.access  = access;  localStorage.setItem('access', access); }
      if (refresh) { state.refresh = refresh; localStorage.setItem('refresh', refresh); }
      if (user)    { state.user    = user;    localStorage.setItem('user', JSON.stringify(user)); }
      state.pendingEmail = null;
      state.error = null;
    },
    clearAuthError(state)   { state.error      = null; },
    clearSuccessMsg(state)  { state.successMsg  = null; },
    setPendingEmail(state, action) { state.pendingEmail = action.payload; },
  },

  extraReducers: (builder) => {
    // ── signup ──────────────────────────────────────────────────────────────
    builder
      .addCase(signupThunk.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(signupThunk.fulfilled, (s) => {
        s.loading    = false;
        s.successMsg = 'Account created! Please check your email to verify your account.';
      })
      .addCase(signupThunk.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })

    // ── login step 1 ────────────────────────────────────────────────────────
      .addCase(loginThunk.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(loginThunk.fulfilled, (s, a) => {
        s.loading      = false;
        s.pendingEmail = a.payload?.email || null;
        s.successMsg   = `OTP sent to ${a.payload?.email}. Check your inbox.`;
      })
      .addCase(loginThunk.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })

    // ── verify OTP (login step 2) ────────────────────────────────────────────
      .addCase(verifyOTPThunk.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(verifyOTPThunk.fulfilled, (s, a) => {
        s.loading      = false;
        s.access       = a.payload.access;
        s.refresh      = a.payload.refresh;
        s.user         = a.payload.user;
        s.pendingEmail = null;
        s.successMsg   = 'Login successful.';
        localStorage.setItem('access',  a.payload.access);
        localStorage.setItem('refresh', a.payload.refresh);
        localStorage.setItem('user',    JSON.stringify(a.payload.user));
      })
      .addCase(verifyOTPThunk.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

    // ── verify email ─────────────────────────────────────────────────────────
      .addCase(verifyEmailThunk.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(verifyEmailThunk.fulfilled, (s) => {
        s.loading    = false;
        s.successMsg = 'Email verified! You can now log in.';
      })
      .addCase(verifyEmailThunk.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

    // ── resend verification ───────────────────────────────────────────────────
      .addCase(resendVerificationThunk.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(resendVerificationThunk.fulfilled, (s) => {
        s.loading    = false;
        s.successMsg = 'Verification email sent. Please check your inbox.';
      })
      .addCase(resendVerificationThunk.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

    // ── refresh token ─────────────────────────────────────────────────────────
      .addCase(refreshTokenThunk.fulfilled, (s, a) => {
        s.access = a.payload.access;
        localStorage.setItem('access', a.payload.access);
      })
      .addCase(refreshTokenThunk.rejected, (s) => {
        // Refresh failed — force logout
        s.access  = null;
        s.refresh = null;
        s.user    = null;
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user');
      });
  },
});

export const { logout, clearAuthError, clearSuccessMsg, setPendingEmail, setCredentials } = authSlice.actions;
export default authSlice.reducer;

// ─── Selectors ───────────────────────────────────────────────────────────────
export const selectIsAuthenticated = (state) => !!state.auth.access;
export const selectCurrentUser     = (state) => state.auth.user;
export const selectAuthLoading     = (state) => state.auth.loading;
export const selectAuthError       = (state) => state.auth.error;
export const selectSuccessMsg      = (state) => state.auth.successMsg;
export const selectPendingEmail    = (state) => state.auth.pendingEmail;
