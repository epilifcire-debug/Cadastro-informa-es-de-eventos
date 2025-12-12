// SERVICE WORKER v6.2 - PWA Cadastro de Eventos (compatível GitHub Pages)
const CACHE_NAME = "eventos-pwa-v6.2";
const URLS_TO_CACHE = [
  "./",
  "./index.html",
  "./gerenciar-lote.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "https://raw.githubusercontent.com/epilifcire-debug/Cadastro-informa-es-de-eventos/main/img/logo.png",
  "https://raw.githubusercontent.com/epilifcire-debug/Cadastro-informa-es-de-eventos/main/img/logo-48.png",
  "https://raw.githubusercontent.com/epilifcire-debug/Cadastro-informa-es-de-eventos/main/img/logo-96.png",
  "https://raw.githubusercontent.com/epilifcire-debug/Cadastro-informa-es-de-eventos/main/img/logo-144.png",
  "https://raw.githubusercontent.com/epilifcire-debug/Cadastro-informa-es-de-eventos/main/img/logo-192.png",
  "https://raw.githubusercontent.com/epilifcire-debug/Cadastro-informa-es-de-eventos/main/img/logo-512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
];

// Instalação com fallback seguro (ignora arquivos que falham)
self.addEventListener("install", (event) => {
  console.log("📦 Instalando Service Worker...");
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      for (const url of URLS_TO_CACHE) {
        try {
          const response = await fetch(url, { mode: "no-cors" });
          if (response.ok || response.type === "opaque") {
            await cache.put(url, response);
            console.log("✅ Cacheado:", url);
          } else {
            console.warn("⚠️ Falha ao cachear:", url, response.status);
          }
        } catch (err) {
          console.warn("⚠️ Erro ao buscar:", url, err);
        }
      }
      self.skipWaiting();
    })()
  );
});

// Ativação: limpa caches antigos
self.addEventListener("activate", (event) => {
  console.log("✅ Service Worker ativo:", CACHE_NAME);
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

// Intercepta requisições - cache-first com fallback de rede
self.addEventListener("fetch", (event) => {
  if (
    !event.request.url.startsWith(self.location.origin) &&
    !event.request.url.includes("raw.githubusercontent.com") &&
    !event.request.url.includes("cdnjs.cloudflare.com")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((networkResponse) => {
          if (
            event.request.method === "GET" &&
            networkResponse.status === 200 &&
            !networkResponse.url.includes("chrome-extension")
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) =>
              cache.put(event.request, responseClone)
            );
          }
          return networkResponse;
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match("./index.html");
          }
        });
    })
  );
});

// Atualização manual
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    console.log("⚡ Atualizando Service Worker agora...");
    self.skipWaiting();
  }
});
