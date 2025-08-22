
import { LifeStage, WeeklyChallenge, Character, RelationshipType, WeeklyFocus, HobbyType } from './types';

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
        statChanges: { discipline: 2, wealth: 50, health: -1 }
    },
    {
        id: 'social',
        name: 'Vida Social',
        description: 'Passe tempo com amigos e familiares, construindo laços.',
        iconName: 'UsersIcon',
        statChanges: { charisma: 2, health: 1, wealth: -20 }
    },
    {
        id: 'health',
        name: 'Saúde e Bem-estar',
        description: 'Cuide do corpo e da mente com exercícios e descanso.',
        iconName: 'HeartPulseIcon',
        statChanges: { health: 3, discipline: 1, wealth: -25 }
    },
    {
        id: 'studies',
        name: 'Estudo e Desenvolvimento',
        description: 'Aprenda novas habilidades e expanda seu conhecimento.',
        iconName: 'AcademicCapIcon',
        statChanges: { intelligence: 3, creativity: 1, health: -1 }
    },
     {
        id: 'hobby_art',
        name: 'Praticar Arte',
        description: 'Passe tempo pintando, desenhando ou esculpindo.',
        iconName: 'PaintBrushIcon',
        statChanges: { creativity: 2, health: 1, wealth: -15 },
        hobbyType: HobbyType.ART
    },
    {
        id: 'hobby_music',
        name: 'Praticar Música',
        description: 'Toque um instrumento, componha ou ensaie com sua banda.',
        iconName: 'MusicalNoteIcon',
        statChanges: { creativity: 1, charisma: 1, health: 1, wealth: -15 },
        hobbyType: HobbyType.MUSIC
    },
    {
        id: 'leisure',
        name: 'Lazer e Descanso',
        description: 'Relaxe e recarregue as energias para evitar o esgotamento.',
        iconName: 'HomeIcon',
        statChanges: { health: 2, wealth: -20 }
    },
    {
        id: 'investments',
        name: 'Investir no Mercado',
        description: 'Estude o mercado financeiro e aplique seu dinheiro para gerar retornos.',
        iconName: 'ChartBarIcon',
        statChanges: { intelligence: 2, discipline: 1, wealth: -50 }
    },
    {
        id: 'networking',
        name: 'Expandir Contatos',
        description: 'Participe de eventos e conheça pessoas influentes para expandir sua rede.',
        iconName: 'SpeakerWaveIcon',
        statChanges: { charisma: 2, influence: 1, wealth: -30 }
    },
    {
        id: 'side_hustle',
        name: 'Projeto Paralelo',
        description: 'Comece um pequeno negócio ou projeto para gerar uma renda extra.',
        iconName: 'CurrencyDollarIcon',
        statChanges: { creativity: 1, discipline: 2, wealth: 25, health: -2 }
    },
    {
        id: 'family_time',
        name: 'Tempo com a Família',
        description: 'Dedique tempo de qualidade aos seus parentes mais próximos, fortalecendo os laços.',
        iconName: 'HeartIcon',
        statChanges: { charisma: 1, health: 2, wealth: -10 }
    },
    {
        id: 'hobby_sports',
        name: 'Praticar Esportes',
        description: 'Treine seu corpo, participe de competições amadoras e melhore sua saúde.',
        iconName: 'TrophyIcon',
        statChanges: { health: 3, discipline: 1, wealth: -20 },
        hobbyType: HobbyType.SPORTS
    },
    {
        id: 'hobby_cooking',
        name: 'Aprender Culinária',
        description: 'Explore novas receitas e técnicas na cozinha para impressionar amigos e família.',
        iconName: 'BeakerIcon',
        statChanges: { creativity: 2, health: 1, wealth: -20 },
        hobbyType: HobbyType.COOKING
    },
    {
        id: 'illegal_schemes',
        name: 'Esquemas Ilegais',
        description: 'Envolva-se em atividades ilícitas para ganhar dinheiro rápido, mas com alto risco.',
        iconName: 'ShieldExclamationIcon',
        statChanges: { wealth: 250, morality: -10, health: -2, discipline: -1 }
    },
    {
        id: 'nightlife',
        name: 'Vida Noturna Intensa',
        description: 'Frequente festas e eventos noturnos, expandindo contatos de forma arriscada.',
        iconName: 'SparklesIcon',
        statChanges: { charisma: 2, creativity: 1, health: -3, discipline: -2 }
    },
    {
        id: 'gambling',
        name: 'Apostar e Jogar',
        description: 'Arrisque seu dinheiro em jogos de azar, com a chance de ganhar ou perder tudo.',
        iconName: 'CurrencyDollarIcon',
        statChanges: { wealth: -40, discipline: -2 },
        hobbyType: HobbyType.GAMBLING
    },
    {
        id: 'politics',
        name: 'Política e Lobbies',
        description: 'Mergulhe no universo do poder, campanhas e acordos de bastidores.',
        iconName: 'SpeakerWaveIcon',
        statChanges: { influence: 3, charisma: 1, morality: -2, wealth: -40, health: -1 }
    },
    {
        id: 'dating',
        name: 'Aventuras Amorosas',
        description: 'Procure por romance, de paixões passageiras a conexões profundas.',
        iconName: 'HeartIcon',
        statChanges: { charisma: 2, health: 2, wealth: -30, discipline: -1 }
    }
];
