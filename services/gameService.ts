import { GoogleGenAI, Type } from "@google/genai";
import { Character, LifeStage, GameEvent, RelationshipType, MemoryItemType, Trait, EconomicClimate, Choice, MiniGameType, Mood, HobbyType } from '../types';


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
    return `Era da IA e Biotecnologia (2031+): A Inteligência Artificial está integrada em muitos aspectos da vida, desde assistentes domésticos a automação de empregos. A biotecnologia permite melhorias genéticas e implantes cibernéticos. Os desafios incluem desemprego tecnológico, dilemas éticos sobre IA e bioengenharia, e possíveis crises ambientais. Novas carreiras podem ser 'Ético de IA', 'Terapeuta de Realidade Virtual' ou 'Engenheiro de Clima'.`;
}

const formatBehaviorTracker = (tracker: Record<string, number>): string => {
    if (Object.keys(tracker).length === 0) return 'Nenhum padrão detectado ainda.';
    const sorted = Object.entries(tracker).sort(([, a], [, b]) => b - a);
    return sorted.map(([key, value]) => `${key}: ${value}`).join(', ');
};

const extractJson = (rawText: string): any => {
    let jsonText = rawText.trim();

    const firstBracket = jsonText.indexOf('{');
    const lastBracket = jsonText.lastIndexOf('}');
    
    if (firstBracket === -1 || lastBracket === -1 || lastBracket < firstBracket) {
         console.error("Could not find a valid JSON object in the raw response:", rawText);
         throw new Error("Response from API was not valid JSON.");
    }

    jsonText = jsonText.substring(firstBracket, lastBracket + 1);
    
    try {
        const data = JSON.parse(jsonText);
        return data;
    } catch(parseError) {
        console.error("Failed to parse extracted JSON:", jsonText);
        throw parseError;
    }
}


const relationshipChangesSchema = {
    type: Type.OBJECT,
    properties: {
        add: {
            type: Type.ARRAY,
            description: 'Uma lista de novos relacionamentos a serem adicionados.',
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: 'O nome da nova pessoa (ex: "Maria", "Dr. Silva").' },
                    type: { type: Type.STRING, enum: Object.values(RelationshipType), description: 'O tipo de relacionamento.' },
                    intimacy: { type: Type.INTEGER, description: 'O nível de intimidade inicial (-100 a 100).' },
                    history: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Um array vazio para o histórico inicial.' }
                },
                required: ['name', 'type', 'intimacy', 'history']
            }
        },
        update: {
            type: Type.ARRAY,
            description: 'Uma lista de relacionamentos existentes para atualizar.',
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: 'O nome da pessoa cujo relacionamento será atualizado.' },
                    intimacyChange: { type: Type.INTEGER, description: 'A mudança no nível de intimidade (ex: 10 para melhorar, -15 para piorar).' }
                },
                required: ['name', 'intimacyChange']
            }
        },
        remove: {
            type: Type.ARRAY,
            description: 'Uma lista de nomes de relacionamentos a serem removidos (em caso de morte, rompimento, etc.).',
            items: { type: Type.STRING }
        },
        updateHistory: {
            type: Type.ARRAY,
            description: "Uma lista de memórias para adicionar ao histórico de um relacionamento.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "O nome da pessoa." },
                    memory: { type: Type.STRING, description: "Uma memória curta e impactante (ex: 'Lembrou do seu aniversário.', 'Teve uma briga feia.')." }
                },
                required: ['name', 'memory']
            }
        }
    },
    required: []
};

const careerChangeSchema = {
    type: Type.OBJECT,
    properties: {
        profession: { type: Type.STRING, description: 'A nova profissão. Se for uma string vazia (""), o personagem fica desempregado.' },
        jobTitle: { type: Type.STRING, description: 'O novo cargo (ex: "Estagiário", "Gerente Sênior").' },
        levelChange: { type: Type.INTEGER, description: 'A mudança no nível de carreira (ex: +10 para uma promoção, -5 para um revés).' }
    },
    required: []
};

