// ===================== UTILITÁRIOS =====================

// Leitura e escrita segura no localStorage
function carregarEventos() {
  try {
    return JSON.parse(localStorage.getItem("eventos")) || [];
  } catch (e) {
    console.warn("⚠️ Dados corrompidos no localStorage. Resetando...");
    localStorage.removeItem("eventos");
    return [];
  }
}

function salvarEventos(e) {
  localStorage.setItem("eventos", JSON.stringify(e));
}

function getPagamento(e) {
  return e.pagamento || e.formasPagamento || "Não informado";
}

function formatarDataSimples(data) {
  if (!data) return "Não definida";
  const d = new Date(data);
  if (isNaN(d)) return data;
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()}`;
}

// ===================== EFEITOS SONOROS =====================
function playSound(name) {
  const sounds = {
    success: new Audio("data:audio/mp3;base64,//uQxAAACAAf5f7p6VUEAAAB9AAABpAAABAAABHCAABGgAAACAAADSAAAAJAAAAEAAASAAABGgAAACAAADSAAAAJAAAAEAAASAAABGgAAAA//uQZAAAAEoAAD6AAAAgAAAAgAAAAIAAAAD/7kGQAAABKAAA+gAAAIAAAACAAAAAgAAAAD//2wBDAAICAgICAgMCAgMEAwMDBAYEBAQEBAgGBgUGCQgKCgkICQsJDAwMDAwMEAwQDAwMEA8PDwwNDg4ODw4PDA0NDf/AABEIAKgBLAMBIgACEQEDEQH/xAAZAAEAAwEBAAAAAAAAAAAAAAAABAUGAwH/xAAhEAABAwMFAQEAAAAAAAAAAAAAAQIDBAUREiExUWEGQf/EABgBAAIDAAAAAAAAAAAAAAAAAAQBAgMF/8QAGREAAwEBAQAAAAAAAAAAAAAAAAECERJB/9oADAMBAAIRAxEAPwCVL7Mmy1oSRgAABBBxjjvtu/hVhbUeZ7ZmgFZB8dyjnvfIaSu+Vv1OzCh0//2Q=="),
    delete: new Audio("data:audio/mp3;base64,//uQxAAACAAf5f7p6VUEAAAB9AAABpAAABAAABHCAABGgAAAA//uQZAAAAEoAAD6AAAAgAAAAgAAAAIAAAAD/7kGQAAABKAAA+gAAAIAAAACAAAAAgAAAAD")
  };
  const s = sounds[name];
  if (s) {
    s.currentTime = 0;
    s.volume = 0.35;
    s.play().catch(() => {});
  }
}

// ===================== VIRADA / CHECKLIST =====================
function definirViradaLote(idEvento) {
  const eventos = carregarEventos();
  const ev = eventos.find((x) => x.id === idEvento);
  if (!ev) return alert("Evento não encontrado.");

  const novaData = prompt(
    "Digite a data da virada do lote (AAAA-MM-DD):",
    ev.viradaData || ""
  );
  if (!novaData) return;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(novaData))
    return alert("Formato inválido! Use AAAA-MM-DD.");

  ev.viradaData = novaData;
  ev.loteAtualizado = false;
  salvarEventos(eventos);
  playSound("success");
  renderEventos();
  alert("✅ Data de virada salva!");
}

function marcarLoteAtualizado(idEvento) {
  const eventos = carregarEventos();
  const ev = eventos.find((x) => x.id === idEvento);
  if (!ev) return alert("Evento não encontrado.");

  ev.loteAtualizado = true;
  salvarEventos(eventos);
  playSound("success");
  const resp = confirm("✅ Lote marcado como atualizado!\nDeseja definir nova data?");
  if (resp) definirViradaLote(idEvento);
  else renderEventos();
}

// ===================== PDF (ÚLTIMO LOTE) =====================
async function baixarPDFUltimoLote(idEvento) {
  if (!window.jspdf) {
    alert("⚠️ O gerador de PDF ainda está carregando. Tente novamente em alguns segundos.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const eventos = carregarEventos();
  const ev = eventos.find((x) => x.id === idEvento);
  if (!ev) return alert("Evento não encontrado.");
  if (!ev.lotes || !ev.lotes.length)
    return alert("Nenhum lote cadastrado neste evento.");

  const ultimo = ev.lotes[ev.lotes.length - 1];
  const doc = new jsPDF();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(ev.nome, 10, 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`Data do Evento: ${formatarDataSimples(ev.data)}`, 10, 30);
  doc.setFont("helvetica", "bold");
  doc.text(`Último Lote: ${ultimo.nome}`, 10, 45);

  let y = 55;
  doc.setFont("helvetica", "normal");
  if (ultimo.setores?.length) {
    ultimo.setores.forEach((s, i) => {
      doc.text(`${i + 1}. ${s.setor}`, 10, y);
      doc.text(`Meia: R$ ${s.valores.meia}`, 70, y);
      doc.text(`Solidário: R$ ${s.valores.solidario}`, 110, y);
      doc.text(`Inteira: R$ ${s.valores.inteira}`, 160, y);
      y += 10;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
  } else {
    doc.text("Nenhum setor cadastrado neste lote.", 10, y);
  }

  playSound("success");
  doc.save(`${ev.nome}-Ultimo-Lote.pdf`);
}

// ===================== CRUD =====================
function adicionarEvento(e) {
  const eventos = carregarEventos();
  eventos.push(e);
  salvarEventos(eventos);
}

function atualizarEvento(ev) {
  const eventos = carregarEventos();
  const i = eventos.findIndex((x) => x.id === ev.id);
  if (i !== -1) {
    eventos[i] = ev;
    salvarEventos(eventos);
  }
}

function excluirEvento(id) {
  if (!confirm("Excluir este evento?")) return;
  let e = carregarEventos().filter((x) => x.id !== id);
  salvarEventos(e);
  playSound("delete");
  renderEventos();
}

// ===================== RENDERIZAÇÃO =====================
function criarCardEvento(ev) {
  const div = document.createElement("div");
  div.className = "evento-card";

  const h3 = document.createElement("h3");
  h3.textContent = ev.nome;
  const pData = document.createElement("p");
  pData.textContent = `Data: ${formatarDataSimples(ev.data)}`;
  const pLocal = document.createElement("p");
  pLocal.textContent = `Local: ${ev.local || "Não informado"}`;
  const pPag = document.createElement("p");
  pPag.textContent = `Pagamento: ${getPagamento(ev)}`;
  div.append(h3, pData, pLocal, pPag);

  // Info de virada
  const info = document.createElement("p");
  info.classList.add("info-virada");
  let txt = `🔄 Virada de Lote: ${
    ev.viradaData ? formatarDataSimples(ev.viradaData) : "Não definida"
  }`;

  if (ev.viradaData) {
    const hoje = new Date();
    const virada = new Date(ev.viradaData);
    const diff = Math.ceil((virada - hoje) / (1000 * 60 * 60 * 24));
    if (diff <= 3 && diff >= 0) {
      info.classList.add("alerta-virada");
      txt = `⚠️ Virada em ${diff} dia${diff !== 1 ? "s" : ""}! (${formatarDataSimples(ev.viradaData)})`;
    } else if (diff < 0) {
      info.classList.add("alerta-virada");
      txt = `🚨 Lote já virou em ${formatarDataSimples(ev.viradaData)}!`;
    }
  }
  if (ev.loteAtualizado) {
    info.classList.remove("alerta-virada");
    info.classList.add("lote-ok");
    txt = `✅ Lote atualizado (${ev.viradaData ? formatarDataSimples(ev.viradaData) : "sem data"})`;
  }
  info.textContent = txt;

  const btnCheck = document.createElement("button");
  btnCheck.textContent = "✅";
  btnCheck.classList.add("btn-check");
  btnCheck.onclick = () => marcarLoteAtualizado(ev.id);
  info.appendChild(btnCheck);
  div.appendChild(info);

  // Botões de ação
  const btnEditar = document.createElement("button");
  btnEditar.textContent = "Editar Evento";
  btnEditar.onclick = () => abrirModalEdicao(ev.id);

  const btnGerenciar = document.createElement("button");
  btnGerenciar.textContent = "Gerenciar Lote";
  btnGerenciar.onclick = () => {
    localStorage.setItem("eventoSelecionado", ev.id);
    window.location.href = "gerenciar-lote.html";
  };

  const btnEditarLote = document.createElement("button");
  btnEditarLote.textContent = "Editar Lote";
  btnEditarLote.onclick = () => editarLoteAtual(ev.id);

  const btnVirada = document.createElement("button");
  btnVirada.textContent = "Virada de Lote";
  btnVirada.onclick = () => definirViradaLote(ev.id);

  const btnPDF = document.createElement("button");
  btnPDF.textContent = "📄 Gerar PDF (Último Lote)";
  btnPDF.classList.add("btn-pdf-ultimo");
  btnPDF.onclick = () => baixarPDFUltimoLote(ev.id);

  const btnExcluir = document.createElement("button");
  btnExcluir.textContent = "Excluir";
  btnExcluir.classList.add("btn-cancelar");
  btnExcluir.onclick = () => excluirEvento(ev.id);

  div.append(btnEditar, btnGerenciar, btnEditarLote, btnVirada, btnPDF, btnExcluir);
  return div;
}

function renderEventos() {
  const lista = document.getElementById("listaEventos");
  if (!lista) return;
  lista.innerHTML = "";
  const eventos = carregarEventos();
  if (!eventos.length) {
    lista.innerHTML = "<p>Nenhum evento cadastrado.</p>";
    return;
  }
  eventos.forEach((ev) => lista.appendChild(criarCardEvento(ev)));
}

// ===================== EDITAR LOTE =====================
function editarLoteAtual(idEvento) {
  const eventos = carregarEventos();
  const ev = eventos.find((x) => x.id === idEvento);
  if (!ev || !ev.lotes?.length)
    return alert("Nenhum lote encontrado neste evento.");

  const ultimo = ev.lotes[ev.lotes.length - 1];
  const novoNome = prompt("Editar nome do lote:", ultimo.nome || "Novo Lote");
  if (!novoNome) return;

  ultimo.nome = novoNome;
  salvarEventos(eventos);
  playSound("success");
  renderEventos();
}

// ===================== BACKUP / RESTAURAÇÃO =====================
function exportarBackup() {
  const dados = carregarEventos();
  const blob = new Blob([JSON.stringify(dados, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "backup-eventos.json";
  a.click();
}

function importarBackup(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data)) throw new Error();
      salvarEventos(data);
      playSound("success");
      renderEventos();
      alert("✅ Backup importado com sucesso!");
    } catch {
      alert("Arquivo inválido.");
    }
  };
  reader.readAsText(file);
}

function limparDados() {
  if (!confirm("Limpar todos os eventos?")) return;
  localStorage.removeItem("eventos");
  playSound("delete");
  renderEventos();
}

function resetarSistema() {
  if (!confirm("Isso apagará TUDO. Continuar?")) return;
  localStorage.clear();
  playSound("delete");
  location.reload();
}

// ===================== MODAL DE EDIÇÃO =====================
function abrirModalEdicao(id) {
  const ev = carregarEventos().find((x) => x.id === id);
  if (!ev) return alert("Evento não encontrado.");

  document.getElementById("editId").value = ev.id;
  document.getElementById("editNome").value = ev.nome;
  document.getElementById("editData").value = ev.data;
  document.getElementById("editClassificacao").value = ev.classificacao || "";
  document.getElementById("editLocal").value = ev.local || "";
  document.getElementById("editPagamento").value =
    ev.formasPagamento || ev.pagamento || "";
  document.getElementById("editDescricao").value = ev.descricao || "";
  document.getElementById("modalEditar").style.display = "flex";
}

function fecharModalEdicao() {
  document.getElementById("modalEditar").style.display = "none";
}

// ===================== INICIALIZAÇÃO =====================
document.addEventListener("DOMContentLoaded", () => {
  const formEvento = document.getElementById("formEvento");
  const formEditar = document.getElementById("formEditar");

  if (formEvento)
    formEvento.addEventListener("submit", (e) => {
      e.preventDefault();
      const evento = {
        id: Date.now(),
        nome: nomeEvento.value.trim(),
        data: dataEvento.value,
        classificacao: classificacao.value.trim() || "Livre",
        local: localEvento.value.trim() || "Não informado",
        formasPagamento: formasPagamento.value.trim() || "Não informado",
        descricao: descricao.value.trim() || "",
        lotes: [],
        viradaData: null,
        loteAtualizado: false,
      };
      if (!evento.nome || !evento.data)
        return alert("Preencha nome e data.");
      adicionarEvento(evento);
      playSound("success");
      formEvento.reset();
      renderEventos();
    });

  if (formEditar)
    formEditar.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = Number(editId.value);
      const eventos = carregarEventos();
      const ev = eventos.find((x) => x.id === id);
      if (!ev) return alert("Evento não encontrado.");
      ev.nome = editNome.value.trim();
      ev.data = editData.value;
      ev.classificacao = editClassificacao.value.trim();
      ev.local = editLocal.value.trim();
      ev.formasPagamento = editPagamento.value.trim();
      ev.pagamento = ev.formasPagamento;
      ev.descricao = editDescricao.value.trim();
      salvarEventos(eventos);
      playSound("success");
      fecharModalEdicao();
      renderEventos();
    });

  // Botões
  const cancelar = document.getElementById("cancelarEdicao");
  const exportar = document.getElementById("btnExportar");
  const importar = document.getElementById("btnImportar");
  const limpar = document.getElementById("btnLimpar");
  const resetar = document.getElementById("btnResetar");

  if (cancelar) cancelar.addEventListener("click", fecharModalEdicao);
  if (exportar) exportar.addEventListener("click", exportarBackup);
  if (importar)
    importar.addEventListener("click", () => {
      const input = document.getElementById("importarBackupInput");
      if (!input.files.length) return alert("Selecione um arquivo JSON.");
      importarBackup(input.files[0]);
    });
  if (limpar) limpar.addEventListener("click", limparDados);
  if (resetar) resetar.addEventListener("click", resetarSistema);

  renderEventos();
});
