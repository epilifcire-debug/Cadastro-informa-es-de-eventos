// ===================== SERVICE WORKER PWA =====================
// Versão do cache — altere o número quando fizer grandes mudanças
const CACHE_NAME = "eventos-pwa-v6";

// Arquivos essenciais para rodar offline
const URLS_TO_CACHE = [
  "./",
  "./index.html",
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
    caches.open(CACHE_NAME).then((cache) => {
      console.log("✅ Arquivos adicionados ao cache!");
      return cache.addAll(URLS_TO_CACHE);
    })
  );

  // Ativa o SW assim que instalado (sem precisar recarregar)
  self.skipWaiting();
});

// ===================== ATIVAÇÃO =====================
self.addEventListener("activate", (event) => {
  console.log("🔄 Ativando novo Service Worker...");

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

  // Faz com que o SW controle imediatamente todas as abas
  return self.clients.claim();
});

// ===================== FETCH (Cache + Rede) =====================
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Evita cache de chamadas externas POST (formulários, API, etc)
  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      // Responde com cache se existir
      if (cachedResponse) {
        // Atualiza em background sem bloquear resposta
        fetch(req).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, networkResponse.clone());
            });
          }
        });
        return cachedResponse;
      }

      // Se não tiver no cache, busca na rede e adiciona ao cache
      return fetch(req)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            req.url.startsWith("http")
          ) {
            const cloned = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, cloned));
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback offline para HTML
          if (req.mode === "navigate") {
            return caches.match("./index.html");
          }
        });
    })
  );
});

// ===================== ATUALIZAÇÃO AUTOMÁTICA =====================
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    console.log("⚡ Atualização forçada do SW...");
    self.skipWaiting();
  }
});

// ===================== LOG DE STATUS =====================
console.log("🚀 Service Worker carregado:", CACHE_NAME);
