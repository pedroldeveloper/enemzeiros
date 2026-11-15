import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Bookmark, Check, CircleHelp, Download, ExternalLink, RefreshCw } from 'lucide-react';
import { questions, type PracticeQuestion } from '../data/questions';
import { downloadHistoricalQuestionBank, getCachedQuestionBank, type QuestionBankProgress } from '../services/questionService';
import { useProgress } from '../context/ProgressContext';

function sourceLabel(question: PracticeQuestion) {
  if (question.source === 'official_reference') return 'Questão de prova · ENEM ' + (question.examYear ?? 'acervo');
  if (question.source === 'ai_generated') return 'Questão gerada em uma versão anterior';
  return 'Questão autoral de treino do Enemzeiros';
}

export function PracticePage() {
  const { attempts, saveAttempt, favoriteAttempt, loading } = useProgress();
  const [officialQuestions, setOfficialQuestions] = useState<PracticeQuestion[]>([]);
  const [cacheLoading, setCacheLoading] = useState(true);
  const [downloadingBank, setDownloadingBank] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<QuestionBankProgress | null>(null);
  const [bankError, setBankError] = useState('');
  const [bankNotice, setBankNotice] = useState('');
  const [subject, setSubject] = useState('Todas as áreas');
  const [year, setYear] = useState('todos');
  const [mode, setMode] = useState<'all' | 'wrong' | 'favorites'>('all');
  const [seen, setSeen] = useState<string[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [choice, setChoice] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [favoriteAttemptId, setFavoriteAttemptId] = useState<string | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [message, setMessage] = useState('');
  const [messageError, setMessageError] = useState(false);
  const [sessionStartedAt, setSessionStartedAt] = useState(Date.now());

  useEffect(() => {
    let active = true;
    void getCachedQuestionBank()
      .then((cached) => { if (active) setOfficialQuestions(cached); })
      .catch((error) => { if (active) setBankError(error instanceof Error ? error.message : 'Não foi possível ler o banco salvo.'); })
      .finally(() => { if (active) setCacheLoading(false); });
    return () => { active = false; };
  }, []);

  const fullPool = useMemo(() => [...questions, ...officialQuestions], [officialQuestions]);
  const subjects = useMemo(() => [...new Set(fullPool.map((question) => question.subject))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [fullPool]);
  const years = useMemo(() => [...new Set(officialQuestions.map((question) => question.examYear).filter((item): item is number => typeof item === 'number'))].sort((a, b) => b - a), [officialQuestions]);
  const wrongQuestions = attempts.filter((attempt) => !attempt.correct && attempt.questionSnapshot).map((attempt) => attempt.questionSnapshot!);
  const favoriteIds = new Set(attempts.filter((attempt) => attempt.favorite).map((attempt) => attempt.questionId));
  const basePool = mode === 'wrong'
    ? wrongQuestions
    : mode === 'favorites'
      ? fullPool.filter((question) => favoriteIds.has(question.id))
      : fullPool;
  const availableQuestions = basePool.filter((question) =>
    (subject === 'Todas as áreas' || question.subject === subject)
    && (year === 'todos' || question.examYear === Number(year)));
  const current = availableQuestions.find((question) => question.id === currentId) ?? availableQuestions[0];
  const attemptCount = attempts.filter((attempt) => attempt.questionId === current?.id).length;
  const alreadyFavorite = favoriteAttemptId ? attempts.find((item) => item.id === favoriteAttemptId)?.favorite ?? favorited : favorited;

  useEffect(() => {
    setCurrentId(null);
    setChoice(null);
    setSubmitted(false);
    setSeen([]);
    setMessage('');
    setMessageError(false);
  }, [subject, year, mode]);

  async function downloadBank() {
    setDownloadingBank(true);
    setBankError('');
    setBankNotice('');
    setDownloadProgress(null);
    try {
      const downloaded = await downloadHistoricalQuestionBank((progress) => setDownloadProgress(progress));
      setOfficialQuestions(downloaded);
      setBankNotice(downloaded.length.toLocaleString('pt-BR') + ' questões do acervo estão guardadas neste navegador.');
    } catch (error) {
      try { setOfficialQuestions(await getCachedQuestionBank()); } catch { /* A mensagem principal explica a falha. */ }
      setBankError(error instanceof Error ? error.message : 'Não foi possível baixar o acervo agora.');
    } finally {
      setDownloadingBank(false);
    }
  }

  async function confirmAnswer() {
    if (!current || choice === null || submitted) return;
    setSubmitted(true);
    setSaving(true);
    setMessage('');
    setMessageError(false);
    setFavoriteAttemptId(null);
    setFavorited(false);
    try {
      const id = await saveAttempt(current, choice, Math.floor((Date.now() - sessionStartedAt) / 1000));
      setFavoriteAttemptId(id);
      setSeen((previous) => previous.includes(current.id) ? previous : [...previous, current.id]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'A tentativa não foi salva. Verifique a conexão e tente novamente.');
      setMessageError(true);
    } finally {
      setSaving(false);
    }
  }

  function nextQuestion() {
    if (!current) return;
    const next = availableQuestions.find((question) => !seen.includes(question.id) && question.id !== current.id);
    const selected = next ?? availableQuestions.find((question) => question.id !== current.id) ?? current;
    if (!next) setMessage('Você completou uma rodada. Começamos outra sem repetir a questão anterior.');
    else setMessage('');
    setMessageError(false);
    setSeen((previous) => next ? previous : []);
    setCurrentId(selected.id);
    setChoice(null);
    setSubmitted(false);
    setFavoriteAttemptId(null);
    setFavorited(false);
    setSessionStartedAt(Date.now());
  }

  async function toggleFavorite() {
    if (!favoriteAttemptId) return;
    try {
      await favoriteAttempt(favoriteAttemptId, !alreadyFavorite);
      setFavorited(!alreadyFavorite);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível salvar o favorito.');
      setMessageError(true);
    }
  }

  if (loading || cacheLoading) return <div className="loading-state">Carregando seu acervo…</div>;

  return (
    <div className="practice-page">
      <section className="page-intro">
        <span className="eyebrow">BANCO DE QUESTÕES</span>
        <h2>Pratique com provas antigas.</h2>
        <p>O acervo comunitário reúne mais de 2.700 questões do ENEM de 2009 a 2023. Baixe uma vez para guardar o texto e os gabaritos neste navegador.</p>
      </section>

      <section className="question-bank-download panel">
        <div className="question-bank-download-copy">
          <span className="small-icon"><BookOpen size={18} /></span>
          <div>
            <strong>{officialQuestions.length ? officialQuestions.length.toLocaleString('pt-BR') + ' questões neste navegador' : 'Banco de provas do ENEM · 2009–2023'}</strong>
            <p>Enunciados, alternativas e gabaritos. Algumas imagens ainda precisam de internet.</p>
          </div>
        </div>
        <button type="button" className="button button-secondary" onClick={() => void downloadBank()} disabled={downloadingBank}>
          {downloadingBank ? <><RefreshCw size={16} className="spin" /> Baixando acervo…</> : <><Download size={16} /> {officialQuestions.length ? 'Atualizar banco' : 'Baixar banco completo'}</>}
        </button>
        {downloadProgress && downloadingBank && <div className="question-bank-progress" role="status">
          <progress max={downloadProgress.totalYears} value={downloadProgress.completedYears} />
          <small>{downloadProgress.completedYears} de {downloadProgress.totalYears} provas · {downloadProgress.questionCount.toLocaleString('pt-BR')} questões · ano {downloadProgress.year}</small>
        </div>}
        {bankError && <p className="form-message form-error" role="alert">{bankError}</p>}
        {bankNotice && <p className="form-message form-success" role="status">{bankNotice}</p>}
        <p className="question-bank-attribution">
          Dados organizados pela comunidade <a href="https://api.enem.dev/" target="_blank" rel="noreferrer">API ENEM</a>, sem vínculo com o INEP. Provas mais recentes e fontes oficiais: <a href="https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos" target="_blank" rel="noreferrer">arquivo de provas e gabaritos do INEP</a>.
        </p>
      </section>

      <div className="practice-controls">
        <label><span>Área</span><select value={subject} onChange={(event) => setSubject(event.target.value)}><option>Todas as áreas</option>{subjects.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>Ano</span><select value={year} onChange={(event) => setYear(event.target.value)}><option value="todos">Todos os anos</option>{years.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label><span>Lista</span><select value={mode} onChange={(event) => setMode(event.target.value as typeof mode)}><option value="all">Todas as questões</option><option value="wrong">Refazer questões erradas ({wrongQuestions.length})</option><option value="favorites">Favoritas</option></select></label>
        <div className="practice-source-count"><span>{availableQuestions.length.toLocaleString('pt-BR')} questões neste filtro</span><small>Confira os gabaritos pelo arquivo do INEP.</small></div>
      </div>

      {current ? (
        <article className="question-panel panel">
          <div className="question-topline">
            <span className="question-subject">{current.subject} <span>·</span> {current.difficulty}</span>
            <span className="source-chip">{sourceLabel(current)}</span>
          </div>
          {current.examYear && <p className="question-exam-reference">ENEM {current.examYear} · Questão {current.questionNumber}</p>}
          <div className="question-prompt">{current.prompt}</div>
          {current.imageUrls?.map((url) => <img className="official-question-image" key={url} src={url} alt="Imagem de apoio da questão do ENEM" loading="lazy" />)}
          <fieldset className="question-options" disabled={submitted}>
            <legend className="sr-only">Escolha uma alternativa</legend>
            {current.options.map((option, index) => (
              <label key={current.id + '-' + index} className={'question-option' + (submitted && index === current.answerIndex ? ' option-correct' : '') + (submitted && choice === index && choice !== current.answerIndex ? ' option-wrong' : '')}>
                <input type="radio" name={'question-' + current.id} checked={choice === index} onChange={() => setChoice(index)} />
                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                <span className="question-option-copy">{option}{current.optionImages?.[index] && <img className="official-option-image" src={current.optionImages[index] ?? ''} alt={'Imagem da alternativa ' + String.fromCharCode(65 + index)} loading="lazy" />}</span>
                {submitted && index === current.answerIndex && <Check size={17} />}
              </label>
            ))}
          </fieldset>
          {!submitted ? (
            <button type="button" className="button button-primary" disabled={choice === null} onClick={() => void confirmAnswer()}>
              {saving ? 'Salvando tentativa…' : 'Confirmar resposta'}
            </button>
          ) : (
            <div className={'answer-feedback' + (choice === current.answerIndex ? ' answer-correct' : ' answer-wrong')}>
              <div className="answer-result"><strong>{choice === current.answerIndex ? 'Resposta correta.' : 'Resposta incorreta.'}</strong><span>Gabarito do acervo: {String.fromCharCode(65 + current.answerIndex)}</span>{saving && <small>Salvando sua tentativa…</small>}</div>
              <div className="answer-explanation"><strong>{current.explanation ? 'Resolução' : 'Sobre o gabarito'}</strong><p>{current.explanation || 'O acervo informa a alternativa correta, mas não inclui uma resolução comentada para esta questão.'}</p></div>
              {current.distractorNotes.length > 0 && <div className="distractor-explanations"><strong>Alternativas</strong>{current.options.map((option, index) => <p key={current.id + '-note-' + index}><b>{String.fromCharCode(65 + index)}.</b> {current.distractorNotes[index] ?? ''}</p>)}</div>}
              <div className="answer-actions">
                {favoriteAttemptId && <button type="button" className={'button button-secondary' + (alreadyFavorite ? ' button-saved' : '')} onClick={() => void toggleFavorite()}><Bookmark size={16} fill={alreadyFavorite ? 'currentColor' : 'none'} />{alreadyFavorite ? 'Favoritada' : 'Favoritar questão'}</button>}
                {current.sourceUrl && <a className="button button-secondary" href={current.sourceUrl} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Ver no INEP</a>}
                <button type="button" className="button button-primary" onClick={nextQuestion}>Próxima questão <ArrowRight size={16} /></button>
              </div>
            </div>
          )}
          {message && <p className={'form-message' + (messageError ? ' form-error' : ' form-success')} role="status">{message}</p>}
          <span className="practice-attempt-count">{attemptCount ? attemptCount + ' tentativa' + (attemptCount === 1 ? '' : 's') + ' nesta questão' : ''}</span>
        </article>
      ) : (
        <div className="empty-state panel">
          <CircleHelp size={22} />
          <h3>Nenhuma questão neste filtro</h3>
          <p>{mode === 'wrong' ? 'Suas questões erradas aparecerão aqui depois das primeiras tentativas.' : mode === 'favorites' ? 'Favorite uma questão para encontrá-la nesta lista.' : officialQuestions.length ? 'Este filtro não tem questões no banco.' : 'Baixe o banco de provas anteriores para começar a praticar.'}</p>
          {mode !== 'all' && <button type="button" className="button button-secondary" onClick={() => setMode('all')}>Voltar ao acervo <ArrowRight size={15} /></button>}
        </div>
      )}

      <aside className="practice-footer-note"><BookOpen size={16} /><span>A resposta é comparada com o gabarito que acompanha o acervo. Use o link do INEP para conferir a prova e o gabarito original; nem todas as questões têm resolução comentada.</span></aside>
    </div>
  );
}
