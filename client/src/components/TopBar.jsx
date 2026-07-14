import React from 'react';

export default function TopBar({ vagas = 3 }) {
  return (
    <div className="sticky top-0 z-50 bg-[#08080A]/90 backdrop-blur-xl border-b border-[#1C1C21]">
      <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between h-10">
        <div className="flex items-center gap-4 text-[11px] font-medium text-[#636366]">
          <div className="flex items-center gap-2">
            <span className="status-dot live" />
            <span className="uppercase tracking-wider text-[#30D158]">Sistema Online</span>
          </div>
          <span className="hidden sm:inline text-[#2A2A31]">|</span>
          <span className="hidden sm:inline text-[#8E8E93]">
            Valparaíso de Goiás · <span className="text-[#F2F2F7]">desde 2014</span>
          </span>
          <span className="text-[#2A2A31]">|</span>
          <span className="text-xs text-[#30D158] font-medium">
            🔥 <span>{vagas}</span> vagas hoje
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="tag bg-[#1C1C21] text-[#8E8E93] border border-[#2A2A31]">
            <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {' '}Seg–Sex 8h–18h
          </span>
          <a
            href="https://wa.me/5561981257477"
            target="_blank"
            rel="noopener noreferrer"
            className="tag bg-[#30D158]/10 text-[#30D158] border border-[#30D158]/20 font-semibold hover:bg-[#30D158]/20 transition-all"
          >
            📱 (61) 98125-7477
          </a>
          <span className="tag bg-[#0044CC]/10 text-[#0044CC] border border-[#0044CC]/20 font-semibold">
            🔥 <span>{vagas}</span> vagas hoje
          </span>
        </div>
      </div>
    </div>
  );
}
