

import { Character, FamilyBackground, RelationshipType, LegacyBonuses, Trait, Lineage, Mood, FounderTraits, Relationship } from '../types';
import { BIRTHPLACES, LIFE_GOALS, LAST_NAMES, FIRST_NAMES, LINEAGE_TITLES } from '../constants';
import { GENDERS, SKIN_TONES, HAIR_STYLES, ACCESSORIES, PERSONALITY_PROFILES, BACKSTORIES } from '../characterCreatorConstants';

const getRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomKey = <T extends object>(obj: T): keyof T => getRandom(Object.keys(obj) as (keyof T)[]);
const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

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

export const createHeirCharacter = (heir: Relationship, parent: Character, lineage: Lineage, legacyPoints: number): Character => {
    // 1. Inherit core identity and lineage
    const newGeneration = parent.generation + 1;
    const birthYear = (parent.birthYear + parent.age) - (heir.age || 18);
    
    // 2. Calculate inherited wealth and starting family background
    const inheritedWealth = Math.floor((parent.wealth + parent.investments) * 0.5); // Inherits 50%
    let familyBg: FamilyBackground;
    if (inheritedWealth < 10000) familyBg = FamilyBackground.POOR;
    else if (inheritedWealth < 500000) familyBg = FamilyBackground.MIDDLE_CLASS;
    else familyBg = FamilyBackground.WEALTHY;

    // 3. Rebuild family relationships for consistency
    const newRelationships: Relationship[] = [];

    // Find the other living parent (the spouse of the deceased character)
    const survivingSpouse = parent.relationships.find(r => r.status === 'Married');
    if (survivingSpouse) {
        newRelationships.push({
            ...survivingSpouse,
            type: RelationshipType.FAMILY,
            title: survivingSpouse.gender === 'Masculino' ? 'Pai' : 'Mãe',
            intimacy: getRandomInt(60, 80),
            history: [`Meu/minha outro(a) genitor(a), ${parent.name}, faleceu.`]
        });
    }

    // Find siblings
    const siblings = parent.relationships.filter(r => (r.title === 'Filho' || r.title === 'Filha') && r.name !== heir.name);
    siblings.forEach(sibling => {
        newRelationships.push({
            ...sibling,
            type: RelationshipType.FAMILY,
            title: sibling.gender === 'Masculino' ? 'Irmão' : 'Irmã',
            intimacy: getRandomInt(30, 70),
            history: [`Nosso(a) genitor(a), ${parent.name}, faleceu.`]
        });
    });
    
    // Find grandparents (parents of the deceased character)
    const grandFather = parent.relationships.find(r => r.title === 'Pai');
    if (grandFather) {
        newRelationships.push({ ...grandFather, title: 'Avô', intimacy: getRandomInt(20, 50) });
    }
    const grandMother = parent.relationships.find(r => r.title === 'Mãe');
    if (grandMother) {
        newRelationships.push({ ...grandMother, title: 'Avó', intimacy: getRandomInt(20, 50) });
    }

    // 4. Generate stats with legacy bonus
    const bonusPool = Math.floor(legacyPoints / 15); // 1 bonus point per 15 legacy points
    const distributedBonus = distributePoints(bonusPool, 4);
    const baseStats = distributePoints(40, 4); // Random base distribution
    
    const profile = getRandom(PERSONALITY_PROFILES);

    // 5. Assemble the new character
    const newChar: Character = {
        name: heir.name,
        lastName: parent.lastName,
        gender: heir.gender || 'Feminino',
        generation: newGeneration,
        birthYear: birthYear,
        age: heir.age || 18,
        
        health: getRandomInt(85, 100),
        intelligence: 10 + baseStats[0] + distributedBonus[0],
        charisma: 10 + baseStats[1] + distributedBonus[1],
        creativity: 10 + baseStats[2] + distributedBonus[2],
        discipline: 10 + baseStats[3] + distributedBonus[3],

        happiness: getRandomInt(50, 70),
        energy: 100,
        stress: getRandomInt(10, 30),
        luck: getRandomInt(30, 70),

        wealth: inheritedWealth,
        investments: 0,
        morality: 0,
        fame: 0,
        influence: Math.floor(parent.influence / 4), // Inherits a quarter of parent's influence

        birthplace: parent.currentLocation,
        currentLocation: parent.currentLocation,
        familyBackground: familyBg,
        backstory: `Cresceu como filho(a) de ${parent.name}, uma figura notável.`,
        traits: profile.traits,
        assets: [],
        relationships: newRelationships,
        memories: [],
        craftedItems: [],
        lifeGoals: [{ description: getRandom(LIFE_GOALS), completed: false }],
        skills: [],
        ongoingPlots: [],
        healthCondition: null,
        founderTraits: lineage.founderTraits,
        favors: 0,
        inheritedSecret: null,
        profession: null,
        jobTitle: null,
        careerLevel: 0,
        jobSatisfaction: 0,
    };
    
    // Clamp stats
    Object.keys(newChar).forEach(keyStr => {
        const key = keyStr as keyof Character;
        if (typeof newChar[key] === 'number' && !['generation', 'birthYear', 'age', 'favors', 'wealth', 'investments', 'morality', 'fame', 'influence', 'careerLevel'].includes(key)) {
            (newChar[key] as number) = Math.max(5, Math.min(100, newChar[key] as number));
        }
    });

    return newChar;
};


export const generateRandomCharacter = (lineage: Lineage | null, legacyBonuses: LegacyBonuses | null, birthYear: number): Character => {
    const family = lineage?.lastKnownWealthTier ? lineage.lastKnownWealthTier : getRandom([FamilyBackground.POOR, FamilyBackground.MIDDLE_CLASS, FamilyBackground.WEALTHY]);
        
    let startingWealth = 0;
    if (family === FamilyBackground.MIDDLE_CLASS) startingWealth = 500;
    if (family === FamilyBackground.WEALTHY) startingWealth = 5000;
    
    const lineageBonus: LegacyBonuses = lineage?.title ? LINEAGE_TITLES.find(t => t.name === lineage.title)?.bonus || {} : {};
    const purchasedBonuses: LegacyBonuses = legacyBonuses || {};

    // Fix: Added missing happiness and stress properties to satisfy Required<LegacyBonuses>.
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
        happiness: (lineageBonus.happiness || 0) + (purchasedBonuses.happiness || 0),
        stress: (lineageBonus.stress || 0) + (purchasedBonuses.stress || 0),
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
    const distributedPoints = distributePoints(pointPool, 4);
    
    const birthplace = lineage?.lastKnownLocation ? lineage.lastKnownLocation : getRandom(BIRTHPLACES);

    const MALE_NAMES = FIRST_NAMES.slice(0, 70);
    const FEMALE_NAMES = FIRST_NAMES.slice(70);

    const motherName = getRandom(FEMALE_NAMES);
    const fatherName = getRandom(MALE_NAMES);

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
        // Fix: Applied happiness and stress bonuses.
        happiness: getRandomInt(60, 80) + allBonuses.happiness,
        energy: getRandomInt(70, 90),
        stress: getRandomInt(5, 20) + allBonuses.stress,
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
            { name: motherName, type: RelationshipType.FAMILY, intimacy: getRandomInt(50, 70), history: [], age: getRandomInt(25, 35) + 5, title: 'Mãe', gender: 'Feminino' },
            { name: fatherName, type: RelationshipType.FAMILY, intimacy: getRandomInt(50, 70), history: [], age: getRandomInt(25, 38) + 5, title: 'Pai', gender: 'Masculino' },
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