const hobbyChangesSchema = {
    type: Type.OBJECT,
    properties: {
        add: {
            type: Type.ARRAY,
            description: 'Uma lista de novos hobbies a serem adicionados.',
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, enum: Object.values(HobbyType), description: 'O tipo de hobby.' },
                    level: { type: Type.INTEGER, description: 'O nível inicial do hobby (geralmente 5 ou 10).' },
                    description: { type: Type.STRING, description: 'Uma breve descrição do status do hobby (ex: "Artista Amador", "Músico Iniciante").' }
                },
                required: ['type', 'level', 'description']
            }
        },
        update: {
            type: Type.ARRAY,
            description: 'Uma lista de hobbies existentes para atualizar.',
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, enum: Object.values(HobbyType), description: 'O tipo de hobby a ser atualizado.' },
                    levelChange: { type: Type.INTEGER, description: 'A mudança no nível do hobby (ex: +5 para melhorar, -2 para piorar).' },
                    description: { type: Type.STRING, description: 'Uma nova descrição que reflete o novo nível de habilidade (opcional).' }
                },
                required: ['type', 'levelChange']
            }
        }
    },
    required: []
};

const memoryGainedSchema = {
    type: Type.OBJECT,
    description: 'Um item de memória colecionável ganho por uma escolha significativa (opcional).',
    properties: {
        name: { type: Type.STRING, description: 'O nome do item de memória (ex: "Diploma de Engenharia", "Foto do Casamento", "Primeiro Troféu de Natação").' },
        description: { type: Type.STRING, description: 'Uma breve história ou legenda para o item, descrevendo seu significado.' },
        type: { type: Type.STRING, enum: Object.values(MemoryItemType), description: 'O tipo de item de memória.' }
    },
    required: ['name', 'description', 'type']
};

const traitChangesSchema = {
    type: Type.OBJECT,
    properties: {
        add: {
            type: Type.ARRAY,
            description: 'Uma lista de novos traços a serem adicionados (positivos para superação, negativos para sequelas).',
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Nome do traço (ex: 'Sobrevivente', 'Saúde Frágil')." },
                    description: { type: Type.STRING, description: "Descrição do traço." },
                    type: { type: Type.STRING, enum: ['positive', 'negative'], description: "Tipo do traço." }
                },
                required: ['name', 'description', 'type']
            }
        },
        remove: {
            type: Type.ARRAY,
            description: 'Uma lista de nomes de traços a serem removidos.',
            items: { type: Type.STRING }
        }
    },
    required: []
};

const goalChangesSchema = {
    type: Type.OBJECT,
    properties: {
        add: {
            type: Type.ARRAY,
            description: 'Uma lista de novas descrições de objetivos de vida a serem adicionados.',
            items: { type: Type.STRING }
        },
        complete: {
            type: Type.ARRAY,
            description: 'Uma lista de descrições de objetivos de vida existentes que foram concluídos.',
            items: { type: Type.STRING }
        }
    },
    required: []
};

const craftedItemChangesSchema = {
    type: Type.OBJECT,
    properties: {
        add: {
            type: Type.ARRAY,
            description: 'Uma lista de novos itens narrativos a serem criados e adicionados ao inventário.',
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Nome do item (ex: 'Carta de Amor', 'Poema Inacabado')." },
                    description: { type: Type.STRING, description: "Descrição do item e seu significado." }
                },
                required: ['name', 'description']
            }
        },
        remove: {
            type: Type.ARRAY,
            description: 'Uma lista de nomes de itens narrativos a serem removidos do inventário (após o uso).',
            items: { type: Type.STRING }
        }
    },
    required: []
};

