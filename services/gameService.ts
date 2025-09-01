import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Character, LifeStage, GameEvent, RelationshipType, MemoryItemType, Trait, EconomicClimate, Choice, MiniGameType, Mood, StatChanges, WorldEvent, NarrativeTone } from '../types';

// Helper function to robustly parse JSON from the model's text response
const cleanAndParseJson = <T,>(responseText: string): T => {
    // 1. Handle empty or non-string responses immediately.
    if (typeof responseText !== 'string' || !responseText.trim()) {
        console.error("A API retornou uma resposta vazia ou inválida. Texto Original:", responseText);
        throw new Error("A resposta da IA estava vazia. Isso pode ser devido a filtros de segurança ou um erro temporário da API. Por favor, tente novamente.");
    }

    let jsonText = responseText.trim();

    // 2. More robustly find the JSON snippet.
    const markdownMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[1]) {
        jsonText = markdownMatch[1].trim();
    } else {
        const firstBracket = jsonText.indexOf('{');
        const firstSquare = jsonText.indexOf('[');
        let firstIndex = -1;

        if (firstBracket === -1) {
            firstIndex = firstSquare;
        } else if (firstSquare === -1) {
            firstIndex = firstBracket;
        } else {
            firstIndex = Math.min(firstBracket, firstSquare);
        }
        
        // If we didn't find any start of JSON, the response is likely not JSON.
        if (firstIndex === -1) {
            console.error("Nenhum JSON encontrado na resposta da API. Texto Original:", responseText);
            throw new Error("A resposta da IA não continha um formato JSON reconhecível. Pode ser uma mensagem de erro da API.");
        }

        const lastBracket = jsonText.lastIndexOf('}');
        const lastSquare = jsonText.lastIndexOf(']');
        const lastIndex = Math.max(lastBracket, lastSquare);

        if (lastIndex > firstIndex) {
            jsonText = jsonText.substring(firstIndex, lastIndex + 1);
        }
    }
    
    // 3. Keep the number sanitization. It's a good safeguard.
    jsonText = jsonText.replace(/:(\s*)(-?\d{10,})/g, (match, space, number) => {
        const isNegative = number.startsWith('-');
        console.warn(`Número excessivamente grande detectado da API e limitado: ${number}`);
        const cappedNumber = isNegative ? '-999999999' : '999999999';
        return `:${space}${cappedNumber}`;
    });

    try {
        return JSON.parse(jsonText) as T;
    } catch (e) {
        // 4. The error message is now more informative for the user and me (the developer).
        console.error("Falha ao analisar JSON da API após a limpeza. Texto Limpo:", jsonText, "Texto Original:", responseText, "Erro:", e);
        throw new Error("A resposta da IA não era um JSON válido. Isso pode acontecer se a IA gerar um evento muito complexo ou acionar filtros de segurança. Tente uma ação mais simples, ou use o botão 'Restaurar Jogo' para voltar a um ponto seguro.");
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

const getNarrativeToneDirective = (tone: NarrativeTone): string => {
    switch (tone) {
        case NarrativeTone.EPIC_DRAMA:
            return `
            **DIRETIVA DE TOM NARRATIVO: DRAMA ÉPICO (PRIORIDADE ALTA)**
            - **Atmosfera:** Grandiosa, solene, trágica.
            - **Linguagem:** Use descrições ricas e uma linguagem mais formal e impactante. Foque em temas como destino, sacrifício, honra e legado.
            - **Eventos:** Gere dilemas de alto risco, triunfos emocionantes e perdas devastadoras. As consequências devem ter peso emocional duradouro. Pense em uma saga familiar.`;
        case NarrativeTone.COMEDY_OF_LIFE:
            return `
            **DIRETIVA DE TOM NARRATIVO: COMÉDIA DA VIDA (PRIORIDADE ALTA)**
            - **Atmosfera:** Irônica, absurda, agridoce.
            - **Linguagem:** Use humor, sarcasmo e um tom leve, mesmo em situações difíceis. Destaque as coincidências improváveis e as pequenas ironias do cotidiano.
            - **Eventos:** Gere situações cômicas de azar, mal-entendidos absurdos e personagens excêntricos. As "vitórias" podem ter um toque de fracasso, e os "fracassos" podem ser hilários.`;
        case NarrativeTone.GRITTY_REALISM:
            return `
            **DIRETIVA DE TOM NARRATIVO: REALISMO CRU (PRIORIDADE ALTA)**
            - **Atmosfera:** Sóbria, direta, sem adornos.
            - **Linguagem:** Seja direto e objetivo. Descreva as coisas como elas são, sem sentimentalismo ou melodrama.
            - **Eventos:** Foque nas dificuldades concretas e mundanas: problemas financeiros, doenças, burocracia, injustiças sociais, o tédio do trabalho. As soluções raramente são fáceis ou perfeitas.`;
        case NarrativeTone.NORMAL:
        default:
            return ``; // No specific directive for normal, balanced tone.
    }
};

const relationshipTypeSchema = {
    type: Type.STRING,
    enum: Object.values(RelationshipType),
};

const relationshipStatusSchema = {
    type: Type.STRING,
    enum: ['Dating', 'Engaged', 'Married', 'Divorced', 'Widowed'],
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
        health: { type: Type.INTEGER, description: "Mudança na saúde. Geralmente -10 a 10." },
        intelligence: { type: Type.INTEGER, description: "Mudança na inteligência. Geralmente 1 a 5." },
        charisma: { type: Type.INTEGER, description: "Mudança no carisma. Geralmente 1 a 5." },
        creativity: { type: Type.INTEGER, description: "Mudança na criatividade. Geralmente 1 a 5." },
        discipline: { type: Type.INTEGER, description: "Mudança na disciplina. Geralmente 1 a 5." },
        happiness: { type: Type.INTEGER, description: "Mudança na felicidade (0-100)." },
        energy: { type: Type.INTEGER, description: "Mudança na energia (0-100)." },
        stress: { type: Type.INTEGER, description: "Mudança no estresse (0-100)." },
        luck: { type: Type.INTEGER, description: "Mudança na sorte (0-100). Mude APENAS em eventos épicos." },
        jobSatisfaction: { type: Type.INTEGER, description: "Mudança na satisfação com o trabalho (0-100)." },
        wealth: { type: Type.INTEGER, description: "Mudança na riqueza. Valores realistas. Evite números enormes." },
        investments: { type: Type.INTEGER, description: "Mudança no valor dos investimentos. Valores realistas." },
        morality: { type: Type.INTEGER, description: "Mudança na moralidade (-100 a 100). Ações comuns causam -10 a 10." },
        fame: { type: Type.INTEGER, description: "Mudança na fama (-100 a 100). Ações comuns causam -5 a 5." },
        influence: { type: Type.INTEGER, description: "Mudança na influência (-100 a 100). Ações comuns causam -5 a 5." },
    },
};

