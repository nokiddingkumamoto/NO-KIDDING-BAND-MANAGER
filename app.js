(() => {
  "use strict";
  const menu = document.querySelector(".menu-button");
  const sheet = document.querySelector(".side-sheet");
  const backdrop = document.querySelector(".sheet-backdrop");
  const close = document.querySelector(".sheet-close");
  const add = document.querySelector(".add-button");
  const popover = document.querySelector(".add-popover");
  const toast = document.querySelector(".toast");
  const homeScheduleList = document.querySelector(".home-schedule-list");
  const nextStudioCount = document.querySelector(".next-studio-count");
  const nextLiveCount = document.querySelector(".next-live-count");
  const SCHEDULES_KEY = "no-kidding-confirmed-schedules-v1";
  const TYPE_META = {
    studio: { label: "スタジオ" },
    live: { label: "ライブ" },
    other: { label: "その他" }
  };

  const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  };
  const escapeHtml = value => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
  const dateLabel = value => {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const weekday = ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];
    return { date: `${month}/${day}`, weekday: `（${weekday}）` };
  };
  const timeLabel = item => {
    if (item.startTime && item.endTime) return `${item.startTime}–${item.endTime}`;
    if (item.startTime) return item.startTime;
    if (item.endTime) return `～${item.endTime}`;
    return "時間未定";
  };
  const today = new Date();
  const todayKey = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");
  const renderCountdown = (element, type, schedules) => {
    const next = schedules.find(item => item.type === type && item.date >= todayKey);
    if (!next) {
      element.classList.add("is-empty");
      element.innerHTML = "<strong>未定</strong>";
      return;
    }
    const [year, month, day] = next.date.split("-").map(Number);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const target = new Date(year, month - 1, day);
    const days = Math.round((target - todayStart) / 86400000);
    element.classList.remove("is-empty");
    element.innerHTML = `<strong>${days}</strong><span>日</span>`;
  };
  const renderHomeSchedules = () => {
    let schedules = read(SCHEDULES_KEY, []);
    if (!Array.isArray(schedules)) schedules = [];
    schedules = schedules
      .filter(item => item && TYPE_META[item.type] && /^\d{4}-\d{2}-\d{2}$/.test(item.date))
      .sort((a, b) => {
        const aKey = `${a.date}T${a.startTime || "99:99"}`;
        const bKey = `${b.date}T${b.startTime || "99:99"}`;
        return aKey.localeCompare(bKey);
      });
    renderCountdown(nextStudioCount, "studio", schedules);
    renderCountdown(nextLiveCount, "live", schedules);
    const upcoming = schedules.filter(item => item.date >= todayKey);
    const visible = (upcoming.length ? upcoming : schedules.slice(-4)).slice(0, 4);
    homeScheduleList.innerHTML = visible.map(item => {
      const displayDate = dateLabel(item.date);
      const location = item.location?.trim() || "場所未定";
      return `<button class="home-schedule-card ${item.type}" type="button" aria-label="${escapeHtml(item.name)}の確定スケジュールを開く">
        <span class="home-date">
          <strong>${displayDate.date}</strong>
          <small>${displayDate.weekday}</small>
        </span>
        <span class="home-schedule-copy">
          <span class="home-type">${TYPE_META[item.type].label}</span>
          <strong>${escapeHtml(item.name)}</strong>
          <small>
            <span class="home-time-icon" aria-hidden="true"></span>
            <span>${escapeHtml(timeLabel(item))}</span>
            <span class="home-pin-icon" aria-hidden="true"></span>
            <span>${escapeHtml(location)}</span>
          </small>
        </span>
        <span class="home-arrow" aria-hidden="true">›</span>
      </button>`;
    }).join("") || `<button class="home-schedule-empty" type="button">
      <strong>確定スケジュールはまだありません</strong>
      <span>予定を登録すると、ここに最大4件表示されます。</span>
    </button>`;
  };

  const setMenu = open => {
    sheet.classList.toggle("open", open);
    sheet.setAttribute("aria-hidden", String(!open));
    menu.setAttribute("aria-expanded", String(open));
    backdrop.hidden = !open;
  };
  menu.addEventListener("click", () => setMenu(!sheet.classList.contains("open")));
  close.addEventListener("click", () => setMenu(false));
  backdrop.addEventListener("click", () => setMenu(false));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      setMenu(false);
      popover.hidden = true;
      add.setAttribute("aria-expanded", "false");
    }
  });
  add.addEventListener("click", event => {
    event.stopPropagation();
    popover.hidden = !popover.hidden;
    add.setAttribute("aria-expanded", String(!popover.hidden));
  });
  document.addEventListener("click", event => {
    if (!popover.contains(event.target) && event.target !== add) {
      popover.hidden = true;
      add.setAttribute("aria-expanded", "false");
    }
  });
  const notify = message => {
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 1800);
  };
  document.querySelectorAll(".quick-card").forEach(card => {
    card.addEventListener("click", () => {
      const routes = {
        schedule: "schedule.html",
        studio: "studio.html"
      };
      if (routes[card.dataset.target]) {
        window.location.href = routes[card.dataset.target];
        return;
      }
      notify(`${card.getAttribute("aria-label")} は次の開発段階で接続します`);
    });
  });
  homeScheduleList.addEventListener("click", event => {
    if (event.target.closest(".home-schedule-card,.home-schedule-empty")) {
      window.location.href = "schedule.html";
    }
  });
  popover.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
      if (button.dataset.target === "schedule-new") {
        window.location.href = "schedule.html#new";
        return;
      }
      notify(`${button.textContent.trim()} は次の開発段階で接続します`);
      popover.hidden = true;
    });
  });
  window.addEventListener("load", async () => {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(registration => registration.unregister()));
    }
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
    }
  });
  window.addEventListener("storage", event => {
    if (event.key === SCHEDULES_KEY) renderHomeSchedules();
  });
  renderHomeSchedules();
})();
