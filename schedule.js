(() => {
  "use strict";

  const STORAGE_KEY = "no-kidding-confirmed-schedules-v1";
  const MONTH_KEY = "no-kidding-confirmed-schedule-month-v1";
  const TYPE_META = {
    studio: { label: "スタジオ" },
    live: { label: "ライブ" },
    other: { label: "その他" }
  };

  const $ = selector => document.querySelector(selector);
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
  const today = new Date();
  const todayKey = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");
  const makeId = () => globalThis.crypto?.randomUUID?.()
    || `schedule-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const dateLabel = value => {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const weekday = ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];
    return `${month}/${day}（${weekday}）`;
  };
  const timeLabel = item => {
    if (item.startTime && item.endTime) return `${item.startTime}–${item.endTime}`;
    if (item.startTime) return item.startTime;
    if (item.endTime) return `～${item.endTime}`;
    return "時間未定";
  };

  const monthInput = $("#schedule-month");
  const showAllButton = $(".show-all");
  const scheduleCount = $(".schedule-count");
  const scheduleList = $(".schedule-list");
  const dialog = $(".schedule-dialog");
  const form = $(".schedule-form");
  const formTitle = $("#form-title");
  const typeInput = $("#schedule-type");
  const nameInput = $("#schedule-name");
  const dateInput = $("#schedule-date");
  const startInput = $("#schedule-start");
  const endInput = $("#schedule-end");
  const locationInput = $("#schedule-location");
  const notesInput = $("#schedule-notes");
  const deleteButton = $(".delete-schedule");
  const toast = $(".toast");

  let schedules = read(STORAGE_KEY, []);
  if (!Array.isArray(schedules)) schedules = [];
  schedules = schedules.filter(item =>
    item && item.id && TYPE_META[item.type] && /^\d{4}-\d{2}-\d{2}$/.test(item.date)
  );
  let selectedMonth = localStorage.getItem(MONTH_KEY) || todayKey.slice(0, 7);
  let editingId = null;

  const saveSchedules = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
    if (selectedMonth) localStorage.setItem(MONTH_KEY, selectedMonth);
    else localStorage.removeItem(MONTH_KEY);
  };
  const notify = message => {
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 1700);
  };
  const filteredSchedules = () => schedules
    .filter(item => !selectedMonth || item.date.startsWith(selectedMonth))
    .sort((a, b) => {
      const aKey = `${a.date}T${a.startTime || "99:99"}`;
      const bKey = `${b.date}T${b.startTime || "99:99"}`;
      return aKey.localeCompare(bKey);
    });

  const renderSchedules = () => {
    monthInput.value = selectedMonth;
    showAllButton.classList.toggle("active", !selectedMonth);
    const visibleSchedules = filteredSchedules();
    scheduleCount.textContent = `予定 ${visibleSchedules.length}件`;
    scheduleList.innerHTML = visibleSchedules.map(item => {
      const type = TYPE_META[item.type];
      const location = item.location?.trim() || "場所未定";
      const notes = item.notes?.trim();
      return `<button class="schedule-card ${item.type}" type="button" data-id="${escapeHtml(item.id)}" aria-label="${escapeHtml(item.name)}を編集">
        <span class="card-date">${dateLabel(item.date)}</span>
        <span class="type-badge">${type.label}</span>
        <span class="card-content">
          <strong>${escapeHtml(item.name)}</strong>
          <span class="card-meta">
            <span>TIME ${escapeHtml(timeLabel(item))}</span>
            <span>PLACE ${escapeHtml(location)}</span>
          </span>
          ${notes ? `<span class="card-notes">${escapeHtml(notes)}</span>` : ""}
        </span>
        <span class="card-arrow" aria-hidden="true">›</span>
      </button>`;
    }).join("") || `<div class="empty-state">
      <div>
        <strong>予定はまだありません</strong>
        <p>「予定を追加」から確定したスケジュールを登録できます。</p>
      </div>
    </div>`;
  };

  const defaultDateForMonth = () => {
    if (!selectedMonth) return todayKey;
    if (todayKey.startsWith(selectedMonth)) return todayKey;
    return `${selectedMonth}-01`;
  };
  const openForm = id => {
    const item = id ? schedules.find(schedule => schedule.id === id) : null;
    editingId = item?.id || null;
    form.reset();
    typeInput.value = item?.type || "studio";
    nameInput.value = item?.name || "";
    dateInput.value = item?.date || defaultDateForMonth();
    startInput.value = item?.startTime || "";
    endInput.value = item?.endTime || "";
    locationInput.value = item?.location || "";
    notesInput.value = item?.notes || "";
    formTitle.textContent = item ? "予定を編集" : "予定を追加";
    deleteButton.hidden = !item;
    dialog.dataset.type = typeInput.value;
    dialog.hidden = false;
    dialog.setAttribute("aria-hidden", "false");
    document.body.classList.add("dialog-open");
    dialog.scrollTop = 0;
    window.setTimeout(() => nameInput.focus(), 0);
  };
  const closeForm = () => {
    dialog.hidden = true;
    dialog.setAttribute("aria-hidden", "true");
    document.body.classList.remove("dialog-open");
    editingId = null;
    if (location.hash === "#new") {
      history.replaceState({}, "", location.pathname + location.search);
    }
  };

  document.querySelectorAll(".add-schedule").forEach(button => {
    button.addEventListener("click", () => openForm());
  });
  scheduleList.addEventListener("click", event => {
    const card = event.target.closest(".schedule-card");
    if (card) openForm(card.dataset.id);
  });
  monthInput.addEventListener("change", () => {
    selectedMonth = monthInput.value;
    saveSchedules();
    renderSchedules();
  });
  showAllButton.addEventListener("click", () => {
    selectedMonth = "";
    saveSchedules();
    renderSchedules();
  });
  typeInput.addEventListener("change", () => {
    dialog.dataset.type = typeInput.value;
  });
  form.addEventListener("submit", event => {
    event.preventDefault();
    const wasEditing = Boolean(editingId);
    const item = {
      id: editingId || makeId(),
      type: typeInput.value,
      name: nameInput.value.trim(),
      date: dateInput.value,
      startTime: startInput.value,
      endTime: endInput.value,
      location: locationInput.value.trim(),
      notes: notesInput.value.trim()
    };
    if (!item.name || !item.date || !TYPE_META[item.type]) return;
    if (editingId) {
      const index = schedules.findIndex(schedule => schedule.id === editingId);
      if (index >= 0) schedules[index] = item;
    } else {
      schedules.push(item);
    }
    selectedMonth = item.date.slice(0, 7);
    saveSchedules();
    closeForm();
    renderSchedules();
    notify(wasEditing ? "予定を更新しました" : "予定を保存しました");
  });
  deleteButton.addEventListener("click", () => {
    if (!editingId) return;
    const item = schedules.find(schedule => schedule.id === editingId);
    if (!item || !window.confirm(`「${item.name}」を削除しますか？`)) return;
    schedules = schedules.filter(schedule => schedule.id !== editingId);
    saveSchedules();
    closeForm();
    renderSchedules();
    notify("予定を削除しました");
  });
  $(".dialog-close").addEventListener("click", closeForm);
  $(".cancel-schedule").addEventListener("click", closeForm);
  dialog.addEventListener("click", event => {
    if (event.target === dialog) closeForm();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !dialog.hidden) closeForm();
  });

  renderSchedules();
  if (location.hash === "#new") openForm();
})();
