(() => {
  "use strict";
  const MEMBERS = ["YAMA", "殿", "うっちー", "RYUTO", "じゅん", "マスター"];
  const STORAGE_KEY = "no-kidding-studio-answers-v1";
  const select = document.querySelector(".member-select");
  const chips = [...document.querySelectorAll(".member-chips button")];
  const rows = [...document.querySelectorAll(".answer-row")];
  const toast = document.querySelector(".toast");
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
  const setMember = member => {
    currentMember = member;
    localStorage.setItem("no-kidding-current-member", member);
    render();
  };
  select.addEventListener("change", () => setMember(select.value));
  chips.forEach(chip => chip.addEventListener("click", () => setMember(chip.dataset.member)));
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
