import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080A] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="font-sans font-extrabold text-xl tracking-tight mb-1">
            GARAGEM <span className="text-[#0044CC]">DO MEEC</span>
          </div>
          <p className="text-sm text-[#636366]">Painel Administrativo</p>
        </div>

        <div className="dash-card p-8">
          <h2 className="font-sans font-bold text-lg mb-6">Entrar</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#8E8E93] mb-1.5">Usuário</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#08080A] border border-[#1C1C21] rounded-lg px-4 py-3 text-sm text-[#F2F2F7] placeholder-[#636366] focus:outline-none focus:border-[#0044CC]/50 transition-all"
                placeholder="Seu usuário"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8E8E93] mb-1.5">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#08080A] border border-[#1C1C21] rounded-lg px-4 py-3 text-sm text-[#F2F2F7] placeholder-[#636366] focus:outline-none focus:border-[#0044CC]/50 transition-all"
                placeholder="Sua senha"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-[#FF453A]/10 border border-[#FF453A]/20 rounded-lg text-xs text-[#FF453A] text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-sm py-3 justify-center"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#1C1C21] text-center">
            <a href="/" className="text-xs text-[#636366] hover:text-[#8E8E93] font-mono">
              ← Voltar ao site
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
