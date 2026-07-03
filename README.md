# Garagem do MEEC - Sistema de Gestão para Oficinas Mecânicas

Sistema completo de gestão para oficinas mecânicas com arquitetura multi-tenant (SaaS), integrado com WhatsApp, controle de leads, ordens de serviço, financeiro, estoque e muito mais.

## 🚀 Funcionalidades

- **Gestão de Leads**: Pipeline de vendas com 5 estágios (Lead Qualificado → Orçamento Finalizado)
- **Ordens de Serviço**: Controle completo de OS com peças, mão de obra e pagamentos
- **Financeiro**: Controle de receitas e despesas, relatórios e gráficos
- **Estoque**: Gestão de produtos, kits e peças com alertas de baixo nível
- **Multi-tenant (SaaS)**: Arquitetura projetada para múltiplas oficinas com isolamento de dados
- **Integração WhatsApp**: Notificações automáticas, confirmações e lembretes
- **Login Social**: Autenticação via Google OAuth
- **Roleta de Prêmios**: Sistema de gamificação para engajar clientes (MEEC OFERTAS)
- **Dashboard Analítico**: Visão geral com KPIs e gráficos em tempo real
- **Controle de Acesso**: Sistema de roles (Super Admin, Admin, Operador) com permissões granulares

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js com Express.js
- **Frontend**: HTML5, CSS3 (Tailwind CSS), JavaScript Vanilla
- **Banco de Dados**: SQLite (com suporte a múltiplos tenants)
- **Autenticação**: Passport.js (Local + Google OAuth 2.0)
- **WhatsApp**: whatsapp-web.js para integração completa
- **APIs Externas**: Supabase (opcional para sincronização)
- **Deploy**: Compatível com Railway, Vercel, Docker, ou qualquer servidor Node

## 📋 Pré-requisitos

- Node.js >= 18.x
- npm >= 9.x
- Conta no Google Cloud (para OAuth opcional)
- Número de WhatsApp para integração (opcional)

## 🔧 Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/garagem-do-meec.git
   cd garagem-do-meec
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   # Edite .env com suas configurações
   ```

4. Execute a instalação inicial:
   ```bash
   node install.js
   ```

5. Inicie o servidor:
   ```bash
   npm start
   ```

6. Acesse:
   - Site público: http://localhost:3000
   - Painel admin: http://localhost:3000/admin
   - Login padrão: admin / admin123

## 📦 Variáveis de Ambiente

Variável | Descrição | Padrão/Obrigatório
---------|-----------|-------------------
PORT | Porta do servidor | 3000
NODE_ENV | Ambiente (development/production) | development
SESSION_SECRET | Segredo para sessões | Necessário alterar em produção
ADMIN_USERNAME | Usuário admin | admin
ADMIN_PASSWORD | Senha admin | Necessário alterar
ADMIN_NAME | Nome do admin | Pablo Jhonatan
REGISTER_SECRET | Chave para registro de usuários | meec-admin-2026
WHATSAPP_ENABLED | Ativar WhatsApp Web | true
WHATSAPP_OWNER_NUMBER | Número do proprietário | Obrigatório para notificações
GOOGLE_CLIENT_ID | ID do cliente Google OAuth | Opcional
GOOGLE_CLIENT_SECRET | Segredo do cliente Google OAuth | Opcional
BASE_URL | URL base do aplicativo | http://localhost:3000
SUPABASE_URL | URL do Supabase (opcional) | Opcional
SUPABASE_ANON_KEY | Key anônima do Supabase (opcional) | Opcional

## 🚀 Deploy

### Railway
1. Faça fork do repositório
2. Conecte seu repositório no Railway
3. Adicionar as variáveis de ambiente necessárias
4. O Railway detectará automaticamente o Node.js e iniciará

### Docker
```bash
docker build -t garagem-do-meec .
docker run -p 3000:3000 --env-file .env garagem-do-meec
```

## 📝 Licença

Este projeto está licenciado sob a licença ISC - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para questões e suporte, por favor abra uma issue neste repositório.
