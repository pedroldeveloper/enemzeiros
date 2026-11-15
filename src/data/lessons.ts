import type { LessonContent } from '../types/curriculum';

const inepWriting = {
  label: 'A Redação do Enem 2026 — Cartilha do(a) Participante (INEP)',
  url: 'https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/a-redacao-do-enem-2026-cartilha-do-a-participante',
};
const matrix = {
  label: 'Matriz de Referência do Enem (INEP, 2026)',
  url: 'https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/matrizes-de-referencia-enem/',
};

export const lessons: Record<string, LessonContent> = {
  'redacao-estrutura-completa-da-redacao-dissertativo-argumentativa-do-enem': {
    topicId: 'redacao-estrutura-completa-da-redacao-dissertativo-argumentativa-do-enem',
    title: 'Estrutura da redação dissertativo-argumentativa',
    objective: [
      'Reconhecer a tarefa central da redação do Enem.',
      'Planejar introdução, desenvolvimento e conclusão em uma unidade argumentativa.',
      'Relacionar cada parágrafo a um propósito sem tratar um único molde como regra obrigatória.',
    ],
    concepts: ['Tema e recorte', 'Tese', 'Projeto de texto', 'Argumentação', 'Proposta de intervenção', 'Coesão'],
    explanation: [
      { heading: 'O que o exame pede', paragraphs: [
        'A redação solicita um texto dissertativo-argumentativo em modalidade escrita formal, sobre um tema social, científico, cultural ou político. O estudante apresenta um ponto de vista e o sustenta com argumentos organizados; ao final, propõe uma intervenção relacionada ao problema e respeitosa aos direitos humanos.',
        'O texto precisa responder ao recorte temático completo. Antes de escrever, destaque o assunto, o problema delimitado e o que a proposta solicita. Evite transformar o tema em uma discussão mais ampla que deixe de lado a tarefa concreta.',
      ] },
      { heading: 'Um roteiro possível', paragraphs: [
        'Um planejamento frequente usa quatro parágrafos: introdução com contextualização e tese; dois parágrafos de desenvolvimento com argumentos distintos; e conclusão com proposta de intervenção. Essa é uma estratégia de organização, não uma exigência de quantidade fixa de parágrafos.',
        'Na introdução, a tese deve responder ao tema e anunciar as ideias que serão desenvolvidas. Cada parágrafo argumentativo pode apresentar uma ideia central, explicar seu funcionamento e relacioná-la ao recorte. A conclusão retoma o problema e propõe uma ação viável, com elementos suficientemente definidos.',
      ] },
      { heading: 'Planejamento antes da escrita', paragraphs: [
        'Em poucas linhas, anote: (1) qual problema será discutido; (2) qual posição você defenderá; (3) quais dois argumentos sustentam essa posição; e (4) que intervenção responde ao problema. O plano ajuda a evitar contradições e repetição entre os parágrafos.',
        'A estrutura só funciona quando as partes conversam entre si. Repertório, conectivos e proposta não substituem uma linha de raciocínio clara: cada elemento precisa ter função no argumento.',
      ] },
    ],
    workedExample: {
      context: 'Tema de treino criado para esta aula: desafios para ampliar a leitura literária entre jovens.',
      steps: [
        'Recorte: acesso e formação de leitores jovens, sem reduzir o tema a “tecnologia”.',
        'Tese de trabalho: a desigualdade de acesso a acervos e a pouca mediação de leitura dificultam a formação de leitores.',
        'Projeto: primeiro discutir acesso; depois, mediação. A conclusão pode propor ações de biblioteca e mediação escolar articuladas.',
      ],
      conclusion: 'O exemplo mostra como uma tese antecipa a progressão. Ele é apenas um esquema de planejamento, não uma redação pronta nem um repertório factual.',
    },
    enemApplication: 'Em um tema contextualizado, identifique o problema delimitado e use cada parágrafo para avançar a defesa de uma mesma tese. A Matriz do INEP articula compreensão da proposta, argumentação, coesão e intervenção.',
    commonErrors: [
      { error: 'Memorizar um modelo e encaixá-lo em qualquer tema.', correction: 'Planeje a tese e os argumentos a partir do recorte específico de cada proposta.' },
      { error: 'Apresentar duas causas na tese e discutir apenas uma.', correction: 'Confira se cada ideia anunciada recebeu desenvolvimento suficiente.' },
      { error: 'Deixar a proposta de intervenção desconectada da discussão.', correction: 'Retome o problema efetivamente desenvolvido e explique como a ação responde a ele.' },
    ],
    summary: ['Leia o tema e delimite o recorte.', 'Formule uma tese defensável.', 'Distribua argumentos em uma progressão.', 'Conclua com uma intervenção coerente e respeitosa aos direitos humanos.', 'Revise se todas as partes tratam do mesmo problema.'],
    quiz: [{
      prompt: 'Qual é a função principal do planejamento da redação?',
      options: ['Garantir que toda redação tenha exatamente quatro parágrafos.', 'Organizar tese, argumentos e intervenção para responder ao mesmo recorte temático.', 'Substituir a revisão gramatical.', 'Reservar um parágrafo para cada repertório citado.'],
      answerIndex: 1,
      explanation: 'O planejamento organiza a linha de raciocínio e a relação entre as partes. A quantidade de parágrafos pode variar; o importante é cumprir a tarefa com coerência.',
    }],
    references: [inepWriting, matrix],
  },
  'matematica-porcentagem': {
    topicId: 'matematica-porcentagem',
    title: 'Porcentagem: parte, total e variação',
    objective: ['Converter uma taxa percentual em fração ou decimal.', 'Calcular uma parte percentual de uma quantidade.', 'Distinguir valor do desconto e preço final.'],
    concepts: ['Por cento significa “a cada cem”.', 'Taxa percentual', 'Parte e total', 'Aumento e desconto'],
    explanation: [
      { heading: 'Transforme a taxa', paragraphs: ['Uma porcentagem representa uma razão de denominador 100. Assim, 12% = 12/100 = 0,12. Para calcular uma porcentagem de um valor, multiplique o total pela taxa em forma decimal ou pela fração equivalente.', 'Por exemplo, 12% de 500 é 0,12 × 500 = 60. O resultado 60 é a parte correspondente à taxa; ainda não é o total após desconto ou aumento.'] },
      { heading: 'Calcule a variação separadamente', paragraphs: ['Com desconto, subtraia a parte calculada do preço inicial. Com aumento, some a parte ao valor inicial. Outra forma é multiplicar diretamente por 1 − taxa ou 1 + taxa, respectivamente.', 'Em variações sucessivas, calcule uma taxa sobre o valor já atualizado. Não some automaticamente as taxas, porque a segunda incide sobre outra base.'] },
    ],
    workedExample: { context: 'Uma mochila custa R$ 500 e recebe desconto de 12%.', steps: ['Converta 12% em decimal: 0,12.', 'Calcule o desconto: 500 × 0,12 = 60.', 'Subtraia do preço inicial: 500 − 60 = 440.'], conclusion: 'O desconto é R$ 60 e o preço final é R$ 440.' },
    enemApplication: 'Questões contextualizadas podem pedir leitura de tabelas, comparação de preços ou interpretação de variação. Identifique sempre qual é o total que serve de base para a taxa.',
    commonErrors: [
      { error: 'Responder com o desconto quando a pergunta pede o preço final.', correction: 'Escreva separadamente “desconto = ...” e “preço final = ...”.' },
      { error: 'Aplicar a porcentagem ao valor errado em uma segunda variação.', correction: 'Atualize a base após cada etapa e só então calcule a taxa seguinte.' },
    ],
    summary: ['p% = p/100.', 'Parte percentual = total × taxa decimal.', 'Desconto: total − parte; aumento: total + parte.', 'Em taxas sucessivas, a base pode mudar.'],
    quiz: [{ prompt: 'Um item de R$ 200 tem desconto de 15%. Qual é o preço final?', options: ['R$ 15', 'R$ 30', 'R$ 170', 'R$ 185'], answerIndex: 2, explanation: '15% de 200 é 0,15 × 200 = 30. O preço final é 200 − 30 = 170 reais.' }],
    references: [matrix],
  },
  'biologia-ecologia': {
    topicId: 'biologia-ecologia',
    title: 'Ecologia: relações entre organismos e ambiente',
    objective: ['Diferenciar organismo, população, comunidade e ecossistema.', 'Descrever o fluxo de energia em uma cadeia alimentar.', 'Interpretar relações entre condições ambientais e seres vivos.'],
    concepts: ['Organismo', 'População', 'Comunidade', 'Ecossistema', 'Fatores bióticos e abióticos', 'Fluxo de energia'],
    explanation: [
      { heading: 'Níveis de organização', paragraphs: ['Um organismo é um indivíduo. População é um conjunto de indivíduos da mesma espécie que vivem em uma região; comunidade reúne populações de espécies diferentes. Ecossistema inclui a comunidade e os fatores físicos com os quais ela interage, como água, luz e solo.', 'Esses níveis ajudam a definir a escala de uma pergunta. Uma mudança na abundância de uma espécie descreve uma população; uma relação entre espécies envolve a comunidade; uma alteração de temperatura, água e organismos pode afetar o ecossistema.'] },
      { heading: 'Energia e alimentação', paragraphs: ['Em uma cadeia alimentar, produtores incorporam energia (em geral, pela fotossíntese) e consumidores obtêm matéria e energia ao se alimentar. Decompositores atuam sobre restos e organismos mortos, devolvendo nutrientes ao ambiente.', 'A energia disponível diminui ao longo das transferências entre níveis tróficos; a matéria, por sua vez, circula em ciclos. Essa distinção ajuda a evitar tratar energia e nutrientes como se tivessem o mesmo percurso.'] },
    ],
    workedExample: { context: 'Em um ambiente, capim é consumido por gafanhotos; gafanhotos, por sapos; e sapos, por serpentes.', steps: ['Capim ocupa o nível de produtor.', 'Gafanhoto é consumidor primário; sapo, secundário; serpente, terciário.', 'Uma redução do capim pode repercutir nos níveis seguintes, embora a intensidade dependa também de outras fontes de alimento e das condições do ambiente.'], conclusion: 'A cadeia representa uma via possível de transferência de matéria e energia; uma teia alimentar pode ter várias vias conectadas.' },
    enemApplication: 'Leia esquemas e gráficos procurando identificar o nível de organização, a direção das relações e quais variáveis foram medidas. Não conclua causalidade apenas porque duas quantidades variaram juntas.',
    commonErrors: [
      { error: 'Dizer que a energia se recicla como a matéria.', correction: 'Energia flui e parte se dissipa como calor; nutrientes circulam em ciclos.' },
      { error: 'Tratar uma cadeia alimentar como representação completa do ecossistema.', correction: 'A cadeia mostra uma relação simplificada; várias cadeias podem formar uma teia.' },
    ],
    summary: ['Organismo < população < comunidade + ambiente físico = ecossistema.', 'Produtores formam a base de muitas cadeias.', 'Energia flui entre níveis tróficos; nutrientes circulam.', 'Modelos são simplificações e devem ser lidos conforme a pergunta.'],
    quiz: [{ prompt: 'Qual afirmação distingue corretamente energia e matéria em uma cadeia alimentar?', options: ['Ambas se reciclam integralmente entre os níveis.', 'A matéria flui em linha única e a energia forma ciclos.', 'A energia flui e parte se dissipa; nutrientes podem circular em ciclos.', 'A energia só existe nos produtores.'], answerIndex: 2, explanation: 'Parte da energia é dissipada como calor em cada transferência, enquanto nutrientes podem retornar ao ambiente e ser reutilizados.' }],
    references: [matrix],
  },
  'linguagens-interpretacao-de-textos': {
    topicId: 'linguagens-interpretacao-de-textos',
    title: 'Interpretação de textos: evidência, contexto e inferência',
    objective: ['Localizar a ideia central e o propósito de um texto.', 'Distinguir informação explícita de inferência sustentada.', 'Usar detalhes do texto para eliminar alternativas incompatíveis.'],
    concepts: ['Tema', 'Propósito comunicativo', 'Informação explícita', 'Inferência', 'Evidência textual', 'Contexto'],
    explanation: [
      { heading: 'Leia a tarefa antes de escolher', paragraphs: ['Uma questão pode perguntar pelo tema, pelo objetivo do autor, pelo efeito de um recurso ou pela relação entre partes do texto. Identificar o verbo do comando ajuda a saber que tipo de evidência procurar.', 'A ideia central não é necessariamente a frase mais chamativa. Observe quem fala, a quem se dirige, em que situação e o que o texto faz: informar, defender uma posição, narrar, criticar, convidar ou produzir humor, por exemplo.'] },
      { heading: 'Inferir sem inventar', paragraphs: ['Inferência é uma conclusão apoiada em pistas. Ela não precisa aparecer escrita literalmente, mas deve ser compatível com o texto e com o contexto apresentado.', 'Uma alternativa pode usar palavras presentes no texto e ainda assim estar errada se inverter uma relação, exagerar uma conclusão ou ignorar uma ressalva. Compare a alternativa inteira com as evidências, não apenas uma palavra isolada.'] },
    ],
    workedExample: { context: 'Texto autoral: “A biblioteca do bairro ampliou o horário aos sábados. Desde então, estudantes passaram a usar o espaço para estudar em grupo, além de emprestar livros.”', steps: ['Observe o fato principal: a ampliação do horário.', 'Identifique efeitos mencionados: estudo em grupo e empréstimo.', 'Não conclua que o número de leitores aumentou, pois o trecho não informa isso.'], conclusion: 'Uma inferência segura é que o horário ampliado favoreceu usos variados da biblioteca; não é possível quantificar o efeito sem outros dados.' },
    enemApplication: 'Em textos verbais, imagens, charges e infográficos, relacione título, fonte, legenda, elementos visuais e comando. O suporte também contribui para o sentido.',
    commonErrors: [
      { error: 'Escolher a alternativa que repete uma palavra do texto.', correction: 'Verifique se ela responde ao comando e preserva as relações de sentido.' },
      { error: 'Usar uma opinião pessoal como se fosse conclusão do autor.', correction: 'Apoie cada conclusão em uma pista textual ou contextual identificável.' },
      { error: 'Ignorar legenda, fonte ou elemento visual.', correction: 'Leia todos os componentes que participam da mensagem.' },
    ],
    summary: ['Leia o comando e determine o tipo de resposta pedido.', 'Localize evidências antes de avaliar alternativas.', 'Inferência precisa de pistas.', 'Elimine opções que extrapolam, contradizem ou não respondem ao comando.'],
    quiz: [{ prompt: 'O texto diz que uma praça ganhou iluminação e que moradores passaram a usá-la à noite. Qual conclusão é mais segura?', options: ['A iluminação pode ter facilitado o uso noturno da praça.', 'A praça agora é segura em qualquer situação.', 'Todos os moradores passaram a frequentá-la.', 'A iluminação reduziu os índices de violência.'], answerIndex: 0, explanation: 'A conclusão liga a mudança observada ao uso relatado, mas não afirma segurança total, frequência universal ou redução de violência, dados que não foram apresentados.' }],
    references: [matrix],
  },
};

export function getLesson(topicId: string): LessonContent | undefined {
  return lessons[topicId];
}
