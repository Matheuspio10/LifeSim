import { GoogleGenAI, Type } from "@google/genai";
import { Character, LifeStage, GameEvent, RelationshipType, MemoryItemType, Trait, EconomicClimate, Choice, MiniGameType, Mood } from '../types';

// Helper function to robustly parse JSON from the model's text response
const cleanAndParseJson = <T,>(responseText: string): T => {
    let jsonText = responseText.trim();

    // Attempt to find JSON within markdown code blocks like ```json ... ``` or ``` ... ```
    const markdownMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[1]) {
        jsonText = markdownMatch[1].trim();
    } else {
        // If no markdown block, it might be prefixed/suffixed with text.
        // Find the first '{' and last '}' to extract the JSON object.
        const firstBrace = jsonText.indexOf('{');
        const lastBrace = jsonText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace > firstBrace) {
            jsonText = jsonText.substring(firstBrace, lastBrace + 1);
        }
    }
    
    // Sanitize extremely large numbers that might break JSON.parse or game balance.
    // It looks for a number (positive or negative) with 10 or more digits and caps it.
    jsonText = jsonText.replace(/:(\s*)(-?\d{10,})/g, (match, space, number) => {
        const isNegative = number.startsWith('-');
        console.warn(`Número excessivamente grande detectado da API e limitado: ${number}`);
        // Cap at +/- 999,999,999 as a hard limit to prevent breaking the game economy.
        const cappedNumber = isNegative ? '-999999999' : '999999999';
        return `:${space}${cappedNumber}`;
    });

    try {
        return JSON.parse(jsonText) as T;
    } catch (e) {
        console.error("Falha ao analisar JSON da API após a limpeza. Texto limpo:", jsonText, "Texto Original:", responseText, e);
        throw new Error("A resposta da IA não era um JSON válido.");
    }
};

const getBossBattlePrompt = (lifeStage: LifeStage): string => {
    const bosses = {
        [LifeStage.CHILDHOOD]: "Você deve confrontar o valentão da vizinhança que vive roubando seu lanche.",
        [LifeStage.ADOLESCENCE]: "É a prova final de uma matéria que você está prestes a reprovar. Você precisa passar para se formar no ensino médio.",
        [LifeStage.YOUNG_ADULTHOOD]: "Você tem a entrevista final para o emprego dos sonhos. Precisa impressionar o gerente de contratação.",
        [LifeStage.ADULTHOOD]: "Você está enfrentando uma grande crise de meia-idade. Você se sente insatisfeito com sua carreira e escolhas de vida.",
        [LifeStage.OLD_AGE]: "Um problema de saúde sério apareceu, forçando-o a confrontar sua própria mortalidade e tomar decisões difíceis sobre o tratamento."
    }
    return bosses[lifeStage] || "Você enfrenta um desafio de vida significativo.";
}

