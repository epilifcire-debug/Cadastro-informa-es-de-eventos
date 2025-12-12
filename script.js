// ========================= CONFIGURAÇÕES GERAIS =========================
const MOSTRAR_IMAGEM_FUNDO = false; // ❌ sem arte de fundo nos flyers (troque para true se quiser ativar)
let eventos = JSON.parse(localStorage.getItem("eventos")) || [];
let nomesSetores = JSON.parse(localStorage.getItem("nomesSetores")) || {};

// ========================= SALVAR EVENTO =========================
document.getElementById("formEvento").addEventListener("submit", (e) => {
  e.preventDefault();

  const nome = document.getElementById("nomeEvento").value.trim();
  const data = document.getElementById("dataEvento").value;
  const classificacao = document.getElementById("classificacao").value;
  const localEvento = document.getElementById("localEvento").value;
  const formasPagamento = document.getElementById("formasPagamento").value;
  const descricao = document.getElementById("descricao").value;
  const imagemInput = document.getElementById("imagemEvento");

  if (!nome || !data) return alert("Preencha todos os campos obrigatórios!");

  const novoEvento = {
    id: Date.now(),
    nome,
    data,
    classificacao,
    local: localEvento,
    formasPagamento,
    descricao,
    lotes: [],
    imagem: null
  };

  if (imagemInput.files && imagemInput.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      novoEvento.imagem = e.target.result;
      eventos.push(novoEvento);
      salvarEventos();
      atualizarLista();
      document.getElementById("formEvento").reset();
    };
    reader.readAsDataURL(imagemInput.files[0]);
  } else {
    eventos.push(novoEvento);
    salvarEventos();
    atualizarLista();
    document.getElementById("formEvento").reset();
  }
});

// ========================= LOCALSTORAGE =========================
function salvarEventos() {
  localStorage.setItem("eventos", JSON.stringify(eventos));
}
function salvarNomesSetores() {
  localStorage.setItem("nomesSetores", JSON.stringify(nomesSetores));
}

// ========================= ATUALIZAR LISTA =========================
function atualizarLista() {
  const lista = document.getElementById("listaEventos");
  lista.innerHTML = "";

  eventos.forEach((evento) => {
    const divEvento = document.createElement("div");
    divEvento.classList.add("card");

    divEvento.innerHTML = `
      <h3>${evento.nome}</h3>
      <p>📅 ${evento.data}</p>
      <p>🏛️ ${evento.local || "Não informado"}</p>
      <p>💳 ${evento.formasPagamento || "-"}</p>
      <p>${evento.classificacao ? "🎟️ " + evento.classificacao : ""}</p>
      <p>${evento.descricao || ""}</p>

      <div class="evento-buttons">
        <button onclick="editarEvento(${evento.id})">✏️ Editar Evento</button>
        <button onclick="excluirEvento(${evento.id})">🗑️ Excluir Evento</button>
        <button onclick="adicionarLote(${evento.id})">➕ Adicionar Lote</button>
      </div>

      <div id="lotes-${evento.id}"></div>
    `;

    lista.appendChild(divEvento);
    renderizarLotes(evento);
  });
}

// ========================= EDITAR / EXCLUIR EVENTO =========================
function editarEvento(id) {
  const evento = eventos.find(e => e.id === id);
  if (!evento) return alert("Evento não encontrado.");

  const novoNome = prompt("Novo nome do evento:", evento.nome);
  const novaData = prompt("Nova data do evento (AAAA-MM-DD):", evento.data);
  const novaClassificacao = prompt("Nova classificação:", evento.classificacao);
  const novoLocal = prompt("Novo local:", evento.local);
  const novasFormas = prompt("Novas formas de pagamento:", evento.formasPagamento);
  const novaDescricao = prompt("Nova descrição:", evento.descricao);

  evento.nome = novoNome || evento.nome;
  evento.data = novaData || evento.data;
  evento.classificacao = novaClassificacao || evento.classificacao;
  evento.local = novoLocal || evento.local;
  evento.formasPagamento = novasFormas || evento.formasPagamento;
  evento.descricao = novaDescricao || evento.descricao;

  salvarEventos();
  atualizarLista();
  alert("✅ Evento atualizado com sucesso!");
}

function excluirEvento(id) {
  if (!confirm("Tem certeza que deseja excluir este evento?")) return;
  eventos = eventos.filter(e => e.id !== id);
  salvarEventos();
  atualizarLista();
}

