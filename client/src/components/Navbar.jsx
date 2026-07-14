import React, { useState } from 'react';

export default function Navbar({ onOpenWheel, onOpenCart, cartCount = 0 }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: '#dashboard', label: 'Dashboard' },
    { href: '#servicos', label: 'Serviços' },
    { href: '#galeria', label: 'Galeria' },
    { href: '#estoque', label: 'Estoque' },
    { href: '#numeros', label: 'Números' },
    { href: '#processo', label: 'Processo' },
    { href: '#contato', label: 'Contato' },
  ];

  return (
    <>
      <nav className="sticky top-10 z-40 bg-[#0F0F12]/90 backdrop-blur-xl border-b border-[#1C1C21]">
        <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-3">
            <div className="logo-container relative w-12 h-12">
              <video
                className="w-12 h-12 rounded-lg object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster="/media/logo-oficial.png"
              >
                <source src="/media/logo-animado.mp4" type="video/mp4" />
              </video>
            </div>
            <div>
              <div className="font-sans font-extrabold text-base tracking-tight leading-none">
                GARAGEM <span className="text-[#0044CC]">DO MEEC</span>
              </div>
              <div className="font-mono text-[10px] text-[#636366] tracking-[0.15em] uppercase">
                Valparaíso · GO · Dados reais
              </div>
            </div>
          </a>

          <div className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-[#8E8E93] hover:text-[#F2F2F7] transition-colors"
              >
                {l.label}
              </a>
            ))}
            <button
              onClick={onOpenWheel}
              className="text-sm font-medium text-[#F5C800] hover:text-[#F5C800]/80 transition-colors flex items-center gap-1 bg-transparent border-0 cursor-pointer"
            >
              🎰 Roleta
            </button>
            <a href="/admin" className="text-sm font-medium text-[#8E8E93] hover:text-[#F5C800] transition-colors">
              🔑 Painel Admin
            </a>
            <button
              onClick={onOpenCart}
              className="btn-primary text-xs px-5 py-2.5 relative"
            >
              🛒 Carrinho
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#FF9F0A] text-white text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <a href="#contato" className="btn-primary text-xs px-5 py-2.5">
              Agendar Diagnóstico
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          <button
            className="md:hidden text-[#8E8E93] hover:text-[#F2F2F7] bg-transparent border-0 cursor-pointer"
            onClick={() => setMobileOpen(true)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-[60] bg-[#08080A]/98 backdrop-blur-xl ${mobileOpen ? '' : 'hidden'}`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8 text-center">
          <button
            className="absolute top-6 right-6 text-[#8E8E93] bg-transparent border-0 cursor-pointer"
            onClick={() => setMobileOpen(false)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-2xl font-bold text-[#F2F2F7]"
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => { setMobileOpen(false); onOpenWheel(); }}
            className="text-2xl font-bold text-[#F5C800] bg-transparent border-0 cursor-pointer"
          >
            🎰 Roleta de Prêmios
          </button>
          <a
            href="#contato"
            className="btn-primary text-lg mt-4"
            onClick={() => setMobileOpen(false)}
          >
            Agendar Diagnóstico
          </a>
        </div>
      </div>
    </>
  );
}
