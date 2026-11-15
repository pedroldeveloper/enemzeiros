import { lazy, Suspense, useEffect } from 'react';
import { Link, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { useAuth } from './context/AuthContext';

const AuthPage = lazy(() => import('./pages/AuthPage').then((module) => ({ default: module.AuthPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const EssayPage = lazy(() => import('./pages/EssayPage').then((module) => ({ default: module.EssayPage })));
const LandingPage = lazy(() => import('./pages/LandingPage').then((module) => ({ default: module.LandingPage })));
const LessonPage = lazy(() => import('./pages/LessonPage').then((module) => ({ default: module.LessonPage })));
const PerformancePage = lazy(() => import('./pages/PerformancePage').then((module) => ({ default: module.PerformancePage })));
const PlanPage = lazy(() => import('./pages/PlanPage').then((module) => ({ default: module.PlanPage })));
const PracticePage = lazy(() => import('./pages/PracticePage').then((module) => ({ default: module.PracticePage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then((module) => ({ default: module.PrivacyPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((module) => ({ default: module.SettingsPage })));

function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="auth-loading"><span className="loader" /> Verificando sua sessão…</div>;
  if (!user) return <Navigate to="/entrar" replace state={{ from: location }} />;
  return <Outlet />;
}

function MainLayout() {
  const location = useLocation();
  const titles: Record<string, string> = {
    '/painel': 'Visão geral', '/plano': 'Plano de estudos', '/pratica': 'Prática Infinita',
    '/redacao': 'Redação', '/desempenho': 'Desempenho', '/configuracoes': 'Configurações',
  };
  const title = location.pathname.startsWith('/aula/') ? 'Aula' : titles[location.pathname] ?? 'Enemzeiros';
  useEffect(() => { document.title = `${title} | Enemzeiros`; window.scrollTo({ top: 0, behavior: 'auto' }); }, [title, location.pathname]);
  return <AppShell title={title}><Outlet /></AppShell>;
}

function NotFound() {
  return <main className="not-found"><span className="eyebrow">PÁGINA NÃO ENCONTRADA</span><h1>Este caminho ainda não existe.</h1><p>Volte ao início e escolha uma área do Enemzeiros.</p><Link className="button button-primary" to="/">Ir ao início</Link></main>;
}

export function App() {
  return <Suspense fallback={<div className="auth-loading"><span className="loader" /> Carregando Enemzeiros…</div>}><Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/entrar" element={<AuthPage kind="login" />} />
    <Route path="/criar-conta" element={<AuthPage kind="register" />} />
    <Route path="/recuperar-senha" element={<AuthPage kind="reset" />} />
    <Route path="/privacidade" element={<PrivacyPage />} />
    <Route element={<MainLayout />}>
      <Route path="/redacao" element={<EssayPage />} />
    </Route>
    <Route element={<RequireAuth />}>
      <Route element={<MainLayout />}>
        <Route path="/painel" element={<DashboardPage />} />
        <Route path="/plano" element={<PlanPage />} />
        <Route path="/aula/:topicId" element={<LessonPage />} />
        <Route path="/pratica" element={<PracticePage />} />
        <Route path="/desempenho" element={<PerformancePage />} />
        <Route path="/configuracoes" element={<SettingsPage />} />
      </Route>
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes></Suspense>;
}
