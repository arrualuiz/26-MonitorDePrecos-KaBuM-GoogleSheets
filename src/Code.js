const SPREADSHEET_ID = '1hgSeSzOpBzxyJji-S2GPG8xECaZlpr0RlBsaCNQrLZE';
const TIMEZONE = 'America/Sao_Paulo';
const DATETIME_FORMAT = 'dd/MM/yyyy HH:mm:ss';
// Coluna (1-based) de data_hora em cada aba que recebe linhas novas.
const COLUNAS_DATA_HORA = {Coletas_Brutas: 2, Coletas_Fatiadas: 2, Historico: 1, Logs: 1};

const CABECALHO_PRODUTOS = [
  'id', 'ativo', 'nome', 'categoria', 'gpu_tipo', 'loja', 'url', 'preco_alvo',
  'preco_maximo', 'prioridade', 'selector_preco_pix', 'observacoes', 'ultima_coleta'
];

// Lista de produtos monitorados:
// [id, nome, categoria, gpu_tipo, loja, url, preco_alvo, preco_maximo, prioridade, observacoes (opcional), selector_preco_pix (opcional)]
// Produto novo: adicione uma linha no fim com id novo e de clasp push. Na proxima coleta (ou rodando
// sincronizarProdutos) ele entra na aba Produtos. Quem ja esta na aba nao e alterado: ativo, alvo e maximo
// dos produtos existentes continuam sendo editados na planilha.
// Lojas: 'Kabum' (url = pagina do produto) e 'AliExpress' (url = pagina do anuncio e selector = 'busca:<termo>',
// porque o preco do AliExpress so aparece na busca).
const PRODUCTS = [
  ['GPU-001', 'Placa De Video Husky Alpha RX 580', 'Placa de video', 'RX 580 8GB', 'Kabum', 'https://www.kabum.com.br/produto/692461/placa-de-video-husky-alpha-rx-580-amd-8gb-gddr5-256-bit-hdmi-dvi-displayport-hvg580', '', 929.99, 'Media'],
  ['GPU-002', 'Placa De Video Vinik RX 580', 'Placa de video', 'RX 580 8GB', 'Kabum', 'https://www.kabum.com.br/produto/1056509/gpu-rx-580-8gb-gddr5-256-bits-dual-fan-vinik-gpuvk580v28gb2f', '', 890.38, 'Media'],
  ['GPU-003', 'Placa de Video Gamer Delta RX580', 'Placa de video', 'RX 580 8GB', 'Kabum', 'https://www.kabum.com.br/produto/678225/placa-de-video-gamer-delta-rx580-8gb-256bits-dvi-hdmi-dp-deltarx580', '', 844.79, 'Media'],
  ['KIT-001', 'Kit Ryzen 5 5600GT + MSI A520M-A PRO', 'Kit upgrade', 'Ryzen 5 5600GT kit', 'Kabum', 'https://www.kabum.com.br/produto/1003964/kit-upgrade-amd-ryzen-5-5600gt-placa-mae-msi-a520m-a-pro', '', 1189.99, 'Media'],
  ['KIT-002', 'Kit B550M Aorus Elite + Ryzen 7 5700X', 'Kit upgrade', 'Ryzen 7 5700X kit', 'Kabum', 'https://www.kabum.com.br/produto/1036587/kit-placa-mae-gigabyte-b550m-aorus-elite-am4-processador-amd-ryzen-7-5700x', '', 1899.99, 'Media'],
  ['KIT-003', 'Kit Intel Core I5 7a Geracao', 'Kit upgrade', 'Core i5 7a geracao kit', 'Kabum', 'https://www.kabum.com.br/produto/577368/kit-upgrade-intel-core-i5-7-geracao-8gb-ram-ssd-240gb-conexoes-usb-vga-hdmi-lan-som', '', 1257.68, 'Baixa'],
  ['KIT-004', 'Kit Ryzen 7 5700x + B550m Aorus Elite', 'Kit upgrade', 'Ryzen 7 5700X kit', 'Kabum', 'https://www.kabum.com.br/produto/751959/kit-upgrade-amd-ryzen-7-5700x-placa-mae-gigabyte-b550m-aorus-elite-', '', 2954.43, 'Baixa'],
  ['KIT-005', 'Kit Ryzen 5 5600gt + Asus Tuf B550m-plus', 'Kit upgrade', 'Ryzen 5 5600GT kit', 'Kabum', 'https://www.kabum.com.br/produto/727052/kit-upgrade-amd-ryzen-5-5600gt-placa-mae-asus-tuf-gaming-b550m-plus-am4', '', 2336.84, 'Baixa'],
  ['KIT-006', 'Kit Ryzen 5 5600gt + A520m + 16GB', 'Kit upgrade', 'Ryzen 5 5600GT kit', 'Kabum', 'https://www.kabum.com.br/produto/703207/kit-upgrade-amd-ryzen-5-5600gt-placa-mae-a520m-ddr4-memoria-ram-16gb-3200mhz', '', 3211.00, 'Baixa'],
  ['GPU-004', 'Asus RTX 3050 OC Dual 6GB', 'Placa de video', 'RTX 3050 6GB', 'Kabum', 'https://www.kabum.com.br/produto/577171/placa-de-video-asus-rtx-3050-oc-dual-nvidia-geforce-6gb-gddr6-96-bits-dual-rtx3050-6g', '', 1461.98, 'Media'],
  ['GPU-005', 'MSI RTX 3050 Ventus OC 2X 6GB', 'Placa de video', 'RTX 3050 6GB', 'Kabum', 'https://www.kabum.com.br/produto/997881/placa-de-video-msi-geforce-rtx-3050-ventus-oc-2x-6gb-gddr6-96-bit-912-v812-060', '', 1399.99, 'Media'],
  ['GPU-006', 'MSI RTX 3050 Ventus 2X OC 6GB', 'Placa de video', 'RTX 3050 6GB', 'Kabum', 'https://www.kabum.com.br/produto/1003726/placa-de-video-msi-rtx-3050-ventus-2x-oc-nvidia-geforce-6gb-gddr6-96-bit-g3050v2x6c', '', 1429.99, 'Media'],
  ['GPU-007', 'RX 7600 Challenger ASRock 8GB', 'Placa de video', 'RX 7600 8GB', 'Kabum', 'https://www.kabum.com.br/produto/459144/placa-de-video-rx-7600-challenger-asrock-amd-radeon-8gb-gddr6-90-ga41zz-00uanf', '', 1819.99, 'Alta'],
  ['GPU-008', 'RX 7600 Gaming OC Gigabyte 8GB', 'Placa de video', 'RX 7600 8GB', 'Kabum', 'https://www.kabum.com.br/produto/475647/placa-de-video-rx-7600-gaming-oc-8g-amd-radeon-gigabyte-8gb-gddr6-128bits-rgb-gv-r76gaming-oc-8gd', '', 1999.99, 'Alta'],
  ['GPU-009', 'Vinik RX 5600 6GB', 'Placa de video', 'RX 5600 6GB', 'Kabum', 'https://www.kabum.com.br/produto/1029133/placa-de-video-gpu-amd-radeon-rx-5600-6gb-192bits-gddr6-dual-fan-gpuvk56006gb2f', '', 1139.99, 'Media'],
  ['PC-001', 'PC Gamer Ludic R5 5500 + RX 7600 16GB', 'PC montado', 'RX 7600 8GB', 'Kabum', 'https://www.kabum.com.br/produto/1012274/pc-gamer-ludic-by-bluepc-amd-ryzen-5-5500-radeon-rx-7600-8gb-16gb-ram-ssd-512gb-m-2-nvme-600w-80-plus-preto-7-fans-rgb-pgbp-lu2107', 4715.83, 5099, 'Media', 'Alvo = PC Spectrum R5 5500 + RX 7600 na Shopee por R$ 4.715,83 no PIX com cupom (19/10/2026)'],
  ['CPU-001', 'Processador Intel Xeon E5-2650 V4 12 nucleos', 'Processador', 'Xeon E5-2650 v4', 'Kabum', 'https://www.kabum.com.br/produto/998284/processador-intel-xeon-e5-2650-v4-30mb-cache-2-20-ghz-socket-2011-3-12-core-oem', '', 594.99, 'Media', 'No lugar do E5-2690 v4 (14 nucleos, 2,6 GHz): a Kabum nao vende e o Mercado Livre bloqueia robos (19/10/2026)'],
  ['ALI-001', 'Xeon E5-2690 V4 usado (anuncio 2.000+ vendidos)', 'Processador', 'Xeon E5-2690 v4', 'AliExpress', 'https://pt.aliexpress.com/item/1005007805707118.html', '', 89.99, 'Media', 'Busca E5-2690 v4 em 19/10/2026: R$ 89,99, 2.000+ vendidos, nota 4.9', 'busca:E5-2690-v4'],
  ['ALI-002', 'Xeon E5-2690 V4 (anuncio 1.000+ vendidos)', 'Processador', 'Xeon E5-2690 v4', 'AliExpress', 'https://pt.aliexpress.com/item/1005007532369181.html', '', 89.64, 'Media', 'Busca E5-2690 v4 em 19/10/2026: R$ 89,64, 1.000+ vendidos, nota 4.9', 'busca:E5-2690-v4'],
  ['ALI-003', 'Xeon E5-2690 V4 usado (anuncio 900+ vendidos)', 'Processador', 'Xeon E5-2690 v4', 'AliExpress', 'https://pt.aliexpress.com/item/1005009930770548.html', '', 117.28, 'Media', 'Busca E5-2690 v4 em 19/10/2026: R$ 117,28, 900+ vendidos, nota 4.9', 'busca:E5-2690-v4'],
  ['ALI-004', 'Xeon E5-2690 V4 (anuncio 700+ vendidos)', 'Processador', 'Xeon E5-2690 v4', 'AliExpress', 'https://pt.aliexpress.com/item/1005007330296516.html', '', 69.99, 'Media', 'Busca E5-2690 v4 em 19/10/2026: R$ 69,99, 700+ vendidos, nota 4.9', 'busca:E5-2690-v4'],
  ['MON-001', 'Monitor Acer Nitro KG270 P0bi 27 VA 144Hz', 'Monitor', 'Monitor 27 144Hz', 'Kabum', 'https://www.kabum.com.br/produto/1049978/monitor-gamer-acer-nitro-kg270-p0bi-27-fhd-144hz-1ms-hdmi-preto-um-hx0aa-011', 559, 999.99, 'Alta', 'Alvo = menor nivel de out/2026 no Pelando (ML R$ 555,91 em 17/10, R$ 559 em 30/10; Amazon R$ 543 em 02/10). Kabum em 02/11/2026: R$ 619,99 no Esquenta 11.11 (ate 13/11 10h), fora da oferta R$ 999,99'],
  ['CHI-001', 'Chinelo Nike Victori One Masculino Preto (Dafiti 8636301)', 'Chinelo', 'Nike Victori One', 'Dafiti', 'https://www.dafiti.com.br/Chinelo-Nike-Victori-One-Masculino-8636301.html', 100, 109.99, 'Alta', 'Dafiti em 13/11/2026: R$ 109,99 (de R$ 249,99), tamanhos 37, 38, 42, 43, 44'],
  ['CHI-002', 'Chinelo Nike Victori One Masculino (Dafiti 8831089)', 'Chinelo', 'Nike Victori One', 'Dafiti', 'https://www.dafiti.com.br/Chinelo-Nike-Victori-One-Masculino-8831089.html', 100, 159.99, 'Media', 'Dafiti em 13/11/2026: R$ 159,99 (de R$ 229,99), tamanhos 37, 38, 42, 43, 44'],
  ['CHI-003', 'Chinelo Nike Victori One Masculino Azul (Dafiti 15271691)', 'Chinelo', 'Nike Victori One', 'Dafiti', 'https://www.dafiti.com.br/Chinelo-Nike-Victori-One-Masculino-15271691.html', 100, 159.99, 'Media', 'Dafiti em 13/11/2026: R$ 159,99 (de R$ 249,99), tamanhos 42, 43, 44'],
  ['CHI-004', 'Chinelo Nike Victori One Preto (Dafiti 8843713)', 'Chinelo', 'Nike Victori One', 'Dafiti', 'https://www.dafiti.com.br/Chinelo-Nike-Victori-One-Preto-8843713.html', 100, 169.99, 'Media', 'Dafiti em 13/11/2026: R$ 169,99 (de R$ 249,99), tamanhos 42, 43, 44'],
  ['CHI-005', 'Chinelo Nike Victori One Masculino Preto (Authentic Feet)', 'Chinelo', 'Nike Victori One', 'Authentic Feet', 'https://www.authenticfeet.com.br/chinelo-nike-victori-one-masculino-fz311-0-001/p', 100, 199.99, 'Media', 'Authentic Feet em 13/11/2026: R$ 199,99, so o 38 com estoque. Mesmo catalogo da Artwalk e da Magic Feet']
];

