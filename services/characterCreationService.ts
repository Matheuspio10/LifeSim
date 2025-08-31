import { Character, FamilyBackground, RelationshipType, LegacyBonuses, Trait, Lineage, Mood, FounderTraits, Relationship } from '../types';
import { BIRTHPLACES, LIFE_GOALS, LAST_NAMES, FIRST_NAMES, LINEAGE_TITLES } from '../constants';
import { GENDERS, SKIN_TONES, HAIR_STYLES, ACCESSORIES, PERSONALITY_PROFILES, BACKSTORIES } from '../characterCreatorConstants';

const getRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomKey = <T extends object>(obj: T): keyof T => getRandom(Object.keys(obj) as (keyof T)[]);
const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

export const generateRandomCharacter = (lineage: Lineage | null, legacyBonuses: LegacyBonuses | null, birthYear: number): Character => {
    const family = lineage?.lastKnownWealthTier ? lineage.lastKnownWealthTier : getRandom([FamilyBackground.POOR, FamilyBackground.MIDDLE_CLASS, FamilyBackground.WEALTHY]);
        
    let startingWealth = 0;
    if (family === FamilyBackground.MIDDLE_CLASS) startingWealth = 500;
    if (family === FamilyBackground.WEALTHY) startingWealth = 5000;
    
    const lineageBonus: LegacyBonuses = lineage?.title ? LINEAGE_TITLES.find(t => t.name === lineage.title)?.bonus || {} : {};
    const purchasedBonuses: LegacyBonuses = legacyBonuses || {};

    const allBonuses: Required<LegacyBonuses> = {
        wealth: (lineageBonus.wealth || 0) + (purchasedBonuses.wealth || 0),
        intelligence: (lineageBonus.intelligence || 0) + (purchasedBonuses.intelligence || 0),
        charisma: (lineageBonus.charisma || 0) + (purchasedBonuses.charisma || 0),
        creativity: (lineageBonus.creativity || 0) + (purchasedBonuses.creativity || 0),
        discipline: (lineageBonus.discipline || 0) + (purchasedBonuses.discipline || 0),
        health: (lineageBonus.health || 0) + (purchasedBonuses.health || 0),
        fame: (lineageBonus.fame || 0) + (purchasedBonuses.fame || 0),
        influence: (lineageBonus.influence || 0) + (purchasedBonuses.influence || 0),
        favors: (lineageBonus.favors || 0) + (purchasedBonuses.favors || 0),
        addTraits: [...(lineageBonus.addTraits || []), ...(purchasedBonuses.addTraits || [])].filter(t => t),
        addSkills: [...(lineageBonus.addSkills || []), ...(purchasedBonuses.addSkills || [])].filter(h => h),
        addAssets: [...(lineageBonus.addAssets || []), ...(purchasedBonuses.addAssets || [])].filter(a => a),
        addRelationships: [...(lineageBonus.addRelationships || []), ...(purchasedBonuses.addRelationships || [])].filter(r => r),
        inheritedSecret: purchasedBonuses.inheritedSecret || lineageBonus.inheritedSecret || ''
    };
    
    const profile = getRandom(PERSONALITY_PROFILES);

    const initialTraits: Trait[] = [...profile.traits, ...allBonuses.addTraits]
        .filter((trait, index, self) => trait && index === self.findIndex(t => t && t.name === trait.name));

    const founderTraits: FounderTraits = lineage 
        ? lineage.founderTraits
        : { 
            skinTone: getRandom(SKIN_TONES),
            hairColor: getRandom(LAST_NAMES), // Using last names for more color variety
            eyeColor: getRandom(LAST_NAMES),
            hairstyle: getRandomKey(HAIR_STYLES),
            accessories: { glasses: getRandomKey(ACCESSORIES) }
          };
    
    const pointPool = 40;
    const baseStat = 10;
    const distributePoints = (points: number, bins: number): number[] => {
        const values = Array(bins).fill(0);
        let remainingPoints = points;
        while (remainingPoints > 0) {
            const binIndex = Math.floor(Math.random() * bins);
            values[binIndex]++;
            remainingPoints--;
        }
        return values;
    };
    const distributedPoints = distributePoints(pointPool, 4);
    
    const birthplace = lineage?.lastKnownLocation ? lineage.lastKnownLocation : getRandom(BIRTHPLACES);

    const newChar: Character = {
        name: getRandom(FIRST_NAMES),
        lastName: lineage ? lineage.lastName : getRandom(LAST_NAMES),
        gender: getRandom(GENDERS),
        generation: lineage ? lineage.generation + 1 : 1,
        birthYear: birthYear,
        age: 5,
        health: getRandomInt(65, 85) + allBonuses.health,
        intelligence: baseStat + distributedPoints[0] + allBonuses.intelligence,
        charisma: baseStat + distributedPoints[1] + allBonuses.charisma,
        creativity: baseStat + distributedPoints[2] + allBonuses.creativity,
        discipline: baseStat + distributedPoints[3] + allBonuses.discipline,
        happiness: getRandomInt(60, 80),
        energy: getRandomInt(70, 90),
        stress: getRandomInt(5, 20),
        luck: getRandomInt(30, 70),
        wealth: startingWealth + allBonuses.wealth,
        investments: 0,
        morality: 0,
        fame: allBonuses.fame,
        influence: allBonuses.influence,
        birthplace: birthplace,
        currentLocation: birthplace,
        familyBackground: family,
        backstory: getRandom(BACKSTORIES),
        traits: initialTraits,
        assets: [...allBonuses.addAssets],
        relationships: [
            { name: 'Mãe', type: RelationshipType.FAMILY, intimacy: getRandomInt(50, 70), history: [], age: getRandomInt(25, 35) + 5, title: 'Mãe', gender: 'Feminino' },
            { name: 'Pai', type: RelationshipType.FAMILY, intimacy: getRandomInt(50, 70), history: [], age: getRandomInt(25, 38) + 5, title: 'Pai', gender: 'Masculino' },
            ...allBonuses.addRelationships
        ],
        memories: [],
        craftedItems: [],
        lifeGoals: [{ description: getRandom(LIFE_GOALS), completed: false }],
        skills: [...allBonuses.addSkills],
        ongoingPlots: [],
        healthCondition: null,
        founderTraits,
        favors: allBonuses.favors,
        inheritedSecret: allBonuses.inheritedSecret || null,
        profession: null,
        jobTitle: null,
        careerLevel: 0,
        jobSatisfaction: 0,
    };
    
    Object.keys(newChar).forEach(keyStr => {
        const key = keyStr as keyof Character;
        if (typeof newChar[key] === 'number' && !['generation', 'birthYear', 'age', 'favors', 'wealth', 'investments', 'morality', 'fame', 'influence', 'careerLevel'].includes(key)) {
            (newChar[key] as number) = Math.max(5, Math.min(100, newChar[key] as number));
        }
    });

    return newChar;
};