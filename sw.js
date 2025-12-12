// ===================== SERVICE WORKER PWA =====================

const CACHE_NAME = "eventos-pwa-v5";
const URLS_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./img/logo.png"
];

// Instalação: pré-cache dos arquivos principais
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting(); // ativa o SW imediatamente
});

// Ativação: limpa caches antigos e assume controle das páginas
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.map((name) => {
          if (name !== CACHE_NAME) return caches.delete(name);
        })
      )
    )
  );
  self.clients.claim(); // controla páginas abertas
});

// Fetch: estratégia cache-first com fallback para rede
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;

      return fetch(event.request)
        .then((networkResponse) => {
          if (
            event.request.method === "GET" &&
            event.request.url.startsWith("http")
          ) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback offline para navegação e imagens
          if (event.request.destination === "image") {
            return caches.match("./img/logo.png");
          }
          if (event.request.mode === "navigate") {
            return caches.match("./index.html");
          }
        });
    })
  );
});
