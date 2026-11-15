import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, Copy, FileText, Save, ShieldCheck, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { buildCorrectionPrompt } from '../services/essayPrompt';

const PENDING_DRAFT_KEY = 'enemzeiros-redacao-pendente';
type PendingEssayDraft = {
  title: string; theme: string; text: string; prompt: string;
  promptSource: { theme: string; text: string } | null; feedbackText: string;
  essayId: string | null; stage: 'submission' | 'feedback';
};

function readPendingDraft(): PendingEssayDraft | null {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(PENDING_DRAFT_KEY) ?? 'null') as Partial<PendingEssayDraft> | null;
    if (!parsed || typeof parsed.title !== 'string' || typeof parsed.theme !== 'string' || typeof parsed.text !== 'string'
      || typeof parsed.prompt !== 'string' || typeof parsed.feedbackText !== 'string') return null;
    return {
      title: parsed.title.slice(0, 120), theme: parsed.theme.slice(0, 500), text: parsed.text.slice(0, 12_000),
      prompt: parsed.prompt.slice(0, 30_000), feedbackText: parsed.feedbackText.slice(0, 24_000),
      promptSource: parsed.promptSource && typeof parsed.promptSource.theme === 'string' && typeof parsed.promptSource.text === 'string'
        ? { theme: parsed.promptSource.theme.slice(0, 500), text: parsed.promptSource.text.slice(0, 12_000) } : null,
      essayId: typeof parsed.essayId === 'string' ? parsed.essayId.slice(0, 100) : null,
      stage: parsed.stage === 'feedback' || parsed.prompt ? 'feedback' : 'submission',
    };
  } catch {
    return null;
  }
}

const competencies = [
  { key: 'C1', short: 'Modalidade escrita formal', checklist: ['Revisei ortografia e acentuação.', 'Conferi pontuação, concordância e regência.', 'Evitei construções que dificultam a leitura.'] },
  { key: 'C2', short: 'Tema, tipo textual e repertório', checklist: ['Respondi ao recorte completo do tema.', 'Mantive o texto dissertativo-argumentativo.', 'Relacionei repertórios ao raciocínio.'] },
  { key: 'C3', short: 'Projeto e defesa de argumentos', checklist: ['A tese está clara.', 'Cada parágrafo desenvolve uma ideia.', 'As evidências sustentam minha posição.'] },
  { key: 'C4', short: 'Coesão e relações entre ideias', checklist: ['Os conectivos expressam a relação pretendida.', 'As referências entre frases estão claras.', 'Evitei repetição mecânica e quebras de progressão.'] },
  { key: 'C5', short: 'Proposta de intervenção', checklist: ['A ação responde ao problema discutido.', 'Identifiquei agente, ação, meio, finalidade e detalhamento.', 'A proposta respeita os direitos humanos.'] },
];

