import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, Download, Save, ShieldCheck, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { useTheme, type ThemeChoice } from '../context/ThemeContext';
import { deleteAccountAndData, readUserSettings, reauthenticateUser, updateUserSettings } from '../services/authService';

export function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { progress, attempts, essays, totalStudySeconds } = useProgress();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user?.displayName ?? '');
  const [overallGoal, setOverallGoal] = useState('800');
  const [essayGoal, setEssayGoal] = useState('900');
  const [selectedTheme, setSelectedTheme] = useState<ThemeChoice>(theme);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    void readUserSettings(user.uid).then((profile) => {
      if (!active || !profile) return;
      setName(typeof profile.displayName === 'string' ? profile.displayName : user.displayName ?? '');
      setOverallGoal(String(profile.goals?.overall ?? 800));
      setEssayGoal(String(profile.goals?.essay ?? 900));
      const savedTheme = profile.preferences?.theme;
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') setSelectedTheme(savedTheme);
    }).catch(() => undefined);
    return () => { active = false; };
  }, [user]);

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage(''); setError('');
    const overall = Number(overallGoal); const essay = Number(essayGoal);
    if (!Number.isFinite(overall) || overall < 0 || overall > 1000 || !Number.isFinite(essay) || essay < 0 || essay > 1000) {
      setError('Informe metas entre 0 e 1.000 pontos.'); setSaving(false); return;
    }
    try {
      await updateUserSettings(user!.uid, { displayName: name.trim().slice(0, 60), overallGoal: overall, essayGoal: essay, theme: selectedTheme });
      setTheme(selectedTheme);
      setMessage('Preferências salvas na sua conta.');
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Não foi possível salvar as preferências.'); }
    finally { setSaving(false); }
  }

  function exportData() {
    const data = { product: 'Enemzeiros', exportedAt: new Date().toISOString(), profile: { displayName: name, email: user?.email, goals: { overall: Number(overallGoal), essay: Number(essayGoal) }, theme: selectedTheme }, lessonProgress: Object.values(progress), questionAttempts: attempts, essaySubmissions: essays, totalStudySeconds };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const anchor = document.createElement('a');
    anchor.href = url; anchor.download = 'enemzeiros-meus-dados.json'; anchor.click(); URL.revokeObjectURL(url);
  }

  async function deleteAccount() {
    if (!user || deleteConfirmation.trim().toUpperCase() !== 'EXCLUIR') { setError('Digite EXCLUIR para confirmar a ação.'); return; }
    setDeleting(true); setError('');
    try {
      await reauthenticateUser(user, deletePassword);
      await deleteAccountAndData(user);
      navigate('/', { replace: true });
    } catch (deleteError) {
      const code = deleteError && typeof deleteError === 'object' && 'code' in deleteError ? String(deleteError.code) : '';
      setError(code.includes('requires-recent-login') || code.includes('wrong-password') ? 'A senha não conferiu ou a sessão expirou. Entre novamente e tente de novo.' : deleteError instanceof Error ? deleteError.message : 'Não foi possível excluir a conta.');
    } finally { setDeleting(false); }
  }

  return <div className="settings-page"><section className="page-intro"><span className="eyebrow">SUA CONTA</span><h2>Preferências e privacidade.</h2><p>Use os dados mínimos necessários e altere suas metas quando precisar.</p></section>
    <form className="settings-grid" onSubmit={(event) => void saveSettings(event)}><section className="panel settings-panel"><div className="panel-heading"><div><span className="eyebrow">PERFIL</span><h3>Dados básicos</h3></div></div><label className="field"><span>Nome ou apelido</span><input maxLength={60} value={name} onChange={(event) => setName(event.target.value)} autoComplete="nickname" /></label><label className="field"><span>E-mail da conta</span><input value={user?.email ?? ''} readOnly /></label><p className="field-hint">O e-mail é gerenciado pelo Firebase Authentication. Não coletamos data de nascimento.</p></section>
      <section className="panel settings-panel"><div className="panel-heading"><div><span className="eyebrow">METAS PESSOAIS</span><h3>Seu planejamento</h3></div></div><label className="field"><span>Média geral desejada</span><div className="goal-input"><input type="number" min="0" max="1000" value={overallGoal} onChange={(event) => setOverallGoal(event.target.value)} /><span>pontos</span></div></label><label className="field"><span>Meta pessoal de redação</span><div className="goal-input"><input type="number" min="0" max="1000" value={essayGoal} onChange={(event) => setEssayGoal(event.target.value)} /><span>pontos</span></div></label><p className="field-hint">Metas de planejamento, não previsões nem promessas de nota ou aprovação.</p></section>
      <section className="panel settings-panel"><div className="panel-heading"><div><span className="eyebrow">APARÊNCIA</span><h3>Tema da plataforma</h3></div></div><label className="field"><span>Escolha uma opção</span><select value={selectedTheme} onChange={(event) => setSelectedTheme(event.target.value as ThemeChoice)}><option value="system">Usar preferência do dispositivo</option><option value="light">Claro</option><option value="dark">Escuro</option></select></label><div className="theme-preview"><span className="theme-preview-dot theme-preview-light" /><span className="theme-preview-dot theme-preview-dark" /><small>A escolha será salva na sua conta.</small></div></section>
      <section className="panel settings-panel privacy-settings"><div className="panel-heading"><div><span className="eyebrow">SEUS DADOS</span><h3>Acesso e privacidade</h3></div><ShieldCheck size={19} /></div><p>Seu progresso fica em coleções isoladas pelo identificador da sua conta. A plataforma monta o prompt no navegador; você escolhe se vai compartilhar o texto com uma IA externa. A devolutiva só é salva quando você pede.</p><button className="button button-secondary" type="button" onClick={exportData}><Download size={16} /> Baixar meus dados</button><Link to="/privacidade">Ler a política de privacidade em rascunho</Link></section>
      <div className="settings-actions">{message && <p className="form-message form-success" role="status">{message}</p>}{error && !deleteOpen && <p className="form-message form-error" role="alert">{error}</p>}<button type="submit" className="button button-primary" disabled={saving}>{saving ? 'Salvando…' : <><Save size={16} /> Salvar preferências</>}</button></div>
    </form>
    <section className="panel account-danger-zone"><div><span className="eyebrow">CONTROLE DA CONTA</span><h3>Excluir conta e dados</h3><p>A exclusão remove seu perfil, progresso, tentativas, redações e sessões salvas. Essa ação não pode ser desfeita. Uma nova autenticação pode ser exigida pelo Firebase.</p></div>{!deleteOpen ? <button type="button" className="button button-danger" onClick={() => { setDeleteOpen(true); setError(''); }}><Trash2 size={16} /> Excluir conta</button> : <div className="delete-confirm"><label className="field"><span>Senha da conta</span><input type="password" value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} autoComplete="current-password" /></label><label className="field"><span>Digite EXCLUIR para confirmar</span><input value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} autoComplete="off" /></label>{error && <p className="form-message form-error" role="alert"><AlertTriangle size={16} />{error}</p>}<div><button type="button" className="button button-quiet" onClick={() => { setDeleteOpen(false); setDeletePassword(''); setDeleteConfirmation(''); setError(''); }}>Cancelar</button><button type="button" className="button button-danger" onClick={() => void deleteAccount()} disabled={deleting || !deletePassword}>{deleting ? 'Excluindo…' : 'Confirmar exclusão'}</button></div></div>}</section>
  </div>;
}
