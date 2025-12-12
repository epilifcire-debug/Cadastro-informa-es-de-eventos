// ========================= VARIÁVEIS GLOBAIS =========================
let eventos = JSON.parse(localStorage.getItem("eventos")) || [];

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

// ========================= SALVAR LOCALSTORAGE =========================
function salvarEventos() {
  localStorage.setItem("eventos", JSON.stringify(eventos));
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
    setores.push({
      setor,
      valores: { meia, solidario, inteira }
    });
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
        ${lote.setores
          .map(
            (s) => `
          <li><strong>${s.setor}</strong> — Meia: R$${s.valores.meia || "-"} | Solidário: R$${s.valores.solidario || "-"} | Inteira: R$${s.valores.inteira || "-"}</li>
        `
          )
          .join("")}
      </ul>
      <div class="lote-buttons">
        <button onclick="editarNomeLote(${evento.id}, ${index})">✏️ Editar Nome</button>
        <button onclick="editarQtdLotes(${evento.id})"># Editar Quantidade</button>
        <button onclick="imprimirUltimoLote(${evento.id}, 'escuro')">🖤 Flyer Escuro</button>
        <button onclick="imprimirUltimoLote(${evento.id}, 'claro')">🤍 Versão Clara</button>
        <button onclick="imprimirFlyerStory(${evento.id})">📱 Story Flyer</button>
        <button onclick="visualizarFlyer(${evento.id})">👁️ Visualizar Flyer</button>
      </div>
    `;

    container.appendChild(divLote);
  });
}

// ========================= EDITAR LOTE =========================
function editarNomeLote(id, index) {
  const evento = eventos.find((e) => e.id === id);
  const novoNome = prompt("Novo nome do lote:", evento.lotes[index].nome);
  if (novoNome) {
    evento.lotes[index].nome = novoNome;
    salvarEventos();
    atualizarLista();
  }
}
function editarQtdLotes(id) {
  const evento = eventos.find((e) => e.id === id);
  const qtd = parseInt(prompt("Nova quantidade de lotes:", evento.lotes.length));
  if (!isNaN(qtd) && qtd >= 0) {
    evento.lotes = evento.lotes.slice(0, qtd);
    salvarEventos();
    atualizarLista();
  }
}

// ========================= FLYER ESCURO / CLARO =========================
function imprimirUltimoLote(eventoId, tema) {
  const evento = eventos.find((e) => e.id === eventoId);
  if (!evento || !evento.lotes.length) return alert("Nenhum lote encontrado.");
  const ultimoLote = evento.lotes[evento.lotes.length - 1];
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");

  function sanitizeText(text) {
    return text
      ? text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x00-\x7F]/g, "")
      : "";
  }

  const bgColor = tema === "claro" ? [255, 255, 255] : [10, 15, 26];
  const txtColor = tema === "claro" ? [0, 0, 0] : [255, 255, 255];
  const accent = tema === "claro" ? [0, 102, 255] : [146, 197, 255];

  doc.setFillColor(...bgColor);
  doc.rect(0, 0, 210, 297, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...accent);
  doc.text(sanitizeText(evento.nome), 105, 30, { align: "center" });

  doc.setFontSize(16);
  doc.setTextColor(...txtColor);
  doc.text(sanitizeText(`Lote: ${ultimoLote.nome}`), 105, 45, { align: "center" });
  doc.text(sanitizeText(`Virada de lote: ${ultimoLote.dataVirada}`), 105, 55, { align: "center" });

  let y = 75;
  ultimoLote.setores.forEach((s) => {
    doc.setFontSize(12);
    doc.setTextColor(...txtColor);
    doc.text(sanitizeText(s.setor), 35, y);
    doc.text(sanitizeText(`Meia: R$${s.valores.meia || "-"}`), 35, y + 10);
    doc.text(sanitizeText(`Solidário: R$${s.valores.solidario || "-"}`), 90, y + 10);
    doc.text(sanitizeText(`Inteira: R$${s.valores.inteira || "-"}`), 150, y + 10);
    y += 30;
  });

  const nomeArquivo = `Flyer_${tema}_${sanitizeText(evento.nome.replace(/\s+/g, "_"))}_${sanitizeText(ultimoLote.nome.replace(/\s+/g, "_"))}.pdf`;
  doc.save(nomeArquivo);
}

// ========================= FLYER STORY 16:9 =========================
function imprimirFlyerStory(eventoId) {
  const evento = eventos.find((e) => e.id === eventoId);
  if (!evento || !evento.lotes.length) return alert("Nenhum lote encontrado.");
  const ultimoLote = evento.lotes[evento.lotes.length - 1];
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("l", "mm", "a4");

  function sanitizeText(text) {
    return text
      ? text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x00-\x7F]/g, "")
      : "";
  }

  doc.setFillColor(10, 15, 26);
  doc.rect(0, 0, 297, 210, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(146, 197, 255);
  doc.text(sanitizeText(evento.nome), 148, 40, { align: "center" });
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(sanitizeText(`Lote: ${ultimoLote.nome}`), 148, 60, { align: "center" });
  doc.setFontSize(12);
  doc.text(sanitizeText(`Virada de lote: ${ultimoLote.dataVirada}`), 148, 72, { align: "center" });

  let y = 95;
  ultimoLote.setores.forEach((s) => {
    doc.setFillColor(18, 24, 38);
    doc.roundedRect(40, y - 8, 220, 25, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(146, 197, 255);
    doc.text(sanitizeText(s.setor.toUpperCase()), 45, y + 2);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(255, 255, 255);
    doc.text(sanitizeText(`Meia: R$ ${s.valores.meia || "-"}`), 45, y + 10);
    doc.text(sanitizeText(`Solidário: R$ ${s.valores.solidario || "-"}`), 120, y + 10);
    doc.text(sanitizeText(`Inteira: R$ ${s.valores.inteira || "-"}`), 200, y + 10);
    y += 32;
  });

  const nomeArquivo = `Flyer_Story_${sanitizeText(evento.nome.replace(/\s+/g, "_"))}_${sanitizeText(ultimoLote.nome.replace(/\s+/g, "_"))}.pdf`;
  doc.save(nomeArquivo);
}

// ========================= VISUALIZAR FLYER =========================
function visualizarFlyer(eventoId) {
  const evento = eventos.find(e => e.id === eventoId);
  if (!evento || !evento.lotes.length) return alert("Nenhum lote encontrado.");
  const ultimoLote = evento.lotes[evento.lotes.length - 1];
  const canvas = document.getElementById("canvasPreview");
  const ctx = canvas.getContext("2d");
  const modal = document.getElementById("modalFlyer");
  const fechar = document.getElementById("btnFecharPreview");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#0A0F1A");
  gradient.addColorStop(1, "#1E293B");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (evento.imagem) {
    const img = new Image();
    img.src = evento.imagem;
    img.onload = () => {
      const scale = Math.min(0.9 * canvas.width / img.width, 0.9 * canvas.height / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      const x = (canvas.width - w) / 2;
      const y = (canvas.height - h) / 2;
      ctx.globalAlpha = 0.1;
      ctx.drawImage(img, x, y, w, h);
      ctx.globalAlpha = 1.0;
      desenhar();
    };
  } else desenhar();

  function desenhar() {
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 32px Poppins";
    ctx.textAlign = "center";
    ctx.fillText(evento.nome, canvas.width / 2, 70);
    ctx.font = "bold 22px Poppins";
    ctx.fillText(`Lote: ${ultimoLote.nome}`, canvas.width / 2, 110);
    ctx.font = "16px Poppins";
    ctx.fillText(`Virada de lote: ${ultimoLote.dataVirada}`, canvas.width / 2, 140);

    let y = 180;
    ultimoLote.setores.forEach((s) => {
      ctx.fillStyle = "rgba(30,40,60,0.8)";
      ctx.fillRect(100, y - 20, 640, 50);
      ctx.fillStyle = "#92C5FF";
      ctx.font = "bold 18px Poppins";
      ctx.fillText(s.setor.toUpperCase(), canvas.width / 2, y);
      ctx.font = "14px Poppins";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(`Meia: R$ ${s.valores.meia || "-"}`, 250, y + 25);
      ctx.fillText(`Solidário: R$ ${s.valores.solidario || "-"}`, 420, y + 25);
      ctx.fillText(`Inteira: R$ ${s.valores.inteira || "-"}`, 600, y + 25);
      y += 70;
    });
  }

  modal.style.display = "flex";
  fechar.onclick = () => modal.style.display = "none";
  window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };
}

// ========================= BACKUP / RESTAURAÇÃO =========================
document.getElementById("btnExportar").onclick = () => {
  const blob = new Blob([JSON.stringify(eventos, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "backup_eventos.json";
  a.click();
};

document.getElementById("btnImportar

// ========================= BACKUP / RESTAURAÇÃO (continuação) =========================
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

// ========================= INICIALIZAR =========================
atualizarLista();
