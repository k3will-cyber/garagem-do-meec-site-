import React from 'react';

const steps = [
  { num: '01', title: 'Recepção', desc: 'Você chega, conta o problema, entregamos protocolo impresso com prazo estimado. Café e wi-fi liberados.', color: '#0044CC' },
  { num: '02', title: 'Scanner + Inspeção', desc: 'Leitura ALPHATEST multimarcas + checklist visual de 50+ itens. Você recebe fotos e vídeos no WhatsApp.', color: '#FF9F0A' },
  { num: '03', title: 'Laudo Técnico', desc: 'PDF com diagnóstico, fotos, opções de reparo e preço fechado. Você aprova ou não — sem pegadinha.', color: '#0A84FF' },
  { num: '04', title: 'Execução + Garantia', desc: 'Serviço executado, nota fiscal emitida, garantia por escrito entregue. Seu carro sai com solução e documento.', color: '#30D158', accent: true },
];

export default function Processo() {
  return (
    <section id="processo" className="border-t border-[#1C1C21] py-20 lg:py-28">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="tag bg-[#30D158]/10 text-[#30D158] border border-[#30D158]/20 mb-4 justify-center">
            ● Fluxo de Trabalho
          </div>
          <h2 className="section-title font-sans font-black text-[2.5rem] lg:text-[3.25rem] leading-tight tracking-[-0.02em]">
            COMO A GENTE<br className="hidden lg:block" />
            <span className="text-gradient-accent">RESOLVE.</span>
          </h2>
          <p className="text-[#8E8E93] mt-4 max-w-xl mx-auto leading-relaxed">
            Quatro passos. Do início ao fim, você sabe exatamente o que está acontecendo
            com seu carro — <strong className="text-[#F2F2F7]">antes de gastar um centavo.</strong>
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="relative">
              <div className={`dash-card p-6 h-full ${s.accent ? 'dash-card-accent' : ''}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: `${s.color}10`,
                      border: `1px solid ${s.color}20`,
                    }}
                  >
                    <span className="font-mono font-bold text-sm" style={{ color: s.color }}>
                      {s.num}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#636366]">
                    ETAPA {i + 1}/4
                  </span>
                </div>
                <h3 className={`font-sans font-bold text-lg mb-2 ${s.accent ? `text-[${s.color}]` : ''}`}>
                  {s.title}
                </h3>
                <p className="text-sm text-[#8E8E93] leading-relaxed">{s.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3.5 z-10 text-[#2A2A31]">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
