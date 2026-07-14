#!/usr/bin/env python3
"""Generate PostgreSQL-compatible INSERT SQL from local SQLite database."""

import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.expanduser('/home/williandedia/garagem-do-mec-site/data/garagem.db')
OUTPUT = '/home/williandedia/garagem-do-mec-site/scripts/seed_railway.sql'

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

lines = []
lines.append('-- ============================================================')
lines.append('-- SCRIPT DE SEED - GARAGEM DO MEEC')
lines.append('-- Gerado em: ' + datetime.now().strftime('%Y-%m-%d %H:%M'))
lines.append('-- Compatível com PostgreSQL (Railway)')
lines.append('-- ============================================================')
lines.append('')

# ─── TENANTS ───────────────────────────────────────────────
lines.append('-- TENANT PADRÃO')
lines.append("""
INSERT INTO tenants (id, name, slug, subdomain, logo, whatsapp, address, settings, ativo, created_at)
SELECT 1, 'Garagem do MEEC', 'garagem-do-meec', 'meec', NULL, '5561981257477',
  'R. 102, Jardim Ceu Azul, Valparaíso de Goiás - GO, 72871-102',
  '{}', 1, NOW()
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE id = 1);
""")
lines.append('')

# ─── LEADS ─────────────────────────────────────────────────
print('📖 Lendo leads do SQLite...')
cursor.execute('SELECT * FROM leads ORDER BY id')
leads = cursor.fetchall()
print(f'   {len(leads)} leads encontrados')

lines.append('-- ============================================================')
lines.append(f'-- LEADS ({len(leads)} registros)')
lines.append('-- ============================================================')
lines.append('')

for lead in leads:
    name = (lead['name'] or '').replace("'", "''")
    whatsapp = (lead['whatsapp'] or '').replace("'", "''")
    email = (lead['email'] or '').replace("'", "''") if lead['email'] else None
    message = (lead['message'] or '').replace("'", "''") if lead['message'] else None
    status = lead['status'] or 'lead_qualificado'
    tenant_id = lead['tenant_id'] or 1
    origem = 'importacao'
    created = lead['created_at'] or 'NOW()'

    if email and message:
        sql = f"""INSERT INTO leads (name, whatsapp, email, message, status, tenant_id, created_at, updated_at)
SELECT '{name}', '{whatsapp}', '{email}', '{message}', '{status}', {tenant_id}, '{created}', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '{whatsapp}' AND name = '{name}');"""
    elif email:
        sql = f"""INSERT INTO leads (name, whatsapp, email, status, tenant_id, created_at, updated_at)
SELECT '{name}', '{whatsapp}', '{email}', '{status}', {tenant_id}, '{created}', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '{whatsapp}' AND name = '{name}');"""
    elif message:
        sql = f"""INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT '{name}', '{whatsapp}', '{message}', '{status}', {tenant_id}, '{created}', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '{whatsapp}' AND name = '{name}');"""
    else:
        sql = f"""INSERT INTO leads (name, whatsapp, status, tenant_id, created_at, updated_at)
SELECT '{name}', '{whatsapp}', '{status}', {tenant_id}, '{created}', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '{whatsapp}' AND name = '{name}');"""

    lines.append(sql)
    lines.append('')

# ─── FORNECEDORES ──────────────────────────────────────────
print('📖 Lendo fornecedores do SQLite...')
try:
    cursor.execute('SELECT * FROM fornecedores ORDER BY id')
    fornecedores = cursor.fetchall()
    print(f'   {len(fornecedores)} fornecedores encontrados')
except sqlite3.OperationalError:
    fornecedores = []
    print('   Tabela fornecedores não encontrada')

if fornecedores:
    lines.append('-- ============================================================')
    lines.append(f'-- FORNECEDORES ({len(fornecedores)} registros)')
    lines.append('-- ============================================================')
    lines.append('')

    for f in fornecedores:
        empresa = (f['empresa'] or '').replace("'", "''")
        contato = (f['contato'] or '').replace("'", "''")
        whatsapp = (f['whatsapp'] or '').replace("'", "''")
        email = (f['email'] or '').replace("'", "''") if f['email'] else ''
        endereco = (f['endereco'] or '').replace("'", "''")
        cnpj = (f['cnpj'] or '').replace("'", "''")
        tenant_id = f['tenant_id'] or 1
        created = f['created_at'] or 'NOW()'

        sql = f"""INSERT INTO fornecedores (empresa, contato, whatsapp, email, endereco, cnpj, tenant_id, created_at, updated_at)
SELECT '{empresa}', '{contato}', '{whatsapp}', '{email}', '{endereco}', '{cnpj}', {tenant_id}, '{created}', NOW()
WHERE NOT EXISTS (SELECT 1 FROM fornecedores WHERE whatsapp = '{whatsapp}');"""
        lines.append(sql)
        lines.append('')

# ─── DADOS DO ESTOQUE (Opcional - produtos da API) ────────
print('📖 Lendo estoque do SQLite...')
try:
    cursor.execute('SELECT * FROM estoque ORDER BY id LIMIT 60')
    estoque = cursor.fetchall()
    print(f'   {len(estoque)} produtos encontrados')
except sqlite3.OperationalError:
    estoque = []
    print('   Tabela estoque não encontrada')

if estoque:
    lines.append('-- ============================================================')
    lines.append(f'-- ESTOQUE ({len(estoque)} registros)')
    lines.append('-- ============================================================')
    lines.append('')

    for p in estoque:
        nome = (p['nome'] or '').replace("'", "''")
        descricao = (p['descricao'] or '').replace("'", "''") if p['descricao'] else ''
        preco = float(p['preco'] or 0)
        imagem = (p['imagem'] or '').replace("'", "''") if p['imagem'] else ''
        categoria = (p['categoria'] or 'geral').replace("'", "''")
        quantidade = int(p['quantidade'] or 0)
        ativo = int(p['ativo'] or 1)
        tenant_id = int(p['tenant_id'] or 1)
        created = p['created_at'] or 'NOW()'

        sql = f"""INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT '{nome}', '{descricao}', {preco}, '{imagem}', '{categoria}', {quantidade}, {ativo}, {tenant_id}, '{created}'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = '{nome}' AND tenant_id = {tenant_id});"""
        lines.append(sql)
        lines.append('')

# ─── FINAL ─────────────────────────────────────────────────
lines.append('-- ============================================================')
lines.append('-- FIM DO SCRIPT')
lines.append('-- Total: {} leads, {} fornecedores, {} produtos'.format(
    len(leads), len(fornecedores), len(estoque)))
lines.append('-- ============================================================')

# Write output
with open(OUTPUT, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print(f'\n✅ Script gerado: {OUTPUT}')
print(f'   📊 {len(leads)} leads')
print(f'   🏪 {len(fornecedores)} fornecedores')
print(f'   📦 {len(estoque)} produtos')

conn.close()
