const iptNomeTimeA = document.querySelector('#nomeTimeA')
const iptNomeTimeB = document.querySelector('#nomeTimeB')
const jogadoresA = document.querySelectorAll('[id^="jogador"][id$="A"]')
const jogadoresB = document.querySelectorAll('[id^="jogador"][id$="B"]')
const btnMarcPartida = document.querySelector('#marcPartida')
const btnVerJogos = document.querySelector('#verJogos')
const btnMataMata = document.querySelector('#verMataMata') 
const btnArtilheiros = document.querySelector('#verArtilheiros') 
const pResultado = document.querySelector('#resultado')

let partidas = carregar()

function carregar() {
  try {
    const lista = JSON.parse(localStorage.getItem('partidas')) || []
    lista.forEach(p => p.fase ??= 0) 
    return lista
  }
  catch { return [] }
}

function salvar() {
  try { localStorage.setItem('partidas', JSON.stringify(partidas)) }
  catch {}
}
function el(tag, texto = '', classe = '') {
  const e = document.createElement(tag)
  e.textContent = texto
  e.className = classe
  return e
}

function mensagem(texto, classe = '') {
  pResultado.innerHTML = ''
  pResultado.append(el('p', texto, classe))
}

function golValido(v) {
  return v !== '' && Number.isInteger(Number(v)) && Number(v) >= 0
}

function vencedor(p) {
  if (!p.placar) return null
  if (p.placar.a > p.placar.b) return p.timeA
  if (p.placar.b > p.placar.a) return p.timeB
  return p.penaltis === 'a' ? p.timeA : p.penaltis === 'b' ? p.timeB : null
}


function posicao(p) {
  return p.fase === 0 ? partidas.filter(x => x.fase === 0).indexOf(p) : p.pos
}

function jogo(fase, pos) {
  return partidas.find(p => p.fase === fase && posicao(p) === pos)
}

function nomeFase(f) {
  const total = partidas.filter(p => p.fase === 0).length
  const nomes = { 1: 'Final', 2: 'Semifinal', 4: 'Quartas de final', 8: 'Oitavas de final', 16: '16-avos de final' }
  return nomes[total / 2 ** f] ?? `Fase ${f + 1}`
}


function gerarProximas() {
  for (let f = 0; partidas.some(p => p.fase === f); f++) {
    const ultima = Math.max(...partidas.filter(p => p.fase === f).map(p => posicao(p)))
    for (let k = 0; k <= ultima; k += 2) {
      const m1 = jogo(f, k)
      const m2 = jogo(f, k + 1)
      const v1 = m1 && vencedor(m1)
      const v2 = m2 && vencedor(m2)
      if (v1 && v2 && !jogo(f + 1, k / 2)) {
        partidas.push({
          id: Date.now() + partidas.length,
          fase: f + 1,
          pos: k / 2,
          timeA: { ...v1 },
          timeB: { ...v2 },
          placar: null
        })
      }
    }
  }
}


function removerAdiante(p) {
  const prox = jogo(p.fase + 1, Math.floor(posicao(p) / 2))
  if (!prox) return
  removerAdiante(prox)
  partidas = partidas.filter(x => x !== prox)
}



function cadastrar() {
  const nomeA = iptNomeTimeA.value.trim()
  const nomeB = iptNomeTimeB.value.trim()
  const listaA = [...jogadoresA].map(i => i.value.trim())
  const listaB = [...jogadoresB].map(i => i.value.trim())

  if (!nomeA || !nomeB || listaA.includes('') || listaB.includes('')) {
    return mensagem('Preencha o nome dos dois times e os 5 jogadores de cada um.', 'erro')
  }
  if (nomeA.toLowerCase() === nomeB.toLowerCase()) {
    return mensagem('Os times precisam ter nomes diferentes.', 'erro')
  }
  const todos = [...listaA, ...listaB].map(n => n.toLowerCase())
  if (new Set(todos).size !== todos.length) {
    return mensagem('Tem jogador repetido na partida.', 'erro')
  }

  partidas.push({
    id: Date.now(),
    fase: 0, 
    timeA: { nome: nomeA, jogadores: listaA },
    timeB: { nome: nomeB, jogadores: listaB },
    placar: null
  })
  salvar()

  const campos = [iptNomeTimeA, iptNomeTimeB, ...jogadoresA, ...jogadoresB]
  campos.forEach(i => i.value = '')
  mensagem('Jogo marcado com sucesso!', 'ok')
}



function listar() {
  pResultado.innerHTML = ''
  pResultado.append(el('h2', 'Jogos do dia'))

  if (!partidas.length) {
    pResultado.append(el('p', 'Nenhum jogo marcado ainda. Marque uma partida acima.'))
    return
  }
 
  partidas.slice().sort((a, b) => a.fase - b.fase).forEach(p => pResultado.append(criarJogo(p)))
}


