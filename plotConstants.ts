import { GlobalPlot } from './types';

export const GLOBAL_PLOTS: GlobalPlot[] = [
    {
        id: 'great_war',
        title: 'A Grande Guerra',
        description: 'Uma conflagração global que redefine nações e devasta uma geração.',
        era: 'Era das Grandes Guerras',
        startYear: 1914,
        endYear: 1918,
        phases: [
            { id: 'gw_escalation', phaseTitle: 'Escalada para a Guerra', description: 'Tensões políticas explodem em um conflito em larga escala. O nacionalismo está em alta e a conscrição começa.', durationInYears: 1 },
            { id: 'gw_trenches', phaseTitle: 'Guerra de Trincheiras', description: 'A guerra se arrasta em um impasse brutal. Em casa, o racionamento é instituído e a economia é voltada para o esforço de guerra.', durationInYears: 2 },
            { id: 'gw_total_war', phaseTitle: 'Guerra Total', description: 'Toda a sociedade é mobilizada. A propaganda é intensa e a dissidência é perigosa. A vida civil é marcada pela escassez e pelo medo.', durationInYears: 1 },
            { id: 'gw_armistice', phaseTitle: 'O Armistício', description: 'A guerra termina, mas deixa um rastro de destruição e trauma. O mundo tenta se reconstruir das cinzas.', durationInYears: 1 },
        ]
    },
    {
        id: 'great_depression',
        title: 'A Grande Depressão',
        description: 'Um colapso econômico global que mergulha o mundo na pobreza e no desespero.',
        era: 'Era da Incerteza',
        startYear: 1929,
        endYear: 1939,
        phases: [
            { id: 'gd_crash', phaseTitle: 'A Quebra da Bolsa', description: 'O mercado de ações entra em colapso, evaporando fortunas e iniciando uma crise de desemprego.', durationInYears: 2 },
            { id: 'gd_slump', phaseTitle: 'A Longa Miséria', description: 'O desemprego atinge níveis recordes. A fome e a falta de moradia se tornam comuns, testando a resiliência de todos.', durationInYears: 4 },
            { id: 'gd_new_deal', phaseTitle: 'O Recomeço', description: 'Governos intervêm com programas de obras públicas e assistência social, criando novas oportunidades, mas também controvérsia.', durationInYears: 3 },
            { id: 'gd_recovery', phaseTitle: 'Recuperação Lenta', description: 'A economia começa a se recuperar, mas as cicatrizes da década perdida permanecem na mentalidade da população.', durationInYears: 2 },
        ]
    },
    {
        id: 'climate_collapse',
        title: 'O Colapso Climático',
        description: 'As consequências de séculos de poluição atingem um ponto sem retorno, forçando a humanidade a se adaptar ou perecer.',
        era: 'Era Futurista',
        startYear: 2040,
        endYear: 2060,
        phases: [
            { id: 'cc_tipping_point', phaseTitle: 'O Ponto de Inflexão', description: 'Desastres naturais se tornam mais frequentes e severos. A escassez de recursos começa a afetar a economia global.', durationInYears: 5 },
            { id: 'cc_disasters', phaseTitle: 'A Década dos Desastres', description: 'Supertempestades, secas prolongadas e aumento do nível do mar se tornam a nova realidade. A vida diária é uma luta pela sobrevivência.', durationInYears: 10 },
            { id: 'cc_migration', phaseTitle: 'A Grande Migração', description: 'Milhões são deslocados de zonas inabitáveis, criando tensões sociais massivas e cidades-fortaleza.', durationInYears: 5 },
        ]
    }
];
