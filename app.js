(() => {
  "use strict";
  const menu = document.querySelector(".menu-button");
  const sheet = document.querySelector(".side-sheet");
  const backdrop = document.querySelector(".sheet-backdrop");
  const close = document.querySelector(".sheet-close");
  const add = document.querySelector(".add-button");
  const popover = document.querySelector(".add-popover");
  const toast = document.querySelector(".toast");

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
      if (card.dataset.target === "studio") {
        window.location.href = "studio.html";
        return;
      }
      notify(`${card.getAttribute("aria-label")} は次の開発段階で接続します`);
    });
  });
  document.querySelectorAll(".schedule-card").forEach(card => {
    card.addEventListener("click", () => notify("スケジュール詳細は次の開発段階で接続します"));
  });
  popover.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
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
})();
