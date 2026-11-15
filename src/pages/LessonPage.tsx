import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, CircleHelp, Lightbulb, RotateCcw } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { curriculumTopics, topicById } from '../data/curriculum';
import { getLesson } from '../data/lessons';
import { useProgress } from '../context/ProgressContext';

export function LessonPage() {
  const { topicId = '' } = useParams();
  const topic = topicById.get(topicId);
  const lesson = getLesson(topicId);
  const { progress, completeLesson, recordLessonVisit } = useProgress();
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (topic?.editorialStatus === 'published') void recordLessonVisit(topic.id, topic.lessonVersion).catch(() => undefined);
  }, [topic, recordLessonVisit]);
  if (!topic) return <Navigate to="/plano" replace />;
  if (topic.editorialStatus !== 'published' || !lesson) return <div className="pending-lesson panel"><span className="status-chip">CONTEÚDO EM PRODUÇÃO</span><h2>{topic.title}</h2><p>Esta unidade já está mapeada em <strong>{topic.moduleTitle}</strong>, mas a aula didática ainda não foi publicada.</p><p>Ela aparece na matriz de cobertura para manter o conteúdo original rastreável.</p><Link to="/plano" className="button button-secondary"><ArrowLeft size={16} /> Voltar ao plano</Link></div>;

  const lessonTopic = topic;

  const completed = progress[topicId]?.status === 'completed';
  const published = curriculumTopics.filter((item) => item.editorialStatus === 'published');
  const index = published.findIndex((item) => item.id === topicId);
  const previous = published[index - 1];
  const next = published[index + 1];
  const activeQuestion = lesson.quiz[0];

  async function toggleCompleted() {
    setSaving(true); setMessage('');
    try {
      await completeLesson(lessonTopic.id, lessonTopic.lessonVersion, !completed);
      setMessage(completed ? 'Aula marcada para revisão.' : 'Conclusão salva no seu progresso.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível salvar. Tente novamente.'); }
    finally { setSaving(false); }
  }

  return (
    <div className="lesson-page"><nav className="breadcrumbs" aria-label="Trilha de navegação"><Link to="/plano">Plano de estudos</Link><span>/</span><span>{topic.subject}</span><span>/</span><span aria-current="page">{topic.title}</span></nav>
      <article className="lesson-article"><header className="lesson-header"><span className="eyebrow">{topic.area} · {topic.subject}</span><h2>{lesson.title}</h2><div className="lesson-meta"><span>{topic.moduleTitle}</span><span className="priority-chip">{topic.priority}</span><span>Versão {topic.lessonVersion}</span></div><p className="lesson-objective"><strong>Objetivos:</strong> {lesson.objective.join(' ')}</p></header>
        <section className="lesson-block"><h3>Conceitos essenciais</h3><div className="concept-list">{lesson.concepts.map((concept) => <span key={concept}>{concept}</span>)}</div></section>
        {lesson.explanation.map((section) => <section className="lesson-block" key={section.heading}><h3>{section.heading}</h3>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}
        <section className="example-panel"><div className="example-heading"><span className="example-icon"><Lightbulb size={18} /></span><div><span className="eyebrow">EXEMPLO RESOLVIDO</span><h3>{lesson.workedExample.context}</h3></div></div><ol>{lesson.workedExample.steps.map((step) => <li key={step}>{step}</li>)}</ol><p className="example-conclusion">{lesson.workedExample.conclusion}</p></section>
        <section className="lesson-block enem-application"><span className="eyebrow">NO CONTEXTO DO ENEM</span><p>{lesson.enemApplication}</p></section>
        <section className="lesson-block"><h3>Erros comuns e como evitá-los</h3><div className="error-list">{lesson.commonErrors.map((item) => <div className="error-row" key={item.error}><strong>{item.error}</strong><span>{item.correction}</span></div>)}</div></section>
        <section className="lesson-block"><h3>Resumo</h3><ul className="summary-list">{lesson.summary.map((item) => <li key={item}>{item}</li>)}</ul></section>
        {activeQuestion && <section className="quiz-panel"><div className="quiz-heading"><CircleHelp size={19} /><div><span className="eyebrow">VERIFIQUE O APRENDIZADO</span><h3>Uma pergunta para fechar</h3></div></div><fieldset disabled={checked}><legend>{activeQuestion.prompt}</legend>{activeQuestion.options.map((option, optionIndex) => <label className={`quiz-option${checked && optionIndex === activeQuestion.answerIndex ? ' quiz-correct' : ''}${checked && choice === optionIndex && choice !== activeQuestion.answerIndex ? ' quiz-wrong' : ''}`} key={option}><input type="radio" name="lesson-quiz" checked={choice === optionIndex} onChange={() => setChoice(optionIndex)} /> <span>{option}</span></label>)}</fieldset>{!checked ? <button type="button" className="button button-secondary" disabled={choice === null} onClick={() => setChecked(true)}>Conferir resposta</button> : <div className={`quiz-feedback${choice === activeQuestion.answerIndex ? ' feedback-correct' : ' feedback-wrong'}`} role="status"><strong>{choice === activeQuestion.answerIndex ? 'Resposta correta.' : 'Ainda não. Veja o raciocínio:'}</strong><p>{activeQuestion.explanation}</p><button type="button" className="text-button" onClick={() => { setChecked(false); setChoice(null); }}>Tentar novamente</button></div>}</section>}
        {lesson.references.length > 0 && <section className="lesson-references"><h3>Para consultar</h3>{lesson.references.map((reference) => <a href={reference.url} target="_blank" rel="noreferrer" key={reference.url}>{reference.label} <ArrowRight size={14} /></a>)}</section>}
        <div className="lesson-completion"><button className={`button ${completed ? 'button-secondary' : 'button-primary'}`} type="button" onClick={() => void toggleCompleted()} disabled={saving}>{saving ? 'Salvando…' : completed ? <><RotateCcw size={16} /> Marcar para revisar</> : <><CheckCircle2 size={16} /> Marcar como concluída</>}</button>{message && <p role="status" className="form-message">{message}</p>}</div>
        <nav className="lesson-pagination" aria-label="Navegar entre aulas">{previous ? <Link to={`/aula/${previous.id}`}><ArrowLeft size={16} /><span><small>AULA ANTERIOR</small><strong>{previous.title}</strong></span></Link> : <span />}{next ? <Link to={`/aula/${next.id}`} className="lesson-next"><span><small>PRÓXIMA AULA</small><strong>{next.title}</strong></span><ArrowRight size={16} /></Link> : <span className="lesson-next-disabled"><CircleHelp size={15} /> Outras aulas serão publicadas por etapas.</span>}</nav>
      </article>
    </div>
  );
}
