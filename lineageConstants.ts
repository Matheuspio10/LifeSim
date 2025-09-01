import React from 'react';
import { Character, LegacyBonuses } from './types';
import { POSITIVE_TRAITS, NEGATIVE_TRAITS } from './characterConstants';
import { LionIcon, TreeIcon, BookOpenIcon, SwordIcon } from '../components/Icons';

export interface LineageTitleInfo {
    name: string;
    description: string;
    condition: (char: Character) => boolean;
    bonus: LegacyBonuses;
    bonusDescription: string;
}

export const CREST_COLORS: string[] = [
    '#6b21a8', // purple-800
    '#be185d', // pink-700
    '#047857', // emerald-700
    '#b45309', // amber-700
    '#1d4ed8', // blue-700
    '#b91c1c', // red-700
];

export const CREST_SHAPES: ('circle' | 'shield')[] = [
    'circle',
    'shield'
];

export const CREST_ICONS: string[] = [
    'lion',
    'tree',
    'book',
    'sword',
];

// Fix: Replaced JSX syntax with React.createElement to resolve errors from using JSX in a .ts file.
export const ICON_MAP: Record<string, React.ReactNode> = {
  lion: React.createElement(LionIcon),
  tree: React.createElement(TreeIcon),
  book: React.createElement(BookOpenIcon),
  sword: React.createElement(SwordIcon),
};


// A ordem importa: Títulos mais específicos/difíceis devem vir primeiro.
export const LINEAGE_TITLES: LineageTitleInfo[] = [
    {
        name: 'O Clã Magnata',
        description: 'Uma linhagem de mestres financeiros, obcecados por riqueza e poder econômico.',
        condition: (char) => (char.wealth + char.investments) >= 1000000,
        bonus: { wealth: 25000, intelligence: 5 },
        bonusDescription: 'Comece com +$25.000 e +5 de Inteligência.'
    },
    {
        name: 'A Dinastia Artística',
        description: 'Uma família de visionários criativos, cuja fama ecoa através das gerações.',
        condition: (char) => char.fame >= 80 && char.creativity >= 80,
        bonus: { fame: 15, creativity: 10 },
        bonusDescription: 'Comece com +15 de Fama e +10 de Criatividade.'
    },
    {
        name: 'A Família de Políticos',
        description: 'Mestres da influência e do poder, moldando a sociedade a partir das sombras ou dos palanques.',
        condition: (char) => char.influence >= 80,
        bonus: { influence: 15, charisma: 5 },
        bonusDescription: 'Comece com +15 de Influência e +5 de Carisma.'
    },
    {
        name: 'A Casa dos Criminosos',
        description: 'Uma família infame que construiu seu império à margem da lei, temida e respeitada no submundo.',
        condition: (char) => (char.wealth + char.investments) >= 250000 && char.morality <= -60,
        bonus: { wealth: 15000, addTraits: [NEGATIVE_TRAITS.find(t => t.name === 'Índole Criminosa')!] },
        bonusDescription: 'Comece com +$15.000 e o traço "Índole Criminosa".'
    },
    {
        name: 'A Linhagem de Sábios',
        description: 'Uma linhagem de intelectuais, dedicados à busca do conhecimento acima de tudo.',
        condition: (char) => char.intelligence >= 95 && char.lifeGoals.filter(g => g.completed).length >= 1,
        bonus: { intelligence: 10 },
        bonusDescription: 'Comece com +10 de Inteligência.'
    },
    {
        name: 'A Linhagem dos Sobreviventes',
        description: 'Fortalecidos pela adversidade, esta família valoriza a saúde e a resiliência acima de tudo.',
        condition: (char) => char.age >= 95 && (char.healthCondition !== null || char.familyBackground === 'Pobre'),
        bonus: { health: 10 },
        bonusDescription: 'Comece com +10 de Saúde.'
    },
];