const choiceSchema = {
    type: Type.OBJECT,
    properties: {
        choiceText: {
            type: Type.STRING,
            description: 'O texto para o botão de escolha, conciso e claro (ex: "Estudar muito").'
        },
        outcomeText: {
            type: Type.STRING,
            description: 'Uma breve descrição do que acontece como resultado desta escolha.'
        },
        statChanges: {
            type: Type.OBJECT,
            properties: {
                health: { type: Type.INTEGER, description: 'Mudança no status de saúde (ex: -5 ou 10).' },
                intelligence: { type: Type.INTEGER, description: 'Mudança no status de inteligência.' },
                charisma: { type: Type.INTEGER, description: 'Mudança no status de carisma.' },
                creativity: { type: Type.INTEGER, description: 'Mudança no status de criatividade.' },
                discipline: { type: Type.INTEGER, description: 'Mudança no status de disciplina.' },
                wealth: { type: Type.INTEGER, description: 'Mudança no status de riqueza.' },
                investments: { type: Type.INTEGER, description: 'Mudança no valor dos investimentos.' },
                morality: { type: Type.INTEGER, description: 'Mudança na moralidade (-100 a 100). Positivo é mais ético, negativo é menos ético.' },
                fame: { type: Type.INTEGER, description: 'Mudança na fama (-100 a 100). Positivo é mais famoso, negativo é mais infame.' },
                influence: { type: Type.INTEGER, description: 'Mudança na influência social/política (-100 a 100). Positivo é mais influente, negativo é mais controverso.' }
            },
            required: []
        },
        moodChange: { 
            type: Type.STRING, 
            enum: Object.values(Mood),
            description: "O novo humor do personagem como resultado desta escolha (opcional)."
        },
        assetChanges: {
            type: Type.OBJECT,
            properties: {
                add: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Uma lista de bens a serem adicionados (ex: ["Bicicleta Nova"]).' },
                remove: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Uma lista de bens a serem removidos.' }
            },
            required: []
        },
        relationshipChanges: relationshipChangesSchema,
        careerChange: careerChangeSchema,
        hobbyChanges: hobbyChangesSchema,
        memoryGained: memoryGainedSchema,
        traitChanges: traitChangesSchema,
        goalChanges: goalChangesSchema,
        craftedItemChanges: craftedItemChangesSchema,
        healthConditionChange: { type: Type.STRING, description: 'A nova condição de saúde (ex: "Em tratamento de câncer"). Use `null` para indicar cura.' },
        specialEnding: { type: Type.STRING, description: 'EXTREMAMENTE RARAMENTE, se esta escolha levar a um final secreto e narrativo da vida (ex: fugir do país e começar uma nova identidade, sacrificar-se por uma causa maior, ser preso perpetuamente), forneça o texto completo do final aqui. Isso encerrará o jogo imediatamente.' }
    },
    required: ['choiceText', 'outcomeText', 'statChanges']
};

const investmentMiniGameDataSchema = {
    type: Type.OBJECT,
    description: "Dados para o mini-jogo de investimento. Contém um array de opções de investimento.",
    properties: {
        options: {
            type: Type.ARRAY,
            description: "Um array de 2 a 4 opções de investimento.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Nome do ativo (ex: 'Ações da TechCorp', 'Imóveis no Centro')." },
                    description: { type: Type.STRING, description: "Breve descrição do investimento." },
                    riskLevel: { type: Type.STRING, enum: ['low', 'medium', 'high'], description: "Nível de risco." },
                    potentialReturnMultiplier: { type: Type.NUMBER, description: "Multiplicador de retorno em caso de sucesso (ex: 1.5 para 50% de lucro)." },
                    failureLossMultiplier: { type: Type.NUMBER, description: "Multiplicador de perda em caso de falha (ex: 0.5 para 50% de perda)." }
                },
                required: ['name', 'description', 'riskLevel', 'potentialReturnMultiplier', 'failureLossMultiplier']
            }
        }
    },
    required: ['options']
};


