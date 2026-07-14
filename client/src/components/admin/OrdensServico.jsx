import React, { useState, useEffect } from 'react';
import useApi from '../../hooks/useApi';

const statusOptions = [
  { value: 'aberta', label: 'Aberta', color: '#0A84FF' },
  { value: 'em_andamento', label: 'Em Andamento', color: '#FF9F0A' },
  { value: 'aguardando_peca', label: 'Aguardando Peça', color: '#FF9F0A' },
  { value: 'finalizada', label: 'Finalizada', color: '#30D158' },
  { value: 'entregue', label: 'Entregue', color: '#30D158' },
  { value: 'cancelada', label: 'Cancelada', color: '#FF453A' },
];

export default function OrdensServico() {
  const api = useApi();
  const [osList, setOsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    cliente_nome: '',
    cliente_whatsapp: '',
    cliente_email: '',
    veiculo: '',
    placa: '',
    km: '',
    servico_desc: '',
    prioridade: 'normal',
  });

  useEffect(() => {
    loadOs();
  }, [statusFilter]);

  async function loadOs() {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (statusFilter) params.status = statusFilter;
      const res = await api.getOs(params);
      setOsList(res.data || []);
    } catch (err) {
      console.error('Erro ao carregar OS:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.createOs({
        ...form,
        km: parseInt(form.km) || 0,
      });
      setShowForm(false);
      setForm({ cliente_nome: '', cliente_whatsapp: '', cliente_email: '', veiculo: '', placa: '', km: '', servico_desc: '', prioridade: 'normal' });
      loadOs();
    } catch (err) {
      alert('Erro ao criar OS: ' + err.message);
    }
  }

  async function updateStatus(osId, newStatus) {
    try {
      await api.updateOs(osId, { status: newStatus });
      loadOs();
    } catch (err) {
      alert('Erro ao atualizar status: ' + err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Tem certeza que deseja excluir esta OS?')) return;
    try {
      await api.deleteOs(id);
      setOsList((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      alert('Erro ao excluir: ' + err.message);
    }
  }

  const filtered = search
    ? osList.filter(
        (o) =>
          o.cliente_nome?.toLowerCase().includes(search.toLowerCase()) ||
          o.veiculo?.toLowerCase().includes(search.toLowerCase()) ||
          o.placa?.toLowerCase().includes(search)
      )
    : osList;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-sans font-bold text-2xl mb-1">Ordens de Serviço</h1>
          <p className="text-sm text-[#636366]">{filtered.length} OS</p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Buscar cliente, veículo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#08080A] border border-[#1C1C21] rounded-lg px-4 py-2.5 text-sm text-[#F2F2F7] placeholder-[#636366] focus:outline-none focus:border-[#0044CC]/50 transition-all w-full sm:w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#08080A] border border-[#1C1C21] rounded-lg px-4 py-2.5 text-sm text-[#F2F2F7] focus:outline-none focus:border-[#0044CC]/50 transition-all"
          >
            <option value="">Todos</option>
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* New OS button & form */}
      <button onClick={() => setShowForm(true)} className="btn-primary text-sm px-5 py-2.5 mb-6">
        + Nova OS
      </button>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="dash-card w-full max-w-lg p-6 lg:p-8" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-sans font-bold text-lg mb-6">Nova Ordem de Serviço</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#8E8E93] mb-1.5">Cliente *</label>
                  <input type="text" value={form.cliente_nome} onChange={(e) => setForm((f) => ({ ...f, cliente_nome: e.target.value }))} className="w-full bg-[#08080A] border border-[#1C1C21] rounded-lg px-4 py-3 text-sm text-[#F2F2F7] focus:outline-none focus:border-[#0044CC]/50 transition-all" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8E8E93] mb-1.5">WhatsApp</label>
                  <input type="tel" value={form.cliente_whatsapp} onChange={(e) => setForm((f) => ({ ...f, cliente_whatsapp: e.target.value }))} className="w-full bg-[#08080A] border border-[#1C1C21] rounded-lg px-4 py-3 text-sm text-[#F2F2F7] focus:outline-none focus:border-[#0044CC]/50 transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#8E8E93] mb-1.5">Veículo *</label>
                  <input type="text" value={form.veiculo} onChange={(e) => setForm((f) => ({ ...f, veiculo: e.target.value }))} className="w-full bg-[#08080A] border border-[#1C1C21] rounded-lg px-4 py-3 text-sm text-[#F2F2F7] focus:outline-none focus:border-[#0044CC]/50 transition-all" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8E8E93] mb-1.5">Placa</label>
                  <input type="text" value={form.placa} onChange={(e) => setForm((f) => ({ ...f, placa: e.target.value }))} className="w-full bg-[#08080A] border border-[#1C1C21] rounded-lg px-4 py-3 text-sm text-[#F2F2F7] focus:outline-none focus:border-[#0044CC]/50 transition-all uppercase" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8E8E93] mb-1.5">Descrição do Serviço</label>
                <textarea rows={3} value={form.servico_desc} onChange={(e) => setForm((f) => ({ ...f, servico_desc: e.target.value }))} className="w-full bg-[#08080A] border border-[#1C1C21] rounded-lg px-4 py-3 text-sm text-[#F2F2F7] focus:outline-none focus:border-[#0044CC]/50 transition-all resize-none" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1 text-sm py-3 justify-center">Criar OS</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 text-sm py-3 justify-center">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OS List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#0044CC] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="dash-card p-12 text-center">
          <p className="text-sm text-[#636366]">Nenhuma OS encontrada</p>
        </div>
      ) : (
        <div className="dash-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1C1C21]">
                  <th className="text-left px-4 py-3 text-[#636366] font-medium text-xs uppercase tracking-wider">Cliente</th>
                  <th className="text-left px-4 py-3 text-[#636366] font-medium text-xs uppercase tracking-wider">Veículo</th>
                  <th className="text-left px-4 py-3 text-[#636366] font-medium text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-[#636366] font-medium text-xs uppercase tracking-wider">Prioridade</th>
                  <th className="text-left px-4 py-3 text-[#636366] font-medium text-xs uppercase tracking-wider">Data</th>
                  <th className="text-right px-4 py-3 text-[#636366] font-medium text-xs uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((os) => (
                  <tr key={os.id} className="border-b border-[#1C1C21] hover:bg-[#0F0F12]">
                    <td className="px-4 py-3">
                      <p className="font-medium">{os.cliente_nome}</p>
                      {os.cliente_whatsapp && (
                        <p className="text-xs text-[#636366] font-mono">{os.cliente_whatsapp}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p>{os.veiculo}</p>
                      {os.placa && <p className="text-xs text-[#636366] font-mono">{os.placa}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={os.status}
                        onChange={(e) => updateStatus(os.id, e.target.value)}
                        className="bg-[#08080A] border border-[#1C1C21] rounded-lg px-3 py-1.5 text-xs text-[#F2F2F7] focus:outline-none cursor-pointer"
                        style={{
                          borderColor: `${(statusOptions.find((s) => s.value === os.status)?.color || '#636366')}30`,
                        }}
                      >
                        {statusOptions.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${os.prioridade === 'alta' ? 'text-[#FF453A]' : os.prioridade === 'urgente' ? 'text-[#FF9F0A]' : 'text-[#636366]'}`}>
                        {os.prioridade || 'normal'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#636366] font-mono">
                      {new Date(os.data_entrada || os.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(os.id)} className="text-[#FF453A] hover:text-[#FF453A]/80 text-xs font-medium bg-transparent border-0 cursor-pointer">
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
