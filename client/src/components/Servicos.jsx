import React from 'react';

const services = [
  {
    icon: (
      <svg className="w-5 h-5 text-[#FF9F0A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path d="M12 2v6m0 0L8 14m4-6l4 6M5 20h14" />
      </svg>
    ),
    color: '#FF9F0A',
    price: 'A partir R$ 180',
    title: 'Troca de Óleo',
    desc: 'Sintético, semissintético ou mineral. Recomendação baseada no manual + análise de viscosidade SAE.',
    features: ['Filtro premium ✓', 'Descarte ecológico ✓', 'Garantia 90 dias'],
    featured: false,
  },
  {
    icon: (
      <svg className="w-5 h-5 text-[#0044CC]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    color: '#0044CC',
    price: 'A partir R$ 350',
    title: 'Revisão Completa',
    desc: '50+ itens + ALPHATEST + relatório digital em PDF. Você sabe o estado do carro antes de autorizar.',
    features: ['Freios, suspensão, direção ✓', 'Elétrica + bateria ✓', 'Laudo técnico em PDF ✓'],
    featured: true,
    badge: 'MAIS SOLICITADO',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-[#30D158]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    color: '#30D158',
    price: '1ª vez sem custo',
    title: 'Diagnóstico Computadorizado',
    desc: 'Scanner multimarcas com leitura de ECU, ABS, airbag e câmbio. Laudo técnico em PDF com explicação em português claro.',
    features: ['Leitura completa de DTCs ✓', 'Teste de atuadores ✓', 'Explicação sem mistério ✓'],
    featured: false,
  },
  {
    icon: (
      <svg className="w-5 h-5 text-[#0A84FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    ),
    color: '#0A84FF',
    price: 'SEM CUSTO',
    title: 'Encaminhamento Direcionado',
    desc: 'Problema exige especialista? A gente encaminha com laudo técnico e acompanha o serviço. Não improvisamos.',
    features: ['Rede de 12 especialistas ✓', 'Laudo acompanha ✓', 'Pós-serviço monitorado ✓'],
    featured: false,
  },
  {
    icon: (
      <svg className="w-5 h-5 text-[#5AC8FA]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
    color: '#5AC8FA',
    price: 'Orçamento Fechado',
    title: 'Mecânica Geral',
    desc: 'Motor, câmbio manual, freios, suspensão, escapamento, elétrica. Peça com nota fiscal + garantia de 90 dias.',
    features: ['Peças originais/OEM ✓', 'Orçamento prévio ✓', 'Garantia por escrito ✓'],
    featured: false,
  },
];

// CTA card data (rendered separately after the service cards)
const ctaCard = {
  badge: '🔥 OFERTA',
  title: 'DIAGNÓSTICO',
  subtitle: 'TÉCNICO',
  desc: 'ALPHATEST + checklist visual. Zero compromisso.',
};

export default function Servicos() {
  return (
    <section id="servicos" className="border-t border-[#1C1C21] py-20 lg:py-28">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
          <div className="max-w-2xl">
            <div className="tag bg-[#0044CC]/10 text-[#0044CC] border border-[#0044CC]/20 mb-4">
              ● Nossas Competências
            </div>
            <h2 className="section-title font-sans font-black text-[2.5rem] lg:text-[3.25rem] leading-tight tracking-[-0.02em]">
              SERVIÇO COM<br className="hidden lg:block" />
              <span className="text-gradient-accent">DADOS, NÃO ACHISMO.</span>
            </h2>
            <p className="text-[#8E8E93] mt-4 max-w-xl leading-relaxed">
              Cinco frentes de trabalho. Todas com o mesmo protocolo: diagnóstico antes da peça,
              laudo antes do orçamento, garantia depois do serviço.
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-sm text-[#636366] font-mono">
            <span className="status-dot live" />
            <span>5 de 5 operacionais</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s, i) => (
            <div
              key={i}
              className={`dash-card p-6 group relative ${s.featured ? 'dash-card-accent' : ''}`}
            >
              {s.featured && (
                <div className="absolute -top-2.5 right-4 tag bg-[#0044CC] text-white border-0 text-[10px]">
                  {s.badge}
                </div>
              )}
              <div className="flex items-start justify-between mb-5">
                <div
                  className="w-11 h-11 rounded-lg border flex items-center justify-center transition-colors"
                  style={{
                    backgroundColor: `${s.color}10`,
                    borderColor: `${s.color}20`,
                  }}
                >
                  {s.icon}
                </div>
                <span
                  className="price-tag"
                  style={{ backgroundColor: `${s.color}10`, color: s.color }}
                >
                  {s.price}
                </span>
              </div>
              <h3 className="font-sans font-bold text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-[#8E8E93] leading-relaxed mb-4">
                {s.desc}
              </p>
              <div className="space-y-2 text-sm">
                {s.features.map((f, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <span className="text-[#636366]">{f.replace(' ✓', '')}</span>
                    <span className="text-[#30D158]">✓</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* CTA Card - 6th position */}
          <div className="dash-card bg-[#0044CC]/5 border-[#0044CC]/20 p-6 flex flex-col justify-center group hover:border-[#0044CC]/40">
            <div className="mb-4">
              <span className="tag bg-[#0044CC]/20 text-[#0044CC] border-0 text-[10px]">{ctaCard.badge}</span>
            </div>
            <h3 className="font-sans font-black text-3xl mb-2">
              {ctaCard.title}<br /><span className="text-[#0044CC]">{ctaCard.subtitle}</span>
            </h3>
            <p className="text-sm text-[#8E8E93] mb-5">{ctaCard.desc}</p>
            <a href="#contato" className="btn-primary text-sm px-6 py-3 self-start">
              Agendar{' '}
              <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
