-- ============================================================
-- SCRIPT DE SEED - GARAGEM DO MEEC
-- Gerado em: 2026-07-14 15:17
-- Compatível com PostgreSQL (Railway)
-- ============================================================

-- TENANT PADRÃO

INSERT INTO tenants (id, name, slug, subdomain, logo, whatsapp, address, settings, ativo, created_at)
SELECT 1, 'Garagem do MEEC', 'garagem-do-meec', 'meec', NULL, '5561981257477',
  'R. 102, Jardim Ceu Azul, Valparaíso de Goiás - GO, 72871-102',
  '{}', 1, NOW()
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE id = 1);


-- ============================================================
-- LEADS (70 registros)
-- ============================================================

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'ANTONIO CARLOS', '61993669417', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:15', 'lead_qualificado', 1, '2026-07-14 14:06:17', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61993669417' AND name = 'ANTONIO CARLOS');

INSERT INTO leads (name, whatsapp, email, message, status, tenant_id, created_at, updated_at)
SELECT 'Adriano Almeida', '61998260946', 'adrianoalmeida9275@gmail.com', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:18', 'lead_qualificado', 1, '2026-07-14 14:06:18', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61998260946' AND name = 'Adriano Almeida');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'Alisson', '61992086408', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:19', 'lead_qualificado', 1, '2026-07-14 14:06:19', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61992086408' AND name = 'Alisson');

INSERT INTO leads (name, whatsapp, email, message, status, tenant_id, created_at, updated_at)
SELECT 'Andreia dutra', '61993495230', 'aadultra50@gmail.com', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61993495230' AND name = 'Andreia dutra');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'Antonio lucas dutra', '61994121847', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61994121847' AND name = 'Antonio lucas dutra');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'Auricia Maria de Sa', '61982388378', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61982388378' AND name = 'Auricia Maria de Sa');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'BALTASAR', '61999015366', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61999015366' AND name = 'BALTASAR');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'BRUNO GELEIA', '61992709367', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61992709367' AND name = 'BRUNO GELEIA');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'Benisson Nascimento', '61981826263', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61981826263' AND name = 'Benisson Nascimento');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'Bruno Ronny', '61985773309', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61985773309' AND name = 'Bruno Ronny');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'CHEILA SILVA', '61995054658', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61995054658' AND name = 'CHEILA SILVA');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'CLAUDIOMAR DELFINO', '61984772242', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61984772242' AND name = 'CLAUDIOMAR DELFINO');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'Cleidson Cláudio', '61991410060', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61991410060' AND name = 'Cleidson Cláudio');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'Cleverson Favaro', '61981202282', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61981202282' AND name = 'Cleverson Favaro');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'DEIVID ALVES', '61992462979', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61992462979' AND name = 'DEIVID ALVES');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'DOUGLAS SANTOS', '61993618574', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61993618574' AND name = 'DOUGLAS SANTOS');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'Dayane Lins Rezende', '61982267844', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61982267844' AND name = 'Dayane Lins Rezende');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'Deborah cristina santos bernades', '61991431092', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61991431092' AND name = 'Deborah cristina santos bernades');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'Deivid gomes', '61995993827', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61995993827' AND name = 'Deivid gomes');

INSERT INTO leads (name, whatsapp, email, message, status, tenant_id, created_at, updated_at)
SELECT 'Diego amorin', '61995993039', 'migueldiego1301@gmail.com', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61995993039' AND name = 'Diego amorin');

INSERT INTO leads (name, whatsapp, email, message, status, tenant_id, created_at, updated_at)
SELECT 'Douglas Antonio', '61991042190', 'ddoglasferreira@gmail.com', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61991042190' AND name = 'Douglas Antonio');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'EDIMILSON JOSE', '61993801837', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61993801837' AND name = 'EDIMILSON JOSE');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'EVANILSON', '61995715564', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61995715564' AND name = 'EVANILSON');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'Edilson luiz', '61992542339', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61992542339' AND name = 'Edilson luiz');

