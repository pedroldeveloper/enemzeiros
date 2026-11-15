import { z } from 'zod';

export type PracticeQuestion = {
  id: string;
  area: string;
  subject: string;
  topicId: string;
  difficulty: 'Fácil' | 'Média' | 'Não classificada';
  source: 'authorial' | 'ai_generated' | 'official_reference';
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  distractorNotes: string[];
  examYear?: number;
  questionNumber?: number;
  language?: string;
  alternativesIntroduction?: string;
  imageUrls?: string[];
  optionImages?: Array<string | null>;
  sourceUrl?: string;
};

const rawQuestions: PracticeQuestion[] = [
  {
    id: 'autoral-matematica-percentual-001', area: 'Matemática e Ciências da Natureza', subject: 'Matemática', topicId: 'matematica-porcentagem', difficulty: 'Fácil', source: 'authorial',
    prompt: 'Uma conta de R$ 240 recebeu um desconto de 10%. Qual passou a ser o valor cobrado?',
    options: ['R$ 24', 'R$ 216', 'R$ 230', 'R$ 264', 'R$ 240'], answerIndex: 1,
    explanation: '10% de 240 é 24. Como se trata de desconto, subtraímos essa parcela: 240 − 24 = 216 reais.',
    distractorNotes: ['É apenas o valor do desconto.', 'Correta: subtraiu o desconto do total.', 'Subtraiu R$ 10, confundindo reais e porcentagem.', 'Somou a porcentagem como aumento.', 'Manteve o valor sem aplicar o desconto.'],
  },
  {
    id: 'autoral-linguagens-leitura-001', area: 'Linguagens', subject: 'Linguagens', topicId: 'linguagens-interpretação-de-textos', difficulty: 'Fácil', source: 'authorial',
    prompt: 'Um cartaz comunitário diz: “A feira começa às 8h. Leve sua sacola reutilizável e ajude a reduzir o uso de embalagens descartáveis.” Qual é o principal objetivo do trecho?',
    options: ['Narrar a história da feira do bairro.', 'Divulgar um horário e incentivar uma prática de redução de descartáveis.', 'Proibir a venda de produtos embalados.', 'Apresentar dados estatísticos sobre o lixo.', 'Criticar todas as formas de consumo.'], answerIndex: 1,
    explanation: 'O cartaz informa o horário da feira e faz um apelo direto para que as pessoas levem sacolas reutilizáveis, associando essa ação à redução de descartáveis.',
    distractorNotes: ['Não há uma sequência narrativa.', 'Correta: reúne informação prática e apelo ao leitor.', 'O texto não proíbe produtos embalados.', 'Nenhuma estatística é apresentada.', 'A crítica do texto é específica, não dirigida a todo consumo.'],
  },
  {
    id: 'autoral-biologia-ecologia-001', area: 'Matemática e Ciências da Natureza', subject: 'Biologia', topicId: 'biologia-ecologia', difficulty: 'Fácil', source: 'authorial',
    prompt: 'Em uma cadeia simples, algas são consumidas por pequenos crustáceos, que servem de alimento a peixes. Qual organismo ocupa o nível de produtor?',
    options: ['Algas', 'Crustáceos', 'Peixes', 'Todos ocupam o mesmo nível.', 'Nenhum, pois vivem na água.'], answerIndex: 0,
    explanation: 'As algas produzem matéria orgânica, geralmente por fotossíntese, e formam a base desta cadeia alimentar.',
    distractorNotes: ['Correta: algas são produtoras neste exemplo.', 'Os crustáceos consomem o produtor.', 'Os peixes consomem os crustáceos.', 'A cadeia descreve níveis diferentes.', 'O ambiente aquático não impede a produção fotossintética.'],
  },
  {
    id: 'autoral-quimica-solucoes-001', area: 'Matemática e Ciências da Natureza', subject: 'Química', topicId: 'quimica-solucoes', difficulty: 'Média', source: 'authorial',
    prompt: 'Uma solução aquosa é preparada dissolvendo sal em água até que a mistura fique uniforme. Em relação ao sistema formado, qual descrição é adequada?',
    options: ['É uma mistura heterogênea porque contém duas substâncias.', 'É uma mistura homogênea, pois apresenta uma única fase visível.', 'É uma substância pura formada por um único elemento.', 'É uma reação química necessariamente irreversível.', 'É sempre uma mistura saturada.'], answerIndex: 1,
    explanation: 'Uma solução é uma mistura homogênea. A presença de mais de uma substância não a torna heterogênea; o critério relevante aqui é a uniformidade em uma fase.',
    distractorNotes: ['Duas ou mais substâncias podem formar uma mistura homogênea.', 'Correta: solução aquosa uniforme apresenta uma fase.', 'Água e sal não constituem uma única substância pura.', 'Dissolver não implica, por si, uma reação irreversível.', 'O enunciado não informa o limite de solubilidade.'],
  },
  {
    id: 'autoral-geografia-cartografia-001', area: 'Ciências Humanas', subject: 'Geografia', topicId: 'geografia-cartografia', difficulty: 'Média', source: 'authorial',
    prompt: 'Em um mapa temático, tons mais escuros representam municípios com maior densidade demográfica. Para interpretar corretamente a legenda, o leitor deve comparar principalmente',
    options: ['a cor dos limites estaduais.', 'a intensidade do tom associada ao valor indicado.', 'o tamanho físico dos municípios no papel.', 'a posição norte-sul sem consultar os dados.', 'o número de nomes impressos no mapa.'], answerIndex: 1,
    explanation: 'A legenda relaciona a intensidade do tom à densidade demográfica. A leitura correta compara a variável temática conforme essa convenção cartográfica.',
    distractorNotes: ['Os limites não codificam densidade nesta situação.', 'Correta: interpreta a variável segundo a legenda.', 'A área desenhada pode não refletir população nem densidade.', 'Orientação não substitui a leitura da legenda.', 'Quantidade de rótulos não representa a variável.'],
  },
];

const QuestionSchema = z.object({
  id: z.string().min(1), area: z.string().min(1), subject: z.string().min(1), topicId: z.string().min(1),
  difficulty: z.enum(['Fácil', 'Média', 'Não classificada']), source: z.enum(['authorial', 'ai_generated', 'official_reference']),
  prompt: z.string().min(30), options: z.array(z.string().min(1)).length(5), answerIndex: z.number().int().min(0).max(4),
  explanation: z.string().min(30), distractorNotes: z.array(z.string().min(5)).length(5),
  examYear: z.number().int().min(1998).max(2100).optional(), questionNumber: z.number().int().min(1).max(200).optional(),
  language: z.string().max(30).optional(), alternativesIntroduction: z.string().max(4000).optional(),
  imageUrls: z.array(z.string().url()).max(8).optional(), optionImages: z.array(z.string().url().nullable()).max(5).optional(),
  sourceUrl: z.string().url().optional(),
}).refine((question) => new Set(question.options.map((option) => option.trim().toLocaleLowerCase('pt-BR'))).size === 5, 'As alternativas precisam ser diferentes.');

export const questions: PracticeQuestion[] = rawQuestions.map((question) => QuestionSchema.parse(question));

export function validateGeneratedQuestions(value: unknown): PracticeQuestion[] | null {
  const schema = z.array(QuestionSchema).min(1).max(4);
  const parsed = schema.safeParse(value);
  if (!parsed.success
    || new Set(parsed.data.map((question) => question.id)).size !== parsed.data.length
    || parsed.data.some((question) => question.source !== 'ai_generated' || !question.id.startsWith('treino-ia-'))) return null;
  return parsed.data;
}
