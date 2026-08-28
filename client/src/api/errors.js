/**
 * Centralized HTTP-status error handling for the API layer.
 *
 * The mocks throw `ApiError` with a `status`; when a real backend lands, its
 * client should throw the same shape (see `handleApiError`, which also reads
 * `error.response?.status` for axios-style errors). Keeping the status on the
 * error lets page-level handling keep reading `error.message`/`error.data`
 * while this module decides whether the status means a hard redirect.
 *
 * Only 401/403 and the 5xx family redirect. 400/422/404 and friends stay with
 * the page or form that made the call -- those are validation, not-found, and
 * business-rule cases that already have their own UI.
 */

let navigateFn = null;
let lastRedirect = { path: null, at: 0 };

/** Register the router navigator. Called once from inside <BrowserRouter>. */
export function registerApiNavigator(navigate) {
  navigateFn = navigate;
}

export class ApiError extends Error {
  constructor(status, message, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function pathForStatus(status) {
  if (status === 401) return "/401";
  if (status === 403) return "/403";
  if (status === 500 || status === 502 || status === 503 || status === 504) return "/500";
  return null;
}

/**
 * Read the HTTP status off an error and, when it is one of the hard-fail
 * statuses, navigate to the matching error page. A single redirect is enough
 * even if many requests fail at once, and navigating to the page we are
 * already on is a no-op, so no loop is possible.
 *
 * Returns nothing and never throws -- local onError handlers must still see
 * the original error, so this must not swallow or replace it.
 */
export function handleApiError(error) {
  if (!error) return;
  const status = error.status ?? error.response?.status;
  const path = pathForStatus(status);
  if (!path || !navigateFn) return;

  const now = Date.now();
  if (path === lastRedirect.path && now - lastRedirect.at < 1000) return;
  lastRedirect = { path, at: now };
  navigateFn(path, { replace: true });
}
