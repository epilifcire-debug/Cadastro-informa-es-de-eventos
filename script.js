// ===== SISTEMA DE EVENTOS LOCAL =====
let eventos = JSON.parse(localStorage.getItem('eventos')) || [];

const formEvento = document.getElementById('formEvento');
const listaEventos = document.getElementById('listaEventos');

// === SALVAR NOVO EVENTO ===
formEvento.addEventListener('submit', (e) => {
  e.preventDefault();
  const evento = {
    id: Date.now(),
    nome: nomeEvento.value.trim(),
    data: dataEvento.value,
    classificacao: classificacao.value.trim(),
    local: localEvento.value.trim(),
    pagamento: formasPagamento.value.trim(),
    descricao: descricao.value.trim(),
    lotes: []
  };

  if (!evento.nome) return alert("Preencha o nome do evento!");

  eventos.push(evento);
  salvarLocal();
  formEvento.reset();
  renderEventos();
});

// === RENDERIZAR EVENTOS ===
function renderEventos() {
  listaEventos.innerHTML = '';

  if (eventos.length === 0) {
    listaEventos.innerHTML = '<p>Nenhum evento cadastrado.</p>';
    return;
  }

  eventos.forEach(ev => {
    const div = document.createElement('div');
    div.classList.add('evento-card');
    div.innerHTML = `
      <h3>${ev.nome}</h3>
      <p><b>Data:</b> ${ev.data}</p>
      <p><b>Local:</b> ${ev.local}</p>

      <button onclick="gerenciarLotes(${ev.id})">Gerenciar Setores e Lotes</button>
      <button onclick="visualizarLotes(${ev.id})">Visualizar Lotes</button>
      <button onclick="editarEvento(${ev.id})">Editar</button>
      <button onclick="excluirEvento(${ev.id})">Excluir</button>

      <div id="lotes-${ev.id}" class="lotes-container" style="display:none;"></div>
    `;
    listaEventos.appendChild(div);
  });
}

// === EXCLUIR EVENTO ===
function excluirEvento(id) {
  eventos = eventos.filter(e => e.id !== id);
  salvarLocal();
  renderEventos();
}

// === SALVAR LOCALMENTE ===
function salvarLocal() {
  localStorage.setItem('eventos', JSON.stringify(eventos));
}

// === GERENCIAMENTO DE LOTES ===
function gerenciarLotes(id) {
  const evento = eventos.find(e => e.id === id);
  if (!evento) return;

  const nomeLote = prompt('Digite o nome do lote:');
  if (!nomeLote) return;

  const dataVirada = prompt('Digite a data de virada do lote (AAAA-MM-DD):');
  if (!dataVirada) return alert('Data de virada é obrigatória!');

  const setores = prompt('Digite os setores (separados por vírgula):');
  if (!setores) return;

  const setoresArray = setores.split(',').map(s => s.trim());
  const lote = { nome: nomeLote, dataVirada, setores: [], checklist: false };

  setoresArray.forEach(setor => {
    const meia = prompt(`Valor MEIA do setor "${setor}"`);
    const solidario = prompt(`Valor SOLIDÁRIO do setor "${setor}"`);
    const inteira = prompt(`Valor INTEIRA do setor "${setor}"`);

    lote.setores.push({
      setor,
      valores: { meia, solidario, inteira }
    });
  });

  evento.lotes.push(lote);
  salvarLocal();
  alert('✅ Lote salvo com sucesso!');
}