const assetChangesSchema = {
    type: Type.OBJECT,
    properties: {
        add: { type: Type.ARRAY, items: { type: Type.STRING } },
        remove: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
};

const relationshipChangesSchema = {
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
                    status: relationshipStatusSchema,
                    history: { type: Type.ARRAY, items: { type: Type.STRING } },
                    title: { type: Type.STRING, description: "Ex: 'Filho', 'Esposa', 'Melhor Amigo'." },
                    age: { type: Type.INTEGER },
                    gender: { type: Type.STRING },
                },
                required: ['name', 'type', 'intimacy']
            }
        },
        update: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    intimacyChange: { type: Type.INTEGER },
                    status: relationshipStatusSchema,
                    title: { type: Type.STRING },
                },
                required: ['name']
            }
        },
        remove: { type: Type.ARRAY, items: { type: Type.STRING } },
        updateHistory: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    memory: { type: Type.STRING },
                },
                required: ['name', 'memory']
            }
        },
    },
};

const skillChangesSchema = {
    type: Type.OBJECT,
    properties: {
        add: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    level: { type: Type.INTEGER },
                    description: { type: Type.STRING },
                },
                required: ['name', 'level', 'description'],
            }
        },
        update: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    levelChange: { type: Type.INTEGER },
                    description: { type: Type.STRING },
                    newName: { type: Type.STRING },
                },
                required: ['name', 'levelChange'],
            }
        },
    },
};

const careerChangeSchema = {
    type: Type.OBJECT,
    properties: {
        profession: { type: Type.STRING, description: 'Se for uma string vazia "", o personagem se torna desempregado.' },
        jobTitle: { type: Type.STRING },
        levelChange: { type: Type.INTEGER },
    },
};

const traitChangesSchema = {
    type: Type.OBJECT,
    properties: {
        add: { type: Type.ARRAY, items: traitSchema },
        remove: { type: Type.ARRAY, items: { type: Type.STRING } },
        update: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    levelChange: { type: Type.INTEGER },
                    description: { type: Type.STRING },
                },
                required: ['name', 'levelChange']
            }
        }
    },
};

const goalChangesSchema = {
    type: Type.OBJECT,
    properties: {
        add: { type: Type.ARRAY, items: { type: Type.STRING } },
        complete: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
};

const craftedItemChangesSchema = {
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
                required: ['name', 'description'],
            }
        },
        remove: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
};

