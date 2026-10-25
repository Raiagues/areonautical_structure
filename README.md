# Estruturas aeronáuticas

Trabalhos **1 — Flexão**, **2 — Torção** e **4 — Flambagem**, da disciplina UFSM00224. O material original foi preservado e ganhou um laboratório interativo com caixa alar 3D, gradientes de tensão, deformada, cortes, comparação P1–P5 e exportação de resultados.

**[Abrir o laboratório](https://raiagues.github.io/areonautical_structure/)**

| Pasta | Conteúdo |
| --- | --- |
| [`originals/`](originals/) | Os seis ZIPs e os três enunciados PDF, sem alteração de bytes. |
| [`legacy/trabalho1/code/`](legacy/trabalho1/code/) | Python e notebook originais de flexão. |
| [`legacy/trabalho2/code/`](legacy/trabalho2/code/) | Python e notebook originais de torção. |
| [`legacy/trabalho4/code/`](legacy/trabalho4/code/) | Python e notebook originais de flambagem. |
| [`web/`](web/) | Aplicação atual, sem servidor de cálculo nem dependências de CDN. |
| [`docs/MODEL.md`](docs/MODEL.md) | Equações, unidades, hipóteses e limites do modelo. |
| [`docs/MODERNIZATION.md`](docs/MODERNIZATION.md) | Correções em relação ao legado e rastreabilidade. |

Os relatórios completos, incluindo LaTeX e figuras, estão nos ZIPs `originals/relatorio_trabalho*.zip`. Para abri-los em pastas locais, execute `python3 scripts/extract_reports.py`. Não é necessário recompilar os relatórios para usar o site.

## Executar localmente

Com Python 3 instalado:

```sh
python3 -m http.server 4173 --directory web
```

Abra `http://localhost:4173`. O site precisa de HTTP para carregar módulos JavaScript. Nenhuma instalação é necessária para os cálculos ou o 3D; Three.js r170 está incluído com sua licença em `web/vendor/`.

Para validar, use Node.js 20 ou superior e Python 3:

```sh
node tests/model.test.mjs
python3 scripts/verify_originals.py
```

Para os testes reais de navegador:

```sh
npm install
npx playwright install chromium
npm run test:browser
```

O workflow [Pages](.github/workflows/pages.yml) verifica os originais, testa a matemática e a interface em desktop/celular e publica apenas `web/`. Os ZIPs não são carregados pela página.

## Usar

Selecione a análise e uma condição P1–P5; ajuste dimensões, espessuras ou materiais. Arraste o 3D para girar, use a roda/pinça para ampliar, abra a caixa e escolha uma seção. A escala da deformada não altera os números. Na aba Flambagem, alterne a visualização com/sem reforços. CSV exporta séries em SI; JSON inclui parâmetros e resultados e pode ser reaberto no site.

Esta versão utiliza um modelo educacional de viga e paredes finas. Não é FEA nem uma verificação completa de aeronavegabilidade. As correções matemáticas fazem os números diferirem dos relatórios históricos. O modelo de flambagem é uma estimativa sob compressão, com apoios simples e reforçadores idealizados por raio de giração; detalhes em [MODEL.md](docs/MODEL.md).

Autoria e identificação acadêmica dos originais foram mantidas nos arquivos. A presença do material neste repositório não concede automaticamente uma licença para reutilização; a licença MIT incluída em `web/vendor/` se aplica ao Three.js.
