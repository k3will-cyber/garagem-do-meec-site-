import React, { useState, useEffect } from 'react';
import useApi from '../../hooks/useApi';

const emptyProduct = {
  nome: '',
  descricao: '',
  preco: '',
  imagem: '',
  categoria: 'geral',
  quantidade: 1,
};

export default function Estoque() {
  const api = useApi();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyProduct);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await api.getEstoque();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao carregar estoque:', err);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setForm(emptyProduct);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(product) {
    setForm({
      nome: product.nome || '',
      descricao: product.descricao || '',
      preco: product.preco || '',
      imagem: product.imagem || '',
      categoria: product.categoria || 'geral',
      quantidade: product.quantidade || 1,
    });
    setEditingId(product.id);
    setShowForm(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      const data = {
        nome: form.nome,
        descricao: form.descricao || '',
        preco: parseFloat(form.preco) || 0,
        imagem: form.imagem || '',
        categoria: form.categoria || 'geral',
        quantidade: parseInt(form.quantidade) || 1,
      };

      if (editingId) {
        await api.updateProduct(editingId, data);
      } else {
        await api.createProduct(data);
      }

      setShowForm(false);
      setEditingId(null);
      loadProducts();
    } catch (err) {
      alert('Erro ao salvar: ' + err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert('Erro ao excluir: ' + err.message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-sans font-bold text-2xl mb-1">Estoque</h1>
          <p className="text-sm text-[#636366]">{products.length} produto{products.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm px-5 py-2.5">
          + Novo Produto
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="dash-card w-full max-w-lg p-6 lg:p-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-sans font-bold text-lg mb-6">
              {editingId ? 'Editar Produto' : 'Novo Produto'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#8E8E93] mb-1.5">Nome *</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  className="w-full bg-[#08080A] border border-[#1C1C21] rounded-lg px-4 py-3 text-sm text-[#F2F2F7] placeholder-[#636366] focus:outline-none focus:border-[#0044CC]/50 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8E8E93] mb-1.5">Descrição</label>
                <textarea
                  rows={3}
                  value={form.descricao}
                  onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                  className="w-full bg-[#08080A] border border-[#1C1C21] rounded-lg px-4 py-3 text-sm text-[#F2F2F7] placeholder-[#636366] focus:outline-none focus:border-[#0044CC]/50 transition-all resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#8E8E93] mb-1.5">Preço *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.preco}
                    onChange={(e) => setForm((f) => ({ ...f, preco: e.target.value }))}
                    className="w-full bg-[#08080A] border border-[#1C1C21] rounded-lg px-4 py-3 text-sm text-[#F2F2F7] placeholder-[#636366] focus:outline-none focus:border-[#0044CC]/50 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8E8E93] mb-1.5">Quantidade</label>
                  <input
                    type="number"
                    value={form.quantidade}
                    onChange={(e) => setForm((f) => ({ ...f, quantidade: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-[#08080A] border border-[#1C1C21] rounded-lg px-4 py-3 text-sm text-[#F2F2F7] placeholder-[#636366] focus:outline-none focus:border-[#0044CC]/50 transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#8E8E93] mb-1.5">Categoria</label>
                  <select
                    value={form.categoria}
                    onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
                    className="w-full bg-[#08080A] border border-[#1C1C21] rounded-lg px-4 py-3 text-sm text-[#F2F2F7] focus:outline-none focus:border-[#0044CC]/50 transition-all"
                  >
                    <option value="geral">Geral</option>
                    <option value="oleo">Óleo</option>
                    <option value="filtro">Filtro</option>
                    <option value="freio">Freio</option>
                    <option value="suspensao">Suspensão</option>
                    <option value="kit">Kit</option>
                    <option value="peca">Peça</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8E8E93] mb-1.5">URL da Imagem</label>
                  <input
                    type="text"
                    value={form.imagem}
                    onChange={(e) => setForm((f) => ({ ...f, imagem: e.target.value }))}
                    className="w-full bg-[#08080A] border border-[#1C1C21] rounded-lg px-4 py-3 text-sm text-[#F2F2F7] placeholder-[#636366] focus:outline-none focus:border-[#0044CC]/50 transition-all"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1 text-sm py-3 justify-center">
                  {editingId ? 'Salvar Alterações' : 'Criar Produto'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 text-sm py-3 justify-center">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#0044CC] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="dash-card p-12 text-center">
          <p className="text-sm text-[#636366]">Nenhum produto cadastrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <div key={product.id} className="dash-card p-4">
              <div className="media-placeholder aspect-square mb-3 rounded-lg overflow-hidden">
                <img
                  src={product.imagem || '/media/logo-oficial.png'}
                  alt={product.nome}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = '/media/logo-oficial.png'; }}
                />
              </div>
              <div className="flex items-start justify-between mb-1">
                <span className="text-[10px] font-mono text-[#636366] uppercase tracking-wider">
                  {product.categoria || 'geral'}
                </span>
                <span className="price-tag bg-[#30D158]/10 text-[#30D158]">
                  R$ {Number(product.preco).toFixed(2)}
                </span>
              </div>
              <h3 className="font-sans font-bold text-sm mb-1">{product.nome}</h3>
              {product.descricao && (
                <p className="text-xs text-[#636366] mb-2 line-clamp-2">{product.descricao}</p>
              )}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1C1C21]">
                <span className={`text-xs font-mono ${product.quantidade > 0 ? 'text-[#30D158]' : 'text-[#FF453A]'}`}>
                  {product.quantidade} em estoque
                </span>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(product)} className="text-[#0A84FF] hover:text-[#0A84FF]/80 text-xs bg-transparent border-0 cursor-pointer">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="text-[#FF453A] hover:text-[#FF453A]/80 text-xs bg-transparent border-0 cursor-pointer">
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
