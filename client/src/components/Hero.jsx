import React from 'react';
import WheelWidget from './WheelWidget';

export default function Hero({ onOpenWheelReg, wheelProps }) {
  return (
    <section
      id="dashboard"
      className="relative grid-overlay overflow-hidden scan-line"
      style={{
        backgroundImage: "url('/media/banner-fundo.jpeg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
        backgroundRepeat: 'no-repeat',
        backgroundBlendMode: 'overlay',
      }}
    >
      <div className="absolute inset-0 bg-[#08080A]/80" />
      <div className="max-w-[1280px] mx-auto px-6 pt-16 pb-20 lg:pt-24 lg:pb-28 relative z-10">
        <div className="flex items-center gap-2 text-[11px] font-medium text-[#636366] mb-8 reveal visible">
          <span className="text-[#30D158]">●</span>
          <span>Dashboard da Oficina</span>
          <span className="text-[#2A2A31]">/</span>
          <span className="text-[#8E8E93]">Status: <span className="text-[#30D158]">Operacional</span></span>
          <span className="text-[#2A2A31]">/</span>
          <span className="text-[#0044CC]">3 vagas disponíveis hoje</span>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 dash-card px-4 py-2 rounded-lg reveal visible">
                <span className="status-dot live" />
                <span className="font-mono text-xs text-[#30D158] font-medium tracking-wider">
                  DIAGNÓSTICO COMPUTADORIZADO
                </span>
                <span className="text-[10px] font-mono text-[#636366] bg-[#1C1C21] px-2 py-0.5 rounded">
                  Válido hoje
                </span>
              </div>
              <h1 className="hero-title font-sans font-black text-[3.5rem] lg:text-[4.5rem] leading-[1.05] tracking-[-0.03em] reveal visible">
                GIRE A <span className="text-[#0044CC]">ROLETA</span>
                <br />
                <span className="text-gradient-accent">E GANHE PRÊMIOS EXCLUSIVOS!</span>
              </h1>
              <p className="text-lg text-[#8E8E93] leading-relaxed max-w-xl reveal visible reveal-delay-1">
                Na <strong className="text-[#F2F2F7]">Garagem do MEEC</strong> são 12 anos de estrada, ALPHATEST,
                checklist de 50+ itens e laudo técnico em PDF.
                <strong className="text-[#0044CC]"> Gire a roleta e desbloqueie descontos exclusivos agora mesmo!</strong>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 reveal visible reveal-delay-2">
              <button
                onClick={onOpenWheelReg}
                className="btn-primary text-base px-8 py-4"
                style={{ background: 'linear-gradient(135deg, #0044CC, #F5C800)', boxShadow: '0 0 30px rgba(245,200,0,0.2)' }}
              >
                🎰 GIRAR ROLETA
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <a href="#servicos" className="btn-secondary text-base px-8 py-4">Ver Serviços</a>
              <a href="#contato" className="btn-secondary text-base px-8 py-4">🔥 Agendar Diagnóstico</a>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-4 reveal visible reveal-delay-3">
              <div className="flex items-center gap-2 text-sm text-[#636366]">
                <svg className="w-4 h-4 text-[#30D158]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Laudo técnico incluso</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#636366]">
                <svg className="w-4 h-4 text-[#30D158]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Orçamento fechado</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#0044CC]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Roleta disponível hoje</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4 reveal visible reveal-delay-3">
            <WheelWidget {...wheelProps} />

            <div className="grid grid-cols-3 gap-3">
              <div className="dash-card p-3 text-center">
                <div className="font-mono font-bold text-lg text-[#0044CC]">3.2K+</div>
                <div className="text-[9px] text-[#636366] uppercase tracking-wider">Carros</div>
              </div>
              <div className="dash-card p-3 text-center">
                <div className="font-mono font-bold text-lg text-[#30D158]">98%</div>
                <div className="text-[9px] text-[#636366] uppercase tracking-wider">Aprovação</div>
              </div>
              <div className="dash-card p-3 text-center">
                <div className="font-mono font-bold text-lg text-[#FF9F0A]">90d</div>
                <div className="text-[9px] text-[#636366] uppercase tracking-wider">Garantia</div>
              </div>
            </div>

            <div className="toast-bar dash-card p-3 flex items-center gap-3">
              <svg className="w-4 h-4 text-[#F5C800] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-[#8E8E93]">
                <span className="text-[#F5C800] font-medium">🎰 ROLETA MEEC OFERTAS</span> — descontos exclusivos · Gire e ganhe!
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
