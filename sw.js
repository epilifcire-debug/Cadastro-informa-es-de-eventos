// ===================== CONFIGURAÇÃO =====================
const CACHE_NAME = "cadastro-eventos-v3";
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
  self.skipWaiting(); // força ativação imediata
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
  return self.clients.claim(); // assume controle imediato das abas
});

// ===================== INTERCEPTAÇÃO DE REQUISIÇÕES =====================
self.addEventListener("fetch", (event) => {
  const req = event.request;
  event.respondWith(
    caches.match(req).then((res) => {
      // Retorna do cache, ou busca da rede
      return (
        res ||
        fetch(req)
          .then((response) => {
            // Cache dinâmico apenas para arquivos do mesmo domínio
            if (req.url.startsWith(self.location.origin)) {
              caches.open(CACHE_NAME).then((cache) => cache.put(req, response.clone()));
            }
            return response;
          })
          .catch(() => {
            // Modo offline básico
            if (req.mode === "navigate") {
              return caches.match("./index.html");
            }
          })
      );
    })
  );
});

// ===================== ATUALIZAÇÃO AUTOMÁTICA =====================
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Notifica o usuário sobre nova versão
self.addEventListener("controllerchange", () => {
  console.log("🔄 Nova versão ativa!");
});
