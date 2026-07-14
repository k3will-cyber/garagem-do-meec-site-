#!/usr/bin/env python3
"""
Seed CRM Leads - insere os 68 clientes na tabela crm_leads
do PostgreSQL compartilhado (crm-garagem database).

Uso: railway run python3 seed-crm-leads.py
"""
import os
import sys

# CRM database - postgresql service (compartilhado com crm-garagem)
# Host: postgresql (Railway internal DNS)
# Database: postgres
# User: postgres
# Password: postgres (from postgresql service POSTGRES_PASSWORD)
CRM_DB_HOST = os.environ.get('CRM_DB_HOST', 'postgresql')
CRM_DB_PORT = os.environ.get('CRM_DB_PORT', '5432')
CRM_DB_NAME = os.environ.get('CRM_DB_NAME', 'postgres')
CRM_DB_USER = os.environ.get('CRM_DB_USER', 'postgres')
CRM_DB_PASS = os.environ.get('CRM_DB_PASS', 'postgres')  # POSTGRES_PASSWORD from postgresql service

clients = [
    ("ANTONIO CARLOS", "61993669417", "", "crm_import", 1, "CPF: 64579271149"),
    ("Adriano Almeida", "61998260946", "adrianoalmeida9275@gmail.com", "crm_import", 2, "CPF: 05399391104"),
    ("Alisson", "61992086408", "", "crm_import", 1, "CPF: 08328094118"),
    ("Andreia dutra", "61993495230", "aadultra50@gmail.com", "crm_import", 1, "CPF: 61114561134"),
    ("Antonio lucas dutra", "61994121847", "", "crm_import", 1, "CPF: 05113249106"),
    ("Auricia Maria de Sa", "61982388378", "", "crm_import", 1, "CPF: 73912115320"),
    ("BALTASAR", "61999015366", "", "crm_import", 1, "CPF: 19109954600"),
    ("BRUNO GELEIA", "61992709367", "", "crm_import", 0, "CPF: 06389949189"),
    ("Benisson Nascimento", "61981826263", "", "crm_import", 1, "CPF: 03563374139"),
    ("Bruno Ronny", "61985773309", "", "crm_import", 1, "CPF: 02892333130"),
    ("CHEILA SILVA", "61995054658", "", "crm_import", 1, "CPF: 02903220140"),
    ("CLAUDIOMAR DELFINO", "61984772242", "", "crm_import", 2, "CPF: 94759871187"),
    ("Cleidson Cláudio", "61991410060", "", "crm_import", 1, "CPF: 02360734199"),
    ("Cleverson Favaro", "61981202282", "", "crm_import", 1, "CPF: 05393683189"),
    ("DEIVID ALVES", "61992462979", "", "crm_import", 1, "CPF: 09068991175"),
    ("DOUGLAS SANTOS", "61993618574", "", "crm_import", 1, "CPF: 70246059109"),
    ("Dayane Lins Rezende", "61982267844", "", "crm_import", 1, "CPF: 05480842110"),
    ("Deborah cristina santos bernades", "61991431092", "", "crm_import", 1, "CPF: 71547453125"),
    ("Deivid gomes", "61995993827", "", "crm_import", 2, "CPF: 04199461108"),
    ("Diego amorin", "61995993039", "migueldiego1301@gmail.com", "crm_import", 2, "CPF: 05119739180"),
    ("Douglas Antonio", "61991042190", "ddoglasferreira@gmail.com", "crm_import", 1, "CPF: 61753300134"),
    ("EDIMILSON JOSE", "61993801837", "", "crm_import", 1, "CPF: 57326711100"),
    ("EVANILSON", "61995715564", "", "crm_import", 0, "CPF: 96008075315"),
    ("Edilson luiz", "61992542339", "", "crm_import", 1, "CPF: 95355030149"),
    ("Eduardo medeiros", "61982013979", "medeiroseduardo2002@gmail.com", "crm_import", 1, "CPF: 05970360120"),
    ("FRANCISCO LOPES", "61992278105", "", "crm_import", 1, "CPF: 49339451104"),
    ("GABRIEL TRINDADE", "61992682777", "", "crm_import", 1, "CPF: 05544176183"),
    ("GILBERTE AVILA", "61991553799", "", "crm_import", 1, "CPF: 05374986139"),
    ("GILBERTO BARBOSA", "61992568569", "", "crm_import", 1, "CPF: 11448350468"),
    ("GUILHERME CARVALHO", "61993191885", "", "crm_import", 1, "CPF: 07554646133"),
    ("Gladson do nascimento Carvalho", "61992064787", "", "crm_import", 1, "CPF: 03534584147"),
    ("Henrique Carvalho", "61991610354", "", "crm_import", 1, "CPF: 02101553104"),
    ("IVAN ROYAL MULTMARCA", "61993325258", "", "crm_import", 2, "CPF: 03466168163"),
    ("JAIRO ROMULO", "61998645687", "", "crm_import", 1, "CPF: 01764065140"),
    ("JIVANILDO DE LIMA GUERRA", "61981371365", "", "crm_import", 1, "CPF: 01153852152"),
    ("JOSE ADRIANO DE SOUSA", "61991396165", "", "crm_import", 1, "CPF: 78352878115"),
    ("JOSE AIRTON", "61992044156", "", "crm_import", 1, "CPF: 06967964305"),
    ("JUAN", "61994514346", "", "crm_import", 1, "CPF: 06589106126"),
    ("Jane Cleia Alves Da Silva", "61993482622", "", "crm_import", 1, "CPF: 0273273123"),
    ("Keli Mota", "61986521710", "", "crm_import", 1, "CPF: 00254693121"),
    ("LEONIDAS DE OLIVEIRA", "61981398609", "", "crm_import", 1, "CPF: 37164155100"),
    ("LUCAS MUNIZ", "61992834344", "", "crm_import", 1, "CPF: 71074001184"),
    ("Larissa Sousa", "61991694615", "", "crm_import", 1, "CPF: 03255015138"),
    ("Laysa Perreira", "61995664242", "", "crm_import", 1, "CPF: 06921458180"),
    ("Leandro Batista", "61981459373", "", "crm_import", 1, "CPF: 09720902400"),
    ("Letícia Silva", "61991285673", "", "crm_import", 1, "CPF: 08784810106"),
    ("Lorrany Adrielly", "61981862290", "lorranyadriell@gmail.com", "crm_import", 1, "CPF: 09733072184"),
    ("Lucas Gomes de Souza", "61983724130", "maura35@gmail.com", "crm_import", 1, "CPF: 11896786405"),
    ("Luiz Elligton", "61995697482", "", "crm_import", 1, "CPF: 33963207191"),
    ("Luiz Fernando", "61981757105", "", "crm_import", 1, "CPF: 05558460164"),
    ("Luiz Otavio", "61996810715", "", "crm_import", 1, "CPF: 10364704152"),
    ("MARIA KAROLINE GONÇALVES VERAS", "61992504801", "", "crm_import", 1, "CPF: 06493771170"),
    ("Marcelo Alves", "61991421815", "Marceloalves.gama@yahoo.com.br", "crm_import", 1, "CPF: 80274900149"),
    ("Marcus vinicius", "61981087505", "", "crm_import", 1, "CPF: 03290828174"),
    ("Maria aparecida", "61984766260", "", "crm_import", 1, "CPF: 34342222191"),
    ("Mateus Januario", "61993879770", "", "crm_import", 0, "CPF: 06367184171"),
    ("Mateus Ribeiro", "61992268448", "", "crm_import", 1, "CPF: 06687411128"),
    ("Paulo Henrique", "61982418684", "", "crm_import", 1, "CPF: 05411925150"),
    ("Paulo Henrique sousa", "61991718042", "", "crm_import", 1, "CPF: 00825850169"),
    ("Paulo cruzes", "61994290449", "", "crm_import", 1, "CPF: 00340285109"),
    ("Pedro amorim", "61993025781", "", "crm_import", 1, "CPF: 04319840186"),
    ("Pedro lucas", "61992790991", "", "crm_import", 1, "CPF: 06293389140"),
    ("Raimundo Nonato", "61995805098", "", "crm_import", 1, "CPF: 91396360387"),
    ("Robson renato", "61994120980", "", "crm_import", 1, "CPF: 01151570265"),
    ("SERGIO VALENTIM", "61995273087", "", "crm_import", 1, "CPF: 00811851117"),
    ("SUELMA MATOS", "61993031369", "", "crm_import", 1, "CPF: 04427800106"),
    ("SUIAMY", "61996568181", "", "crm_import", 1, "CPF: 07198489117"),
    ("Sarah khetley pereira monteiro da silva", "61995833537", "Sarakhetlen1234@gmail.com", "crm_import", 1, "CPF: 70617889171"),
]