function atualizarLista() {
  pResultado.querySelectorAll('[data-id]').forEach(c => {
    if (!partidas.some(p => String(p.id) === c.dataset.id)) c.remove()
  })
  partidas.forEach(p => {
    if (!pResultado.querySelector(`[data-id="${p.id}"]`)) pResultado.append(criarJogo(p))
  })
}

function criarInputGol(valor, nomeTime) {
  const i = el('input')
  i.type = 'number'
  i.min = 0
  i.inputMode = 'numeric'
  i.value = valor ?? ''
  i.setAttribute('aria-label', `Gols de ${nomeTime}`)
  return i
}

function criarJogo(p) {
  const golsA = criarInputGol(p.placar?.a, p.timeA.nome)
  const golsB = criarInputGol(p.placar?.b, p.timeB.nome)
  const status = el('span', p.placar ? '✓ Resultado salvo' : 'Sem resultado ainda', 'status')

  const placar = el('div', '', 'placar')
  placar.append(el('span', p.timeA.nome, 'nome'), golsA, el('span', 'x'), golsB, el('span', p.timeB.nome, 'nome'))

  const penaltis = el('select')
  penaltis.append(new Option('Empate: quem ganhou nos pênaltis?', ''), new Option(p.timeA.nome, 'a'), new Option(p.timeB.nome, 'b'))
  penaltis.value = p.penaltis ?? ''
  const mostrarPenaltis = () => {
    penaltis.hidden = !(golValido(golsA.value) && golValido(golsB.value) && Number(golsA.value) === Number(golsB.value))
  }
  mostrarPenaltis()

  const jogadores = el('div', '', 'jogadores')
  for (const time of [p.timeA, p.timeB]) {
    const lista = el('ul')
    time.jogadores.forEach(nome => lista.append(el('li', nome)))
    const coluna = el('div')
    coluna.append(el('strong', time.nome), lista)
    jogadores.append(coluna)
  }


  for (const i of [golsA, golsB]) {
    i.addEventListener('input', () => {
      status.textContent = 'Falta clicar em Salvar resultado'
      mostrarPenaltis() 
    })
  }

  const btnSalvar = el('button', 'Salvar resultado')
  btnSalvar.type = 'button'
  btnSalvar.addEventListener('click', () => {
    if (!golValido(golsA.value) || !golValido(golsB.value)) {
      status.textContent = 'Digite os gols dos dois times (número inteiro, 0 ou mais).'
      return
    }
    const a = Number(golsA.value)
    const b = Number(golsB.value)
    if (a === b && !penaltis.value) {
      status.textContent = 'Empate no mata-mata: escolha quem ganhou nos pênaltis.'
      return
    }

    const antes = vencedor(p)?.nome
    if (!p.placar || p.placar.a !== a || p.placar.b !== b) p.gols = [] 
    p.placar = { a, b }
    p.penaltis = a === b ? penaltis.value : null
    if (vencedor(p)?.nome !== antes) removerAdiante(p)
    gerarProximas()
    salvar()
    atualizarLista()
    status.textContent = '✓ Resultado salvo'
    mostrarPainel()
  })

  const btnExcluir = el('button', 'Excluir', 'perigo')
  btnExcluir.type = 'button'
  btnExcluir.addEventListener('click', () => {
    if (btnExcluir.textContent === 'Excluir') {
      btnExcluir.textContent = 'Clique de novo para excluir'
      setTimeout(() => btnExcluir.textContent = 'Excluir', 3000)
      return
    }
    partidas = partidas.filter(x => x.id !== p.id && x.fase === 0) 
    gerarProximas() 
    salvar()
    listar()
  })

  const acoes = el('div', '', 'acoes')
  acoes.append(btnSalvar)
  if (p.fase === 0) acoes.append(btnExcluir)
  acoes.append(status)

  const card = el('div', '', 'card')
  card.dataset.id = p.id 
  card.append(el('div', nomeFase(p.fase), 'status'), placar, penaltis, jogadores, acoes) 


  let painel = null
  const mostrarPainel = () => {
    painel?.remove()
    painel = null
    if (p.placar && p.placar.a + p.placar.b > 0) {
      painel = criarPainelGols(p)
      card.append(painel)
    }
  }
  mostrarPainel()

  return card
}



