(() => {
  "use strict";

  const MEMBERS = ["YAMA", "殿", "うっちー", "RYUTO", "じゅん", "マスター"];
  const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];
  const ANSWERS_KEY = "no-kidding-studio-answers-v2";
  const DATES_KEY = "no-kidding-studio-candidate-dates-v2";
  const MEMBER_KEY = "no-kidding-current-member-v2";
  const MONTH_KEY = "no-kidding-studio-selected-month-v2";

  const makeDate = (year, month, day) => {
    const date = new Date(year, month - 1, day);
    return {
      key: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      month: `${year}-${String(month).padStart(2, "0")}`,
      label: `${month}/${day}（${WEEKDAYS[date.getDay()]}）`
    };
  };
  const defaultDates = Array.from({ length: 8 }, (_, index) => makeDate(2026, 7, index + 1));

  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
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

  let answers = read(ANSWERS_KEY, {});
  let dates = read(DATES_KEY, defaultDates);
  if (!Array.isArray(dates) || !dates.length) dates = [...defaultDates];
  let currentMember = localStorage.getItem(MEMBER_KEY) || MEMBERS[0];
  if (!MEMBERS.includes(currentMember)) currentMember = MEMBERS[0];
  let selectedMonth = localStorage.getItem(MONTH_KEY) || "2026-07";

  const saveState = () => {
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
    localStorage.setItem(DATES_KEY, JSON.stringify(dates));
    localStorage.setItem(MEMBER_KEY, currentMember);
    localStorage.setItem(MONTH_KEY, selectedMonth);
  };
  const notify = message => {
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1700);
  };
  const monthDates = () => dates
    .filter(item => item.month === selectedMonth)
    .sort((a, b) => a.key.localeCompare(b.key));

  const addMonth = monthValue => {
    const [year, month] = monthValue.split("-").map(Number);
    const last = new Date(year, month, 0).getDate();
    for (let day = 1; day <= last; day += 1) {
      const item = makeDate(year, month, day);
      if (!dates.some(date => date.key === item.key)) dates.push(item);
    }
  };

  const renderMembers = () => {
    memberSelect.innerHTML = MEMBERS.map(name => `<option value="${name}">${name}</option>`).join("");
    memberSelect.value = currentMember;
    memberTabs.innerHTML = MEMBERS.map(name =>
      `<button type="button" data-member="${name}" class="${name === currentMember ? "active" : ""}" aria-pressed="${name === currentMember}">${name}</button>`
    ).join("");
  };

  const renderSummary = () => {
    monthInput.value = selectedMonth;
    monthNumber.textContent = String(Number(selectedMonth.slice(5)));
    renderMembers();
    summaryList.innerHTML = monthDates().map(item => {
      const counts = { yes: 0, maybe: 0, no: 0 };
      MEMBERS.forEach(member => {
        const value = answers[member]?.[item.key];
        if (value in counts) counts[value] += 1;
      });
      return `<button type="button" class="summary-row" data-date="${item.key}" aria-label="${item.label}の回答状況を表示">
        <span class="summary-date">${item.label}</span>
        <span class="summary-count yes"><b>○</b>${counts.yes}</span>
        <span class="summary-count maybe"><b>△</b>${counts.maybe}</span>
        <span class="summary-count no"><b>×</b>${counts.no}</span>
      </button>`;
    }).join("") || `<p>この月の候補日はまだありません。</p>`;
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
      const symbols = { yes: "○", maybe: "△", no: "×", unanswered: "—" };
      const labels = { yes: "参加できる", maybe: "未定", no: "参加できない", unanswered: "未回答" };
      return `<div class="status-member-row">
        <span class="status-member-name">${member}</span>
        <span class="status-symbol ${value}" role="img" aria-label="${labels[value]}">${symbols[value]}</span>
      </div>`;
    }).join("");
  };

  const openAnswer = member => {
    currentMember = member;
    saveState();
    renderSummary();
    renderAnswer();
    answerView.hidden = false;
    answerView.setAttribute("aria-hidden", "false");
    document.body.classList.add("answer-open");
    answerView.scrollTop = 0;
    if (location.hash !== "#answer") history.pushState({ answer: true }, "", "#answer");
  };
  const closeAnswer = ({ useHistory = true } = {}) => {
    saveState();
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
    if (location.hash !== "#status") history.pushState({ status: true }, "", "#status");
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
  const closeDialog = () => {
    dialog.hidden = true;
    dialog.setAttribute("aria-hidden", "true");
  };

  memberSelect.addEventListener("change", () => openAnswer(memberSelect.value));
  memberTabs.addEventListener("click", event => {
    const button = event.target.closest("[data-member]");
    if (button) openAnswer(button.dataset.member);
  });
  monthInput.addEventListener("change", () => {
    if (!monthInput.value) return;
    selectedMonth = monthInput.value;
    addMonth(selectedMonth);
    saveState();
    renderSummary();
  });
  summaryList.addEventListener("click", event => {
    const row = event.target.closest(".summary-row");
    if (row) openStatus(row.dataset.date);
  });
  answerList.addEventListener("click", event => {
    const choice = event.target.closest(".choice");
    if (!choice) return;
    const row = choice.closest(".answer-row");
    answers[currentMember] ||= {};
    answers[currentMember][row.dataset.date] = choice.dataset.answer;
    renderAnswer();
  });
  $(".answer-back").addEventListener("click", () => closeAnswer());
  $(".answer-close").addEventListener("click", () => closeAnswer());
  $(".status-back").addEventListener("click", () => closeStatus());
  $(".status-close").addEventListener("click", () => closeStatus());
  $(".save-answer").addEventListener("click", () => {
    closeAnswer();
    notify(`${currentMember}の回答を保存しました`);
  });
  $(".save-summary").addEventListener("click", () => {
    saveState();
    notify("回答を保存しました");
  });
  $$(".add-candidate").forEach(button => button.addEventListener("click", openDialog));
  $(".dialog-close").addEventListener("click", closeDialog);
  $(".cancel-candidate").addEventListener("click", closeDialog);
  $(".confirm-candidate").addEventListener("click", () => {
    if (!candidateMonth.value) return;
    selectedMonth = candidateMonth.value;
    addMonth(selectedMonth);
    saveState();
    closeDialog();
    renderSummary();
    notify(`${Number(selectedMonth.slice(5))}月の候補日を追加しました`);
  });
  dialog.addEventListener("click", event => { if (event.target === dialog) closeDialog(); });
  window.addEventListener("popstate", () => {
    if (!statusView.hidden) closeStatus({ useHistory: false });
    else if (!answerView.hidden) closeAnswer({ useHistory: false });
  });
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    if (!dialog.hidden) closeDialog();
    else if (!statusView.hidden) closeStatus();
    else if (!answerView.hidden) closeAnswer();
  });

  if (location.hash === "#answer" || location.hash === "#status") {
    history.replaceState({}, "", location.pathname + location.search);
  }
  renderSummary();
})();
