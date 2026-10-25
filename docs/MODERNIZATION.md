# Preservação e atualização

Os nove arquivos recebidos em `estruturas/` são copiados byte a byte para `originals/`. `originals/SHA256SUMS` registra as somas. Os `.py` e `.ipynb` dos ZIPs de código foram extraídos para `legacy/trabalhoN/code/`, mantendo os nomes, as subpastas e os bytes dos arquivos. Apenas caches `.pyc`/`__pycache__` não foram duplicados na extração; continuam presentes no ZIP original do trabalho 1. Relatórios completos permanecem arquivados com todas as figuras e fontes LaTeX.

O código atual está separado em `web/model.mjs` (cálculos puros), `web/viewer.mjs` (3D), `web/app.mjs` (interação) e arquivos de apresentação. É executado no navegador, sem Google Drive, Colab, login, instalação Python pelo visitante ou servidor de cálculo.

| Evidência no legado | Tratamento atual |
| --- | --- |
| `PLOTS.py/decomposicao`: sin/cos recebem α em graus | Conversão explícita para radianos. |
| `PLOTS.py/distribuicao_forcas`: mistura carga por comprimento com área total no arrasto local | Polar global adimensional e distribuição de Schrenk normalizada para ambos os esforços. |
| `PLOTS.py/momento_fletor` e `DEFLEXAO.py`: nomes de eixos trocados | Convenção x/y/z única, momentos e deflexões associados à inércia correta. |
| `PROPRIEDADES_AREA.py`: áreas, dimensões, inércias locais e desenho usam convenções distintas; uma alma usa t₂ no lugar de t₃ em Izz | Seção de parede fina nas linhas médias, com integração consistente por segmento. |
| `TORCAO.py/dist_ang`: resolve T=1 e interpola os fluxos até zero | Multiplica a solução unitária por T(x) real; verifica equilíbrio e igual θ′ nas três células. |
| `PLOTS.py/momento_arfagem_torsor`: divide o momento da asa inteira por b/2 | Distribui o momento total por b; a semiasa recebe metade. |
| G1/G2 fixos nos notebooks, incompatíveis exatamente com E e ν | G=E/[2(1+ν)] em cada material. |
| `FLAMBAGEM.py` e notebook: mode m=1 fixo, arredondamentos e posições manuais por condição | Seleção do modo mínimo, teto para quantidades inteiras, posições calculadas e envelope P1–P5 opcional. |
| Resultados históricos contêm dimensões/espessuras conflitantes e inércias com unidade kg·m² | Mantidos como registro histórico; cenário atual explicitamente editável e unidades m⁴. |

As saídas antigas não são usadas como valores de referência para aprovar fórmulas corrigidas. Há testes analíticos independentes das tabelas históricas. As limitações físicas e o alcance da modernização estão em [MODEL.md](MODEL.md).

## Executar o legado

Cada pasta de código corresponde a uma entrega independente e contém módulos com os mesmos nomes; não misture os caminhos das três versões. O ponto de entrada é o notebook `main.ipynb`, originalmente para Colab. Ele monta o Google Drive e pede dados interativamente. Para execução local é necessário ajustar essas células em uma **cópia**, instalar NumPy, Matplotlib, SymPy, SciPy e Jupyter. O legado usa `scipy.integrate.cumtrapz`, removido em versões novas do SciPy; use um ambiente compatível com a época ou adapte a cópia para `cumulative_trapezoid`. As fontes arquivadas permanecem intactas.
