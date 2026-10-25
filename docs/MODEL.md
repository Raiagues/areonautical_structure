# Modelo e unidades

## Origem e geometria

Os três PDFs em `originals/` especificam uma asa retangular de 12 m × 2 m, massa de 5500 kg, peles de Al 7075-T6 e quatro almas de Ti-6Al-4V. As duas almas internas separam três células de largura c/3. As condições P1–P5 e os valores E, ν e σe vêm desses enunciados. CD₀=0,017, k=0,021, Cm=−0,078 e ρ=1,225 kg/m³ vêm dos códigos dos trabalhos 2/4.

O eixo x segue a semienvergadura, y a corda e z a altura. A raiz x=0 é engastada e a ponta x=b/2 é livre. Coordenadas da seção usadas nas tensões são relativas ao centroide. A tela informa também o centroide desde o canto inferior esquerdo.

**Convenção atual:** c e h são dimensões nas linhas médias. Áreas e inércias são calculadas por integração de segmentos de parede fina, sem termos de ordem t³ ou sobreposição de cantos. Não se desenha um perfil NACA fictício: o objeto é a caixa estrutural retangular do enunciado. A corda aerodinâmica e a largura da caixa compartilham c, como no trabalho simplificado.

O cenário inicial usa h=0,5 m, t₁=4 mm, t₂=4 mm, t₃=3 mm. São valores editáveis da versão atual, não uma alegação de reprodução dos resultados legados. Os relatórios divergem entre a introdução (t=0,1 m) e trechos posteriores (t₁=1,6 mm); não se impôs uma dessas versões como verdade única. Valores incompatíveis com paredes finas são rejeitados.

## Carregamentos e flexão

Todos os cálculos e arquivos CSV usam SI. Na interface E aparece em GPa, espessuras em mm e tensões em MPa.

L = n m g, g=9,80665 m/s². Q=ρV²/2, S=bc, CL=L/(QS), CD=CD₀+k CL², D=QS CD.

A distribuição de Schrenk por unidade de comprimento é a média das distribuições retangular e elíptica:

```text
f(x) = [1/2 + (2/π) sqrt(1 − (2x/b)²)] / b
ℓ(x) = L f(x), d(x) = D f(x)
```

A quadratura em 241 estações renormaliza f para que 2∫f dx=1 exatamente na malha. Sustentação e arrasto seguem a mesma forma, conforme a aproximação solicitada. O arrasto local não é recalculado usando área total dentro de uma fórmula por unidade de comprimento.

O ângulo α é convertido de graus para radianos. `wy = ℓ sin α − d cos α`, `wz = ℓ cos α + d sin α`. São omitidos peso distribuído da estrutura, combustível, motores, aeroelasticidade e forças fora do centro de torção.

```text
Vy(x) = ∫x^L wy(s) ds        Vz(x) = ∫x^L wz(s) ds
My(x) = ∫x^L Vz(s) ds       Mz(x) = −∫x^L Vy(s) ds
v'' = −Mz / (Eref Izz*)     w'' = My / (Eref Iyy*)
σ(y,z) = (E/Eref) [−My z/Iyy* + Mz y/Izz*]
```

Eref=E das peles. A*=Σ(Ei/Eref)ti li. Iyy*=∫(E/Eref)z²t ds, Izz*=∫(E/Eref)y²t ds. A dupla simetria resulta em Iyz*=0 e centroide=(c/2,h/2). Os quatro valores de E/ν/espessura permanecem simétricos; não há suporte a almas assimétricas. O eixo neutro é σ=0. v(0)=w(0)=v′(0)=w′(0)=0. Integração trapezoidal da ponta para a raiz para esforços e da raiz para a ponta para rotações/deflexões.

O indicador de escoamento usa max sqrt(σ²+3τ²)/σe em cada parede, sem fator de segurança. τ é apenas o cisalhamento de torção. Cisalhamento de esforço cortante e outras interações não são incluídos; o indicador não constitui verificação global.

## Torção multicelular

Gi=Ei/[2(1+νi)]. O momento de arfagem por unidade de semienvergadura é m′=Q c² Cm. O torque interno T(x)=m′(b/2−x) corresponde à metade da asa: o momento total não é duplicado na raiz.

