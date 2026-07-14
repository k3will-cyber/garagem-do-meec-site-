import React from 'react';

export default function QuemE() {
  return (
    <section className="border-t border-[#1C1C21] py-20 lg:py-28 grid-overlay">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <div className="tag bg-[#FF9F0A]/10 text-[#FF9F0A] border border-[#FF9F0A]/20 mb-4">
              ● Quem é MEEC
            </div>
            <h2 className="section-title font-sans font-black text-[2.5rem] lg:text-[3.25rem] leading-tight tracking-[-0.02em] mb-6">
              DE GARAGEM<br className="hidden lg:block" />
              DE CASA A <span className="text-gradient-accent">4 ELEVADORES</span>
            </h2>
            <div className="space-y-4 text-[#8E8E93] leading-relaxed">
              <p>
                <strong className="text-[#F2F2F7]">@meec_pablo</strong> — Pablo Jhonatan, 12 anos de estrada.
                Comecei atendendo carro de vizinho na garagem de casa. Hoje a oficina tem{' '}
                <strong className="text-[#F2F2F7]">4 elevadores hidráulicos, 3 mecânicos</strong> e o mesmo
                princípio: <strong className="text-[#0044CC]">mostrar o serviço acontecendo, não esconder.</strong>
              </p>
              <p>
                Atendemos <strong className="text-[#F2F2F7]">todas as marcas</strong>: VW, Fiat, Chevrolet, Toyota,
                Hyundai, Honda, Renault, Ford. Carros populares, SUVs, picapes. Importados também — temos rede
                credenciada para peças.
              </p>
              <p className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#0044CC] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>
                  <strong className="text-[#F2F2F7]">📍 R. 102, Jardim Ceu Azul — Valparaíso de Goiás · GO</strong>, 72871-102
                </span>
              </p>
            </div>
            <div className="flex items-center gap-4 mt-8">
              <a href="#contato" className="btn-primary text-sm px-6 py-3">
                Falar com MEEC
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <span className="text-xs text-[#636366] font-mono">Resposta em até 2h</span>
            </div>
          </div>

          <div className="dash-card dash-card-accent p-8 lg:p-10 relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#0044CC]/5 rounded-bl-full" />
            <div className="relative">
              <svg className="w-10 h-10 text-[#0044CC]/20 mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151C7.566 6.068 6.003 8.789 6.003 11h4v10H0z" />
              </svg>
              <blockquote className="font-sans font-bold text-xl lg:text-2xl leading-relaxed text-[#F2F2F7]">
                "Se eu não sei fazer, eu digo. Se sei, eu faço direito.{' '}
                <span className="text-[#0044CC]">Sem meio termo, sem enrolação.</span>"
              </blockquote>
              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-[#1C1C21]">
                <div className="w-10 h-10 rounded-lg bg-[#0044CC] flex items-center justify-center font-mono font-bold text-sm text-white">
                  MP
                </div>
                <div>
                  <div className="font-sans font-bold text-sm">@meec_pablo</div>
                  <div className="text-xs text-[#636366]">Fundador · Garagem do MEEC</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
