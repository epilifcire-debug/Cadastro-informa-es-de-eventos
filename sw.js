// ========================= CONFIGURAÇÃO =========================
const CACHE_NAME = "eventos-cache-v2"; // altere a versão quando atualizar arquivos
const REPO = "/Cadastro-informa-es-de-eventos"; // nome exato da pasta do GitHub Pages

// Arquivos principais a serem armazenados
const URLS_TO_CACHE = [
  `${REPO}/`,
  `${REPO}/index.html`,
  `${REPO}/style.css`,
  `${REPO}/script.js`,
  `${REPO}/jspdf.umd.min.js`,
  `${REPO}/manifest.json`,
  `${REPO}/img/logo.png`
];

// ========================= INSTALAÇÃO =========================
self.addEventListener("install", (event) => {
  console.log("📦 Instalando Service Worker...");

  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log("✅ Cache aberto:", CACHE_NAME);
      const results = await Promise.allSettled(
        URLS_TO_CACHE.map((url) =>
          cache.add(url).catch((err) => console.warn("⚠️ Falha ao adicionar:", url, err))
        )
      );

      const falhas = results.filter((r) => r.status === "rejected");
      if (falhas.length) {
        console.warn("⚠️ Alguns arquivos não foram adicionados ao cache:", falhas);
      }
    })
  );

  self.skipWaiting();
});

// ========================= ATIVAÇÃO =========================
self.addEventListener("activate", (event) => {
  console.log("♻️ Ativando novo Service Worker...");

  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log("🗑️ Deletando cache antigo:", name);
            return caches.delete(name);
          }
        })
      )
    )
  );

  self.clients.claim();
});

// ========================= INTERCEPTAÇÃO DE REQUISIÇÕES =========================
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((response) => {
          // Só armazena respostas válidas
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // fallback offline simples
          if (event.request.destination === "document") {
            return caches.match(`${REPO}/index.html`);
          }
        });
    })
  );
});

// ========================= MENSAGENS (opcional) =========================
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