const getZeitgeist = (year: number): string => {
    if (year < 1820) {
        return `Era das Luzes e Revoluções (1700-1819): O mundo ferve com ideias iluministas sobre liberdade e direitos. As notícias viajam lentamente por panfletos e jornais. Revoluções (Americana, Francesa) mudam o mapa político. Carreiras podem surgir em salões intelectuais, no exército ou em negócios coloniais, mas a instabilidade política e a censura são ameaças constantes.`;
    }
    if (year < 1870) {
        return `Era Industrial e Romântica (1820-1869): A Revolução Industrial transforma a paisagem com fábricas e ferrovias. Cidades crescem desordenadamente, criando fortunas e miséria. O Romantismo domina as artes, valorizando a emoção e o indivíduo. Novas profissões urbanas surgem, mas as condições de trabalho são precárias e as tensões sociais, altas.`;
    }
    if (year < 1900) {
        return `Era dos Impérios (1870-1899): A Segunda Revolução Industrial traz eletricidade, aço e comunicação de massa (telégrafo). Impérios coloniais europeus expandem seu domínio global. Surgem os primeiros grandes negócios e sindicatos. A mobilidade social é possível, mas a competição é acirrada e as disputas imperialistas criam um cenário de tensão global.`;
    }
    if (year < 1930) {
        return `Era das Grandes Guerras (1900-1929): O mundo está se modernizando com automóveis e rádios, mas as tensões levam à Primeira Guerra Mundial. A informação viaja por jornais e telégrafo. Carreiras industriais florescem, mas o trabalho é árduo. A sociedade vive a euforia dos "Anos Loucos", com jazz e novas liberdades, mas à sombra de conflitos recentes.`;
    }
    if (year < 1946) {
        return `Era da Incerteza (1930-1945): A Grande Depressão causa pobreza generalizada, seguida pela ascensão de ideologias extremas e a Segunda Guerra Mundial. O rádio é a principal fonte de notícias e entretenimento. A propaganda de guerra é onipresente. Carreiras estão ligadas ao esforço de guerra ou à sobrevivência em tempos difíceis.`;
    }
    if (year < 1980) {
        return `Era Atômica (1946-1979): O mundo vive sob a sombra da Guerra Fria e da ameaça nuclear. A televisão se torna o centro da vida familiar, transmitindo a corrida espacial, a contracultura e a revolução do rock and roll. O consumismo cresce, mas movimentos sociais questionam o status quo.`;
    }
    if (year < 1996) {
        return `Era Analógica Tardia (1980-1995): O mundo é pré-internet comercial. A tecnologia inclui telefones fixos, fitas K7, videogames de 8/16 bits e TVs de tubo. A informação é consumida através de jornais, rádio e poucos canais de TV. Carreiras como 'YouTuber' ou 'Desenvolvedor de App' não existem. Desafios sociais podem incluir o pânico da Guerra Fria ou a crise da AIDS.`;
    }
    if (year < 2011) {
        return `Era da Internet Pioneira (1996-2010): A internet discada dá lugar à banda larga. Surgem os primeiros blogs, mensageiros instantâneos (ICQ, MSN) e redes sociais primitivas (Orkut). Telefones celulares se tornam comuns, mas 'smartphones' ainda são rudimentares. A cultura pop é globalizada pela MTV e pelo início do compartilhamento de arquivos. Carreiras em TI e web design começam a florescer.`;
    }
    if (year < 2031) {
        return `Era das Redes Sociais (2011-2030): Smartphones e redes sociais (Facebook, Instagram, TikTok) dominam a vida cotidiana. A 'Gig Economy' (Uber, iFood) surge. A informação é instantânea, mas a desinformação (fake news) é um grande problema. Debates sobre privacidade de dados, saúde mental digital e 'cancelamento' são comuns. Profissões como 'Influenciador Digital' e 'Cientista de Dados' são proeminentes.`;
    }
    return `Era da IA e Biotecnologia (2031+): A Inteligência Artificial está integrada em muitos aspectos da vida, desde assistentes domésticos a automação de empregos. A biotecnologia avança, oferecendo curas para doenças genéticas, mas também gerando debates éticos sobre 'bebês projetados'. A mudança climática é uma realidade inescapável, influenciando políticas e estilos de vida.`;
}

const relationshipTypeSchema = {
    type: Type.STRING,
    enum: Object.values(RelationshipType),
};

const memoryItemTypeSchema = {
    type: Type.STRING,
    enum: Object.values(MemoryItemType),
};

const traitSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        type: { type: Type.STRING, enum: ['positive', 'negative'] },
        level: { type: Type.INTEGER, description: "Opcional. O nível do traço, indicando sua força. Use para traços que podem evoluir." }
    },
    required: ['name', 'description', 'type']
};

