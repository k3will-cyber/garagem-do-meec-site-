import React, { useState, useEffect } from 'react';
import useApi from '../../hooks/useApi';

const statusOptions = [
  { value: 'lead_qualificado', label: 'Qualificado', color: '#0044CC' },
  { value: 'agendado', label: 'Agendado', color: '#FF9F0A' },
  { value: 'em_andamento', label: 'Em Andamento', color: '#0A84FF' },
  { value: 'finalizado', label: 'Finalizado', color: '#30D158' },
  { value: 'perdido', label: 'Perdido', color: '#FF453A' },
];

export default function Leads() {
  const api = useApi();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    loadLeads();
  }, [statusFilter]);

  async function loadLeads() {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      params.limit = 100;
      const res = await api.getLeads(params);
      setLeads(res.data || []);
    } catch (err) {
      console.error('Erro ao carregar leads:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Tem certeza que deseja excluir este lead?')) return;
    try {
      await api.deleteLead(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      alert('Erro ao excluir: ' + err.message);
    }
  }

  function startEdit(lead) {
    setEditingId(lead.id);
    setEditData({
      name: lead.name,
      whatsapp: lead.whatsapp,
      email: lead.email || '',
      message: lead.message || '',
      status: lead.status || 'lead_qualificado',
      veiculo: lead.veiculo || '',
      servico_interesse: lead.servico_interesse || '',
    });
  }

  async function saveEdit(id) {
    try {
      await api.updateLead(id, editData);
      setEditingId(null);
      loadLeads();
    } catch (err) {
      alert('Erro ao salvar: ' + err.message);
    }
  }

  const filteredLeads = search
    ? leads.filter(
        (l) =>
          l.name?.toLowerCase().includes(search.toLowerCase()) ||
          l.whatsapp?.includes(search)
      )
    : leads;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-sans font-bold text-2xl mb-1">Leads</h1>
          <p className="text-sm text-[#636366]">
            {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Buscar por nome ou WhatsApp..."
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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#0044CC] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="dash-card p-12 text-center">
          <p className="text-sm text-[#636366]">Nenhum lead encontrado</p>
        </div>
      ) : (
        <div className="dash-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1C1C21]">
                  <th className="text-left px-4 py-3 text-[#636366] font-medium text-xs uppercase tracking-wider">Nome</th>
                  <th className="text-left px-4 py-3 text-[#636366] font-medium text-xs uppercase tracking-wider">WhatsApp</th>
                  <th className="text-left px-4 py-3 text-[#636366] font-medium text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-[#636366] font-medium text-xs uppercase tracking-wider">Veículo</th>
                  <th className="text-left px-4 py-3 text-[#636366] font-medium text-xs uppercase tracking-wider">Data</th>
                  <th className="text-right px-4 py-3 text-[#636366] font-medium text-xs uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-[#1C1C21] hover:bg-[#0F0F12]">
                    {editingId === lead.id ? (
                      <>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={editData.name}
                            onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))}
                            className="bg-[#08080A] border border-[#1C1C21] rounded px-2 py-1 text-sm w-full"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={editData.whatsapp}
                            onChange={(e) => setEditData((d) => ({ ...d, whatsapp: e.target.value }))}
                            className="bg-[#08080A] border border-[#1C1C21] rounded px-2 py-1 text-sm w-full"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={editData.status}
                            onChange={(e) => setEditData((d) => ({ ...d, status: e.target.value }))}
                            className="bg-[#08080A] border border-[#1C1C21] rounded px-2 py-1 text-sm"
                          >
                            {statusOptions.map((s) => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={editData.veiculo}
                            onChange={(e) => setEditData((d) => ({ ...d, veiculo: e.target.value }))}
                            className="bg-[#08080A] border border-[#1C1C21] rounded px-2 py-1 text-sm w-full"
                          />
                        </td>
                        <td className="px-4 py-3 text-[#636366] font-mono text-xs">
                          {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => saveEdit(lead.id)} className="text-[#30D158] hover:text-[#30D158]/80 text-xs font-medium mr-3 bg-transparent border-0 cursor-pointer">Salvar</button>
                          <button onClick={() => setEditingId(null)} className="text-[#8E8E93] hover:text-[#F2F2F7] text-xs font-medium bg-transparent border-0 cursor-pointer">Cancelar</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-medium">{lead.name}</td>
                        <td className="px-4 py-3 font-mono text-xs text-[#8E8E93]">
                          <a href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#30D158]">
                            {lead.whatsapp}
                          </a>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="tag text-[10px]"
                            style={{
                              backgroundColor: `${(statusOptions.find((s) => s.value === lead.status)?.color || '#636366')}15`,
                              color: statusOptions.find((s) => s.value === lead.status)?.color || '#636366',
                              border: `1px solid ${(statusOptions.find((s) => s.value === lead.status)?.color || '#636366')}20`,
                            }}
                          >
                            {statusOptions.find((s) => s.value === lead.status)?.label || lead.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-[#8E8E93]">{lead.veiculo || '-'}</td>
                        <td className="px-4 py-3 text-xs text-[#636366] font-mono">
                          {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => startEdit(lead)}
                            className="text-[#0A84FF] hover:text-[#0A84FF]/80 text-xs font-medium mr-3 bg-transparent border-0 cursor-pointer"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="text-[#FF453A] hover:text-[#FF453A]/80 text-xs font-medium bg-transparent border-0 cursor-pointer"
                          >
                            Excluir
                          </button>
                        </td>
                      </>
                    )}
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