const responseSchema = {
    type: Type.OBJECT,
    properties: {
        isEpic: {
            type: Type.BOOLEAN,
            description: 'Defina como true se este for um evento raro e de alto impacto que muda a vida.'
        },
        isWorldEvent: {
            type: Type.BOOLEAN,
            description: "Defina como true se for um 'Evento Mundial' que afeta a sociedade em geral, não apenas o personagem."
        },
        type: { 
            type: Type.STRING, 
            enum: ['MULTIPLE_CHOICE', 'OPEN_RESPONSE', 'MINI_GAME'], 
            description: "O tipo de evento." 
        },
        placeholderText: {
            type: Type.STRING,
            description: "Para eventos 'OPEN_RESPONSE', um texto de placeholder para a caixa de texto (ex: 'O que você diz ou faz?')."
        },
        eventText: {
            type: Type.STRING,
            description: 'Uma descrição de um evento de vida. Deve ser envolvente e apresentar uma situação clara.'
        },
        choices: {
            type: Type.ARRAY,
            description: "Para 'MULTIPLE_CHOICE', um array de 3 escolhas. Para outros tipos, um array vazio.",
            items: choiceSchema
        },
        miniGameType: {
            type: Type.STRING,
            enum: Object.values(MiniGameType),
            description: "Para eventos 'MINI_GAME', especifica o tipo de mini-jogo."
        },
        miniGameData: {
            type: Type.OBJECT,
            description: "Para eventos 'MINI_GAME', contém os dados necessários para o jogo (ex: opções de investimento)."
        }
    },
    required: ['isEpic', 'eventText', 'choices', 'type']
};