const statChangesSchema = {
    type: Type.OBJECT,
    properties: {
        health: { type: Type.INTEGER, description: "Mudança na saúde. Geralmente um valor pequeno, como -10 a 10." },
        intelligence: { type: Type.INTEGER, description: "Mudança na inteligência. Geralmente um valor pequeno, como 1 a 5." },
        charisma: { type: Type.INTEGER, description: "Mudança no carisma. Geralmente um valor pequeno, como 1 a 5." },
        creativity: { type: Type.INTEGER, description: "Mudança na criatividade. Geralmente um valor pequeno, como 1 a 5." },
        discipline: { type: Type.INTEGER, description: "Mudança na disciplina. Geralmente um valor pequeno, como 1 a 5." },
        happiness: { type: Type.INTEGER, description: "Mudança na felicidade (0-100). Influenciada por socialização, lazer, conquistas. Baixa felicidade aumenta o estresse." },
        energy: { type: Type.INTEGER, description: "Mudança na energia (0-100). Consumida por trabalho, estresse. Restaurada com descanso. Baixa energia afeta a saúde." },
        stress: { type: Type.INTEGER, description: "Mudança no estresse (0-100). Aumentado por trabalho, problemas. Diminuído por lazer. Alto estresse afeta negativamente saúde e felicidade." },
        luck: { type: Type.INTEGER, description: "Mudança na sorte (0-100). Stat base que influencia resultados. Mude APENAS em eventos épicos ou sobrenaturais." },
        jobSatisfaction: { type: Type.INTEGER, description: "Mudança na satisfação com o trabalho (0-100). Afetada por eventos de carreira. Baixa satisfação aumenta estresse." },
        wealth: { type: Type.INTEGER, description: "Mudança na riqueza. Aderir ESTRITAMENTE a estas regras: Eventos comuns: -500 a +1,000. Promoções/bônus de carreira: +500 a +50,000. Eventos de sorte GRANDE (ganhar loteria, herança): +100,000 a +2,000,000. Eventos ÉPICOS que mudam a vida (vender patente, achar tesouro): MÁXIMO de +10,000,000. Custo de itens de luxo: -20,000 a -500,000. NUNCA gere valores acima de 8 dígitos." },
        investments: { type: Type.INTEGER, description: "Mudança no valor dos investimentos. Use valores realistas, geralmente na casa das centenas ou poucos milhares, no máximo 9 dígitos." },
        morality: { type: Type.INTEGER, description: "Mudança na moralidade (-100 a 100). Ações comuns causam mudanças de -10 a 10." },
        fame: { type: Type.INTEGER, description: "Mudança na fama (-100 a 100). Ações comuns causam mudanças de -5 a 5. Ações Raras/Épicas podem causar até +15, mas use com extrema moderação. Alcançar o topo é uma jornada de uma vida inteira." },
        influence: { type: Type.INTEGER, description: "Mudança na influência (-100 a 100). Ações comuns causam mudanças de -5 a 5. Ações Raras/Épicas podem causar até +15, mas use com extrema moderação. Alcançar o topo é uma jornada de uma vida inteira." },
    },
};

