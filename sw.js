const CACHE_NAME = "calcteammt-pro-v4";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",

  "./styles/tokens.css",
  "./styles/base.css",
  "./styles/layout.css",
  "./styles/components.css",
  "./styles/responsive.css",

  "./js/app.js",
  "./js/navigation.js",
  "./js/validation.js",

  "./js/calculators/splitter.js",
  "./js/calculators/budget-link.js",
  "./js/calculators/distance.js",

  "./js/components/gauge.js",
  "./js/components/results.js",
  "./js/components/toast.js",

  "./js/data/splitters.js",
  "./js/data/ont-profiles.js",
  "./js/data/fiber-reference.js",

  "./js/storage/history.js",

  "./assets/images/fiber-hero.svg",
  "./assets/images/ftth-support.svg",

  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        const copy = networkResponse.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, copy);
        });

        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);

        return cached || caches.match("./index.html");
      })
  );
});
