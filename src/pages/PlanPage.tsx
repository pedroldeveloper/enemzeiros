import { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, Circle, Search, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { curriculum, curriculumTopics, publishedTopics } from '../data/curriculum';
import { useProgress } from '../context/ProgressContext';
import { ProgressBar } from '../components/ProgressBar';

type StatusFilter = 'all' | 'published' | 'pending' | 'completed';

export function PlanPage() {
  const { progress } = useProgress();
  const [search, setSearch] = useState('');
  const [area, setArea] = useState('Todas as áreas');
  const [subject, setSubject] = useState('Todas as disciplinas');
  const [priority, setPriority] = useState('Todas as prioridades');
  const [status, setStatus] = useState<StatusFilter>('all');
  const areas = [...new Set(curriculumTopics.map((topic) => topic.area))];
  const subjects = [...new Set(curriculumTopics.filter((topic) => area === 'Todas as áreas' || topic.area === area).map((topic) => topic.subject))];
  const priorities = [...new Set(curriculumTopics.map((topic) => topic.priority))];
  const filtered = useMemo(() => curriculumTopics.filter((topic) => {
    const isCompleted = progress[topic.id]?.status === 'completed';
    const isPublished = topic.editorialStatus === 'published';
    const query = search.trim().toLocaleLowerCase('pt-BR');
    return (!query || `${topic.title} ${topic.subject} ${topic.moduleTitle}`.toLocaleLowerCase('pt-BR').includes(query))
      && (area === 'Todas as áreas' || topic.area === area)
      && (subject === 'Todas as disciplinas' || topic.subject === subject)
      && (priority === 'Todas as prioridades' || topic.priority === priority)
      && (status === 'all' || status === 'completed' ? status === 'all' || isCompleted : status === 'published' ? isPublished : !isPublished);
  }), [area, subject, priority, search, status, progress]);

  const published = publishedTopics();
  const completedPublished = published.filter((topic) => progress[topic.id]?.status === 'completed').length;
  const pendingCount = curriculum.topicCount - published.length;
  const grouped = new Map<string, typeof filtered>();
  filtered.forEach((topic) => grouped.set(topic.subject, [...(grouped.get(topic.subject) ?? []), topic]));

  return (
    <div className="plan-page">
      <section className="page-intro"><span className="eyebrow">CURRÍCULO DE ESTUDOS</span><h2>Um mapa de conteúdos, em etapas.</h2><p>Cada tópico mantém o nome e a origem do seu plano. As prioridades são estimativas pedagógicas; não representam uma contagem de incidência nas provas.</p></section>
      <section className="curriculum-progress-panel panel"><div><span className="eyebrow">ESTADO DO CURRÍCULO</span><strong>{published.length} aulas publicadas <span>de {curriculum.topicCount} tópicos mapeados</span></strong><small>{pendingCount} tópicos ainda não têm aula publicada. A Prática Infinita permanece bloqueada.</small></div><div className="curriculum-progress-number"><span>{Math.round(published.length / curriculum.topicCount * 100)}%</span><small>com aula publicada</small></div><ProgressBar value={published.length / curriculum.topicCount * 100} label="Percentual de tópicos com aula publicada" /></section>
      <div className="plan-stats"><span><BookOpen size={16} /> {curriculum.topicCount} tópicos rastreáveis</span><span><CheckCircle2 size={16} /> {completedPublished} aulas concluídas</span><span><Circle size={15} /> {pendingCount} pendentes</span></div>
      <section className="filter-bar" aria-label="Filtros do plano"><label className="search-field"><Search size={17} /><input aria-label="Buscar no plano" placeholder="Buscar tópico, disciplina ou módulo" value={search} onChange={(event) => setSearch(event.target.value)} /></label><label><span>Área</span><select value={area} onChange={(event) => { setArea(event.target.value); setSubject('Todas as disciplinas'); }}><option>Todas as áreas</option>{areas.map((item) => <option key={item}>{item}</option>)}</select></label><label><span>Disciplina</span><select value={subject} onChange={(event) => setSubject(event.target.value)}><option>Todas as disciplinas</option>{subjects.map((item) => <option key={item}>{item}</option>)}</select></label><label><span>Prioridade</span><select value={priority} onChange={(event) => setPriority(event.target.value)}><option>Todas as prioridades</option>{priorities.map((item) => <option key={item}>{item}</option>)}</select></label><label><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)}><option value="all">Todos</option><option value="published">Com aula publicada</option><option value="completed">Concluídas</option><option value="pending">Em produção</option></select></label></section>
      <div className="result-count"><SlidersHorizontal size={15} /> {filtered.length} {filtered.length === 1 ? 'tópico' : 'tópicos'} neste recorte</div>
      <div className="curriculum-list">{Array.from(grouped.entries()).map(([subjectName, topics]) => <section className="subject-section" key={subjectName}><div className="subject-section-header"><div><span className="eyebrow">{topics[0]?.area}</span><h3>{subjectName}</h3></div><span className="subject-count">{topics.length} tópicos</span></div><div className="topic-list">{topics.map((topic) => {
        const completed = progress[topic.id]?.status === 'completed';
        return <article className={`topic-row${completed ? ' topic-completed' : ''}`} key={topic.id}><span className={`topic-status ${completed ? 'status-done' : topic.editorialStatus === 'published' ? 'status-open' : 'status-pending'}`}>{completed ? <CheckCircle2 size={18} /> : topic.editorialStatus === 'published' ? <BookOpen size={18} /> : <Circle size={17} />}</span><div className="topic-main"><div className="topic-title-row"><h4>{topic.title}</h4>{completed && <span className="topic-done-label">Concluída</span>}</div><p>{topic.moduleTitle} <span>·</span> <span className="priority-label">{topic.priority}</span></p>{topic.prerequisites.length > 0 && <small className="prerequisite-note">Pré-requisito: {topic.prerequisites.map((id) => curriculumTopics.find((item) => item.id === id)?.title ?? id).join(', ')}</small>}</div><span className={`editorial-badge ${topic.editorialStatus === 'published' ? 'badge-published' : 'badge-pending'}`}>{topic.editorialStatus === 'published' ? 'Aula disponível' : 'Em produção'}</span>{topic.editorialStatus === 'published' ? <Link className="topic-action" to={`/aula/${topic.id}`} aria-label={`Abrir aula ${topic.title}`}><ArrowRight size={17} /></Link> : <span className="topic-action topic-action-muted" aria-hidden="true">—</span>}</article>;
      })}</div></section>)}</div>
      {filtered.length === 0 && <div className="empty-state panel"><Search size={22} /><h3>Nenhum tópico encontrado</h3><p>Experimente outra busca ou remova algum filtro.</p></div>}
      <p className="method-note">As classes de prioridade seguem o formato do plano original e foram propostas pelo Enemzeiros com base em pré-requisitos, possibilidade de transferência e alinhamento geral à Matriz do INEP 2026. Para cada tópico, a matriz indica status e linha de origem.</p>
    </div>
  );
}