function setupMonitor() {
  // PROTECAO: esta funcao APAGA todas as abas (inclusive Historico e coletas) e recria a planilha do zero.
  // So mude para true se quiser mesmo resetar tudo; depois volte para false.
  const CONFIRMAR_RESET_TOTAL = false;
  if (!CONFIRMAR_RESET_TOTAL) {
    throw new Error('setupMonitor() apaga todos os dados. Mude CONFIRMAR_RESET_TOTAL para true se quiser mesmo recriar a planilha.');
  }
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const keepNames = ['Config', 'Produtos', 'Coletas_Brutas', 'Coletas_Fatiadas', 'Historico', 'Acompanhamento', 'Dashboard', 'Logs'];
  ss.getSheets().forEach(sheet => {
    if (!keepNames.includes(sheet.getName()) && ss.getSheets().length > 1) {
      ss.deleteSheet(sheet);
    }
  });
  const sheets = {
    config: resetSheet_(ss, 'Config'),
    products: resetSheet_(ss, 'Produtos'),
    raw: resetSheet_(ss, 'Coletas_Brutas'),
    parsed: resetSheet_(ss, 'Coletas_Fatiadas'),
    history: resetSheet_(ss, 'Historico'),
    follow: resetSheet_(ss, 'Acompanhamento'),
    dash: resetSheet_(ss, 'Dashboard'),
    logs: resetSheet_(ss, 'Logs')
  };

  sheets.config.getRange(1, 1, 7, 2).setValues([
    ['Chave', 'Valor'],
    ['timezone', TIMEZONE],
    ['frequencia_sugerida', 'Diariamente perto das 23h (criarGatilhoDiario23h)'],
    ['lojas_ativas', 'Kabum'],
    ['parser_kabum', PARSER_KABUM_DESC],
    ['ultima_configuracao', new Date()],
    ['observacao', 'Screenshots exigem automacao externa; Apps Script faz coleta textual.']
  ]);

  sheets.products.getRange(1, 1, 1, 13).setValues([CABECALHO_PRODUTOS]);
  sheets.products.getRange(2, 1, PRODUCTS.length, 13).setValues(PRODUCTS.map(p => linhaProduto_(p, 'Carga inicial 2026-08-29')));

  sheets.raw.getRange(1, 1, 1, 13).setValues([[
    'coleta_id', 'data_hora', 'id_produto', 'loja', 'url', 'status_http',
    'titulo_extraido', 'html_tamanho', 'texto_bruto_inicio', 'precos_detectados',
    'erro', 'hash_simples', 'status_coleta'
  ]]);

  sheets.parsed.getRange(1, 1, 1, 16).setValues([[
    'coleta_id', 'data_hora', 'id_produto', 'nome', 'loja', 'url', 'preco_de',
    'preco_pix', 'desconto_pix', 'parcelamento', 'preco_parcela', 'qtd_parcelas',
    'selector_usado', 'status_parse', 'confianca', 'observacoes'
  ]]);

  sheets.history.getRange(1, 1, 1, 15).setValues([[
    'data_hora', 'id_produto', 'nome', 'loja', 'url', 'preco_de', 'preco_pix',
    'preco_alvo', 'delta_alvo', 'variacao_ultima', 'menor_historico',
    'status_preco', 'desconto_pix', 'parcelamento', 'screenshot_url'
  ]]);

  sheets.follow.getRange(1, 1, 1, 13).setValues([[
    'id_produto', 'nome', 'loja', 'preco_atual', 'preco_anterior', 'variacao_abs',
    'variacao_pct', 'menor_preco', 'maior_preco', 'media_7_coletas',
    'status_preco', 'ultima_coleta', 'url'
  ]]);

  sheets.logs.getRange(1, 1, 1, 6).setValues([['data_hora', 'nivel', 'funcao', 'id_produto', 'mensagem', 'detalhe']]);
  Object.values(sheets).forEach(formatSheet_);
  atualizarAcompanhamento();
  atualizarDashboard();
}

