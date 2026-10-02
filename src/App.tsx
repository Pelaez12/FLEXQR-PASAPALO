import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { ArrowUpRight, BookOpen, ExternalLink, Minus, Plus, X } from 'lucide-react';
import { motion, useAnimate, useReducedMotion } from 'motion/react';
import { SiInstagram, SiWhatsapp } from 'react-icons/si';

const whatsapp = 'https://wa.me/51974736120';
const instagram = 'https://www.instagram.com/pasapalo.pe/';
const posts = [
  { href: 'https://www.instagram.com/p/Dd1rc0rRPqJ/', image: '/post-tequeyoyo.webp', title: 'Tequeyoyos', alt: 'Tequeyoyos de Pasa Palo en una caja' },
  { href: 'https://www.instagram.com/p/DccY6pBx2B7/', image: '/post-compartir.webp', title: 'Para compartir', alt: 'Caja de tequeños de Pasa Palo sostenida con una mano' },
  { href: 'https://www.instagram.com/p/Dd5A74ERnqn/', image: '/post-pastelito.webp', title: 'Pastelitos de pollo', alt: 'Pastelito de pollo abierto y sostenido con una mano' },
];

const ease = [0.22, 1, 0.36, 1] as const;
const isMobile = () => window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;

function MovingDots() {
  return (
    <svg viewBox="0 0 24 24" width="64" height="64" fill="currentColor" aria-hidden="true">
      {[0, 1, 2, 3].map(index => (
        <motion.circle
          key={index}
          cy="12"
          cx={index === 0 ? 4 : index * 8 - 4}
          r={index === 0 ? 0 : 3}
          animate={{ cx: [4, 4, 12, 20, 20, 4], r: [0, 3, 3, 3, 0, 0] }}
          transition={{ duration: 2.004, repeat: Infinity, delay: -index * 0.501,
            times: [0, 0.2495, 0.499, 0.7485, 0.998, 1], ease: [0.36, 0.6, 0.31, 1] }}
        />
      ))}
    </svg>
  );
}