const plotChangesSchema = {
    type: Type.OBJECT,
    properties: {
        add: { type: Type.ARRAY, items: { type: Type.STRING, description: "Uma descrição de enredo NÃO VAZIA para adicionar." } },
        complete: { type: Type.ARRAY, items: { type: Type.STRING, description: "A descrição exata do enredo a ser marcado como concluído." } },
        remove: { type: Type.ARRAY, items: { type: Type.STRING, description: "A descrição exata do enredo a ser removido." } },
    },
};

const choiceSchema = {
    type: Type.OBJECT,
    properties: {
        choiceText: { type: Type.STRING },
        outcomeText: { type: Type.STRING },
        statChanges: statChangesSchema,
        assetChanges: assetChangesSchema,
        relationshipChanges: relationshipChangesSchema,
        careerChange: careerChangeSchema,
        memoryGained: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                type: memoryItemTypeSchema,
            },
            required: ['name', 'description', 'type']
        },
        traitChanges: traitChangesSchema,
        healthConditionChange: { type: Type.STRING, description: "Nome da condição de saúde ou 'null' para remover." },
        goalChanges: goalChangesSchema,
        craftedItemChanges: craftedItemChangesSchema,
        skillChanges: skillChangesSchema,
        plotChanges: plotChangesSchema,
        childBorn: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                gender: { type: Type.STRING },
            }
        },
        isPregnantChange: { type: Type.BOOLEAN },
        specialEnding: { type: Type.STRING },
        timeCostInUnits: { type: Type.INTEGER, description: 'Número de meses que a ação leva. 1-12. O padrão é 1.' },
        locationChange: { type: Type.STRING },
        plotContributionText: { type: Type.STRING, description: "Resumo curto, em tempo passado, do papel do personagem na trama global (ex: 'Lutou nas trincheiras', 'Especulou no mercado negro')." },
    },
    required: ['choiceText', 'outcomeText', 'statChanges']
};

const miniGameTypeSchema = {
    type: Type.STRING,
    enum: Object.values(MiniGameType),
};

const investmentOptionSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        riskLevel: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
        potentialReturnMultiplier: { type: Type.NUMBER, description: "Ex: 1.5 para um retorno de 50%." },
        failureLossMultiplier: { type: Type.NUMBER, description: "Ex: 0.5 para uma perda de 50%." }
    },
    required: ['name', 'description', 'riskLevel', 'potentialReturnMultiplier', 'failureLossMultiplier']
};

const gameEventSchema = {
    type: Type.OBJECT,
    properties: {
        eventText: { type: Type.STRING },
        choices: { type: Type.ARRAY, items: choiceSchema },
        isEpic: { type: Type.BOOLEAN },
        isWorldEvent: { type: Type.BOOLEAN },
        type: { type: Type.STRING, enum: ['MULTIPLE_CHOICE', 'OPEN_RESPONSE', 'MINI_GAME'] },
        placeholderText: { type: Type.STRING },
        miniGameType: miniGameTypeSchema,
        miniGameData: {
            type: Type.OBJECT,
            description: "Dados para mini-jogos. Usado principalmente para jogos de investimento, que exigem um array de 'options'.",
            nullable: true,
            properties: {
                options: {
                    type: Type.ARRAY,
                    items: investmentOptionSchema
                }
            }
        },
        timeCostInUnits: { type: Type.INTEGER, description: 'Número de meses que o evento leva. 1-12. O padrão é 1.' },
    },
    required: ['eventText', 'type']
};

const worldEventSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        effects: statChangesSchema,
    },
    required: ['title', 'description', 'effects']
};

const systemInstruction = `Você é um mestre de jogo (Game Master) e um contador de histórias sofisticado para um simulador de vida. Sua única função é gerar respostas em formato JSON que sigam o schema fornecido. É CRÍTICO que sua resposta seja SEMPRE um JSON válido.

**Princípios Narrativos:**
1.  **Coerência é Rei:** A história deve ser sempre plausível dentro do contexto do personagem (idade, traços, riqueza, era histórica). Evite anacronismos. Um camponês do século 18 não deve encontrar um smartphone.
2.  **Trama Global:** Se uma Trama Global estiver ativa (ex: guerra, depressão econômica), os eventos gerados DEVEM refletir essa realidade de forma impactante e pessoal para o personagem.
3.  **Consequências Reais:** As escolhas do jogador devem ter impacto. Se a solicitação do usuário levar a um resultado sombrio, violento ou trágico (como ferimentos graves, crime, ou morte), modele essas consequências de forma realista dentro da narrativa do jogo. Gere um 'specialEnding' se a ação levar diretamente ao fim da vida do personagem. Evite conteúdo gráfico explícito, mas não fuja de temas maduros.
4.  **Variação de Tom:** A vida não é um único gênero. Alterne o tom dos eventos entre cômico, trágico, banal e épico para criar uma experiência dinâmica e imprevisível.
5.  **Foco em Arcos Longos:** Priorize a continuidade. Se houver 'ongoingPlots', o evento gerado deve, preferencialmente, avançar essa narrativa.

NÃO inclua texto explicativo, recusas ou qualquer coisa fora da estrutura JSON. Apenas o JSON.`;

