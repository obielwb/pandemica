## Resumo

Testemunhamos um impacto global sem precedentes desde o início da pandemia de COVID-19 no final de 2019, resultando em milhões de mortes e crises econômicas, políticas e sociais sendo deflagradas em todo o mundo desde então. Diversas medidas de prevenção e contenção da propagação do vírus foram adotadas, como distanciamento social, quarentenas, *lockdowns* e vacinação. À medida que novas doenças potencialmente pandêmicas continuam a surgir, como a recente varíola dos macacos, torna-se cada vez mais importante o desenvolvimento de métodos eficazes para prever potenciais disseminações globais, evitando e mitigando impactos humanos, econômicos e sociais oriundos de surtos epidemiológicos. Neste contexto, surge a possibilidade da implementação de um modelo de simulação utilizando autômatos celulares (ACs), conceito computacional que apresenta uma abordagem promissora para a modelagem da dinâmica epidêmica de forma virtual. Os ACs permitem simular grandes populações de indivíduos virtualmente vivos. Portanto, este estudo tem como objetivo propor um modelo para a simulação da disseminação de patologias potencialmente pandêmicas de forma eficaz, utilizando dados obtidos durante a pandemia de COVID-19 e características virais da doença, que servem como base do treinamento e validação do modelo. O modelo proposto é capaz de gerar relatórios epidemiológicos confiáveis de diferentes cenários hipotéticos e fornecer informações valiosas às autoridades de saúde pública referentes a quando e quais medidas devem ser tomadas para o combate à doença, considerando características geográficas, demográficas e variáveis como o uso de máscaras, vacinação e distanciamento social, incorporando conceitos matemáticos pertinentes, aspectos biológicos e tecnologias adequadas de forma a maximizar sua precisão e obter-se um modelo genérico de simulações pandêmicas.

**Palavras-Chave:** Pandemia, COVID-19, Simulação.

## Introdução

O mundo vem sofrendo com as consequências da pandemia de COVID-19 desde o final de 2019, quando o vírus começou a ser disseminado a partir da cidade de Wuhan, província de Hubei, na República Popular da China. A Organização Mundial da Saúde (OMS), estima que o número total de mortes associadas direta e indiretamente à pandemia de COVID-19 (descrito como “excesso de mortalidade”) entre 1 de janeiro de 2020 e 31 de dezembro de 2021 foi de aproximadamente 14,9 milhões (intervalo entre 13,3 milhões e 16,6 milhões).

A nível global, diversas medidas de prevenção e contenção foram implementadas, como as medidas de isolamento social, quarentena, *lockdown* e posterior vacinação (ARBEL; PLISKIN, 2022), mitigando significativamente a disseminação do vírus. Com a emergência de novas patologias potencialmente pandêmicas (JONES et al., 2008), como a recente varíola dos macacos (SOHAL et al., 2023), por exemplo, surge a oportunidade de utilizar tecnologia para implementação de modelos de simulação acurados (COSTA; PEIXOTO, 2020) para a descoberta de medidas preventivas e remediativas a fim de atenuar o impacto humano, econômico e social causado pelas pandemias (FU et al., 2021).

Países como a Coreia do Sul, por exemplo, integraram a tecnologia digital nos processos de contenção e mitigação coordenados pelo governo - incluindo vigilância, testes, rastreio de contaminações e quarentena rigorosa - que podem estar associadas ao achatamento precoce da curva de incidência de casos do COVID-19 no país (FERRETTI et al., 2020). É cada vez mais evidente o importante papel da implementação de tecnologias relacionadas à saúde pública e o notável descobrimento de estratégias e respostas a pandemias de forma inovadora (WHITELAW et al., 2020).

Este projeto tem como objetivo propor um modelo de simulação embasando-se na teoria de autômatos celulares (ACs) combinada com matemática probabilística como meio para simular populações cujos indivíduos interagem entre si virtualmente, levando em consideração o aspecto de disseminação da doença. Para criar e validar esse modelo, propõe-se a utilização dos dados obtidos durante a pandemia do COVID-19 e das características virais da doença.

No modelo proposto, defendemos que é possível não somente simular o cenário pandêmico, prevendo número de casos e mortes, como também estudar diferentes parâmetros de contenção e mitigação, como diferentes usos de máscara, distanciamento social e vacinação, por exemplo. Dessa forma, é possível determinar como cada variável influencia o cenário pandêmico de forma geral, possibilitando que entidades competentes consigam saber como cada medida contribui para combate à doença emergente, e que a população compreenda de maneira mais clara como seus atos afetam a pandemia como um todo, de forma a melhor ponderá-los.

## Problema de Pesquisa

Como propor um modelo de simulação pandêmica que seja confiável, incorporando características do vírus e sua disseminação dentre uma população, e que seja capaz de gerar diferentes cenários hipotéticos de acordo com mudanças nas variáveis de mitigação e combate do vírus?

## Hipótese

A utilização de autômatos celulares tem grande potencial para simular grandes populações de indivíduos virtualmente vivos (WHITE, 2007), que possuem algum tipo de inteligência e, portanto, a modelagem de uma epidemia virtual é tecnicamente possível. Se adotadas as relacionadas e pertinentes relações matemáticas (WILLOX, 2003), características biológicas e boletins epidemiológicos, em conjunto com tecnologias adequadas, espera-se estabelecer um modelo de simulação eficaz, acurado e capacitado para gerar relatórios pandêmicos fidedignos aos números de casos e mortes nos diferentes cenários simulados, quando comparados com o cenário real.

## Justificativa

A pandemia de COVID-19 tem causado um impacto significativo na saúde pública e na economia global desde de seu início, em 2019 (FU, 2021). Até o começo de 2023, a pandemia causou um prejuízo global estimado em U$D29.4 trilhões (VISCUSI, 2023), além dos impactos na saúde física e mental da população, e o aumento da geração de resíduos (orgânicos e inorgânicos), que possuem impactos diretos e indiretos no meio ambiente, como a poluição do ar, da água e do solo (ISLAM et al., 2016). Eventos como esses resultam em impactos significativamente negativos para a sociedade e seu meio. Nesse sentido, mostra-se extremamente necessário que medidas sejam tomadas para prevenir e conter a próxima grande pandemia.

No entanto, por mais que haja uma vasta literatura na modelagem matemática do COVID-19, são escassos os estudos e modelos que investigam a simulação da disseminação de surtos epidemiológicos em nível local, considerando diversos fatores como características populacionais e físicas de uma dada cidade, conjugadas com dados gerais da doença, como características virais e comportamentais. Dessa forma, pode-se conter e mitigar em escalas estaduais, nacionais e internacionais o impacto de potenciais pandemias ao adereçar a disseminação e desenvolvimento de uma patologia a nível municipal. Nesse sentido, este estudo propõe o uso de conceitos de computação teórica e matemática, além de algoritmos e estruturas de dados, compondo um paradigma de simulação pandêmica simples porém robusto.

Essa pesquisa é relevante pois poderá fornecer informações importantes para a tomada de decisões dos gestores públicos em relação ao combate a doenças emergentes. Além disso, pode contribuir para o desenvolvimento global de estratégias mais eficazes de controle de pandemias, considerando as particularidades virais, mas, principalmente, regionais.

Por fim, a realização dessa pesquisa também é pertinente uma vez que amplia o conhecimento sobre a aplicação dos autômatos celulares na área de epidemiologia e fortalece a colaboração entre a instituição e outras organizações que trabalham com a temática pandêmica.

## Escopo

A modelagem do comportamento humano é um sistema extremamente complexo devido à diversidade e à variabilidade inerentes às suas ações e decisões. Os seres humanos respondem a estímulos de maneiras que são influenciadas por uma ampla gama de fatores, incluindo experiências passadas, contexto social, emoções e estados de saúde. Além disso, o comportamento humano é adaptativo, o que significa que as pessoas podem aprender e mudar seu comportamento ao longo do tempo. Modelar este sistema em sua totalidade é uma tarefa computacionalmente e matematicamente desafiadora.

