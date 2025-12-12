// ===================== UTILITÁRIOS =====================

// Lê eventos do localStorage
function carregarEventos() {
  return JSON.parse(localStorage.getItem("eventos")) || [];
}

// Salva eventos no localStorage
function salvarEventos(eventos) {
  localStorage.setItem("eventos", JSON.stringify(eventos));
}

// Pagamento compatível com versões antigas (pagamento / formasPagamento)
function getPagamento(evento) {
  return evento.pagamento || evento.formasPagamento || "Não informado";
}

// Formata data no padrão BR (DD/MM/AAAA)
function formatarDataSimples(data) {
  if (!data) return "Não definida";
  const dateObj = new Date(data);
  if (isNaN(dateObj)) return data;
  const dia = String(dateObj.getDate()).padStart(2, "0");
  const mes = String(dateObj.getMonth() + 1).padStart(2, "0");
  const ano = dateObj.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

// ===================== VIRADA DE LOTE / CHECKLIST =====================

// Define ou altera a data de virada de lote
function definirViradaLote(idEvento) {
  const eventos = carregarEventos();
  const evento = eventos.find((e) => e.id === idEvento);
  if (!evento) return alert("Evento não encontrado.");

  const novaData = prompt(
    "Digite a data da virada do lote (AAAA-MM-DD):",
    evento.viradaData || ""
  );
  if (!novaData) return;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(novaData)) {
    alert("Formato inválido! Use AAAA-MM-DD.");
    return;
  }

  evento.viradaData = novaData;
  evento.loteAtualizado = false;
  salvarEventos(eventos);
  if (typeof playSound === "function") playSound("success");
  renderEventos();
  alert("✅ Data de virada de lote salva!");
}

// Marca que já foi feita a alteração de lote
function marcarLoteAtualizado(idEvento) {
  const eventos = carregarEventos();
  const evento = eventos.find((e) => e.id === idEvento);
  if (!evento) return alert("Evento não encontrado.");

  evento.loteAtualizado = true;
  salvarEventos(eventos);
  if (typeof playSound === "function") playSound("success");

  const resposta = confirm(
    "✅ Lote marcado como atualizado!\nDeseja definir uma nova data de virada?"
  );
  if (resposta) definirViradaLote(idEvento);
  else renderEventos();
}

// ===================== PDF (APENAS ÚLTIMO LOTE) =====================

