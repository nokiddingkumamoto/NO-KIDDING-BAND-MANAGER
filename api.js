(() => {
  "use strict";

  const API_ROOT = "api";
  const CACHE_KEY = "no-kidding-shared-cache-v9";
  let loginPromise = null;
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

  const loginMarkup = () => {
    const overlay = document.createElement("section");
    overlay.className = "nk-login";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.innerHTML = `<form class="nk-login-card">
      <h2>BAND MEMBER LOGIN</h2>
      <p>メンバー共通のPINを入力してください。</p>
      <label>共有PIN
        <input name="pin" type="password" inputmode="numeric" autocomplete="current-password" maxlength="40" required>
      </label>
      <button type="submit">ログイン</button>
      <p class="nk-login-error" role="alert"></p>
    </form>`;
    document.body.append(overlay);
    return overlay;
  };

  const requestLogin = message => {
    if (loginPromise) return loginPromise;
    loginPromise = new Promise(resolve => {
      const overlay = document.querySelector(".nk-login") || loginMarkup();
      const form = overlay.querySelector("form");
      const input = overlay.querySelector("input");
      const button = overlay.querySelector("button");
      const error = overlay.querySelector(".nk-login-error");
      overlay.hidden = false;
      error.textContent = message || "";
      window.setTimeout(() => input.focus(), 50);
      form.onsubmit = async event => {
        event.preventDefault();
        button.disabled = true;
        error.textContent = "確認しています…";
        try {
          await raw("session", { method:"POST", body:JSON.stringify({ pin:input.value }) });
          input.value = "";
          overlay.hidden = true;
          loginPromise = null;
          resolve(true);
        } catch (failure) {
          error.textContent = failure.message;
          button.disabled = false;
          input.select();
        }
      };
    });
    return loginPromise;
  };

  const ensureSession = async () => {
    try {
      await raw("session");
      return true;
    } catch (error) {
      if (error.status === 503) return requestLogin("Cloudflareの初期設定が完了していません。");
      return requestLogin();
    }
  };

  const request = async (path, options = {}, retry = true) => {
    try { return await raw(path, options); }
    catch (error) {
      if (retry && error.status === 401) {
        await requestLogin("ログインの有効期限が切れました。");
        return request(path, options, false);
      }
      throw error;
    }
  };

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
    await ensureSession();
    if ("serviceWorker" in navigator) {
      const register = () => navigator.serviceWorker.register("sw.js").catch(() => {});
      if (document.readyState === "complete") register();
      else window.addEventListener("load", register, { once:true });
    }
    return callback();
  };

  window.NK = { start, load, save, showError, clearError, cached };
})();
