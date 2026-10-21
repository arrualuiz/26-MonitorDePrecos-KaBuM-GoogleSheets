# AcompanhaPrecos

Monitor de preços da Kabum (e de anúncios do AliExpress) feito com **Google Sheets + Google Apps Script**. Todo dia, perto das 23h, o script abre a página de cada produto cadastrado, extrai o preço PIX e grava o histórico na planilha. A aba **Acompanhamento** mostra se o preço subiu ou caiu, e o **Dashboard** mostra se a coleta automática está saudável.

| Item | Valor |
|---|---|
| Planilha | `AcompanhaPrecos` – ID `1hgSeSzOpBzxyJji-S2GPG8xECaZlpr0RlBsaCNQrLZE` |
| Projeto Apps Script | "Untitled project" (standalone, **não** vinculado à planilha) – ID `1JfvpYn5MYRqB1KsGl_H5-a4Sa9ymnLSJ2POCu7XLLWOk0PktiEZ7QLP_` |
| Runtime | V8, fuso `America/Sao_Paulo` |
| Código | `src/Code.js` (um arquivo só) + `src/appsscript.json` |

---

## Como funciona

```
Gatilho diário (~23h)
  └─ coletarAgora()
       ├─ para cada produto ativo da aba Produtos:
       │    collectProduct_()
       │      ├─ UrlFetchApp busca a página da Kabum
       │      ├─ parseKabum_() extrai preço PIX, preço normal, desconto e parcelamento
       │      ├─ avaliarColeta_() decide OK / ERRO
       │      ├─ grava Coletas_Brutas, Coletas_Fatiadas e Historico
       │      └─ atualiza Produtos.ultima_coleta e registra AVISO/ERRO em Logs
       ├─ log de início/fim em Logs
       ├─ atualizarAcompanhamento()   (recria a aba Acompanhamento)
       └─ atualizarDashboard()        (recria a aba Dashboard)
```

### De onde vem o preço (parser)

`parseKabum_()` tenta, nesta ordem:

1. **`__NEXT_DATA__`** (JSON do Next.js que a Kabum embute na página): bloco `"prices":{"oldPrice","priceWithDiscount","price","discountPercentage"}`, que fica logo depois do `"friendlyName"` do produto. `priceWithDiscount` é o preço PIX e `price` é o preço normal.
2. **JSON-LD** (`schema.org Product > offers.price`).
3. **`<h4>`** (layout antigo da página).