Assim, decidimos por abstrair e simplificar diversos fatores que envolvem essa simulação, como o comportamento dos indivíduos, que, ao invés de ser aleatório, será uma constante definida por um número fixo de limitadas atividades. Quanto à simulação da cidade, por também ser um sistema complexo, sua abstração também foi necessária. Portanto, não lidamos com um cenário 100% fiel ao real, tampouco com todas as diferentes atividades e lugares que podem existir. De qualquer forma, uma vasta gama de atividades foram criadas de forma a contemplar, em termos gerais, todas as principais ações que são feitas em um meio urbano no século XXI.

Para o desenvolvimento do projeto, escolhemos utilizar os dados do COVID-19 por ser o exemplo mais recente de uma patologia pandêmica, havendo grande disponibilidade de dados, facilitando, assim, testes e validação do modelo.

Para a cidade, foi escolhida Campinas, por ser a cidade em que nossa instituição de ensino está localizada, além de ser um importante polo industrial e populacional de São Paulo. Vale ressaltar que, havendo registros no Censo, qualquer cidade pode ser utilizada na simulação, uma vez que a entrada de dados se presta de forma genérica.

## Objetivos

**Objetivo geral**

Criar um modelo de simulação pandêmica eficaz que seja capaz de minimizar o impacto de possíveis futuras pandemias ao criar diferentes cenários que atuam como conscientizadores para entidades competentes e para a população agir de forma preventiva em meio a uma potencial pandemia.

**Objetivos específicos**

Os objetivos específicos desta pesquisa são:

- Compreender o embasamento técnico e teórico da epidemiologia;
- Analisar a base teórica e literatura das características virais do COVID-19;
- Coletar dados geográficos e demográficos de Campinas, transpondo-os virtualmente;
- Estudar e desenvolver algoritmos embasados no comportamento de autômatos celulares adequados para a simulação de indivíduos em meio pandêmico virtualizado;
- Elaborar a implementação prática das bases teóricas da disseminação em um modelo computacional a partir de metodologias e técnicas sistêmicas, incorporando dados epidemiológicos;
- Testar e avaliar a efetividade do sistema, embasando-se em dados reais coletados de boletins epidemiológicos, bancos de dados e relatórios disponibilizados pelo governo;
- Estabelecer um modelo de simulação pandêmica genérico, capaz de simular
- desenrolar de uma pandemia em qualquer cidade com dados no Censo e com patologia, principalmente, respiratória.

## Fundamentação Teórica

Visando promover uma melhor abordagem para a simulação de pandemias e, consequentemente, maior acurácia para a simulação, o sistema a ser desenvolvido utilizará a união de diversos algoritmos, conceitos de ciência da computação teórica e modelagem matemática da disseminação de doenças para alcançar tal objetivo. Portanto, torna-se crucial compreender, principalmente, os estudos de análise da disseminação do vírus, as características do vírus que será simulado (COVID-19), o campo de teoria dos autômatos celulares em conjunto com abordagens epidemiológicas existentes e seu embasamento matemático.

**Autômatos celulares**

Os autômatos celulares (ACs) bidimensionais são sistemas dinâmicos discretos constituídos por células uniformemente distribuídas, que definem um número finito de linhas ×  colunas objectos idênticos. Cada célula tem um estado próprio que muda a cada geração de células de acordo com um conjunto de regras de transição local (de um conjunto limitado de estados ). Isto significa que a vizinhança, ou o estado de um grupo de células, no tempo  − 1, determina o estado de uma dada célula no tempo . Mais especificamente, o conjunto de quatro elementos ( ,  ,  ,  ), no qual é o espaço celular, define um AC:

- {( ,  ), 1 ⩽  ⩽  , 1 ⩽  ⩽  }

define o conjunto total e finito com todos os estados possíveis para uma célula.  = {(α  , β  ), 1 ⩽  ⩽  } ⊂  ×  , é o conjunto total de índices que definem a vizinhança de cada célula, de tal forma que a vizinhança da célula ( ,  ) é dada por:

- {( + 𝛼1, + 𝛽1), …, (  + , + )}

Além disso,  =   − {(0, 0)}. Por fim, a função f é a função de transição local

\*

(WHITE, 2007):

- ( − 1𝑖 + 𝛼1,  + 𝛽1, …,  − 1𝑖 + ,  + ) ∈

Em que representa o estado da célula ( ,  ) no tempo .

Como mencionado, as células são representadas como zonas quadrangulares idênticas que constituem o espaço celular (Figura 1(a)). As duas variedades mais significativas de vizinhança são a vizinhança de von Neumann ( Figura 1(b)), formada pela célula individual e as quatro células situadas a norte, sul, leste e oeste, e a Vizinhança de Moore (Figura 1(c)), formada pela célula individual e as suas oito células mais próximas.

Figura 1 - (a) Espaço celular retangular (b) Vizinhança de von Neumann (c) Vizinhança de Moore

![](/paper/figure-1.png)

Fonte: Autoria própria (2023)

O conjunto de índices para as vizinhanças de von Neumann é o seguinte:

- {(0, 0), (− 1, 0), (0, 1), (1, 0), (0,  − 1)}

Enquanto que, para as vizinhanças de Moore, V é definido da seguinte forma:

- {(0, 0), (− 1, 0), (− 1, 1), (0, 1), (1, 1), (1, 0), (1,  − 1), (0,  − 1), (− 1,  − 1)}

Como já mencionado, um AC evolui deterministicamente em etapas de tempo discretas, alterando os estados das células por meio da função de transição local . Como o espaço celular é considerado finito, as condições de limite devem ser consideradas para garantir uma dinâmica bem definida do AC. Essas condições de contorno dependem do processo a ser simulado.

**Sistemas multiagentes**

Sistemas multiagentes são sistemas compostos por agentes (inteligentes) que estão situados em um ambiente e são capazes de interagir para resolver problemas complexos (WOOLDRIDGE, 2009). Um agente pode ser visto como um sistema de computador capaz de responder a estímulos de entrada (chamadas percepções), e por meio de um processo de raciocínio e planejamento, gerar uma saída no formato de ações no ambiente (WOOLDRIDGE, 2009). O paradigma de sistemas multiagentes fornece os benefícios de: (i) possibilitar resolver problemas complexos de forma distribuída, sem ponto central de processamento e falha, onde recursos e capacidades são distribuídos pela rede de agentes interconectados; (ii) permitir a modelagem de sistemas através da concepção de agentes autônomos inteligentes, capazes de se comunicar, como principal componente; e (iii) dentro do contexto deste trabalho, permitir a simulação de comportamentos de entidades complexas, como seres humanos.

**Modelagem matemática na disseminação de doenças**

Embora tenha sido nas "Epidemias" de Hipócrates que a busca pela compreensão da dinâmica da disseminação das epidemias começou, Bernoulli é considerado o pioneiro no domínio da modelagem matemática na área da epidemiologia. Em seu trabalho de 1760, o mesmo demonstrou a eficácia da técnica de variolização, que consistia na inoculação de varíola benigna a fim de evitar complicações da doença (BERNOULLI, 1760). No entanto, foi em 1927 que Kermack e McKendrick propuseram o que pode ser visto como o ponto de partida para o projeto dos modelos matemáticos atuais (KERMACK; MCKENDRICK, 1927);

- modelo SIR. É possível levar em conta diferentes tipos de modelos matemáticos, a depender da divisão da população a ser modelada. O referido modelo SIR segmenta os indivíduos como (ALMEIDA, 2014):
- Suscetíveis: Indivíduos que ainda não desenvolveram imunidade contra a infecção, o que significa que podem se tornar infectadas se expostas a ela.
- Infectados: Indivíduos que contraíram a doença e têm a capacidade de transmiti-la para pessoas suscetíveis.
- Recuperados: Indivíduos que se recuperaram da infecção e adquiriram imunidade, portanto não contribuem para a propagação da doença.

Muitas infecções têm um intervalo de tempo no qual um indivíduo foi infectado, mas ainda não apresenta sintomas ou apresenta quadro assintomático; nesse momento, cujo processo epidemiológico é denominado incubação (ALENE, 2021), o indivíduo é considerado exposto. Neste caso, o modelo SEIR apresenta uma nova classe de indivíduos, caracterizando a letra “E”, de exposto, na sigla.