// === VISUALIZAR LOTES ===
function visualizarLotes(id) {
  const evento = eventos.find(e => e.id === id);
  const container = document.getElementById(`lotes-${id}`);
  if (!evento || !container) return;

  const aberto = container.style.display === 'block';
  container.style.display = aberto ? 'none' : 'block';
  if (aberto) return;

  if (!evento.lotes.length) {
    container.innerHTML = '<p>Nenhum lote cadastrado.</p>';
    return;
  }

  container.innerHTML = '';
  evento.lotes.forEach((lote, index) => {
    const divLote = document.createElement('div');
    divLote.classList.add('lote-card');

    const dataAtual = new Date();
    const dataVirada = new Date(lote.dataVirada);
    const diasRestantes = Math.ceil((dataVirada - dataAtual) / (1000 * 60 * 60 * 24));
    let aviso = '';
    if (diasRestantes <= 0) {
      aviso = `<p class="aviso-vermelho">⚠️ Lote expirado em ${lote.dataVirada}</p>`;
    } else if (diasRestantes <= 3) {
      aviso = `<p class="aviso-vermelho piscando">⚠️ Virada de lote em ${lote.dataVirada}</p>`;
    } else {
      aviso = `<p class="aviso-vermelho">⚠️ Virada de lote em ${lote.dataVirada}</p>`;
    }

    let setoresHTML = '';
    lote.setores.forEach(s => {
      setoresHTML += `
        <div class="setor-item">
          <h4>${s.setor}</h4>
          <p><b>Meia:</b> R$ ${s.valores.meia || '-'}</p>
          <p><b>Solidário:</b> R$ ${s.valores.solidario || '-'}</p>
          <p><b>Inteira:</b> R$ ${s.valores.inteira || '-'}</p>
        </div>
      `;
    });

    const checkId = `check-${id}-${index}`;
    divLote.innerHTML = `
      <h3>${lote.nome || `Lote ${index + 1}`}</h3>
      ${aviso}
      ${setoresHTML}
      <div class="checklist">
        <label><input type="checkbox" id="${checkId}" ${lote.checklist ? 'checked' : ''}> Novo lote já cadastrado</label>
      </div>
      <div class="lote-buttons">
        <button onclick="editarNomeLote(${id}, ${index})">Editar Nome</button>
        <button onclick="editarQtdLotes(${id})">Editar Quantidade</button>
        <button onclick="imprimirUltimoLote(${id}, 'escuro')">🖤 Flyer Escuro</button>
        <button onclick="imprimirUltimoLote(${id}, 'claro')">🤍 Versão Clara</button>
      </div>
      <hr>
    `;
    container.appendChild(divLote);

    const checkbox = divLote.querySelector(`#${checkId}`);
    checkbox.addEventListener('change', () => {
      lote.checklist = checkbox.checked;
      salvarLocal();
    });
  });
}

// === EDITAR NOME DO LOTE ===
function editarNomeLote(eventoId, loteIndex) {
  const evento = eventos.find(e => e.id === eventoId);
  if (!evento) return;
  const novoNome = prompt('Digite o novo nome do lote:');
  if (!novoNome) return;
  evento.lotes[loteIndex].nome = novoNome;
  salvarLocal();
  renderEventos();
}

// === EDITAR QUANTIDADE DE LOTES ===
function editarQtdLotes(eventoId) {
  const evento = eventos.find(e => e.id === eventoId);
  if (!evento) return;
  const novaQtd = prompt('Digite a nova quantidade total de lotes:');
  if (!novaQtd || isNaN(novaQtd)) return alert('Digite um número válido.');
  evento.qtdLotes = Number(novaQtd);
  salvarLocal();
  alert('Quantidade de lotes atualizada!');
}

// === IMPRESSÃO (DOIS MODOS) ===
function imprimirUltimoLote(eventoId, modo = 'escuro') {
  const evento = eventos.find(e => e.id === eventoId);
  if (!evento || !evento.lotes.length) return alert('Nenhum lote encontrado.');
  const ultimoLote = evento.lotes[evento.lotes.length - 1];

  import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js').then(jsPDF => {
    const { jsPDF: JSPDF } = jsPDF;
    const doc = new JSPDF('p', 'mm', 'a4');

    if (modo === 'escuro') {
      // Fundo gradiente escuro
      const canvas = document.createElement('canvas');
      canvas.width = 595;
      canvas.height = 842;
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, 842);
      gradient.addColorStop(0, '#0A0F1A');
      gradient.addColorStop(1, '#1E293B');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 595, 842);
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 0, 0, 210, 297);

      // Moldura
      doc.setDrawColor(66, 165, 245);
      doc.setLineWidth(1.2);
      doc.rect(8, 8, 194, 281);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.setTextColor(66, 165, 245);
      doc.text(evento.nome, 105, 30, { align: 'center' });

      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text(`🎟️ ${ultimoLote.nome}`, 105, 45, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`Virada de lote: ${ultimoLote.dataVirada}`, 105, 55, { align: 'center' });

      doc.setDrawColor(66, 165, 245);
      doc.line(20, 60, 190, 60);

      let y = 75;
      ultimoLote.setores.forEach((s) => {
        doc.setFillColor(18, 24, 38);
        doc.roundedRect(20, y - 8, 170, 25, 3, 3, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(146, 197, 255);
        doc.setFontSize(14);
        doc.text(s.setor.toUpperCase(), 25, y + 2);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.text(`Meia: R$ ${s.valores.meia || '-'}`, 25, y + 10);
        doc.text(`Solidário: R$ ${s.valores.solidario || '-'}`, 90, y + 10);
        doc.text(`Inteira: R$ ${s.valores.inteira || '-'}`, 150, y + 10);
        y += 32;
      });

      doc.setTextColor(120, 150, 255);
      doc.setFontSize(10);
      doc.text('Gerado automaticamente pelo sistema de eventos', 105, 285, { align: 'center' });
    } 
    else {
      // Fundo branco - modo econômico
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 210, 297, 'F');
      doc.setDrawColor(66, 165, 245);
      doc.rect(8, 8, 194, 281);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(30, 45, 75);
      doc.text(evento.nome, 105, 30, { align: 'center' });

      doc.setFontSize(14);
      doc.text(`Lote: ${ultimoLote.nome}`, 105, 45, { align: 'center' });
      doc.setFontSize(11);
      doc.text(`Virada: ${ultimoLote.dataVirada}`, 105, 55, { align: 'center' });

      doc.line(20, 60, 190, 60);

      let y = 75;
      ultimoLote.setores.forEach((s) => {
        doc.setDrawColor(200, 200, 200);
        doc.roundedRect(20, y - 8, 170, 25, 3, 3);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(13);
        doc.text(s.setor.toUpperCase(), 25, y + 2);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.text(`Meia: R$ ${s.valores.meia || '-'}`, 25, y + 10);
        doc.text(`Solidário: R$ ${s.valores.solidario || '-'}`, 90, y + 10);
        doc.text(`Inteira: R$ ${s.valores.inteira || '-'}`, 150, y + 10);
        y += 32;
      });

      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('Gerado automaticamente pelo sistema de eventos', 105, 285, { align: 'center' });
    }

    // Salvar PDF
    const nomeArquivo = modo === 'escuro' ? 'Flyer_Escuro' : 'Flyer_Claro';
    doc.save(`${nomeArquivo}_${ultimoLote.nome.replace(/\s+/g, '_')}.pdf`);
  });
}

