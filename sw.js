// ==============================
// 🧠 Service Worker - Eric Filipe
// ==============================

const CACHE_NAME = "eventos-cache-v2";
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./gerenciar-lote.html",
  "./manifest.json",
  "./img/logo.png",
  "./img/logo-96.png",
  "./img/logo-144.png",
  "./img/logo-192.png",
  "./img/logo-512.png"
];

// Instalação do Service Worker
self.addEventListener("install", (event) => {
  console.log("📦 Instalando Service Worker...");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
      .catch((err) => console.error("❌ Erro ao adicionar arquivos ao cache:", err))
  );
});

// Ativação - limpa caches antigos
self.addEventListener("activate", (event) => {
  console.log("✅ Service Worker ativo!");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("🧹 Removendo cache antigo:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Intercepta requisições e serve do cache
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type === "opaque") {
              return response;
            }

            const clonedResponse = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clonedResponse);
            });
            return response;
          })
          .catch(() => {
            // Retorna página offline simples se desejar
            return caches.match("./index.html");
          });
      })
  );
});

// Atualização imediata quando há nova versão
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
