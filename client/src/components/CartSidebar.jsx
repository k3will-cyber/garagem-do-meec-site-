import React from 'react';

export default function CartSidebar({ items, isOpen, total, onClose, onUpdateQty, onRemove, onCheckout }) {
  return (
    <>
      <div
        className={`cart-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <div>
            <h3 className="font-sans font-bold text-base">🛒 Carrinho</h3>
            <p className="text-xs text-[#636366]">Itens do seu pedido</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-[#1C1C21] hover:bg-[#2A2A31] flex items-center justify-center border-0 cursor-pointer transition-all"
          >
            <svg className="w-4 h-4 text-[#8E8E93]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="cart-items">
          {items.length === 0 ? (
            <div className="cart-empty">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              <span className="font-mono text-xs tracking-wider">CARRINHO VAZIO</span>
              <p className="text-xs mt-2">Adicione produtos do estoque</p>
            </div>
          ) : (
            <div id="cart-list">
              {items.map((item) => (
                <div key={item.id} className="cart-item">
                  <img
                    src={item.imagem || '/media/logo-oficial.png'}
                    alt={item.nome}
                    className="cart-item-img"
                    onError={(e) => { e.target.src = '/media/logo-oficial.png'; }}
                  />
                  <div className="cart-item-info">
                    <div className="name">{item.nome}</div>
                    <div className="price">R$ {Number(item.preco).toFixed(2)}</div>
                  </div>
                  <div className="cart-item-qty">
                    <button onClick={() => onUpdateQty(item.id, -1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => onUpdateQty(item.id, 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-footer">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-[#636366]">Total</span>
              <span className="font-mono font-bold text-xl text-[#F2F2F7]">
                R$ {total.toFixed(2)}
              </span>
            </div>
            <button onClick={onCheckout} className="btn-primary w-full text-sm py-3">
              💬 Comprar via WhatsApp
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            <p className="text-[10px] text-[#636366] text-center mt-2 font-mono">
              Pagamento via PIX · Envio em 24h úteis
            </p>
          </div>
        )}
      </div>
    </>
  );
}
