(() => {
  "use strict";
  const MEMBERS = ["YAMA", "殿", "うっちー", "RYUTO", "じゅん", "マスター"];
  const STORAGE_KEY = "no-kidding-studio-answers-v1";
  const select = document.querySelector(".member-select");
  const chips = [...document.querySelectorAll(".member-chips button")];
  const rows = [...document.querySelectorAll(".answer-row")];
  const toast = document.querySelector(".toast");
  const editor = document.querySelector(".answer-editor");
  const editorDates = document.querySelector(".editor-dates");
  const editorMember = document.querySelector(".editor-member");
  const DATE_LABELS = [
    ["7/1", "7/1（水）"], ["7/2", "7/2（木）"],
    ["7/3", "7/3（金）"], ["7/4", "7/4（土）"],
    ["7/5", "7/5（日）"], ["7/6", "7/6（月）"],
    ["7/7", "7/7（火）"], ["7/8", "7/8（水）"]
  ];
  let currentMember = localStorage.getItem("no-kidding-current-member") || MEMBERS[0];
  let answers = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

  const notify = message => {
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 1800);
  };
  const render = () => {
    select.value = currentMember;
    chips.forEach(chip => chip.classList.toggle("active", chip.dataset.member === currentMember));
    rows.forEach(row => {
      const value = answers[currentMember]?.[row.dataset.date] || "";
      row.querySelectorAll("button").forEach(button => button.classList.toggle("selected", button.dataset.answer === value));
    });
  };
  const renderEditor = () => {
    editorMember.textContent = currentMember;
    editorDates.innerHTML = DATE_LABELS.map(([date,label]) => {
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
  const setMember = (member, shouldOpen = true) => {
    currentMember = member;
    localStorage.setItem("no-kidding-current-member", member);
    render();
    if (shouldOpen) openEditor();
  };
  select.addEventListener("change", () => setMember(select.value));
  chips.forEach(chip => chip.addEventListener("click", () => setMember(chip.dataset.member)));
  editorDates.addEventListener("click", event => {
    const button = event.target.closest(".editor-choice");
    if (!button) return;
    const row = button.closest(".editor-date-row");
    answers[currentMember] ||= {};
    answers[currentMember][row.dataset.date] = button.dataset.answer;
    renderEditor();
  });
  document.querySelector(".editor-back").addEventListener("click", closeEditor);
  document.querySelector(".editor-close").addEventListener("click", closeEditor);
  document.querySelector(".editor-save").addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    render();
    closeEditor();
    notify(`${currentMember}さんの回答を保存しました`);
  });
  rows.forEach(row => row.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
      answers[currentMember] ||= {};
      answers[currentMember][row.dataset.date] = button.dataset.answer;
      render();
    });
  }));
  document.querySelector(".save").addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    notify(`${currentMember}さんの回答を保存しました`);
  });
  const addCandidate = () => notify("候補日の追加機能は次の更新で接続します");
  document.querySelector(".add-top").addEventListener("click", addCandidate);
  document.querySelector(".add-bottom").addEventListener("click", addCandidate);
  render();
})();