function Intro() {
  const prefersReduced = useReducedMotion();
  const reduced = prefersReduced && new URLSearchParams(window.location.search).get('splash') !== 'full';
  const [scope, animate] = useAnimate();
  const [visible, setVisible] = useState(() => {
    const force = new URLSearchParams(window.location.search).get('splash');
    if (isMobile() || force === '1' || force === 'true' || force === 'full') return true;
    try { return !sessionStorage.getItem('pasapalo_splash_seen'); } catch { return true; }
  });

  const finish = useCallback(() => {
    if (!isMobile()) {
      try { sessionStorage.setItem('pasapalo_splash_seen', 'true'); } catch { /* Storage is optional. */ }
    }
    setVisible(false);
  }, []);

  useLayoutEffect(() => {
    if (!visible || !scope.current) return;
    const headerLogo = document.getElementById('header-pasapalo-logo');
    const content = document.getElementById('app-content');
    const previousOverflow = document.body.style.overflow;
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    const previousScrollRestoration = history.scrollRestoration;
    const previousOpacity = headerLogo?.style.opacity ?? '';
    const previousInert = content?.inert ?? false;
    document.documentElement.style.scrollBehavior = 'auto';
    history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    if (headerLogo) headerLogo.style.opacity = '0';
    if (content) content.inert = true;
    document.body.style.overflow = 'hidden';

    let cancelled = false;
    let controls: ReturnType<typeof animate> | null = null;
    let headerReveal: Animation | null = null;

    const run = async () => {
      const logo = scope.current?.querySelector('.splash__logo') as HTMLElement | null;
      const splashImage = logo?.querySelector('img');
      if (!logo || !splashImage || !headerLogo) { finish(); return; }
      try {
        await Promise.all([splashImage.decode(), (headerLogo as HTMLImageElement).decode()]);
      } catch {
        if (!cancelled) finish();
        return;
      }
      if (cancelled) return;

      const source = logo.getBoundingClientRect();
      const target = headerLogo.getBoundingClientRect();
      const dx = target.left - source.left;
      const dy = target.top - source.top;
      const scale = target.height / source.height;
      if (!Number.isFinite(scale) || scale <= 0) { finish(); return; }

      if (!reduced) {
        headerReveal = headerLogo.animate([{ opacity: 0 }, { opacity: 1 }], { delay: 6550, duration: 150, fill: 'forwards', easing: 'ease-out' });
      }

      controls = reduced
        ? animate([
            ['.splash__logo', { opacity: [0, 1] }, { duration: 0.15 }],
            ['.splash__logo', { opacity: 0 }, { at: 0.55, duration: 0.15 }],
            ['.splash__phrase', { opacity: [0, 1] }, { at: 0.7, duration: 0.15 }],
            ['.splash__phrase', { opacity: 0 }, { at: 2.2, duration: 0.15 }],
            ['.splash__skip', { opacity: 0 }, { at: 2.2, duration: 0.15 }],
          ])
        : animate([
            ['.splash__dots', { opacity: [1, 0] }, { at: 1.8, duration: 0.25 }],
            ['.splash__logo', { opacity: [0, 1], transform: ['scale(0.94)', 'scale(1)'] }, { at: 2, duration: 0.5, ease }],
            ['.splash__logo', { opacity: 0, transform: 'translateY(-10px)' }, { at: 4.1, duration: 0.3, ease }],
            ['.splash__phrase', { opacity: [0, 1], transform: ['translateY(10px)', 'translateY(0)'] }, { at: 4.4, duration: 0.35, ease }],
            ['.splash__phrase', { opacity: 0, transform: 'translateY(-8px)' }, { at: 5.7, duration: 0.25 }],
            ['.splash__skip', { opacity: 0 }, { at: 5.7, duration: 0.2 }],
            ['.splash__logo', { opacity: 1, transform: 'translateY(0)' }, { at: 5.95, duration: 0.15 }],
            ['.splash__logo', { transform: `translate3d(${dx}px, ${dy}px, 0) scale(${scale})` }, { at: 6.05, duration: 0.55, ease }],
            ['.splash__wash', { opacity: [1, 0] }, { at: 6.05, duration: 0.65, ease }],
          ]);

      controls.then(() => { if (!cancelled) finish(); });
    };
    void run();
    const handleEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') finish(); };
    window.addEventListener('keydown', handleEscape);
    window.addEventListener('orientationchange', finish);
    return () => {
      cancelled = true;
      controls?.cancel();
      headerReveal?.cancel();
      if (headerLogo) headerLogo.style.opacity = previousOpacity;
      if (content) content.inert = previousInert;
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
      history.scrollRestoration = previousScrollRestoration;
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('orientationchange', finish);
    };
  }, [visible, reduced, animate, scope, finish]);

  if (!visible) return null;
  return (
    <div ref={scope} className="splash" role="dialog" aria-modal="true" aria-label="Bienvenido a Pasa Palo" onClick={finish}>
      <div className="splash__wash" />
      <div className="splash__stage" aria-hidden="true">
        {!reduced && <div className="splash__dots"><MovingDots /></div>}
        <div className="splash__logo"><img src="/pasapalo-logo-transparente.png" alt="" width="1340" height="1174" /></div>
        <p className="splash__phrase"><span>Un abrazo</span><span>hecho bocado.</span></p>
      </div>
      <button type="button" className="splash__skip" onClick={finish}>Toca para comenzar</button>
    </div>
  );
}

