/* =========================================
   Helpers
========================================= */
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => scope.querySelectorAll(selector);

/* =========================================
   Navbar shrink (otimizado)
========================================= */
const headerEl = $(".c-header");
let headerHeight = headerEl ? headerEl.offsetHeight : 0;

const SHRINK_AT = 80;
let ticking = false;

const onScroll = () => {
  if (!headerEl) return;

  const shouldShrink = window.scrollY > SHRINK_AT;
  headerEl.classList.toggle("c-header--shrink", shouldShrink);

  ticking = false;
};

window.addEventListener(
  "scroll",
  () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(onScroll);
  },
  { passive: true }
);

window.addEventListener(
  "resize",
  () => {
    headerHeight = headerEl ? headerEl.offsetHeight : 0;
  },
  { passive: true }
);

/* =========================================
   Menu mobile (hambúrguer) + fechar com ESC/clique fora
========================================= */
const btnMenu = $(".c-header__menu-toggle");
const navMenu = $(".c-header__nav");

const closeMenu = () => {
  if (!btnMenu || !navMenu) return;
  navMenu.classList.remove("c-header__nav--open");
  btnMenu.classList.remove("c-header__menu-toggle--open");
  btnMenu.setAttribute("aria-expanded", "false");
};

const openMenu = () => {
  if (!btnMenu || !navMenu) return;
  navMenu.classList.add("c-header__nav--open");
  btnMenu.classList.add("c-header__menu-toggle--open");
  btnMenu.setAttribute("aria-expanded", "true");
};

if (btnMenu && navMenu) {
  btnMenu.addEventListener("click", () => {
    const isOpen = btnMenu.classList.contains("c-header__menu-toggle--open");
    if (isOpen) closeMenu();
    else openMenu();
  });

  // ESC fecha
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (btnMenu.classList.contains("c-header__menu-toggle--open")) closeMenu();
  });

  // Clique fora fecha
  document.addEventListener("click", (e) => {
    const isOpen = btnMenu.classList.contains("c-header__menu-toggle--open");
    if (!isOpen) return;

    const clickedInside = navMenu.contains(e.target) || btnMenu.contains(e.target);
    if (!clickedInside) closeMenu();
  });
}

/* =========================================
   Smooth scroll (menu + logo) - mais confiável
========================================= */
const internalLinks = $$('a[href^="#"]');

internalLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");

    if (!href || href === "#") return;

    const target = $(href);
    if (!target) return;

    event.preventDefault();

    headerHeight = headerEl ? headerEl.offsetHeight : 0;
    const offset = 10;

    const rect = target.getBoundingClientRect();
    const top = window.scrollY + rect.top - headerHeight - offset;

    window.scrollTo({ top, behavior: "smooth" });

    // Fecha menu mobile após clique
    closeMenu();
  });
});

/* =========================================
   Reveal on scroll (fade-in) + pré-aquecimento
========================================= */
const revealEls = $$(".c-reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("c-reveal--visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );

  revealEls.forEach((el) => observer.observe(el));

  window.addEventListener(
    "load",
    () => {
      window.requestAnimationFrame(() => {
        document.body.getBoundingClientRect();
      });
    },
    { once: true }
  );
} else {
  revealEls.forEach((el) => el.classList.add("c-reveal--visible"));
}

/* =========================================
   Link ativo no menu (IntersectionObserver)
========================================= */
const navLinks = [...$$(".c-header__nav-link")];
const sectionTargets = ["#sobre", "#resultados", "#localizacao", "#contato"]
  .map((id) => $(id))
  .filter(Boolean);

const setActiveNav = (sectionId) => {
  navLinks.forEach((a) => {
    const isActive = a.getAttribute("href") === `#${sectionId}`;
    a.classList.toggle("c-header__nav-link--active", isActive);
    if (isActive) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
};

if ("IntersectionObserver" in window && sectionTargets.length) {
  const navObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        setActiveNav(e.target.id);
      });
    },
    { threshold: 0.55 }
  );

  sectionTargets.forEach((sec) => navObs.observe(sec));
}

/* =========================================
   Ano do rodapé
========================================= */
const yearEl = $("#ano");
if (yearEl) yearEl.textContent = new Date().getFullYear();
