# Changelog

## Próxima versão – 19/10/2026 (ainda falta o `clasp push`)

- Cadastro pelo código: produto novo vai no fim de `PRODUCTS` e entra sozinho na aba Produtos no começo de `coletarAgora()` (ou rodando `sincronizarProdutos()`). Compara por `id` e `url` e só acrescenta: produtos que já estão na aba não são alterados. Se a sincronização falhar, fica um `ERRO` em Logs e a coleta segue.
- `PRODUCTS` ganhou a coluna opcional `observacoes`.
- Novo produto `PC-001`: PC Gamer Ludic (Ryzen 5 5500, RX 7600 8GB, 16GB, SSD 512GB NVMe, 600W) da Kabum, R$ 5.099,00 no PIX em 19/10. `preco_alvo` = R$ 4.715,83, o preço no PIX com cupom de um PC parecido na Shopee (Spectrum, SSD 480GB, 500W), que o monitor não consegue ler.
- Novo produto `CPU-001`: Xeon E5-2650 v4 (12 núcleos, 2,2 GHz) da Kabum, R$ 594,99 no PIX em 19/10. Entrou no lugar do E5-2690 v4 (14 núcleos, 2,6 GHz), que a Kabum não vende; no Mercado Livre a busca manda robôs para uma verificação de conta e a API responde 403.
- Leitor do AliExpress (`parseAliExpress_()`): o preço sai da busca (`selector_preco_pix` = `busca:<termo>`), porque a página do anúncio vem sem preço. Cookie de Brasil/BRL, uma busca por termo em cada coleta, e só vale a versão da busca com `originalPrice` (a busca tem um teste A/B com preços diferentes; até 3 tentativas). Moeda diferente de BRL, anúncio fora da 1ª página ou captcha viram `ERRO` com o motivo.
- `collectProduct_()` e `testarParserKabum()` escolhem o parser pela `loja` (`baixarPagina_`/`parsePagina_`). Nova `testarParserAliExpress()`.
- `avaliarColeta_()` usa o motivo que o parser der (`parsed.erro`), quando houver.
- Novos produtos `ALI-001` a `ALI-004`: os 4 anúncios do Xeon E5-2690 v4 avulso (sem kit) que mais venderam na busca de 19/10 (2.000+, 1.000+, 900+ e 700+ vendidos, todos nota 4.9), de R$ 69,99 a R$ 117,28.
- Novo produto `MON-001` (02/11): monitor Acer Nitro KG270 P0bi (27", VA, 144 Hz) da Kabum, R$ 619,99 no Esquenta 11.11 (até 13/11) e R$ 999,99 fora da oferta. `preco_alvo` = R$ 559, o menor preço de outubro no Pelando.

## v3 – 29/09/2026

- `data_hora` com hora (`dd/MM/yyyy HH:mm:ss`) em Coletas_Brutas, Coletas_Fatiadas, Historico e Logs.
- Coletas_Brutas: nova coluna `status_coleta` (OK/ERRO) e motivo na coluna `erro`. As 480 coletas antigas foram avaliadas retroativamente por `migrarColetasBrutasV2()`: 247 OK, 233 ERRO (quase todas com o valor da parcela no lugar do PIX).
- `avaliarColeta_()`: HTTP ≠ 200, preço não encontrado ou preço suspeito (< 50% do `preco_maximo`) viram ERRO. O Historico grava `status_preco = ERRO` nesses casos, e não mais `OK`/`COMPRAR` com preço errado.
- Exceções numa coleta também geram linha em Coletas_Brutas (status ERRO).
- Logs: `INFO` no início e no fim de cada coleta (com contagem OK/ERRO e duração) e `AVISO` por produto com erro.
- Dashboard reescrito (`atualizarDashboard()`): situação do gatilho, última coleta, OK/ERRO da última execução e dos últimos 7 dias, produtos que subiram/caíram, COMPRAR, CARO e sem preço. Saíram "Melhor preco monitorado" (misturava produtos e pegava o valor da parcela) e as fórmulas antigas.
- `Produtos.ultima_coleta` passa a ser preenchida.
- `append_()` cria linhas quando a aba chega ao limite (antes quebraria ao passar da linha 1000, por volta de novembro/2026).
- Config atualizada com a frequência real (diária ~23h) e o parser novo.

## v2 – 29/09/2026

- Parser da Kabum lê o preço do JSON `__NEXT_DATA__` (`prices.priceWithDiscount`), depois JSON-LD e depois `<h4>`. Saiu o fallback "segundo R$ da página", que desde ~09/09 gravava o valor da parcela.
- `preco_de` passa a ser o preço normal (`prices.price`) e `desconto_pix` o percentual informado pela Kabum.
- Aba Acompanhamento reescrita em JS (a fórmula QUERY dava `#VALUE!`): preço atual × anterior, variação R$/%, tendência ▲/▼/→, última mudança, mínimo, máximo, média das 7 últimas, cores, e descarte de preços suspeitos.
- `getLastPrice_`/`getMinPrice_` ignoram preços suspeitos; variação não é calculada quando a coleta falha.
- Trava `CONFIRMAR_RESET_TOTAL` no `setupMonitor()` depois de uma execução acidental (dados restaurados pelo histórico de versões da planilha).
- Nova função `testarParserKabum()` (só loga).

## v1 – 29/08/2026

- Versão inicial: 15 produtos (GPUs e kits) da Kabum, coleta diária às 23h, abas Config, Produtos, Coletas_Brutas, Coletas_Fatiadas, Historico, Acompanhamento, Dashboard e Logs.
