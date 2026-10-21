const VALID_ROUTES = [
  "home",
  "calculator",
  "result",
  "splitter-table",
  "reference",
  "history",
  "settings"
];

export function createNavigation({ onRouteChange }) {
  let currentRoute = "home";

  function setActiveNavigation(route) {
    document.querySelectorAll("[data-route]").forEach((button) => {
      button.classList.toggle("active", button.dataset.route === route);
    });
  }

  function closeDrawer() {
    document.getElementById("sidebar")?.classList.remove("open");
    document.getElementById("drawer-overlay")?.classList.remove("visible");
  }

  function openDrawer() {
    document.getElementById("sidebar")?.classList.add("open");
    document.getElementById("drawer-overlay")?.classList.add("visible");
  }

  function go(route) {
    if (!VALID_ROUTES.includes(route)) return;

    document.querySelectorAll(".page-view").forEach((view) => {
      view.classList.remove("active");
    });

    const view = document.getElementById(`view-${route}`);
    view?.classList.add("active");

    currentRoute = route;
    setActiveNavigation(route);
    closeDrawer();

    window.scrollTo({ top: 0, behavior: "smooth" });
    onRouteChange?.(route);
  }

  function init() {
    document.querySelectorAll("[data-route]").forEach((button) => {
      button.addEventListener("click", () => go(button.dataset.route));
    });

    document.getElementById("drawer-open")?.addEventListener("click", openDrawer);
    document.getElementById("drawer-close")?.addEventListener("click", closeDrawer);
    document.getElementById("drawer-overlay")?.addEventListener("click", closeDrawer);
  }

  return {
    init,
    go,
    openDrawer,
    closeDrawer,
    getCurrentRoute: () => currentRoute
  };
}