INSERT INTO leads (name, whatsapp, email, message, status, tenant_id, created_at, updated_at)
SELECT 'Eduardo medeiros', '61982013979', 'medeiroseduardo2002@gmail.com', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61982013979' AND name = 'Eduardo medeiros');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'FRANCISCO LOPES', '61992278105', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61992278105' AND name = 'FRANCISCO LOPES');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'GABRIEL TRINDADE', '61992682777', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61992682777' AND name = 'GABRIEL TRINDADE');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'GILBERTE AVILA', '61991553799', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61991553799' AND name = 'GILBERTE AVILA');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'GILBERTO BARBOSA', '61992568569', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61992568569' AND name = 'GILBERTO BARBOSA');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'GUILHERME CARVALHO', '61993191885', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61993191885' AND name = 'GUILHERME CARVALHO');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'Gladson do nascimento Carvalho', '61992064787', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61992064787' AND name = 'Gladson do nascimento Carvalho');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'Henrique Carvalho', '61991610354', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61991610354' AND name = 'Henrique Carvalho');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'IVAN ROYAL MULTMARCA', '61993325258', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61993325258' AND name = 'IVAN ROYAL MULTMARCA');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'JAIRO ROMULO', '61998645687', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61998645687' AND name = 'JAIRO ROMULO');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'JIVANILDO DE LIMA GUERRA', '6198137136561983562522', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '6198137136561983562522' AND name = 'JIVANILDO DE LIMA GUERRA');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'JOSE ADRIANO DE SOUSA', '61991396165', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61991396165' AND name = 'JOSE ADRIANO DE SOUSA');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'JOSE AIRTON', '61992044156', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61992044156' AND name = 'JOSE AIRTON');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'JUAN', '61994514346', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61994514346' AND name = 'JUAN');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'Jane Cleia Alves Da Silva', '61993482622', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61993482622' AND name = 'Jane Cleia Alves Da Silva');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'Keli Mota', '61986521710', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61986521710' AND name = 'Keli Mota');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'LEONIDAS DE OLIVEIRA', '61981398609', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61981398609' AND name = 'LEONIDAS DE OLIVEIRA');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'LUCAS MUNIZ', '61992834344', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61992834344' AND name = 'LUCAS MUNIZ');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'Larissa Sousa', '61991694615', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61991694615' AND name = 'Larissa Sousa');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'Laysa Perreira', '61995664242', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61995664242' AND name = 'Laysa Perreira');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'Leandro Batista', '61981459373', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61981459373' AND name = 'Leandro Batista');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'Letícia Silva', '6191285673', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '6191285673' AND name = 'Letícia Silva');

INSERT INTO leads (name, whatsapp, email, message, status, tenant_id, created_at, updated_at)
SELECT 'Lorrany Adrielly', '61981862290', 'lorranyadriell@gmail.com', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61981862290' AND name = 'Lorrany Adrielly');

INSERT INTO leads (name, whatsapp, email, message, status, tenant_id, created_at, updated_at)
SELECT 'Lucas Gomes de Souza', '61983724130', 'maura35@gmail.com', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61983724130' AND name = 'Lucas Gomes de Souza');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'Luiz Elligton', '61995697482', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61995697482' AND name = 'Luiz Elligton');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'Luiz Fernando', '61981757105', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61981757105' AND name = 'Luiz Fernando');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'Luiz Otavio', '61996810715', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61996810715' AND name = 'Luiz Otavio');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'MARIA KAROLINE GONÇALVES VERAS', '61992504801', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61992504801' AND name = 'MARIA KAROLINE GONÇALVES VERAS');

INSERT INTO leads (name, whatsapp, email, message, status, tenant_id, created_at, updated_at)
SELECT 'Marcelo Alves', '61991421815', 'Marceloalves.gama@yahoo.com.br', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61991421815' AND name = 'Marcelo Alves');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'Marcus vinicius', '61981087505', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61981087505' AND name = 'Marcus vinicius');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'Maria aparecida', '61984766260', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61984766260' AND name = 'Maria aparecida');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'Mateus Januario', '61993879770', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61993879770' AND name = 'Mateus Januario');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'Mateus Ribeiro', '61992268448', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61992268448' AND name = 'Mateus Ribeiro');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'Paulo Henrique', '61982418684', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61982418684' AND name = 'Paulo Henrique');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'Paulo Henrique sousa', '61991718042', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61991718042' AND name = 'Paulo Henrique sousa');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'Paulo cruzes', '61994290449', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61994290449' AND name = 'Paulo cruzes');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'Pedro amorim', '61993025781', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61993025781' AND name = 'Pedro amorim');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'Pedro lucas', '61992790991', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61992790991' AND name = 'Pedro lucas');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'Raimundo Nonato', '61995805098', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61995805098' AND name = 'Raimundo Nonato');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'Robson renato', '61994120980', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61994120980' AND name = 'Robson renato');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'SERGIO VALENTIM', '61995273087', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61995273087' AND name = 'SERGIO VALENTIM');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'SUELMA MATOS', '61993031369', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61993031369' AND name = 'SUELMA MATOS');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'SUIAMY', '61996568181', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61996568181' AND name = 'SUIAMY');

