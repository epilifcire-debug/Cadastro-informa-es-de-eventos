// ======= SERVICE WORKER (PWA OFFLINE CACHE) =======

const CACHE_NAME = "eventos-pwa-v3";
const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./img/logo.png",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
];

// ======= INSTALAÇÃO =======
self.addEventListener("install", (event) => {
  console.log("📦 Instalando Service Worker...");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("✅ Cache criado com sucesso!");
        return cache.addAll(urlsToCache);
      })
      .catch((err) => console.error("❌ Erro ao criar cache:", err))
  );
});

// ======= ATIVAÇÃO =======
self.addEventListener("activate", (event) => {
  console.log("🚀 Service Worker ativo!");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log("🧹 Limpando cache antigo:", name);
            return caches.delete(name);
          }
        })
      );
    })
  );
});

// ======= INTERCEPTAÇÃO DE REQUISIÇÕES =======
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retorna do cache ou busca online
        return response || fetch(event.request).then((fetchResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            // Atualiza cache com nova resposta se for seguro
            if (event.request.url.startsWith("http") && !event.request.url.includes("chrome-extension")) {
              cache.put(event.request, fetchResponse.clone());
            }
            return fetchResponse;
          });
        });
      })
      .catch(() => {
        // Retorno offline padrão
        if (event.request.mode === "navigate") {
          return caches.match("./index.html");
        }
      })
  );
});

// ======= ATUALIZAÇÃO AUTOMÁTICA =======
self.addEventListener("message", (event) => {
  if (event.data === "updateSW") {
    console.log("♻️ Atualizando Service Worker...");
    self.skipWaiting();
  }
});