const choiceSchema = {
    type: Type.OBJECT,
    properties: {
        choiceText: { type: Type.STRING, description: "Texto da escolha (máximo 12 palavras)." },
        outcomeText: { type: Type.STRING, description: "Descrição do que acontece após a escolha (máximo 50 palavras)." },
        statChanges: statChangesSchema,
        assetChanges: {
            type: Type.OBJECT,
            properties: {
                add: { type: Type.ARRAY, items: { type: Type.STRING } },
                remove: { type: Type.ARRAY, items: { type: Type.STRING } },
            }
        },
        relationshipChanges: {
            type: Type.OBJECT,
            properties: {
                add: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            type: relationshipTypeSchema,
                            intimacy: { type: Type.INTEGER },
                            history: { type: Type.ARRAY, items: {type: Type.STRING } },
                        },
                        required: ['name', 'type', 'intimacy', 'history']
                    }
                },
                update: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING, description: "Nome EXATO do relacionamento a ser atualizado." },
                            intimacyChange: { type: Type.INTEGER },
                        },
                        required: ['name', 'intimacyChange']
                    }
                },
                remove: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING, description: "Nome EXATO do relacionamento a ser removido." }
                },
                updateHistory: {
                     type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING, description: "Nome EXATO do relacionamento para adicionar ao histórico." },
                            memory: { type: Type.STRING, description: "Uma breve memória da interação (máximo 20 palavras)." },
                        },
                        required: ['name', 'memory']
                    }
                }
            }
        },
        careerChange: {
            type: Type.OBJECT,
            properties: {
                profession: { type: Type.STRING, description: "Nova profissão. Use uma string vazia '' para desempregado." },
                jobTitle: { type: Type.STRING, description: "Novo cargo." },
                levelChange: { type: Type.INTEGER, description: "Mudança no nível da carreira." },
            },
        },
        memoryGained: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                type: memoryItemTypeSchema,
            },
        },
        traitChanges: {
            type: Type.OBJECT,
            properties: {
                add: { type: Type.ARRAY, items: traitSchema, description: "Adiciona um novo traço que o personagem não possui. USE COM MUITA MODERAÇÃO." },
                remove: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Remove um traço pelo seu nome exato." },
                update: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING, description: "Nome EXATO do traço existente a ser evoluído." },
                            levelChange: { type: Type.INTEGER, description: "A mudança no nível do traço (ex: 1 para subir de nível)." },
                            description: { type: Type.STRING, description: "Opcional. Uma nova descrição para o traço evoluído." }
                        },
                        required: ['name', 'levelChange']
                    },
                    description: "Evolui um traço existente em vez de adicionar um novo. PREFIRA ISTO."
                }
            },
        },
        healthConditionChange: {
            type: Type.STRING,
            description: "Nome de uma nova condição de saúde adquirida. Use null se uma condição foi curada.",
        },
        goalChanges: {
            type: Type.OBJECT,
            properties: {
                add: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Adiciona um novo objetivo de vida." },
                complete: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Marca um objetivo de vida existente como completo pelo seu nome exato." },
            },
        },
        craftedItemChanges: {
            type: Type.OBJECT,
            properties: {
                add: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            description: { type: Type.STRING },
                        },
                        required: ['name', 'description']
                    }
                },
                remove: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
        },
        skillChanges: {
            type: Type.OBJECT,
            properties: {
                add: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                           name: { type: Type.STRING, description: "Nome da nova habilidade (ex: 'Boxe', 'Programação')." },
                           level: { type: Type.INTEGER },
                           description: { type: Type.STRING, description: "Descrição do nível da habilidade (ex: 'Iniciante')." },
                        },
                        required: ['name', 'level', 'description']
                    }
                },
                update: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                           name: { type: Type.STRING, description: "Nome EXATO da habilidade a ser atualizada." },
                           levelChange: { type: Type.INTEGER },
                           description: { type: Type.STRING, description: "Nova descrição do nível (ex: 'Amador')." },
                           newName: { type: Type.STRING, description: "Opcional. Use para EVOLUIR a habilidade para um nome mais avançado (ex: de 'Radioamadorismo' para 'Engenharia de Rádio')." }
                        },
                        required: ['name', 'levelChange']
                    }
                }
            }
       },
        specialEnding: {
            type: Type.STRING,
            description: "CRÍTICO: Use este campo SOMENTE se a escolha resultar na MORTE IMEDIATA do personagem ou em um evento que encerre sua vida ativa de forma definitiva (ex: prisão perpétua). A descrição deve ser o resumo final da vida. NÃO use para grandes conquistas que não terminem a vida."
        },
        timeCostInUnits: { type: Type.INTEGER, description: "Custo em meses (1-12). Padrão é 1 se não especificado." },
        locationChange: { type: Type.STRING, description: "A nova cidade/localização para onde o personagem se mudou. Use APENAS se a escolha resultar em uma MUDANÇA PERMANENTE de residência. Não use para viagens curtas." },
    },
    required: ['choiceText', 'outcomeText', 'statChanges'],
};

const eventSchema = {
  type: Type.OBJECT,
  properties: {
    eventText: { type: Type.STRING, description: "Descrição do evento principal (máximo 60 palavras)." },
    choices: { type: Type.ARRAY, items: choiceSchema },
    isEpic: { type: Type.BOOLEAN, description: "Este é um evento raro e impactante?" },
    isWorldEvent: { type: Type.BOOLEAN, description: "Este é um evento global que afeta a todos?" },
    type: { type: Type.STRING, enum: ['MULTIPLE_CHOICE', 'OPEN_RESPONSE', 'MINI_GAME'], description: "Tipo de evento. Use OPEN_RESPONSE para que o jogador escreva sua ação." },
    placeholderText: { type: Type.STRING, description: "Texto de exemplo para a caixa de resposta aberta." },
    miniGameType: { type: Type.STRING, enum: Object.values(MiniGameType), description: "Se o tipo for MINI_GAME, especifique qual." },
    miniGameData: {
        type: Type.OBJECT,
        description: "Dados para o minijogo (ex: opções de investimento). Obrigatório para tipos de investimento.",
        properties: {
            options: {
                type: Type.ARRAY,
                description: "Lista de opções para o minijogo, tipicamente para jogos de investimento.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        riskLevel: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
                        potentialReturnMultiplier: { type: Type.NUMBER, description: "Ex: 1.5 para 50% de lucro." },
                        failureLossMultiplier: { type: Type.NUMBER, description: "Ex: 0.5 para 50% de perda." },
                    },
                    required: ['name', 'description', 'riskLevel', 'potentialReturnMultiplier', 'failureLossMultiplier']
                }
            }
        }
    },
    timeCostInUnits: { type: Type.INTEGER, description: "Custo base em meses (1-12) para o evento. Padrão é 1." },
  },
  required: ['eventText', 'type'],
};

