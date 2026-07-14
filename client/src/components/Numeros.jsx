import React from 'react';

const metrics = [
  { value: '12', label: 'Anos de Estrada', sub: 'Desde 2014', color: '#0044CC', width: '100%', cls: '' },
  { value: '3.2K+', label: 'Carros Atendidos', sub: 'Média 267/ano', color: '#30D158', width: '80%', cls: 'reveal-delay-1' },
  { value: '98%', label: 'Aprovação', sub: 'Clientes satisfeitos', color: '#FF9F0A', width: '98%', cls: 'reveal-delay-2' },
  { value: '47', label: 'Diagnóstico', sub: 'Tempo médio', color: '#0A84FF', width: '60%', cls: 'reveal-delay-3', suffix: <span className="text-2xl text-[#636366]">min</span> },
];

const extras = [
  { value: '2', label: 'Mecânicos', icon: '👤' },
  { value: '2', label: 'Elevadores', icon: '⬆️' },
  { value: '12', label: 'Parceiros', icon: '🤝' },
  { value: '90d', label: 'Garantia', icon: '✅' },
];

export default function Numeros() {
  return (
    <section id="numeros" className="border-t border-[#1C1C21] py-20 lg:py-28 grid-overlay">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="tag bg-[#0A84FF]/10 text-[#0A84FF] border border-[#0A84FF]/20 mb-4 justify-center">
            ● Dados Operacionais
          </div>
          <h2 className="section-title font-sans font-black text-[2.5rem] lg:text-[3.25rem] leading-tight tracking-[-0.02em]">
            NÚMEROS QUE<br className="hidden lg:block" />
            <span className="text-gradient-accent">NÃO MENTEM.</span>
          </h2>
          <p className="text-[#8E8E93] mt-4 max-w-xl mx-auto leading-relaxed">
            Mais de uma década atendendo carros em Valparaíso de Goiás. Cada número aqui representa
            um cliente que saiu com o problema resolvido.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metrics.map((m, i) => (
            <div key={i} className={`dash-card p-8 text-center ${m.cls}`}>
              <div className="font-mono font-black text-5xl lg:text-6xl mb-2" style={{ color: m.color }}>
                {m.value}{m.suffix}
              </div>
              <div className="text-xs text-[#636366] font-medium uppercase tracking-widest">{m.label}</div>
              <div className="text-[11px] text-[#8E8E93] mt-2">{m.sub}</div>
              <div className="mt-4 progress-bar">
                <div className="progress-bar-fill" style={{ background: m.color, width: m.width }} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {extras.map((e, i) => (
            <div key={i} className={`dash-card p-5 flex items-center gap-4 ${i > 0 ? `reveal-delay-${i}` : ''}`}>
              <div className="w-12 h-12 rounded-lg bg-[#0044CC]/10 flex items-center justify-center shrink-0 text-xl">
                {e.icon}
              </div>
              <div>
                <div className="font-mono font-bold text-xl">{e.value}</div>
                <div className="text-[11px] text-[#636366]">{e.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