// ========================= ADICIONAR LOTE =========================
function adicionarLote(id) {
  const evento = eventos.find(e => e.id === id);
  const nome = prompt("Nome do lote:");
  if (!nome) return;
  const dataVirada = prompt("Data da virada do lote (AAAA-MM-DD):");
  if (!dataVirada) return;

  const setores = [];
  let continuar = true;
  while (continuar) {
    const setor = prompt("Nome do setor (ou deixe vazio para encerrar):");
    if (!setor) break;
    const meia = prompt("Valor Meia:");
    const solidario = prompt("Valor Solidário:");
    const inteira = prompt("Valor Inteira:");
    setores.push({ setor, valores: { meia, solidario, inteira } });
    continuar = confirm("Adicionar outro setor?");
  }

  evento.lotes.push({ nome, dataVirada, setores });
  salvarEventos();
  atualizarLista();
}

// ========================= RENDERIZAR LOTES =========================
function renderizarLotes(evento) {
  const container = document.getElementById(`lotes-${evento.id}`);
  container.innerHTML = "";

  evento.lotes.forEach((lote, index) => {
    const divLote = document.createElement("div");
    divLote.classList.add("lote-card");

    const dataAtual = new Date();
    const dataVirada = new Date(lote.dataVirada);
    const diff = Math.ceil((dataVirada - dataAtual) / (1000 * 3600 * 24));

    const aviso =
      diff <= 0
        ? `<p class="aviso-vermelho piscando">⚠️ Lote expirado! Crie o próximo!</p>`
        : diff <= 3
        ? `<p class="aviso-vermelho piscando">⏰ Faltam ${diff} dias para virar o lote!</p>`
        : `<p style="color:lightgreen">✅ Próxima virada: ${lote.dataVirada}</p>`;

    divLote.innerHTML = `
      <h4>${lote.nome}</h4>
      ${aviso}
      <ul>
        ${lote.setores.map((s, i) => {
          const idSetor = `${evento.id}-${index}-${i}`;
          const nomeSetor = nomesSetores[idSetor] || s.setor;
          return `<li id="setor-${idSetor}">
                    <strong>${nomeSetor}</strong>
                    — Meia: R$${s.valores.meia || "-"} |
                    Solidário: R$${s.valores.solidario || "-"} |
                    Inteira: R$${s.valores.inteira || "-"}
                    <button onclick="editarNomeSetor('${idSetor}')">✏️</button>
                  </li>`;
        }).join("")}
      </ul>
      <div class="lote-buttons">
        <button onclick="editarNomeLote(${evento.id}, ${index})">✏️ Editar Nome</button>
        <button onclick="editarQtdLotes(${evento.id})"># Editar Quantidade</button>
        <button class="hidden" onclick="imprimirUltimoLote(${evento.id}, 'escuro')">🖤 Flyer Escuro</button>
        <button class="hidden" onclick="imprimirUltimoLote(${evento.id}, 'claro')">🤍 Versão Clara</button>
        <button onclick="imprimirFlyerStory(${evento.id})">📱 Story Flyer</button>
        <button class="hidden" onclick="visualizarFlyer(${evento.id})">👁️ Visualizar Flyer</button>
      </div>
    `;
    container.appendChild(divLote);
  });
}

// ========================= EDITAR SETOR =========================
function editarNomeSetor(idSetor) {
  const elemento = document.getElementById(`setor-${idSetor}`);
  if (!elemento) return alert("Setor não encontrado!");

  const nomeAtual = elemento.querySelector("strong").textContent.trim();
  const novoNome = prompt("Digite o novo nome do setor:", nomeAtual);
  if (novoNome && novoNome !== nomeAtual) {
    elemento.querySelector("strong").textContent = novoNome;
    nomesSetores[idSetor] = novoNome;
    salvarNomesSetores();
    alert("✅ Nome do setor atualizado!");
  }
}

