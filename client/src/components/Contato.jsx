import React, { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://crm-garagem.onrender.com';

export default function Contato() {
  const [form, setForm] = useState({ name: '', whatsapp: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch(`${API_BASE}/api/public/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          whatsapp: form.whatsapp,
          email: form.email,
          message: form.message,
          origem: 'site',
        }),
      });
      if (!res.ok) throw new Error('Erro ao enviar');
      setStatus('success');
      setForm({ name: '', whatsapp: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <section id="contato" className="border-t border-[#1C1C21] py-20 lg:py-28">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="dash-card dash-card-accent p-8 lg:p-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0044CC]/5 to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#0044CC]/5 rounded-full blur-3xl" />

          <div className="relative">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="tag bg-[#0044CC]/10 text-[#0044CC] border border-[#0044CC]/20 mb-4 justify-center">
                ● Agende agora
              </div>
              <h2 className="section-title font-sans font-black text-[2.5rem] lg:text-[3.5rem] leading-tight tracking-[-0.02em]">
                VAGAS ABERTAS<br />
                <span className="text-gradient-accent">PRA ESTA SEMANA.</span>
              </h2>
              <p className="text-[#8E8E93] mt-4 max-w-lg mx-auto leading-relaxed">
                <strong className="text-[#0044CC]">3 vagas disponíveis hoje.</strong> Resposta em até 2h no horário
                comercial. WhatsApp é o canal mais rápido.
              </p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="status-dot live" />
                <span className="text-xs text-[#30D158] font-mono font-medium">
                  Online agora — respondemos em minutos
                </span>
              </div>
            </div>

            <div className="grid lg:grid-cols-5 gap-6 max-w-5xl mx-auto mb-10">
              {/* Left: Form */}
              <div className="lg:col-span-3">
                <div className="dash-card p-6 lg:p-8 h-full">
                  <h4 className="font-sans font-bold text-base mb-1">📋 Enviar Mensagem</h4>
                  <p className="text-xs text-[#636366] mb-6">
                    Preencha e enviaremos um orçamento por WhatsApp ou email
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#8E8E93] mb-1.5">Seu Nome</label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                          className="w-full bg-[#08080A] border border-[#1C1C21] rounded-lg px-4 py-3 text-sm text-[#F2F2F7] placeholder-[#636366] focus:outline-none focus:border-[#0044CC]/50 focus:ring-1 focus:ring-[#0044CC]/20 transition-all"
                          placeholder="Ex: João Silva"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#8E8E93] mb-1.5">WhatsApp</label>
                        <input
                          type="tel"
                          required
                          value={form.whatsapp}
                          onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                          className="w-full bg-[#08080A] border border-[#1C1C21] rounded-lg px-4 py-3 text-sm text-[#F2F2F7] placeholder-[#636366] focus:outline-none focus:border-[#0044CC]/50 focus:ring-1 focus:ring-[#0044CC]/20 transition-all"
                          placeholder="Ex: (61) 99999-9999"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#8E8E93] mb-1.5">E-mail (opcional)</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        className="w-full bg-[#08080A] border border-[#1C1C21] rounded-lg px-4 py-3 text-sm text-[#F2F2F7] placeholder-[#636366] focus:outline-none focus:border-[#0044CC]/50 focus:ring-1 focus:ring-[#0044CC]/20 transition-all"
                        placeholder="Ex: joao@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#8E8E93] mb-1.5">Mensagem</label>
                      <textarea
                        rows={3}
                        required
                        value={form.message}
                        onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                        className="w-full bg-[#08080A] border border-[#1C1C21] rounded-lg px-4 py-3 text-sm text-[#F2F2F7] placeholder-[#636366] focus:outline-none focus:border-[#0044CC]/50 focus:ring-1 focus:ring-[#0044CC]/20 transition-all resize-none"
                        placeholder="Ex: Gostaria de agendar um diagnóstico para meu Ford Ka 2015..."
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="btn-primary w-full text-sm py-3"
                    >
                      {status === 'loading' ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Enviando...
                        </>
                      ) : (
                        <>
                          Enviar Mensagem
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </>
                      )}
                    </button>
                  </form>

                  {status === 'success' && (
                    <div className="mt-4 p-4 bg-[#30D158]/10 border border-[#30D158]/20 rounded-lg text-center">
                      <svg className="w-8 h-8 text-[#30D158] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm font-medium text-[#30D158]">Mensagem enviada com sucesso! 🎉</p>
                      <p className="text-xs text-[#636366] mt-1">Entraremos em contato em até 2h.</p>
                    </div>
                  )}
                  {status === 'error' && (
                    <div className="mt-4 p-4 bg-[#FF453A]/10 border border-[#FF453A]/20 rounded-lg text-center">
                      <p className="text-sm font-medium text-[#FF453A]">Erro ao enviar mensagem 😕</p>
                      <p className="text-xs text-[#636366] mt-1">Tente novamente ou nos chame direto no WhatsApp.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Contact Cards */}
              <div className="lg:col-span-2 space-y-4">
                <a
                  href="https://wa.me/5561981257477"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dash-card p-6 flex flex-col items-center text-center hover:border-[#30D158] group transition-all"
                >
                  <div className="w-14 h-14 rounded-xl bg-[#30D158]/10 border border-[#30D158]/20 flex items-center justify-center mb-4 group-hover:border-[#30D158]/40 transition-all">
                    <svg className="w-7 h-7 text-[#30D158]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                  </div>
                  <h4 className="font-sans font-bold text-base mb-1">WhatsApp</h4>
                  <p className="text-xs text-[#636366] font-mono">(61) 98125-7477</p>
                  <span className="text-[10px] text-[#30D158] mt-2 font-medium">📱 Resposta rápida</span>
                </a>

                <a
                  href="https://instagram.com/meec_pablo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dash-card p-6 flex flex-col items-center text-center hover:border-[#0044CC] group transition-all"
                >
                  <div className="w-14 h-14 rounded-xl bg-[#0044CC]/10 border border-[#0044CC]/20 flex items-center justify-center mb-4 group-hover:border-[#0044CC]/40 transition-all">
                    <svg className="w-7 h-7 text-[#0044CC]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  </div>
                  <h4 className="font-sans font-bold text-base mb-1">Instagram</h4>
                  <p className="text-xs text-[#636366] font-mono">@meec_pablo</p>
                  <span className="text-[10px] text-[#0044CC] mt-2 font-medium">📸 Siga e acompanhe</span>
                </a>

                <div className="dash-card p-6 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-xl bg-[#FF9F0A]/10 border border-[#FF9F0A]/20 flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-[#FF9F0A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h4 className="font-sans font-bold text-base mb-1">Valparaíso · GO</h4>
                  <p className="text-xs text-[#636366] font-mono">
                    R. 102, Jardim Ceu Azul<br />Valparaíso de Goiás · GO, 72871-102
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <a
                href="https://wa.me/5561981257477"
                className="btn-primary text-lg px-10 py-5"
                style={{ boxShadow: '0 0 40px rgba(0,68,204,0.3)' }}
              >
                💬 FALAR NO WHATSAPP
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <p className="text-xs text-[#636366] mt-4 font-mono">
                Seg–Sex 8h–18h · Sáb 8h–12h · <span className="text-[#30D158]">● Online agora</span>
              </p>
            </div>

            {/* Google Maps */}
            <div className="max-w-5xl mx-auto mt-10">
              <div className="dash-card p-1 overflow-hidden" style={{ borderRadius: '12px' }}>
                <div className="flex items-center gap-2 px-4 pt-3 pb-2">
                  <svg className="w-4 h-4 text-[#0044CC]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-xs font-medium text-[#8E8E93]">
                    R. 102, Jardim Ceu Azul — Valparaíso de Goiás · GO, 72871-102
                  </span>
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=R.+102%2C+Jardim+Ceu+Azul%2C+Valpara%C3%ADso+de+Goi%C3%A1s%2C+GO"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-[10px] text-[#0A84FF] font-medium hover:underline"
                  >
                    Abrir no Maps →
                  </a>
                </div>
                <div className="w-full" style={{ position: 'relative', paddingBottom: '40%', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
                  <iframe
                    src="https://www.google.com/maps?q=R.+102+Jardim+Ceu+Azul+Valpara%C3%ADso+de+Goi%C3%A1s+GO+72871-102+Brazil&output=embed"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Localização Garagem do MEEC"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