// Helper to create the character summary string for the prompt
const getCharacterSummary = (character: Character, isTurboMode: boolean = false) => {
    if (isTurboMode) {
        // A much shorter summary for faster, simpler responses in Turbo mode.
        const notableTraits = character.traits.slice(0, 3).map(t => t.name).join(', ') || 'Nenhum';
        return `
          Nome: ${character.name}, Idade: ${character.age}
          Atributos Chave: Inteligência(${character.intelligence}), Carisma(${character.charisma}), Disciplina(${character.discipline})
          Vitals Chave: Felicidade(${character.happiness}), Estresse(${character.stress})
          Finanças: Riqueza($${character.wealth})
          Carreira: ${character.profession ? character.jobTitle : 'Desempregado(a)'}
          Traços Notáveis: ${notableTraits}
        `;
    }
    const relationshipsSummary = character.relationships.map(r => `${r.name} (${r.title || r.type}${r.age ? `, ${r.age} anos` : ''})`).slice(0, 5).join('; ');
    const activePlot = character.plotContribution ? ` Papel na Trama Global: ${character.plotContribution}`: '';
    // A concise summary of the character to provide context to the AI
    return `
      Nome: ${character.name} ${character.lastName}, Idade: ${character.age}, Gênero: ${character.gender}
      Atributos: Saúde(${character.health}), Inteligência(${character.intelligence}), Carisma(${character.charisma}), Criatividade(${character.creativity}), Disciplina(${character.discipline})
      Vitals: Felicidade(${character.happiness}), Energia(${character.energy}), Estresse(${character.stress})
      Reputação: Moralidade(${character.morality}), Fama(${character.fame}), Influência(${character.influence})
      Finanças: Riqueza($${character.wealth.toLocaleString()}), Investimentos($${character.investments.toLocaleString()})
      Carreira: ${character.profession ? `${character.jobTitle} em ${character.profession} (Nível ${character.careerLevel})` : 'Desempregado(a)'}
      Traços: ${character.traits.map(t => t.name).join(', ')}
      Relacionamentos Importantes: ${relationshipsSummary}
      Metas de Vida: ${character.lifeGoals.map(g => g.description + (g.completed ? ' (Concluído)' : '')).join('; ')}
      Habilidades: ${character.skills.map(s => `${s.name} (Nível ${s.level})`).join(', ')}
      Enredos Atuais: ${character.ongoingPlots ? character.ongoingPlots.map(p => p.description + (p.completed ? ' (Concluído)' : '')).join(', ') : 'Nenhum'}${activePlot}
      Backstory: ${character.backstory}
    `;
};