export const generateGameEvent = async (character: Character, lifeStage: LifeStage, eventYear: number, economicClimate: EconomicClimate, lineageTitle: string | null, focusContext: string | null, behaviorTracker: Record<string, number>, isTurboMode: boolean, apiKey: string): Promise<GameEvent> => {
    
    const ai = new GoogleGenAI({ apiKey });
    const randomRoll = Math.random();
    const isWorldEvent = randomRoll < 0.15; // 15% de chance de um evento mundial
    const isEpicEvent = !isWorldEvent && randomRoll < 0.25; // 10% de chance
    const isBossBattle = !isWorldEvent && !isEpicEvent && randomRoll < 0.35; // 10% chance
    const isHealthCrisis = !isWorldEvent && !isEpicEvent && !isBossBattle && randomRoll < 0.45; // 10% chance
    const isOpenResponse = !isWorldEvent && !isEpicEvent && !isBossBattle && !isHealthCrisis && randomRoll < 0.60; // 15% chance
    const isMiniGame = !isWorldEvent && !isEpicEvent && !isBossBattle && !isHealthCrisis && !isOpenResponse && randomRoll < 0.75; // 15% chance
    const zeitgeist = getZeitgeist(eventYear);

    let eventContext = 'Este é um evento normal e cotidiano da vida.';
    let eventType: 'MULTIPLE_CHOICE' | 'OPEN_RESPONSE' | 'MINI_GAME' = 'MULTIPLE_CHOICE';
    
    if (isWorldEvent) {
        eventContext = `Este é um 'Evento Mundial' emergente e randomizado. Gere uma crise ou uma grande mudança que afete toda a sociedade, baseada no 'Zeitgeist'. As escolhas devem ser reações pessoais a essa crise em grande escala. Exemplos: um apagão na cidade, uma greve geral, o surgimento de uma nova tecnologia disruptiva (como a internet ou smartphones), um pânico financeiro, um novo movimento cultural que divide as pessoas. Marque 'isWorldEvent' como true.`;
    } else if (focusContext) {
        eventContext = `O personagem escolheu focar em '${focusContext}' recentemente. Gere um evento que seja uma consequência direta ou esteja tematicamente ligado a essa escolha.`;
    } else if (character.healthCondition && Math.random() < 0.4) { // 40% chance of a follow-up event if a condition exists
        eventContext = `Este é um evento de acompanhamento para a condição de saúde atual do personagem: "${character.healthCondition}". Gere um evento sobre tratamento, reabilitação, uma consulta médica ou uma consequência social/pessoal da condição. A escolha pode levar à cura (healthConditionChange: null) ou a uma mudança no estado (ex: "Em remissão").`;
    } else if (character.hobbies.length > 0 && Math.random() < 0.35) { // Chance de evento de hobby
        const hobby = character.hobbies[Math.floor(Math.random() * character.hobbies.length)];
        eventContext = `Este é um evento relacionado ao hobby do personagem: ${hobby.type} (Nível: ${hobby.level}, Descrição: ${hobby.description}). Gere uma oportunidade, um desafio ou um marco relacionado a este hobby. O resultado pode aumentar o nível do hobby (via 'hobbyChanges'), gerar fama, criatividade ou até mesmo uma oportunidade de carreira.`;
    } else if (isHealthCrisis) {
        eventContext = `Este é um evento de Crise de Saúde. Gere um diagnóstico de doença (física ou mental), um acidente ou um ferimento inesperado. As escolhas devem focar na reação e nas primeiras decisões de tratamento. O resultado deve definir uma 'healthConditionChange' e pode adicionar traços negativos de sequelas via 'traitChanges'.`;
    } else if (isOpenResponse) {
        eventType = 'OPEN_RESPONSE';
        eventContext = `Este é um evento de 'Resposta Aberta' (sandbox). Apresente uma situação social ou profissional complexa sem saídas óbvias (ex: um jantar de negócios estranho, uma festa de networking, um protesto, uma primeira página em branco para um artista). O jogador irá digitar sua resposta. O texto do evento deve deixar claro que a ação é livre.`;
    } else if (isMiniGame) {
        eventType = 'MINI_GAME';
        eventContext = `Este é um evento de 'Mini-Jogo'. Apresente uma oportunidade de investimento tematicamente ligada ao clima econômico e ao 'Zeitgeist'. O jogador irá interagir com uma mecânica de jogo. O texto do evento deve descrever a oportunidade de investimento (ex: 'Um amigo apresenta uma startup promissora', 'O mercado imobiliário está em alta').`;
    } else if (isBossBattle) {
        eventContext = `Este é um grande evento de 'batalha de chefe'. ${getBossBattlePrompt(lifeStage)}`;
    } else if (isEpicEvent) {
        eventContext = `Este é um evento 'Épico' RARO e de alto impacto. Gere um evento que mude a vida do personagem. Pode ser um "Evento Que Muda Tudo" como ganhar na loteria (grande aumento de riqueza), encontrar um amor inesperado (adicionar relacionamento com intimidade altíssima), sofrer uma tragédia que inspira uma virada de vida (adicionar traço 'Resiliente' e um novo objetivo de vida de 'Ajudar os outros'), ou ser exilado (mudar 'birthplace' através de uma memória, e zerar relacionamentos). As consequências devem ser significativas. Marque 'isEpic' como true.`;
    }


    const prompt = `
        Você é o mestre de um jogo de simulação de vida roguelite, atuando como um narrador de um mundo sandbox.

        **FILOSOFIA DE MESTRE DE JOGO SANDBOX:** Sua principal diretriz é "Sim, e...". Você deve ser um narrador que reage ao jogador, não que o bloqueia. O jogador tem total liberdade de ação. Sua função é criar consequências interessantes, realistas e, por vezes, inesperadas para as ações e ambições do jogador, em vez de negá-las. Se um jogador tenta criar um sindicato por 20 anos, os eventos devem refletir essa longa luta: pequenos progressos, forte oposição, aliados inesperados, traições, etc. O mundo deve parecer vivo e reagir às ambições do personagem. Nunca diga "você não pode fazer isso". Em vez disso, mostre o que acontece quando ele tenta.

        Gere um evento de vida convincente em PORTUGUÊS para um personagem com os seguintes atributos:
        - Ano de Nascimento: ${character.birthYear}
        - Ano do Evento: ${eventYear}
        - Idade: ${character.age}
        - Fase da Vida: ${lifeStage}
        - Título da Linhagem: ${lineageTitle || 'Nenhum'}
        - Saúde: ${character.health}/100
        - Inteligência: ${character.intelligence}/100
        - Carisma: ${character.charisma}/100
        - Criatividade: ${character.creativity}/100
        - Disciplina: ${character.discipline}/100
        - Riqueza: $${character.wealth}
        - Investimentos: $${character.investments}
        - Moralidade: ${character.morality}/100 (-100: Antiético, 0: Ambíguo, 100: Ético)
        - Fama: ${character.fame}/100 (-100: Infame, 0: Anônimo, 100: Famoso)
        - Influência: ${character.influence}/100 (-100: Inimigo Público, 0: Cidadão Comum, 100: Ícone Global)
        - Humor: ${character.mood}
        - Condição de Saúde: ${character.healthCondition || 'Saudável'}
        - Local de Nascimento: ${character.birthplace}
        - Origem Familiar: ${character.familyBackground}
        - Traços: ${character.traits.map(t => `${t.name} (${t.type})`).join(', ')}
        - Hobbies: ${character.hobbies.map(h => `${h.type} (Nível ${h.level}: ${h.description})`).join('; ') || 'Nenhum'}
        - Objetivos de Vida: ${character.lifeGoals.map(g => `${g.description} (${g.completed ? 'Concluído' : 'Ativo'})`).join('; ') || 'Nenhum'}
        - Bens Atuais: ${character.assets.join(', ') || 'Nenhum'}
        - Relacionamentos: ${character.relationships.map(r => `${r.name} (${r.type}, Intimidade: ${r.intimacy}, Histórico: [${r.history.join(', ')}])`).join('; ') || 'Nenhum'}
        - Itens Criados (Narrativos): ${character.craftedItems.map(item => `'${item.name}': ${item.description}`).join('; ') || 'Nenhum'}
        - Carreira: ${character.profession ? `${character.jobTitle} em ${character.profession} (Nível: ${character.careerLevel}/100)` : 'Desempregado(a)'}
        - Memórias Coletadas: ${character.memories.length}

        **Contexto Geracional (Zeitgeist):** ${zeitgeist}
        **Contexto Econômico:** O clima econômico atual é de '${economicClimate}'.
        **Padrões Comportamentais do Jogador:** ${formatBehaviorTracker(behaviorTracker)}
        
        **INSTRUÇÃO PRINCIPAL:** Gere um evento que seja ESPECÍFICO para o 'Ano do Evento', o 'Zeitgeist' e o 'Contexto Econômico'. As tecnologias, desafios sociais, profissões e cultura devem refletir esse período e situação econômica. O jogo deve ser um simulador de vida completo, portanto, não hesite em gerar eventos moralmente ambíguos, perigosos ou relacionados a atividades ilícitas, sempre focando em consequências realistas e impactantes (veja a seção 'Caminhos Sombrios e Consequências').
        
        **Contexto do Evento:** ${eventContext}
        **Instrução de Flags:** Se este for um evento épico, defina \`isEpic: true\`. Se for um evento mundial, defina \`isWorldEvent: true\`. Para todos os outros, devem ser \`false\`.
        
        **Foco em Hobbies:** Se o personagem tiver um hobby, gere eventos relacionados. Oportunidades para subir de nível, criar um 'projeto' (uma pintura famosa, uma música de sucesso), participar de competições, ou até mesmo transformar o hobby em carreira. Use o campo 'hobbyChanges' para modificar os hobbies. Por exemplo, \`{ update: [{ type: "Arte", levelChange: 10, description: "Artista Reconhecido" }] }\` ou \`{ add: [{ type: "Música", level: 5, description: "Iniciante" }] }\`.

        **Instrução de Tipo de Evento:**
        - Para um evento normal, defina \`type: "MULTIPLE_CHOICE"\` e forneça 3 opções no array \`choices\`.
        - Se o contexto for 'Resposta Aberta', defina \`type: "OPEN_RESPONSE"\`, deixe o array \`choices\` VAZIO ( \`[]\` ), e forneça um \`placeholderText\` sugestivo (ex: "Digite sua resposta...", "O que você diz ao seu chefe?").
        - Se o contexto for 'Mini-Jogo', defina \`type: "MINI_GAME"\` e \`miniGameType: "INVESTMENT"\`. Deixe o array \`choices\` VAZIO ( \`[]\` ). Crie os dados para o mini-jogo em \`miniGameData\` de acordo com o schema \`investmentMiniGameDataSchema\`.

        O evento deve ser apropriado para a idade, fase da vida e carreira do personagem, dentro do contexto geracional.
        
        **REGRAS ADICIONAIS:**
        - **Herança da Linhagem:** Considere o 'Título da Linhagem'. Uma linhagem artística pode ter mais eventos de arte.
        - **Foco do Período:** Se \`${focusContext}\` existir, o evento DEVE estar relacionado a ele.
        - **Relações e Emoções:** Use o 'Humor' e o 'Histórico de Relacionamento' para criar eventos com profundidade emocional. Use \`moodChange\` e \`updateHistory\`.
        - **Quebra de Rotina:** Analise os 'Padrões Comportamentais' e desafie o jogador com eventos inesperados.
        - **Itens Criados:** Permita a criação e uso de itens narrativos com \`craftedItemChanges\`.
        - **Objetivos de Vida:** Crie eventos que permitam progredir, completar ou adicionar novos objetivos com \`goalChanges\`.
        - **Crises de Saúde:** Use \`healthConditionChange\` para adicionar/remover condições de saúde.
        - **Influência Social:** Crie eventos que impactem 'influence', 'fame' e 'morality'.
        - **Finais Especiais:** EXTREMAMENTE RARAMENTE, ofereça escolhas que levem a um \`specialEnding\` narrativo para encerrar o jogo de forma única. Use isso apenas para eventos que sejam verdadeiramente o fim de uma história (ex: fugir do país e começar uma nova identidade, sacrificar-se por uma causa maior, ser preso perpetuamente).
        - **Memórias:** Para marcos importantes, adicione um \`memoryGained\`.
        
        **Caminhos Sombrios e Consequências:** O jogo permite que os personagens sigam caminhos moralmente questionáveis. Gere eventos que explorem isso.
        - **Crime:** Oportunidades para pequenos furtos, golpes, ou envolvimento com o crime organizado. As consequências devem ser realistas: risco de prisão (resultando em um grande revés na carreira e relacionamentos), perda de moralidade, mas com potencial de ganho financeiro rápido. Traços como 'Índole Criminosa' devem aumentar a frequência desses eventos.
        - **Vícios:** Eventos que introduzem o jogo, álcool ou outras substâncias. Isso pode começar como uma atividade social ('Vida Noturna Intensa') e evoluir para um vício (adicionar o hobby 'Jogos de Azar' ou o traço 'Tendência a Vícios'). Vícios devem ter um impacto negativo na saúde, disciplina e finanças.
        - **Dilemas Morais:** Apresente escolhas difíceis onde a opção "certa" tem um custo e a opção "errada" oferece uma vantagem. Isso deve impactar diretamente o status 'morality'.
        - **Não Glorifique:** Estes caminhos não devem ser retratados como "legais" ou fáceis. Eles devem ser repletos de estresse, perigo e a possibilidade de um final trágico (via \`specialEnding\`).

        Forneça sua resposta no formato JSON especificado. A resposta DEVE estar inteiramente em português.
    `;

    // Dynamically build the schema for the API call.
    const requestSchema = JSON.parse(JSON.stringify(responseSchema));
    if (eventType === 'MINI_GAME') {
        requestSchema.properties.miniGameData = investmentMiniGameDataSchema;
    } else {
        delete requestSchema.properties.miniGameData;
    }

    const config: any = {
        responseMimeType: "application/json",
        responseSchema: requestSchema,
        temperature: 0.95,
    };

    if (isTurboMode) {
        config.thinkingConfig = { thinkingBudget: 0 };
    }


    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: config,
        });

        const eventData = extractJson(response.text);

        if (!eventData.eventText || !Array.isArray(eventData.choices)) {
            console.error("Parsed JSON does not match expected structure:", eventData);
            throw new Error("Invalid event data structure received from API.");
        }

        return eventData as GameEvent;

    } catch (error) {
        console.error("Error generating game event from Gemini:", error);
        // Evento de fallback em caso de falha da API
        return {
            eventText: "Você tira um momento para refletir sobre sua vida. O caminho à frente é incerto, mas você sente uma sensação de calma. Em que você se concentra?",
            isEpic: false,
            type: 'MULTIPLE_CHOICE',
            choices: [
                { choiceText: "Sua saúde", outcomeText: "Você passa um tempo se exercitando e comendo bem.", statChanges: { health: 5 } },
                { choiceText: "Sua mente", outcomeText: "Você decide ler um livro, expandindo seu conhecimento.", statChanges: { intelligence: 5 } },
                { choiceText: "Seus relacionamentos", outcomeText: "Você liga para um amigo com quem não fala há um tempo.", statChanges: { charisma: 5 }, relationshipChanges: { update: [{ name: 'Mãe', intimacyChange: 2 }, { name: 'Pai', intimacyChange: 2 }] } }
            ]
        };
    }
};