Algumas infecções, como as infecções causadas pelos coronavírus

responsáveis pelo resfriado comum, não conferem imunidade duradoura, ausentes de uma fase definida de recuperação (EDRIDGE, 2020). Portanto, após uma infecção, os indivíduos tornam-se novamente suscetíveis. Nesse caso, configuram-se os modelos SIS. A partir dos modelos expostos, existem outras derivações, como SIRS ou SEIRS.

De acordo com as características do COVID-19, o modelo SEIR se encontra como o mais apropriado para ser incorporado na simulação.

Figura 2 - Representação visual do modelo SEIR

![](/paper/figure-2.jpeg)

Fonte: Autoria Própria (2023)

Além disso, o modelo SEIR pode ser implementado de forma analítica por meio das equações diferenciais apresentadas nas equações (1), (2), (3) e (4). Em todas as equações apresentadas, 𝑡se refere ao tempo em dias.

E: Humanos expostos (latentes)

ε: Taxa per capita de progressão para estado infeccioso

/  = Λ  −  β    − µ γ  − µ . (1) /  =  β    − ε (2)

/  = ε  − γ  − µ (3)

/  = γ  − µ (4)

Com

- +   +   +

Figura 3 - Dinâmica epidemiológica do modelo SEIR

![](/paper/figure-3.jpeg)

Fonte: Autoria Própria (2023)

**Conceitos epidemiológicos pertinentes**

Os vírus estão "no precipício da vida e da morte" (ANDREWES, 1967). No microscópio, um vírus parece um cristal geométrico morto. Mas, quando faz de uma célula de um ser vivo seu hospedeiro, pode replicar-se rapidamente.

Um vírus é constituído por, basicamente, duas partes: material genético e cápsula proteica. De forma simplificada, depois de se infiltrar em uma célula, o vírus reescreve o DNA da célula e transforma-a para que produza centenas ou mesmo milhares de cópias de si próprio. Quando estas cópias do vírus deixam a célula afetada, ficam novamente sem vida até entrarem em outra célula e o ciclo é reiniciado. Os danos celulares causados pelo processo de reescrita genética causam a doença. A Figura 2 representa o processo infeccioso de doenças virais.

Figura 4 - A relação entre infecciosidade e sintomas do vírus

![](/paper/figure-4.jpeg)

Fonte: Rhodes (1996)

Os rótulos acima da linha na Figura 2 descrevem a infecciosidade do hospedeiro, enquanto os rótulos abaixo da linha descrevem a dinâmica da doença. Observe que o período infeccioso pode começar antes ou após o início dos sintomas.

O objetivo de um vírus entrar em uma célula viva é se multiplicar; no entanto, quando o hospedeiro desenvolve anticorpos para combater a infecção, o vírus precisa encontrar outro hospedeiro. Como resultado de ser infectado, uma pessoa geralmente se torna infecciosa, isto é, capaz de infectar outras pessoas e manifestar sintomas de forma a ficar doente. Um hospedeiro infectado apresenta sintomas, que geralmente são métodos para ajudar o vírus a se propagar para novos hospedeiros, como tosse, por exemplo. Entretanto, a doença não pode ser muito debilitante porque o contágio cessa se o hospedeiro morrer. A Figura 2 mostra a ligação entre cada uma das fases da infecção, com cada fase detalhada abaixo.

Período latente: Este é o intervalo de tempo durante uma infecção no qual o vírus ainda não desenvolveu o potencial de transmissão para um novo hospedeiro.

Período infeccioso: Durante esta fase, o vírus é contagioso e pode ser transmitido a outras pessoas usando mecanismos orgânicos de propagação.

Recuperados ou removidos: Se tratando de vírus, um hospedeiro que desenvolveu imunidade natural ou morreu não é mais capaz de contribuir para o processo de reprodução. O vírus, portanto, não pode se reproduzir em ambos os cenários.

Período de incubação: No início de uma infecção, pode não haver indícios de infecção; esse é conhecido como o período de incubação. Os vírus se reproduzem mais durante a junção desta fase e o período infeccioso (RHODES, 1996). Isso se deve ao fato de que os hospedeiros desconhecem o fato de estarem infectados, mantendo interação normal com outros potenciais hospedeiros, até então saudáveis.

Sintomas: Este é o estágio da infecção quando há indicadores aparentes de infecção. O tratamento para infecções virais geralmente consiste no alívio dos sintomas e na separação de pessoas não contaminadas.

**Achatamento da curva**

No contexto de surtos de doenças infecciosas, como pandemias, "achatar a curva" surgiu como uma técnica crítica para controlar e gerenciar a propagação de doenças. O objetivo de achatar a curva é diminuir a taxa de infecção, minimizar a pressão sobre os sistemas de saúde e, eventualmente, salvar vidas.

A expressão "achatar a curva" refere-se a uma curva epidemiológica, frequentemente representada graficamente e que mostra o número de novos casos de uma doença infecciosa ao longo do tempo. Em um surto descontrolado, a curva apresenta uma elevação rápida e acentuada, indicando um aumento significativo no número de infecções em um curto período de tempo. Esta curva acentuada implica uma carga significativa nos sistemas de saúde, podendo sobrecarregar os hospitais e levando a um aumento da frequência de casos graves e de óbitos.

Figura 5 - Gráfico de achatamento da curva

![](/paper/figure-5.jpeg)

Fonte: Daud (2022)

O achatamento da curva visa enfrentar os desafios colocados pela curva epidêmica acentuada. Os principais objetivos desta estratégia incluem:

- Retardar a propagação: A curva pode ser achatada aplicando medidas para diminuir a taxa de transmissão, como distanciamento social, uso de máscaras e práticas de higiene. Retardar a propagação da doença permite que os sistemas de saúde gerenciem melhor o fluxo de casos, garantindo que aqueles que precisam de atenção médica recebam atendimento adequado.
- Evitar a sobrecarga do sistema de saúde: Ao diminuir o número de novos casos por dia, a demanda por recursos de saúde, como leitos hospitalares, ventiladores e equipe médica, pode ser adiada por um período de tempo mais longo. Isso evita que os sistemas de saúde fiquem sobrecarregados, permitindo que eles ofereçam um melhor atendimento ao paciente e melhorem os resultados gerais.

**Prevalência e incidência**

Na epidemiologia, a prevalência é definida como a proporção da população com uma condição em um momento específico (prevalência pontual) ou durante um período de tempo (prevalência de período) (KIER, 2011). A prevalência aumenta quando novos casos de doenças são identificados (incidência) e diminui quando um paciente é curado ou morre. Muitas vezes, a prevalência de período fornecerá um quadro mais preciso da prevalência geral, pois a prevalência de período inclui todos os indivíduos com a doença entre duas datas: casos antigos e novos (incidentes), bem como aqueles que foram curados ou morreram durante o período (WHITING, 2015).

ê  = ( ú ç ) /

( çã  ç )

**Análise do comportamento do vírus em diferentes ambientes**

Há diversos fatores que influenciam na disseminação do vírus em determinado ambiente, como por exemplo fatores sociais, econômicos, higiênicos e atmosféricos, além das próprias características do vírus. Para abordar o comportamento do COVID-19 primeiro precisamos obter o conhecimento de seu modelo de transmissão.

O COVID é transmitido principalmente por pequenas gotículas produzidas quando uma pessoa infectada fala, tosse ou espirra, muitas das quais podem permanecer suspensas no ar por minutos a horas. Tocar em superfícies ou objetos contaminados é possivelmente uma forma de propagação do COVID, porém o Centro de Controle e Prevenção de Doenças (*Centers for Disease Control and Prevention - CDC*), agência do Departamento de Saúde e Serviços Humanos dos Estados Unidos da América, acredita que a principal forma de propagação é de pessoa para pessoa por meio de gotículas respiratórias. Portanto, nesta pesquisa, focamos principalmente no risco de gotículas expelidas no ar.

**Interação de referência**

Começamos estimando o risco de interagir com uma única pessoa positiva para COVID-19 em ambientes fechados por 1 hora a uma distância de socialização normal de 1 metro durante uma conversa em volume normal.

