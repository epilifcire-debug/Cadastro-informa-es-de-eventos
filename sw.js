// ===================== CONFIGURAÇÃO =====================
const CACHE_NAME = "eventos-pwa-v8";
const URLS_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./img/logo-48.png",
  "./img/logo-512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
];

// ===================== INSTALAÇÃO =====================
self.addEventListener("install", (event) => {
  console.log("📦 Instalando Service Worker...");

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      console.log("✅ Cache aberto:", CACHE_NAME);

      // Adiciona arquivos individualmente, evitando falha geral
      for (const url of URLS_TO_CACHE) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            await cache.put(url, response.clone());
            console.log(`🗂️  Adicionado ao cache: ${url}`);
          } else {
            console.warn(`⚠️ Erro ao buscar ${url} (status: ${response.status})`);
          }
        } catch (err) {
          console.warn(`⚠️ Falha ao adicionar ${url}:`, err);
        }
      }

      // Ativa imediatamente
      self.skipWaiting();
    })()
  );
});

// ===================== ATIVAÇÃO =====================
self.addEventListener("activate", (event) => {
  console.log("♻️ Ativando novo Service Worker...");
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("🧹 Limpando cache antigo:", key);
            return caches.delete(key);
          }
        })
      );
      await clients.claim();
      console.log("✅ Service Worker ativo e controlando as páginas.");
    })()
  );
});

// ===================== FETCH =====================
self.addEventListener("fetch", (event) => {
  // Apenas requisições GET
  if (event.request.method !== "GET") return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(event.request);

      if (cachedResponse) {
        // Retorna do cache
        return cachedResponse;
      }

      try {
        // Tenta buscar online
        const networkResponse = await fetch(event.request);
        // Salva no cache se for sucesso
        if (networkResponse && networkResponse.status === 200) {
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch (err) {
        console.warn("⚠️ Falha na rede, retornando fallback se disponível:", event.request.url);
        // Se for navegação, retorna o index.html
        if (event.request.mode === "navigate") {
          return cache.match("./index.html");
        }
        // Caso contrário, erro genérico
        return new Response("Falha de conexão e sem cache disponível.", {
          status: 408,
          headers: { "Content-Type": "text/plain" },
        });
      }
    })()
  );
});
