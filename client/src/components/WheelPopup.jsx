import React, { useEffect } from 'react';

export default function WheelPopup({ show, onClose, onOpenWheel }) {
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [show]);

  if (!show) return null;

  return (
    <div className="wheel-popup-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="wheel-popup" onClick={(e) => e.stopPropagation()}>
        <button className="wheel-popup-close" onClick={onClose} aria-label="Fechar">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="popup-tag">OFERTA EXCLUSIVA</div>
        <span className="popup-icon" style={{ fontSize: '56px', display: 'block', marginBottom: '12px' }}>🎰</span>
        <h2>
          GIRE A ROLETA<br />
          <span style={{ background: 'linear-gradient(135deg,#0044CC,#F5C800)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            E GANHE PRÊMIOS!
          </span>
        </h2>
        <p>
          Descontos de <strong style={{ color: '#F2F2F7' }}>até R$ 100</strong> em serviços, brindes exclusivos e muito mais!<br />
          <span style={{ color: '#636366', fontSize: '12px' }}>🎁 Válido somente na realização de algum serviço</span>
        </p>
        <button className="popup-btn" onClick={onOpenWheel}>
          🎯 GIRAR AGORA
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
        <button className="popup-skip" onClick={onClose}>Agora não, obrigado</button>
      </div>
    </div>
  );
}