*Risco da atividade: Falar com 1 pessoa com COVID-19, por 1 hora, dentro de casa, sem máscara, a 1 metro = 14%*

Para esta estimativa, foram combinados estudos de passageiros em trens (HU et al., 2021), modelos de transmissão de aerossol (JIMENEZ, 2022), que usam dados de rastreamento de contato, meta-análises (CHU et al., 2020) e estudos prospectivos (CHENG et al., 2020). Pode-se, a partir desta estimativa, multiplicar os 14% em 1,5x com base no aumento do contágio da variante B117 (DAVIES et al., 2013) e, novamente, em 1,5x, como consequência da variante Delta (DAVIES et al., 2013).

Assim é definido uma “interação de referência”, que será usada como ponto de partida para estimar o risco de outros tipos de interações.

**Modificadores**

Há diversos modificadores para o risco da atividade, como o uso de máscara, ar livre, ventilação, distanciamento, entre outros. Esses fatores influenciam a probabilidade de disseminação do vírus e devem ser analisados.

Para estimar o risco de atividade de diferentes interações, modificamos nossa estimativa com base em como a interação em questão é diferente da interação de referência acima, com base nos seguintes fatores:

- Duração da interação
- Máscaras
- Localização (exterior ou interior)
- Distância entre si
- Volume da conversa

As estimativas para esses modificadores são:

Quadro 1 - Modificadores no risco de contrair COVID-19

|Modificador|Mudança no risco de contrair COVID-19|
| - | - |
|Eu estou usando uma máscara cirúrgica|/ 2|
|Outra pessoa está usando uma máscara cirúrgica|/ 4|
|Ambiente externo|/ 20 ou mais|
|2 metros de distância|/ 2|
|A cada 1 metro adicional de distância (até 4 metros)|/ 2|
|Falar alto (gritar, falar sobre música, cantar)|x 5|
|Não falar (como andar de trem)|/ 5|

Fonte: Adaptado de Lindsley et al. (2020), van der Sande et al. (2008), Davies et al. (2013), Jimenez (2022), Chu et al. (2020), Hu et al. (2021), Hua et al. (2020), Lai et al. (2012), O'Kelly et al. (2020) e Steinhauer (2020)

**Cálculos de exemplo**

Para calcular o risco de atividade de almoçar no parque com um amigo, começa-se com 14% (o risco de atividade da interação de referência) e os modificadores são aplicados conforme necessário:

14%  \* 2 (ℎ𝑜𝑟𝑎𝑠) / 20 ( ) / 2 ( â 2 − 3  )  = 0, 7%

Como resultado, há 0,7% de chance de se contrair COVID-19 com essa única atividade se a outra pessoa estiver contaminada. Vale notar que não há modificador para máscaras ou volume porque a interação de referência já está contabilizada sem máscara e no volume normal. Para uma ocasião de jantar entre duas pessoas, considerando os seguintes fatores: 2 horas, dentro de casa, a uma distância de cerca de 1 metro, sem máscaras. Com a aplicação dos modificadores, 14%  \* 2 (ℎ𝑜𝑟𝑎𝑠)  = 28%. Como resultado, há 28% de chance de se contrair COVID-19 caso a outra pessoa esteja contaminada.

**Máscaras**

A maioria das fontes é extraída de *An Evidence Review of Face Masks against COVID-19* (HOWARD et al., 2021), que examina uma variedade de tipos de estudo, alguns específicos do COVID-19 e outros que estudam o filtro de partículas como uma propriedade do tecido ou para outros patógenos, como a gripe.

A estimativa se inicia com uma redução numérica na contaminação para cada aspecto de máscaras cirúrgicas. A tabela abaixo mostra os vários resultados desses estudos:

Quadro 2 - Características de máscaras cirúrgicas e a respectiva redução na contaminação de um patógeno

|Medida|Resultado|
| - | - |
|Proporção de aerossol de tosse bloqueado|60% (redução de 1.7x)|
|Fator de proteção|2\.5x|
|Redução de cópias virais|3\.4x|
|Redução de aerossóis "finos"|2\.8x|
|Redução de aerossóis "grossos"|25x|
|Redução de unidades formadoras de colônias|7x|
|Proporção do fluxo de ar que vaza ao redor da máscara|12% (Proteção máxima de 8x)|
|Redução na contagem de gotículas de tosse|10x|

Fonte: Adaptado de Lindsley et al. (2020), van der Sande et al. (2008), Milton et al. (2013), Davies et al. (2013), Kumar et al. (2005) e Fischer et al. (2020)

Conclui-se que as máscaras cirúrgicas são substancialmente melhores para bloquear partículas grandes (25x) do que partículas pequenas (2,8x) (MILTON et al., 2013). A tosse parece ser filtrada de forma extremamente eficiente (DAVIES et al., 2013) e (FISCHER et al., 2020), o que implica que são principalmente partículas grandes. Como resultado, é definido um número um pouco maior do que o valor total citado em *Influenza Virus Aerosols in Human Exhaled Breath: Particle Size, Culturability, and Effect of Surgical Masks* (MILTON et al., 2013), (3,4x), que é 1/4.

Obtém-se as estimativas para máscaras de algodão finas e grossas que oferecem menos proteção a outras, comparando-as com máscaras cirúrgicas e entre si. Um "lenço" é aproximadamente 56-65% tão protetor quanto uma máscara cirúrgica, enquanto uma "mistura de algodão" é aproximadamente 70-78% tão protetora (DAVIES et al., 2013)

A máscara caseira é aproximadamente 92% tão eficaz quanto a máscara cirúrgica no bloqueio de unidades formadoras de colônias (DAVIES et al., 2013). No geral, uma máscara de algodão grossa e bem ajustada é cerca de 80% a 90% tão eficaz quanto uma máscara cirúrgica (que de acordo com as estimativas reduz a exposição em 4x), resultando em 2,5x-3x proteção, que arredondamos para 3x (multiplicador de 1/3) para máscaras de algodão grosso. Como resultado, uma máscara caseira mais fina ou de pior ajuste parece ser pelo menos 50% tão eficaz quanto uma máscara cirúrgica, que arredondamos para 2x (1/2 multiplicador).

**Vacinação**

Em uma população não vacinada, 17% dos casos nunca apresentam sintomas e esses indivíduos têm 42% mais chances de transmitir COVID do que indivíduos que eventualmente apresentam sintomas (BYAMBASUREN et al., 2020).

A partir disso, calcula-se que, para cada infecção, há 0,83 infecções sintomáticas e 0,17 infecções assintomáticas ou, para cada infecção sintomática, há 0,17 / 0,83 ≈ 0,2 infecções assintomáticas. Serão estudadas apenas as marcas de vacinas aplicadas no Brasil, sendo elas a Astrazeneca, Pfizer, CoronaVac e Johnson & Johnson, e suas taxas de infecciosidade e eficácia.

**Astrazeneca**

O estudo de teste da AstraZeneca feito pela Universidade de Oxford em 2021 relatou que, entre os participantes totalmente vacinados, houve 57 casos assintomáticos e 84 casos sintomáticos, ou 0,68 casos assintomáticos por caso sintomático.

Houve uma redução de 59,8% nos casos de COVID sintomático entre pessoas totalmente vacinadas com a vacina da AstraZeneca (BERNAL et al., 2021).

Para cada caso sintomático entre pessoas não vacinadas, isso nos dá:

Quadro 3 - Análise da eficácia da vacina Astrazeneca

||Grupo de Controle|Grupo Vacinado|
| :- | - | - |
|Casos sintomáticos|1|0,4|
|Casos assintomáticos|0,2|0,4\*0,68 = 0,27|

Fonte: Adaptado de Byambasuren et al. (2020)

Tratando casos assintomáticos como 0,4 de infecciosidade relativa, isso dá uma taxa ajustada de infecciosidade de:

(0, 4  + 0, 4  \* 0, 27) / (1  + 0 , 4  \* 0, 2)  = 0, 47

**Pfizer**

