# ⚽ Interclasse

Aplicação web para organizar partidas de um torneio interclasse. Ela permite cadastrar os dois times e seus jogadores, registrar os placares, acompanhar a tabela do mata-mata e criar um ranking de artilheiros.

## 📋 Funcionalidades

- Cadastro de dois times com cinco jogadores por equipe.
- Validação para evitar nomes de times iguais e jogadores repetidos.
- Registro de placares com confirmação da quantidade de gols.
- Seleção do vencedor nos pênaltis em caso de empate no mata-mata.
- Exibição dos jogos organizados por fase.
- Criação automática das fases seguintes.
- Identificação do campeão ao final do torneio.
- Ranking dos artilheiros com nome do jogador, time e total de gols.
- Salvamento automático das partidas no navegador com `localStorage`.

## 🧑‍🤝‍🧑 Como cadastrar uma partida

1. Digite o nome do **Time A** e o nome do **Time B**.
2. Informe os cinco jogadores de cada time.
3. Clique em **Marcar partida**.

O sistema verifica se os nomes dos times foram preenchidos, se estão diferentes e se não existe um mesmo jogador nas duas equipes.

Depois, a partida aparece na seção **Jogos do dia**.

## 📊 Como registrar o resultado

1. Abra **Jogos do dia**.
2. Informe o número de gols de cada time.
3. Clique em **Salvar resultado**.

Os placares devem ser números inteiros iguais a zero ou maiores.

Se houver empate em uma partida do mata-mata, o sistema mostra uma opção para selecionar qual time venceu nos pênaltis.

## 🥅 Artilheiros

Depois de salvar o placar, o sistema permite informar quais jogadores marcaram gols.

Para cada jogador:

1. Marque a caixa ao lado do nome.
2. Informe a quantidade de gols.
3. Clique em **Salvar gols**.

A soma dos gols registrados para os jogadores não pode ultrapassar o placar do time. Os dados são separados por nome e time e somados no ranking.

Ao clicar em **Artilheiros**, a aplicação mostra uma tabela em ordem decrescente de gols. Em caso de empate no número de gols, os jogadores são organizados pelo nome.

> Exemplo: um jogador pode ter marcado dois gols em uma partida e um gol em outra. No ranking, seu total será três gols.

## 🏆 Mata-mata

O mata-mata é montado automaticamente a partir das partidas cadastradas na primeira fase.

As partidas da primeira fase são consideradas pares conforme a ordem em que foram cadastradas:

- Primeira partida × segunda partida.
- Terceira partida × quarta partida.
- E assim por diante.

Quando os resultados das duas partidas anteriores são definidos, o vencedor de cada confronto avança para a próxima fase.

O nome da fase pode ser exibido como:

- Oitavas de final
- Quartas de final
- Semifinal
- Final

A quantidade inicial de jogos deve ser uma potência de dois, como 1, 2, 4, 8 ou 16. O confronto da fase final mostra automaticamente o vencedor como campeão.

## 💾 Onde os dados ficam guardados

Os dados são armazenados no navegador por meio da API `localStorage`, na chave `partidas`.

Isso permite que as partidas continuem disponíveis ao atualizar ou fechar a página, desde que o usuário utilize o mesmo navegador e não limpe os dados armazenados do site.

## 📁 Estrutura do projeto

```text
projeto-renner/
├── index.html
├── style.css
└── main.js
```

### `index.html`

Contém a estrutura visual da página:

- Título.
- Campos dos times.
- Campos dos cinco jogadores.
- Botões de cadastro e navegação.
- Área onde os resultados são exibidos.

### `style.css`

Responsável pela aparência da aplicação:

- Layout dos formulários.
- Estilo dos cartões.
- Tema claro e escuro.
- Responsividade.
- Estilo dos placares, tabelas e ranking.

### `main.js`

Contém toda a lógica da aplicação:

- Seleção dos elementos HTML.
- Validação dos dados.
- Cadastro e exclusão de partidas.
- Salvamento no `localStorage`.
- Registro dos placares.
- Seleção dos vencedores nos pênaltis.
- Geração das próximas fases.
- Cálculo do ranking de artilheiros.

## 🔧 Como funciona tecnicamente

Os dados das partidas são armazenados em uma lista de objetos JavaScript. Cada partida contém:

```javascript
{
  id: 1,
  fase: 0,
  pos: 0,
  timeA: {
    nome: "Time Azul",
    jogadores: ["Ana", "Bruno", "Carlos", "Davi", "Eduardo"]
  },
  timeB: {
    nome: "Time Verde",
    jogadores: ["Felipe", "Gabriel", "Heitor", "Isaac", "Lucas"]
  },
  placar: {
    a: 2,
    b: 1
  },
  penaltis: null,
  gols: [
    {
      nome: "Ana",
      time: "Time Azul",
      qtd: 2
    }
  ]
}
```

### Principais campos

- `fase`: indica a etapa do torneio. A fase inicial é `0`.
- `pos`: define a posição do confronto dentro da fase.
- `timeA` e `timeB`: guardam os nomes e jogadores dos times.
- `placar`: guarda os gols marcados por cada lado.
- `penaltis`: guarda o vencedor dos pênaltis.
- `gols`: guarda os gols atribuídos a cada jogador.

