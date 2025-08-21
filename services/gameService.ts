
import { GoogleGenAI, Type } from "@google/genai";
import { Character, LifeStage, GameEvent, RelationshipType, MemoryItemType, Trait, EconomicClimate, Choice, MiniGameType, Mood, HobbyType } from '../types';

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
    
    // Sanitize extremely large numbers that might break JSON.parse.
    // It looks for a number (positive or negative) with 16 or more digits and caps it to MAX_SAFE_INTEGER.
    jsonText = jsonText.replace(/:(\s*)(-?\d{16,})/g, (match, space, number) => {
        const isNegative = number.startsWith('-');
        console.warn(`Número grande detectado da API e limitado: ${number}`);
        const cappedNumber = isNegative ? '-9007199254740991' : '9007199254740991'; // Number.MAX_SAFE_INTEGER
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

const moodTypeSchema = {
    type: Type.STRING,
    enum: Object.values(Mood),
};

const hobbyTypeSchema = {
    type: Type.STRING,
    enum: Object.values(HobbyType),
}

const traitSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        type: { type: Type.STRING, enum: ['positive', 'negative'] },
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
        wealth: { type: Type.INTEGER, description: "Mudança na riqueza. Pode ser negativo (custo). Para eventos normais, use valores entre -500 e 500. Para eventos de grande impacto financeiro, o valor pode chegar a 50000, mas NUNCA use números com mais de 9 dígitos. Números muito grandes quebram o jogo." },
        investments: { type: Type.INTEGER, description: "Mudança no valor dos investimentos. Use valores realistas, geralmente na casa das centenas ou poucos milhares, no máximo 9 dígitos." },
        morality: { type: Type.INTEGER, description: "Mudança na moralidade (-100 a 100). Ações comuns causam mudanças de -10 a 10." },
        fame: { type: Type.INTEGER, description: "Mudança na fama (-100 a 100). Ações comuns causam mudanças de -10 a 10." },
        influence: { type: Type.INTEGER, description: "Mudança na influência (-100 a 100). Ações comuns causam mudanças de -10 a 10." },
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
                add: { type: Type.ARRAY, items: traitSchema, description: "Adiciona um novo traço que o personagem não possui." },
                remove: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Remove um traço pelo seu nome exato." },
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
        hobbyChanges: {
             type: Type.OBJECT,
             properties: {
                 add: {
                     type: Type.ARRAY,
                     items: {
                         type: Type.OBJECT,
                         properties: {
                            type: hobbyTypeSchema,
                            level: { type: Type.INTEGER },
                            description: { type: Type.STRING },
                         },
                         required: ['type', 'level', 'description']
                     }
                 },
                 update: {
                     type: Type.ARRAY,
                     items: {
                         type: Type.OBJECT,
                         properties: {
                            type: hobbyTypeSchema,
                            levelChange: { type: Type.INTEGER },
                            description: { type: Type.STRING },
                         },
                         required: ['type', 'levelChange']
                     }
                 }
             }
        },
        moodChange: moodTypeSchema,
        specialEnding: {
            type: Type.STRING,
            description: "Se a escolha levar a um final de vida imediato e único (bom ou ruim), descreva-o aqui. Isso encerrará o jogo."
        },
        timeCostInUnits: { type: Type.INTEGER, description: "Custo em meses (1-12). Padrão é 1 se não especificado." },
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
1.  **Crie Eventos Realistas e Interessantes**: Gere eventos críveis baseados na idade, traços, carreira e contexto histórico do personagem. Evite clichês. Surpreenda o jogador.
2.  **Equilíbrio e Risco**: O jogo deve ser desafiador. As escolhas devem ter consequências lógicas, com um equilíbrio realista entre sucesso, fracasso e resultados mistos. Uma grande recompensa DEVE vir com um grande risco. Ações de alto risco (como atividades ilegais, confrontos diretos, investimentos ousados) devem ter uma chance significativa de falha com consequências severas (perda de riqueza, saúde, reputação, ou até mesmo a morte em casos extremos com 'specialEnding'). Nem toda ação bem-sucedida é um sucesso completo; introduza trade-offs. Exemplo: um hacker pode conseguir a informação, mas pegar um vírus que reduz sua 'intelligence' ou alerta as autoridades, impactando sua 'fame' negativamente.
3.  **Economia de Atributos e Retornos Decrescentes**: As mudanças de atributos DEVEM ser equilibradas com trade-offs. Um ganho significativo em um atributo deve, frequentemente, ter um pequeno custo em outro. Exemplos: trabalho intenso (+disciplina) deve diminuir a saúde (-saúde). Uma festa agitada (+carisma) deve diminuir a disciplina (-disciplina). Além disso, a progressão DEVE desacelerar. É muito mais difícil aumentar um atributo que já está alto (acima de 70). Para um personagem com 80 de inteligência, um evento de estudo bem-sucedido pode conceder apenas +1 de inteligência, não +5. Personagens com atributos baixos podem melhorar mais rapidamente.
4.  **Contexto Histórico é CRUCIAL**: Use o "Zeitgeist" para moldar o evento. Eventos na década de 1980 não devem envolver smartphones. Eventos na década de 2020 podem envolver mídias sociais ou a economia de aplicativos.
5.  **Personalidade Evolutiva**: Uma parte crucial desta simulação é a **Personalidade Evolutiva**. Com base no evento e na escolha do jogador, você DEVE considerar adicionar ou remover traços do personagem para refletir seu desenvolvimento. Um personagem que repetidamente escolhe ações corajosas pode ganhar o traço 'Corajoso'. Uma traição significativa pode torná-los 'Cínico'. Um invento de sucesso pode conceder 'Visionário'. Use o campo 'traitChanges' com os arrays 'add' e 'remove' para isso. Traços não são permanentes e devem refletir a jornada do personagem.
6.  **Mini-Jogos Temáticos de Era**: Para aumentar a imersão histórica, você DEVE gerar mini-jogos específicos da era para certos eventos.
    - **Era das Luzes (1700-1820)**: Para disputas intelectuais, acione 'PUBLIC_DEBATE'.
    - **Era Industrial e Romântica (1820-1870)**: Para disputas de honra, acione 'PISTOL_DUEL'.
    - **Era dos Impérios (1870-1899)**: Para oportunidades financeiras na segunda revolução industrial, acione 'STOCK_MARKET_SPECULATION' (que usa a mecânica de 'INVESTMENT'). Forneça opções como 'Ferrovias', 'Aço', 'Telégrafo'.
    - **Era das Grandes Guerras (1900-1929)**: Durante a Lei Seca (Prohibition), para eventos de crime ou oportunidade, acione 'SPEAKEASY_SMUGGLING'.
    - **Era da Incerteza (1930-1945)**: Em tempos de crise e guerra, para dilemas morais sobre recursos, acione 'BLACK_MARKET_TRADING'.
    - **Era Atômica (1946-1979)**: Para temas de Guerra Fria e intriga, acione 'COLD_WAR_ESPIONAGE'.
    - **Era Analógica Tardia (1980-1995)**: Com o advento dos computadores pessoais, para oportunidades de negócio, acione 'GARAGE_STARTUP'.
    - **Era da Internet Pioneira (1996-2010)**: Durante a bolha da internet, para investimentos de alto risco, acione 'DOTCOM_DAY_TRADING' (que usa a mecânica de 'INVESTMENT'). Forneça opções como 'PetShop.com', 'Webvan', 'GeoCities'.
    - **Era das Redes Sociais (2011-2030)**: Para temas de fama online, acione 'VIRAL_CONTENT_CHALLENGE'.
    - **Era da IA e Biotecnologia (2031+)**: Para grandes dilemas éticos sobre tecnologia, acione 'GENETIC_EDITING_DILEMMA'.
    - Ao gerar um mini-jogo, defina o 'type' do evento como 'MINI_GAME' e forneça o 'miniGameType' correspondente. O 'eventText' deve preparar o cenário para o mini-jogo.
7.  **Progressão de Vida**: Crie eventos que permitam o crescimento. O personagem deve ter oportunidades de mudar de carreira, formar relacionamentos, desenvolver hobbies e perseguir objetivos de vida.
8.  **Consistência**: Mantenha a consistência com os detalhes do personagem. Um personagem com baixa inteligência não deve, de repente, resolver uma equação complexa.
9.  **Formato JSON**: RESPONDA APENAS com um objeto JSON VÁLIDO que corresponda ao schema fornecido. SEM TEXTO EXTRA, SEM EXPLICAÇÕES, APENAS O JSON.
`;

    if (isTurbo) {
        return `
Você é o Mestre do Jogo (GM) para "LifeSim MMORG". Seu papel é criar eventos de vida realistas, desafiadores e envolventes.

**MODO TURBO ATIVADO (REGRAS ESPECIAIS):**
Seu objetivo é criar um evento **impactante e rápido**.
- **Mantenha o Desafio:** Mesmo no modo turbo, o equilíbrio é vital. Aplique as regras de **Equilíbrio e Risco** e **Economia de Atributos**. As ações devem ter consequências reais e a progressão não deve ser fácil.
- **Foque no Essencial:** Cada escolha deve ter de 1 a 3 consequências claras (mudanças de status, um novo traço, uma mudança de relacionamento). Evite resultados excessivamente complexos.
- **Textos Concisos:** Mantenha o texto do evento e das escolhas diretos e curtos (máximo 40 palavras para o evento, 10 para as escolhas).
- **Contexto Simplificado:** Use o 'Zeitgeist' para dar sabor, mas não precisa criar eventos de nicho histórico profundo.

${commonRules}
`;
    }

    return `
Você é o Mestre do Jogo (GM) para "LifeSim MMORG", um simulador de vida roguelite. Seu papel é criar eventos de vida realistas, desafiadores e envolventes.

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
        health: character.health,
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
        mood: character.mood,
        background: character.familyBackground,
        traits: character.traits.map(t => t.name),
        profession: character.profession,
        jobTitle: character.jobTitle,
        careerLevel: character.careerLevel,
        relationships: character.relationships.map(r => ({ name: r.name, type: r.type, intimacy: r.intimacy })),
        lifeGoals: character.lifeGoals,
        hobbies: character.hobbies.map(h => h.type),
    };

    const isBoss = Math.random() < 0.10; // 10% de chance de um evento "chefe"
    const eventTypePrompt = isBoss
        ? `Este é um evento de 'Chefe' - um grande ponto de virada na vida. Use este cenário: ${getBossBattlePrompt(lifeStage)}`
        : `Gere um evento de vida comum baseado nos focos atuais do personagem: "${currentFocus || 'vida cotidiana'}". O evento deve estar relacionado a um ou mais desses focos.`;
    
    const content = `
        **Informações do Jogo:**
        - Ano Atual: ${year}
        - Zeitgeist (Contexto Histórico): ${getZeitgeist(year)}
        - Clima Econômico: ${economicClimate}
        - Título da Linhagem: ${lineageTitle || 'Nenhum'}
        - Foco Atual do Personagem: ${currentFocus || 'Nenhum foco específico, gere um evento geral da vida.'}
        - Estágio da Vida: ${lifeStage}
        - Comportamentos Recentes (contagem de ações): ${JSON.stringify(behaviorTracker)}

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
        2.  **Seja Justo, Realista e Desafiador**: As consequências devem ser lógicas e equilibradas. Ações ousadas DEVEM ter uma chance significativa de falha. Não tenha medo de aplicar consequências negativas. Se um jogador tenta algo ilegal, como hackear, pode ser pego, pegar um vírus (reduzir 'intelligence') ou ter sua 'fame' manchada. Se ele tenta persuadir alguém e tem baixo carisma, ele pode ofender a pessoa (piorar relacionamento). O sucesso não deve ser garantido.
        3.  **Consequências Equilibradas**: Aplique o princípio dos trade-offs. Uma ação bem-sucedida que aumenta significativamente um atributo deve ter um custo menor em outro (por exemplo, estudar muito para uma prova pode aumentar a inteligência, mas diminuir levemente a saúde devido ao estresse). Conceda aumentos de atributos menores para personagens que já são altamente qualificados nessa área (retornos decrescentes).
        4.  **Use o Contexto**: Baseie as consequências no personagem (estatísticas, traços) e no evento. Um personagem com alto carisma terá mais sucesso em persuadir alguém.
        5.  **Evolução da Personalidade**: Se a ação do jogador for um forte indicador de um traço de personalidade (ex: um ato de grande coragem, uma mentira descarada), use 'traitChanges' para refletir isso.
        6.  **Formato JSON Estrito**: Responda APENAS com o objeto JSON da escolha. Sem texto extra.
        ${isTurbo ? `
        **MODO TURBO ATIVADO:**
        - Seja rápido e direto. O 'outcomeText' deve ser conciso.
        - **Mantenha as Consequências:** Mesmo rápido, aplique as regras de **Consequências Equilibradas** e **Retornos Decrescentes**. Ações arriscadas devem ter chance de falha.
        ` : ""}
     `;

     const content = `
        **Contexto do Evento:** "${eventText}"

        **Dados do Personagem:**
        - Idade: ${character.age}
        - Traços: ${character.traits.map(t => t.name).join(', ')}
        - Estatísticas Chave: Inteligência(${character.intelligence}), Carisma(${character.charisma}), Disciplina(${character.discipline})
        - Moralidade: ${character.morality}
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
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: content,
        config: config,
    });

    return cleanAndParseJson<Choice>(response.text);
};