Pfizer mostrou 95% de redução em casos sintomáticos de COVID (POLACK et al., 2020). O CDC mostrou que houve uma redução de 90% em todos os casos (sintomáticos + assintomáticos) 14 ou mais dias depois dos participantes receberem a vacina da Pfizer (THOMPSON et al., 2021).

Em seguida, calcula-se novamente o número de casos assintomáticos entre os indivíduos vacinados com base nestas pesquisas:

1. Para cada caso sintomático entre pessoas não vacinadas, há 0,2 casos assintomáticos, ou 1,2 casos no total (BYAMBASUREN et al., 2020)
1. Para cada caso sintomático entre pessoas não vacinadas, há 0,05 casos sintomáticos entre vacinados.
1. Para cada caso total entre pessoas não vacinadas, há 0,1 caso total entre pessoas vacinadas (CDC).
1. Para cada caso sintomático entre pessoas não vacinadas, há 1,2 \* 0,1 = 0,12 casos no total.
1. Para cada caso sintomático entre pessoas não vacinadas, há 0,12 - 0,05 = 0,07 casos assintomáticos entre pessoas vacinadas.
6. Para cada caso sintomático entre pessoas vacinadas, existem 0,07 / 0,05 = 1,4 casos sintomáticos entre pessoas vacinadas.

Em seguida, combinamos isso com o estudo de Bernal et al., que constatou que a vacina da Pfizer é 87,9% (intervalo de confiança de 95%: 78,2 a 93,2) eficaz na redução da chance de infecção sintomática pela variante Delta.

Quadro 4 - Análise da eficácia da vacina Pfizer

||Grupo de Controle|Grupo Vacinado|
| :- | - | - |
|Casos sintomáticos|1|0,12|
|Casos não sintomáticos|0,2|0,12 \* 1,4 = 0,17|

Fonte: Adaptado de Byambasuren et al. (2020) e Bernal et al. (2021)

Tratando casos nunca sintomáticos como 0,4 de infecciosidade relativa, isso dá uma taxa ajustada de infecciosidade de:

(0, 12  + 0, 4  \* 0, 17) / (1  + 0, 4  \* 0, 2)  = 0, 17

**CoronaVac**

Entre os participantes vacinados, 51 testaram positivo para SARS-CoV-2 durante o acompanhamento (41 antes e 10 após a segunda dose); 29 foram diagnosticados por triagem assintomática, nos dando 0,56 casos assintomáticos por caso sintomático (TANG et al., 2021).

Não houve casos positivos sintomáticos ou de exposição conhecida mais de 7 dias após a segunda dose. Os participantes não vacinados apresentaram maior incidência cumulativa de resultado positivo nos testes em comparação aos participantes vacinados e maior incidência de resultados positivos nos testes por triagem assintomática, para sintomas ou para exposição conhecida.

Para cada caso sintomático entre pessoas não vacinadas, isso nos dá:

Quadro 5 - Análise da eficácia da vacina CoronaVac

||Grupo de Controle|Grupo Vacinado|
| :- | - | - |
|Casos sintomáticos|1|0,4|
|Casos assintomáticos|0,2|0,4 \* 0,56 = 0,224|

Fonte: Adaptado de Byambasuren et al. (2020)

Tratando casos assintomáticos como 0,4 de infecciosidade relativa, isso resulta em uma taxa ajustada de infecciosidade de:

(0, 4  + 0, 4  \* 0, 224) / (1  + 0, 4  \* 0, 2)  = 0, 45

**Johnson & Johnson**

A Johnson & Johnson realizou testes sorológicos para anticorpos não relacionados à proteína spike nos dias 1, 29 e 71 para rastrear infecções assintomáticas. Eles também consideraram uma infecção assintomática caso um participante apresentasse um teste de PCR positivo, mas sem sintomas. Os casos sintomáticos foram contabilizados quando um paciente apresentava sintomas e testou positivo no PCR pelo menos 14 dias após a administração da vacina.

Quadro 6 - Análise da eficácia da vacina Janssen

||Grupo de Controle|Grupo Vacinado|
| :- | - | - |
|Casos sintomáticos|1|0,36 (J&J Fase 3)|
|Casos assintomáticos|0,2|0,36 \* 0,18 = 0,065|

Fonte: Adaptado de Byambasuren et al. (2020)

Tratando casos assintomáticos como 0,4 de infecciosidade relativa, isso resulta em uma taxa ajustada de infecciosidade de:

(0, 36  + 0, 4  \* 0, 065) / (1  + 0, 4  \* 0, 2)  = 0, 36

**Taxa de Hospitalização e Morte por grupo de idade**

Em ordem de representar com maior acurácia a probabilidade de contaminação do COVID-19 na população, deve ser levado em consideração a susceptibilidade de cada indivíduo na contração da doença. Fatores como doenças crônicas/condições de saúde anteriores (diabetes, doenças cardíacas, doenças pulmonares, etc.), idade e gênero influenciam tanto na probabilidade de contração da doença como na taxa de hospitalização e morte (ASLANER, 2021).

Quadro 7 - Taxa de hospitalização e morte por grupo de idade

||Taxa de hospitalização (%)|Taxa de morte (%)|
| :- | - | - |
|0-17 anos|0\.8%|0\.0015%|
|18-49 anos|2\.5%|0\.07%|
|50-64 anos|7\.9%|0\.7%|
|65+ anos|5%|6%|

Fonte: Adaptado de Aslaner et al. (2021)

## Metodologia

**Critérios do Produto**
- Características da população, cidade e atividades que compõem as rotinas dos indivíduos podem ser alteradas, excluídas ou adicionadas;
- Cada indivíduo tem suas próprias características que os diferenciam dos demais, como idade, sexo, casa, escola e/ou trabalho, que são definidas a partir do senso da cidade a ser simulada;
- Algoritmo que distribua estas características únicas a todos os indivíduos na simulação;
- Algoritmo de disseminação do vírus que consiga, a partir do estado dos indivíduos, seu ambiente e características da doença determinar uma probabilidade de infecção;
- Todos os indivíduos possuem sua própria rotina com uma série de atividades pré definidas com base em suas características;
- É possível alterar variáveis de combate à doença, resultando assim em diferentes cenários pandêmicos.

**Materiais e softwares utilizados**

Para a análise exploratória dos dados e criação dos gráficos foram utilizadas bibliotecas da linguagem de programação Python em conjunto com Jupyter Notebook, devido ao seu fácil uso e uma gama de funcionalidades bastante acessíveis.

Para a simulação, foi utilizada a linguagem de programação TypeScript, que possui um ecossistema bastante popular, cuja comunidade e bibliotecas servem como facilitadoras do processo de desenvolvimento. Além disso, por ser derivada de JavaScript, a simulação pode ser convertida de forma a poder ser feita em qualquer website sem maiores complicações.

- Desenvolvimento:
  - Ambiente de desenvolvimento integrado (IDE);
  - Bibliotecas de processamento de matrizes e vetores Numpy e Pandas;
  - Bibliotecas de criação de gráficos e visualização de dados Matplotlib e Plotly;
  - Motor de execução Bun.
- Os computadores utilizados para realizar esta pesquisa possuem as seguintes especificações de *hardware*:
- Computador pessoal 1
  - Processador AMD Ryzen 5 5ª geração;
  - 24 GB de memória RAM;
  - Windows 11;
  - Armazenamento em disco de SSD M.2 NVMe 512 GB + HD 1TB.
- Computador pessoal 2
- Processador Intel i5 8ª geração;
- 8 GB de memória RAM;
  - Windows 11;
  - Armazenamento em disco de SSD SATA 480 GB.
- Computador pessoal 3
  - Processador Intel i7 10ª geração;
  - 8 GB de memória RAM;
  - Windows 11;
  - Armazenamento em disco de SSD PCLe 256 GB.
- Computador institucional
  - Processador Apple M1;
  - 16 GB de memória RAM;
  - macOS Ventura;
  - Armazenamento em disco de SSD M.2 NVMe 512 GB.

**Etapas**

**Estudo da eficácia de performance entre diferentes linguagens de programação**