INSERT INTO leads (name, whatsapp, email, message, status, tenant_id, created_at, updated_at)
SELECT 'Sarah khetley pereira monteiro da silva', '61995833537', 'Sarakhetlen1234@gmail.com', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61995833537' AND name = 'Sarah khetley pereira monteiro da silva');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'Sergio valentin', '61995273087', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61995273087' AND name = 'Sergio valentin');

INSERT INTO leads (name, whatsapp, message, status, tenant_id, created_at, updated_at)
SELECT 'Sávio Gonçalves', '61991391746', 'Cliente importado da lista do WhatsApp em 14/07/2026, 11:06:20', 'lead_qualificado', 1, '2026-07-14 14:06:20', NOW()
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE whatsapp = '61991391746' AND name = 'Sávio Gonçalves');

-- ============================================================
-- FORNECEDORES (5 registros)
-- ============================================================

INSERT INTO fornecedores (empresa, contato, whatsapp, email, endereco, cnpj, tenant_id, created_at, updated_at)
SELECT 'Auto Minas', 'vanderlei', '61991246505', '', 'valparaiso de goias', '0000000000000', 1, '2026-07-14 14:26:19', NOW()
WHERE NOT EXISTS (SELECT 1 FROM fornecedores WHERE whatsapp = '61991246505');

INSERT INTO fornecedores (empresa, contato, whatsapp, email, endereco, cnpj, tenant_id, created_at, updated_at)
SELECT 'Borges Auto Peças', 'Léo', '61996123975', '', 'Ceu Azul', '00000000000000', 1, '2026-07-14 14:26:19', NOW()
WHERE NOT EXISTS (SELECT 1 FROM fornecedores WHERE whatsapp = '61996123975');

INSERT INTO fornecedores (empresa, contato, whatsapp, email, endereco, cnpj, tenant_id, created_at, updated_at)
SELECT 'RBS Comércio de Peças Automotivas Ltda', 'Vinicius', '61994033348', '', 'Ceu Azul', '39.3942.84/0001-83', 1, '2026-07-14 14:26:19', NOW()
WHERE NOT EXISTS (SELECT 1 FROM fornecedores WHERE whatsapp = '61994033348');

INSERT INTO fornecedores (empresa, contato, whatsapp, email, endereco, cnpj, tenant_id, created_at, updated_at)
SELECT 'Terra Util Comércio de Ferramentas e Utilidades Ltda.', 'Janio', '61991774066', 'rbscompras@gmail.com', 'Sof Sul Qd. 4 Conjunto B Guará 71.215-210', '07.144.507/0001-68', 1, '2026-07-14 14:26:19', NOW()
WHERE NOT EXISTS (SELECT 1 FROM fornecedores WHERE whatsapp = '61991774066');

INSERT INTO fornecedores (empresa, contato, whatsapp, email, endereco, cnpj, tenant_id, created_at, updated_at)
SELECT '', 'Claudio', '61981118325', '', 'Sia Trecho 3 Lote 510', '', 1, '2026-07-14 14:26:19', NOW()
WHERE NOT EXISTS (SELECT 1 FROM fornecedores WHERE whatsapp = '61981118325');

