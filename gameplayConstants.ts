import { LifeStage, WeeklyChallenge, Character, RelationshipType, WeeklyFocus, FamilyBackground, HiddenGoal } from './types';

export const MAX_FOCUS_POINTS = 3;
export const TOTAL_MONTHS_PER_YEAR = 12;

export const LIFE_GOALS: string[] = [
    'Viver uma vida simples e pacífica no campo.',
    'Tornar-se um grande artista respeitado pela sua comunidade.',
    'Construir uma família unida e feliz, cheia de amor e tradições.',
    'Conhecer e viajar por diferentes países do mundo.',
    'Superar obstáculos e ser o orgulho da sua família.',
    'Fundar um negócio próprio de sucesso e ser independente.',
    'Se dedicar à pesquisa científica para mudar o mundo.',
    'Dominar um instrumento musical e emocionar multidões com sua música.',
    'Proteger o meio ambiente promovendo iniciativas ecológicas.',
    'Formar-se em uma universidade de prestígio e deixar sua marca no mundo acadêmico.',
    'Ser reconhecido pela solidariedade e ajudar quem mais precisa.',
    'Escrever um livro que inspire gerações futuras.',
    'Encontrar o amor verdadeiro e construir uma vida a dois plena.',
    'Ser um atleta destaque e representar sua cidade ou país em campeonatos.',
    'Descobrir o sentido da própria vida através do autoconhecimento.',
    'Cuidar dos pais na velhice e honrar as raízes familiares.',
    'Fazer parte de um movimento social ou político transformador.',
    'Construir uma bela casa com um grande jardim para chamar de lar.',
    'Aprender várias línguas e fazer amigos pelo mundo inteiro.',
    'Ser um bom exemplo para os irmãos mais novos.',
    'Viver livre de preocupações financeiras, com estabilidade e conforto.',
    'Ter uma horta produtiva e viver perto da terra, de forma sustentável.',
    'Realizar o sonho de empreender e abrir um restaurante próprio.',
    'Ser feliz com pouco, valorizando os pequenos momentos da vida.',
    'Deixar um legado cultural ou artístico na sua comunidade.',
    'Ter saúde e disposição para aproveitar cada fase da vida.',
    'Encontrar paz espiritual e ajudar os outros a encontrarem também.',
    'Criar um projeto social que mude realidades locais.',
    'Excursionar com um grupo musical ou teatral pelo país.',
    'Construir amizades verdadeiras que durem para sempre.',
    'Tornar-se o chefe do crime mais temido da cidade.',
    'Acumular poder e influência para controlar tudo e todos.',
    'Viver uma vida de hedonismo puro, buscando prazer acima de tudo.',
    'Construir um império financeiro, não importa o custo ético.',
    'Alcançar a fama a qualquer preço, mesmo que seja pela infâmia.',
];

export const HIDDEN_GOALS: HiddenGoal[] = [
    {
        id: 'self_made',
        name: 'Do Nada ao Tudo',
        description: 'Começou pobre e se tornou um milionário por mérito próprio.',
        condition: (char: Character) => char.familyBackground === FamilyBackground.POOR && (char.wealth + char.investments) >= 1000000,
        reward: 200
    },
    {
        id: 'late_parent',
        name: 'Paternidade Tardia',
        description: 'Teve um filho após os 50 anos de idade.',
        condition: (char: Character) => {
            return char.age > 50 && char.relationships.some(r => 
                (r.title === 'Filho' || r.title === 'Filha') && 
                r.age !== undefined && 
                r.age < (char.age - 50)
            );
        },
        reward: 50
    },
    {
        id: 'polymath',
        name: 'O Polímata',
        description: 'Atingiu o nível de mestre (90+) em Inteligência, Criatividade e Disciplina.',
        condition: (char: Character) => char.intelligence >= 90 && char.creativity >= 90 && char.discipline >= 90,
        reward: 150
    },
    {
        id: 'perfect_stat',
        name: 'A Perfeição',
        description: 'Alcançou o ápice do potencial humano, atingindo 100 em um atributo.',
        condition: (char: Character) => char.intelligence === 100 || char.charisma === 100 || char.creativity === 100 || char.discipline === 100,
        reward: 100
    },
    {
        id: 'debt_free_elder',
        name: 'Velhice Dourada',
        description: 'Chegou aos 80 anos sem nenhuma dívida.',
        condition: (char: Character) => char.age >= 80 && char.wealth >= 0,
        reward: 75
    },
];