async function baixarPDFUltimoLote(idEvento) {
  const { jsPDF } = window.jspdf;
  const eventos = carregarEventos();
  const evento = eventos.find((e) => e.id === idEvento);
  if (!evento) return alert("Evento não encontrado.");

  if (!evento.lotes || !evento.lotes.length) {
    alert("Nenhum lote cadastrado neste evento.");
    return;
  }

  const ultimoLote = evento.lotes[evento.lotes.length - 1];
  const doc = new jsPDF();

  // Cabeçalho
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(evento.nome, 10, 20);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Data do Evento: ${formatarDataSimples(evento.data)}`, 10, 30);

  // Último lote
  doc.setFont("helvetica", "bold");
  doc.text(`Último Lote: ${ultimoLote.nome}`, 10, 45);

  doc.setFont("helvetica", "normal");
  let y = 55;

  if (ultimoLote.setores && ultimoLote.setores.length) {
    ultimoLote.setores.forEach((s, i) => {
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

  if (typeof playSound === "function") playSound("success");
  doc.save(`${evento.nome}-Ultimo-Lote.pdf`);
}

// ===================== CRUD DE EVENTOS =====================

function adicionarEvento(evento) {
  const eventos = carregarEventos();
  eventos.push(evento);
  salvarEventos(eventos);
}

function atualizarEvento(eventoAtualizado) {
  const eventos = carregarEventos();
  const idx = eventos.findIndex((e) => e.id === eventoAtualizado.id);
  if (idx !== -1) {
    eventos[idx] = eventoAtualizado;
    salvarEventos(eventos);
  }
}

function excluirEvento(id) {
  if (!confirm("Tem certeza que deseja excluir este evento?")) return;
  let eventos = carregarEventos();
  eventos = eventos.filter((e) => e.id !== id);
  salvarEventos(eventos);
  if (typeof playSound === "function") playSound("delete");
  renderEventos();
}

// ===================== RENDERIZAÇÃO =====================

function criarCardEvento(evento) {
  const card = document.createElement("div");
  card.className = "evento-card";

  const h3 = document.createElement("h3");
  h3.textContent = evento.nome;

  const pData = document.createElement("p");
  pData.textContent = `Data: ${formatarDataSimples(evento.data)}`;

  const pLocal = document.createElement("p");
  pLocal.textContent = `Local: ${evento.local || "Não informado"}`;

  const pClass = document.createElement("p");
  pClass.textContent = `Classificação: ${
    evento.classificacao || "Não informada"
  }`;

  const pPag = document.createElement("p");
  pPag.textContent = `Pagamento: ${getPagamento(evento)}`;

  const pDesc = document.createElement("p");
  pDesc.textContent = `Descrição: ${
    evento.descricao && evento.descricao.trim()
      ? evento.descricao
      : "Nenhuma descrição informada."
  }`;

  card.appendChild(h3);
  card.appendChild(pData);
  card.appendChild(pLocal);
  card.appendChild(pClass);
  card.appendChild(pPag);
  card.appendChild(pDesc);

  // Informações da virada de lote
  const infoVirada = document.createElement("p");
  infoVirada.classList.add("info-virada");
  let textoVirada = `🔄 Virada de Lote: ${
    evento.viradaData ? formatarDataSimples(evento.viradaData) : "Não definida"
  }`;

  if (evento.viradaData) {
    const hoje = new Date();
    const virada = new Date(evento.viradaData);
    const diffDias = Math.ceil(
      (virada - hoje) / (1000 * 60 * 60 * 24)
    );

    if (diffDias <= 3 && diffDias >= 0) {
      infoVirada.classList.add("alerta-virada");
      textoVirada = `⚠️ Virada em ${diffDias} dia${
        diffDias !== 1 ? "s" : ""
      }! (${formatarDataSimples(evento.viradaData)})`;
    } else if (diffDias < 0) {
      infoVirada.classList.add("alerta-virada");
      textoVirada = `🚨 Lote já virou em ${formatarDataSimples(
        evento.viradaData
      )}!`;
    }
  }

  if (evento.loteAtualizado) {
    infoVirada.classList.remove("alerta-virada");
    infoVirada.classList.add("lote-ok");
    textoVirada = `✅ Lote atualizado (${
      evento.viradaData ? formatarDataSimples(evento.viradaData) : "sem data"
    })`;
  }

  infoVirada.textContent = textoVirada;

  const btnCheck = document.createElement("button");
  btnCheck.textContent = "✅";
  btnCheck.classList.add("btn-check");
  btnCheck.title = "Marcar lote como atualizado";
  btnCheck.addEventListener("click", () => marcarLoteAtualizado(evento.id));

  infoVirada.appendChild(btnCheck);
  card.appendChild(infoVirada);

  // Lotes (lista simples)
  if (evento.lotes && evento.lotes.length) {
    const lotesDiv = document.createElement("div");
    lotesDiv.className = "lotes-container";

    const tituloLotes = document.createElement("strong");
    tituloLotes.textContent = "Lotes cadastrados:";

    lotesDiv.appendChild(tituloLotes);

    evento.lotes.forEach((l, i) => {
      const pL = document.createElement("p");
      pL.textContent = `${i + 1}. ${l.nome} - ${
        l.setores ? l.setores.length : 0
      } setor(es)`;
      lotesDiv.appendChild(pL);
    });

    card.appendChild(lotesDiv);
  }

  // Botões de ação
  const btnEditar = document.createElement("button");
  btnEditar.textContent = "Editar";
  btnEditar.addEventListener("click", () => abrirModalEdicao(evento.id));

  const btnExcluir = document.createElement("button");
  btnExcluir.textContent = "Excluir";
  btnExcluir.classList.add("btn-cancelar");
  btnExcluir.addEventListener("click", () => excluirEvento(evento.id));

  const btnPDFUltimo = document.createElement("button");
  btnPDFUltimo.textContent = "📄 Gerar PDF (Último Lote)";
  btnPDFUltimo.classList.add("btn-pdf-ultimo");
  btnPDFUltimo.addEventListener("click", () =>
    baixarPDFUltimoLote(evento.id)
  );

  const btnVirada = document.createElement("button");
  btnVirada.textContent = "Virada de Lote";
  btnVirada.addEventListener("click", () => definirViradaLote(evento.id));

  card.appendChild(btnEditar);
  card.appendChild(btnExcluir);
  card.appendChild(btnVirada);
  card.appendChild(btnPDFUltimo);

  return card;
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

  eventos.forEach((evento) => {
    const card = criarCardEvento(evento);
    lista.appendChild(card);
  });
}

// ===================== MODAL DE EDIÇÃO =====================

function abrirModalEdicao(id) {
  const eventos = carregarEventos();
  const evento = eventos.find((e) => e.id === id);
  if (!evento) return alert("Evento não encontrado.");

  document.getElementById("editId").value = evento.id;
  document.getElementById("editNome").value = evento.nome;
  document.getElementById("editData").value = evento.data;
  document.getElementById("editClassificacao").value =
    evento.classificacao || "";
  document.getElementById("editLocal").value = evento.local || "";
  document.getElementById("editPagamento").value =
    evento.formasPagamento || evento.pagamento || "";
  document.getElementById("editDescricao").value = evento.descricao || "";

  document.getElementById("modalEditar").style.display = "flex";
}

function fecharModalEdicao() {
  document.getElementById("modalEditar").style.display = "none";
}

// ===================== BACKUP / RESTAURAÇÃO =====================

function exportarBackup() {
  const eventos = carregarEventos();
  const blob = new Blob([JSON.stringify(eventos, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "backup-eventos.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importarBackup(arquivo) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const dados = JSON.parse(e.target.result);
      if (!Array.isArray(dados)) {
        alert("Backup inválido.");
        return;
      }
      salvarEventos(dados);
      if (typeof playSound === "function") playSound("success");
      renderEventos();
      alert("✅ Backup importado com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao ler o backup.");
    }
  };
  reader.readAsText(arquivo);
}

function limparDados() {
  if (!confirm("Deseja limpar todos os dados de eventos?")) return;
  localStorage.removeItem("eventos");
  if (typeof playSound === "function") playSound("delete");
  renderEventos();
}

function resetarSistema() {
  if (!confirm("Isso irá limpar TUDO do sistema. Confirmar?")) return;
  localStorage.clear();
  if (typeof playSound === "function") playSound("delete");
  location.reload();
}

// ===================== INICIALIZAÇÃO =====================

document.addEventListener("DOMContentLoaded", () => {
  const formEvento = document.getElementById("formEvento");
  const formEditar = document.getElementById("formEditar");
  const btnCancelarEdicao = document.getElementById("cancelarEdicao");

  const btnExportar = document.getElementById("btnExportar");
  const btnImportar = document.getElementById("btnImportar");
  const inputImportar = document.getElementById("importarBackup");
  const btnLimpar = document.getElementById("btnLimpar");
  const btnResetar = document.getElementById("btnResetar");

  // Cadastrar novo evento
  if (formEvento) {
    formEvento.addEventListener("submit", (e) => {
      e.preventDefault();
      const evento = {
        id: Date.now(),
        nome: document.getElementById("nomeEvento").value.trim(),
        data: document.getElementById("dataEvento").value,
        classificacao: document.getElementById("classificacao").value.trim(),
        local: document.getElementById("localEvento").value.trim(),
        formasPagamento: document
          .getElementById("formasPagamento")
          .value.trim(),
        descricao: document.getElementById("descricao").value.trim(),
        lotes: [], // novos eventos começam sem lotes
        viradaData: null,
        loteAtualizado: false,
      };

      if (!evento.nome || !evento.data) {
        alert("Preencha pelo menos nome e data do evento.");
        return;
      }

      adicionarEvento(evento);
      if (typeof playSound === "function") playSound("success");
      formEvento.reset();
      renderEventos();
    });
  }

  // Editar evento
  if (formEditar) {
    formEditar.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = Number(document.getElementById("editId").value);
      const eventos = carregarEventos();
      const evento = eventos.find((ev) => ev.id === id);
      if (!evento) return alert("Evento não encontrado.");

      evento.nome = document.getElementById("editNome").value.trim();
      evento.data = document.getElementById("editData").value;
      evento.classificacao =
        document.getElementById("editClassificacao").value.trim();
      evento.local = document.getElementById("editLocal").value.trim();
      const pag = document.getElementById("editPagamento").value.trim();
      evento.formasPagamento = pag;
      evento.pagamento = pag; // compatibilidade
      evento.descricao =
        document.getElementById("editDescricao").value.trim();

      atualizarEvento(evento);
      if (typeof playSound === "function") playSound("success");
      fecharModalEdicao();
      renderEventos();
    });
  }

  if (btnCancelarEdicao) {
    btnCancelarEdicao.addEventListener("click", () => fecharModalEdicao());
  }

  // Backup
  if (btnExportar) btnExportar.addEventListener("click", exportarBackup);

  if (btnImportar && inputImportar) {
    btnImportar.addEventListener("click", () => {
      if (!inputImportar.files.length) {
        alert("Selecione um arquivo de backup (.json) primeiro.");
        return;
      }
      importarBackup(inputImportar.files[0]);
    });
  }

  if (btnLimpar) btnLimpar.addEventListener("click", limparDados);
  if (btnResetar) btnResetar.addEventListener("click", resetarSistema);

  // Primeira renderização
  renderEventos();
});