-- ============================================================
-- ESTOQUE (60 registros)
-- ============================================================

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Óleo Motor 5W30 1L', 'Óleo sintético para motor 5W30', 45.9, '', 'oleo', 20, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Óleo Motor 5W30 1L' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Óleo Motor 10W40 1L', 'Óleo semissintético 10W40', 38.5, '', 'oleo', 25, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Óleo Motor 10W40 1L' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Óleo Motor 15W40 1L', 'Óleo mineral 15W40', 32.9, '', 'oleo', 15, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Óleo Motor 15W40 1L' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Óleo Motor 20W50 1L', 'Óleo mineral 20W50', 29.9, '', 'oleo', 18, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Óleo Motor 20W50 1L' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Óleo Câmbio Automático ATF', 'Óleo para transmissão automática', 55.0, '', 'oleo', 10, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Óleo Câmbio Automático ATF' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Óleo Câmbio Manual 75W90', 'Óleo para transmissão manual', 48.0, '', 'oleo', 8, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Óleo Câmbio Manual 75W90' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Óleo Hidráulico 1L', 'Óleo para sistema hidráulico', 35.0, '', 'oleo', 12, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Óleo Hidráulico 1L' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Óleo Motor 5W30 4L', 'Óleo sintético 5W30 galão 4 litros', 159.9, '', 'oleo', 10, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Óleo Motor 5W30 4L' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Óleo Motor 10W40 4L', 'Óleo semissintético 10W40 galão', 129.9, '', 'oleo', 8, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Óleo Motor 10W40 4L' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Fluído de Freio DOT 3', 'Fluído de freio DOT 3 250ml', 18.5, '', 'oleo', 15, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Fluído de Freio DOT 3' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Fluído de Freio DOT 4', 'Fluído de freio DOT 4 250ml', 22.0, '', 'oleo', 20, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Fluído de Freio DOT 4' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Filtro de Óleo', 'Filtro de óleo universal', 25.0, '', 'filtro', 30, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Filtro de Óleo' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Filtro de Ar Motor', 'Filtro de ar para motor', 35.0, '', 'filtro', 25, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Filtro de Ar Motor' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Filtro de Ar Condicionado', 'Filtro de ar do habitáculo', 32.0, '', 'filtro', 20, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Filtro de Ar Condicionado' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Filtro de Combustível', 'Filtro de combustível universal', 28.0, '', 'filtro', 22, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Filtro de Combustível' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Filtro de Cabine Pólen', 'Filtro antipólen para cabine', 38.0, '', 'filtro', 15, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Filtro de Cabine Pólen' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Pastilha de Freio Dianteira', 'Pastilha de freio dianteira universal', 89.9, '', 'freio', 20, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Pastilha de Freio Dianteira' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Pastilha de Freio Traseira', 'Pastilha de freio traseira universal', 85.0, '', 'freio', 18, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Pastilha de Freio Traseira' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Disco de Freio Dianteiro', 'Disco de freio dianteiro ventilado', 159.0, '', 'freio', 12, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Disco de Freio Dianteiro' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Disco de Freio Traseiro', 'Disco de freio traseiro sólido', 139.0, '', 'freio', 10, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Disco de Freio Traseiro' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Cilindro de Roda Traseiro', 'Cilindro de roda para freio a tambor', 45.0, '', 'freio', 15, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Cilindro de Roda Traseiro' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Lona de Freio', 'Jogo de lonas de freio', 79.9, '', 'freio', 10, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Lona de Freio' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Mangueira de Freio Universal', 'Mangueira de freio flexível 40cm', 35.0, '', 'freio', 14, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Mangueira de Freio Universal' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Vela de Ignição', 'Vela de ignição universal', 18.9, '', 'ignicao', 40, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Vela de Ignição' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Vela de Ignição Iridium', 'Vela de ignição iridium longa vida', 49.9, '', 'ignicao', 20, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Vela de Ignição Iridium' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Cabo de Vela', 'Jogo de cabos de vela', 59.9, '', 'ignicao', 15, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Cabo de Vela' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Bobina de Ignição', 'Bobina de ignição universal', 89.0, '', 'ignicao', 10, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Bobina de Ignição' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Módulo de Ignição', 'Módulo de ignição eletrônica', 129.0, '', 'ignicao', 5, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Módulo de Ignição' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Lâmpada Farol Alto H4', 'Lâmpada H4 farol alto/baixo', 15.0, '', 'iluminacao', 30, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Lâmpada Farol Alto H4' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Lâmpada Farol LED H7', 'Lâmpada LED H7 branca', 65.0, '', 'iluminacao', 20, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Lâmpada Farol LED H7' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Lâmpada Seteira', 'Lâmpada de seta âmbar', 8.0, '', 'iluminacao', 35, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Lâmpada Seteira' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Lâmpada Lanterna LED', 'Lâmpada de lanterna traseira', 22.0, '', 'iluminacao', 25, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Lâmpada Lanterna LED' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Farol de Neblina', 'Farol de neblina universal', 89.9, '', 'iluminacao', 8, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Farol de Neblina' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Correia Dentada', 'Correia dentada de distribuição', 79.0, '', 'correia', 10, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Correia Dentada' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Correia Alternador', 'Correia do alternador', 45.0, '', 'correia', 15, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Correia Alternador' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Correia Ar Condicionado', 'Correia do compressor do ar', 42.0, '', 'correia', 10, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Correia Ar Condicionado' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Tensor Correia Dentada', 'Tensor automático da correia', 129.0, '', 'correia', 5, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Tensor Correia Dentada' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Jogo Correias + Tensor', 'Kit correia dentada + tensor', 189.0, '', 'correia', 5, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Jogo Correias + Tensor' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Bateria 45Ah', 'Bateria automotiva 45Ah', 289.0, '', 'bateria', 8, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Bateria 45Ah' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Bateria 60Ah', 'Bateria automotiva 60Ah', 359.0, '', 'bateria', 8, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Bateria 60Ah' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Bateria 70Ah', 'Bateria automotiva 70Ah', 429.0, '', 'bateria', 6, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Bateria 70Ah' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Bateria 100Ah', 'Bateria automotiva 100Ah', 559.0, '', 'bateria', 4, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Bateria 100Ah' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Amortecedor Dianteiro', 'Amortecedor dianteiro universal', 199.0, '', 'suspensao', 8, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Amortecedor Dianteiro' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Amortecedor Traseiro', 'Amortecedor traseiro universal', 179.0, '', 'suspensao', 8, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Amortecedor Traseiro' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Bieleta Suspensão', 'Bieleta de barra estabilizadora', 45.0, '', 'suspensao', 20, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Bieleta Suspensão' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Bucha Suspensão', 'Bucha de suspensão universal', 25.0, '', 'suspensao', 25, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Bucha Suspensão' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Terminal de Direção', 'Terminal de direção interno/externo', 69.0, '', 'suspensao', 12, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Terminal de Direção' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Aditivo Radiador 1L', 'Aditivo para radiador concentrado', 25.0, '', 'arrefecimento', 25, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Aditivo Radiador 1L' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Água Desmineralizada 1L', 'Água desmineralizada para radiador', 12.0, '', 'arrefecimento', 30, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Água Desmineralizada 1L' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Válvula Termostática', 'Válvula termostática universal', 55.0, '', 'arrefecimento', 10, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Válvula Termostática' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Sensor Temperatura', 'Sensor de temperatura do líquido', 38.0, '', 'arrefecimento', 12, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Sensor Temperatura' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Mangueira Radiador', 'Mangueira superior/inferior radiador', 45.0, '', 'arrefecimento', 10, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Mangueira Radiador' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Tampa Radiador', 'Tampa de pressão do radiador', 18.0, '', 'arrefecimento', 20, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Tampa Radiador' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Limpador Para-brisa 22"', 'Palheta limpador para-brisa 22"', 22.9, '', 'diversos', 25, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Limpador Para-brisa 22"' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Cera Automotiva', 'Cera líquida para pintura automotiva', 35.0, '', 'diversos', 15, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Cera Automotiva' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Desengripante WD-40', 'Desengripante e lubrificante 200ml', 28.0, '', 'diversos', 20, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Desengripante WD-40' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Silicone Limpa Contatos', 'Silicone para contatos elétricos', 18.0, '', 'diversos', 15, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Silicone Limpa Contatos' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Lona Protetora', 'Lona para proteção do veículo', 29.9, '', 'diversos', 10, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Lona Protetora' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Fita Isolante Automotiva', 'Fita isolante preta 10m', 8.9, '', 'diversos', 30, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Fita Isolante Automotiva' AND tenant_id = 1);

INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id, created_at)
SELECT 'Abraçadeira Nylon', 'Kit abraçadeiras nylon variadas', 12.0, '', 'diversos', 40, 1, 1, '2026-07-10 18:39:56'
WHERE NOT EXISTS (SELECT 1 FROM estoque WHERE nome = 'Abraçadeira Nylon' AND tenant_id = 1);

-- ============================================================
-- FIM DO SCRIPT
-- Total: 70 leads, 5 fornecedores, 60 produtos
-- ============================================================