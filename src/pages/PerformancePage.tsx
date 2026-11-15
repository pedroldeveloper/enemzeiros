import { useMemo } from 'react';
import { ArrowRight, Bookmark, ChartNoAxesColumnIncreasing, Clock3, FileText, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { ProgressBar } from '../components/ProgressBar';

function pct(correct: number, total: number) { return total ? Math.round(correct / total * 100) : 0; }

export function PerformancePage() {
  const { attempts, essays, totalStudySeconds, loading } = useProgress();
  const bySubject = useMemo(() => {
    const summary = new Map<string, { total: number; correct: number }>();
    for (const attempt of attempts) {
      const current = summary.get(attempt.subject) ?? { total: 0, correct: 0 };
      current.total += 1; current.correct += Number(attempt.correct); summary.set(attempt.subject, current);
    }
    return [...summary.entries()].sort((a, b) => b[1].total - a[1].total);
  }, [attempts]);
  const wrong = attempts.filter((attempt) => !attempt.correct);
  const correctCount = attempts.filter((attempt) => attempt.correct).length;
  const overall = pct(correctCount, attempts.length);
  const latestEssays = [...essays].sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
  const formatTime = (seconds: number) => `${Math.floor(seconds / 3600)} h ${Math.floor(seconds % 3600 / 60)} min`;

  return <div className="performance-page"><section className="page-intro"><span className="eyebrow">SEU DESEMPENHO</span><h2>Veja o que seus registros mostram.</h2><p>As estatísticas descrevem as atividades salvas na sua conta. Elas não equivalem a uma nota oficial ou previsão pela TRI.</p></section>
    <section className="performance-kpis"><article className="panel"><span className="kpi-icon"><ChartNoAxesColumnIncreasing size={18} /></span><small>Acerto em exercícios</small><strong>{loading ? '—' : attempts.length ? `${overall}%` : '—'}</strong><span>{attempts.length} tentativas registradas</span></article><article className="panel"><span className="kpi-icon"><RotateCcw size={18} /></span><small>Questões incorretas</small><strong>{loading ? '—' : wrong.length}</strong><span>Dados do seu histórico</span></article><article className="panel"><span className="kpi-icon"><FileText size={18} /></span><small>Redações salvas</small><strong>{loading ? '—' : essays.length}</strong><span>Versões salvas por você</span></article><article className="panel"><span className="kpi-icon"><Clock3 size={18} /></span><small>Tempo de estudo</small><strong>{loading ? '—' : formatTime(totalStudySeconds)}</strong><span>Sessões finalizadas no cronômetro</span></article></section>
    <section className="performance-grid"><article className="panel performance-by-subject"><div className="panel-heading"><div><span className="eyebrow">QUESTÕES</span><h3>Desempenho por disciplina</h3></div></div>{bySubject.length ? bySubject.map(([subject, data]) => <div className="performance-subject-row" key={subject}><div className="performance-subject-heading"><strong>{subject}</strong><span>{data.correct} de {data.total} corretas · {pct(data.correct, data.total)}%</span></div><ProgressBar value={pct(data.correct, data.total)} compact label={`Taxa de acerto em ${subject}`} /></div>) : <div className="empty-state-inline"><p>Quando houver tentativas salvas, a taxa de acerto aparecerá por disciplina.</p></div>}<p className="tiny-note">A taxa mostra apenas estas tentativas. A TRI considera características dos itens e padrões de resposta; este painel não calcula nota TRI.</p></article>
      <article className="panel error-review"><div className="panel-heading"><div><span className="eyebrow">REVISÃO</span><h3>Questões para retomar</h3></div>{wrong.length > 0 && <Link to="/pratica?mode=wrong" className="text-link">Refazer <ArrowRight size={15} /></Link>}</div>{wrong.length ? <div className="wrong-question-list">{wrong.slice(0, 8).map((attempt) => <article key={attempt.id}><div><span className="wrong-subject">{attempt.subject} · {attempt.createdAt?.toLocaleDateString('pt-BR') ?? 'data não disponível'}</span><strong>{attempt.questionSnapshot?.prompt ?? 'Questão registrada'}</strong><small>{attempt.questionSnapshot?.options[attempt.selectedIndex] ?? 'Resposta marcada'} · incorreta</small></div>{attempt.favorite && <Bookmark size={15} fill="currentColor" />}</article>)}</div> : <div className="empty-state-inline"><p>Nenhuma resposta incorreta registrada por enquanto.</p></div>}</article></section>
    <section className="panel essay-evolution"><div className="panel-heading"><div><span className="eyebrow">REDAÇÃO</span><h3>Devolutivas registradas</h3></div><Link className="text-link" to="/redacao">Abrir redações <ArrowRight size={15} /></Link></div>{latestEssays.length ? <div className="essay-evolution-list">{latestEssays.slice(0, 6).map((essay) => <article className="essay-feedback-card" key={essay.id}><div><strong>{essay.title || 'Minha redação'}</strong><small>{essay.createdAt?.toLocaleDateString('pt-BR') || 'Data não disponível'} · {essay.theme}</small></div><p>{essay.feedbackText.slice(0, 320)}{essay.feedbackText.length > 320 ? '…' : ''}</p></article>)}<p className="tiny-note">Texto do histórico da conta. A plataforma não verifica a análise, as notas ou as recomendações.</p></div> : <div className="empty-state-inline"><p>As devolutivas que você colar e salvar aparecerão aqui.</p></div>}</section>
    <div className="source-note-inline">Enemzeiros não converte percentuais de acerto em nota oficial nem promete resultado no exame.</div>
  </div>;
}