const evaluateResponseSchema = choiceSchema;

const getBaseSystemPrompt = (isTurbo: boolean): string => {
    const commonRules = `
1.  **Crie Eventos Realistas e Interessantes**: Gere eventos críveis baseados na idade, traços, carreira e contexto histórico/geográfico do personagem. Evite clichês. Surpreenda o jogador.
2.  **Equilíbrio e Risco**: O jogo deve ser desafiador. As escolhas devem ter consequências lógicas, com um equilíbrio realista entre sucesso, fracasso e resultados mistos. Uma grande recompensa DEVE vir com um grande risco. Ações de alto risco (como atividades ilegais, confrontos diretos, investimentos ousados) devem ter uma chance significativa de falha com consequências severas (perda de riqueza, saúde, reputação, ou até mesmo a morte em casos extremos com 'specialEnding'). Nem toda ação bem-sucedida é um sucesso completo; introduza trade-offs.
3.  **Economia de Traços e Raridade (REGRA CRÍTICA)**: Traços são a essência da personalidade e devem ser raros e significativos. NÃO adicione um novo traço a cada pequena decisão.
    - **Seja Seletivo**: Conceda um novo traço SOMENTE quando uma escolha, evento ou experiência for REALMENTE marcante e representar uma transformação significativa.
    - **Qualidade, Não Quantidade**: Um personagem jovem adulto (18-25 anos) deve ter no máximo entre 3 a 7 traços definidores. Evite listas extensas que diluem o impacto.
    - **Evolua, Não Acumule**: Antes de adicionar um novo traço, verifique os existentes. Se um evento reforça um traço que o personagem já possui (ex: um ato corajoso para alguém com o traço 'Corajoso'), use 'traitChanges.update' para aumentar o 'level' desse traço em vez de adicionar um novo. A evolução é preferível à acumulação.
4.  **Novas Mecânicas Vitais (Felicidade, Energia, Estresse)**: Estas três estatísticas são interligadas.
    - **Estresse Alto (>75)** DEVE causar uma perda passiva de **Felicidade** e **Energia**. Gere eventos de 'burnout' ou problemas de saúde.
    - **Felicidade Baixa (<25)** DEVE aumentar o **Estresse** e gerar eventos de depressão ou apatia.
    - **Energia Baixa (<25)** DEVE reduzir a eficácia no trabalho (menores ganhos de 'careerLevel') e na disciplina, e pode causar pequenos problemas de saúde.
    - **Equilíbrio é Chave**: Focar excessivamente em 'Carreira' deve aumentar o **Estresse** e diminuir a **Energia** e **Felicidade**. Focar em 'Lazer' ou 'Vida Social' deve fazer o oposto. Suas escolhas DEVEM refletir esses trade-offs.
5.  **Sorte**: A sorte do personagem influencia a probabilidade de resultados positivos. Um personagem com 'luck' alta pode ter sucesso onde outros falhariam. Você raramente deve alterar o valor da 'luck'; isso só deve acontecer em eventos que mudam a vida.
6.  **Satisfação Profissional**: Este stat reflete a felicidade do personagem com sua carreira. Promoções e projetos bem-sucedidos a aumentam. Conflitos e estagnação a diminuem. Baixa satisfação (<30) é uma fonte primária de **Estresse** e deve levar a eventos onde o personagem contempla mudar de emprego.
7.  **Economia de Atributos e Retornos Decrescentes**: As mudanças de atributos DEVEM ser equilibradas com trade-offs e a progressão DEVE ser difícil. Aumentar um atributo que já está alto é EXTREMAMENTE difícil. Regra geral: acima de 75, os ganhos são drasticamente reduzidos (raramente mais que +1). Acima de 90, os ganhos são quase impossíveis (apenas +1 para eventos 'isEpic').
8.  **Contexto Histórico e Geográfico é CRUCIAL**: Use o "Zeitgeist" e a 'currentLocation' para moldar o evento. Eventos na década de 1980 em São Paulo não devem envolver smartphones. Eventos em uma fazenda no interior são diferentes de eventos em uma metrópole.
9.  **Consolidação e Evolução de Habilidades (REGRA CRÍTICA)**: Em vez de criar habilidades redundantes (ex: 'Radioamadorismo' e 'Engenharia de Rádio'), evolua a habilidade existente. Use 'skillChanges.update' para aumentar o nível. Em um evento transformador, use 'newName' para evoluir o nome da habilidade para algo mais avançado, refletindo maestria (ex: 'Radioamadorismo' se torna 'Engenharia de Rádio'). Use o campo 'skillChanges' para adicionar ou evoluir essas habilidades.
10. **Mini-Jogos Temáticos de Era**: Para aumentar a imersão histórica, você DEVE gerar mini-jogos específicos da era para certos eventos. Para QUALQUER mini-jogo de investimento, o campo 'miniGameData' com um array de 'options' é **OBRIGATÓRIO**.
11. **Fama e Influência são Conquistas de Fim de Jogo (REGRA CRÍTICA)**: Esses atributos devem crescer MUITO lentamente.
    - **Escala de Poder**: Valores entre 25-50 significam reconhecimento local ou regional. 50-75 é fama nacional. Acima de 80 é para ícones globais, algo que um personagem jovem raramente (ou nunca) deveria alcançar.
    - **Ganhos Mínimos**: Gere pequenos ganhos (+1 a +3) para a maioria dos eventos. Ganhos maiores (+10 ou mais) devem ser reservados para eventos 'isEpic' que definem uma vida e que só acontecem algumas vezes por geração.
12. **Imersão Total - Sem Placeholders (REGRA CRÍTICA)**: Para manter a imersão, é ESTRITAMENTE PROIBIDO o uso de placeholders ou textos genéricos como '[Nome]', '[Nome do Deputado]', '[Amigo]', '[Empresa]', etc. Você DEVE inventar nomes específicos, concretos e criativos para todas as pessoas, lugares e organizações. Por exemplo, em vez de 'um político chamado [Nome]', crie 'o vereador Jonas Medeiros'. Em vez de 'uma empresa de tecnologia', crie 'a startup InovaTech'.
13. **Formato JSON**: RESPONDA APENAS com um objeto JSON VÁLIDO que corresponda ao schema fornecido. SEM TEXTO EXTRA, SEM EXPLICAÇÕES, APENAS O JSON.
`;

    if (isTurbo) {
        return `
Você é o Mestre do Jogo (GM) para "LifeSim MMORG". Seu papel é criar eventos de vida realistas, desafiadores e envolventes.

**MODO RÁPIDO E BALANCEADO:** A "temperatura" da IA está ajustada para consistência (0.8). O objetivo é criar um evento **narrativo e rápido**, mantendo a imersão.
- **Narração Vívida e Detalhada:** Descreva o evento com detalhes interessantes e atmosféricos. As escolhas devem ser claras e diretas.
- **Contexto Histórico Evocativo:** Use o 'Zeitgeist' para dar cor ao evento.
- **Mantenha o Desafio e o Foco:** O equilíbrio do jogo é vital. Continue aplicando as regras de **Equilíbrio e Risco** e **Economia de Atributos**.

${commonRules}
`;
    }

    return `
Você é o Mestre do Jogo (GM) para "LifeSim MMORG", um simulador de vida roguelite. Seu papel é criar eventos de vida realistas, desafiadores e envolventes.

**MODO AVANÇADO E CRIATIVO:** A "temperatura" da IA está no máximo (1.0). Use essa liberdade para criar eventos e consequências mais diversos, inesperados e criativos. Surpreenda o jogador.

REGRAS PRINCIPAIS:
${commonRules}
`;
};