Para cada célula Ai=ch/3, resolve-se `C q = 2 A θ′`, impondo `T=2ΣAi qi`. As diagonais de C somam `comprimento/(G t)` das paredes da célula; paredes compartilhadas geram termos negativos fora da diagonal. Fluxo em parede interna é a diferença entre os fluxos das células vizinhas. `τ=qparede/t`, `θ′=T/GJ`, `θ(0)=0`. A solução por torque unitário é multiplicada pelo torque real em cada estação.

O centro de torção coincide com o centroide pela dupla simetria geométrica e de materiais. Trata-se de Saint-Venant, sem restrição de empenamento. Não se acrescenta torque devido a excentricidade de sustentação/arrasto; o enunciado especifica a extensão pela arfagem.

## Flambagem: estimativa de reforços

Usa-se a maior compressão entre os extremos de cada painel na raiz. Quando ativo, o envelope considera P1–P5 **e a condição atual**, com a geometria e materiais atuais. A interface identifica essa abrangência. O campo 3D de utilização é um valor de dimensionamento por painel, constante ao longo dele; não representa um modo próprio nem a tensão local em x.

Para placa simplesmente apoiada nas quatro bordas:

```text
σcr = k π² E / [12(1−ν²)] (t/s)²
k = min sobre m inteiro positivo de [m s/a + a/(m s)]²
```

`a` é a distância entre nervuras, `s` a largura entre reforçadores. A seleção de m testa os inteiros em torno de a/s. O limite inferior k=4 dá um espaçamento conservador inicial: `smax=t sqrt(4π²E/[12(1−ν²)FS σcompressão])`. O número de subdivisões é arredondado para cima; reforçadores internos por painel = subdivisões−1. Os apoios existentes nas extremidades não são contados como reforçadores novos.

O reforçador idealizado tem raio de giração r (entrada, 5 mm inicialmente), material igual ao painel, articulações ideais K=1 e Euler `σEuler=π²E(r/a)²`. O menor `amax=πr sqrt(E/[FS σcompressão])` dos painéis que precisam de reforço determina as nervuras. Nervuras internas = ceil(L/amax)−1, distribuídas uniformemente. Raiz e ponta são apoios existentes e não entram nessa contagem. A geometria real do perfil do reforçador, sua área, fixações e massa não são dimensionadas pelo site.

O limite usado no indicador é `min(σcr, σEuler quando aplicável, σe)` e a demanda é FS vezes a compressão. Assim, uma falha de escoamento continua visível mesmo com mais reforçadores. O campo “sem reforços” usa o painel original ao longo de toda a semienvergadura e o limite de escoamento. O padrão FS=2,5 acompanha o trabalho 4.

Não há flambagem por cisalhamento, interação compressão–cisalhamento, flexo-torção, pós-flambagem, imperfeições, plasticidade ou redistribuição das tensões pelos novos reforços. A rigidez da caixa base é mantida. As linhas 3D indicam posições ideais, sem representar uma seção fabricável. Quantidades muito grandes são preservadas nos números, mas amostradas no desenho.

## Referências e verificação

- Enunciados e fontes Python fornecidos: [`originals/`](../originals/), [`legacy/`](../legacy/).
- [NASA — Buckling of a simply-supported rectangular plate under uniform compression](https://ntrs.nasa.gov/api/citations/19780025848/downloads/19780025848.pdf), referência de estabilidade de placas.
- [Three.js — OrbitControls](https://threejs.org/docs/pages/OrbitControls.html) e [BufferGeometry](https://threejs.org/docs/pages/BufferGeometry.html), usados na visualização; os cálculos não dependem do WebGL.

`tests/model.test.mjs` verifica conservação de cargas, momento de raiz por centroide analítico de Schrenk, conversão angular, condições na ponta/raiz, convergência, reversão de cargas, solução fechada de três células quadradas, equilíbrio e compatibilidade torsional, escala V², modos de placa, quantidade inteira de apoios, envelope e validação de entradas. Os testes de navegador verificam WebGL, controles, cortes, modos, recalculo, exportação, importação e layout móvel.