Para alcançar a melhor performance durante a simulação, realizamos diferentes testes com diferentes linguagens de programação de alto nível para entender qual possui o melhor desempenho nas tarefas que terá que realizar. Quanto menor for o tempo de execução e uso de memória, mais viável será a eficiência, replicação e execução do programa.

As linguagens testadas foram as seguintes:

- TypeScript;
- C++/C;
- Fortran;
- Go;
- Julia;
- Java;
- Scala;
- Rust;
- Python.

Elas foram escolhidas com base em sua facilidade no desenvolvimento, disponibilidade de bibliotecas, comunidade e performance (CASS, 2022). Para validar seu desempenho e definir a linguagem que será utilizada no desenvolvimento do modelo, propomos um caso teste que simula um cenário real no projeto: cada programa possui uma classe que representa um indivíduo, este indivíduo possui todas as propriedades que serão utilizadas durante o cálculo de disseminação do vírus de forma a emular o uso de memória. Para a disseminação, necessita-se que tenhamos acesso aos indivíduos na mesma localização, logo, é dado um vetor de todos os indivíduos instanciados com valores distintos ao algoritmo, que deve retornar os indivíduos em volta do atual. Vale ressaltar que todas as linguagens compiladas foram executadas por meio de linha de comando, sem a utilização de *softwares* terceiros.

Em cada linguagem foram desenvolvidos dois programas, um otimizado e outro não. Um programa otimizado significa que foram implementados algoritmos e estruturas de dados complexos como paralelismo, concorrência, *multithreading* e semáforos, e algumas funcionalidades próprias da linguagem que podem ou não aumentar sua eficiência.

Foram realizados testes iterativos para um conjunto de indivíduos com o tamanho da população de Campinas, cerca de 1 milhão e 100 mil habitantes, do programa em cada linguagem, com indivíduos e localizações aleatórias, a partir dos quais foram gerados os seguintes gráficos utilizando a biblioteca Matplotlib de Python em um Jupyter Notebook:

Figura 6 - Gráfico de análise do uso de memória das linguagens

![](/paper/figure-6.jpeg)

Fonte: Autoria própria (2023)

Figura 7 - Gráfico de análise do tempo de execução das linguagens

![](/paper/figure-7.jpeg)

Fonte: Autoria própria (2023)

A partir da análise dos dados, foi decidido que a linguagem de programação que será utilizada no desenvolvimento do modelo será o TypeScript, que, sem otimização, apresentou ótimos resultados em ambos os testes, além de apresentar uma ampla gama de bibliotecas, ecossistema com comunidade bastante ativa e sintaxe produtiva. No futuro, pode-se, também, ser feito uma transpilação do código desenvolvido em TypeScript para JavaScript devido ao fato do primeiro ser um superconjunto do segundo, possibilitando, assim, uma exportação do modelo para uma versão web através de um site e/ou API REST, favorecendo a acessibilidade à pesquisa e ao modelo de simulação.

**Representação da cidade virtualmente**

Representar uma cidade de forma virtual, com acurácia e fidedignidade, é um desafio a ser considerado. Por isso, optamos por abstrair a dinâmica geral de uma cidade embasando-nos, para tanto, nos conceitos geográficos de fixos e fluxos. Os fixos referem-se aos elementos estáticos da cidade, como edifícios, estradas e outras infraestruturas. Estes são os componentes permanentes que formam o esqueleto físico da cidade. Por outro lado, os fluxos representam os elementos dinâmicos, como o movimento de pessoas, veículos e informações. Estes fluxos são cruciais para determinar o funcionamento de uma cidade no dia a dia (BARROS, 2020).

Em nossa abordagem de modelagem, buscamos uma representação simplificada que captura a essência desses dois aspectos. Embora nos concentremos na infraestrutura básica e nos movimentos principais dentro da própria cidade, optamos por simplificar ou omitir certos aspectos mais complexos, como a locomoção de indivíduos entre cidades vizinhas. Essa simplificação ajuda a manter o modelo gerenciável e focado nos aspectos mais críticos da dinâmica urbana.

Na abstração da representação da cidade, uma das abordagens é criar uma matriz de a x b células, com cada célula equivalente a 1m² da cidade real sendo utilizada como localização geográfica do indivíduo. Decidimos por não utilizar desta abordagem pois ocorreria um desperdício de memória em um estado onde certa célula não está ocupada por nenhum indivíduo. Ao invés disso, cada indivíduo tem em seus atributos a abstração da localização, eles não possuem coordenadas definidas, mas sim um estado dizendo seu lugar. Por exemplo, imaginemos que em uma cidade há 30 mil pontos de trabalho, quando o indivíduo estiver trabalhando, ele não terá a coordenada exata de seu trabalho, e sim sua identificação, que é diferente dos outros 30 mil. Assim, quando formos realizar o cálculo de disseminação do vírus nesse ambiente, procuramos dentre o banco de indivíduos, todos que naquele momento possuem como identificação do ponto de trabalho o mesmo do indivíduo atual.

Para simular a cidade é necessário os censos sociais e universais do local para assim conseguir certas informações cruciais para o modelo. Essas informações são:

- t

Por questões de indisponibilidade de dados recentes, foi utilizado o censo de 2010 do Instituto Brasileiro de Geografia e Estatística (IBGE). Alertamos para o fato de que, devido aos dados se referirem a uma cidade dez anos no passado em relação a que encarou a pandemia do COVID-19, os resultados de mortes e casos podem sofrer incoerências mínimas.

As informações solicitadas possuem importância na definição das características dos indivíduos, suas rotinas, taxa de disseminação do vírus. Pelo fato de que os dados obtidos pelo censo do IBGE de 2010 apresentaram pequenas incongruências entre si, foi necessário o desenvolvimento de um algoritmo de normalização dos dados.

**Normalização**

Devido a diversas incongruências encontradas nos dados do censo, bem como entre diferentes fontes de dados utilizadas, como o Ministério do Trabalho e Emprego (MTE), Relatórios de Informações Sociais do Município de Campinas e Boletins Epidemiológicos da Secretaria Municipal de Saúde de Campinas, foi necessária a implementação de um algoritmo, utilizando de relações matemáticas, para a normalização dos diversos dados.

Dado um conjunto de valores totais para uma única categoria de um parâmetro a ser atribuído para uma população de indivíduos, a normalização dos conjunto de parâmetros será dada pela seguinte relação matemática:

**REVER**

- ∑ ( )

=1

1. %  = ÷

   2. = −
1. = + % ×

Para cada parâmetro , sua porcentagem de “contribuição”, % *,* é calculada através da divisão da quantidade total de valores do parâmetro pela soma dos valores de todos os parâmetros de um conjunto *,* denominada (1)*.* Com a porcentagem de “contribuição” de um parâmetro não normalizado, é atribuído ao seu correspondente normalizado o montante anterior, *,* somado

com o respectivo montante faltante, calculado pela porcentagem de “contribuição” de *,* % *,* multiplicada pelo número de indivíduos a serem normalizados, (3)*. ,*

por sua vez, o número de indivíduos a serem normalizados, fora calculado através da diferença entre os indivíduos totais pela soma dos valores de todos os parâmetros de um conjunto *, ,* (2)*.*

Após uma bateria de testes, comprovamos que a relação matemática acima descrita mantém a proporção original entre os diferentes parâmetros, sendo capaz de normalizar quaisquer parâmetros formatados, escalonando-os para cima ou para baixo.

Dessa forma, fomos capazes de combinar conjuntos de dados de fontes diferentes com valores distintos mantendo a razão original dos mesmos, de forma a utilizarmos dados fidedignos e escalonados para nosso modelo.

**Representação dos indivíduos na cidade**

São atribuídas a cada indivíduo dentro da cidade certas atividades de forma aleatória com base em suas características definidas de acordo com os dados sociodemográficos. Estas atividades envolvem locomoção e encontro com outros indivíduos, que podem categorizar cenários de lazer, trabalho, ou estudo, e representam a rotina deste indivíduo na cidade.

Além das rotinas e suas próprias características, foi necessário distribuir a população em suas respectivas residências a fim de obter-se uma rotina de trabalho-casa ou escola-casa.

