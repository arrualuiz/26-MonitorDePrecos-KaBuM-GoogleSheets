// Roda os leitores de src/Code.js aqui no PC, sem Apps Script e sem gravar nada na planilha.
// O UrlFetchApp e trocado pelo curl, entao as paginas sao baixadas de verdade (do PC, nao dos servidores do Google).
//
// Uso:
//   node ferramentas/testar-local.js                      -> todos os produtos de PRODUCTS que nao sao da Kabum
//   node ferramentas/testar-local.js CHI-001 MON-001      -> esses ids de PRODUCTS
//   node ferramentas/testar-local.js <url> [tam:42]       -> um endereco qualquer, antes de cadastrar
//
// A loja de um endereco avulso sai do endereco: aliexpress.com -> AliExpress (precisa de busca:<termo> no lugar do tam),
// lojas VTEX e Dafiti pelo dominio, o resto e lido como Kabum.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const {execFileSync} = require('child_process');

const codigo = fs.readFileSync(path.join(__dirname, '..', 'src', 'Code.js'), 'utf8');
const ctx = {
  console,
  UrlFetchApp: {
    fetch: (url, opcoes) => {
      const headers = (opcoes && opcoes.headers) || {};
      const args = ['-s', '-L', '--max-time', '30', '-w', '\n%{http_code}', '-A', headers['User-Agent'] || 'Mozilla/5.0'];
      Object.keys(headers).filter(k => k !== 'User-Agent').forEach(k => args.push('-H', k + ': ' + headers[k]));
      const saida = execFileSync('curl', args.concat([url]), {maxBuffer: 50e6}).toString('utf8');
      const i = saida.lastIndexOf('\n');
      return {getResponseCode: () => Number(saida.slice(i + 1)), getContentText: () => saida.slice(0, i)};
    }
  },
  Utilities: {formatDate: d => d.toISOString()}
};
vm.createContext(ctx);
vm.runInContext(codigo, ctx);
const pegar = nome => vm.runInContext(nome, ctx);

const idx = Object.fromEntries(pegar('CABECALHO_PRODUTOS').map((h, i) => [h, i]));
const PRODUCTS = pegar('PRODUCTS');
const linhaProduto = pegar('linhaProduto_');
const tipoLoja = pegar('tipoLoja_');
const testarProduto = pegar('testarProduto_');

const args = process.argv.slice(2);
let linhas;
if (args[0] && /^https?:\/\//.test(args[0])) {
  const url = args[0].split('?')[0];
  const loja = /aliexpress\./i.test(url) ? 'AliExpress' : pegar('hostUrl_')(url);
  linhas = [linhaProduto(['AVULSO', '', '', '', loja, url, '', 0, '', '', args[1] || ''], '')];
} else if (args.length) {
  linhas = args.map(id => {
    const p = PRODUCTS.find(x => x[0] === id);
    if (!p) throw new Error('Id fora de PRODUCTS: ' + id);
    return linhaProduto(p, '');
  });
} else {
  linhas = PRODUCTS.map(p => linhaProduto(p, '')).filter(r => tipoLoja(r, idx) !== 'kabum');
}

linhas.forEach(r => {
  const titulo = r[idx.id] === 'AVULSO' ? ' (' + tipoLoja(r, idx) + ')' : '';
  process.stdout.write(titulo ? 'Leitor' + titulo + ': ' : '');
  testarProduto(r, idx);
});
