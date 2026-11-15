import { useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Mail, ShieldCheck } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Brand } from '../components/Brand';
import { ThemeSwitch } from '../components/ThemeSwitch';
import { useAuth } from '../context/AuthContext';

function authErrorMessage(error: unknown) {
  const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
  if (code.includes('email-already-in-use')) return 'Este e-mail já tem uma conta. Entre ou recupere a senha.';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) return 'E-mail ou senha não conferem.';
  if (code.includes('weak-password')) return 'Escolha uma senha mais forte, com pelo menos 8 caracteres.';
  if (code.includes('invalid-email')) return 'Confira o formato do e-mail.';
  if (code.includes('too-many-requests')) return 'Muitas tentativas. Aguarde um pouco e tente novamente.';
  if (code.includes('network-request-failed')) return 'Falha de conexão. Verifique a internet e tente novamente.';
  return error instanceof Error ? error.message : 'Não foi possível concluir agora. Tente novamente.';
}

function getReturnPath(state: unknown) {
  if (!state || typeof state !== 'object' || !('from' in state)) return '/painel';
  const from = (state as { from?: unknown }).from;
  if (typeof from === 'string') return from.startsWith('/') && !from.startsWith('//') ? from : '/painel';
  if (from && typeof from === 'object' && 'pathname' in from) {
    const path = (from as { pathname?: unknown; search?: unknown; hash?: unknown });
    if (typeof path.pathname === 'string' && path.pathname.startsWith('/') && !path.pathname.startsWith('//')) {
      return `${path.pathname}${typeof path.search === 'string' ? path.search : ''}${typeof path.hash === 'string' ? path.hash : ''}`;
    }
  }
  return '/painel';
}

export function AuthPage({ kind }: { kind: 'login' | 'register' | 'reset' }) {
  const { user, configured, login, register, sendReset } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  if (user) return <Navigate to={getReturnPath(location.state)} replace state={{ from: location }} />;

  const isRegister = kind === 'register';
  const isReset = kind === 'reset';
  const title = isRegister ? 'Crie seu espaço de estudo' : isReset ? 'Recuperar acesso' : 'Bem-vindo de volta';

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setSuccess('');
    if (!configured) { setError('Para usar contas, configure as variáveis do Firebase indicadas no .env.example.'); return; }
    if (isRegister && password.length < 8) { setError('A senha precisa ter pelo menos 8 caracteres.'); return; }
    setBusy(true);
    try {
      if (isReset) { await sendReset(email); setSuccess('Se houver uma conta com esse endereço, você receberá um e-mail com as instruções.'); }
      else if (isRegister) { await register(email, password, name); navigate(getReturnPath(location.state), { replace: true }); }
      else { await login(email, password); navigate(getReturnPath(location.state), { replace: true }); }
    } catch (submitError) { setError(authErrorMessage(submitError)); }
    finally { setBusy(false); }
  }

  return (
    <div className="auth-page">
      <header className="auth-header"><Brand /><ThemeSwitch /></header>
      <main className="auth-main"><div className="auth-art"><span className="eyebrow">ENEMZEIROS</span><h1>Um plano claro.<br /><em>Um passo por vez.</em></h1><p>Organize sua preparação e acompanhe o que já conquistou.</p><div className="auth-art-note"><ShieldCheck size={17} /> Seus dados pertencem à sua conta.</div></div>
        <section className="auth-card"><div className="auth-back"><Link to="/"><ArrowLeft size={16} /> Voltar ao início</Link></div><span className="eyebrow">{isRegister ? 'CRIE SUA CONTA' : isReset ? 'ACESSO À CONTA' : 'ACESSO À CONTA'}</span><h2>{title}</h2><p className="auth-card-intro">{isRegister ? 'Salve o seu progresso e retome o plano quando quiser.' : isReset ? 'Informe seu e-mail para receber instruções de recuperação.' : 'Entre para continuar sua preparação.'}</p>
          {!configured && <div className="notice notice-info auth-config-note"><Mail size={17} /><span>As contas reais ainda precisam da configuração do projeto Firebase. Consulte o arquivo FIREBASE_SETUP.md.</span></div>}
          <form onSubmit={(event) => void onSubmit(event)} noValidate>
            {isRegister && <label className="field"><span>Como podemos chamar você? <small>Opcional</small></span><input autoComplete="nickname" value={name} onChange={(event) => setName(event.target.value)} maxLength={60} placeholder="Seu nome ou apelido" /></label>}
            <label className="field"><span>E-mail</span><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" /></label>
            {!isReset && <label className="field"><span>Senha</span><div className="password-input"><input type={showPassword ? 'text' : 'password'} autoComplete={isRegister ? 'new-password' : 'current-password'} required value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} placeholder={isRegister ? 'Pelo menos 8 caracteres' : 'Sua senha'} /><button type="button" className="password-toggle" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>}
            {error && <p className="form-message form-error" role="alert">{error}</p>}{success && <p className="form-message form-success" role="status">{success}</p>}
            <button className="button button-primary button-full" type="submit" disabled={busy}>{busy ? 'Aguarde…' : isReset ? 'Enviar instruções' : isRegister ? 'Criar conta' : 'Entrar'} {!busy && <ArrowRight size={16} />}</button>
          </form>
          {kind === 'login' && <Link className="auth-inline-link" to="/recuperar-senha">Esqueci minha senha</Link>}
          {!isReset && <div className="auth-switch">{isRegister ? 'Já tem uma conta?' : 'Ainda não tem conta?'} <Link to={isRegister ? '/entrar' : '/criar-conta'}>{isRegister ? 'Entrar' : 'Criar conta'}</Link></div>}
          <p className="auth-footnote">Ao continuar, você concorda em usar a plataforma para estudos. A política de privacidade está em rascunho e requer revisão antes do lançamento público.</p>
        </section>
      </main>
      <footer className="auth-footer">Plataforma independente de estudos. Não afiliada ao INEP ou ao MEC.</footer>
    </div>
  );
}