export const generateGameEvent = async (
    character: Character,
    lifeStage: LifeStage,
    year: number,
    economicClimate: EconomicClimate,
    lineageTitle: string | null,
    focusContext: string | null,
    behaviorTracker: Record<string, number>,
    isTurboMode: boolean,
    apiKey: string,
    narrativeTone: NarrativeTone
): Promise<GameEvent> => {
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-2.5-flash';

    const characterSummary = getCharacterSummary(character, isTurboMode);
    const zeitgeist = getZeitgeist(year);
    const narrativeDirective = getNarrativeToneDirective(narrativeTone);

    const isBossBattle = Math.random() < 0.10; // 10% chance of a boss battle event
    
    let plotDirective = '';
    const activePlotInfo = character.activeGlobalPlotContext;
    if (activePlotInfo) {
        plotDirective = `
        **DIRETIVA DE TRAMA GLOBAL (PRIORIDADE MÁXIMA):**
        - O mundo está passando por: "${activePlotInfo.plotTitle} - ${activePlotInfo.phaseTitle}".
        - Descrição da Fase: "${activePlotInfo.phaseDescription}"
        - **HÁ 75% DE CHANCE DE QUE O EVENTO GERADO DEVA ESTAR DIRETAMENTE RELACIONADO A ESTA TRAMA.**
        - Crie um evento que reflita esta realidade para o personagem, considerando sua riqueza, profissão e traços. Ex: durante uma guerra, eventos sobre conscrição, racionamento, espionagem. Durante uma depressão, eventos sobre desemprego, oportunidades de mercado negro, movimentos sociais.
        - As escolhas devem refletir diferentes reações: resistir, colaborar, lucrar, sobreviver, inovar, fugir.
        - Para escolhas que definem o papel do personagem na trama, preencha o campo 'plotContributionText' com um resumo curto em tempo passado (ex: "Lutou nas trincheiras", "Especulou no mercado negro para enriquecer", "Organizava cozinhas comunitárias para os pobres").`;
    }

    const promptContext = isTurboMode
        ? `
      **Contexto do Jogo (Modo Turbo):**
      - Ano: ${year}
      - Clima Econômico: ${economicClimate}
      - Foco Anual: ${focusContext || "Não definido"}`
        : `
      **Contexto do Jogo:**
      - Ano Atual: ${year} (${zeitgeist})
      - Clima Econômico: ${economicClimate}
      - Foco Anual do Personagem: ${focusContext || "Não definido"}
      - Título da Linhagem (se houver): ${lineageTitle || "Nenhum"}`;

    const prompt = `
      ${narrativeDirective}
      
      ${plotDirective}
      
      ${promptContext}

      **Resumo do Personagem:**
      ${characterSummary}

      **REGRAS DE OURO PARA GERAÇÃO DE EVENTOS:**

      **1. COERÊNCIA NARRATIVA (OBRIGATÓRIO):**
         - **Tom Narrativo:** O evento e suas descrições DEVEM seguir estritamente a DIRETIVA DE TOM NARRATIVO acima.
         - **Trama Global:** Se uma Trama Global estiver ativa, o evento DEVE seguir a diretiva da trama.
         - **Era Histórica:** O evento DEVE ser apropriado para o ano de ${year} e o contexto: ${zeitgeist}. Sem anacronismos.
         - **Perfil do Personagem:** O evento deve fazer sentido para um(a) personagem de ${character.age} anos com os traços, riqueza e reputação descritos. Um bilionário não se preocupa com uma conta de $50. Um personagem com 'Índole Criminosa' tem mais chances de encontrar problemas com a lei.

      **2. TIPO E TOM DO EVENTO:**
         - **Variedade:** Gere uma mistura de eventos:
           - **Eventos Simples:** Pequenos dilemas do dia a dia.
           - **Eventos de Bifurcação (Ocasional):** Crie eventos de alto impacto que possam mudar drasticamente o rumo da vida (ex: uma proposta de emprego em outro país, um convite para entrar no crime, uma crise existencial que leva a uma mudança de carreira radical).
         - ${isBossBattle ? `Gere um evento de "batalha de chefe" de alto risco, apropriado para a fase da vida. Descrição do desafio: ${getBossBattlePrompt(lifeStage)}` : `Gere um evento de vida interessante. Pode ser uma oportunidade, um desafio ou uma interação social. Eventos que podem levar à morte (devido a doença, acidente ou violência) são permitidos e devem ser gerados se forem narrativamente apropriados.`}

      **3. ARCOS DE HISTÓRIA (PRIORIDADE MÁXIMA):**
         - **Enredos Ativos:** ${character.ongoingPlots && character.ongoingPlots.filter(p => !p.completed).length > 0 ? `O personagem tem os seguintes enredos ativos: ${character.ongoingPlots.filter(p => !p.completed).map(p => `"${p.description}"`).join(', ')}. **É CRUCIAL que o evento gerado avance ou conclua um desses enredos.**` : "Não há enredos de longo prazo ativos. Você pode criar um evento que inicie um novo arco narrativo interessante usando 'plotChanges.add'."}
         - **Continuidade:** Se um evento concluir um enredo, use 'plotChanges.complete'. Se iniciar um novo, use 'plotChanges.add'. **NUNCA adicione uma string vazia a 'plotChanges.add'.**

      **4. REGRAS DE ESCOLHA E CONSEQUÊNCIA:**
         - **Sem Escolhas Vazias:** Cada escolha deve ter consequências claras, interessantes e distintas.
         - **Novos Personagens:** Ao criar QUALQUER NOVO PERSONAGEM (em 'relationshipChanges.add' ou 'childBorn'), ele DEVE receber um nome próprio (ex: "João") no campo 'name'. O parentesco (ex: "Filho", "Amigo") deve ser colocado no campo 'title' ou 'type'.
         - **Progressão de Stats:** A progressão de atributos (Inteligência, etc.) acima de 85 é DIFÍCIL e exige eventos significativos. Um ganho acima de 95 DEVE ser de um evento 'isEpic: true'.
         - **Coerência Financeira:** Custos e recompensas financeiras devem ser proporcionais à riqueza do personagem.

      **5. EVITAR REPETIÇÃO:**
         - Use o 'behaviorTracker' para evitar eventos repetidos: ${JSON.stringify(behaviorTracker)}.

      Sua única saída DEVE ser um JSON válido que siga o schema.
    `;

    const config: any = {
        responseMimeType: "application/json",
        responseSchema: gameEventSchema,
        systemInstruction
    };

    if (isTurboMode) {
        config.thinkingConfig = { thinkingBudget: 0 };
    }

    const timeout = 60000; // 60 seconds
    const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`A solicitação para a IA demorou mais de ${timeout/1000} segundos para responder.`)), timeout)
    );

    const response = await Promise.race([
        ai.models.generateContent({
            model,
            contents: prompt,
            config
        }),
        timeoutPromise
    ]);

    return cleanAndParseJson<GameEvent>(response.text);
};