export function EssayPage() {
  const { user } = useAuth();
  const { essays, saveEssay, saveEssayFeedback, deleteEssay } = useProgress();
  const [initialDraft] = useState(readPendingDraft);
  const [title, setTitle] = useState(initialDraft?.title ?? '');
  const [theme, setTheme] = useState(initialDraft?.theme ?? '');
  const [text, setText] = useState(initialDraft?.text ?? '');
  const [essayId, setEssayId] = useState<string | null>(initialDraft?.essayId ?? null);
  const [submitted, setSubmitted] = useState(Boolean(initialDraft?.essayId && initialDraft.prompt));
  const [prompt, setPrompt] = useState(initialDraft?.prompt ?? '');
  const [promptSource, setPromptSource] = useState<{ theme: string; text: string } | null>(initialDraft?.promptSource ?? null);
  const [feedbackText, setFeedbackText] = useState(initialDraft?.feedbackText ?? '');
  const [manualChecklist, setManualChecklist] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [copyState, setCopyState] = useState('');
  const [savingEssay, setSavingEssay] = useState(false);
  const [saved, setSaved] = useState(false);
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const words = useMemo(() => text.trim() ? text.trim().split(/\s+/).length : 0, [text]);
  const estimatedLines = useMemo(() => text.trim() ? Math.ceil(text.trim().length / 65) : 0, [text]);
  const selectedHistory = essays.find((essay) => essay.id === selectedHistoryId);
  const promptMatchesDraft = Boolean(prompt && promptSource?.theme === theme.trim() && promptSource.text === text.trim());
  const canSave = Boolean(user && essayId && submitted && promptMatchesDraft && feedbackText.trim().length >= 20 && !saved);

  function preserveDraftForSignIn(stage: 'submission' | 'feedback') {
    const nextEssayId = essayId ?? crypto.randomUUID();
    setEssayId(nextEssayId);
    sessionStorage.setItem(PENDING_DRAFT_KEY, JSON.stringify({ title, theme, text, prompt, promptSource, feedbackText, essayId: nextEssayId, stage }));
  }

  function startNewVersion() {
    if (!essayId) return;
    sessionStorage.removeItem(PENDING_DRAFT_KEY);
    setEssayId(null);
    setSubmitted(false);
    setNeedsSignIn(false);
    setPrompt('');
    setPromptSource(null);
    setFeedbackText('');
    setSaved(false);
    setNotice('Você editou uma versão salva. Ao enviar, ela será registrada como uma nova versão.');
  }

  async function submitEssay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    let nextPrompt: string;
    try {
      nextPrompt = buildCorrectionPrompt(theme, text);
    } catch (promptError) {
      setError(promptError instanceof Error ? promptError.message : 'Não foi possível montar o prompt.');
      return;
    }
    if (!user) {
      preserveDraftForSignIn('submission');
      setNeedsSignIn(true);
      setNotice('Entre ou crie uma conta para salvar sua redação e liberar o prompt. O texto ficará nesta aba durante o login.');
      return;
    }

    setSavingEssay(true);
    try {
      const id = await saveEssay(title, theme.trim(), text.trim(), '', essayId ?? undefined);
      setEssayId(id);
      setSubmitted(true);
      setPrompt(nextPrompt);
      setPromptSource({ theme: theme.trim(), text: text.trim() });
      setFeedbackText('');
      setCopyState('');
      setSaved(false);
      setNeedsSignIn(false);
      sessionStorage.removeItem(PENDING_DRAFT_KEY);
      setNotice('Redação salva. Agora copie o prompt e cole na IA que você preferir.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Não foi possível salvar a redação.');
    } finally {
      setSavingEssay(false);
    }
  }

  useEffect(() => {
    const draft = initialDraft;
    if (!user || !draft) return;
    const { essayId: draftEssayId, stage, feedbackText: draftFeedbackText, prompt: draftPrompt, theme: draftTheme, text: draftText, title: draftTitle } = draft;
    if (!draftEssayId) return;
    const savedEssayId: string = draftEssayId;
    let active = true;
    setSavingEssay(true);
    async function resumePendingSave() {
      try {
        if (stage === 'feedback') {
          if (draftFeedbackText.trim().length < 20) {
            if (active) setNotice('A redação já está salva. Cole uma devolutiva de pelo menos 20 caracteres para guardá-la.');
            return;
          }
          await saveEssayFeedback(savedEssayId, draftFeedbackText.trim());
          if (!active) return;
          setNotice('Devolutiva salva no histórico.');
        } else {
          const nextPrompt = draftPrompt || buildCorrectionPrompt(draftTheme, draftText);
          const id = await saveEssay(draftTitle, draftTheme, draftText, '', savedEssayId);
          if (!active) return;
          setEssayId(id);
          setSubmitted(true);
          setPrompt(nextPrompt);
          setPromptSource({ theme: draftTheme.trim(), text: draftText.trim() });
          setNotice('Redação salva. Agora copie o prompt e cole na IA que você preferir.');
        }
        sessionStorage.removeItem(PENDING_DRAFT_KEY);
      } catch (resumeError) {
        if (active) setError(resumeError instanceof Error ? resumeError.message : 'Não foi possível salvar a redação.');
      } finally {
        if (active) setSavingEssay(false);
      }
    }
    void resumePendingSave();
    return () => { active = false; };
  }, [user, initialDraft, saveEssay, saveEssayFeedback]);

  async function copyPrompt() {
    if (!promptMatchesDraft) return;
    setError('');
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyState('Prompt copiado. Cole na IA que você escolher.');
    } catch {
      setCopyState('Não foi possível copiar automaticamente. Selecione o texto do prompt e copie manualmente.');
    }
  }

  async function saveFeedback() {
    if (!user) {
      preserveDraftForSignIn('feedback');
      setNeedsSignIn(true);
      setError('Entre ou crie uma conta para guardar a devolutiva no histórico.');
      return;
    }
    if (!essayId || !promptMatchesDraft) {
      setError('Envie esta versão novamente antes de salvar uma devolutiva.');
      return;
    }
    if (feedbackText.trim().length < 20) {
      setError('Cole a resposta recebida da IA antes de salvar.');
      return;
    }
    setSavingEssay(true);
    setNotice('');
    setError('');
    try {
      await saveEssayFeedback(essayId, feedbackText.trim());
      sessionStorage.removeItem(PENDING_DRAFT_KEY);
      setSaved(true);
      setNotice('Devolutiva externa salva junto desta redação.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Não foi possível salvar esta versão.');
    } finally {
      setSavingEssay(false);
    }
  }

  function openHistoryEssay(essayIdToOpen: string) {
    const essay = essays.find((item) => item.id === essayIdToOpen);
    if (!essay) return;
    try {
      const nextPrompt = buildCorrectionPrompt(essay.theme, essay.text);
      setTitle(essay.title);
      setTheme(essay.theme);
      setText(essay.text);
      setEssayId(essay.id);
      setSubmitted(true);
      setPrompt(nextPrompt);
      setPromptSource({ theme: essay.theme.trim(), text: essay.text.trim() });
      setFeedbackText(essay.feedbackText);
      setSaved(Boolean(essay.feedbackText));
      setSelectedHistoryId(null);
      setError('');
      setNotice('Versão recuperada do histórico. Copie o prompt novamente se precisar.');
    } catch (historyError) {
      setError(historyError instanceof Error ? historyError.message : 'Não foi possível abrir esta redação.');
    }
  }

  async function removeEssay(essayId: string) {
    if (!window.confirm('Excluir esta redação e sua devolutiva do histórico? Essa ação não pode ser desfeita.')) return;
    setDeleting(true);
    setError('');
    try {
      await deleteEssay(essayId);
      setNotice('Redação excluída do seu histórico.');
      if (selectedHistoryId === essayId) setSelectedHistoryId(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Não foi possível excluir.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="essay-page">
      <section className="page-intro">
        <span className="eyebrow">REDAÇÃO</span>
        <h2>Escreva. Revise. Evolua.</h2>
        <p>Escreva e envie sua redação. Depois de salvá-la, copie o prompt pronto, peça a análise à IA que você preferir e cole a resposta aqui.</p>
      </section>
      <div className="essay-layout">
        <section className="panel essay-editor-panel">
          <div className="panel-heading">
            <div><span className="eyebrow">NOVA VERSÃO</span><h3>Seu texto</h3></div>
            <span className="small-icon"><FileText size={17} /></span>
          </div>
          <form onSubmit={(event) => void submitEssay(event)}>
            <label className="field">
              <span>Título desta versão <small>Opcional</small></span>
              <input maxLength={120} value={title} onChange={(event) => { startNewVersion(); setTitle(event.target.value); setSaved(false); }} placeholder="Ex.: primeira versão" />
            </label>
            <label className="field">
              <span>Tema da redação</span>
              <input required maxLength={500} value={theme} onChange={(event) => { startNewVersion(); setTheme(event.target.value); setSaved(false); }} placeholder="Escreva o tema e o recorte proposto" />
            </label>
            <label className="field essay-text-field">
              <span>Redação</span>
              <textarea required minLength={100} maxLength={12_000} rows={18} value={text} onChange={(event) => { startNewVersion(); setText(event.target.value); setSaved(false); }} placeholder="Escreva ou cole seu texto aqui. Evite inserir dados pessoais." />
              <div className="essay-counter"><span>{words} palavras · {text.length} caracteres</span><span>{estimatedLines} linhas aproximadas</span></div>
              <small className="field-hint">A estimativa de linhas não reproduz exatamente a folha manuscrita do exame.</small>
            </label>
            <div className="external-workflow-note">
              <ShieldCheck size={18} aria-hidden="true" />
              <div>
                <strong>A redação é salva antes do prompt</strong>
                <p>O texto fica no histórico da sua conta. O Enemzeiros não corrige a redação: você escolhe a IA, copia o prompt e cola a resposta recebida no campo de devolutiva.</p>
              </div>
            </div>
            {error && <p className="form-message form-error" role="alert"><AlertTriangle size={16} /> {error}</p>}
            {notice && <p className="form-message form-success" role="status">{notice}</p>}
            <div className="essay-submit-row">
              <button type="submit" className="button button-primary" disabled={text.trim().length < 100 || !theme.trim() || savingEssay || (submitted && Boolean(essayId))}>
                {savingEssay ? 'Salvando redação…' : submitted ? 'Salvar como nova versão' : 'Enviar redação e abrir prompt'} <ArrowRight size={16} />
              </button>
              <button type="button" className="text-button" onClick={() => setManualChecklist((current) => !current)}>
                {manualChecklist ? 'Ocultar checklist' : 'Revisar com checklist'}
              </button>
            </div>
            {needsSignIn && !user && <div className="external-login-note"><p>Para salvar e abrir o prompt, entre ou crie uma conta. Sua redação fica guardada temporariamente nesta aba durante o login.</p><div className="essay-submit-row"><Link className="button button-primary" to="/entrar" state={{ from: '/redacao' }}>Entrar para continuar</Link><Link className="button button-secondary" to="/criar-conta" state={{ from: '/redacao' }}>Criar conta</Link></div></div>}
          </form>
          {manualChecklist && (
            <section className="manual-checklist">
              <div className="checklist-heading"><CheckCircle2 size={18} /><div><strong>Autoavaliação guiada</strong><p>Marque o que você revisou em cada competência. Esta checklist não gera nota.</p></div></div>
              {competencies.map((item) => (
                <fieldset key={item.key}>
                  <legend><span>{item.key}</span>{item.short}</legend>
                  {item.checklist.map((question, index) => {
                    const id = `${item.key}-${index}`;
                    return <label key={id} className="checkbox-label"><input type="checkbox" checked={Boolean(checked[id])} onChange={(event) => setChecked((current) => ({ ...current, [id]: event.target.checked }))} /><span>{question}</span></label>;
                  })}
                </fieldset>
              ))}
            </section>
          )}
        </section>

        <aside className="essay-side-column">
          <section className="panel essay-guidance">
            <span className="eyebrow">CRITÉRIOS DO ENEM</span>
            <h3>As cinco competências</h3>
            <ol>{competencies.map((item) => <li key={item.key}><span>{item.key}</span><div><strong>{item.short}</strong><small>A IA que você escolher receberá estes critérios no prompt.</small></div></li>)}</ol>
            <p>A plataforma não atribui nota nem verifica se a resposta da IA está correta.</p>
          </section>
          <section className="panel essay-history">
            <div className="panel-heading"><div><span className="eyebrow">SEU HISTÓRICO</span><h3>Versões salvas</h3></div><span className="history-count">{essays.length}</span></div>
            {essays.length ? (
              <div className="essay-history-list">
                {essays.map((essay) => (
                  <div className="essay-history-item" key={essay.id}>
                    <button type="button" aria-expanded={selectedHistoryId === essay.id} onClick={() => setSelectedHistoryId(selectedHistoryId === essay.id ? null : essay.id)}>
                      <span><strong>{essay.title || 'Minha redação'}</strong><small>{essay.createdAt?.toLocaleDateString('pt-BR') || 'Data não disponível'} · {essay.theme}</small></span>
                      <ArrowRight size={15} />
                    </button>
                    <button type="button" className="icon-button delete-essay" onClick={() => void removeEssay(essay.id)} disabled={deleting} aria-label={`Excluir ${essay.title || 'redação'}`} title="Excluir do histórico"><Trash2 size={15} /></button>
                  </div>
                ))}
              </div>
            ) : <p className="muted">Nada salvo ainda. Envie sua primeira redação para guardá-la e preparar o prompt.</p>}
            {selectedHistory && (
              <div className="history-preview">
                <strong>{selectedHistory.theme}</strong>
                <p>{selectedHistory.text.slice(0, 300)}{selectedHistory.text.length > 300 ? '…' : ''}</p>
                <button type="button" className="button button-secondary" onClick={() => openHistoryEssay(selectedHistory.id)}>Reabrir texto e preparar prompt</button>
                <h4>Devolutiva colada</h4>
                {selectedHistory.feedbackText ? <pre className="external-feedback-content">{selectedHistory.feedbackText}</pre> : <p className="muted">Ainda não há resposta da IA nesta versão.</p>}
              </div>
            )}
          </section>
        </aside>
      </div>

      {submitted && prompt && (
        <section className="panel external-prompt-panel">
          <div className="panel-heading"><div><span className="eyebrow">ETAPA 1</span><h3>Copie o prompt para a IA que você usa</h3></div></div>
          {!promptMatchesDraft && <p className="form-message form-error" role="status">O texto ou o tema foi alterado. Envie esta nova versão para atualizar o prompt.</p>}
          <label className="field"><span>Prompt completo, incluindo o seu texto</span><textarea readOnly rows={16} value={prompt} onFocus={(event) => event.currentTarget.select()} /></label>
          <div className="essay-submit-row"><button type="button" className="button button-secondary" onClick={() => void copyPrompt()} disabled={!promptMatchesDraft}><Copy size={16} /> Copiar prompt</button>{copyState && <span className="field-hint" role="status">{copyState}</span>}</div>
          <div className="external-response-panel">
            <div><span className="eyebrow">ETAPA 2</span><h3>Cole aqui a resposta que recebeu</h3><p>Revise a resposta antes de registrar. O Enemzeiros a guarda como texto enviado por você; não confirma se a análise ou as notas estão corretas.</p></div>
            <label className="field"><span>Resposta da IA externa</span><textarea maxLength={24_000} rows={12} value={feedbackText} onChange={(event) => { setFeedbackText(event.target.value); setSaved(false); }} placeholder="Depois de consultar a IA, cole a resposta completa aqui." /><small className="field-hint">{feedbackText.length.toLocaleString('pt-BR')} / 24.000 caracteres</small></label>
            {user ? <button type="button" className="button button-primary" onClick={() => void saveFeedback()} disabled={!canSave || savingEssay}><Save size={16} />{savingEssay ? 'Salvando…' : saved ? 'Devolutiva salva' : 'Salvar devolutiva'}</button> : <div className="external-login-note"><p>Entre ou crie uma conta para salvar a resposta junto desta redação.</p><div className="essay-submit-row"><Link className="button button-primary" to="/entrar" state={{ from: '/redacao' }} onClick={() => preserveDraftForSignIn('feedback')}>Entrar para salvar</Link><Link className="button button-secondary" to="/criar-conta" state={{ from: '/redacao' }} onClick={() => preserveDraftForSignIn('feedback')}>Criar conta</Link></div></div>}
          </div>
        </section>
      )}
    </div>
  );
}

