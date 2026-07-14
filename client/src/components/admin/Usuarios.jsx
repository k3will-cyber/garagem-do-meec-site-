import { useState, useEffect } from 'react';
import useApi from '../../hooks/useApi';

export default function Usuarios() {
  const api = useApi();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const res = await api.getUsers({ limit: 100 });
        setUsers(res.users || []);
      } catch (err) {
        console.error('Erro ao carregar usuários:', err);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  async function handleDelete(id) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      await api.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert('Erro ao excluir: ' + err.message);
    }
  }

  const roleLabels = {
    superadmin: 'Super Admin',
    admin: 'Administrador',
    user: 'Usuário',
    operador: 'Operador',
  };

  const roleColors = {
    superadmin: '#0044CC',
    admin: '#0A84FF',
    user: '#636366',
    operador: '#FF9F0A',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-sans font-bold text-2xl mb-1">Usuários</h1>
          <p className="text-sm text-[#636366]">{users.length} usuário{users.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#0044CC] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="dash-card p-12 text-center">
          <p className="text-sm text-[#636366]">Nenhum usuário encontrado</p>
        </div>
      ) : (
        <div className="dash-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1C1C21]">
                  <th className="text-left px-4 py-3 text-[#636366] font-medium text-xs uppercase tracking-wider">Nome</th>
                  <th className="text-left px-4 py-3 text-[#636366] font-medium text-xs uppercase tracking-wider">Usuário</th>
                  <th className="text-left px-4 py-3 text-[#636366] font-medium text-xs uppercase tracking-wider">Email</th>
                  <th className="text-left px-4 py-3 text-[#636366] font-medium text-xs uppercase tracking-wider">Função</th>
                  <th className="text-left px-4 py-3 text-[#636366] font-medium text-xs uppercase tracking-wider">Provedor</th>
                  <th className="text-right px-4 py-3 text-[#636366] font-medium text-xs uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-[#1C1C21] hover:bg-[#0F0F12]">
                    <td className="px-4 py-3 font-medium">{user.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#8E8E93]">{user.username}</td>
                    <td className="px-4 py-3 text-xs text-[#8E8E93]">{user.email || '-'}</td>
                    <td className="px-4 py-3">
                      <span
                        className="tag text-[10px]"
                        style={{
                          backgroundColor: `${roleColors[user.role] || '#636366'}15`,
                          color: roleColors[user.role] || '#636366',
                          border: `1px solid ${roleColors[user.role] || '#636366'}20`,
                        }}
                      >
                        {roleLabels[user.role] || user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#636366]">{user.auth_provider || 'local'}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-[#FF453A] hover:text-[#FF453A]/80 text-xs font-medium bg-transparent border-0 cursor-pointer"
                      >
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
