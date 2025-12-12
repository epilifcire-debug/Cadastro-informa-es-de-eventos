// ===================== CONFIGURAÇÃO =====================
const CACHE_NAME = "cadastro-eventos-v4";
const URLS_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./jspdf.umd.min.js",
  "./manifest.json",
  "./logo-192.png",
  "./logo-512.png"
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
  self.skipWaiting(); // ativa imediatamente após instalar
});

// ===================== ATIVAÇÃO =====================
self.addEventListener("activate", (event) => {
  console.log("♻️ Ativando nova versão do Service Worker...");
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("🧹 Removendo cache antigo:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim(); // assume controle das abas abertas
});

// ===================== INTERCEPTAÇÃO DE REQUISIÇÕES =====================
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Ignora requisições externas (CDNs)
  if (!req.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(req).then((cachedRes) => {
      if (cachedRes) return cachedRes;

      // Busca da rede com cache seguro
      return fetch(req)
        .then((networkRes) => {
          const cloneRes = networkRes.clone(); // ✅ evita erro de "body already used"
          caches.open(CACHE_NAME).then((cache) => cache.put(req, cloneRes));
          return networkRes;
        })
        .catch(() => {
          // Offline: retorna index.html para navegação
          if (req.mode === "navigate") return caches.match("./index.html");
        });
    })
  );
});

// ===================== ATUALIZAÇÃO AUTOMÁTICA =====================
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("controllerchange", () => {
  console.log("🔄 Nova versão do Service Worker ativa!");
});
