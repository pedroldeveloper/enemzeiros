import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Brain, CheckCircle2, Clock3, FileText, Sparkles, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { curriculumTopics, getNextLesson, publishedTopics } from '../data/curriculum';
import { ProgressBar } from '../components/ProgressBar';
import { readUserSettings } from '../services/authService';

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours ? `${hours} h ${minutes} min` : `${minutes} min`;
}

export function DashboardPage() {
  const { user } = useAuth();
  const { progress, attempts, essays, totalStudySeconds, saveSession, loading } = useProgress();
  const [goal, setGoal] = useState(800);
  const [timerRunning, setTimerRunning] = useState(false);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [timerMessage, setTimerMessage] = useState('');
  const [savingSession, setSavingSession] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    void readUserSettings(user.uid).then((profile) => {
      const overall = profile?.goals?.overall;
      if (active && typeof overall === 'number') setGoal(overall);
    }).catch(() => undefined);
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    if (!timerRunning || !startedAt) return;
    const tick = () => setElapsed(Math.floor((Date.now() - startedAt.getTime()) / 1000));
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning, startedAt]);

  const completedIds = useMemo(() => new Set(Object.values(progress).filter((item) => item.status === 'completed').map((item) => item.topicId)), [progress]);
  const availableLessons = publishedTopics();
  const nextLesson = getNextLesson(completedIds);
  const lastOpened = Object.values(progress).filter((item) => item.lastOpenedAt).sort((a, b) => (b.lastOpenedAt?.getTime() ?? 0) - (a.lastOpenedAt?.getTime() ?? 0))[0];
  const lastOpenedTopic = lastOpened ? curriculumTopics.find((topic) => topic.id === lastOpened.topicId) : undefined;
  const completedRequired = curriculumTopics.filter((topic) => topic.requiredForPractice && completedIds.has(topic.id)).length;
  const publishedComplete = availableLessons.filter((topic) => completedIds.has(topic.id)).length;
  const pendingTopics = curriculumTopics.length - availableLessons.length;
  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'estudante';
  const incorrectCount = attempts.filter((attempt) => !attempt.correct).length;
  const accuracy = attempts.length ? Math.round((attempts.filter((attempt) => attempt.correct).length / attempts.length) * 100) : 0;

  async function finishSession() {
    if (!startedAt || !user) return;
    const duration = Math.floor((Date.now() - startedAt.getTime()) / 1000);
    setSavingSession(true); setTimerMessage('');
    try {
      await saveSession(startedAt, duration);
      setTimerMessage(`Sessão salva: ${formatDuration(duration)}.`);
      setTimerRunning(false); setStartedAt(null); setElapsed(0);
    } catch (error) { setTimerMessage(error instanceof Error ? error.message : 'Não foi possível salvar a sessão.'); }
    finally { setSavingSession(false); }
  }

  return (
    <div className="dashboard-page">
      <section className="welcome-row"><div><span className="eyebrow">SEU PLANO EM UM SÓ LUGAR</span><h2>Bom estudo, {firstName}.</h2><p>Continue no seu ritmo. Seu próximo passo está aqui.</p></div><div className="goal-badge"><Target size={17} /><span>Meta pessoal de média</span><strong>{goal}</strong></div></section>

      <section className="dashboard-grid dashboard-kpis" aria-label="Resumo do seu progresso">
        <article className="kpi-panel kpi-primary"><span className="kpi-icon"><BookOpen size={18} /></span><span className="kpi-label">Aulas publicadas concluídas</span><strong>{loading ? '—' : `${publishedComplete} / ${availableLessons.length}`}</strong><small>O currículo tem {curriculumTopics.length} tópicos mapeados.</small></article>
        <article className="kpi-panel"><span className="kpi-icon"><CheckCircle2 size={18} /></span><span className="kpi-label">Tópicos concluídos</span><strong>{loading ? '—' : `${completedRequired} / ${curriculumTopics.length}`}</strong><small>{pendingTopics} tópicos aguardam produção de aula.</small></article>
        <article className="kpi-panel"><span className="kpi-icon"><Brain size={18} /></span><span className="kpi-label">Questões respondidas</span><strong>{loading ? '—' : attempts.length}</strong><small>{attempts.length ? `${accuracy}% de acerto nos seus exercícios` : 'Ainda não há tentativas registradas.'}</small></article>
        <article className="kpi-panel"><span className="kpi-icon"><Clock3 size={18} /></span><span className="kpi-label">Tempo registrado</span><strong>{loading ? '—' : formatDuration(totalStudySeconds)}</strong><small>Medido nas sessões que você finaliza pelo cronômetro.</small></article>
      </section>

      <section className="dashboard-main-grid">
        <article className="panel next-step-panel"><div className="panel-heading"><div><span className="eyebrow">PRÓXIMA AÇÃO</span><h3>{nextLesson ? 'Retome seu plano' : 'Você concluiu as aulas disponíveis'}</h3></div><span className="small-icon"><Sparkles size={17} /></span></div>{lastOpenedTopic && <div className="last-accessed">Última aula acessada: <strong>{lastOpenedTopic.title}</strong></div>}
          {nextLesson ? <><div className="next-lesson-meta">{nextLesson.subject} <span>·</span> {nextLesson.moduleTitle}</div><h4>{nextLesson.title}</h4><p className="muted">Aula publicada · prioridade pedagógica estimada: {nextLesson.priority.toLowerCase()}.</p><Link className="button button-primary" to={`/aula/${nextLesson.id}`}>Continuar estudando <ArrowRight size={16} /></Link></> : <><p className="muted">Há {pendingTopics} tópicos no mapa aguardando produção didática. A plataforma não os apresenta como aulas prontas.</p><Link className="button button-secondary" to="/plano">Ver o plano de estudos <ArrowRight size={16} /></Link></>}
        </article>
        <article className="panel timer-panel"><div className="panel-heading"><div><span className="eyebrow">SESSÃO DE ESTUDO</span><h3>Estude no seu ritmo</h3></div><span className="small-icon"><Clock3 size={17} /></span></div><p className="muted">Inicie o cronômetro quando começar. Finalize para salvar o tempo na sua conta.</p><div className="timer-readout" aria-live="polite">{formatDuration(elapsed)}</div><button className={`button ${timerRunning ? 'button-secondary' : 'button-primary'}`} type="button" disabled={savingSession} onClick={() => { if (timerRunning) void finishSession(); else { setStartedAt(new Date()); setElapsed(0); setTimerRunning(true); setTimerMessage(''); } }}>{savingSession ? 'Salvando…' : timerRunning ? 'Finalizar e salvar sessão' : 'Iniciar sessão'}</button>{timerMessage && <p className="form-message form-success" role="status">{timerMessage}</p>}</article>
      </section>

      <section className="dashboard-lower-grid"><article className="panel area-progress-panel"><div className="panel-heading"><div><span className="eyebrow">CURRÍCULO</span><h3>Disponibilidade por área</h3></div><Link className="text-link" to="/plano">Abrir plano <ArrowRight size={15} /></Link></div>
        {['Redação', 'Matemática e Ciências da Natureza', 'Ciências Humanas', 'Linguagens'].map((area) => {
          const topics = availableLessons.filter((topic) => topic.area === area);
          const done = topics.filter((topic) => completedIds.has(topic.id)).length;
          return <div className="area-row" key={area}><div className="area-row-label"><span>{area}</span><small>{done} / {topics.length} aulas publicadas</small></div><ProgressBar value={topics.length ? done / topics.length * 100 : 0} compact label={`Aulas concluídas em ${area}`} /></div>;
        })}
        <p className="tiny-note">A taxa acima considera aulas publicadas. O curso completo ainda não foi liberado.</p>
      </article>
      <article className="panel activity-panel"><div className="panel-heading"><div><span className="eyebrow">ATIVIDADE</span><h3>Retome o que importa</h3></div></div>
        {incorrectCount > 0 && <Link className="activity-row" to="/desempenho"><span className="activity-icon activity-icon-warn"><Brain size={17} /></span><span><strong>{incorrectCount} {incorrectCount === 1 ? 'questão para revisar' : 'questões para revisar'}</strong><small>Confira seus erros e volte ao assunto.</small></span><ArrowRight size={16} /></Link>}
        {essays.length > 0 && <Link className="activity-row" to="/redacao"><span className="activity-icon"><FileText size={17} /></span><span><strong>{essays.length} {essays.length === 1 ? 'redação salva' : 'redações salvas'}</strong><small>Veja sua evolução por competência.</small></span><ArrowRight size={16} /></Link>}
        {incorrectCount === 0 && essays.length === 0 && <div className="activity-empty"><span className="activity-icon"><Target size={17} /></span><div><strong>Seu histórico começa com uma aula</strong><small>As estatísticas aparecem conforme você estuda e registra atividades.</small></div></div>}
        <div className="activity-cta"><Link to="/redacao">Escrever e pedir devolutiva externa <ArrowRight size={15} /></Link><span>Você escolhe a IA e controla quando compartilha o texto.</span></div>
      </article></section>
    </div>
  );
}
