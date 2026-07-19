(() => {
  "use strict";

  const MEMBERS = ["YAMA", "殿", "うっちー", "RYUTO", "じゅん", "マスター"];
  const DEFAULT_DATES = [
    { key:"7/1", label:"7/1（水）", iso:"2026-07-01" },
    { key:"7/2", label:"7/2（木）", iso:"2026-07-02" },
    { key:"7/3", label:"7/3（金）", iso:"2026-07-03" },
    { key:"7/4", label:"7/4（土）", iso:"2026-07-04" },
    { key:"7/5", label:"7/5（日）", iso:"2026-07-05" },
    { key:"7/6", label:"7/6（月）", iso:"2026-07-06" },
    { key:"7/7", label:"7/7（火）", iso:"2026-07-07" },
    { key:"7/8", label:"7/8（水）", iso:"2026-07-08" }
  ];
  const ANSWERS_KEY = "no-kidding-studio-answers-v1";
  const MEMBER_KEY = "no-kidding-current-member";
  const DATES_KEY = "no-kidding-studio-candidate-dates-v1";
  const WEEKDAYS = ["日","月","火","水","木","金","土"];

  const select = document.querySelector(".member-select");
  const chips = [...document.querySelectorAll(".member-chips button")];
  const summaryRows = [...document.querySelectorAll(".answer-row")];
  const editor = document.querySelector(".answer-editor");
  const editorDates = document.querySelector(".editor-dates");
  const editorMember = document.querySelector(".editor-member");
  const candidateDialog = document.querySelector(".candidate-dialog");
  const candidateInput = document.querySelector("#candidate-date");
  const toast = document.querySelector(".toast");

  let currentMember = localStorage.getItem(MEMBER_KEY);
  if (!MEMBERS.includes(currentMember)) currentMember = MEMBERS[0];

  const readJson = (key, fallback) => {
    try {
      return JSON.parse(localStorage.getItem(key) || "") || fallback;
    } catch {
      return fallback;
    }
  };
  let answers = readJson(ANSWERS_KEY, {});
  let candidateDates = readJson(DATES_KEY, DEFAULT_DATES);
  if (!Array.isArray(candidateDates) || !candidateDates.length) candidateDates = [...DEFAULT_DATES];

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
    editorDates.innerHTML = candidateDates.map(item => {
      const value = answers[currentMember]?.[item.key] || "";
      return `<div class="editor-date-row" data-date="${item.key}">
        <span class="editor-date-label">${item.label}</span>
        <button type="button" class="editor-choice yes${value === "yes" ? " selected" : ""}" data-answer="yes" aria-label="${item.label} 参加できる">○</button>
        <button type="button" class="editor-choice maybe${value === "maybe" ? " selected" : ""}" data-answer="maybe" aria-label="${item.label} 未定">△</button>
        <button type="button" class="editor-choice no${value === "no" ? " selected" : ""}" data-answer="no" aria-label="${item.label} 参加できない">×</button>
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

  const openCandidateDialog = () => {
    candidateInput.value = "";
    candidateDialog.hidden = false;
    candidateDialog.setAttribute("aria-hidden", "false");
    window.setTimeout(() => candidateInput.focus(), 0);
  };
  const closeCandidateDialog = () => {
    candidateDialog.hidden = true;
    candidateDialog.setAttribute("aria-hidden", "true");
  };
  const addCandidate = () => {
    if (!candidateInput.value) {
      notify("日付を選択してください");
      return;
    }
    if (candidateDates.some(item => item.iso === candidateInput.value)) {
      notify("その日付はすでに登録されています");
      return;
    }
    const [year,month,day] = candidateInput.value.split("-").map(Number);
    const date = new Date(year,month - 1,day);
    const key = `${month}/${day}`;
    candidateDates.push({
      key,
      iso:candidateInput.value,
      label:`${key}（${WEEKDAYS[date.getDay()]}）`
    });
    candidateDates.sort((a,b) => a.iso.localeCompare(b.iso));
    localStorage.setItem(DATES_KEY, JSON.stringify(candidateDates));
    closeCandidateDialog();
    notify(`${key}を候補日に追加しました`);
    if (!editor.hidden) renderEditor();
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
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
    closeEditor();
    notify(`${currentMember}さんの回答を保存しました`);
  });
  document.querySelector(".save").addEventListener("click", () => {
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
    notify("回答を保存しました");
  });
  document.querySelector(".add-top").addEventListener("click", openCandidateDialog);
  document.querySelector(".add-bottom").addEventListener("click", openCandidateDialog);
  document.querySelector(".candidate-close").addEventListener("click", closeCandidateDialog);
  document.querySelector(".candidate-cancel").addEventListener("click", closeCandidateDialog);
  document.querySelector(".candidate-add").addEventListener("click", addCandidate);
  candidateDialog.addEventListener("click", event => {
    if (event.target === candidateDialog) closeCandidateDialog();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      if (!candidateDialog.hidden) closeCandidateDialog();
      else if (!editor.hidden) closeEditor();
    }
  });

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