export const generateGameEvent = async (
    character: Character, 
    lifeStage: LifeStage, 
    year: number, 
    economicClimate: EconomicClimate, 
    lineageTitle: string | null, 
    currentFocus: string | null,
    behaviorTracker: Record<string, number>,
    isTurbo: boolean,
    apiKey: string,
): Promise<GameEvent> => {
    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = getBaseSystemPrompt(isTurbo);
    
    // Simplificar o personagem para o prompt
    const characterSummary = {
        name: character.name,
        generation: character.generation,
        age: character.age,
        vitals: {
            health: character.health,
            happiness: character.happiness,
            energy: character.energy,
            stress: character.stress,
            luck: character.luck,
        },
        stats: {
            intelligence: character.intelligence,
            charisma: character.charisma,
            creativity: character.creativity,
            discipline: character.discipline,
        },
        financials: {
            wealth: character.wealth,
            investments: character.investments,
        },
        social: {
            morality: character.morality,
            fame: character.fame,
            influence: character.influence,
        },
        location: character.currentLocation,
        background: character.familyBackground,
        traits: character.traits.map(t => t.name),
        career: {
            profession: character.profession,
            jobTitle: character.jobTitle,
            careerLevel: character.careerLevel,
            jobSatisfaction: character.jobSatisfaction,
        },
        relationships: character.relationships.map(r => ({ name: r.name, type: r.type, intimacy: r.intimacy })),
        lifeGoals: character.lifeGoals,
        skills: character.skills.map(s => s.name),
    };

    // Lógica para determinar o tipo de evento
    const successScore = ((character.wealth + character.investments) / 10000) + 
                         (character.intelligence + character.charisma + character.creativity + character.discipline) / 3 + 
                         character.fame + 
                         character.influence;

    const temptationRoll = Math.random();
    const globalEventRoll = Math.random();
    const bossRoll = Math.random();
    let eventTypePrompt = '';

    if (successScore > 200 && temptationRoll < 0.20) { // 20% de chance se a pontuação for alta
        eventTypePrompt = `
            Este é um evento de 'Auto-Sabotagem'. O personagem está indo MUITO BEM. Crie uma tentação de alto risco e alta recompensa que pode levar a um sucesso espetacular ou a uma ruína total. O evento deve ser 'isEpic: true'.
        `;
    } else if (globalEventRoll < 0.05) { // 5% de chance de um evento mundial bizarro
        eventTypePrompt = `
            Este é um 'Evento Global Absurdo'. Uma moda ou tendência bizarra está varrendo o mundo, influenciada pelo Zeitgeist atual. O evento deve ser 'isWorldEvent: true'.
        `;
    } else if (bossRoll < 0.10) { // 10% de chance de um evento de "chefe"
        eventTypePrompt = `Este é um evento de 'Chefe' - um grande ponto de virada na vida. Use este cenário: ${getBossBattlePrompt(lifeStage)}`;
    } else {
        eventTypePrompt = `Gere um evento de vida comum baseado nos focos atuais do personagem: "${currentFocus || 'vida cotidiana'}". O evento deve estar relacionado a um ou mais desses focos.`;
    }
    
    const content = `
        **Informações do Jogo:**
        - Ano Atual: ${year}
        - Zeitgeist (Contexto Histórico): ${getZeitgeist(year)}
        - Clima Econômico: ${economicClimate}
        - Título da Linhagem: ${lineageTitle || 'Nenhum'}
        - Foco Atual do Personagem: ${currentFocus || 'Nenhum foco específico, gere um evento geral da vida.'}
        - Estágio da Vida: ${lifeStage}

        **Dados do Personagem:**
        ${JSON.stringify(characterSummary, null, 2)}

        **Tarefa:**
        ${eventTypePrompt}
        Crie um evento JSON com base em todas as informações fornecidas. O evento deve ser uma consequência ou desenvolvimento natural dos focos escolhidos pelo personagem.
        As escolhas devem ser distintas e ter consequências lógicas.
        Lembre-se das regras principais, especialmente o contexto histórico, a evolução da personalidade e o formato de resposta JSON.
    `;
    
    const config: any = {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: eventSchema,
    };

    if (isTurbo) {
        config.thinkingConfig = { thinkingBudget: 0 };
        config.temperature = 0.8;
    } else {
        config.temperature = 1.0;
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: content,
        config: config,
    });

    const eventData = cleanAndParseJson<GameEvent>(response.text);
    return eventData;
};

