const choices = {
  Quarto: ['Cama com altura personalizada, criado-mudo estável e iluminação ao alcance.', 'cama'],
  Sala: ['Poltrona firme com braços de apoio e espaço livre à frente.', 'poltrona'],
  Cozinha: ['Gavetas com abertura ampla e puxadores fáceis de segurar.', 'armario'],
  Banheiro: ['Armário de fácil alcance, com materiais especificados para o ambiente. Avalie com um profissional os apoios fixos e a área de circulação.', '']
};
const priorities = {
  'Facilitar movimentos': 'Observe os movimentos mais difíceis e a altura das superfícies usadas.',
  'Melhorar organização': 'Liste os itens mais usados e mantenha-os nas zonas de alcance confortável.',
  'Mais conforto': 'Experimente os pontos de apoio e verifique a iluminação nas tarefas frequentes.'
};
const mobility = {
  'Caminha sem auxílio': 'Registre as passagens que você usa com mais frequência.',
  'Utiliza bengala ou andador': 'Meça a passagem com o auxílio usado na rotina e observe o espaço para mudar de direção.',
  'Utiliza cadeira de rodas': 'Registre o espaço de aproximação e manobra com a cadeira usada no dia a dia.'
};
const productNames = { mesa:'Mesa com cantos suavizados', armario:'Armário com gavetas deslizantes', poltrona:'Poltrona com braços de apoio', cama:'Cama com altura personalizada' };

document.querySelector('[data-print]')?.addEventListener('click', () => window.print());

function prepareCopy(section, getText) {
  const status = section.querySelector('.status');
  section.querySelector('[data-copy]').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(getText());
      status.textContent = 'Pedido copiado.';
    } catch {
      status.textContent = 'A cópia automática está indisponível. Selecione o texto do pedido para copiá-lo.';
    }
  });
}

const diagnostic = document.querySelector('#diagnostico');
if (diagnostic) {
  const result = document.querySelector('#resultado');
  const suggestion = document.querySelector('#sugestao');
  const next = document.querySelector('#proximo');
  let brief = '';
  prepareCopy(result, () => brief);
  diagnostic.addEventListener('submit', (event) => {
    event.preventDefault();
    const { ambiente, prioridade, mobilidade } = Object.fromEntries(new FormData(diagnostic));
    const [solution, product] = choices[ambiente];
    suggestion.textContent = [solution, priorities[prioridade], mobility[mobilidade]].join(' ');
    brief = ['Pedido de projeto Plenus Espaços', 'Ambiente: ' + ambiente, 'Prioridade: ' + prioridade, 'Mobilidade: ' + mobilidade, suggestion.textContent].join('\n');
    try { sessionStorage.setItem('plenus-diagnostico', JSON.stringify({ ambiente, brief })); } catch {}
    const parameters = new URLSearchParams({ origem: 'diagnostico', ambiente });
    if (product) parameters.set('produto', product);
    next.href = 'projeto.html?' + parameters;
    result.querySelector('.status').textContent = '';
    result.hidden = false;
    result.scrollIntoView({ block: 'nearest' });
  });
}
const project = document.querySelector('#projeto');
if (project) {
  const parameters = new URLSearchParams(location.search);
  const product = parameters.get('produto');
  const room = parameters.get('ambiente');
  const field = project.elements;
  const result = document.querySelector('#pedido');
  const summary = document.querySelector('#resumo');
  const download = document.querySelector('#baixar');
  let downloadUrl;
  if (Object.hasOwn(productNames, product)) field.espaco.value = productNames[product];
  else if (Object.hasOwn(choices, room)) field.espaco.value = room;
  if (parameters.get('origem') === 'diagnostico') {
    try {
      const saved = JSON.parse(sessionStorage.getItem('plenus-diagnostico'));
      if (saved?.ambiente === room) field.objetivo.value = saved.brief.split('\n').slice(2).join('\n');
    } catch {}
  }
  prepareCopy(result, () => summary.value);
  project.addEventListener('submit', (event) => {
    event.preventDefault();
    const { espaco, objetivo, medidas } = Object.fromEntries(new FormData(project));
    summary.value = ['Pedido de projeto Plenus Espaços', '', 'Ambiente ou móvel: ' + espaco.trim(), 'Objetivo: ' + objetivo.trim(), 'Medidas: ' + (medidas.trim() || 'A confirmar')].join('\n');
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    downloadUrl = URL.createObjectURL(new Blob([summary.value], { type: 'text/plain;charset=utf-8' }));
    download.href = downloadUrl;
    result.querySelector('.status').textContent = '';
    result.hidden = false;
    summary.focus();
  });
}
