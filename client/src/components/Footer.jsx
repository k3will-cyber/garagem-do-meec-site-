import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-[#1C1C21] py-8">
      <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <img
            src="/media/logo-oficial.png"
            alt="Garagem do MEEC"
            className="w-8 h-8 rounded-lg object-cover"
          />
          <div>
            <p className="font-sans font-bold text-sm">
              GARAGEM <span className="text-[#0044CC]">DO MEEC</span>
            </p>
            <p className="font-mono text-[10px] text-[#636366] tracking-widest uppercase">
              © 2026 · Dados reais, serviço real
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-xs text-[#636366]">
          <span className="font-mono">📍 Valparaíso de Goiás · GO</span>
          <span className="hidden sm:inline text-[#2A2A31]">|</span>
          <span className="hidden sm:inline font-mono">Feito com dados, não com achismo</span>
        </div>
      </div>
    </footer>
  );
}
