// Posts de exemplo para desenvolvimento. O seed só cria os que ainda não
// existem (pelo slug), então editar ou apagar pelo admin não é desfeito.

type Exemplo = {
  titulo: string;
  slug: string;
  resumo?: string;
  tags: string[];
  diasAtras: number;
  conteudo: string;
};

export const exemplos: Exemplo[] = [
  {
    titulo: "Máquina de estados para inimigos na Godot 4",
    slug: "maquina-de-estados-inimigos-godot-4",
    resumo: "Como sair do if/else infinito no _process e organizar o comportamento de um inimigo em estados.",
    tags: ["Godot", "GDScript", "Game dev"],
    diasAtras: 2,
    conteudo: `Todo inimigo começa simples: anda até o jogador e ataca. Duas semanas depois, o \`_process\` tem
quarenta linhas de \`if\` e ninguém sabe por que o goblin às vezes trava na parede.

## O problema

O comportamento depende de **em que situação** o inimigo está: patrulhando, perseguindo, atacando ou
fugindo. Misturar tudo num só lugar faz cada regra nova quebrar uma antiga.

## A solução: um estado por vez

Cada estado vira um nó com três métodos: entrar, atualizar e sair.

\`\`\`gdscript
class_name Estado
extends Node

signal trocar(proximo: StringName)

func entrar() -> void:
	pass

func atualizar(_delta: float) -> void:
	pass

func sair() -> void:
	pass
\`\`\`

E a máquina só delega para o estado atual:

\`\`\`gdscript
extends Node

@export var inicial: Estado
var atual: Estado

func _ready() -> void:
	for filho in get_children():
		filho.trocar.connect(_trocar)
	atual = inicial
	atual.entrar()

func _physics_process(delta: float) -> void:
	atual.atualizar(delta)

func _trocar(proximo: StringName) -> void:
	atual.sair()
	atual = get_node(NodePath(proximo))
	atual.entrar()
\`\`\`

> Regra prática: se você está escrevendo \`if estado == ...\` fora da máquina, o código está no lugar errado.

## Resultado

- Cada estado cabe na tela.
- Dá para testar um estado isolado.
- Comportamento novo é um nó novo, não um \`elif\` a mais.
`,
  },
  {
    titulo: "Memórias de Adriano: um imperador escreve para o futuro",
    slug: "memorias-de-adriano",
    tags: ["Literatura", "Resenha", "Roma"],
    diasAtras: 9,
    conteudo: `Marguerite Yourcenar levou quase trinta anos para terminar *Memórias de Adriano*. O livro é uma
longa carta do imperador, já doente, ao jovem Marco Aurélio, e é difícil pensar em um ponto de partida
melhor para entender Roma por dentro.

## Por que ler

Não é um romance histórico de batalhas. É um homem tentando dar sentido à própria vida enquanto ela
acaba: o governo, as viagens, a perda de Antínoo, a paz que ele preferiu às conquistas.

## O que fica

1. A prosa é lenta de propósito. Leia em doses pequenas.
2. As notas da autora no fim valem tanto quanto o livro.
3. Você vai terminar querendo visitar a Villa Adriana em Tivoli.

---

**Nota:** 5/5. Um dos livros que deram nome a este site.
`,
  },
  {
    titulo: "Gladiador, vinte e cinco anos depois",
    slug: "gladiador-vinte-e-cinco-anos-depois",
    resumo: "Revendo o filme de Ridley Scott: o que envelheceu bem, o que não envelheceu e por que a trilha ainda arrepia.",
    tags: ["Filmes", "Resenha", "Roma"],
    diasAtras: 20,
    conteudo: `Revi *Gladiador* sem expectativa e saí lembrando por que ele virou referência.

## Envelheceu bem

- A trilha de Hans Zimmer e Lisa Gerrard.
- Joaquin Phoenix como Cômodo: mimado, inseguro e perigoso.
- A fotografia dessaturada da Germânia contra o dourado de Roma.

## Envelheceu mal

- Alguns efeitos digitais do Coliseu.
- A liberdade com a história. O Cômodo real reinou por doze anos e não morreu na arena.

| Aspecto | Nota |
|---|---|
| Roteiro | 4/5 |
| Atuações | 5/5 |
| Fidelidade histórica | 2/5 |

O que fazemos em vida ecoa na eternidade, e este filme ecoou.
`,
  },
];