export const LIFE_STAGES: Record<LifeStage, { minAge: number; maxAge: number }> = {
  [LifeStage.CHILDHOOD]: { minAge: 0, maxAge: 12 },
  [LifeStage.ADOLESCENCE]: { minAge: 13, maxAge: 19 },
  [LifeStage.YOUNG_ADULTHOOD]: { minAge: 20, maxAge: 35 },
  [LifeStage.ADULTHOOD]: { minAge: 36, maxAge: 65 },
  [LifeStage.OLD_AGE]: { minAge: 66, maxAge: 100 },
};

export const WEEKLY_CHALLENGES: WeeklyChallenge[] = [
    {
        id: 'magnate',
        name: 'O Magnata',
        description: 'Acumule uma fortuna de mais de $1,000,000.',
        condition: (char: Character) => char.wealth + char.investments >= 1000000,
        reward: 50,
    },
    {
        id: 'centenarian',
        name: 'O Centenário',
        description: 'Viva até os 100 anos de idade.',
        condition: (char: Character) => char.age >= 100,
        reward: 30,
    },
    {
        id: 'sage',
        name: 'O Sábio',
        description: 'Alcance 95 ou mais em Inteligência.',
        condition: (char: Character) => char.intelligence >= 95,
        reward: 25,
    },
    {
        id: 'superstar',
        name: 'A Lenda Viva',
        description: 'Alcance 90 ou mais em Fama.',
        condition: (char: Character) => char.fame >= 90,
        reward: 35,
    },
    {
        id: 'family',
        name: 'O(A) Patriarca/Matriarca',
        description: 'Construa uma família amorosa (mínimo 4 relações familiares com intimidade > 80).',
        condition: (char: Character) => char.relationships.filter(r => r.type === RelationshipType.FAMILY && r.intimacy > 80).length >= 4,
        reward: 20,
    },
    {
        id: 'achiever',
        name: 'O Realizador',
        description: 'Complete 3 ou mais objetivos de vida.',
        condition: (char: Character) => char.lifeGoals.filter(g => g.completed).length >= 3,
        reward: 40,
    },
];