const PARSER_KABUM_DESC = 'preco_pix=__NEXT_DATA__ prices.priceWithDiscount (fallback: JSON-LD offers.price, depois h4); preco_de=prices.price; parcelamento=texto 10x R$';

function coletarAgora() {
  const inicio = new Date();
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  try {
    sincronizarProdutos_(ss);
  } catch (err) {
    log_(ss, 'ERRO', 'sincronizarProdutos', '', err.message, '');
  }
  const productsSheet = ss.getSheetByName('Produtos');
  const values = productsSheet.getDataRange().getValues();
  const headers = values.shift();
  const idx = Object.fromEntries(headers.map((h, i) => [h, i]));
  const active = values
    .map((row, i) => ({row: row, linha: i + 2}))
    .filter(x => x.row[idx.ativo] === true && x.row[idx.url]);

  log_(ss, 'INFO', 'coletarAgora', '', 'Coleta iniciada', active.length + ' produtos ativos');
  const resultados = active.map(x => collectProduct_(ss, x.row, idx, x.linha));
  const ok = resultados.filter(s => s === 'OK').length;
  const erros = resultados.length - ok;
  const segundos = Math.round((new Date() - inicio) / 1000);
  log_(ss, erros ? 'AVISO' : 'INFO', 'coletarAgora', '', 'Coleta finalizada: ' + ok + ' OK, ' + erros + ' ERRO', segundos + 's');

  atualizarAcompanhamento();
  atualizarDashboard();
}

// Cadastra na aba Produtos os itens de PRODUCTS que ainda nao estao la e mostra no log quais entraram.
// Pode rodar pelo editor quantas vezes quiser: nao coleta preco e nao mexe nos produtos que ja existem.
function sincronizarProdutos() {
  const novos = sincronizarProdutos_(SpreadsheetApp.openById(SPREADSHEET_ID));
  console.log(novos.length ? 'Produtos novos: ' + novos.join(', ') : 'Nenhum produto novo em PRODUCTS');
}

// Compara pelo id e pela url: um item de PRODUCTS com id ou url que ja esta na aba e ignorado.
// Retorna os ids cadastrados.
function sincronizarProdutos_(ss) {
  const linhas = ss.getSheetByName('Produtos').getDataRange().getValues().slice(1);
  const ids = new Set(linhas.map(r => String(r[0])));
  const urls = new Set(linhas.map(r => String(r[6])));
  const novos = PRODUCTS.filter(p => !ids.has(p[0]) && !urls.has(p[5]));
  if (!novos.length) return [];
  const obs = 'Cadastrado pelo codigo em ' + Utilities.formatDate(new Date(), TIMEZONE, 'dd/MM/yyyy');
  append_(ss, 'Produtos', novos.map(p => linhaProduto_(p, obs)));
  novos.forEach(p => log_(ss, 'INFO', 'sincronizarProdutos', p[0], 'Produto novo cadastrado a partir de PRODUCTS', p[5]));
  return novos.map(p => p[0]);
}

// Linha da aba Produtos (13 colunas, na ordem do cabecalho) a partir de um item de PRODUCTS.
function linhaProduto_(p, obsPadrao) {
  return [p[0], true, p[1], p[2], p[3], p[4], p[5], p[6], p[7], p[8], p[10] || 'h4', p[9] || obsPadrao, ''];
}

// AliExpress: a pagina do anuncio nao traz o preco (o navegador carrega depois), entao o preco sai da busca.
// O cookie fixa Brasil e BRL: sem ele, os servidores do Google (EUA) recebem os precos em dolar.
const ALI_COOKIE = 'aep_usuc_f=site=bra&c_tp=BRL&region=BR&b_locale=pt_BR';

function ehAliExpress_(loja) {
  return String(loja).toLowerCase() === 'aliexpress';
}

function urlBuscaAliExpress_(selector) {
  const termo = String(selector || '').replace(/^busca:/, '').trim();
  if (!termo) throw new Error('AliExpress sem termo de busca: preencha selector_preco_pix com busca:<termo>');
  return 'https://pt.aliexpress.com/w/wholesale-' + encodeURIComponent(termo) + '.html';
}

// Lojas na plataforma VTEX: o preco sai da API publica de busca da loja, pelo endereco do produto (.../<slug>/p).
// Artwalk, Authentic Feet e Magic Feet sao do mesmo grupo e dividem o catalogo.
const LOJAS_VTEX = ['artwalk.com.br', 'authenticfeet.com.br', 'magicfeet.com.br'];

