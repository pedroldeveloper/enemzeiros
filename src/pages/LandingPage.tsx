import { ArrowRight, BookOpen, ChartNoAxesColumnIncreasing, Check, FilePenLine, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Brand } from '../components/Brand';
import { ThemeSwitch } from '../components/ThemeSwitch';
import { curriculum } from '../data/curriculum';

export function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-header"><Brand /><nav><Link to="/entrar">Entrar</Link><Link className="button button-primary button-small" to="/criar-conta">Começar agora <ArrowRight size={16} /></Link><ThemeSwitch /></nav></header>
      <main>
        <section className="hero-section">
          <div className="hero-copy"><div className="eyebrow-pill"><span className="status-dot" /> PREPARAÇÃO COM PLANO E PROGRESSO</div><h1>Seu próximo passo no ENEM, <em>com clareza.</em></h1><p>Organize o estudo, acompanhe as aulas e revise o que precisa de atenção. Um caminho construído a partir do seu plano de conteúdos.</p><div className="hero-actions"><Link to="/criar-conta" className="button button-primary">Criar minha conta <ArrowRight size={17} /></Link><Link to="/redacao" className="button button-secondary">Escrever uma redação</Link><Link to="/entrar" className="button button-quiet">Já tenho conta</Link></div><div className="independent-note"><ShieldCheck size={15} /> Plataforma independente de estudos.</div></div>
          <div className="hero-preview" aria-label="Prévia do painel de estudos">
            <div className="preview-top"><span className="preview-mark">E</span><span>Visão geral</span><span className="preview-day">ESTUDO DE HOJE</span></div>
            <div className="preview-title">Seu plano, em andamento</div><div className="preview-subtitle">O curso está sendo preparado por etapas.</div>
            <div className="preview-progress"><div><span>Conteúdos mapeados</span><strong>{curriculum.topicCount}</strong></div><div className="preview-meter"><i /></div><small>4 aulas publicadas · currículo em produção</small></div>
            <div className="preview-task"><div className="preview-icon"><BookOpen size={18} /></div><div><small>PRÓXIMA AULA</small><strong>Porcentagem: parte, total e variação</strong></div><ArrowRight size={17} /></div>
            <div className="preview-footer"><span><Check size={14} /> Conteúdos com origem rastreável</span><span>Enemzeiros</span></div>
          </div>
        </section>
        <section className="landing-facts"><div><strong>287</strong><span>tópicos auditados no plano</span></div><div><strong>10</strong><span>disciplinas mapeadas</span></div><div><strong>pt-BR</strong><span>feito para estudar com contexto</span></div></section>
        <section className="feature-section"><div className="section-heading"><span className="eyebrow">UM ESPAÇO PARA ESTUDAR</span><h2>Do mapa de conteúdos à próxima ação.</h2><p>Um lugar para organizar a preparação sem transformar o estudo em uma lista sem fim.</p></div><div className="feature-grid"><article><BookOpen size={21} /><h3>Plano rastreável</h3><p>Os tópicos do seu plano continuam ligados à fonte e aparecem com status editorial claro.</p></article><article><ChartNoAxesColumnIncreasing size={21} /><h3>Progresso visível</h3><p>Acompanhe aulas concluídas, tentativas e redações salvas na sua conta Firebase.</p></article><article><FilePenLine size={21} /><h3>Você escolhe a IA</h3><p>Escreva sua redação, copie um prompt e decida se quer enviá-la a um serviço externo.</p></article></div></section>
        <section className="landing-cta"><div><span className="eyebrow">PREPARE O PRÓXIMO PASSO</span><h2>Comece pelo que já está pronto.</h2><p>O currículo completo ainda está em produção. A plataforma mostra com clareza quais aulas estão publicadas e quais seguem pendentes.</p></div><Link to="/criar-conta" className="button button-white">Criar conta <ArrowRight size={16} /></Link></section>
      </main>
      <footer className="landing-footer"><Brand /><span>Plataforma independente de estudos. Não afiliada ao INEP ou ao MEC.</span><Link to="/privacidade">Política de privacidade</Link></footer>
    </div>
  );
}
