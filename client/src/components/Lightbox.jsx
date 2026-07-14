import React, { useEffect, useCallback } from 'react';

export default function Lightbox({ src, onClose }) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (src) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [src, handleKeyDown]);

  if (!src) return null;

  return (
    <div className="lightbox-overlay open" onClick={onClose}>
      <div className="close-btn" onClick={onClose}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <div
        className="media-placeholder w-full max-w-4xl aspect-video flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt="Imagem ampliada"
          className="max-w-full max-h-[90vh] rounded-xl object-contain"
        />
      </div>
    </div>
  );
}