function hostUrl_(url) {
  return (String(url).match(/^https?:\/\/(?:www\.)?([^\/?#]+)/i) || [])[1] || '';
}

// Qual leitor usar: 'aliexpress' (pela loja), 'vtex' ou 'dafiti' (pelo endereco) e 'kabum' para o resto.
function tipoLoja_(row, idx) {
  if (ehAliExpress_(row[idx.loja])) return 'aliexpress';
  const host = hostUrl_(row[idx.url]).toLowerCase();
  if (LOJAS_VTEX.indexOf(host) >= 0) return 'vtex';
  if (host === 'dafiti.com.br') return 'dafiti';
  return 'kabum';
}

function urlApiVtex_(url) {
  const m = String(url).split('?')[0].match(/^(https?:\/\/[^\/]+)\/(.+)\/p\/?$/i);
  if (!m) throw new Error('Endereco VTEX fora do formato https://loja/<produto>/p: ' + url);
  return m[1] + '/api/catalog_system/pub/products/search/' + m[2] + '/p';
}

// Tamanho opcional em selector_preco_pix (tam:41): o preco passa a ser o desse numero e, sem estoque nele, a coleta e ERRO.
function tamanhoProcurado_(selector) {
  const m = String(selector || '').match(/^tam:\s*(.+)$/i);
  return m ? m[1].trim() : '';
}

// Baixa a pagina de onde sai o preco: Kabum e Dafiti = a url do produto; AliExpress = a busca do selector_preco_pix;
// VTEX = a API de busca da loja. Cada endereco e baixado uma vez por execucao: os anuncios da mesma busca reaproveitam a pagina.
// AliExpress: ate 3 tentativas para cair na versao da busca com preco original (ver buscaAliExpressCompleta_).
const paginasBaixadas_ = {};
function baixarPagina_(row, idx) {
  const tipo = tipoLoja_(row, idx);
  const ali = tipo === 'aliexpress';
  const url = ali ? urlBuscaAliExpress_(row[idx.selector_preco_pix]) : (tipo === 'vtex' ? urlApiVtex_(row[idx.url]) : row[idx.url]);
  if (!paginasBaixadas_[url]) {
    const headers = {'User-Agent': 'Mozilla/5.0 MonitorPrecos/1.0'};
    if (ali) {
      headers['Accept-Language'] = 'pt-BR';
      headers.Cookie = ALI_COOKIE;
    }
    let pagina = null;
    for (let tentativa = 0; tentativa < (ali ? 3 : 1); tentativa++) {
      const resp = UrlFetchApp.fetch(url, {muteHttpExceptions: true, followRedirects: true, headers: headers});
      pagina = {status: resp.getResponseCode(), html: resp.getContentText()};
      if (!ali || buscaAliExpressCompleta_(pagina.html)) break;
    }
    paginasBaixadas_[url] = pagina;
  }
  return paginasBaixadas_[url];
}

// A busca do AliExpress alterna entre duas versoes (teste A/B) que mostram precos diferentes para o mesmo anuncio
// (em 19/10/2026: R$ 89,99 numa e R$ 83,59 na outra). A usada aqui e a que traz o preco original (originalPrice);
// a outra nao tem esse campo em nenhum anuncio. Misturar as duas faria o preco subir e cair sem motivo.
function buscaAliExpressCompleta_(html) {
  return extrairItensAliExpress_(html).some(it => (it.prices || {}).originalPrice);
}

function parsePagina_(html, row, idx) {
  const tipo = tipoLoja_(row, idx);
  const tamanho = tamanhoProcurado_(row[idx.selector_preco_pix]);
  if (tipo === 'aliexpress') return parseAliExpress_(html, row[idx.url]);
  if (tipo === 'vtex') return parseVtex_(html, tamanho);
  if (tipo === 'dafiti') return parseDafiti_(html, tamanho);
  return parseKabum_(html, row[idx.url]);
}

// Resultado vazio dos leitores (mesmos campos que parseKabum_ devolve).
function resultadoVazio_(selector) {
  return {
    titulo: '', precoDe: '', precoPix: '', descontoPix: '', parcelamento: '', precoParcela: '', qtdParcelas: '',
    selector: selector, status: 'ERRO', confianca: 'Baixa', obs: '', erro: ''
  };
}

// Escolhe o preco entre os tamanhos com estoque: o menor de todos ou, com tam:<numero>, o desse numero.
// opcoes = [{tamanho, preco, precoDe}]. Sem estoque (no geral ou no numero pedido), a coleta vira ERRO com o motivo.
function escolherTamanho_(resultado, opcoes, tamanho) {
  const tamanhos = opcoes.map(o => o.tamanho);
  resultado.obs = 'Tamanhos com estoque: ' + (tamanhos.length ? tamanhos.join(', ') : 'nenhum');
  const validas = opcoes.filter(o => o.preco > 0 && (!tamanho || o.tamanho === tamanho));
  if (!validas.length) {
    resultado.erro = tamanho ? 'Esgotado no tamanho ' + tamanho : 'Esgotado em todos os tamanhos';
    return resultado;
  }
  const melhor = validas.reduce((a, b) => (b.preco < a.preco ? b : a));
  return Object.assign(resultado, {
    precoPix: round2_(melhor.preco),
    precoDe: melhor.precoDe > melhor.preco ? round2_(melhor.precoDe) : '',
    descontoPix: melhor.precoDe > melhor.preco ? Math.round((1 - melhor.preco / melhor.precoDe) * 100) + '% de desconto' : '',
    status: 'OK',
    confianca: 'Alta'
  });
}

// VTEX: a API devolve [produto]; cada item e um tamanho e o preco esta em sellers[].commertialOffer.
// Price = preco de venda, ListPrice = preco "de". Item com AvailableQuantity 0 esta esgotado (o preco dele continua la, desatualizado).
function parseVtex_(texto, tamanho) {
  const resultado = resultadoVazio_('vtex_api');
  let produtos;
  try {
    produtos = JSON.parse(texto);
  } catch (e) {
    return Object.assign(resultado, {erro: 'API VTEX nao respondeu JSON (bloqueio ou pagina mudou)'});
  }
  const produto = Array.isArray(produtos) ? produtos[0] : null;
  if (!produto) return Object.assign(resultado, {erro: 'Produto nao encontrado na API VTEX (saiu do catalogo?)'});
  resultado.titulo = produto.productName || '';
  const opcoes = [];
  (produto.items || []).forEach(item => {
    const tam = String((item.Tamanho || [])[0] || String(item.name || '').split(' - ').pop()).trim();
    (item.sellers || []).forEach(s => {
      const oferta = s.commertialOffer || {};
      if (Number(oferta.AvailableQuantity) > 0) opcoes.push({tamanho: tam, preco: Number(oferta.Price) || 0, precoDe: Number(oferta.ListPrice) || 0});
    });
  });
  return escolherTamanho_(resultado, opcoes, tamanho);
}

// Dafiti: o preco de venda esta em itemprop="price" content="109.99" e o preco "de" em data-field="specialPrice".
// Os tamanhos listados na pagina (radio-button-size-block) sao os que tem estoque.
function parseDafiti_(html, tamanho) {
  const resultado = resultadoVazio_('dafiti_itemprop');
  const titulo = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  resultado.titulo = titulo ? stripHtml_(titulo[1]) : '';
  const preco = Number((html.match(/itemprop="price"\s+content="([\d.]+)"/i) || [])[1]) || 0;
  if (!preco) return Object.assign(resultado, {erro: 'Preco nao encontrado na pagina da Dafiti (produto saiu ou pagina mudou)'});
  const precoDe = parsePrice_((html.match(/data-field="specialPrice"[^>]*>\s*(R\$\s*[\d.]+,\d{2})/i) || [])[1]) || 0;
  const re = /radio-button-size-block"\s*data-value="[^"]+"[\s\S]*?<span data-field="name">([^<]+)<\/span>/g;
  const opcoes = [];
  let m;
  while ((m = re.exec(html)) !== null) opcoes.push({tamanho: m[1].trim(), preco: preco, precoDe: precoDe});
  return escolherTamanho_(resultado, opcoes, tamanho);
}

// Coleta um produto e grava em Coletas_Brutas, Coletas_Fatiadas e Historico.
// Retorna 'OK' ou 'ERRO' (o mesmo valor gravado em Coletas_Brutas.status_coleta).
function collectProduct_(ss, row, idx, linhaProduto) {
  const now = new Date();
  const coletaId = Utilities.formatDate(now, TIMEZONE, 'yyyyMMdd-HHmmss') + '-' + row[idx.id];
  const refPrice = Number(row[idx.preco_maximo]) || 0;
  try {
    const pagina = baixarPagina_(row, idx);
    const status = pagina.status;
    const html = pagina.html;
    const parsed = parsePagina_(html, row, idx);
    const rawText = stripHtml_(html).slice(0, 1500);
    const rawPrices = findPrices_(stripHtml_(html));
    const avaliacao = avaliarColeta_(status, parsed, refPrice);

    append_(ss, 'Coletas_Brutas', [[coletaId, now, row[idx.id], row[idx.loja], row[idx.url], status, parsed.titulo, html.length, rawText, rawPrices.join(' | '), avaliacao.motivo, simpleHash_(html), avaliacao.status]]);
    append_(ss, 'Coletas_Fatiadas', [[coletaId, now, row[idx.id], row[idx.nome], row[idx.loja], row[idx.url], parsed.precoDe, parsed.precoPix, parsed.descontoPix, parsed.parcelamento, parsed.precoParcela, parsed.qtdParcelas, parsed.selector, parsed.status, parsed.confianca, parsed.obs]]);

    const history = ss.getSheetByName('Historico');
    const temPreco = avaliacao.status === 'OK';
    const lastPrice = getLastPrice_(history, row[idx.id], refPrice);
    const minPrice = getMinPrice_(history, row[idx.id], temPreco ? parsed.precoPix : '', refPrice);
    const deltaAlvo = row[idx.preco_alvo] && temPreco ? round2_(parsed.precoPix - Number(row[idx.preco_alvo])) : '';
    const variation = lastPrice && temPreco ? round2_(parsed.precoPix - lastPrice) : '';
    const statusPreco = temPreco ? getStatusPrice_(parsed.precoPix, row[idx.preco_alvo], row[idx.preco_maximo], parsed.status) : 'ERRO';
    append_(ss, 'Historico', [[now, row[idx.id], row[idx.nome], row[idx.loja], row[idx.url], parsed.precoDe, parsed.precoPix, row[idx.preco_alvo], deltaAlvo, variation, minPrice, statusPreco, parsed.descontoPix, parsed.parcelamento, '']]);

    if (linhaProduto && idx.ultima_coleta !== undefined) {
      ss.getSheetByName('Produtos').getRange(linhaProduto, idx.ultima_coleta + 1).setValue(now).setNumberFormat(DATETIME_FORMAT);
    }
    if (avaliacao.status !== 'OK') log_(ss, 'AVISO', 'collectProduct_', row[idx.id], avaliacao.motivo, row[idx.url]);
    return avaliacao.status;
  } catch (err) {
    append_(ss, 'Coletas_Brutas', [[coletaId, now, row[idx.id], row[idx.loja], row[idx.url], '', '', '', '', '', 'Excecao: ' + err.message, '', 'ERRO']]);
    log_(ss, 'ERRO', 'collectProduct_', row[idx.id], err.message, row[idx.url]);
    return 'ERRO';
  }
}

// Decide se a coleta deu certo. Motivos de ERRO:
// - HTTP diferente de 200
// - preco PIX nao encontrado na pagina
// - preco suspeito: abaixo de LIMITE_PRECO_SUSPEITO x preco_maximo (quase sempre e o valor da parcela)
function avaliarColeta_(httpStatus, parsed, ref) {
  if (Number(httpStatus) !== 200) return {status: 'ERRO', motivo: 'HTTP ' + httpStatus};
  const preco = parsed.precoPix;
  if (parsed.status !== 'OK' || typeof preco !== 'number' || !(preco > 0)) {
    return {status: 'ERRO', motivo: parsed.erro || 'Preco PIX nao encontrado'};
  }
  if (!precoValido_(preco, ref)) {
    return {status: 'ERRO', motivo: 'Preco suspeito: ' + fmtBRL_(preco) + ' (abaixo de ' + Math.round(LIMITE_PRECO_SUSPEITO * 100) + '% do preco_maximo, provavel parcela)'};
  }
  return {status: 'OK', motivo: ''};
}

function parseKabum_(html, url) {
  const text = stripHtml_(html);
  const prices = findPrices_(text);
  const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/is) || html.match(/<title[^>]*>(.*?)<\/title>/is);
  const discountMatch = text.match(/(?:À|A) vista no PIX com \d+% de desconto/i);
  const installmentMatch = text.match(/\d+x\s*R\$\s*\d{1,3}(?:\.\d{3})*,\d{2}.{0,80}?(?:juros|NuPay|cart[aã]o)/i) || text.match(/\d+x\s*R\$\s*\d{1,3}(?:\.\d{3})*,\d{2}.{0,40}/i);
  const installmentText = installmentMatch ? installmentMatch[0].trim() : '';
  const installmentPrice = installmentText.match(/R\$\s*\d{1,3}(?:\.\d{3})*,\d{2}/);
  const installmentQty = installmentText.match(/(\d+)x/i);

  // Ordem de confianca do preco PIX:
  // 1) JSON do Next.js da Kabum: "prices":{"oldPrice","priceWithDiscount","price","discountPercentage"}
  // 2) JSON-LD (schema.org Product > offers.price)
  // 3) <h4> (layout antigo da pagina)
  // Nao usa mais o "segundo R$ da pagina" como fallback: era isso que gravava o valor da PARCELA como preco PIX.
  const next = extractKabumPrices_(html, url);
  const ldPrice = next ? '' : extractLdJsonPrice_(html);
  const h4Match = (next || ldPrice) ? null : html.match(/<h4[^>]*>(.*?)<\/h4>/is);
  const h4Price = h4Match ? parsePrice_(findPrices_(stripHtml_(h4Match[1]))[0]) : '';

  let precoPix = '', precoDe = '', selector = 'nenhum', confianca = 'Baixa';
  if (next) {
    precoPix = next.priceWithDiscount; precoDe = next.price; selector = 'next_data'; confianca = 'Alta';
  } else if (ldPrice) {
    precoPix = ldPrice; precoDe = parsePrice_(prices[0]); selector = 'ld_json'; confianca = 'Alta';
  } else if (h4Price) {
    precoPix = h4Price; precoDe = parsePrice_(prices[0]); selector = 'h4'; confianca = 'Media';
  }

  return {
    titulo: titleMatch ? stripHtml_(titleMatch[1]) : '',
    precoDe: precoDe,
    precoPix: precoPix,
    descontoPix: next && next.discountPercentage ? next.discountPercentage + '% de desconto no PIX' : (discountMatch ? discountMatch[0] : ''),
    parcelamento: installmentText,
    precoParcela: installmentPrice ? parsePrice_(installmentPrice[0]) : '',
    qtdParcelas: installmentQty ? Number(installmentQty[1]) : '',
    selector: selector,
    status: precoPix ? 'OK' : 'ERRO',
    confianca: confianca,
    obs: prices.slice(0, 8).join(' | ')
  };
}

function extractKabumPrices_(html, url) {
  const re = /"prices":\{([^{}]*)\}/g;
  const slug = String(url || '').split('?')[0].split('/').filter(String).pop() || '';
  const pos = slug ? html.indexOf('"friendlyName":"' + slug + '"') : -1;
  re.lastIndex = pos >= 0 ? pos : 0;
  let m = re.exec(html);
  if (!m && pos > 0) {
    re.lastIndex = 0;
    m = re.exec(html);
  }
  if (!m) return null;
  const bloco = m[1];
  const num = key => {
    const x = bloco.match(new RegExp('"' + key + '":(-?[\\d.]+)'));
    return x ? Number(x[1]) : 0;
  };
  const r = {
    oldPrice: num('oldPrice'),
    priceWithDiscount: num('priceWithDiscount'),
    price: num('price'),
    discountPercentage: num('discountPercentage')
  };
  return r.priceWithDiscount > 0 ? r : null;
}

// Le um anuncio na busca do AliExpress. A lista de anuncios vem no JSON "itemList":{"content":[...]} da pagina.
// preco_pix = prices.salePrice.minPrice (o "a partir de" do anuncio; no AliExpress e o mesmo no PIX e no cartao)
// preco_de = prices.originalPrice.minPrice. O anuncio e achado pelo numero da url (/item/<numero>.html).
function parseAliExpress_(html, url) {
  const idAnuncio = (String(url).match(/\/item\/(\d+)\.html/) || [])[1] || '';
  const itens = extrairItensAliExpress_(html);
  const item = itens.find(it => it.productId === idAnuncio);
  const resultado = {
    titulo: '', precoDe: '', precoPix: '', descontoPix: '', parcelamento: '', precoParcela: '', qtdParcelas: '',
    selector: 'ali_busca', status: 'ERRO', confianca: 'Baixa', obs: '', erro: ''
  };
  if (!itens.length) return Object.assign(resultado, {erro: 'Busca do AliExpress sem lista de anuncios (captcha ou pagina mudou)'});
  if (!itens.some(it => (it.prices || {}).originalPrice)) return Object.assign(resultado, {erro: 'Busca do AliExpress veio na versao sem preco original (teste A/B) nas 3 tentativas'});
  if (!item) return Object.assign(resultado, {erro: 'Anuncio ' + idAnuncio + ' fora da 1a pagina da busca (' + itens.length + ' anuncios)'});

  const precos = item.prices || {};
  const venda = precos.salePrice || {};
  const original = precos.originalPrice || {};
  resultado.titulo = (item.title || {}).displayTitle || '';
  resultado.obs = 'Posicao ' + (itens.indexOf(item) + 1) + ' de ' + itens.length + ' na busca; ' + String((item.trade || {}).tradeDesc || '').replace(/\s+/g, ' ').trim();
  if (venda.currencyCode !== 'BRL') return Object.assign(resultado, {erro: 'Preco em ' + venda.currencyCode + ' em vez de BRL'});

  const preco = Number(venda.minPrice) || 0;
  return Object.assign(resultado, {
    precoDe: Number(original.minPrice) || '',
    precoPix: preco || '',
    descontoPix: venda.discount ? venda.discount + '% de desconto' : '',
    status: preco > 0 ? 'OK' : 'ERRO',
    confianca: 'Media'
  });
}

function extrairItensAliExpress_(html) {
  const pos = html.indexOf('"itemList":{"content":[');
  if (pos < 0) return [];
  try {
    return JSON.parse(extrairArrayJson_(html, html.indexOf('[', pos)));
  } catch (e) {
    return [];
  }
}

// Recorta o array JSON que comeca em texto[inicio] (um '['), respeitando colchetes dentro de strings.
function extrairArrayJson_(texto, inicio) {
  let nivel = 0;
  let emString = false;
  for (let i = inicio; i < texto.length; i++) {
    const c = texto[i];
    if (emString) {
      if (c === '\\') i++;
      else if (c === '"') emString = false;
    } else if (c === '"') {
      emString = true;
    } else if (c === '[' || c === '{') {
      nivel++;
    } else if (c === ']' || c === '}') {
      nivel--;
      if (nivel === 0) return texto.slice(inicio, i + 1);
    }
  }
  return '';
}

function extractLdJsonPrice_(html) {
  const blocos = html.match(/<script[^>]*application\/ld\+json[^>]*>[\s\S]*?<\/script>/gi) || [];
  for (const b of blocos) {
    try {
      const json = JSON.parse(b.replace(/^<script[^>]*>/i, '').replace(/<\/script>$/i, ''));
      const itens = [].concat(json['@graph'] || json);
      for (const it of itens) {
        if (it && it['@type'] === 'Product' && it.offers) {
          const oferta = [].concat(it.offers)[0];
          const p = Number(oferta.price || oferta.lowPrice);
          if (p > 0) return p;
        }
      }
    } catch (e) {
      // bloco JSON-LD invalido: ignora e tenta o proximo
    }
  }
  return '';
}

// Preco abaixo de 50% da referencia (preco_maximo da aba Produtos) e tratado como leitura errada
// (ex.: o scraper pegou o valor da parcela). Essas coletas sao ignoradas na aba Acompanhamento.
const LIMITE_PRECO_SUSPEITO = 0.5;

function atualizarAcompanhamento() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Acompanhamento');
  const prodValues = ss.getSheetByName('Produtos').getDataRange().getValues();
  const pHead = prodValues.shift();
  const p = Object.fromEntries(pHead.map((h, i) => [h, i]));
  const hist = ss.getSheetByName('Historico').getDataRange().getValues().slice(1);

  const header = [
    'id_produto', 'nome', 'loja', 'preco_atual', 'preco_anterior', 'variacao_abs', 'variacao_pct',
    'tendencia', 'ultima_mudanca', 'menor_preco', 'maior_preco', 'media_7_coletas', 'status_preco',
    'ultima_coleta_valida', 'coletas_ignoradas', 'url'
  ];

  const rows = prodValues.filter(r => r[p.id]).map(r => {
    const id = r[p.id];
    const ref = Number(r[p.preco_maximo]) || 0;
    const doProduto = hist.filter(h => h[1] === id);
    const validas = doProduto.filter(h => precoValido_(h[6], ref));
    const ignoradas = doProduto.length - validas.length;
    if (!validas.length) {
      return [id, r[p.nome], r[p.loja], '', '', '', '', 'Sem dados', '', '', '', '', 'ERRO', '', ignoradas, r[p.url]];
    }

    const precos = validas.map(h => h[6]);
    const atual = precos[precos.length - 1];
    const anterior = precos.length > 1 ? precos[precos.length - 2] : '';
    const varAbs = anterior === '' ? '' : round2_(atual - anterior);
    const varPct = anterior === '' ? '' : (atual - anterior) / anterior;
    let tendencia = 'Primeira coleta';
    if (anterior !== '') tendencia = varAbs > 0 ? '▲ Subiu' : varAbs < 0 ? '▼ Caiu' : '→ Igual';

    let ultimaMudanca = 'Sem mudança';
    for (let i = validas.length - 1; i > 0; i--) {
      const de = validas[i - 1][6];
      const para = validas[i][6];
      if (de !== para) {
        const dia = Utilities.formatDate(new Date(validas[i][0]), TIMEZONE, 'dd/MM');
        ultimaMudanca = (para > de ? '▲ ' : '▼ ') + dia + ': ' + fmtBRL_(de) + ' → ' + fmtBRL_(para);
        break;
      }
    }

    const ult7 = precos.slice(-7);
    const media7 = round2_(ult7.reduce((a, b) => a + b, 0) / ult7.length);
    const status = getStatusPrice_(atual, r[p.preco_alvo], r[p.preco_maximo], 'OK');
    return [
      id, r[p.nome], r[p.loja], atual, anterior, varAbs, varPct, tendencia, ultimaMudanca,
      Math.min.apply(null, precos), Math.max.apply(null, precos), media7, status,
      validas[validas.length - 1][0], ignoradas, r[p.url]
    ];
  });

  sheet.clear();
  sheet.clearConditionalFormatRules();
  sheet.getRange(1, 1, 1, header.length).setValues([header]);
  if (rows.length) {
    const last = rows.length + 1;
    sheet.getRange(2, 1, rows.length, header.length).setValues(rows);
    ['D', 'E', 'F', 'J', 'K', 'L'].forEach(c => sheet.getRange(c + '2:' + c + last).setNumberFormat('"R$" #,##0.00'));
    sheet.getRange('G2:G' + last).setNumberFormat('+0.0%;-0.0%;0.0%');
    sheet.getRange('N2:N' + last).setNumberFormat('dd/MM/yyyy HH:mm');

    const verde = '#d9f2e3', vermelho = '#fbe0e0';
    const variacao = sheet.getRange('F2:H' + last);
    const mudanca = sheet.getRange('I2:I' + last);
    const faixaStatus = sheet.getRange('M2:M' + last);
    sheet.setConditionalFormatRules([
      SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$F2<0').setBackground(verde).setFontColor('#137333').setRanges([variacao]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$F2>0').setBackground(vermelho).setFontColor('#a50e0e').setRanges([variacao]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextStartsWith('▼').setFontColor('#137333').setRanges([mudanca]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextStartsWith('▲').setFontColor('#a50e0e').setRanges([mudanca]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('COMPRAR').setBackground(verde).setBold(true).setRanges([faixaStatus]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('CARO').setFontColor('#a50e0e').setRanges([faixaStatus]).build()
    ]);
  }
  formatSheet_(sheet);
  console.log('Acompanhamento atualizado: ' + rows.length + ' produtos');
}

// Roda o leitor de cada loja (Kabum, AliExpress, VTEX ou Dafiti) em todos os produtos ativos e so mostra no log (nao grava nada na planilha).
function testarParserKabum() {
  const values = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Produtos').getDataRange().getValues();
  const headers = values.shift();
  const idx = Object.fromEntries(headers.map((h, i) => [h, i]));
  const ativos = values.filter(r => r[idx.ativo] === true && r[idx.url]);
  console.log('Produtos ativos: ' + ativos.length);
  ativos.forEach(r => testarProduto_(r, idx));
}

// Testa o leitor do AliExpress com os itens de PRODUCTS (nao precisam estar na planilha) e so mostra no log.
// Rode depois do clasp push: ERRO aqui quer dizer que os servidores do Google nao estao conseguindo ler a busca.
function testarParserAliExpress() {
  testarProdutosDoCodigo_(['aliexpress']);
}

// Testa os leitores das lojas que nao sao a Kabum (AliExpress, VTEX e Dafiti) com os itens de PRODUCTS e so mostra no log.
// Rode depois do clasp push: ERRO por bloqueio aqui quer dizer que os servidores do Google nao conseguem ler a loja.
function testarLojasNovas() {
  testarProdutosDoCodigo_(['aliexpress', 'vtex', 'dafiti']);
}

function testarProdutosDoCodigo_(tipos) {
  const idx = Object.fromEntries(CABECALHO_PRODUTOS.map((h, i) => [h, i]));
  PRODUCTS.map(p => linhaProduto_(p, '')).filter(r => tipos.indexOf(tipoLoja_(r, idx)) >= 0).forEach(r => testarProduto_(r, idx));
}

function testarProduto_(r, idx) {
  try {
    const pagina = baixarPagina_(r, idx);
    const parsed = parsePagina_(pagina.html, r, idx);
    const avaliacao = avaliarColeta_(pagina.status, parsed, Number(r[idx.preco_maximo]) || 0);
    console.log(r[idx.id] + ' | HTTP ' + pagina.status + ' | ' + avaliacao.status + (avaliacao.motivo ? ' (' + avaliacao.motivo + ')' : '') +
      ' | PIX ' + parsed.precoPix + ' | normal ' + parsed.precoDe + ' | ' + parsed.selector + ' | ' + parsed.descontoPix + (parsed.obs && tipoLoja_(r, idx) !== 'kabum' ? ' | ' + parsed.obs : ''));
  } catch (err) {
    console.log(r[idx.id] + ' | EXCECAO ' + err.message);
  }
}

// Recalcula a aba Dashboard com valores (nao formulas). Chamado no fim de coletarAgora().
function atualizarDashboard() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const dash = ss.getSheetByName('Dashboard');
  const agora = new Date();

  const prod = ss.getSheetByName('Produtos').getDataRange().getValues();
  const pIdx = Object.fromEntries((prod.shift() || []).map((h, i) => [h, i]));
  const ativos = prod.filter(r => r[pIdx.ativo] === true).length;

  const acomp = ss.getSheetByName('Acompanhamento').getDataRange().getValues();
  const aIdx = Object.fromEntries((acomp.shift() || []).map((h, i) => [h, i]));
  const contar = fn => acomp.filter(fn).length;

  const brutas = ss.getSheetByName('Coletas_Brutas').getDataRange().getValues();
  const bIdx = Object.fromEntries((brutas.shift() || []).map((h, i) => [h, i]));
  const comData = brutas.filter(r => r[bIdx.data_hora] instanceof Date);
  const ultima = comData.length ? comData[comData.length - 1][bIdx.data_hora] : null;
  // "ultima execucao" = coletas gravadas ate 30 min antes da ultima
  const ultimaExec = ultima ? comData.filter(r => ultima - r[bIdx.data_hora] <= 30 * 60 * 1000) : [];
  const seteDias = ultima ? comData.filter(r => ultima - r[bIdx.data_hora] <= 7 * 24 * 3600 * 1000) : [];
  const okDe = rows => rows.filter(r => r[bIdx.status_coleta] === 'OK').length;

  const gatilhos = ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'coletarAgora');
  const horasSemColeta = ultima ? (agora - ultima) / 3600000 : Infinity;
  let situacao = 'OK';
  if (!gatilhos.length) situacao = 'SEM GATILHO: rode criarGatilhoDiario23h() no Apps Script';
  else if (horasSemColeta > 26) situacao = 'ATRASADA: ultima coleta ha ' + Math.round(horasSemColeta) + 'h (veja Apps Script > Execucoes)';

  const linhas = [
    ['Indicador', 'Valor'],
    ['Situacao da coleta automatica', situacao],
    ['Gatilhos de coletarAgora', gatilhos.length ? gatilhos.length + ' ativo(s), diario perto das 23h' : 'nenhum'],
    ['Ultima coleta', ultima || ''],
    ['Coletas OK na ultima execucao', okDe(ultimaExec) + ' de ' + ultimaExec.length],
    ['Coletas OK nos ultimos 7 dias', okDe(seteDias) + ' de ' + seteDias.length],
    ['Produtos ativos', ativos],
    ['Produtos que cairam (vs coleta anterior)', contar(r => String(r[aIdx.tendencia]).indexOf('▼') === 0)],
    ['Produtos que subiram (vs coleta anterior)', contar(r => String(r[aIdx.tendencia]).indexOf('▲') === 0)],
    ['Alertas COMPRAR (preco atual <= preco_alvo)', contar(r => r[aIdx.status_preco] === 'COMPRAR')],
    ['Produtos CARO (preco atual > preco_maximo)', contar(r => r[aIdx.status_preco] === 'CARO')],
    ['Produtos sem preco valido', contar(r => r[aIdx.tendencia] === 'Sem dados')],
    ['Dashboard atualizado em', agora]
  ];

  dash.clear();
  dash.clearConditionalFormatRules();
  dash.getRange(1, 1, linhas.length, 2).setValues(linhas);
  dash.getRange(2, 2, linhas.length - 1, 1).setHorizontalAlignment('left');
  dash.getRange(4, 2).setNumberFormat(DATETIME_FORMAT);
  dash.getRange(linhas.length, 2).setNumberFormat(DATETIME_FORMAT);
  dash.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('OK').setBackground('#d9f2e3').setFontColor('#137333').setBold(true).setRanges([dash.getRange('B2')]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextDoesNotContain('OK').setBackground('#fbe0e0').setFontColor('#a50e0e').setBold(true).setRanges([dash.getRange('B2')]).build()
  ]);
  formatSheet_(dash);
}