As residências foram distribuídas com base nos dados do IBGE, bem como a quantidade de indivíduos por residência. A idade destes indivíduos também foi levada em consideração nesta distribuição, uma vez que existem parâmetros relacionados. Por exemplo, é improvável um cenário no qual um indivíduo de zero a quatro anos mora em uma residência sozinho.

Portanto, a população virtual modelada apresenta características detalhadas análogas à vida real. Dessa forma, cada indivíduo possui os seguintes atributos devidamente distribuídos de acordo com os dados disponíveis, de forma coerente e pertinente:

- Identificação;
- Sexo;
- Faixa etária;
- Status educacional;
- Residência:
  - Identificação;
  - Região;
  - Número de residentes;
  - Residentes (demais indivíduos).
- Renda;
- Meio de transporte (público ou privado);
- Tipos de ocupação (trabalho e/ou estudo);
- Ocupações:
  - Identificação;
  - Tipo (trabalho e estudo);
  - Número de indivíduos.
- Vacina:
  - Tipo;
  - Doses.
- Máscara;
- Está hospitalizado?;
- Está morto?;
- Está com COVID?;
- Já teve COVID?;
- Rotina - conjunto de atividades compostas por:
- Identificação;
- Categoria (lazer, afazeres, trabalho, transporte, estudo, etc);
- Duração;
- Distância entre indivíduos;
- Volume da voz dos indivíduos;
- Ambiente (fechado ou aberto).

**Sincronização das atividades na simulação**

Para realizar a simulação de forma que as atividades sejam executadas no tempo certo, e que atividades futuras sejam apenas executadas quando as atuais terminarem, preservando a lógica do indivíduo não poder estar em diferentes lugares ao mesmo tempo, surge a necessidade da implementação de um algoritmo de sincronização destas atividades. Portanto, foram pesquisadas diferentes técnicas computacionais e teóricas para abordar o problema.

**NP-Hard e Algoritmo de Johnson**

Um problema é atribuído à classe NP (tempo polinomial não determinístico) se for solucionável em tempo polinomial por uma máquina de Turing não determinística (BORWEIN, 1987). Problemas NP-hard podem ser de qualquer tipo: problemas de decisão, problemas de pesquisa ou problemas de otimização.

O *Job-Shop Scheduling Problem* (JSSP) é um problema de otimização combinatória, NP-hard. O objetivo do problema é encontrar a programação ideal para alocar recursos compartilhados ao longo do tempo para atividades concorrentes a fim de reduzir o tempo total necessário para concluir todas as atividades.

Em um JSSP, há um número de trabalhos ( 1,  2, ...,  ), que precisarão ser concluídos usando um número de recursos compartilhados, mais comumente denotados como máquinas ( 1,  2, ...,  ). Cada trabalho terá operações ( ) que precisarão ser concluídas em uma ordem específica para que o trabalho seja concluído. As operações devem ser concluídas em máquinas específicas e exigem um tempo de processamento ( ) nessa máquina (YAMADA, 1997).

O algoritmo heurístico de S. M. Johnson, ou simplesmente Algoritmo de Johnson é uma das soluções para o JSSP e se comporta da seguinte maneira:

O trabalho tem duas operações, de duração 1 e  2, a serem realizadas nas máquinas 1 e 2 nessa sequência.

1. Lista  = { 1, 2, ...,  }, Lista  1  = {}, Lista  2  = {}.
2. De todas as durações de operação disponíveis, escolha a mínima.

   Se o mínimo pertencer a  1,

   Remova da lista . Adicione ao final da lista 1. Se o mínimo pertencer a 2,

   Remova da lista . Adicione ao início da lista 2.

3. Repita a etapa 2 até que a Lista A esteja vazia.
4. Junte a Lista L1 e a Lista L2. Essa é a sequência ideal.

Nos inspiramos neste algoritmo para propor a lógica de abordagem da sincronização. Todas as atividades que estão acontecendo em determinado momento ficarão em um vetor (arranjo) ordenado de forma crescente de acordo com o tempo das atividades, ou seja, os primeiros índices do vetor conterão as atividades que estão acontecendo agora e que possuem o menor tempo dentre todas as outras.

Toda vez que uma nova atividade se inicia, é adicionada ao vetor e será acionado o algoritmo de disseminação para ela de acordo com suas características e de seus indivíduos, mudando seus estados de acordo com o resultado da disseminação.

O algoritmo de disseminação é acionado apenas uma vez para cada atividade. A cada momento, as atividades do início do vetor são computadas, seu tempo é adicionado ao tempo global da simulação e ela é removida do vetor, esse tempo é removido de todas as outras atividades acontecendo no momento. Após isso, é feita uma busca por todos os indivíduos para ver se a atividade em que estavam já acabou e se começam uma nova naquele tempo da simulação, e assim o vetor é ordenado novamente. Optamos por esta estratégia pois o tempo de execução do programa depende inteiramente da velocidade dos algoritmos de disseminação, ordenação e procura, e não há a necessidade de um gargalo proposital para alterar o tempo da simulação de acordo com um tempo real.

**Análise da eficácia de diferentes algoritmos de ordenação**

Para escolher qual algoritmo de ordenação será utilizado no vetor de atividades, realizamos diversos testes com diferentes algoritmos. A seguir está o gráfico mostrando a relação de tempo de execução, em segundos, por interação, mostrando a performance de cada algoritmo na ordenação de um milhão de atividades de duração aleatória, que simboliza o pior cenário possível onde cada indivíduo está em uma atividade diferente.

Figura 8 - Gráfico de análise dos algoritmos de ordenação

![](/paper/figure-8.jpeg)

Fonte: Autoria própria (2023)

A partir das análises dos dados, foi escolhido o algoritmo de *Quick Sort* para ser utilizado no processo de ordenação das atividades, o que condiz com o fato de ser um dos mais eficientes e rápidos dentre todos os outros (XIANG, 2011), e ter complexidade temporal e espacial de ( ) nos melhores casos, proporcionando ótima performance.

**Utilização da fundamentação teórica para cálculo da probabilidade de disseminação da doença**

A disseminação é uma abstração do conceito de autômatos celulares na Vizinhança de Moore: o estado de saúde de cada indivíduo é alterado com base nos dados dos indivíduos virtualmente próximos a ele, dada uma regra fixa. Essa regra fixa é o fluxo de cálculo da probabilidade de disseminação da doença.

Esse fluxo é realizado, portanto, como uma linha de produção. De forma iterativa, o algoritmo extrai todas as informações começando a partir de cada característica e estado de saúde dos indivíduos, bem como características da atividade, ambiente virtual, parâmetros globais acerca do vírus, seu comportamento e probabilidades dos modificadores anteriormente definidos, como o tipo de máscara e vacina. Desse modo, é determinada a probabilidade de disseminação da doença utilizando as taxas de risco da atividade, risco individual de cada indivíduo e prevalência de casos na região. Todos os valores dos modificadores e exemplos de cálculos são mostrados durante a fundamentação teórica. Se esta probabilidade for maior que um limiar mínimo ainda a ser estipulado, é considerado que o indivíduo contraiu a doença.

Figura 9 - Fluxograma simplificado do funcionamento do projeto

![](/paper/figure-9.jpeg)

Fonte: Autoria própria (2023)

**Validação do modelo de disseminação utilizando o COVID-19**

Para simular diferentes cenários com diferentes configurações de uso de máscaras, distanciamento social e tráfego de pessoas, precisamos primeiro ter um modelo capaz de gerar o mesmo números de mortes e casos nas condições exatas do cenário real da pandemia. Desenvolvemos a seguinte metodologia para a validação do modelo:

Figura 10 - Metodologia para validação do modelo de disseminação

![](/paper/figure-10.png)

Fonte: Autoria própria (2023)

Antes de testarmos o modelo para a simulação de cenários dado características de doenças potencialmente epidêmicas recentes, precisamos primeiro validar utilizando dados de uma pandemia que já aconteceu, como a do COVID-19, pois senão não saberemos se os cenários simulados são verdadeiros ou não.