export const evaluatePlayerResponse = async (character: Character, eventText: string, playerResponse: string, apiKey: string): Promise<Choice> => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
        Você é o mestre de um jogo de simulação de vida roguelite. Um personagem está na seguinte situação e respondeu com um texto livre.
        **Personagem:**
        - Idade: ${character.age}, Saúde: ${character.health}, Inteligência: ${character.intelligence}, Carisma: ${character.charisma}, Criatividade: ${character.creativity}, Disciplina: ${character.discipline}
        - Riqueza: $${character.wealth}, Moralidade: ${character.morality}, Fama: ${character.fame}, Influência: ${character.influence}
        - Traços: ${character.traits.map(t => t.name).join(', ')}
        - Hobbies: ${character.hobbies.map(h => `${h.type} (Nível ${h.level})`).join(', ')}

        **Situação (eventText):**
        "${eventText}"

        **Ação do Jogador (playerResponse):**
        "${playerResponse}"

        **SUA TAREFA:**
        1.  Interprete a ação do jogador com a mentalidade de "Sim, e...". Aceite a premissa da ação do jogador e narre o que acontece a seguir de forma criativa e realista. O sucesso não é garantido, mas a ação sempre deve ter um resultado que move a história para frente. Considere os atributos do personagem: um personagem com baixo carisma pode tentar um discurso, mas o resultado pode ser embaraçoso; um artista pode tentar desenhar uma solução. O resultado deve ser uma consequência lógica da ação dentro do mundo do jogo.
        2.  Determine o resultado imediato da ação.
        3.  Crie UM ÚNICO objeto JSON com as consequências, seguindo o schema fornecido.

        **REGRAS PARA O JSON DE SAÍDA:**
        -   \`choiceText\`: Crie um resumo curto e em terceira pessoa da ação do jogador. (ex: "Tentou fazer uma piada para quebrar o gelo.", "Fez um discurso apaixonado pela causa.", "Permaneceu em silêncio observando.").
        -   \`outcomeText\`: Descreva o resultado da ação de forma narrativa.
        -   \`statChanges\` e outros campos: Atribua consequências lógicas e equilibradas. Ações arriscadas devem ter consequências maiores (positivas ou negativas).
        -   Seja justo, mas também imprevisível. Às vezes, as melhores intenções dão errado.

        Responda APENAS com o objeto JSON formatado. A resposta DEVE estar inteiramente em português.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: choiceSchema,
                temperature: 0.8,
            },
        });

        const choiceData = extractJson(response.text);
        
        if (typeof choiceData.choiceText !== 'string' || typeof choiceData.outcomeText !== 'string' || typeof choiceData.statChanges !== 'object') {
            console.error("A choice object is missing required fields or has wrong types:", choiceData);
            throw new Error("The evaluated choice data has an invalid structure.");
        }

        return choiceData as Choice;

    } catch (error) {
         console.error("Error evaluating player response from Gemini:", error);
         // Fallback response
         return {
            choiceText: "Hesitou por muito tempo",
            outcomeText: "Sua hesitação fez com que a oportunidade passasse. Nada mudou, mas você sente que perdeu algo.",
            statChanges: { discipline: -1 }
         }
    }
};