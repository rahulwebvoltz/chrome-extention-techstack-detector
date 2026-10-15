import { useCallback, useEffect, useRef, useState } from "react";
import { MSG, ERROR } from "../shared/messages.js";
import { getActiveTab, sendToBackground } from "../services/messaging.js";

// Scans are usually ~50ms — too fast to perceive. Hold the scanning state
// briefly so the user actually sees feedback that something happened.
const MIN_SCAN_MS = 700;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// status: "loading" | "ready" | "restricted" | "error"
export function useTabScan() {
  const [state, setState] = useState({ status: "loading", data: null, error: null });
  const [tabId, setTabId] = useState(null);
  const [scanning, setScanning] = useState(false);
  // A failed *refresh* keeps the cached result on screen — but must not be
  // silent, or the user sees stale data and thinks it's current.
  const [refreshError, setRefreshError] = useState(null);
  const hasData = useRef(false);
  hasData.current = Boolean(state.data);

  const scan = useCallback(async (id) => {
    setScanning(true);
    const [res] = await Promise.all([sendToBackground(MSG.SCAN_TAB, { tabId: id }), delay(MIN_SCAN_MS)]);
    setScanning(false);

    if (res.ok) {
      setState({ status: "ready", data: res.data, error: null });
      setRefreshError(null);
      return;
    }
    const status = res.error.code === ERROR.RESTRICTED_PAGE ? "restricted" : "error";
    // Keep showing cached data if a refresh fails, but report it.
    if (hasData.current) setRefreshError({ ...res.error, at: Date.now() });
    else setState({ status, data: null, error: res.error });
  }, []);

  useEffect(() => {
    (async () => {
      const tab = await getActiveTab();
      if (!tab?.id) {
        setState({ status: "error", data: null, error: { message: "No active tab." } });
        return;
      }
      setTabId(tab.id);

      // Render cached result instantly, then refresh.
      const cached = await sendToBackground(MSG.GET_TAB_DATA, { tabId: tab.id });
      if (cached.ok && cached.data) setState({ status: "ready", data: cached.data, error: null });

      scan(tab.id);
    })();
  }, [scan]);

  const rescan = useCallback(() => {
    if (tabId) scan(tabId);
  }, [tabId, scan]);

  return { ...state, scanning, rescan, refreshError };
}