// ========================= GERAR FLYERS (PDF sem imagem de fundo) =========================
async function imprimirUltimoLote(eventoId, tipo) {
  const evento = eventos.find(e => e.id === eventoId);
  if (!evento || !evento.lotes.length) return alert("Nenhum lote encontrado.");

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("landscape", "px", [842, 595]);

  if (tipo === "escuro") {
    doc.setFillColor(10, 15, 26);
  } else {
    doc.setFillColor(245, 245, 245);
  }
  doc.rect(0, 0, 842, 595, "F");

  doc.setTextColor(tipo === "escuro" ? 255 : 0, tipo === "escuro" ? 255 : 0, tipo === "escuro" ? 255 : 0);
  doc.setFontSize(26);
  doc.text(evento.nome, 421, 60, { align: "center" });

  const ultimoLote = evento.lotes[evento.lotes.length - 1];
  doc.setFontSize(18);
  doc.text(`Lote: ${ultimoLote.nome}`, 421, 90, { align: "center" });
  doc.setFontSize(14);
  doc.text(`Virada: ${ultimoLote.dataVirada}`, 421, 110, { align: "center" });

  let y = 150;
  ultimoLote.setores.forEach((s) => {
    doc.setDrawColor(200);
    doc.rect(100, y - 20, 642, 50);
    doc.text(s.setor.toUpperCase(), 421, y + 5, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Meia: R$${s.valores.meia || "-"}`, 220, y + 25);
    doc.text(`Solidário: R$${s.valores.solidario || "-"}`, 390, y + 25);
    doc.text(`Inteira: R$${s.valores.inteira || "-"}`, 580, y + 25);
    y += 60;
  });

  // ⚠️ Arte de fundo (marca d’água) desativada
  if (MOSTRAR_IMAGEM_FUNDO && evento.imagem) {
    const img = new Image();
    img.src = evento.imagem;
    await img.decode();
    doc.addImage(img, "PNG", 150, 100, 540, 350, "", "NONE", 0.1);
  }

  doc.save(`${evento.nome}-${tipo}.pdf`);
}

// ========================= STORY FLYER =========================
async function imprimirFlyerStory(eventoId) {
  const evento = eventos.find(e => e.id === eventoId);
  if (!evento || !evento.lotes.length) return alert("Nenhum lote encontrado.");
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("portrait", "px", [1080, 1920]);

  doc.setFillColor(10, 15, 26);
  doc.rect(0, 0, 1080, 1920, "F");
  doc.setTextColor(255, 255, 255);

  doc.setFontSize(46);
  doc.text(evento.nome, 540, 120, { align: "center" });
  const ultimoLote = evento.lotes[evento.lotes.length - 1];
  doc.setFontSize(30);
  doc.text(`Lote: ${ultimoLote.nome}`, 540, 180, { align: "center" });
  doc.setFontSize(22);
  doc.text(`Virada: ${ultimoLote.dataVirada}`, 540, 210, { align: "center" });

  let y = 340;
  ultimoLote.setores.forEach((s) => {
    doc.setDrawColor(80);
    doc.rect(120, y - 50, 840, 120);
    doc.setFontSize(26);
    doc.text(s.setor.toUpperCase(), 540, y, { align: "center" });
    doc.setFontSize(20);
    doc.text(`Meia: R$${s.valores.meia || "-"}`, 260, y + 50);
    doc.text(`Solidário: R$${s.valores.solidario || "-"}`, 520, y + 50);
    doc.text(`Inteira: R$${s.valores.inteira || "-"}`, 800, y + 50);
    y += 150;
  });

  // ⚠️ Arte de fundo (marca d’água) desativada
  if (MOSTRAR_IMAGEM_FUNDO && evento.imagem) {
    const img = new Image();
    img.src = evento.imagem;
    await img.decode();
    doc.addImage(img, "PNG", 150, 300, 780, 900, "", "NONE", 0.1);
  }

  doc.save(`${evento.nome}-story.pdf`);
}

// ========================= BACKUP / RESTAURAÇÃO =========================
document.getElementById("btnExportar").onclick = () => {
  const blob = new Blob([JSON.stringify(eventos, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "backup_eventos.json";
  a.click();
};

document.getElementById("btnImportar").onclick = () => {
  const file = document.getElementById("importarBackup").files[0];
  if (!file) return alert("Selecione um arquivo primeiro!");
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const dados = JSON.parse(e.target.result);
      if (Array.isArray(dados)) {
        eventos = dados;
        salvarEventos();
        atualizarLista();
        alert("✅ Backup importado com sucesso!");
      } else {
        alert("⚠️ Arquivo inválido.");
      }
    } catch (err) {
      alert("⚠️ Erro ao importar backup: " + err.message);
    }
  };
  reader.readAsText(file);
};

document.getElementById("btnLimpar").onclick = () => {
  if (confirm("Tem certeza que deseja limpar todos os dados?")) {
    localStorage.removeItem("eventos");
    eventos = [];
    atualizarLista();
    alert("🗑️ Todos os eventos foram apagados.");
  }
};

document.getElementById("btnResetar").onclick = () => {
  if (confirm("Deseja resetar completamente o sistema?")) {
    localStorage.clear();
    eventos = [];
    location.reload();
  }
};

// ========================= INICIALIZAÇÃO =========================
atualizarLista();
salvarNomesSetores();

// ========================= SERVICE WORKER =========================
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("./sw.js")
    .then(() => console.log("✅ Service Worker registrado"))
    .catch((err) => console.error("⚠️ Erro ao registrar SW:", err));
}