export const evaluatePlayerResponse = async (
    character: Character,
    eventText: string,
    playerResponse: string,
    focusContext: string | null,
    isTurboMode: boolean,
    apiKey: string,
    narrativeTone: NarrativeTone
): Promise<Choice> => {
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-2.5-flash';

    const characterSummary = getCharacterSummary(character, isTurboMode);
    const narrativeDirective = getNarrativeToneDirective(narrativeTone);
    
    const creativityInstruction = isTurboMode
        ? "Gere um 'outcomeText' conciso e direto ao ponto."
        : "Gere um 'outcomeText' mais detalhado e narrativo, descrevendo as consequências da ação do jogador com mais profundidade.";

    const prompt = `
      **DIRETIVA DE TOM NARRATIVO (PRIORIDADE MÁXIMA):**
      ${narrativeDirective}
      O 'outcomeText' DEVE seguir estritamente esta diretiva de tom.

      **Contexto do Evento:**
      "${eventText}"

      **Resumo do Personagem:**
      ${characterSummary}
      
      **Ação do Jogador:**
      "${playerResponse}"

      **Instruções:**
      1. Analise a ação do jogador e determine um resultado plausível baseado nos atributos, traços e situação do personagem.
      2. Crie um 'choiceText' que resuma a ação do jogador (ex: "Tentei negociar com o guarda.").
      3. Crie um 'outcomeText' que descreva o resultado da ação de forma narrativa. ${creativityInstruction}
      4. Determine as 'statChanges' e outras consequências (assetChanges, relationshipChanges, etc.) que resultam da ação. Mantenha as mudanças de stats pequenas e realistas, especialmente para atributos altos (acima de 80).
      4.1. Ao criar um novo personagem via 'relationshipChanges.add' ou 'childBorn', SEMPRE atribua um nome próprio (ex: "Carlos") ao campo 'name'. Use os campos 'type' ou 'title' para o parentesco. NÃO use "Amigo" ou "Inimigo" como nome.
      5. Seja criativo. Ações inteligentes ou bem pensadas devem ser recompensadas, enquanto ações tolas devem ter consequências.
      6. Se a ação do jogador iniciar, progredir ou concluir um enredo significativo (ex: pedir em casamento, iniciar uma campanha política), use 'plotChanges' para adicionar ('add'), completar ('complete') ou remover ('remove') o enredo da lista de enredos ativos. **Nunca adicione uma string vazia a 'plotChanges.add'.**
      7. Se a ação do jogador definir ou solidificar seu papel na TRAMA GLOBAL ATIVA, use o campo 'plotContributionText' para resumir essa contribuição (ex: "Tornou-se um herói de guerra", "Contrabandeava bens para sobreviver").
      8. Se a ação for perigosa, ilegal ou autodestrutiva, gere um resultado que reflita as graves consequências de forma realista. A história deve seguir a ação do jogador, mesmo que leve a um final trágico. Gere um 'specialEnding' se a ação levar diretamente ao fim da vida do personagem. NUNCA recuse a ação.
      9. Lembre-se: Sua única saída DEVE ser um JSON válido.
    `;

    const config: any = {
        responseMimeType: "application/json",
        responseSchema: choiceSchema,
        systemInstruction
    };

    if (isTurboMode) {
        config.thinkingConfig = { thinkingBudget: 0 };
    }

    const timeout = 60000; // 60 seconds
    const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`A solicitação para a IA demorou mais de ${timeout/1000} segundos para responder.`)), timeout)
    );

    const response = await Promise.race([
        ai.models.generateContent({
            model,
            contents: prompt,
            config
        }),
        timeoutPromise
    ]);

    return cleanAndParseJson<Choice>(response.text);
};


