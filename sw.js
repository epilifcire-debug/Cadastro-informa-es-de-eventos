// ===================== SERVICE WORKER (v6) =====================
const CACHE_NAME = "eventos-pwa-v6";

const URLS_TO_CACHE = [
  "./",
  "./index.html",
  "./gerenciar-lote.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./img/logo.png",
  "./img/logo-48.png",
  "./img/logo-96.png",
  "./img/logo-144.png",
  "./img/logo-192.png",
  "./img/logo-512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
];

// ===================== INSTALAÇÃO =====================
self.addEventListener("install", (event) => {
  console.log("📦 Instalando Service Worker...");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(URLS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// ===================== ATIVAÇÃO =====================
self.addEventListener("activate", (event) => {
  console.log("✅ Service Worker ativo - versão:", CACHE_NAME);
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("🧹 Limpando cache antigo:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// ===================== FETCH (CACHE-FIRST COM FALLBACK) =====================
self.addEventListener("fetch", (event) => {
  // Ignora requisições externas não seguras
  if (!event.request.url.startsWith(self.location.origin) &&
      !event.request.url.includes("cdnjs.cloudflare.com")) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Retorna do cache
          return cachedResponse;
        }

        // Tenta buscar da rede
        return fetch(event.request)
          .then((networkResponse) => {
            // Cacheia novas respostas GET válidas
            if (
              event.request.method === "GET" &&
              networkResponse.status === 200 &&
              !networkResponse.url.includes("chrome-extension")
            ) {
              const clonedResponse = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, clonedResponse);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Fallback offline
            if (event.request.mode === "navigate") {
              return caches.match("./index.html");
            }
          });
      })
  );
});

// ===================== ATUALIZAÇÃO FORÇADA =====================
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    console.log("⚡ Atualizando Service Worker imediatamente...");
    self.skipWaiting();
  }
});
