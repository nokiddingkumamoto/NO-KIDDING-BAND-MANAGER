(() => {
  "use strict";

  const MEMBERS = ["YAMA", "殿", "うっちー", "RYUTO", "じゅん", "マスター"];
  const DATES = [
    ["7/1", "7/1（水）"], ["7/2", "7/2（木）"],
    ["7/3", "7/3（金）"], ["7/4", "7/4（土）"],
    ["7/5", "7/5（日）"], ["7/6", "7/6（月）"],
    ["7/7", "7/7（火）"], ["7/8", "7/8（水）"]
  ];
  const STORAGE_KEY = "no-kidding-studio-answers-v1";
  const MEMBER_KEY = "no-kidding-current-member";
  const select = document.querySelector(".member-select");
  const chips = [...document.querySelectorAll(".member-chips button")];
  const summaryRows = [...document.querySelectorAll(".answer-row")];
  const editor = document.querySelector(".answer-editor");
  const editorDates = document.querySelector(".editor-dates");
  const editorMember = document.querySelector(".editor-member");
  const toast = document.querySelector(".toast");

  let currentMember = localStorage.getItem(MEMBER_KEY);
  if (!MEMBERS.includes(currentMember)) currentMember = MEMBERS[0];

  let answers = {};
  try {
    answers = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    answers = {};
  }

  const notify = message => {
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 1800);
  };

  const renderSummary = () => {
    select.value = currentMember;
    chips.forEach(chip => {
      const active = chip.dataset.member === currentMember;
      chip.classList.toggle("active", active);
      chip.setAttribute("aria-pressed", String(active));
    });
    summaryRows.forEach(row => {
      row.querySelectorAll("button").forEach(button => button.classList.remove("selected"));
    });
  };

  const renderEditor = () => {
    editorMember.textContent = currentMember;
    editorDates.innerHTML = DATES.map(([date, label]) => {
      const value = answers[currentMember]?.[date] || "";
      return `<div class="editor-date-row" data-date="${date}">
        <span class="editor-date-label">${label}</span>
        <button type="button" class="editor-choice yes${value === "yes" ? " selected" : ""}" data-answer="yes" aria-label="${label} 参加できる">○</button>
        <button type="button" class="editor-choice maybe${value === "maybe" ? " selected" : ""}" data-answer="maybe" aria-label="${label} 未定">△</button>
        <button type="button" class="editor-choice no${value === "no" ? " selected" : ""}" data-answer="no" aria-label="${label} 参加できない">×</button>
      </div>`;
    }).join("");
  };

  const openEditor = () => {
    renderEditor();
    editor.hidden = false;
    editor.setAttribute("aria-hidden", "false");
    document.body.classList.add("editor-open");
    editor.scrollTop = 0;
  };

  const closeEditor = () => {
    editor.hidden = true;
    editor.setAttribute("aria-hidden", "true");
    document.body.classList.remove("editor-open");
  };

  const selectMember = member => {
    if (!MEMBERS.includes(member)) return;
    currentMember = member;
    localStorage.setItem(MEMBER_KEY, member);
    renderSummary();
    openEditor();
  };

  select.addEventListener("change", () => selectMember(select.value));
  chips.forEach(chip => chip.addEventListener("click", () => selectMember(chip.dataset.member)));

  editorDates.addEventListener("click", event => {
    const choice = event.target.closest(".editor-choice");
    if (!choice) return;
    const row = choice.closest(".editor-date-row");
    answers[currentMember] ||= {};
    answers[currentMember][row.dataset.date] = choice.dataset.answer;
    renderEditor();
  });

  document.querySelector(".editor-back").addEventListener("click", closeEditor);
  document.querySelector(".editor-close").addEventListener("click", closeEditor);
  document.querySelector(".editor-save").addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    closeEditor();
    notify(`${currentMember}さんの回答を保存しました`);
  });

  document.querySelector(".save").addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    notify("回答を保存しました");
  });
  const addCandidate = () => notify("候補日の追加機能は次の更新で接続します");
  document.querySelector(".add-top").addEventListener("click", addCandidate);
  document.querySelector(".add-bottom").addEventListener("click", addCandidate);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations()
      .then(items => Promise.all(items.map(item => item.unregister())))
      .catch(() => {});
  }
  if ("caches" in window) {
    caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key)))).catch(() => {});
  }

  renderSummary();
})();