Para a validação, utilizamos o método de *Hold-out Validation*, que consiste em dividir os conjuntos de dados de boletins epidemiológicos dos anos 2020 a 2021 entre treinamento e teste, utilizando uma proporção de 80/20. Os 20% dos dados representam os primeiros meses da pandemia em 2020 e é utilizado para treinar o modelo, o qual com base nesses dados define variáveis de prevalência do vírus, taxa de aumento de casos, entre outros.

Após a incorporação dos dados iniciais o modelo se torna autossuficiente, mudando suas taxas e variáveis com base nos casos que ele mesmo gera. Ao final da simulação do período desejado, utilizamos os 80% dos dados restantes para validar a acurácia das predições.

## Resultados

No estágio atual de desenvolvimento da pesquisa, foi demonstrada na teoria e confirmada na prática a viabilidade computacional de modelagem de uma população virtual com atributos, características e rotinas análogas às de indivíduos em uma população real, com embasamento em dados geográficos e demográficos. No entanto, a implementação desse modelo provou ser desafiadora, exigindo a consideração de uma ampla gama de parâmetros para criar uma população virtual que seja minimamente relacionada à real.

Além disso, nossa pesquisa comprovou, até o presente momento, que é computacionalmente viável simular uma pandemia por meio de autômatos celulares que representam os indivíduos em uma cidade abstrata virtualizada. Essa abordagem tem o potencial de fornecer percepções valiosas sobre como as doenças infecciosas se disseminam e o quão eficaz cada tipo de intervenção é.

Como resultado parcial desta pesquisa, foram simulados, seguindo o embasamento bibliográfico, teórico e metodológico estabelecido, 3 anos da pandemia de COVID-19 em Campinas: de 2020 a 2023. Os gráficos abaixo representam, de forma ilustrativa, os resultados obtidos a partir da modelagem com a respectiva acurácia quando comparados com os dados reais.

Figura 11: Gráfico comparativo de casos totais ao longo do tempo

![](/paper/figure-11.jpeg)

Fonte: Autoria própria (2023)

Figura 12: Gráfico comparativo da distribuição de casos totais

![](/paper/figure-12.jpeg)

Figura 13: Gráfico comparativo de novos casos ao longo do tempo

![](/paper/figure-13.jpeg)

Fonte: Autoria própria (2023)

Figura 14: Gráfico comparativo de mortes ao longo do tempo

![](/paper/figure-14.jpeg)

Figura 15: Gráfico comparativo da distribuição de mortes

![](/paper/figure-15.jpeg)

Fonte: Autoria própria (2023)

Figura 16: Gráfico comparativo de novas mortes ao longo do tempo

![](/paper/figure-16.jpeg)

Fonte: Autoria própria (2023)
46

Figura 17: Gráfico comparativo de mortes por total de casos ao longo do tempo

![](/paper/figure-17.jpeg)

Fonte: Autoria própria (2023)

Figura 18: Gráfico comparativo de mortes por total de casos ao longo do tempo

![](/paper/figure-18.jpeg)

Fonte: Autoria própria (2023)


O cenário simulado reflete o uso de máscaras e a vacinação da população análogo ao que ocorreu de fato durante a pandemia. Os dados simulados, no entanto, mostram um número inflacionado de casos e mortes em comparação com os dados reais observados em Campinas durante o mesmo período. Especificamente, a simulação resultou em aproximadamente 720 mil casos e 20 mil mortes, enquanto em Campinas foram registrados cerca de 200 mil casos e 5 mil mortes.

Essa discrepância sugere a necessidade de mais testes e refinamento do modelo para aumentar sua acurácia. É importante melhorar o modelo não só em termos técnicos, mas também explorando e utilizando melhor os atributos de cada indivíduo. Após implementarmos tais modificações e melhorias, esperamos reduzir o número total de casos previstos pela simulação, evitando a hiper contaminação virtual que não ocorreu na realidade.

Embora o modelo atual precise de aprimoramentos, ele já demonstra potencial para prever o comportamento de novas doenças e cenários epidêmicos futuros. A ênfase deve ser colocada no aprimoramento e polimento do modelo para garantir que ele possa simular com mais precisão os impactos de intervenções de saúde pública, como vacinação e uso de máscaras, em diferentes cenários epidêmicos. Espera-se, como resultado final, que o modelo atinja uma acurácia de 50% a 60%, superando os atuais modelos, que atuam na faixa de 30% a 40%.

## Conclusões

A partir do objetivo inicial de criar um modelo capaz de simular doenças potencialmente pandêmicas em qualquer cenário virtual, foi proposta a utilização conjunta de diversas fontes de dados, embasamento matemático, conceitos computacionais teóricos e métodos a fim de se obter como produto um modelo de simulação acurado e confiável. Durante o trabalho, foi estudado a fundo cada aspecto da simulação, sua viabilidade, relação com conceitos interdisciplinares e a melhor maneira para ser implementado.

A idealização de tais métodos e sua validação teórica foi concluída, sendo possível estabelecer um modelo teoricamente capaz de simular uma pandemia em escala local, para, dessa forma, mitigar e reduzir os impactos de uma pandemia.

Atestamos para o fato de que embora o projeto esteja lidando com as características do vírus COVID-19 em Campinas, as bases teóricas e metodológicas podem e devem ser implementadas e adaptadas a outras doenças, principalmente respiratórias, e em qualquer cidade que disponha de algum tipo de censo geográfico e demográfico.

Também vale ressaltar que propomos e implementamos com sucesso um simulador pandêmico que se apropria de uma população com atributos detalhados a nível municipal, diferindo de implementações mais gerais, a nível nacional ou estadual, como em *Outbreak diversity in epidemic waves propagating through distinct geographical scales* (COSTA; COTA; FERREIRA, 2020), e até mesmo adaptações municipais, como a implementação proposta em *Modeling the Spatiotemporal Epidemic Spreading of COVID-19 and the Impact of Mobility and Social Distancing Interventions* (ARENAS et al., 2020), devido ao ineditismo de uma modelagem que direcionada exclusivamente à escala local. Dessa forma, a coleta e utilização de dados regionais em detrimento de abstrações macroscópicas resultaram em um modelo mais acurado e fidedigno, com baixos requisitos de poder computacional.

Portanto, a utilização de um *cluster,* ou aglomerado, de diversos simuladores, cada um adequado para uma única cidade de acordo com os dados do censo, possibilita a simulação de escalas estaduais e nacionais constituídas, internamente, por estruturas mais específicas e direcionadas aos municípios, o que corrobora, por conseguinte, para simulações mais acuradas de forma geral.

Assim, obtivemos, como produto da pesquisa que ainda está em andamento, um simulador pandêmico que não se restringe apenas ao caráter matemático da clássica modelagem epidemiológica, como visto em *Spreading phenomena on complex networks and social systems* (COTA, 2020), incluindo uma vasta gama de parâmetros biológicos, geográficos e demográficos de forma pioneira. Constitui-se, portanto, um modelo que é capaz de simular e predizer o comportamento futuro de potenciais pandemias, principalmente de doenças respiratórias, que pode ser licenciado ou vendido como um *Software as a Service* (SaaS) para secretarias municipais ou estaduais de saúde, assim como ministérios e organizações competentes, como o Ministério da Saúde e a Organização Mundial de Saúde (OMS), possibilitando ações preventivas a fim de reduzir os impactos humanos, sociais e econômicos de um surto. Além disso, institutos e empresas públicas e/ou privadas do setor farmacêutico também podem se beneficiar de testes em cenários pandêmicos virtualizados da eficácia de suas vacinas, como Pfizer, Johnson & Johnson, Astrazeneca e o Butantã.

Por fim, esperamos que a mesma inspire trabalhos futuros a aprimorar os métodos que propusemos, bem como as técnicas existentes, com o objetivo de expandir ainda mais o domínio de novas bases teóricas no campo da simulação pandêmica computacional. Podendo contribuir para o desenvolvimento de estratégias mais eficazes de prevenção e resposta a pandemias no futuro, por exemplo, através do uso de aprendizado de máquina sobre os cenários simulados, elevando, ainda mais, as conclusões a serem tomadas sobre o decorrer de uma pandemia.