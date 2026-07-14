import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../../hooks/useApi';

export default function Dashboard() {
  const api = useApi();
  const [stats, setStats] = useState({ leads: 0, products: 0, os: 0, users: 0 });
  const [loading, setLoading] = useState(true);
  const [recentLeads, setRecentLeads] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const [leadsRes, estoqueRes, osRes, usersRes, pipelineRes] = await Promise.allSettled([
          api.getLeads({ limit: 100 }),
          api.getEstoque(),
          api.getOs({ limit: 100 }),
          api.getUsers({ limit: 100 }),
          api.getPipelineSummary(),
        ]);

        const leads = leadsRes.value?.data || [];
        const estoque = estoqueRes.value || [];
        const os = osRes.value?.data || [];
        const users = usersRes.value?.users || [];
        const pipeline = pipelineRes.value?.data || [];

        setStats({
          leads: leads.length,
          products: estoque.length,
          os: os.length,
          users: users.length,
          pipeline,
        });

        setRecentLeads(leads.slice(0, 5));
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="inline-block w-8 h-8 border-2 border-[#0044CC] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statusColors = {
    lead_qualificado: '#0044CC',
    agendado: '#FF9F0A',
    em_andamento: '#0A84FF',
    finalizado: '#30D158',
    perdido: '#FF453A',
  };

  const statusLabels = {
    lead_qualificado: 'Qualificado',
    agendado: 'Agendado',
    em_andamento: 'Em Andamento',
    finalizado: 'Finalizado',
    perdido: 'Perdido',
  };

  return (
    <div>
      <h1 className="font-sans font-bold text-2xl mb-1">Dashboard</h1>
      <p className="text-sm text-[#636366] mb-8">Resumo operacional da Garagem do MEEC</p>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard value={stats.leads} label="Leads" icon="👥" color="#0044CC" to="/admin/leads" />
        <SummaryCard value={stats.products} label="Produtos" icon="📦" color="#30D158" to="/admin/estoque" />
        <SummaryCard value={stats.os} label="Ordens de Serviço" icon="🔧" color="#FF9F0A" to="/admin/os" />
        <SummaryCard value={stats.users} label="Usuários" icon="👤" color="#0A84FF" to="/admin/usuarios" />
      </div>

      {/* Pipeline summary */}
      {stats.pipeline && stats.pipeline.length > 0 && (
        <div className="dash-card p-6 mb-8">
          <h2 className="font-sans font-bold text-base mb-4">Pipeline de Leads</h2>
          <div className="space-y-3">
            {stats.pipeline.map((item) => (
              <div key={item.status}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-[#8E8E93]">
                    {statusLabels[item.status] || item.status}
                  </span>
                  <span className="font-mono font-bold text-[#F2F2F7]">{item.count}</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${Math.min(100, (item.count / Math.max(...stats.pipeline.map((p) => p.count))) * 100)}%`,
                      background: statusColors[item.status] || '#0044CC',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent leads */}
      <div className="dash-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sans font-bold text-base">Leads Recentes</h2>
          <Link
            to="/admin/leads"
            className="text-xs text-[#0044CC] hover:text-[#0A84FF] font-medium"
          >
            Ver todos →
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <p className="text-sm text-[#636366] text-center py-8">Nenhum lead registrado</p>
        ) : (
          <div className="space-y-2">
            {recentLeads.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between p-3 rounded-lg bg-[#08080A] border border-[#1C1C21]"
              >
                <div>
                  <p className="text-sm font-medium">{lead.name}</p>
                  <p className="text-xs text-[#636366] font-mono">{lead.whatsapp}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="tag text-[10px]"
                    style={{
                      backgroundColor: `${statusColors[lead.status] || '#636366'}15`,
                      color: statusColors[lead.status] || '#636366',
                      border: `1px solid ${statusColors[lead.status] || '#636366'}20`,
                    }}
                  >
                    {statusLabels[lead.status] || lead.status}
                  </span>
                  <span className="text-[10px] text-[#636366] font-mono">
                    {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ value, label, icon, color, to }) {
  return (
    <Link to={to} className="dash-card p-6 hover:translate-y-0">
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
          style={{ backgroundColor: `${color}15`, border: `1px solid ${color}25` }}
        >
          {icon}
        </div>
        <div>
          <div className="font-mono font-bold text-2xl" style={{ color }}>{value}</div>
          <div className="text-xs text-[#636366]">{label}</div>
        </div>
      </div>
    </Link>
  );
}
