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
    let activeSection = document.querySelector(".category-section.is-active");
    if (!activeSection) {
      activeSection = document.querySelector(".category-section");
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
        const target = link.getAttribute("data-category");

        links.forEach((l) => l.classList.remove("is-active"));
        link.classList.add("is-active");

        sections.forEach((section) => {
          if (section.getAttribute("data-category") === target) {
            section.classList.add("is-active");
          } else {
            section.classList.remove("is-active");
          }
        });

        collapseAllPrayers();
        openFirstPrayerInActiveCategory();

        window.scrollTo({ top: 0 });
      });
    });
  }

  // -------------------------------------------------------------
  // Sticky offset + scroll margin
  // -------------------------------------------------------------

  function isMobile() {
    return window.matchMedia("(max-width: 768px)").matches;
  }

  function getCategoryTitleHeight() {
    const el = document.querySelector(
      ".category-section.is-active .category-title"
    );
    return el ? el.getBoundingClientRect().height : 0;
  }

  function getScrollMarginTop(el) {
    const cs = getComputedStyle(el);
    const px = parseFloat(cs.scrollMarginTop);
    return Number.isNaN(px) ? 0 : px;
  }

  function scrollPrayerIntoView(prayerEl) {
    const rect = prayerEl.getBoundingClientRect();

    const totalOffset = isMobile()
      ? getCategoryTitleHeight()
      : getScrollMarginTop(prayerEl);

    // Compute target scroll position
    const targetY = window.scrollY + rect.top - totalOffset;

    // Immediate jump, no smooth scrolling
    window.scrollTo(0, targetY);
  }

  // -------------------------------------------------------------
  // Tap category title (mobile) -> scroll to top
  // -------------------------------------------------------------

  function initCategoryTitleTapToTop() {
    const titles = Array.from(document.querySelectorAll(".category-title"));

    titles.forEach((title) => {
      title.addEventListener("click", () => {
        // Only perform this behavior on mobile layout
        if (!isMobile()) return;

        // Jump back to the very top so the top menu is fully visible
        window.scrollTo(0, 0);
      });
    });
  }

  // -------------------------------------------------------------

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

        collapseAllPrayers();
        clearTextSelection();

        toggle.setAttribute("hidden", "");
        toggle.setAttribute("aria-expanded", "true");
        body.removeAttribute("hidden");
        prayerEl.classList.add("expanded");
        prayerEl.classList.add("selected");

        const rect = prayerEl.getBoundingClientRect();
        const topVisible = rect.top >= 0 && rect.top < window.innerHeight;

        if (!topVisible) {
          scrollPrayerIntoView(prayerEl);
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initCategories();
    initPrayers();
    initCategoryTitleTapToTop(); // enable tap-to-top on sticky category header
    openFirstPrayerInActiveCategory();
  });
})();
