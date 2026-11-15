import type { PracticeQuestion } from '../data/questions';

const API_ROOT = 'https://api.enem.dev/v1';
const DATABASE_NAME = 'enemzeiros-question-bank';
const DATABASE_VERSION = 1;
const STORE_NAME = 'questions';
export const HISTORICAL_YEARS = Array.from({ length: 15 }, (_, index) => 2009 + index);

export type QuestionBankProgress = {
  year: number;
  completedYears: number;
  totalYears: number;
  questionCount: number;
};

type ApiAlternative = { letter?: unknown; text?: unknown; file?: unknown; isCorrect?: unknown };
type ApiQuestion = {
  title?: unknown;
  index?: unknown;
  discipline?: unknown;
  language?: unknown;
  year?: unknown;
  context?: unknown;
  files?: unknown;
  correctAlternative?: unknown;
  alternativesIntroduction?: unknown;
  alternatives?: unknown;
};
type ApiResponse = { metadata?: { limit?: number; offset?: number; total?: number; hasMore?: boolean }; questions?: ApiQuestion[] };

function openQuestionDatabase(): Promise<IDBDatabase> {
  if (!('indexedDB' in window)) return Promise.reject(new Error('O armazenamento local deste navegador não está disponível.'));
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Não foi possível abrir o banco de questões neste navegador.'));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Falha ao gravar o banco de questões.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('A gravação do banco de questões foi cancelada.'));
  });
}

export async function getCachedQuestionBank(): Promise<PracticeQuestion[]> {
  const database = await openQuestionDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).getAll() as IDBRequest<PracticeQuestion[]>;
    const result = await new Promise<PracticeQuestion[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result ?? []);
      request.onerror = () => reject(new Error('Não foi possível ler o banco de questões salvo.'));
    });
    return result;
  } finally {
    database.close();
  }
}

async function cacheQuestions(items: PracticeQuestion[]) {
  const database = await openQuestionDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    items.forEach((question) => store.put(question));
    await transactionDone(transaction);
  } finally {
    database.close();
  }
}

function delay(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function plainText(value: unknown): string {
  return asText(value)
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])\s*>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .trim();
}

function safeImageUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !(url.hostname === 'enem.dev' || url.hostname.endsWith('.enem.dev'))) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function mapDiscipline(discipline: unknown) {
  switch (discipline) {
    case 'linguagens': return { area: 'Linguagens', subject: 'Linguagens' };
    case 'humanas':
    case 'ciencias-humanas': return { area: 'Ciências Humanas', subject: 'Ciências Humanas' };
    case 'natureza':
    case 'ciencias-natureza': return { area: 'Matemática e Ciências da Natureza', subject: 'Ciências da Natureza' };
    case 'matematica':
    case 'mathematics': return { area: 'Matemática e Ciências da Natureza', subject: 'Matemática' };
    default: return { area: 'ENEM', subject: 'Outras' };
  }
}

function mapApiQuestion(item: ApiQuestion, year: number): PracticeQuestion | null {
  const alternatives = Array.isArray(item.alternatives) ? item.alternatives as ApiAlternative[] : [];
  if (alternatives.length !== 5 || !Number.isInteger(item.index)) return null;
  const correctLetter = asText(item.correctAlternative).toLocaleUpperCase('pt-BR');
  const answerIndex = alternatives.findIndex((alternative) => alternative.isCorrect === true || asText(alternative.letter).toLocaleUpperCase('pt-BR') === correctLetter);
  const options = alternatives.map((alternative) => plainText(alternative.text) || (safeImageUrl(alternative.file) ? 'Alternativa ilustrada' : ''));
  if (answerIndex < 0 || options.some((option) => !option)) return null;

  const { area, subject } = mapDiscipline(item.discipline);
  const questionNumber = Number(item.index);
  const context = plainText(item.context);
  const alternativesIntroduction = plainText(item.alternativesIntroduction);
  const title = plainText(item.title) || `Questão ${questionNumber} — ENEM ${year}`;
  const prompt = [context || title, alternativesIntroduction].filter(Boolean).join('\n\n').slice(0, 15_500);
  const imageUrls = Array.isArray(item.files) ? item.files.map(safeImageUrl).filter((url): url is string => Boolean(url)).slice(0, 8) : [];
  const optionImages = alternatives.map((alternative) => safeImageUrl(alternative.file));
  const language = asText(item.language);

  return {
    id: `enem-${year}-${questionNumber}${language ? `-${language}` : ''}`,
    area,
    subject,
    topicId: `enem-${year}-${String(item.discipline ?? 'geral')}`,
    difficulty: 'Não classificada',
    source: 'official_reference',
    prompt,
    options,
    answerIndex,
    explanation: '',
    distractorNotes: [],
    examYear: year,
    questionNumber,
    ...(language && { language }),
    ...(alternativesIntroduction && { alternativesIntroduction }),
    ...(imageUrls.length && { imageUrls }),
    ...(optionImages.some(Boolean) && { optionImages }),
    sourceUrl: `https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos/${year}`,
  };
}

async function fetchYear(year: number): Promise<PracticeQuestion[]> {
  const questions: PracticeQuestion[] = [];
  let offset = 0;
  let hasMore = true;
  let requests = 0;

  while (hasMore && requests < 10) {
    if (requests > 0) await delay(1100);
    const url = new URL(`${API_ROOT}/exams/${year}/questions`);
    url.searchParams.set('limit', '200');
    url.searchParams.set('offset', String(offset));
    let response: Response | null = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      response = await fetch(url);
      if (response.status !== 429) break;
      const retryAfter = Number(response.headers.get('Retry-After'));
      await delay(Math.max(1200, Number.isFinite(retryAfter) ? retryAfter : 1200));
    }
    requests += 1;
    if (!response?.ok) throw new Error(`A fonte de questões não respondeu para o ano ${year}. Tente novamente em alguns instantes.`);

    const result = await response.json() as ApiResponse;
    const batch = (Array.isArray(result.questions) ? result.questions : [])
      .map((item) => mapApiQuestion(item, year))
      .filter((item): item is PracticeQuestion => item !== null);
    if (batch.length) {
      questions.push(...batch);
      offset += Array.isArray(result.questions) ? result.questions.length : batch.length;
    }
    hasMore = result.metadata?.hasMore === true && batch.length > 0;
  }

  if (!questions.length) throw new Error(`Nenhuma questão válida foi recebida para ${year}. O restante do acervo foi preservado.`);
  return questions;
}

export async function downloadHistoricalQuestionBank(onProgress: (progress: QuestionBankProgress) => void): Promise<PracticeQuestion[]> {
  const cached = await getCachedQuestionBank();
  const cachedYears = new Set(cached.map((question) => question.examYear).filter((year): year is number => typeof year === 'number'));
  let completedYears = 0;
  let questionCount = cached.length;
  let previousYearWasDownloaded = false;

  for (const year of HISTORICAL_YEARS) {
    if (cachedYears.has(year)) {
      completedYears += 1;
      onProgress({ year, completedYears, totalYears: HISTORICAL_YEARS.length, questionCount });
      continue;
    }
    if (previousYearWasDownloaded) await delay(1100);
    const downloaded = await fetchYear(year);
    await cacheQuestions(downloaded);
    questionCount += downloaded.length;
    completedYears += 1;
    previousYearWasDownloaded = true;
    onProgress({ year, completedYears, totalYears: HISTORICAL_YEARS.length, questionCount });
  }

  return getCachedQuestionBank();
}