// Migracao unica (pode rodar de novo sem problema):
// - data_hora com hora em Coletas_Brutas, Coletas_Fatiadas, Historico e Logs
// - coluna status_coleta (OK/ERRO) + motivo na coluna erro para as coletas antigas de Coletas_Brutas
// - Config com a frequencia e o parser atuais
function migrarColetasBrutasV2() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  Object.keys(COLUNAS_DATA_HORA).forEach(nome => {
    const sh = ss.getSheetByName(nome);
    if (sh.getMaxRows() > 1) sh.getRange(2, COLUNAS_DATA_HORA[nome], sh.getMaxRows() - 1, 1).setNumberFormat(DATETIME_FORMAT);
  });

  const brutas = ss.getSheetByName('Coletas_Brutas');
  brutas.getRange(1, 13).setValue('status_coleta');
  const n = brutas.getLastRow() - 1;
  if (n > 0) {
    const raw = brutas.getRange(2, 1, n, 13).getValues();
    const fat = ss.getSheetByName('Coletas_Fatiadas').getDataRange().getValues().slice(1);
    const porColeta = {};
    fat.forEach(r => { porColeta[r[0]] = {precoPix: r[7], status: r[13]}; });
    const prod = ss.getSheetByName('Produtos').getDataRange().getValues();
    const pIdx = Object.fromEntries((prod.shift() || []).map((h, i) => [h, i]));
    const refPorId = {};
    prod.forEach(r => { refPorId[r[pIdx.id]] = Number(r[pIdx.preco_maximo]) || 0; });

    const avaliacoes = raw.map(r => {
      const parsed = porColeta[r[0]] || {precoPix: '', status: 'ERRO'};
      return avaliarColeta_(r[5], parsed, refPorId[r[2]]);
    });
    brutas.getRange(2, 11, n, 1).setValues(raw.map((r, i) => [r[10] || avaliacoes[i].motivo]));
    brutas.getRange(2, 13, n, 1).setValues(avaliacoes.map(a => [a.status]));
  }

  const faixa = brutas.getRange('M2:M');
  const regras = brutas.getConditionalFormatRules().filter(rule => rule.getRanges()[0].getColumn() !== 13);
  regras.push(
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('OK').setBackground('#d9f2e3').setFontColor('#137333').setRanges([faixa]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('ERRO').setBackground('#fbe0e0').setFontColor('#a50e0e').setRanges([faixa]).build()
  );
  brutas.setConditionalFormatRules(regras);
  formatSheet_(brutas);

  const config = ss.getSheetByName('Config');
  const cfg = config.getDataRange().getValues();
  cfg.forEach((r, i) => {
    if (r[0] === 'frequencia_sugerida') config.getRange(i + 1, 2).setValue('Diariamente perto das 23h (criarGatilhoDiario23h)');
    if (r[0] === 'parser_kabum') config.getRange(i + 1, 2).setValue(PARSER_KABUM_DESC);
  });

  const ok = n > 0 ? brutas.getRange(2, 13, n, 1).getValues().filter(r => r[0] === 'OK').length : 0;
  log_(ss, 'INFO', 'migrarColetasBrutasV2', '', 'Migracao concluida: ' + ok + ' OK, ' + (n - ok) + ' ERRO em ' + n + ' coletas antigas', '');
  atualizarDashboard();
  console.log('Migracao concluida: ' + ok + ' OK de ' + n);
}

