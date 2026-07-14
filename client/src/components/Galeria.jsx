import React from 'react';

const images = [
  { src: '/media/banner-fundo.jpeg', alt: 'Garagem do MEEC', tag: '🏪 OFICINA', label: 'Garagem do MEEC' },
  { src: '/media/motor-sujo.png', alt: 'Motor sujo na Garagem do MEEC', tag: '🔧 Motor antes do serviço' },
  { src: '/media/kit-reparos-volks.jpeg', alt: 'Kit de Reparos Volkswagen', tag: '📦 Kit de reparos VW' },
  { src: '/media/depois.jpeg', alt: 'Resultado de serviço Garagem do MEEC', tag: '✨ Resultado final do serviço' },
  { src: '/media/motor-limpo.png', alt: 'Motor limpo na Garagem do MEEC', tag: '✨ Motor revisado e limpo' },
];

export default function Galeria({ onOpenLightbox }) {
  return (
    <section id="galeria" className="border-t border-[#1C1C21] py-20 lg:py-28 grid-overlay">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="tag bg-[#5AC8FA]/10 text-[#5AC8FA] border border-[#5AC8FA]/20 mb-4 justify-center">
            ● Mídia Real
          </div>
          <h2 className="section-title font-sans font-black text-[2.5rem] lg:text-[3.25rem] leading-tight tracking-[-0.02em]">
            A GARAGEM<br className="hidden lg:block" />
            <span className="text-gradient-accent">EM AÇÃO.</span>
          </h2>
          <p className="text-[#8E8E93] mt-4 max-w-xl mx-auto leading-relaxed">
            Fotos e vídeos reais dos serviços realizados. <strong className="text-[#F2F2F7]">Clique para ampliar.</strong>
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* First 5 images */}
          {images.map((img, i) => (
            <div
              key={i}
              className={`group cursor-pointer ${i === 2 ? '' : ''}`}
              onClick={() => onOpenLightbox(img.src)}
            >
              <div className="media-placeholder aspect-[4/3] relative overflow-hidden">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#08080A] to-transparent p-4">
                  <div className="flex items-center gap-2">
                    {img.tag && (
                      <span className="font-mono text-[10px] text-[#8E8E93]">{img.tag}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Video placeholder */}
          <div className="md:row-span-2 group cursor-pointer">
            <div className="media-placeholder aspect-[4/6] h-full relative overflow-hidden rounded-3xl bg-[#08080A]">
              <video
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster="/media/logo-oficial.png"
              >
                <source src="/media/logo-animado.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-4">
                <span className="font-mono text-[10px] text-[#636366] tracking-widest uppercase">VÍDEO</span>
                <span className="text-sm font-bold text-[#F2F2F7]">Logo animado da Garagem do MEEC</span>
                <span className="tag bg-[#0044CC]/10 text-[#0044CC] border-0 mt-2">▶ Assistir</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#08080A] to-transparent p-4">
                <div className="flex items-center gap-2">
                  <span className="status-dot live" />
                  <span className="font-mono text-[10px] text-[#30D158]">Pré-carregado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