export const evaluatePlayerResponse = async (
    character: Character, 
    eventText: string, 
    playerResponse: string,
    currentFocus: string | null,
    apiKey: string,
    isTurbo: boolean,
): Promise<Choice> => {
     const ai = new GoogleGenAI({ apiKey });
     
     const systemPrompt = `
        Você é um Mestre de Jogo (GM) para "LifeSim MMORG". O jogador descreveu uma ação em texto livre. Sua tarefa é traduzir essa ação em uma escolha estruturada em JSON, seguindo o schema.

        REGRAS:
        1.  **Interprete a Intenção**: Entenda o que o jogador quer alcançar com a resposta dele.
        2.  **Seja Justo, Realista e Desafiador**: As consequências devem ser lógicas e equilibradas. Ações ousadas DEVEM ter uma chance significativa de falha. Não tenha medo de aplicar consequências negativas. O sucesso não deve ser garantido.
        3.  **Consequências Equilibradas e Realistas (REGRA CRÍTICA)**: Siga RÍGIDAMENTE as regras de Retornos Decrescentes e Trade-offs, e a interação entre os novos status (Felicidade, Energia, Estresse).
        4.  **Use o Contexto**: Baseie as consequências no personagem (estatísticas, traços, localização atual) e no evento.
        5.  **Evolução da Personalidade**: Se a ação do jogador for um forte indicador de um traço de personalidade, use 'traitChanges' para refletir isso.
        6.  **Imersão Total - Sem Placeholders (REGRA CRÍTICA)**: Ao criar novos personagens ou locais como parte do resultado, DÊ um nome específico e criativo. NÃO use placeholders como '[Nome do Amigo]' ou '[Nome da Cidade]'.
        7.  **Formato JSON Estrito**: Responda APENAS com o objeto JSON da escolha. Sem texto extra.
        ${isTurbo ? `
        **MODO RÁPIDO E BALANCEADO:** Temperatura baixa (0.8).
        - **Resultado Narrativo e Rápido:** O 'outcomeText' deve ser gerado rapidamente, mas ainda assim descrever a consequência da ação de forma vívida e interessante.
        - **Mantenha as Consequências:** Continue aplicando as regras de **Consequências Equilibradas** e **Retornos Decrescentes**. Ações arriscadas devem ter chance de falha.
        ` : `**MODO AVANÇADO E CRIATIVO:** Temperatura alta (1.0). Crie um resultado criativo e surpreendente para a ação do jogador, mantendo a lógica do personagem e do mundo.`}
     `;

     const content = `
        **Contexto do Evento:** "${eventText}"

        **Dados do Personagem:**
        - Idade: ${character.age}
        - Traços: ${character.traits.map(t => t.name).join(', ')}
        - Vitals: Felicidade(${character.happiness}), Energia(${character.energy}), Estresse(${character.stress}), Sorte(${character.luck})
        - Estatísticas Chave: Inteligência(${character.intelligence}), Carisma(${character.charisma}), Disciplina(${character.discipline})
        - Moralidade: ${character.morality}
        - Localização Atual: ${character.currentLocation}
        - Focos Atuais: ${currentFocus || 'Não especificado'}

        **Ação do Jogador:** "${playerResponse}"

        **Sua Tarefa:**
        Crie um objeto JSON 'Choice' que represente o resultado da ação do jogador.
        - 'choiceText' deve ser um resumo da ação do jogador (ex: "Tenta persuadir o guarda").
        - 'outcomeText' deve descrever o que acontece como resultado.
        - 'statChanges' e outros campos devem refletir as consequências.
     `;

    const config: any = {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: evaluateResponseSchema,
    };

    if (isTurbo) {
        config.thinkingConfig = { thinkingBudget: 0 };
        config.temperature = 0.8;
    } else {
        config.temperature = 1.0;
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: content,
        config: config,
    });

    return cleanAndParseJson<Choice>(response.text);
};