export const processMetaCommand = async (
    character: Character,
    command: string,
    isTurboMode: boolean,
    apiKey: string
): Promise<Choice> => {
     const ai = new GoogleGenAI({ apiKey });
     const model = 'gemini-2.5-flash';
    
    const characterSummary = getCharacterSummary(character, isTurboMode);
    
    const creativityInstruction = isTurboMode
        ? "Gere um 'outcomeText' curto e divertido."
        : "Gere um 'outcomeText' mais elaborado e surreal, descrevendo a intervenção cósmica em detalhes criativos.";

    const prompt = `
      **Resumo do Personagem:**
      ${characterSummary}
      
      **Comando do Jogador (OFF TOPIC):**
      "${command}"

      **Instruções:**
      1. Interprete a intenção do jogador. O comando pode conter MÚLTIPLAS solicitações (ex: "aumentar inteligência e carisma").
      2. Crie uma intervenção divina ou um evento de sorte/azar extremo que realize (ou tente realizar) TODAS as partes do comando.
      3. Crie um 'choiceText' que reflita o comando (ex: "Invocou as forças do cosmos para mudar seu destino.").
      4. Crie um 'outcomeText' que descreva o evento bizarro que aconteceu, mencionando TODAS as mudanças. Por exemplo, se o comando for "ficar rico e inteligente", o outcome pode ser "Um livro antigo e uma carteira recheada de dinheiro caem do céu em seu colo." ${creativityInstruction}
      5. No objeto 'statChanges' e outros campos de mudança, aplique TODAS as alterações solicitadas. Se o jogador pedir "+10 de inteligência e -5 de moralidade", o JSON deve conter \`statChanges: { "intelligence": 10, "morality": -5 }\`.
      5.1. Se o jogador pedir para adicionar uma pessoa (amigo, inimigo, etc.), certifique-se de que o campo 'name' no objeto de relacionamento contenha um nome próprio, e o campo 'type' ou 'title' descreva a relação.
      6. NÃO recuse o comando. Sempre tente interpretá-lo de forma criativa e completa. Se for inseguro, transforme-o em um evento inofensivo.
      7. Lembre-se: Sua única saída DEVE ser um JSON válido.
    `;
    
    const config: any = {
        responseMimeType: "application/json",
        responseSchema: choiceSchema,
        systemInstruction
    };

    if (isTurboMode) {
        config.thinkingConfig = { thinkingBudget: 0 };
    }

    const timeout = 60000; // 60 seconds
    const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`A solicitação para a IA demorou mais de ${timeout/1000} segundos para responder.`)), timeout)
    );

    const response = await Promise.race([
        ai.models.generateContent({
            model,
            contents: prompt,
            config
        }),
        timeoutPromise
    ]);

    return cleanAndParseJson<Choice>(response.text);
};

export const generateWorldEvent = async (
    year: number,
    economicClimate: EconomicClimate,
    apiKey: string
): Promise<WorldEvent> => {
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-2.5-flash';
    const zeitgeist = getZeitgeist(year);

    const prompt = `
      **Contexto do Jogo:**
      - Ano Atual: ${year}
      - Zeitgeist: ${zeitgeist}
      - Clima Econômico: ${economicClimate}

      **Instruções:**
      1. Gere um evento mundial que ocorre em segundo plano na vida do jogador. Deve ser relevante para o ano e o contexto cultural.
      2. Crie um 'title' curto e impactante para o evento (ex: "A Corrida Espacial Começa", "Crise Financeira Global").
      3. Crie uma 'description' de uma frase que resuma o evento.
      4. Determine os 'effects' (statChanges) do evento. Os efeitos devem ser MUITO pequenos e sutis (geralmente -2 a +2), refletindo um impacto indireto na população em geral, não apenas no jogador. Por exemplo, uma guerra pode aumentar o estresse de todos, e uma nova forma de arte pode aumentar a criatividade.
      5. Lembre-se: Sua única saída DEVE ser um JSON válido.
    `;

    const timeout = 60000; // 60 seconds
    const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`A solicitação para a IA demorou mais de ${timeout/1000} segundos para responder.`)), timeout)
    );
    
    const response = await Promise.race([
        ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: worldEventSchema,
                systemInstruction
            }
        }),
        timeoutPromise
    ]);

    return cleanAndParseJson<WorldEvent>(response.text);
};