export const FOCUS_OPTIONS: WeeklyFocus[] = [
    {
        id: 'career',
        name: 'Foco na Carreira',
        description: 'Dedique-se ao trabalho ou aos estudos para progredir.',
        iconName: 'BriefcaseIcon',
        statChanges: { discipline: 2, health: -1, stress: 5, energy: -5, jobSatisfaction: 1 },
        costFactors: { base: 100, careerLevelMultiplier: 50 }
    },
    {
        id: 'social',
        name: 'Vida Social',
        description: 'Passe tempo com amigos e familiares, construindo laços.',
        iconName: 'UsersIcon',
        statChanges: { charisma: 2, happiness: 5, stress: -3, energy: 2 },
        costFactors: { base: 50 }
    },
    {
        id: 'health',
        name: 'Saúde e Bem-estar',
        description: 'Cuide do corpo e da mente com exercícios e descanso.',
        iconName: 'HeartPulseIcon',
        statChanges: { health: 3, discipline: 1, happiness: 3, stress: -4, energy: 5 },
        costFactors: { base: 75 }
    },
    {
        id: 'studies',
        name: 'Estudo e Desenvolvimento',
        description: 'Aprenda novas habilidades e expanda seu conhecimento.',
        iconName: 'AcademicCapIcon',
        statChanges: { intelligence: 3, creativity: 1, health: -1, stress: 2, energy: -3 },
        costFactors: { base: 60 }
    },
     {
        id: 'hobby_art',
        name: 'Praticar Arte',
        description: 'Passe tempo pintando, desenhando ou esculpindo.',
        iconName: 'PaintBrushIcon',
        statChanges: { creativity: 2, happiness: 4, stress: -2 },
        skillName: 'Arte',
        costFactors: { base: 30 }
    },
    {
        id: 'hobby_music',
        name: 'Praticar Música',
        description: 'Toque um instrumento, componha ou ensaie com sua banda.',
        iconName: 'MusicalNoteIcon',
        statChanges: { creativity: 1, charisma: 1, happiness: 4, stress: -2 },
        skillName: 'Música',
        costFactors: { base: 30 }
    },
    {
        id: 'leisure',
        name: 'Lazer e Descanso',
        description: 'Relaxe e recarregue as energias para evitar o esgotamento.',
        iconName: 'HomeIcon',
        statChanges: { health: 2, happiness: 5, stress: -5, energy: 10 },
        costFactors: { base: 40 }
    },
    {
        id: 'investments',
        name: 'Investir no Mercado',
        description: 'Estude o mercado financeiro e aplique seu dinheiro para gerar retornos.',
        iconName: 'ChartBarIcon',
        statChanges: { intelligence: 2, discipline: 1, stress: 3 },
        costFactors: { base: 200, wealthMultiplier: 0.005 }
    },
    {
        id: 'networking',
        name: 'Expandir Contatos',
        description: 'Participe de eventos e conheça pessoas influentes para expandir sua rede.',
        iconName: 'SpeakerWaveIcon',
        statChanges: { charisma: 2, influence: 1, energy: -2 },
        costFactors: { base: 100, influenceMultiplier: 25 }
    },
    {
        id: 'side_hustle',
        name: 'Projeto Paralelo',
        description: 'Invista tempo e dinheiro em um pequeno negócio para gerar uma renda futura.',
        iconName: 'CurrencyDollarIcon',
        statChanges: { creativity: 1, discipline: 2, health: -2, stress: 4, energy: -6 },
        costFactors: { base: 150 }
    },
    {
        id: 'family_time',
        name: 'Tempo com a Família',
        description: 'Dedique tempo de qualidade aos seus parentes mais próximos, fortalecendo os laços.',
        iconName: 'HeartIcon',
        statChanges: { charisma: 1, happiness: 6, stress: -4 },
        costFactors: { base: 20 }
    },
    {
        id: 'hobby_sports',
        name: 'Praticar Esportes',
        description: 'Treine seu corpo, participe de competições amadoras e melhore sua saúde.',
        iconName: 'TrophyIcon',
        statChanges: { health: 3, discipline: 1, energy: 3, stress: -2 },
        skillName: 'Esportes',
        costFactors: { base: 50 }
    },
    {
        id: 'hobby_cooking',
        name: 'Aprender Culinária',
        description: 'Explore novas receitas e técnicas na cozinha para impressionar amigos e família.',
        iconName: 'BeakerIcon',
        statChanges: { creativity: 2, health: 1, happiness: 3 },
        skillName: 'Culinária',
        costFactors: { base: 40 }
    },
    {
        id: 'illegal_schemes',
        name: 'Esquemas Ilegais',
        description: 'Invista em atividades ilícitas para ganhar dinheiro rápido, mas com alto risco.',
        iconName: 'ShieldExclamationIcon',
        statChanges: { morality: -10, health: -2, discipline: -1, stress: 8 },
        costFactors: { base: 500, wealthMultiplier: 0.001 }
    },
    {
        id: 'nightlife',
        name: 'Vida Noturna Intensa',
        description: 'Frequente festas e eventos noturnos, expandindo contatos de forma arriscada.',
        iconName: 'SparklesIcon',
        statChanges: { charisma: 2, creativity: 1, health: -3, discipline: -2, energy: -5, happiness: 4 },
        costFactors: { base: 100 }
    },
    {
        id: 'gambling',
        name: 'Apostar e Jogar',
        description: 'Arrisque seu dinheiro em jogos de azar, com a chance de ganhar ou perder tudo.',
        iconName: 'CurrencyDollarIcon',
        statChanges: { discipline: -2, stress: 5 },
        skillName: 'Jogos de Azar',
        costFactors: { base: 100 }
    },
    {
        id: 'politics',
        name: 'Política e Lobbies',
        description: 'Mergulhe no universo do poder, campanhas e acordos de bastidores.',
        iconName: 'SpeakerWaveIcon',
        statChanges: { influence: 2, charisma: 1, morality: -2, health: -1, stress: 6 },
        costFactors: { base: 250, influenceMultiplier: 100 }
    },
    {
        id: 'dating',
        name: 'Aventuras Amorosas',
        description: 'Procure por romance, de paixões passageiras a conexões profundas.',
        iconName: 'HeartIcon',
        statChanges: { charisma: 2, discipline: -1, happiness: 5, stress: 2 },
        costFactors: { base: 80 }
    }
];