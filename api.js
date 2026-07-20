(() => {
  "use strict";

  const API_ROOT = "api";
  const CACHE_KEY = "no-kidding-shared-cache-v9";
  let errorBanner = null;

  const parseResponse = async response => {
    let body = {};
    try { body = await response.json(); }
    catch { /* Cloudflare以外の応答でも利用者向けエラーに変換する */ }
    if (!response.ok) {
      const error = new Error(body.error || `通信エラー（${response.status}）`);
      error.status = response.status;
      error.body = body;
      throw error;
    }
    return body;
  };

  const raw = (path, options = {}) => fetch(`${API_ROOT}/${path}`, {
    credentials:"same-origin",
    cache:"no-store",
    headers:{ "content-type":"application/json", ...(options.headers || {}) },
    ...options
  }).then(parseResponse);

  const request = (path, options = {}) => raw(path, options);

  const showError = message => {
    if (!errorBanner) {
      errorBanner = document.createElement("div");
      errorBanner.className = "nk-sync-error";
      errorBanner.setAttribute("role", "alert");
      document.body.append(errorBanner);
    }
    errorBanner.textContent = message;
    errorBanner.hidden = false;
  };

  const clearError = () => { if (errorBanner) errorBanner.hidden = true; };
  const cache = data => {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); }
    catch { /* 容量不足時もオンライン動作を続ける */ }
  };
  const cached = () => {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY)); }
    catch { return null; }
  };

  const load = async ({ fallback = true } = {}) => {
    try {
      const data = await request("data");
      cache(data);
      clearError();
      return data;
    } catch (error) {
      const saved = fallback ? cached() : null;
      if (saved) {
        showError("オフラインのため、最後に同期したデータを表示しています。");
        return saved;
      }
      showError(error.message);
      throw error;
    }
  };

  const save = async (action, payload = {}) => {
    document.body.classList.add("nk-busy");
    try {
      const response = await request("data", {
        method:"POST",
        body:JSON.stringify({ action, ...payload })
      });
      if (response.data) cache(response.data);
      clearError();
      return response.data;
    } finally {
      document.body.classList.remove("nk-busy");
    }
  };

  const start = async callback => {
    if ("serviceWorker" in navigator) {
      const register = () => navigator.serviceWorker.register("sw.js").catch(() => {});
      if (document.readyState === "complete") register();
      else window.addEventListener("load", register, { once:true });
    }
    return callback();
  };

  window.NK = { start, load, save, showError, clearError, cached };
})();
