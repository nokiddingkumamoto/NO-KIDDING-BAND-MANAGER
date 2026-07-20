(() => {
  "use strict";

  const TYPE_META = {
    studio:{ label:"スタジオ" },
    live:{ label:"ライブ" },
    other:{ label:"その他" }
  };
  const MONTH_KEY = "no-kidding-confirmed-schedule-month-v1";
  const $ = selector => document.querySelector(selector);
  const today = new Date();
  const todayKey = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, "0"), String(today.getDate()).padStart(2, "0")].join("-");
  const makeId = () => globalThis.crypto?.randomUUID?.() || `schedule-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const escapeHtml = value => String(value ?? "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  const dateLabel = value => {
    const [year, month, day] = value.split("-").map(Number);
    const weekday = ["日", "月", "火", "水", "木", "金", "土"][new Date(year, month - 1, day).getDay()];
    return `${month}/${day}（${weekday}）`;
  };
  const timeLabel = item => item.startTime && item.endTime ? `${item.startTime}–${item.endTime}`
    : item.startTime || (item.endTime ? `～${item.endTime}` : "時間未定");

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
  let schedules = [];
  let selectedMonth = localStorage.getItem(MONTH_KEY) || todayKey.slice(0, 7);
  let editingId = null;

  const notify = message => {
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(() => toast.classList.remove("show"), 1800);
  };
  const setData = data => {
    schedules = Array.isArray(data?.schedules) ? data.schedules : [];
    render();
  };
  const filtered = () => schedules
    .filter(item => !selectedMonth || item.date.startsWith(selectedMonth))
    .sort((a, b) => `${a.date}T${a.startTime || "99:99"}`.localeCompare(`${b.date}T${b.startTime || "99:99"}`));

  const render = () => {
    monthInput.value = selectedMonth;
    showAllButton.classList.toggle("active", !selectedMonth);
    const visible = filtered();
    scheduleCount.textContent = `予定 ${visible.length}件`;
    scheduleList.innerHTML = visible.map(item => {
      const notes = item.notes?.trim();
      return `<button class="schedule-card ${item.type}" type="button" data-id="${escapeHtml(item.id)}" aria-label="${escapeHtml(item.name)}を編集">
        <span class="card-date">${dateLabel(item.date)}</span>
        <span class="type-badge">${TYPE_META[item.type]?.label || "その他"}</span>
        <span class="card-content"><strong>${escapeHtml(item.name)}</strong>
          <span class="card-meta"><span>TIME ${escapeHtml(timeLabel(item))}</span><span>PLACE ${escapeHtml(item.location?.trim() || "場所未定")}</span></span>
          ${notes ? `<span class="card-notes">${escapeHtml(notes)}</span>` : ""}
        </span><span class="card-arrow" aria-hidden="true">›</span>
      </button>`;
    }).join("") || `<div class="empty-state"><div><strong>予定はまだありません</strong><p>「予定を追加」から確定したスケジュールを登録できます。</p></div></div>`;
  };

  const openForm = id => {
    const item = id ? schedules.find(schedule => schedule.id === id) : null;
    editingId = item?.id || null;
    form.reset();
    typeInput.value = item?.type || "studio";
    nameInput.value = item?.name || "";
    dateInput.value = item?.date || (selectedMonth ? `${selectedMonth}-01` : todayKey);
    if (selectedMonth === todayKey.slice(0, 7) && !item) dateInput.value = todayKey;
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
    window.setTimeout(() => nameInput.focus(), 0);
  };
  const closeForm = () => {
    dialog.hidden = true;
    dialog.setAttribute("aria-hidden", "true");
    document.body.classList.remove("dialog-open");
    editingId = null;
    if (location.hash === "#new") history.replaceState({}, "", location.pathname + location.search);
  };

  document.querySelectorAll(".add-schedule").forEach(button => button.addEventListener("click", () => openForm()));
  scheduleList.addEventListener("click", event => {
    const card = event.target.closest(".schedule-card");
    if (card) openForm(card.dataset.id);
  });
  monthInput.addEventListener("change", () => {
    selectedMonth = monthInput.value;
    localStorage.setItem(MONTH_KEY, selectedMonth);
    render();
  });
  showAllButton.addEventListener("click", () => {
    selectedMonth = "";
    localStorage.removeItem(MONTH_KEY);
    render();
  });
  typeInput.addEventListener("change", () => { dialog.dataset.type = typeInput.value; });
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const wasEditing = Boolean(editingId);
    const item = {
      id:editingId || makeId(), type:typeInput.value, name:nameInput.value.trim(), date:dateInput.value,
      startTime:startInput.value, endTime:endInput.value, location:locationInput.value.trim(), notes:notesInput.value.trim()
    };
    if (!item.name || !item.date || !TYPE_META[item.type]) return;
    try {
      setData(await NK.save("schedule.save", { item }));
      selectedMonth = item.date.slice(0, 7);
      localStorage.setItem(MONTH_KEY, selectedMonth);
      closeForm();
      render();
      notify(wasEditing ? "予定を更新しました" : "予定を共有しました");
    } catch (error) { notify(error.message); }
  });
  deleteButton.addEventListener("click", async () => {
    const item = schedules.find(schedule => schedule.id === editingId);
    if (!item || !window.confirm(`「${item.name}」を削除しますか？`)) return;
    try {
      setData(await NK.save("schedule.delete", { id:item.id }));
      closeForm();
      notify("予定を削除しました");
    } catch (error) { notify(error.message); }
  });
  $(".dialog-close").addEventListener("click", closeForm);
  $(".cancel-schedule").addEventListener("click", closeForm);
  dialog.addEventListener("click", event => { if (event.target === dialog) closeForm(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && !dialog.hidden) closeForm(); });

  NK.start(async () => {
    setData(await NK.load());
    if (location.hash === "#new") openForm();
    window.setInterval(async () => {
      if (document.visibilityState === "visible" && dialog.hidden) setData(await NK.load());
    }, 8000);
  }).catch(error => NK.showError(error.message));
})();