function criarGatilhoDiario23h() {
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === 'coletarAgora') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('coletarAgora')
    .timeBased()
    .atHour(23)
    .everyDays(1)
    .inTimezone(TIMEZONE)
    .create();
}

function criarGatilhoCada6Horas() {
  criarGatilhoDiario23h();
}

function resetSheet_(ss, name) {
  const existing = ss.getSheetByName(name);
  const sheet = existing || ss.insertSheet(name);
  sheet.clear();
  return sheet;
}

function append_(ss, sheetName, rows) {
  const sheet = ss.getSheetByName(sheetName);
  const start = sheet.getLastRow() + 1;
  // A aba tem um numero fixo de linhas (1000 por padrao): cria mais antes de estourar.
  const falta = start + rows.length - 1 - sheet.getMaxRows();
  if (falta > 0) sheet.insertRowsAfter(sheet.getMaxRows(), falta + 500);
  sheet.getRange(start, 1, rows.length, rows[0].length).setValues(rows);
  const colData = COLUNAS_DATA_HORA[sheetName];
  if (colData) sheet.getRange(start, colData, rows.length, 1).setNumberFormat(DATETIME_FORMAT);
}

function log_(ss, nivel, funcao, idProduto, mensagem, detalhe) {
  append_(ss, 'Logs', [[new Date(), nivel, funcao, idProduto || '', mensagem, detalhe || '']]);
}