// === BACKUP / IMPORTAÇÃO / RESET ===
document.getElementById('btnExportar').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(eventos, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'backup-eventos.json';
  link.click();
});

document.getElementById('btnImportar').addEventListener('click', () => {
  const file = document.getElementById('importarBackup').files[0];
  if (!file) return alert('Selecione um arquivo JSON válido.');
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const dados = JSON.parse(e.target.result);
      if (!Array.isArray(dados)) throw new Error();
      eventos = dados;
      salvarLocal();
      renderEventos();
      alert('Backup importado com sucesso!');
    } catch {
      alert('Erro ao importar arquivo.');
    }
  };
  reader.readAsText(file);
});

document.getElementById('btnLimpar').addEventListener('click', () => {
  if (confirm('Tem certeza que deseja apagar todos os dados locais?')) {
    localStorage.removeItem('eventos');
    eventos = [];
    renderEventos();
  }
});

document.getElementById('btnResetar').addEventListener('click', () => {
  if (confirm('⚠️ Deseja realmente RESETAR TODO o sistema?')) {
    localStorage.clear();
    eventos = [];
    renderEventos();
    alert('✅ Sistema totalmente resetado!');
  }
});

// === EDIÇÃO DE EVENTO (MODAL) ===
const modal = document.getElementById('modalEditar');
const formEditar = document.getElementById('formEditar');
const cancelarEdicao = document.getElementById('cancelarEdicao');

function editarEvento(id) {
  const evento = eventos.find(e => e.id === id);
  if (!evento) return;

  document.getElementById('editId').value = evento.id;
  document.getElementById('editNome').value = evento.nome;
  document.getElementById('editData').value = evento.data;
  document.getElementById('editClassificacao').value = evento.classificacao;
  document.getElementById('editLocal').value = evento.local;
  document.getElementById('editPagamento').value = evento.pagamento;
  document.getElementById('editDescricao').value = evento.descricao;

  modal.style.display = 'flex';
}

cancelarEdicao.addEventListener('click', () => {
  modal.style.display = 'none';
});

formEditar.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = Number(document.getElementById('editId').value);
  const evento = eventos.find(e => e.id === id);
  if (!evento) return;

  evento.nome = document.getElementById('editNome').value.trim();
  evento.data = document.getElementById('editData').value.trim();
  evento.classificacao = document.getElementById('editClassificacao').value.trim();
  evento.local = document.getElementById('editLocal').value.trim();
  evento.pagamento = document.getElementById('editPagamento').value.trim();
  evento.descricao = document.getElementById('editDescricao').value.trim();

  salvarLocal();
  renderEventos();
  modal.style.display = 'none';
  alert('Evento atualizado com sucesso!');
});

window.addEventListener('click', (e) => {
  if (e.target === modal) modal.style.display = 'none';
});

// === INICIALIZA ===
renderEventos();
