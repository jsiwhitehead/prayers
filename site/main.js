(function () {
  function collapseAllPrayers() {
    const prayers = document.querySelectorAll(".prayer");
    prayers.forEach((p) => p.classList.remove("expanded"));

    const bodies = document.querySelectorAll(".prayer-body");
    bodies.forEach((body) => body.setAttribute("hidden", ""));

    const previews = document.querySelectorAll(".prayer-preview");
    previews.forEach((preview) => preview.removeAttribute("hidden"));

    const toggles = document.querySelectorAll(".prayer-toggle");
    toggles.forEach((btn) => btn.setAttribute("aria-expanded", "false"));
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

        // Clear selected & expanded prayers when switching categories
        document.querySelectorAll(".prayer.selected").forEach((p) => {
          p.classList.remove("selected");
        });
        collapseAllPrayers();
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

        const preview = prayerEl.querySelector(".prayer-preview");
        const body = prayerEl.querySelector(".prayer-body");
        if (!preview || !body) return;

        const isCurrentlyOpen = prayerEl.classList.contains("expanded");

        // Always update selected state
        document.querySelectorAll(".prayer.selected").forEach((p) => {
          p.classList.remove("selected");
        });
        prayerEl.classList.add("selected");

        // Close everything first
        collapseAllPrayers();

        if (!isCurrentlyOpen) {
          // Open this one: swap preview ↔ body
          preview.setAttribute("hidden", "");
          body.removeAttribute("hidden");

          toggle.setAttribute("aria-expanded", "true");
          prayerEl.classList.add("expanded");

          if (window.innerWidth <= 768) {
            prayerEl.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
        // If it *was* open, collapseAllPrayers() just closed it.
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initCategories();
    initPrayers();
  });
})();