function App() {
  const menuDialog = useRef<HTMLDialogElement>(null);
  const [zoomed, setZoomed] = useState(false);

  const openMenu = () => {
    setZoomed(false);
    menuDialog.current?.showModal();
  };

  return (
    <>
      <Intro />
      <div className="page-shell" id="app-content">
        <main className="profile-card">
          <div className="profile-card__top" aria-hidden="true">
            <span>PASA PALO</span>
            <span>HECHO PARA COMPARTIR</span>
          </div>

          <header className="hero">
            <img className="hero__logo" id="header-pasapalo-logo" src="/pasapalo-logo-transparente.png" alt="Logo de Pasa Palo" width="1340" height="1174" />
          </header>

          <div className="profile-content">
            <div className="intro-copy">
              <p className="eyebrow">Bienvenidos a nuestra mesa</p>
              <h1>Un abrazo hecho bocado.</h1>
              <p className="intro">Bocaditos hechos para compartir, repetir y volver a pedir.</p>

              <div className="availability" aria-label="Presentaciones disponibles">
                <span><span aria-hidden="true">✦</span> Listos para comer</span>
                <span><span aria-hidden="true">✳</span> Congelados</span>
              </div>
            </div>

            <section className="actions" aria-label="Carta y pedidos">
              <button type="button" className="action action--menu" onClick={openMenu}>
                <BookOpen size={22} aria-hidden="true" />
                <span>Chequea nuestra carta aquí</span>
                <Plus size={20} aria-hidden="true" />
              </button>
              <a className="action action--primary" href={whatsapp} target="_blank" rel="noopener noreferrer">
                <SiWhatsapp size={22} aria-hidden="true" />
                <span>Agenda tu pedido</span>
                <ArrowUpRight size={20} aria-hidden="true" />
              </a>
            </section>

            <p className="order-note">Pedidos abiertos · Escríbenos por WhatsApp</p>

            <section className="social" aria-labelledby="social-title">
              <div className="section-head">
                <h2 id="social-title">Nos vemos en Instagram</h2>
                <span>@pasapalo.pe</span>
              </div>
              <a className="social__main" href={instagram} target="_blank" rel="noopener noreferrer">
                <SiInstagram size={24} aria-hidden="true" />
                <span>Visita nuestro perfil</span>
                <ArrowUpRight size={20} aria-hidden="true" />
              </a>
              <div className="posts" role="list" aria-label="Publicaciones de Pasa Palo">
                {posts.map((post) => (
                  <article key={post.href} className="post-preview" role="listitem">
                    <a href={post.href} target="_blank" rel="noopener noreferrer" aria-label={`Ver publicación: ${post.title} en Instagram`}>
                      <span className="post-preview__visual">
                        <img src={post.image} alt={post.alt} width="720" height="900" loading="lazy" decoding="async" />
                        <span className="post-preview__open">Ver en Instagram <ExternalLink size={15} aria-hidden="true" /></span>
                      </span>
                      <span className="post-preview__caption"><SiInstagram size={16} aria-hidden="true" /><strong>{post.title}</strong><ArrowUpRight size={17} aria-hidden="true" /></span>
                    </a>
                  </article>
                ))}
              </div>
              <p className="posts__hint">Desliza para ver las tres publicaciones</p>
            </section>
          </div>

          <footer className="footer">
            <span>PASA PALO · 2026</span>
            <a href="tel:+51992272521" aria-label="Llamar a FLEXCORE al 992272521"><strong>FLEXCORE</strong> · 992272521</a>
          </footer>
        </main>
      </div>

      <dialog
        ref={menuDialog}
        className="menu-dialog"
        aria-labelledby="menu-title"
        onClose={() => setZoomed(false)}
        onClick={(event) => {
          if (event.target === menuDialog.current) menuDialog.current?.close();
        }}
      >
        <div className="menu-dialog__panel">
          <div className="menu-dialog__bar">
            <div>
              <span className="menu-dialog__eyebrow">PASA PALO</span>
              <h2 id="menu-title">Nuestra carta</h2>
            </div>
            <div className="menu-dialog__controls">
              <button type="button" onClick={() => setZoomed(!zoomed)} aria-label={zoomed ? 'Reducir carta' : 'Ampliar carta'} title={zoomed ? 'Reducir' : 'Ampliar'}>
                {zoomed ? <Minus size={22} aria-hidden="true" /> : <Plus size={22} aria-hidden="true" />}
              </button>
              <button type="button" onClick={() => menuDialog.current?.close()} aria-label="Cerrar carta" title="Cerrar carta">
                <X size={22} aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="menu-dialog__scroll">
            <img
              className={zoomed ? 'menu-dialog__image menu-dialog__image--zoomed' : 'menu-dialog__image'}
              src="/pasapalo-carta.jpg"
              alt="Carta de Pasa Palo con tequeños, pastelitos, salsas y bebidas, cantidades y precios en soles"
              width="1200"
              height="1220"
              onDoubleClick={() => setZoomed(!zoomed)}
            />
          </div>
          <p className="menu-dialog__hint">{zoomed ? 'Desliza para recorrer la carta. Usa − para reducirla.' : 'Usa + para ampliar la carta.'} Presiona Esc o toca × para salir.</p>
        </div>
      </dialog>
    </>
  );
}

export default App;