function criarPainelGols(p) {
  const painel = el('div', '', 'gols')
  painel.append(el('h3', 'De quem foram marcados os gols da partida?'))

  const colunas = el('div', '', 'jogadores')
  const escolhas = []

  for (const [time, golsDoTime] of [[p.timeA, p.placar.a], [p.timeB, p.placar.b]]) {
    const coluna = el('div')
    coluna.append(el('strong', `${time.nome} (${golsDoTime})`))

    if (golsDoTime === 0) {
      coluna.append(el('p', 'Não marcou gols.', 'status'))
    } else {
      const lista = el('ul')
      time.jogadores.forEach(nome => {
        const salvo = (p.gols ?? []).find(g => g.nome === nome && g.time === time.nome)

        const caixa = el('input')
        caixa.type = 'checkbox'
        caixa.checked = Boolean(salvo)

        const qtd = el('input')
        qtd.type = 'number'
        qtd.min = 1
        qtd.value = salvo?.qtd ?? 1

       
        const pergunta = el('span', 'Quantos gols? ', 'status')
        pergunta.append(qtd)
        pergunta.hidden = !caixa.checked
        caixa.addEventListener('change', () => pergunta.hidden = !caixa.checked)

        const rotulo = el('label')
        rotulo.append(caixa, nome)
        const li = el('li')
        li.append(rotulo, pergunta)
        lista.append(li)

        escolhas.push({ nome, time: time.nome, caixa, qtd })
      })
      coluna.append(lista)
    }
    colunas.append(coluna)
  }

  const status = el('span', '', 'status')
  const btn = el('button', 'Salvar gols')
  btn.type = 'button'
  btn.addEventListener('click', () => {
    const marcados = escolhas.filter(e => e.caixa.checked)
    if (marcados.some(e => !golValido(e.qtd.value) || Number(e.qtd.value) < 1)) {
      status.textContent = 'Digite quantos gols cada jogador marcou (1 ou mais).'
      return
    }
    const soma = time => marcados.filter(e => e.time === time).reduce((total, e) => total + Number(e.qtd.value), 0)
    if (soma(p.timeA.nome) > p.placar.a || soma(p.timeB.nome) > p.placar.b) {
      status.textContent = 'Os gols dos jogadores passam do placar do time.'
      return
    }
    p.gols = marcados.map(e => ({ nome: e.nome, time: e.time, qtd: Number(e.qtd.value) }))
    salvar()
    status.textContent = '✓ Gols salvos'
  })

  const acoes = el('div', '', 'acoes')
  acoes.append(btn, status)
  painel.append(colunas, acoes)
  return painel
}



function criarConfronto(p) {
  const v = p && vencedor(p)
  const nome = time => el('span', time?.nome ?? 'A definir', v && v.nome === time?.nome ? 'nome vencedor' : 'nome')

  const placar = el('div', '', 'placar')
  placar.append(nome(p?.timeA), el('span', p?.placar?.a ?? '-', 'gol'), el('span', 'x'), el('span', p?.placar?.b ?? '-', 'gol'), nome(p?.timeB))

  const card = el('div', '', 'card')
  card.append(placar)
  if (p?.penaltis) card.append(el('div', `Pênaltis: ${v.nome}`, 'status'))
  return card
}

function mataMata() {
  pResultado.innerHTML = ''
  pResultado.append(el('h2', 'Mata-mata'))

  const total = partidas.filter(p => p.fase === 0).length
  if (!total) {
    pResultado.append(el('p', 'Marque os jogos da 1ª fase para montar o mata-mata.'))
    return
  }
  if (!Number.isInteger(Math.log2(total))) {
    pResultado.append(el('p', `O mata-mata precisa de 1, 2, 4, 8 ou 16 jogos na 1ª fase. Hoje você tem ${total}.`, 'erro'))
  }

  const final = jogo(Math.log2(total), 0)
  if (final && vencedor(final)) {
    pResultado.append(el('p', `🏆 Campeão: ${vencedor(final).nome}`, 'campeao'))
  }

  let f = 0
  let esperados = total
  while (esperados >= 1) {
    pResultado.append(el('h3', nomeFase(f), 'fase'))
    for (let k = 0; k < esperados; k++) pResultado.append(criarConfronto(jogo(f, k)))
    f++
    esperados = Math.floor(esperados / 2)
  }
}


function artilheiros() {
  const jogadores = {}
  partidas.forEach(p => (p.gols ?? []).forEach(g => {
    const chave = `${g.nome.toLowerCase()}|${g.time.toLowerCase()}`
    jogadores[chave] ??= { nome: g.nome, time: g.time, gols: 0 }
    jogadores[chave].gols += g.qtd
  }))

  const ranking = Object.values(jogadores).sort((x, y) => y.gols - x.gols || x.nome.localeCompare(y.nome))

  pResultado.innerHTML = ''
  pResultado.append(el('h2', 'Artilheiros'))

  if (!ranking.length) {
    pResultado.append(el('p', 'Nenhum gol de jogador registrado ainda.'))
    return
  }

  const thead = el('thead')
  const cab = el('tr')
  for (const c of ['#', 'Jogador', 'Time', 'Gols']) cab.append(el('th', c))
  thead.append(cab)

  const tbody = el('tbody')
  ranking.forEach((j, i) => {
    const tr = el('tr', '', i === 0 ? 'lider' : '')
    for (const valor of [i + 1, j.nome, j.time, j.gols]) tr.append(el('td', valor))
    tbody.append(tr)
  })

  const tab = el('table')
  tab.append(thead, tbody)
  const wrap = el('div', '', 'card tabela-wrap artilheiros')
  wrap.append(tab)
  pResultado.append(wrap)
}

btnMarcPartida.addEventListener('click', cadastrar)
btnVerJogos.addEventListener('click', listar)
btnMataMata.addEventListener('click', mataMata) 
btnArtilheiros.addEventListener('click', artilheiros)
