import { useState, type ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Activity, BookOpen, Brain, FileText, Home, LogOut, Menu, Settings, X } from 'lucide-react';
import { Brand } from './Brand';
import { ThemeSwitch } from './ThemeSwitch';
import { FirebaseNotice } from './FirebaseNotice';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/painel', label: 'Visão geral', icon: Home },
  { to: '/plano', label: 'Plano de estudos', icon: BookOpen },
  { to: '/pratica', label: 'Prática Infinita', icon: Brain },
  { to: '/redacao', label: 'Redação', icon: FileText },
  { to: '/desempenho', label: 'Desempenho', icon: Activity },
];

export function AppShell({ children, title }: { children: ReactNode; title: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('enemzeiros-sidebar-collapsed') === 'true');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const name = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Estudante';

  const closeMobile = () => setMobileOpen(false);
  const toggleSidebar = () => setCollapsed((current) => {
    localStorage.setItem('enemzeiros-sidebar-collapsed', String(!current));
    return !current;
  });

  return (
    <div className={`app-frame${collapsed ? ' sidebar-collapsed' : ''}`}>
      {mobileOpen && <button className="mobile-scrim" aria-label="Fechar menu" onClick={closeMobile} />}
      <aside className={`sidebar${mobileOpen ? ' sidebar-open' : ''}`} aria-label="Navegação principal">
        <div className="sidebar-brand"><Brand compact={collapsed} /><button className="icon-button sidebar-collapse" type="button" onClick={toggleSidebar} aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}><span aria-hidden="true">{collapsed ? '›' : '‹'}</span></button></div>
        <div className="nav-caption">SEU ESPAÇO</div>
        <nav className="main-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={closeMobile} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} title={collapsed ? label : undefined}>
              <Icon size={18} aria-hidden="true" /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <NavLink to="/configuracoes" onClick={closeMobile} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} title={collapsed ? 'Configurações' : undefined}><Settings size={18} aria-hidden="true" /><span>Configurações</span></NavLink>
          <div className="sidebar-profile">
            <div className="avatar" aria-hidden="true">{name.charAt(0).toLocaleUpperCase('pt-BR')}</div>
            <div className="profile-label"><strong>{name}</strong><span>Minha conta</span></div>
            {user ? <button className="icon-button logout-button" type="button" onClick={() => void logout().then(() => navigate('/'))} aria-label="Sair da conta" title="Sair"><LogOut size={17} /></button> : <Link className="text-link" to="/entrar">Entrar</Link>}
          </div>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div className="topbar-left"><button className="icon-button mobile-menu-button" type="button" onClick={() => setMobileOpen(true)} aria-label="Abrir menu"><Menu size={20} /></button><div><span className="eyebrow">ENEMZEIROS</span><h1>{title}</h1></div></div>
          <div className="topbar-actions"><span className="topbar-greeting">Olá, {name}</span><ThemeSwitch /></div>
        </header>
        <main className="page-content">
          <FirebaseNotice />
          {children}
          <footer className="app-footer"><span>Plataforma independente de estudos. Não afiliada ao INEP ou ao MEC.</span><Link to="/privacidade">Privacidade</Link></footer>
        </main>
      </div>
      {mobileOpen && <button type="button" className="mobile-close" onClick={closeMobile} aria-label="Fechar menu"><X size={20} /></button>}
    </div>
  );
}
