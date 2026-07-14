import React from 'react';

export default function Hero() {
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
                  DIAGNÓSTICO COMPUTADORIZADO GRATUITO
                </span>
                <span className="text-[10px] font-mono text-[#636366] bg-[#1C1C21] px-2 py-0.5 rounded">
                  Válido hoje
                </span>
              </div>
              <h1 className="hero-title font-sans font-black text-[3.5rem] lg:text-[4.5rem] leading-[1.05] tracking-[-0.03em] reveal visible">
                SEU CARRO<br />
                <span className="text-[#0044CC]">ENTRA COM PROBLEMA.</span><br />
                <span className="text-gradient-accent">SAI COM LAUDO.</span>
              </h1>
              <p className="text-lg text-[#8E8E93] leading-relaxed max-w-xl reveal visible reveal-delay-1">
                Na <strong className="text-[#F2F2F7]">Garagem do MEEC</strong> a gente não chuta. Scanner OBD2, checklist de 50+ itens{' '}
                e laudo técnico em PDF.
                <span className="text-[#0044CC] font-semibold"> Você decide com dados na mão.</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 reveal visible reveal-delay-2">
              <a href="#contato" className="btn-primary text-base px-8 py-4">
                🔥 Agendar Diagnóstico Grátis
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a href="#servicos" className="btn-secondary text-base px-8 py-4">
                Ver Competências
              </a>
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
              <div className="flex items-center gap-2 text-sm text-[#636366]">
                <svg className="w-4 h-4 text-[#30D158]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Garantia de 7 dias</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4 reveal visible reveal-delay-3">
            {/* Main metric card */}
            <div className="dash-card dash-card-accent p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#0044CC]/5 rounded-bl-full" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="tag bg-[#1C1C21] text-[#8E8E93] font-mono text-[10px]">
                    <span className="status-dot live" />
                    LIVE
                  </span>
                  <span className="font-mono text-[11px] text-[#636366]">Atualizado agora</span>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="font-mono font-bold text-4xl counter text-[#F2F2F7]">3.247</div>
                    <div className="text-xs text-[#636366] font-medium mt-1 tracking-wide uppercase">Carros Atendidos</div>
                    <div className="mt-2 progress-bar">
                      <div className="progress-bar-fill bg-[#0044CC] w-[78%]" />
                    </div>
                    <div className="font-mono text-[10px] text-[#636366] mt-1">meta 4.000</div>
                  </div>
                  <div>
                    <div className="font-mono font-bold text-4xl counter text-[#30D158]">98%</div>
                    <div className="text-xs text-[#636366] font-medium mt-1 tracking-wide uppercase">Aprovação</div>
                    <div className="mt-2 progress-bar">
                      <div className="progress-bar-fill bg-[#30D158] w-[98%]" />
                    </div>
                    <div className="font-mono text-[10px] text-[#636366] mt-1">últimos 12 meses</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="dash-card p-5">
                <div className="text-[11px] font-medium text-[#636366] uppercase tracking-wide mb-2">Tempo médio</div>
                <div className="font-mono font-bold text-2xl text-[#0A84FF]">47<span className="text-sm text-[#636366]"> min</span></div>
                <div className="text-[11px] text-[#8E8E93] mt-1">diagnóstico completo</div>
              </div>
              <div className="dash-card p-5">
                <div className="text-[11px] font-medium text-[#636366] uppercase tracking-wide mb-2">Garantia</div>
                <div className="font-mono font-bold text-2xl text-[#FF9F0A]">90<span className="text-sm text-[#636366]"> dias</span></div>
                <div className="text-[11px] text-[#8E8E93] mt-1">em serviços realizados</div>
              </div>
            </div>

            {/* Mini toast */}
            <div className="toast-bar dash-card p-3 flex items-center gap-3">
              <svg className="w-4 h-4 text-[#30D158] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-[#8E8E93]">
                <span className="text-[#F2F2F7] font-medium">@meec_pablo</span> postou novo diagnóstico — Ford Ka 2015 · 2 min atrás
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
