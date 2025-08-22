import { Trait, FamilyBackground } from './types';
import { POSITIVE_TRAITS, NEGATIVE_TRAITS } from './characterConstants';

export const GENDERS = ['Masculino', 'Feminino', 'Não-binário'];

export const SKIN_TONES = ['#f2d47e', '#e0ac69', '#c68642', '#8d5524', '#654321', '#3c2e28'];

export const HAIR_STYLES = {
    'curto': 'Curto e Prático',
    'medio': 'Médio Ondulado',
    'longo': 'Longo e Liso',
    'careca': 'Careca',
    'coque': 'Coque Alto',
};

export const ACCESSORIES = {
    'none': 'Nenhum',
    'oculos-redondo': 'Óculos Redondos',
    'oculos-quadrado': 'Óculos Quadrados',
};

export const ATTRIBUTE_POOL = 60;
export const ATTRIBUTE_BASE = 10;
export const ATTRIBUTE_MIN = 0;
export const ATTRIBUTE_MAX = 100;

export const FAMILY_BACKGROUNDS = {
    [FamilyBackground.POOR]: { name: 'Pobre', description: 'Começa com pouco, mas com muita garra.', wealth: 0 },
    [FamilyBackground.MIDDLE_CLASS]: { name: 'Classe Média', description: 'Uma vida estável, sem luxos.', wealth: 500 },
    [FamilyBackground.WEALTHY]: { name: 'Rica', description: 'Nasceu em berço de ouro.', wealth: 5000 }
};

export const PERSONALITY_PROFILES: { name: string; description: string; traits: Trait[] }[] = [
    { name: 'O Ambicioso', description: 'Focado em sucesso e carreira, mas pode ser um pouco teimoso.', traits: [POSITIVE_TRAITS.find(t => t.name === 'Ambição de Ferro')!, NEGATIVE_TRAITS.find(t => t.name === 'Teimoso')!] },
    { name: 'O Artista Excêntrico', description: 'Uma mente borbulhante de ideias, embora um pouco avoada.', traits: [POSITIVE_TRAITS.find(t => t.name === 'Criativo')!, NEGATIVE_TRAITS.find(t => t.name === 'Distração Crônica')!] },
    { name: 'O Boa Praça', description: 'Amado por todos, mas não espere pontualidade ou muito esforço.', traits: [POSITIVE_TRAITS.find(t => t.name === 'Carismático')!, NEGATIVE_TRAITS.find(t => t.name === 'Preguiçoso')!] },
    { name: 'O Cínico Sarcástico', description: 'Inteligente e perspicaz, mas com uma visão de mundo um tanto sombria.', traits: [POSITIVE_TRAITS.find(t => t.name === 'Inteligência Rápida')!, NEGATIVE_TRAITS.find(t => t.name === 'Cínico')!] },
    { name: 'A Alma Bondosa', description: 'Sempre pronto para ajudar, mas às vezes ingênuo demais para seu próprio bem.', traits: [POSITIVE_TRAITS.find(t => t.name === 'Empático')!, NEGATIVE_TRAITS.find(t => t.name === 'Ingênuo')!] },
];

export const BACKSTORIES = [
    'Último herdeiro de uma fábrica de botões quase falida.',
    'Ex-celebridade mirim de um comercial de margarina que ninguém lembra.',
    'Fugiu de um culto que acreditava que as terças-feiras eram uma conspiração.',
    'Ganhou na loteria, mas perdeu o bilhete no bolso de uma calça que foi doada.',
    'Acreditava ser um gênio incompreendido, mas na verdade era só incompreendido mesmo.',
    'Criado por uma avó que era campeã de queda de braço e contadora de histórias.',
];