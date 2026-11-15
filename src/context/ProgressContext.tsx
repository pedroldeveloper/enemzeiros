import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { readProgress, setAttemptFavorite, writeLessonOpened, writeLessonProgress, writeQuestionAttempt, saveEssaySubmission, saveEssayFeedback as saveEssayFeedbackRecord, deleteEssaySubmission, writeStudySession, type EssaySubmission, type QuestionAttempt } from '../services/progressService';
import type { LessonProgress } from '../types/curriculum';
import type { PracticeQuestion } from '../data/questions';

type ProgressState = {
  loading: boolean;
  progress: Record<string, LessonProgress>;
  attempts: QuestionAttempt[];
  essays: EssaySubmission[];
  totalStudySeconds: number;
  reload: () => Promise<void>;
  completeLesson: (topicId: string, version: number, completed: boolean) => Promise<void>;
  recordLessonVisit: (topicId: string, version: number) => Promise<void>;
  saveAttempt: (question: PracticeQuestion, selectedIndex: number, elapsedSeconds: number) => Promise<string>;
  favoriteAttempt: (attemptId: string, favorite: boolean) => Promise<void>;
  saveEssay: (title: string, theme: string, text: string, feedbackText: string, essayId?: string) => Promise<string>;
  saveEssayFeedback: (essayId: string, feedbackText: string) => Promise<void>;
  deleteEssay: (essayId: string) => Promise<void>;
  saveSession: (startedAt: Date, durationSeconds: number) => Promise<void>;
};

const ProgressContext = createContext<ProgressState | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user, configured } = useAuth();
  const [loading, setLoading] = useState(configured && Boolean(user));
  const [progress, setProgress] = useState<Record<string, LessonProgress>>({});
  const [attempts, setAttempts] = useState<QuestionAttempt[]>([]);
  const [essays, setEssays] = useState<EssaySubmission[]>([]);
  const [totalStudySeconds, setTotalStudySeconds] = useState(0);

  const reload = useCallback(async () => {
    if (!user) { setProgress({}); setAttempts([]); setEssays([]); setTotalStudySeconds(0); setLoading(false); return; }
    setLoading(true);
    try {
      const result = await readProgress(user.uid);
      setProgress(result.progress);
      setAttempts(result.attempts);
      setEssays(result.essays);
      setTotalStudySeconds(result.totalStudySeconds);
    } finally { setLoading(false); }
  }, [user]);

  useEffect(() => {
    setProgress({}); setAttempts([]); setEssays([]); setTotalStudySeconds(0);
    if (!user) { setLoading(false); return; }
    void reload().catch(() => setLoading(false));
  }, [user, reload]);

  const completeLesson = useCallback(async (topicId: string, version: number, completed: boolean) => {
    if (!user) throw new Error('Entre na sua conta para registrar uma aula.');
    await writeLessonProgress(user.uid, topicId, version, completed);
    setProgress((current) => {
      const previous = current[topicId];
      return { ...current, [topicId]: { topicId, status: completed ? 'completed' : 'not_started', lessonVersion: version, ...(completed ? { completedAt: new Date() } : previous?.completedAt ? { completedAt: previous.completedAt } : {}), ...(previous?.lastOpenedAt && { lastOpenedAt: previous.lastOpenedAt }), updatedAt: new Date() } };
    });
  }, [user]);

  const recordLessonVisit = useCallback(async (topicId: string, version: number) => {
    if (!user) return;
    await writeLessonOpened(user.uid, topicId, version);
    setProgress((current) => {
      const old = current[topicId];
      return { ...current, [topicId]: { topicId, status: old?.status ?? 'not_started', lessonVersion: version, ...(old?.completedAt && { completedAt: old.completedAt }), lastOpenedAt: new Date(), updatedAt: new Date() } };
    });
  }, [user]);

  const saveAttempt = useCallback(async (question: PracticeQuestion, selectedIndex: number, elapsedSeconds: number) => {
    if (!user) throw new Error('Entre na sua conta para registrar as tentativas.');
    const id = await writeQuestionAttempt(user.uid, question, selectedIndex, elapsedSeconds);
    setAttempts((current) => [{ id, questionId: question.id, area: question.area, subject: question.subject, topicId: question.topicId, selectedIndex, correct: selectedIndex === question.answerIndex, elapsedSeconds, source: question.source, favorite: false, questionSnapshot: question, createdAt: new Date() }, ...current].slice(0, 200));
    return id;
  }, [user]);

  const favoriteAttempt = useCallback(async (attemptId: string, favorite: boolean) => {
    if (!user) throw new Error('Entre na sua conta para alterar favoritos.');
    await setAttemptFavorite(user.uid, attemptId, favorite);
    setAttempts((current) => current.map((item) => item.id === attemptId ? { ...item, favorite } : item));
  }, [user]);

  const saveEssay = useCallback(async (title: string, theme: string, text: string, feedbackText: string, essayId?: string) => {
    if (!user) throw new Error('Entre na sua conta para salvar a redação.');
    const id = await saveEssaySubmission(user.uid, title, theme, text, feedbackText, essayId);
    setEssays((current) => [{ id, title: title.trim() || 'Minha redação', theme, text, feedbackText, createdAt: new Date() }, ...current.filter((essay) => essay.id !== id)].slice(0, 40));
    return id;
  }, [user]);

  const saveEssayFeedback = useCallback(async (essayId: string, feedbackText: string) => {
    if (!user) throw new Error('Entre na sua conta para salvar a devolutiva.');
    await saveEssayFeedbackRecord(user.uid, essayId, feedbackText);
    setEssays((current) => current.map((essay) => essay.id === essayId ? { ...essay, feedbackText } : essay));
  }, [user]);

  const deleteEssay = useCallback(async (essayId: string) => {
    if (!user) throw new Error('Entre na sua conta para excluir esta redação.');
    await deleteEssaySubmission(user.uid, essayId);
    setEssays((current) => current.filter((essay) => essay.id !== essayId));
  }, [user]);

  const saveSession = useCallback(async (startedAt: Date, durationSeconds: number) => {
    if (!user) throw new Error('Entre na sua conta para registrar a sessão.');
    await writeStudySession(user.uid, startedAt, durationSeconds);
    setTotalStudySeconds((current) => current + Math.max(1, Math.floor(durationSeconds)));
  }, [user]);

  const value = useMemo(() => ({ loading, progress, attempts, essays, totalStudySeconds, reload, completeLesson, recordLessonVisit, saveAttempt, favoriteAttempt, saveEssay, saveEssayFeedback, deleteEssay, saveSession }), [loading, progress, attempts, essays, totalStudySeconds, reload, completeLesson, recordLessonVisit, saveAttempt, favoriteAttempt, saveEssay, saveEssayFeedback, deleteEssay, saveSession]);
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const value = useContext(ProgressContext);
  if (!value) throw new Error('useProgress precisa estar dentro de ProgressProvider.');
  return value;
}
