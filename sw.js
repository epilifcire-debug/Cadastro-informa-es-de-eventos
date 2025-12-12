// ===================== SERVICE WORKER PWA =====================

const CACHE_NAME = "eventos-pwa-v6";
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
  self.skipWaiting(); // força ativação imediata do novo SW
});

// Ativação: limpa caches antigos e assume controle das páginas abertas
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
  self.clients.claim(); // o novo SW controla todas as abas ativas
});

// Fetch: estratégia cache-first com fallback para rede
self.addEventListener("fetch", (event) => {
  // Ignora requisições não-HTTP (ex: chrome-extension, data:, blob:)
  if (!event.request.url.startsWith("http")) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((networkResponse) => {
          // Cacheia apenas respostas válidas (status 200) e método GET
          if (
            event.request.method === "GET" &&
            networkResponse &&
            networkResponse.status === 200
          ) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback para uso offline
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
