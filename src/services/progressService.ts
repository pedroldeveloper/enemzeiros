import {
  collection,
  doc,
  deleteDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { LessonProgress } from '../types/curriculum';
import type { PracticeQuestion } from '../data/questions';

export type QuestionAttempt = {
  id: string;
  questionId: string;
  area: string;
  subject: string;
  topicId: string;
  selectedIndex: number;
  correct: boolean;
  elapsedSeconds: number;
  source: 'authorial' | 'ai_generated' | 'official_reference';
  favorite: boolean;
  questionSnapshot?: PracticeQuestion;
  createdAt?: Date;
};

export type EssaySubmission = {
  id: string;
  title: string;
  theme: string;
  text: string;
  feedbackText: string;
  createdAt?: Date;
};

function requireDb() {
  if (!db) throw new Error('Configure o Firebase antes de salvar o progresso.');
  return db;
}

function toDate(value: unknown): Date | undefined {
  return value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function'
    ? (value as Timestamp).toDate()
    : undefined;
}

export async function readProgress(uid: string) {
  const store = requireDb();
  const progressSnapshot = await getDocs(collection(store, 'users', uid, 'lessonProgress'));
  const attemptSnapshot = await getDocs(query(collection(store, 'users', uid, 'questionAttempts'), orderBy('createdAt', 'desc'), limit(200)));
  const essaySnapshot = await getDocs(query(collection(store, 'users', uid, 'essaySubmissions'), orderBy('createdAt', 'desc'), limit(40)));
  const sessionSnapshot = await getDocs(query(collection(store, 'users', uid, 'studySessions'), orderBy('endedAt', 'desc'), limit(30)));

  const progress: Record<string, LessonProgress> = {};
  progressSnapshot.docs.forEach((snapshot) => {
    const data = snapshot.data();
    if ((data.status === 'completed' || data.status === 'not_started') && typeof data.lessonVersion === 'number') {
      progress[snapshot.id] = {
        topicId: snapshot.id,
        status: data.status,
        lessonVersion: data.lessonVersion,
        completedAt: toDate(data.completedAt),
        updatedAt: toDate(data.updatedAt),
        lastOpenedAt: toDate(data.lastOpenedAt),
      };
    }
  });
  const attempts = attemptSnapshot.docs.map((snapshot) => {
    const data = snapshot.data();
    return { ...data, id: snapshot.id, createdAt: toDate(data.createdAt) } as QuestionAttempt;
  });
  const essays = essaySnapshot.docs.map((snapshot) => {
    const data = snapshot.data();
    let feedbackText = typeof data.feedbackText === 'string' ? data.feedbackText : '';
    if (!feedbackText && typeof data.assessmentJson === 'string') {
      try {
        const legacy = JSON.parse(data.assessmentJson) as { totalScore?: number; competencies?: { key?: string; score?: number; rationale?: string; nextStep?: string }[] };
        feedbackText = [
          'Devolutiva de uma versão anterior (estimativa automática do Enemzeiros; não é uma nota oficial).',
          typeof legacy.totalScore === 'number' ? `Total estimado antigo: ${legacy.totalScore} / 1.000` : '',
          ...(legacy.competencies ?? []).map((item) => `${item.key ?? 'Competência'} — ${typeof item.score === 'number' ? `${item.score}/200` : 'sem faixa'}\n${item.rationale ?? ''}\nPróximo passo: ${item.nextStep ?? ''}`),
        ].filter(Boolean).join('\n\n');
      } catch {
        feedbackText = 'Devolutiva antiga em formato não reconhecido. O registro original foi preservado.';
      }
    }
    return {
      id: snapshot.id,
      title: typeof data.title === 'string' ? data.title : 'Minha redação',
      theme: typeof data.theme === 'string' ? data.theme : '',
      text: typeof data.text === 'string' ? data.text : '',
      feedbackText,
      createdAt: toDate(data.createdAt),
    } as EssaySubmission;
  });
  const sessions = sessionSnapshot.docs.map((snapshot) => snapshot.data());
  const totalStudySeconds = sessions.reduce((total, session) => total + (typeof session.durationSeconds === 'number' ? session.durationSeconds : 0), 0);
  return { progress, attempts, essays, totalStudySeconds };
}

export async function writeLessonProgress(uid: string, topicId: string, lessonVersion: number, completed: boolean) {
  const store = requireDb();
  const progressDoc = doc(store, 'users', uid, 'lessonProgress', topicId);
  const historyDoc = doc(collection(progressDoc, 'history'));
  await runTransaction(store, async (transaction) => {
    const existing = await transaction.get(progressDoc);
    const previous = existing.data();
    const wasCompleted = previous?.status === 'completed';
    transaction.set(progressDoc, {
      topicId,
      status: completed ? 'completed' : 'not_started',
      lessonVersion,
      completionCount: (typeof previous?.completionCount === 'number' ? previous.completionCount : 0) + Number(completed && !wasCompleted),
      completedAt: completed ? serverTimestamp() : previous?.completedAt ?? null,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    transaction.set(historyDoc, { topicId, action: completed ? 'completed' : 'reopened', lessonVersion, createdAt: serverTimestamp() });
  });
}

export async function writeLessonOpened(uid: string, topicId: string, lessonVersion: number) {
  const store = requireDb();
  const progressDoc = doc(store, 'users', uid, 'lessonProgress', topicId);
  await runTransaction(store, async (transaction) => {
    const existing = await transaction.get(progressDoc);
    const previous = existing.data();
    transaction.set(progressDoc, {
      topicId,
      status: previous?.status === 'completed' ? 'completed' : 'not_started',
      lessonVersion,
      completionCount: typeof previous?.completionCount === 'number' ? previous.completionCount : 0,
      completedAt: previous?.completedAt ?? null,
      lastOpenedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  });
}

export async function writeQuestionAttempt(uid: string, question: PracticeQuestion, selectedIndex: number, elapsedSeconds: number) {
  const store = requireDb();
  const id = crypto.randomUUID();
  await setDoc(doc(store, 'users', uid, 'questionAttempts', id), {
    questionId: question.id,
    area: question.area,
    subject: question.subject,
    topicId: question.topicId,
    selectedIndex,
    correct: selectedIndex === question.answerIndex,
    elapsedSeconds: Math.max(0, Math.min(86_400, Math.floor(elapsedSeconds))),
    source: question.source,
    favorite: false,
    questionSnapshot: question,
    createdAt: serverTimestamp(),
  });
  return id;
}

export async function setAttemptFavorite(uid: string, attemptId: string, favorite: boolean) {
  const store = requireDb();
  await updateDoc(doc(store, 'users', uid, 'questionAttempts', attemptId), { favorite });
}

export async function saveEssaySubmission(uid: string, title: string, theme: string, text: string, feedbackText: string, essayId?: string) {
  const store = requireDb();
  const id = essayId || crypto.randomUUID();
  await setDoc(doc(store, 'users', uid, 'essaySubmissions', id), {
    title: title.trim().slice(0, 120) || 'Minha redação',
    theme: theme.trim().slice(0, 500),
    text: text.slice(0, 12_000),
    feedbackText: feedbackText.trim().slice(0, 24_000),
    createdAt: serverTimestamp(),
  });
  return id;
}

export async function saveEssayFeedback(uid: string, essayId: string, feedbackText: string) {
  const store = requireDb();
  await updateDoc(doc(store, 'users', uid, 'essaySubmissions', essayId), {
    feedbackText: feedbackText.trim().slice(0, 24_000),
    feedbackUpdatedAt: serverTimestamp(),
  });
}

export async function deleteEssaySubmission(uid: string, essayId: string) {
  const store = requireDb();
  await deleteDoc(doc(store, 'users', uid, 'essaySubmissions', essayId));
}

export async function writeStudySession(uid: string, startedAt: Date, durationSeconds: number) {
  const store = requireDb();
  const id = crypto.randomUUID();
  await setDoc(doc(store, 'users', uid, 'studySessions', id), {
    startedAt,
    endedAt: serverTimestamp(),
    durationSeconds: Math.max(1, Math.min(86_400, Math.floor(durationSeconds))),
  });
}