function formatSheet_(sheet) {
  sheet.setFrozenRows(1);
  sheet.getDataRange().setFontFamily('Arial').setFontSize(10);
  if (sheet.getLastColumn() > 0) {
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight('bold').setBackground('#1f2937').setFontColor('#ffffff');
    sheet.autoResizeColumns(1, Math.min(sheet.getLastColumn(), 12));
  }
}

function stripHtml_(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function findPrices_(text) {
  const matches = String(text || '').match(/R\$\s*\d{1,3}(?:\.\d{3})*,\d{2}/g) || [];
  return [...new Set(matches.map(p => p.replace(/\s+/g, ' ')))];
}

function parsePrice_(priceText) {
  if (!priceText) return '';
  return Number(String(priceText).replace(/[^\d,]/g, '').replace(',', '.'));
}

function getLastPrice_(history, productId, ref) {
  const data = history.getDataRange().getValues().slice(1).filter(r => r[1] === productId && precoValido_(r[6], ref));
  return data.length ? data[data.length - 1][6] : '';
}

function getMinPrice_(history, productId, current, ref) {
  const prices = history.getDataRange().getValues().slice(1).filter(r => r[1] === productId && precoValido_(r[6], ref)).map(r => r[6]);
  if (precoValido_(current, ref)) prices.push(current);
  return prices.length ? Math.min.apply(null, prices) : '';
}

function precoValido_(preco, ref) {
  if (typeof preco !== 'number' || !(preco > 0)) return false;
  return !ref || preco >= ref * LIMITE_PRECO_SUSPEITO;
}

function round2_(n) {
  return Math.round(n * 100) / 100;
}

function fmtBRL_(n) {
  const partes = Number(n).toFixed(2).split('.');
  return 'R$ ' + partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + partes[1];
}

function getStatusPrice_(price, target, max, parseStatus) {
  if (parseStatus !== 'OK' || !price) return 'ERRO';
  if (target && price <= Number(target)) return 'COMPRAR';
  if (max && price > Number(max)) return 'CARO';
  return 'OK';
}

function simpleHash_(text) {
  let hash = 0;
  const value = String(text || '').slice(0, 50000);
  for (let i = 0; i < value.length; i++) hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  return hash;
}
