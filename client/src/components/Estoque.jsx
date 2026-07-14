import React from 'react';
import useEstoque from '../hooks/useEstoque';

export default function Estoque({ onAddToCart, onOpenCart }) {
  const { products, loading, error } = useEstoque();

  return (
    <section id="estoque" className="border-t border-[#1C1C21] py-20 lg:py-28 grid-overlay">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="tag bg-[#30D158]/10 text-[#30D158] border border-[#30D158]/20 mb-4 justify-center">
            ● Estoque Virtual
          </div>
          <h2 className="section-title font-sans font-black text-[2.5rem] lg:text-[3.25rem] leading-tight tracking-[-0.02em]">
            PEÇAS E KITS<br className="hidden lg:block" />
            <span className="text-gradient-accent">DIRETO DA OFICINA.</span>
          </h2>
          <p className="text-[#8E8E93] mt-4 max-w-xl mx-auto leading-relaxed">
            Produtos disponíveis para retirada ou entrega. <strong className="text-[#F2F2F7]">Pagamento via PIX</strong> —
            estoque atualizado manualmente pelo MEEC.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4" id="estoque-grid">
          {loading ? (
            <div className="text-center py-12 col-span-full">
              <div className="inline-block w-8 h-8 border-2 border-[#0044CC] border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm text-[#636366]">Carregando produtos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 col-span-full">
              <p className="text-sm text-[#FF453A]">Erro ao carregar produtos.</p>
              <p className="text-xs text-[#636366] mt-1">Tente novamente mais tarde.</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 col-span-full">
              <p className="text-sm text-[#636366]">Nenhum produto disponível no momento.</p>
            </div>
          ) : (
            products.map((product) => (
              <div key={product.id} className="dash-card p-4 group">
                <div className="media-placeholder aspect-square mb-3 product-img-container overflow-hidden rounded-lg">
                  <img
                    src={product.imagem || '/media/logo-oficial.png'}
                    alt={product.nome}
                    className="w-full h-full object-cover product-img"
                    loading="lazy"
                    onError={(e) => { e.target.src = '/media/logo-oficial.png'; }}
                  />
                </div>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-[10px] font-mono text-[#636366] uppercase tracking-wider">
                    {product.categoria || 'geral'}
                  </span>
                  <span className="price-tag bg-[#30D158]/10 text-[#30D158]">
                    R$ {Number(product.preco).toFixed(2)}
                  </span>
                </div>
                <h3 className="font-sans font-bold text-sm mb-1">{product.nome}</h3>
                {product.descricao && (
                  <p className="text-xs text-[#636366] mb-3 line-clamp-2">{product.descricao}</p>
                )}
                <button
                  onClick={() => onAddToCart(product)}
                  className="btn-primary text-xs w-full py-2"
                >
                  🛒 Adicionar ao Carrinho
                </button>
              </div>
            ))
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 p-6 dash-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#30D158]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#30D158]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium">Estoque verificado manualmente</p>
              <p className="text-xs text-[#636366]">Consulte disponibilidade via WhatsApp antes de vir retirar</p>
            </div>
          </div>
          <button onClick={onOpenCart} className="btn-primary text-sm px-6 py-3">
            🛒 Ver Carrinho
          </button>
        </div>
      </div>
    </section>
  );
}
