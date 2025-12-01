// main.js
(function () {
  function clearTextSelection() {
    const sel = window.getSelection
      ? window.getSelection()
      : document.selection;

    if (sel) {
      if (sel.removeAllRanges) sel.removeAllRanges();
      else if (sel.empty) sel.empty();
    }
  }

  function collapseAllPrayers() {
    const prayers = document.querySelectorAll(".prayer");
    prayers.forEach((p) => {
      p.classList.remove("expanded");
      p.classList.remove("selected");
    });

    const bodies = document.querySelectorAll(".prayer-body");
    bodies.forEach((body) => body.setAttribute("hidden", ""));

    const toggles = document.querySelectorAll(".prayer-toggle");
    toggles.forEach((btn) => {
      btn.removeAttribute("hidden");
      btn.setAttribute("aria-expanded", "false");
    });
  }

  function openFirstPrayerInActiveCategory() {
    // Find currently active section, or fall back to the first section
    let activeSection = document.querySelector(".category-section.is-active");
    if (!activeSection) {
      const allSections = document.querySelectorAll(".category-section");
      activeSection = allSections[0];
    }
    if (!activeSection) return;

    const firstPrayer = activeSection.querySelector(".prayer");
    if (!firstPrayer) return;

    collapseAllPrayers();

    const body = firstPrayer.querySelector(".prayer-body");
    const toggle = firstPrayer.querySelector(".prayer-toggle");
    if (!body || !toggle) return;

    toggle.setAttribute("hidden", "");
    toggle.setAttribute("aria-expanded", "true");
    body.removeAttribute("hidden");
    firstPrayer.classList.add("expanded");
    firstPrayer.classList.add("selected");
  }

  function initCategories() {
    const links = Array.from(document.querySelectorAll(".category-link"));
    const sections = Array.from(document.querySelectorAll(".category-section"));

    links.forEach((link) => {
      link.addEventListener("click", () => {
        const targetCategory = link.getAttribute("data-category");

        // Update active link
        links.forEach((l) => l.classList.remove("is-active"));
        link.classList.add("is-active");

        // Show matching section
        sections.forEach((section) => {
          if (section.getAttribute("data-category") === targetCategory) {
            section.classList.add("is-active");
          } else {
            section.classList.remove("is-active");
          }
        });

        // Ensure a clean state, then open first prayer in the new category
        collapseAllPrayers();
        openFirstPrayerInActiveCategory();

        // Scroll page back to the top when switching category
        window.scrollTo({ top: 0 });
      });
    });
  }

  function initPrayers() {
    const prayerToggles = Array.from(
      document.querySelectorAll(".prayer-toggle")
    );

    prayerToggles.forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const prayerEl = toggle.closest(".prayer");
        if (!prayerEl) return;

        const body = prayerEl.querySelector(".prayer-body");
        if (!body) return;

        // 1) Close everything
        collapseAllPrayers();

        // 2) Clear any text selection that was left behind
        clearTextSelection();

        // 3) Open this one
        toggle.setAttribute("hidden", "");
        toggle.setAttribute("aria-expanded", "true");
        body.removeAttribute("hidden");
        prayerEl.classList.add("expanded");
        prayerEl.classList.add("selected");

        const rect = prayerEl.getBoundingClientRect();
        const topVisible = rect.top >= 0 && rect.top < window.innerHeight;

        if (!topVisible) {
          prayerEl.scrollIntoView({ block: "start" });
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initCategories();
    initPrayers();
    // Ensure at least one prayer is open when the page loads
    openFirstPrayerInActiveCategory();
  });
})();
