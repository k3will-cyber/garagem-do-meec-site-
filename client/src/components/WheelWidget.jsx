import React from 'react';

export default function WheelWidget({
  canvasRef,
  isSpinning,
  spinCount,
  showRegModal,
  showResultModal,
  currentPrize,
  regData,
  setRegData,
  onSpin,
  onCloseReg,
  onCloseResult,
  onOpenReg,
}) {
  return (
    <>
      {/* Wheel Card */}
      <div className="dash-card dash-card-accent p-5 relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#F5C800]/5 rounded-bl-full" />
        <div className="relative flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-1">
            <span className="tag bg-[#F5C800]/10 text-[#F5C800] border border-[#F5C800]/20 font-mono text-[10px]">
              🎰 ROLETA MEEC
            </span>
            <span className="font-mono text-[10px] text-[#30D158]">● Online</span>
          </div>
          <div className="wheel-wrapper my-3" style={{ width: 'min(200px, 85%)' }}>
            <div className="wheel-pointer" />
            <canvas
              ref={canvasRef}
              id="wheel-canvas"
              className="wheel-canvas"
              width="400"
              height="400"
            />
            <div className="wheel-center-dot" />
          </div>
          <button
            onClick={onOpenReg}
            disabled={isSpinning}
            className="wheel-btn btn-primary text-sm px-6 py-3 w-full justify-center text-[13px]"
          >
            🎯 GIRAR E GANHAR!
          </button>
          <div className="flex items-center justify-center gap-3 mt-2 text-[10px] text-[#636366]">
            <span className="status-dot live" />
            <span>
              <strong className="text-[#F2F2F7]">{spinCount}</strong> prêmios hoje
            </span>
            <span className="font-mono text-[10px] text-[#636366]" id="wheel-spins-left">
              1 giro disponível
            </span>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      <div
        className={`wheel-modal-overlay ${showRegModal ? 'open' : ''}`}
        onClick={(e) => { if (e.target === e.currentTarget) onCloseReg(); }}
      >
        <div className="wheel-modal" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-sans font-bold text-lg">🎰 GIRAR ROLETA</h3>
            <button
              onClick={onCloseReg}
              className="w-8 h-8 rounded-lg bg-[#1C1C21] hover:bg-[#2A2A31] flex items-center justify-center border-0 cursor-pointer transition-all"
            >
              <svg className="w-4 h-4 text-[#8E8E93]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-[#636366] mb-5">
            Preencha seus dados para girar a roleta e concorrer a prêmios exclusivos!
          </p>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Seu nome"
              maxLength={60}
              value={regData.name}
              onChange={(e) => setRegData((d) => ({ ...d, name: e.target.value }))}
            />
            <input
              type="tel"
              placeholder="WhatsApp (com DDD)"
              maxLength={20}
              value={regData.whatsapp}
              onChange={(e) => setRegData((d) => ({ ...d, whatsapp: e.target.value }))}
            />
            <button
              onClick={onSpin}
              disabled={isSpinning || !regData.name || !regData.whatsapp}
              className="btn-primary w-full text-sm py-3 justify-center"
            >
              {isSpinning ? '🎰 Girando...' : '🎯 GIRAR!'}
            </button>
          </div>
          <p className="text-[10px] text-[#636366] mt-3">
            *Prêmio válido somente na realização de algum serviço. 1 giro por dispositivo.
          </p>
        </div>
      </div>

      {/* Result Modal */}
      <div
        className={`wheel-modal-overlay ${showResultModal ? 'open' : ''}`}
        onClick={(e) => { if (e.target === e.currentTarget) onCloseResult(); }}
      >
        <div
          className="wheel-modal"
          onClick={(e) => e.stopPropagation()}
          style={{ borderColor: currentPrize?.color || '#0044CC' }}
        >
          <div className="text-5xl mb-3">🎉</div>
          <h3 className="font-sans font-bold text-xl mb-2">PARABÉNS!</h3>
          <p className="text-sm text-[#8E8E93] mb-1">Você ganhou:</p>
          <div
            className="prize-badge text-lg mb-3"
            style={{ background: currentPrize?.color || '#0044CC', color: '#fff' }}
          >
            {currentPrize?.name}
          </div>
          <div className="dash-card p-3 mb-4 text-center bg-[#08080A]">
            <p className="text-[10px] text-[#636366] uppercase tracking-wider">Cupom</p>
            <p className="font-mono font-bold text-lg text-[#F5C800] tracking-wider">
              {currentPrize?.coupon}
            </p>
          </div>
          <p className="text-[10px] text-[#FF9F0A] mb-4">
            *Válido somente na realização de algum serviço. Apresente o cupom na oficina.
          </p>
          <a
            href={`https://wa.me/5561981257477?text=${encodeURIComponent(
              `🎉 Acabei de girar a Roleta MEEC e ganhei: ${currentPrize?.name}!\n\n🏆 Meu cupom: ${currentPrize?.coupon}\n\nQuero resgatar meu prêmio!`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full text-sm py-3 justify-center"
            style={{ background: '#30D158' }}
          >
            💬 Resgatar via WhatsApp
          </a>
          <button
            onClick={onCloseResult}
            className="btn-secondary w-full text-xs py-2 justify-center mt-2"
          >
            Fechar
          </button>
        </div>
      </div>
    </>
  );
}
