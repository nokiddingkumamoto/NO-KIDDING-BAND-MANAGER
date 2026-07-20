(() => {
  "use strict";

  const MEMBERS = ["YAMA", "殿", "うっちー", "RYUTO", "じゅん", "マスター"];
  const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];
  const MEMBER_KEY = "no-kidding-current-member-v2";
  const MONTH_KEY = "no-kidding-studio-selected-month-v2";
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
  const makeDate = (year, month, day) => {
    const date = new Date(year, month - 1, day);
    return {
      key:`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      month:`${year}-${String(month).padStart(2, "0")}`,
      label:`${month}/${day}（${WEEKDAYS[date.getDay()]}）`
    };
  };
  const datesForMonth = monthValue => {
    const [year, month] = monthValue.split("-").map(Number);
    return Array.from({ length:new Date(year, month, 0).getDate() }, (_, index) => makeDate(year, month, index + 1));
  };

  const monthInput = $("#summary-month");
  const monthNumber = $(".month-number");
  const memberSelect = $("#member-select");
  const memberTabs = $(".member-tabs");
  const summaryList = $(".summary-list");
  const answerView = $(".answer-view");
  const answerMember = $(".answer-member");
  const answerList = $(".answer-list");
  const statusView = $(".status-view");
  const statusDate = $(".status-date");
  const statusList = $(".status-list");
  const dialog = $(".candidate-dialog");
  const candidateMonth = $("#candidate-month");
  const toast = $(".toast");
  let answers = {};
  let dates = [];
  let currentMember = localStorage.getItem(MEMBER_KEY) || MEMBERS[0];
  let selectedMonth = localStorage.getItem(MONTH_KEY) || currentMonth;
  let pending = new Map();
  if (!MEMBERS.includes(currentMember)) currentMember = MEMBERS[0];

  const notify = message => {
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(() => toast.classList.remove("show"), 1800);
  };
  const saveLocalView = () => {
    localStorage.setItem(MEMBER_KEY, currentMember);
    localStorage.setItem(MONTH_KEY, selectedMonth);
  };
  const applyData = data => {
    dates = Array.isArray(data?.studioDates) ? data.studioDates : [];
    answers = data?.studioAnswers && typeof data.studioAnswers === "object" ? data.studioAnswers : {};
    for (const [date, status] of pending) {
      answers[currentMember] ||= {};
      answers[currentMember][date] = status;
    }
    renderSummary();
    if (!answerView.hidden) renderAnswer();
  };
  const monthDates = () => dates.filter(item => item.month === selectedMonth).sort((a, b) => a.key.localeCompare(b.key));

  const addMonth = async monthValue => {
    const monthDatesToAdd = datesForMonth(monthValue);
    const data = await NK.save("studio.addMonth", { month:monthValue, dates:monthDatesToAdd });
    applyData(data);
  };
  const ensureMonth = async () => {
    if (!monthDates().length) await addMonth(selectedMonth);
  };

  const renderMembers = () => {
    memberSelect.innerHTML = MEMBERS.map(name => `<option value="${name}">${name}</option>`).join("");
    memberSelect.value = currentMember;
    memberTabs.innerHTML = MEMBERS.map(name => `<button type="button" data-member="${name}" class="${name === currentMember ? "active" : ""}" aria-pressed="${name === currentMember}">${name}</button>`).join("");
  };
  const renderSummary = () => {
    monthInput.value = selectedMonth;
    monthNumber.textContent = String(Number(selectedMonth.slice(5)));
    renderMembers();
    summaryList.innerHTML = monthDates().map(item => {
      const counts = { yes:0, maybe:0, no:0 };
      MEMBERS.forEach(member => { const value = answers[member]?.[item.key]; if (value in counts) counts[value] += 1; });
      return `<button type="button" class="summary-row" data-date="${item.key}" aria-label="${item.label}の回答状況を表示">
        <span class="summary-date">${item.label}</span>
        <span class="summary-count yes"><b>○</b>${counts.yes}</span>
        <span class="summary-count maybe"><b>△</b>${counts.maybe}</span>
        <span class="summary-count no"><b>×</b>${counts.no}</span>
      </button>`;
    }).join("") || "<p>この月の候補日はまだありません。</p>";
  };
  const renderAnswer = () => {
    answerMember.textContent = currentMember;
    answerList.innerHTML = monthDates().map(item => {
      const value = answers[currentMember]?.[item.key] || "";
      return `<div class="answer-row" data-date="${item.key}">
        <span class="answer-date">${item.label}</span>
        <button class="choice yes ${value === "yes" ? "selected" : ""}" data-answer="yes" type="button" aria-label="${item.label} 参加できる">○</button>
        <button class="choice maybe ${value === "maybe" ? "selected" : ""}" data-answer="maybe" type="button" aria-label="${item.label} 未定">△</button>
        <button class="choice no ${value === "no" ? "selected" : ""}" data-answer="no" type="button" aria-label="${item.label} 参加できない">×</button>
      </div>`;
    }).join("");
  };
  const renderStatus = dateKey => {
    const item = dates.find(date => date.key === dateKey);
    statusDate.textContent = item?.label || dateKey;
    statusList.innerHTML = MEMBERS.map(member => {
      const value = answers[member]?.[dateKey] || "unanswered";
      const symbols = { yes:"○", maybe:"△", no:"×", unanswered:"—" };
      const labels = { yes:"参加できる", maybe:"未定", no:"参加できない", unanswered:"未回答" };
      return `<div class="status-member-row"><span class="status-member-name">${member}</span><span class="status-symbol ${value}" role="img" aria-label="${labels[value]}">${symbols[value]}</span></div>`;
    }).join("");
  };

  const flushAnswers = async () => {
    if (!pending.size) return;
    const entries = [...pending].map(([date, status]) => ({ date, status }));
    const data = await NK.save("studio.answers", { member:currentMember, answers:entries });
    pending.clear();
    applyData(data);
  };
  const openAnswer = async member => {
    if (pending.size) await flushAnswers();
    currentMember = member;
    saveLocalView();
    renderSummary();
    renderAnswer();
    answerView.hidden = false;
    answerView.setAttribute("aria-hidden", "false");
    document.body.classList.add("answer-open");
    answerView.scrollTop = 0;
    if (location.hash !== "#answer") history.pushState({ answer:true }, "", "#answer");
  };
  const closeAnswer = async ({ useHistory = true } = {}) => {
    try { await flushAnswers(); }
    catch (error) { notify(error.message); return; }
    renderSummary();
    answerView.hidden = true;
    answerView.setAttribute("aria-hidden", "true");
    document.body.classList.remove("answer-open");
    if (useHistory && location.hash === "#answer") history.back();
  };
  const openStatus = dateKey => {
    renderStatus(dateKey);
    statusView.hidden = false;
    statusView.setAttribute("aria-hidden", "false");
    document.body.classList.add("status-open");
    statusView.scrollTop = 0;
    if (location.hash !== "#status") history.pushState({ status:true }, "", "#status");
  };
  const closeStatus = ({ useHistory = true } = {}) => {
    statusView.hidden = true;
    statusView.setAttribute("aria-hidden", "true");
    document.body.classList.remove("status-open");
    if (useHistory && location.hash === "#status") history.back();
  };
  const openDialog = () => {
    candidateMonth.value = selectedMonth;
    dialog.hidden = false;
    dialog.setAttribute("aria-hidden", "false");
  };
  const closeDialog = () => { dialog.hidden = true; dialog.setAttribute("aria-hidden", "true"); };

  memberSelect.addEventListener("change", () => openAnswer(memberSelect.value).catch(error => notify(error.message)));
  memberTabs.addEventListener("click", event => {
    const button = event.target.closest("[data-member]");
    if (button) openAnswer(button.dataset.member).catch(error => notify(error.message));
  });
  monthInput.addEventListener("change", async () => {
    if (!monthInput.value) return;
    selectedMonth = monthInput.value;
    saveLocalView();
    try { await ensureMonth(); renderSummary(); }
    catch (error) { notify(error.message); }
  });
  summaryList.addEventListener("click", event => {
    const row = event.target.closest(".summary-row");
    if (row) openStatus(row.dataset.date);
  });
  answerList.addEventListener("click", event => {
    const choice = event.target.closest(".choice");
    if (!choice) return;
    const date = choice.closest(".answer-row").dataset.date;
    answers[currentMember] ||= {};
    answers[currentMember][date] = choice.dataset.answer;
    pending.set(date, choice.dataset.answer);
    renderAnswer();
  });
  $(".answer-back").addEventListener("click", () => closeAnswer());
  $(".answer-close").addEventListener("click", () => closeAnswer());
  $(".status-back").addEventListener("click", () => closeStatus());
  $(".status-close").addEventListener("click", () => closeStatus());
  $(".save-answer").addEventListener("click", async () => {
    const member = currentMember;
    await closeAnswer();
    if (answerView.hidden) notify(`${member}の回答を共有しました`);
  });
  $(".save-summary").addEventListener("click", async () => {
    try { await flushAnswers(); notify("回答を共有しました"); }
    catch (error) { notify(error.message); }
  });
  $$(".add-candidate").forEach(button => button.addEventListener("click", openDialog));
  $(".dialog-close").addEventListener("click", closeDialog);
  $(".cancel-candidate").addEventListener("click", closeDialog);
  $(".confirm-candidate").addEventListener("click", async () => {
    if (!candidateMonth.value) return;
    selectedMonth = candidateMonth.value;
    saveLocalView();
    try {
      await addMonth(selectedMonth);
      closeDialog();
      renderSummary();
      notify(`${Number(selectedMonth.slice(5))}月の候補日を共有しました`);
    } catch (error) { notify(error.message); }
  });
  dialog.addEventListener("click", event => { if (event.target === dialog) closeDialog(); });
  window.addEventListener("popstate", () => {
    if (!statusView.hidden) closeStatus({ useHistory:false });
    else if (!answerView.hidden) closeAnswer({ useHistory:false });
  });
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    if (!dialog.hidden) closeDialog(); else if (!statusView.hidden) closeStatus(); else if (!answerView.hidden) closeAnswer();
  });

  NK.start(async () => {
    if (location.hash === "#answer" || location.hash === "#status") history.replaceState({}, "", location.pathname + location.search);
    applyData(await NK.load());
    await ensureMonth();
    renderSummary();
    window.setInterval(async () => {
      if (document.visibilityState === "visible" && !pending.size && answerView.hidden && statusView.hidden && dialog.hidden) {
        try { applyData(await NK.load()); } catch { /* api.jsが接続状態を表示する */ }
      }
    }, 8000);
  }).catch(error => NK.showError(error.message));
})();