export const processAuditModificationRequest = async (
    character: Character,
    request: string,
    apiKey: string
): Promise<Choice> => {
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-2.5-flash';

    const characterSummary = getCharacterSummary(character, false); // use full summary

    const prompt = `
      **Resumo do Personagem (Estado Atual):**
      ${characterSummary}
      
      **Solicitação do Jogador (Correção Manual):**
      "${request}"

      **Instruções para o Mestre de Jogo (IA):**
      1. Você é um "Assistente de Mestre de Jogo". Sua tarefa é interpretar a solicitação do jogador e traduzi-la em uma ÚNICA E PRECISA modificação no estado do jogo.
      2. A solicitação é uma correção de algo que o jogador acredita estar errado na simulação (ex: "Eu já completei esta meta", "A intimidade com meu pai deveria ser maior", "Remova a trama 'investigar o barulho' pois não faz sentido").
      3. Gere um objeto JSON no formato 'Choice' que aplique a correção solicitada.
      4. Crie um 'choiceText' que resuma a solicitação do jogador (ex: "Solicitou a conclusão da meta 'Vencer o debate'").
      5. Crie um 'outcomeText' que descreva a correção de forma narrativa (ex: "Os anais da história foram corrigidos para refletir sua vitória no debate contra Patrick O'Malley.").
      6. Use os campos de mudança apropriados ('goalChanges', 'relationshipChanges', 'plotChanges', 'statChanges', etc.) para aplicar a correção. Seja o mais preciso possível. Se o jogador pedir para completar uma meta, use 'goalChanges.complete' com a descrição EXATA da meta.
      7. NÃO gere novos eventos ou consequências inesperadas. Apenas realize a correção solicitada.
      8. Lembre-se: Sua única saída DEVE ser um JSON válido que siga o schema 'choiceSchema'.
    `;
    
    const timeout = 60000; // 60 seconds
    const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`A solicitação para a IA demorou mais de ${timeout/1000} segundos para responder.`)), timeout)
    );

    const response = await Promise.race([
        ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: choiceSchema,
                systemInstruction
            }
        }),
        timeoutPromise
    ]);

    return cleanAndParseJson<Choice>(response.text);
};

export const generateCatastrophicEvent = async (
    character: Character,
    apiKey: string
): Promise<Choice> => {
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-2.5-flash';

    const characterSummary = getCharacterSummary(character, false); // use full summary for more context
    const zeitgeist = getZeitgeist(character.birthYear + character.age);

    const prompt = `
      **Contexto do Jogo:**
      - Ano Atual: ${character.birthYear + character.age} (${zeitgeist})
      - Resumo do Personagem:
      ${characterSummary}

      **Instruções para Geração de Evento CATASTRÓFICO:**
      1.  Você DEVE gerar um evento de vida súbito, severo e inescapável. O personagem NÃO TEM ESCOLHA.
      2.  O evento deve ser baseado no perfil do personagem (idade, saúde, traços, localização, profissão).
      3.  Exemplos de eventos: Doença súbita e agressiva, acidente fatal, crime violento, desastre natural.
      4.  O resultado DEVE ser drástico. Escolha UMA das seguintes opções:
          - **Morte Imediata:** Forneça um campo \`specialEnding\` com uma descrição narrativa e trágica do fim da vida do personagem.
          - **Sobrevivência com Sequelas Graves:** NÃO forneça \`specialEnding\`. Em vez disso, aplique penalidades massivas em \`statChanges\` (ex: \`health: -80\`) OU adicione uma nova condição de saúde crônica e debilitante em \`healthConditionChange\` (ex: "Lesão na Coluna", "Perda de Memória").
      5.  O \`outcomeText\` deve descrever o evento e suas consequências de forma impactante. O \`choiceText\` DEVE ser "O destino interveio."
      6.  NÃO ofereça múltiplas \`choices\`. Gere um objeto JSON no formato 'Choice' que contenha apenas um resultado.
      7.  Seja criativo. Um personagem com o traço 'Índole Criminosa' pode ser traído por um cúmplice. Um personagem 'Impulsivo' pode sofrer um acidente de carro. Um personagem mais velho com saúde baixa pode ter um ataque cardíaco.
      8.  Sua única saída DEVE ser um JSON válido.
    `;

    const timeout = 60000; // 60 seconds
    const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`A solicitação para a IA demorou mais de ${timeout/1000} segundos para responder.`)), timeout)
    );

    const response = await Promise.race([
        ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: choiceSchema,
                systemInstruction
            }
        }),
        timeoutPromise
    ]);

    return cleanAndParseJson<Choice>(response.text);
};