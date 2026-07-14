import React, { useCallback, useRef, useState } from 'react';

function BeforeAfterCard({ before, after, title, subtitle }) {
  const containerRef = useRef(null);
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);

  const updatePosition = useCallback(
    (clientX) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      let pos = ((clientX - rect.left) / rect.width) * 100;
      pos = Math.max(0, Math.min(100, pos));
      setPosition(pos);
    },
    []
  );

  const handleMouseDown = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(true);
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!dragging) return;
      updatePosition(e.clientX);
    },
    [dragging, updatePosition]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  const handleTouchStart = useCallback(
    (e) => {
      const touch = e.touches[0];
      if (touch) {
        updatePosition(touch.clientX);
      }
    },
    [updatePosition]
  );

  const handleTouchMove = useCallback(
    (e) => {
      const touch = e.touches[0];
      if (touch) {
        updatePosition(touch.clientX);
      }
    },
    [updatePosition]
  );

  return (
    <div className="dash-card p-1">
      <div
        ref={containerRef}
        className="ba-container select-none"
        style={{ aspectRatio: '4/3', userSelect: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <img
          src={after}
          alt="Depois"
          className="w-full h-full object-cover absolute inset-0 pointer-events-none"
          draggable={false}
        />
        <div className="ba-before" style={{ width: `${position}%` }}>
          <img
            src={before}
            alt="Antes"
            className="w-full h-full object-cover pointer-events-none"
            draggable={false}
          />
        </div>
        <div className="ba-handle" style={{ left: `${position}%` }} />
        <div className="absolute bottom-2 left-2 z-10 tag bg-[#0044CC]/80 text-white border-0 text-[9px] pointer-events-none">
          ANTES
        </div>
        <div className="absolute bottom-2 right-2 z-10 tag bg-[#30D158]/80 text-white border-0 text-[9px] pointer-events-none">
          DEPOIS
        </div>
      </div>
      <div className="p-4 text-center">
        <div className="font-sans font-bold text-sm">{title}</div>
        <div className="text-[11px] text-[#636366] font-mono">{subtitle}</div>
      </div>
    </div>
  );
}

export default function BeforeAfter() {
  return (
    <section id="antes-depois" className="border-t border-[#1C1C21] py-20 lg:py-28">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="tag bg-[#FF9F0A]/10 text-[#FF9F0A] border border-[#FF9F0A]/20 mb-4 justify-center">
            ● Antes & Depois
          </div>
          <h2 className="section-title font-sans font-black text-[2.5rem] lg:text-[3.25rem] leading-tight tracking-[-0.02em]">
            RESULTADO QUE<br className="hidden lg:block" />
            <span className="text-gradient-accent">SE VÊ.</span>
          </h2>
          <p className="text-[#8E8E93] mt-4 max-w-xl mx-auto leading-relaxed">
            Deslize para comparar o antes e depois dos serviços.{' '}
            <strong className="text-[#F2F2F7]">Resultados reais, fotos reais.</strong>
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <BeforeAfterCard
            before="/media/motor-sujo.png"
            after="/media/motor-limpo.png"
            title="Limpeza de Motor"
            subtitle="VW Gol 2018 · Troca de óleo + limpeza"
          />
          <BeforeAfterCard
            before="/media/coifa-mocineica-anes.jpeg"
            after="/media/depois.jpeg"
            title="Junta da Moicinética"
            subtitle="Antes e depois · Serviço especializado"
          />
        </div>
      </div>
    </section>
  );
}
