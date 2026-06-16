/**
 * analyticsService — calls the FastAPI Analytics microservice.
 *
 * The analytics service is independent of the Django backend and lives at its
 * own base URL (VITE_ANALYTICS_URL, default http://localhost:8001). Unlike the
 * Django API, it returns plain JSON (no { status, data } envelope).
 *
 * The current access token is attached as a Bearer header when available, so
 * the service can be put behind auth later without frontend changes.
 */

const ANALYTICS_URL =
  import.meta.env.VITE_ANALYTICS_URL || 'http://localhost:8001';

let _store = null;

/** Optionally wire the redux store so we can read the access token. */
export function initAnalyticsClient(store) {
  _store = store;
}

function getAccessToken() {
  return _store?.getState().auth.access || localStorage.getItem('access');
}

function buildQuery(params = {}) {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ''
  );
  if (!entries.length) return '';
  const qs = entries
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return `?${qs}`;
}

async function request(method, endpoint, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getAccessToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${ANALYTICS_URL}${endpoint}`, options);

  if (!res.ok) {
    const json = await res.json().catch(() => null);
    const message =
      json?.detail || json?.message || `Analytics request failed (${res.status})`;
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }
  if (res.status === 204) return null;
  return res.json();
}

export const analyticsService = {
  /** Service + dependency health. */
  health: () => request('GET', '/health'),

  // ── Sales ──────────────────────────────────────────────────
  getSalesSummary: (params) => request('GET', `/analytics/sales/summary${buildQuery(params)}`),
  getSalesDaily: (params) => request('GET', `/analytics/sales/daily${buildQuery(params)}`),
  getSalesMonthly: (params) => request('GET', `/analytics/sales/monthly${buildQuery(params)}`),
  getSalesByCategory: (params) => request('GET', `/analytics/sales/by-category${buildQuery(params)}`),
  getSalesByAuthor: (params) => request('GET', `/analytics/sales/by-author${buildQuery(params)}`),

  // ── Inventory ──────────────────────────────────────────────
  getInventoryHealth: () => request('GET', '/analytics/inventory/health'),
  getInventoryTurnover: (params) => request('GET', `/analytics/inventory/turnover${buildQuery(params)}`),
  getSlowMovers: (params) => request('GET', `/analytics/inventory/slow-movers${buildQuery(params)}`),
  getReorderForecast: (params) => request('GET', `/analytics/inventory/reorder-forecast${buildQuery(params)}`),

  // ── Customers ──────────────────────────────────────────────
  getCustomerLTV: (params) => request('GET', `/analytics/customers/ltv${buildQuery(params)}`),
  getCohorts: (params) => request('GET', `/analytics/customers/cohorts${buildQuery(params)}`),
  getAcquisition: (params) => request('GET', `/analytics/customers/acquisition${buildQuery(params)}`),
  getChurnRisk: (params) => request('GET', `/analytics/customers/churn-risk${buildQuery(params)}`),

  // ── Reports ────────────────────────────────────────────────
  generateReport: (body) => request('POST', '/reports/generate', body),
  getReportStatus: (id) => request('GET', `/reports/${id}`),
  /** Absolute URL to download a generated report file. */
  reportDownloadUrl: (id) => `${ANALYTICS_URL}/reports/${id}/download`,

  // ── Direct exports ─────────────────────────────────────────
  salesCsvUrl: (params) => `${ANALYTICS_URL}/exports/sales.csv${buildQuery(params)}`,
  salesXlsxUrl: (params) => `${ANALYTICS_URL}/exports/sales.xlsx${buildQuery(params)}`,
};
