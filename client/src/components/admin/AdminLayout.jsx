import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/leads', label: 'Leads', icon: '👥' },
  { path: '/admin/estoque', label: 'Estoque', icon: '📦' },
  { path: '/admin/os', label: 'Ordens de Serviço', icon: '🔧' },
  { path: '/admin/usuarios', label: 'Usuários', icon: '👤' },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#08080A] flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0F0F12] border-r border-[#1C1C21] transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-[#1C1C21]">
          <Link to="/" className="flex items-center gap-3">
            <div className="font-sans font-extrabold text-sm tracking-tight">
              GARAGEM <span className="text-[#0044CC]">DO MEEC</span>
            </div>
          </Link>
          <p className="font-mono text-[10px] text-[#636366] mt-1 tracking-wider uppercase">
            Painel Administrativo
          </p>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#0044CC]/10 text-[#0044CC] border border-[#0044CC]/20'
                    : 'text-[#8E8E93] hover:text-[#F2F2F7] hover:bg-[#1C1C21]'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#1C1C21]">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-[#0044CC] flex items-center justify-center text-xs font-bold text-white">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'Usuário'}</p>
              <p className="text-[10px] text-[#636366] font-mono">{user?.roleLabel || user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-[#0F0F12]/90 backdrop-blur-xl border-b border-[#1C1C21]">
          <div className="flex items-center justify-between px-6 h-14">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden text-[#8E8E93] hover:text-[#F2F2F7] bg-transparent border-0 cursor-pointer"
                onClick={() => setSidebarOpen(true)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Link to="/" className="text-xs text-[#636366] hover:text-[#8E8E93] font-mono">
                ← Voltar ao site
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="text-xs text-[#8E8E93] hover:text-[#FF453A] bg-transparent border-0 cursor-pointer font-medium transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
