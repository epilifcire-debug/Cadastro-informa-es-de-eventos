// ===================== CONFIGURAÇÃO =====================
const CACHE_NAME = "eventos-cache-v3";

// ✅ Somente arquivos realmente existentes no repositório
const URLS_TO_CACHE = [
  "./",
  "./index.html",
  "./gerenciar-lote.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./img/logo.png",
  "./img/logo-48.png",
  "./img/logo-72.png",
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
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const validRequests = [];

      for (const url of URLS_TO_CACHE) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            validRequests.push(url);
          } else {
            console.warn(`⚠️ Ignorando (falha ao buscar): ${url}`);
          }
        } catch (err) {
          console.warn(`⚠️ Ignorando (erro de rede): ${url}`);
        }
      }

      await cache.addAll(validRequests);
      console.log("✅ Cache armazenado:", validRequests.length, "arquivos");
      self.skipWaiting();
    })()
  );
});

// ===================== ATIVAÇÃO =====================
self.addEventListener("activate", (event) => {
  console.log("♻️ Ativando novo Service Worker...");
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.map((name) => {
          if (name !== CACHE_NAME) {
            console.log("🗑️ Removendo cache antigo:", name);
            return caches.delete(name);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// ===================== FETCH =====================
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Ignorar chamadas externas que não são GET
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // 🟢 Retorna cache primeiro
        return cachedResponse;
      }

      // 🔵 Busca online e adiciona ao cache se possível
      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // 🔴 Offline e sem cache — fallback básico
          if (request.destination === "document") {
            return caches.match("./index.html");
          }
        });
    })
  );
});

// ===================== MENSAGENS =====================
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