def seed():
    import psycopg2

    conn_str = f"host={CRM_DB_HOST} port={CRM_DB_PORT} dbname={CRM_DB_NAME} user={CRM_DB_USER} password={CRM_DB_PASS}"
    print(f'[CRM Seed] Connecting to: host={CRM_DB_HOST} port={CRM_DB_PORT} dbname={CRM_DB_NAME} user={CRM_DB_USER}')
    print(f'[CRM Seed] Password: {"*" * len(CRM_DB_PASS)}')

    try:
        conn = psycopg2.connect(conn_str)
        conn.autocommit = True
        cur = conn.cursor()
    except psycopg2.Error as e:
        print(f'[CRM Seed] Connection error: {e}')
        # Try with sslmode=require
        try:
            conn_str_ssl = conn_str + " sslmode=require"
            conn = psycopg2.connect(conn_str_ssl)
            conn.autocommit = True
            cur = conn.cursor()
            print('[CRM Seed] Connected with SSL!')
        except psycopg2.Error as e2:
            print(f'[CRM Seed] SSL also failed: {e2}')
            # Try with Railway private domain
            try:
                private_host = "postgresql.railway.internal"
                conn_str_priv = f"host={private_host} port=5432 dbname={CRM_DB_NAME} user={CRM_DB_USER} password={CRM_DB_PASS}"
                conn = psycopg2.connect(conn_str_priv)
                conn.autocommit = True
                cur = conn.cursor()
                print(f'[CRM Seed] Connected via private host {private_host}!')
            except psycopg2.Error as e3:
                print(f'[CRM Seed] All connection attempts failed: {e3}')
                sys.exit(1)

    # Verify crm_leads table exists
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_name = 'crm_leads'")
    if cur.fetchone() is None:
        print('[CRM Seed] ERRO: Tabela crm_leads nao existe!')
        cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
        tables = [r[0] for r in cur.fetchall()]
        print(f'[CRM Seed] Tabelas existentes: {tables}')
        conn.close()
        sys.exit(1)

    print('[CRM Seed] Tabela crm_leads OK')

    ok, skipped = 0, 0
    for name, phone, email, source, estimated_value, notes in clients:
        try:
            cur.execute('''
                INSERT INTO crm_leads (name, phone, email, source, status, "estimatedValue", notes, "createdAt", "updatedAt")
                VALUES (%s, %s, %s, %s, 'new', %s, %s, NOW(), NOW())
                ON CONFLICT DO NOTHING
                RETURNING id
            ''', (name, phone, email or None, source, estimated_value, notes))
            result = cur.fetchone()
            if result:
                ok += 1
                print(f'  [{ok}] {name} ({phone})')
            else:
                skipped += 1
        except Exception as err:
            print(f'  ERRO {name}: {err}')

    print(f'\n[CRM Seed] RESULTADO: {ok} inseridos, {skipped} duplicados')
    cur.execute('SELECT COUNT(*) FROM crm_leads')
    total = cur.fetchone()[0]
    print(f'[CRM Seed] Total de leads no CRM: {total}')

    conn.close()

if __name__ == '__main__':
    seed()