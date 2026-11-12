const iptNomeTimeA = document.querySelector('#nomeTimeA')
const iptNomeTimeB = document.querySelector('#nomeTimeB')
const jogadoresA = document.querySelectorAll('[id^="jogador"][id$="A"]')
const jogadoresB = document.querySelectorAll('[id^="jogador"][id$="B"]')
const btnMarcPartida = document.querySelector('#marcPartida')
const btnVerJogos = document.querySelector('#verJogos')
const btnverTabela = document.querySelector('#verTabela')
const pResultado = document.querySelector('#resultado')

let partidas = carregar()

function carregar() {
  try { return JSON.parse(localStorage.getItem('partidas')) || [] }
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
  partidas.forEach(p => pResultado.append(criarJogo(p)))
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

  const jogadores = el('div', '', 'jogadores')
  for (const time of [p.timeA, p.timeB]) {
    const lista = el('ul')
    time.jogadores.forEach(nome => lista.append(el('li', nome)))
    const coluna = el('div')
    coluna.append(el('strong', time.nome), lista)
    jogadores.append(coluna)
  }


  for (const i of [golsA, golsB]) {
    i.addEventListener('input', () => status.textContent = 'Falta clicar em Salvar resultado')
  }

  const btnSalvar = el('button', 'Salvar resultado')
  btnSalvar.type = 'button'
  btnSalvar.addEventListener('click', () => {
    if (!golValido(golsA.value) || !golValido(golsB.value)) {
      status.textContent = 'Digite os gols dos dois times (número inteiro, 0 ou mais).'
      return
    }
    p.placar = { a: Number(golsA.value), b: Number(golsB.value) }
    salvar()
    status.textContent = '✓ Resultado salvo'
  })

  const btnExcluir = el('button', 'Excluir', 'perigo')
  btnExcluir.type = 'button'
  btnExcluir.addEventListener('click', () => {
    if (btnExcluir.textContent === 'Excluir') {
      btnExcluir.textContent = 'Clique de novo para excluir'
      setTimeout(() => btnExcluir.textContent = 'Excluir', 3000)
      return
    }
    partidas = partidas.filter(x => x.id !== p.id)
    salvar()
    listar()
  })

  const acoes = el('div', '', 'acoes')
  acoes.append(btnSalvar, btnExcluir, status)

  const card = el('div', '', 'card')
  card.append(placar, jogadores, acoes)
  return card
}

function pegarTime(times, nome) {
  const chave = nome.toLowerCase() 
  times[chave] ??= { nome, p: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0 }
  return times[chave]
}

function tabela() {
  const times = {}

  partidas.forEach(({ timeA, timeB, placar }) => {
    const A = pegarTime(times, timeA.nome)
    const B = pegarTime(times, timeB.nome)
    if (!placar) return // sem resultado

    A.j++; B.j++
    A.gp += placar.a; A.gc += placar.b
    B.gp += placar.b; B.gc += placar.a

    if (placar.a > placar.b) { A.p += 3; A.v++; B.d++ }
    else if (placar.b > placar.a) { B.p += 3; B.v++; A.d++ }
    else { A.p++; B.p++; A.e++; B.e++ }
  })

  const ranking = Object.values(times).sort((x, y) =>
    y.p - x.p || y.v - x.v || (y.gp - y.gc) - (x.gp - x.gc) || y.gp - x.gp || x.nome.localeCompare(y.nome))

  pResultado.innerHTML = ''
  pResultado.append(el('h2', 'Classificação'))

  if (!ranking.length) {
    pResultado.append(el('p', 'Nenhum time cadastrado ainda.'))
    return
  }

  const thead = el('thead')
  const cab = el('tr')
  for (const c of ['#', 'Time', 'P', 'J', 'V', 'E', 'D', 'GP', 'GC', 'SG']) cab.append(el('th', c))
  thead.append(cab)

  const tbody = el('tbody')
  ranking.forEach((t, i) => {
    const sg = t.gp - t.gc
    const tr = el('tr', '', i === 0 && t.j > 0 ? 'lider' : '')
    for (const valor of [i + 1, t.nome, t.p, t.j, t.v, t.e, t.d, t.gp, t.gc, sg > 0 ? `+${sg}` : sg]) {
      tr.append(el('td', valor))
    }
    tbody.append(tr)
  })

  const tab = el('table')
  tab.append(thead, tbody)
  const wrap = el('div', '', 'card tabela-wrap')
  wrap.append(tab)
  pResultado.append(wrap, el('p', 'P = pontos, J = jogos, V = vitórias, E = empates, D = derrotas, GP = gols pró, GC = gols contra, SG = saldo de gols.', 'legenda'))
}
btnMarcPartida.addEventListener('click', cadastrar)
btnVerJogos.addEventListener('click', listar)
btnverTabela.addEventListener('click', tabela)