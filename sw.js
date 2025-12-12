// ===================== SERVICE WORKER - PWA 2025 =====================

// Nome do cache (versão controlada)
const CACHE_NAME = "eventos-pwa-v8";

// Lista de arquivos a serem armazenados no cache estático
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
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("✅ Cache criado:", CACHE_NAME);
        return cache.addAll(URLS_TO_CACHE);
      })
      .catch((err) => console.error("⚠️ Erro ao adicionar arquivos ao cache:", err))
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
            console.log("🗑 Removendo cache antigo:", name);
            return caches.delete(name);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// ===================== INTERCEPTAÇÃO DE REQUISIÇÕES =====================
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Ignora requisições externas que não sejam HTTP(s)
  if (!request.url.startsWith("http")) return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Retorna o cache imediatamente e tenta atualizar em segundo plano
        atualizarCache(request);
        return cachedResponse;
      }

      // Caso não exista no cache, busca da rede
      return fetch(request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            request.method === "GET"
          ) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback para index.html quando offline
          if (request.mode === "navigate") {
            return caches.match("./index.html");
          }
        });
    })
  );
});

// ===================== ATUALIZAÇÃO DE CACHE EM SEGUNDO PLANO =====================
async function atualizarCache(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
  } catch (e) {
    // Sem internet, ignora
  }
}

// ===================== LOG =====================
console.log("🛡 Service Worker carregado com sucesso:", CACHE_NAME);
