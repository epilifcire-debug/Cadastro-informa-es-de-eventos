// ======= Função de Pagamento compatível =======
function getPagamento(evento) {
  return evento.pagamento || evento.formasPagamento || "Não informado";
}

// ======= Formatar data BR =======
function formatarDataSimples(data) {
  if (!data) return "Não definida";
  const dateObj = new Date(data);
  if (isNaN(dateObj)) return data;
  const dia = String(dateObj.getDate()).padStart(2, '0');
  const mes = String(dateObj.getMonth() + 1).padStart(2, '0');
  const ano = dateObj.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

// ======= Virada de Lote =======
function definirViradaLote(idEvento) {
  const eventos = JSON.parse(localStorage.getItem('eventos')) || [];
  const evento = eventos.find(e => e.id === idEvento);
  if (!evento) return alert("Evento não encontrado.");

  const novaData = prompt("Digite a data da virada do lote (AAAA-MM-DD):", evento.viradaData || "");
  if (!novaData) return;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(novaData)) {
    alert("Formato inválido! Use AAAA-MM-DD.");
    return;
  }

  evento.viradaData = novaData;
  evento.loteAtualizado = false;
  localStorage.setItem("eventos", JSON.stringify(eventos));
  renderEventos();
  alert("✅ Data de virada de lote salva!");
}

// ======= Checklist =======
function marcarLoteAtualizado(idEvento) {
  const eventos = JSON.parse(localStorage.getItem('eventos')) || [];
  const evento = eventos.find(e => e.id === idEvento);
  if (!evento) return alert("Evento não encontrado.");

  evento.loteAtualizado = true;
  localStorage.setItem("eventos", JSON.stringify(eventos));

  const resposta = confirm("✅ Lote marcado como atualizado!\nDeseja definir uma nova data de virada?");
  if (resposta) definirViradaLote(idEvento);
  else renderEventos();
}

// ======= PDF =======
async function baixarPDF(idEvento) {
  const { jsPDF } = window.jspdf;
  const eventos = JSON.parse(localStorage.getItem('eventos')) || [];
  const evento = eventos.find(e => e.id === idEvento);
  if (!evento) return alert("Evento não encontrado!");

  const doc = new jsPDF();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(evento.nome, 10, 20);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Data: ${formatarDataSimples(evento.data)}`, 10, 30);
  doc.text(`Local: ${evento.local}`, 10, 38);
  doc.text(`Classificação: ${evento.classificacao || "Não informada"}`, 10, 46);
  doc.text(`Pagamento: ${getPagamento(evento)}`, 10, 54);
  if (evento.viradaData) doc.text(`Virada de Lote: ${formatarDataSimples(evento.viradaData)}`, 10, 62);

  doc.text("Descrição:", 10, 72);
  const descricao = evento.descricao || "Nenhuma descrição informada.";
  const linhasDesc = doc.splitTextToSize(descricao, 180);
  doc.text(linhasDesc, 10, 78);

  let y = 100;
  if (evento.lotes?.length) {
    doc.setFont("helvetica", "bold");
    doc.text("Lotes e Setores:", 10, y);
    y += 8;
    evento.lotes.forEach((lote, i) => {
      doc.text(`${i + 1}. ${lote.nome}`, 10, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      lote.setores.forEach(s => {
        doc.text(`- ${s.setor}: Meia ${s.valores.meia} | Solidário ${s.valores.solidario} | Inteira ${s.valores.inteira}`, 12, y);
        y += 6;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });
      y += 4;
    });
  }

  doc.save(`${evento.nome}.pdf`);
}

// ======= Renderização compatível =======
const oldRenderEventos = window.renderEventos;
window.renderEventos = function() {
  oldRenderEventos();

  document.querySelectorAll('.evento-card').forEach(div => {
    const idText = div.querySelector('button').getAttribute('onclick');
    const id = Number(idText.match(/\d+/)[0]);
    const eventos = JSON.parse(localStorage.getItem('eventos')) || [];
    const evento = eventos.find(e => e.id === id);

    const infoVirada = document.createElement('p');
    infoVirada.classList.add('info-virada');

    let texto = `🔄 Virada de Lote: ${evento?.viradaData ? formatarDataSimples(evento.viradaData) : "Não definida"}`;

    if (evento.viradaData) {
      const hoje = new Date();
      const virada = new Date(evento.viradaData);
      const diffDias = Math.ceil((virada - hoje) / (1000 * 60 * 60 * 24));

      if (diffDias <= 3 && diffDias >= 0) {
        infoVirada.classList.add('alerta-virada');
        texto = `⚠️ Virada em ${diffDias} dia${diffDias !== 1 ? 's' : ''}! (${formatarDataSimples(evento.viradaData)})`;
      } else if (diffDias < 0) {
        texto = `🚨 Lote já virou em ${formatarDataSimples(evento.viradaData)}!`;
        infoVirada.classList.add('alerta-virada');
      }
    }

    if (evento.loteAtualizado) {
      texto = `✅ Lote atualizado (${evento.viradaData ? formatarDataSimples(evento.viradaData) : "sem data"})`;
      infoVirada.classList.remove('alerta-virada');
      infoVirada.classList.add('lote-ok');
    }

    infoVirada.textContent = texto;

    const btnCheck = document.createElement('button');
    btnCheck.textContent = '✅';
    btnCheck.classList.add('btn-check');
    btnCheck.title = 'Marcar lote como atualizado';
    btnCheck.onclick = () => marcarLoteAtualizado(id);

    infoVirada.appendChild(btnCheck);
    div.insertBefore(infoVirada, div.children[3]);

    const btnVirada = document.createElement('button');
    btnVirada.textContent = 'Virada de Lote';
    btnVirada.onclick = () => definirViradaLote(id);
    div.appendChild(btnVirada);

    const btnPDF = document.createElement('button');
    btnPDF.textContent = 'Baixar PDF';
    btnPDF.onclick = () => baixarPDF(id);
    div.appendChild(btnPDF);
  });
};