> Até 29/09/2026 o parser usava o `<h4>` e, na falta dele, o **segundo "R$" da página**. Em ~09/09 a Kabum tirou o `<h4>` e o segundo "R$" passou a ser o **valor da parcela** (ex.: 295,44 em vez de 2.954,43). Por isso ~230 coletas antigas estão com preço errado. Veja [Regras de status](#regras-de-status).

### AliExpress (`parseAliExpress_()`)

A página do anúncio do AliExpress **não traz o preço** (o navegador carrega depois) e o endereço de dados do produto responde com captcha. O preço sai da **busca**: `selector_preco_pix` = `busca:<termo>` (ex.: `busca:E5-2690-v4` → `https://pt.aliexpress.com/w/wholesale-E5-2690-v4.html`), e o anúncio é achado na lista `"itemList":{"content":[...]}` da página pelo número da `url` (`/item/<numero>.html`).

- `preco_pix` = `prices.salePrice.minPrice`, o "a partir de" do anúncio (a variação mais barata); `preco_de` = `prices.originalPrice.minPrice`.
- A busca é baixada **uma vez por coleta** e reaproveitada por todos os anúncios do mesmo termo.
- O pedido vai com o cookie `aep_usuc_f=site=bra&c_tp=BRL&region=BR`: sem ele, os servidores do Google (EUA) recebem os preços em dólar. Preço em outra moeda vira `ERRO`.
- **Teste A/B:** a busca alterna entre duas versões que mostram preços diferentes para o mesmo anúncio (em 19/10/2026: R$ 89,99 numa e R$ 83,59 na outra). Só vale a versão que traz `originalPrice`; na outra (nenhum anúncio com esse campo), o script baixa de novo, até 3 vezes, e se não conseguir a coleta vira `ERRO`.
- Anúncio que não aparece na 1ª página da busca (60 anúncios) vira `ERRO` naquele dia. A coluna `observacoes` de Coletas_Fatiadas guarda a posição dele na busca.

---

## Abas da planilha

| Aba | Quem escreve | O que tem |
|---|---|---|
| **Config** | `setupMonitor` / `migrarColetasBrutasV2` | Parâmetros descritivos (fuso, frequência, parser). Só informativo. |
| **Produtos** | **Você** (manual) | Cadastro dos produtos monitorados. `ultima_coleta` é preenchida pelo script. |
| **Coletas_Brutas** | `collectProduct_` | Uma linha por coleta: HTTP, título, tamanho do HTML, início do texto, preços encontrados, **erro (motivo)**, hash e **status_coleta (OK/ERRO)**. |
| **Coletas_Fatiadas** | `collectProduct_` | Uma linha por coleta com os campos extraídos (preço de/PIX, desconto, parcelamento, seletor usado, confiança). |
| **Historico** | `collectProduct_` | Uma linha por coleta com preço PIX, alvo, variação vs coleta anterior, menor histórico e `status_preco`. **Não é apagada nem corrigida** (as linhas antigas com preço errado continuam lá). |
| **Acompanhamento** | `atualizarAcompanhamento` (recriada a cada coleta) | Uma linha por produto: preço atual × anterior, variação R$/%, tendência (▲/▼/→), última mudança real, mínimo, máximo, média das 7 últimas, status, última coleta válida e quantas coletas foram ignoradas. |
| **Dashboard** | `atualizarDashboard` (recriada a cada coleta) | Saúde da coleta automática (gatilho, última coleta, OK/ERRO) e contagens (subiram, caíram, COMPRAR, CARO). |
| **Logs** | `log_` | `INFO` início/fim de cada coleta, `AVISO` por produto com ERRO, `ERRO` para exceções. |

### Colunas principais

**Produtos**: `id, ativo, nome, categoria, gpu_tipo, loja, url, preco_alvo, preco_maximo, prioridade, selector_preco_pix, observacoes, ultima_coleta`

- `ativo` precisa ser o booleano `TRUE` (checkbox) para o produto ser coletado.
- `preco_maximo` é usado como **referência** para detectar preço suspeito (ver abaixo) e para o status `CARO`.
- `preco_alvo` (opcional) gera o status `COMPRAR` quando o preço atual fica menor ou igual a ele.

**Coletas_Brutas**: `coleta_id, data_hora, id_produto, loja, url, status_http, titulo_extraido, html_tamanho, texto_bruto_inicio, precos_detectados, erro, hash_simples, status_coleta`

**Coletas_Fatiadas**: `coleta_id, data_hora, id_produto, nome, loja, url, preco_de, preco_pix, desconto_pix, parcelamento, preco_parcela, qtd_parcelas, selector_usado, status_parse, confianca, observacoes`

**Historico**: `data_hora, id_produto, nome, loja, url, preco_de, preco_pix, preco_alvo, delta_alvo, variacao_ultima, menor_historico, status_preco, desconto_pix, parcelamento, screenshot_url`

**Acompanhamento**: `id_produto, nome, loja, preco_atual, preco_anterior, variacao_abs, variacao_pct, tendencia, ultima_mudanca, menor_preco, maior_preco, media_7_coletas, status_preco, ultima_coleta_valida, coletas_ignoradas, url`

`coleta_id` = `yyyyMMdd-HHmmss-<id_produto>` e liga Coletas_Brutas ↔ Coletas_Fatiadas.

---

## Regras de status

### `status_coleta` (Coletas_Brutas) – `avaliarColeta_()`

| Status | Quando | Motivo gravado em `erro` |
|---|---|---|
| `OK` | HTTP 200, preço PIX encontrado e não suspeito | (vazio) |
| `ERRO` | HTTP ≠ 200 | `HTTP 403`, `HTTP 500`… |
| `ERRO` | Nenhum preço PIX encontrado | `Preco PIX nao encontrado` |
| `ERRO` | Preço < `LIMITE_PRECO_SUSPEITO` × `preco_maximo` (padrão 50%) | `Preco suspeito: R$ 295,44 (… provavel parcela)` |
| `ERRO` | Exceção no script | `Excecao: <mensagem>` |

### `status_preco` (Historico / Acompanhamento) – `getStatusPrice_()`

`COMPRAR` (≤ `preco_alvo`), `CARO` (> `preco_maximo`), `OK`, ou `ERRO` quando a coleta não foi OK.

### Preços ignorados na aba Acompanhamento

`precoValido_()` descarta preços vazios e preços abaixo de 50% do `preco_maximo`. É assim que as coletas antigas com o valor da parcela não bagunçam a variação. A coluna `coletas_ignoradas` mostra quantas foram descartadas por produto.

---

## Funções

| Função | Pode rodar pelo editor? | O que faz |
|---|---|---|
| `coletarAgora()` | Sim (adiciona 1 coleta por produto) | Cadastra os produtos novos de `PRODUCTS` (`sincronizarProdutos_`) e coleta todos os produtos ativos. É a função do gatilho. |
| `sincronizarProdutos()` | Sim (só acrescenta) | Cadastra na aba Produtos os itens de `PRODUCTS` cujo `id` e `url` ainda não estão lá e mostra no log quais entraram. Não coleta preço e não mexe nos produtos que já existem. |
| `atualizarAcompanhamento()` | Sim | Recalcula a aba Acompanhamento a partir do Historico. |
| `atualizarDashboard()` | Sim | Recalcula a aba Dashboard. |
| `testarParserKabum()` | Sim (**não grava nada**) | Busca todos os produtos ativos da aba Produtos (Kabum e AliExpress) e mostra no log o preço e o status que a coleta daria. Use depois de mexer no parser. |
| `testarParserAliExpress()` | Sim (**não grava nada**) | Faz o mesmo só com os anúncios do AliExpress que estão em `PRODUCTS` (não precisam estar na planilha). Rode logo depois do `clasp push` para ver se os servidores do Google conseguem ler a busca. |
| `migrarColetasBrutasV2()` | Sim (idempotente) | Migração de 29/09/2026: formato data/hora, `status_coleta` retroativo, Config. |
| `criarGatilhoDiario23h()` | Sim | Apaga os gatilhos de `coletarAgora` e cria um diário às 23h. |
| `criarGatilhoCada6Horas()` | Sim | **Apesar do nome, cria o gatilho diário das 23h** (só chama `criarGatilhoDiario23h`). |
| `setupMonitor()` | **Bloqueada** | **Apaga todas as abas** e recria a planilha do zero a partir da constante `PRODUCTS`. Só roda se `CONFIRMAR_RESET_TOTAL = true`. |
| Funções com `_` no fim | Não (privadas) | Auxiliares: parser, append, logs, formatação etc. |

---

## Gatilho (coleta automática)

- 1 gatilho *time-driven* diário para `coletarAgora`, perto das 23h (rodando às ~23:33, ~30 s por execução).
- Para conferir: **Dashboard → "Situacao da coleta automatica"**.
  - `OK`: existe gatilho e a última coleta tem menos de 26 h.
  - `SEM GATILHO`: rode `criarGatilhoDiario23h()`.
  - `ATRASADA`: o gatilho existe mas não coletou; veja **Apps Script → Executions**.
- No editor do Apps Script (menu lateral): **Triggers** (lista de gatilhos) e **Executions** (histórico e erros).

---

## Como adicionar ou remover um produto

Produto novo entra **pelo código**:

1. No fim da constante `PRODUCTS` (`src/Code.js`), adicione uma linha `[id, nome, categoria, gpu_tipo, loja, url, preco_alvo, preco_maximo, prioridade, observacoes]`:
   - `id` único que segue a numeração (`GPU-010`, `KIT-007`, `PC-002`...);
   - `loja` = `Kabum` ou `AliExpress` e `url` sem os parâmetros depois do `?` (no AliExpress, `https://pt.aliexpress.com/item/<numero>.html`);
   - AliExpress: um 11º campo com o termo da busca onde o anúncio aparece, `'busca:E5-2690-v4'` (ver [AliExpress](#aliexpress-parsealiexpress_));
   - `preco_maximo` = o preço PIX de hoje (serve de referência para `CARO` e para o preço suspeito);
   - `preco_alvo` opcional (`''` se não tiver), para receber `COMPRAR`;
   - `observacoes` opcional; sem ela, fica "Cadastrado pelo codigo em dd/mm/aaaa".
2. `node --check src/Code.js` e `clasp push`.
3. Na próxima coleta das 23h o produto entra sozinho na aba Produtos (com `ativo` = `TRUE`) e já é coletado. Para ver na hora, rode `sincronizarProdutos()` pelo editor e depois `testarParserKabum()`.

Depois de cadastrado, o produto é editado **na planilha**: a sincronização só acrescenta, então mudar o alvo ou o máximo dele em `PRODUCTS` não altera a aba Produtos.

- Para parar de monitorar, mude `ativo` para `FALSE` na aba Produtos (não apague a linha, para não perder o nome no Acompanhamento). Também não tire o item de `PRODUCTS`: ele é só ignorado enquanto o `id` estiver na aba.
- Dá para cadastrar direto na aba Produtos também (mesmas colunas), mas aí o produto fica fora do código e do git.

---

## Desenvolvimento local (git + clasp)

O código vive no Google (Apps Script). O [clasp](https://github.com/google/clasp) sincroniza a pasta `src/` com o projeto online, e o git guarda as versões.

### Primeira vez

```bash
# 1. Node.js 18+ instalado; depois:
npm install -g @google/clasp

# 2. Ative a Google Apps Script API para sua conta:
#    https://script.google.com/home/usersettings  ->  "Google Apps Script API" = On

# 3. Login (abre o navegador; use a conta dona do projeto)
clasp login

# 4. Dentro desta pasta, confira que o local = online
clasp pull     # baixa o código atual para src/
git status     # se aparecer diferença, alguém mexeu pelo editor web
```

O `.clasp.json` já aponta para o projeto (`scriptId`) e usa `src/` como raiz.

> O projeto online também tem um arquivo `backup_codigo_original_2026-09-29.html` (cópia do código original). O `clasp pull` vai baixar esse arquivo. Pode apagar: o original está no commit/tag `v1`. O `clasp push` apaga do projeto online os arquivos que não existem em `src/`.

### Dia a dia

```bash
clasp pull                       # antes de começar, se editou algo pelo navegador
# ... edite src/Code.js ...
node --check src/Code.js         # checagem de sintaxe
clasp push                       # envia para o Apps Script
# rode testarParserKabum / atualizarAcompanhamento pelo editor para testar
git add -A && git commit -m "descreva a mudanca"
```

`clasp open` abre o editor online. `clasp logs` mostra logs (precisa de projeto GCP configurado; pelo editor é mais simples).

### Versões

| Tag | Data | Resumo |
|---|---|---|
| `v1` | 29/08/2026 | Código original |
| `v2` | 29/09/2026 | Parser via `__NEXT_DATA__`, aba Acompanhamento reescrita, trava no `setupMonitor` |
| `v3` | 29/09/2026 | Data/hora com horas, `status_coleta`, Logs, Dashboard novo, `append_` que cresce a aba |

Detalhes em [CHANGELOG.md](CHANGELOG.md).

---

## Regras para mexer no código

Planilha: `1hgSeSzOpBzxyJji-S2GPG8xECaZlpr0RlBsaCNQrLZE`. Todo o código está em `src/Code.js` (Apps Script V8, sem dependências npm).

- **A ordem das colunas** de `Coletas_Brutas`, `Coletas_Fatiadas`, `Historico` e `Produtos` não pode mudar sem uma função de migração: o código lê e grava por posição (ex.: `r[6]` = `preco_pix` no Historico). Coluna nova vai sempre no fim.
- `Acompanhamento` e `Dashboard` são recriadas a cada coleta, então mudança feita à mão nelas se perde. O lugar de mudar é o código (`atualizarAcompanhamento`, `atualizarDashboard`).
- Toda linha nova passa por `append_()`, que cresce a aba e aplica o formato de data/hora. Os logs passam por `log_()`.
- O status de cada coleta vem de `avaliarColeta_()`. Preço "suspeito" é o que fica abaixo de `LIMITE_PRECO_SUSPEITO` × `preco_maximo` (quase sempre é o valor da parcela).
- Estilo: ES2019 que o Apps Script V8 aceita, `const` e arrow functions, funções privadas terminam com `_`, comentários sem acento. Mensagens e textos da planilha em português.
- Datas no fuso `America/Sao_Paulo`, formato `dd/MM/yyyy HH:mm:ss` (`DATETIME_FORMAT`).
- Antes de `clasp push`, rodar `node --check src/Code.js`. Não existe teste automatizado: o parser se testa com `testarParserKabum()`, que só escreve no log.
- Depois de uma mudança relevante, atualizar o `CHANGELOG.md` e, se o comportamento mudar, este README.

### Mapa do código (`src/Code.js`)

| Área | Funções |
|---|---|
| Coleta | `coletarAgora`, `collectProduct_`, `avaliarColeta_` |
| Cadastro | `CABECALHO_PRODUTOS`, `PRODUCTS`, `sincronizarProdutos`, `sincronizarProdutos_`, `linhaProduto_` |
| Download | `baixarPagina_` (uma vez por endereço por execução), `parsePagina_` (escolhe o parser pela `loja`) |
| Parser AliExpress | `parseAliExpress_`, `extrairItensAliExpress_`, `extrairArrayJson_`, `buscaAliExpressCompleta_`, `urlBuscaAliExpress_`, `ehAliExpress_`, `ALI_COOKIE` |
| Parser Kabum | `parseKabum_`, `extractKabumPrices_` (`__NEXT_DATA__`), `extractLdJsonPrice_`, `stripHtml_`, `findPrices_`, `parsePrice_` |
| Abas calculadas | `atualizarAcompanhamento`, `atualizarDashboard` |
| Histórico/preço | `getLastPrice_`, `getMinPrice_`, `precoValido_`, `getStatusPrice_`, `round2_`, `fmtBRL_` |
| Infra | `append_`, `log_`, `formatSheet_`, `resetSheet_`, `simpleHash_` |
| Gatilhos | `criarGatilhoDiario23h`, `criarGatilhoCada6Horas` (na prática, diário) |
| Manutenção | `testarParserKabum`, `testarParserAliExpress`, `testarProduto_`, `migrarColetasBrutasV2`, `setupMonitor` (bloqueada) |

---

## Cuidados

- **Nunca rode `setupMonitor()`** a não ser que queira zerar tudo. Se acontecer, recupere na planilha em **File → Version history → See version history** e restaure a versão anterior.
- **Bug do editor do Apps Script**: ao trocar a função no seletor e clicar em **Run** logo em seguida, às vezes ele roda a função que estava selecionada **antes**. Depois de trocar, confira no painel **Execution log** qual função rodou (ou execute duas vezes). Foi assim que o `setupMonitor` rodou sem querer em 29/09/2026.
- Cada `coletarAgora()` manual adiciona uma linha por produto ativo em três abas; evite rodar à toa.
- As abas têm 1000 linhas por padrão; `append_` agora cria mais linhas quando precisa.

## Problemas conhecidos / próximos passos

- ~230 linhas antigas do Historico (≈09/09 a 28/09) têm o valor da parcela no lugar do preço PIX. Elas estão marcadas como `ERRO` em Coletas_Brutas e ignoradas no Acompanhamento, mas não foram corrigidas no Historico.
- A coluna `variacao_ultima` do Historico nessas linhas antigas também está errada.
- O scraping depende do JSON `__NEXT_DATA__` da Kabum. Se a Kabum mudar o site de novo, as coletas vão aparecer como `ERRO` (Dashboard e Logs mostram); ajuste `extractKabumPrices_()` e teste com `testarParserKabum()`.
- Existe um "Untitled project" vazio **vinculado** à planilha (criado ao abrir Extensions → Apps Script). Ele não faz nada e pode ser apagado.
- Ideias: alerta por e-mail quando cair abaixo do `preco_alvo`, gráfico de preço por produto, outras lojas.
- **Shopee não dá** (testado em 19/10/2026): a página do produto vem sem nome e sem preço (é montada no navegador) e a API `api/v4/item/get` responde 403. Para algo da Shopee, procuro o mesmo produto na Kabum e uso o preço da Shopee como `preco_alvo` (foi assim com o `PC-001`).
- **Mercado Livre também não dá** (testado em 19/10/2026): a busca redireciona para uma verificação de conta (captcha) e `api.mercadolibre.com` responde 403 sem login. O `CPU-001` (Xeon E5-2650 v4 da Kabum) entrou no lugar do E5-2690 v4 que eu queria acompanhar no ML.
- **AliExpress ainda não testado nos servidores do Google.** Daqui do PC a busca abre e os 4 anúncios `ALI-001` a `ALI-004` deram OK; depois do `clasp push`, rodar `testarParserAliExpress()`. Se der ERRO lá (captcha, moeda), desativar os `ALI-*` na aba Produtos.
