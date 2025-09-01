import { 
    Character, 
    Choice, 
    StatChanges,
    AssetChanges,
    RelationshipChanges,
    SkillChanges,
    CareerChange,
    TraitChanges,
    GoalChanges,
    CraftedItemChanges,
    MemoryItem,
    Skill,
    Relationship,
    Trait,
    RelationshipType,
    PlotChanges,
    Plot,
    HiddenGoal
} from '../types';
import { HEALTH_CONDITIONS, HIDDEN_GOALS } from '../constants';

// Helper to ensure a stat stays within a given min/max range.
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

const getScaledStatChange = (
    currentValue: number, 
    change: number, 
    isEpic: boolean,
    otherHighStatsCount: number // How many OTHER core stats are >= 95
): number => {
    if (change <= 0) {
        return Math.floor(change); // Losses are always full
    }

    let multiplier = 1.0;

    // Base progression scaling
    if (currentValue >= 98) multiplier = 0.1;
    else if (currentValue >= 95) multiplier = 0.2;
    else if (currentValue >= 90) multiplier = 0.3;
    else if (currentValue >= 80) multiplier = 0.5;
    else if (currentValue >= 60) multiplier = 0.75;

    // If there are other very high stats, apply a penalty
    if (otherHighStatsCount > 0) {
        // Multiplicative penalty for each additional high stat
        multiplier *= Math.pow(0.5, otherHighStatsCount); 
    }

    // Epic events can overcome some of the harshest scaling
    if (isEpic && currentValue >= 95) {
        multiplier = Math.max(multiplier, 0.25); // Epic events have at least a 25% multiplier
    }
    
    // A hard cap that can't be passed by normal events
    if (currentValue >= 99 && !isEpic) {
        return 0; // Only epic events can push to 100
    }

    const scaledChange = change * multiplier;
    // Always grant at least 1 point on a successful epic gain, if the change was positive.
    if (isEpic && change > 0 && scaledChange < 1) {
        return 1;
    }
    
    return Math.round(scaledChange);
};

const getReputationScaledStatChange = (currentValue: number, change: number): number => {
    if (change <= 0) {
        return Math.floor(change); // Apply losses fully to maintain challenge
    }

    const absValue = Math.abs(currentValue);
    let multiplier = 1.0;

    if (absValue >= 90) {
        multiplier = 0.1; // 90% reduction
    } else if (absValue >= 75) {
        multiplier = 0.25; // 75% reduction
    } else if (absValue >= 50) {
        multiplier = 0.5; // 50% reduction
    } else if (absValue >= 25) {
        multiplier = 0.75; // 25% reduction
    }

    const scaledChange = change * multiplier;
    return Math.round(scaledChange);
};

/**
 * Checks all active life goals against the character's current state and marks them as complete if conditions are met.
 * @param character - The character object to check.
 * @returns A new character object with updated goal statuses.
 */
export const checkLifeGoals = (character: Character): Character => {
    const updatedGoals = character.lifeGoals.map(goal => {
        if (goal.completed) {
            return goal;
        }

        let isCompleted = false;
        const description = goal.description.toLowerCase();

        // Location-based goals
        if (description.includes('viajar por diferentes países') || description.includes('conhecer') && description.includes('mundo')) {
            if (character.birthplace !== character.currentLocation) {
                 isCompleted = true;
            }
        }
        
        // Financial goals
        if (description.includes('viver livre de preocupações financeiras') || description.includes('construir um império financeiro')) {
            if (character.wealth > 250000 && character.investments > 100000) {
                isCompleted = true;
            }
        }
        if (description.includes('fundar um negócio próprio') || description.includes('abrir um restaurante')) {
            if (character.profession && (character.profession.toLowerCase().includes('empreendedor') || character.profession.toLowerCase().includes('empresário'))) {
                isCompleted = true;
            }
        }

        // Career/Skill goals
        if (description.includes('dominar um instrumento musical')) {
            if (character.skills.some(s => s.name === 'Música' && s.level >= 80)) {
                isCompleted = true;
            }
        }
        if (description.includes('grande artista')) {
             if (character.fame >= 60 && (character.skills.some(s => s.name === 'Arte' && s.level >= 70) || character.skills.some(s => s.name === 'Música' && s.level >= 70))) {
                isCompleted = true;
            }
        }
        if (description.includes('escrever um livro')) {
            if (character.craftedItems.some(item => item.name.toLowerCase().includes('livro') || item.name.toLowerCase().includes('romance'))) {
                isCompleted = true;
            }
        }
        if (description.match(/ser eleito|prefeito|governador|presidente|vereador|deputado/)) {
            if(character.jobTitle?.match(/prefeito|governador|presidente|vereador|deputado/i)) {
                isCompleted = true;
            }
        }

        // Relationship goals
        if (description.includes('construir uma família') || description.includes('encontrar o amor verdadeiro') || description.includes('casar')) {
            if (character.relationships.some(r => r.status === 'Married')) {
                isCompleted = true;
            }
        }
        if (description.includes('ter filho') || description.includes('ser pai') || description.includes('ser mãe')) {
            if (character.relationships.some(r => r.title === 'Filho' || r.title === 'Filha')) {
                isCompleted = true;
            }
        }

        return { ...goal, completed: isCompleted || goal.completed };
    });

    return { ...character, lifeGoals: updatedGoals };
};

export const checkHiddenGoals = (character: Character, previouslyCompletedIds: string[]): HiddenGoal[] => {
    const newlyCompletedGoals: HiddenGoal[] = [];

    HIDDEN_GOALS.forEach(goal => {
        if (!previouslyCompletedIds.includes(goal.id)) {
            try {
                if (goal.condition(character)) {
                    newlyCompletedGoals.push(goal);
                }
            } catch (e) {
                console.error(`Error checking hidden goal "${goal.name}":`, e);
            }
        }
    });

    return newlyCompletedGoals;
};


/**
 * Applies all effects of a player's choice to a character object.
 * This function is the single source of truth for how a character's state changes.
 * @param character - The original character state.
 * @param choice - The choice object returned from the game event.
 * @param isEpicEvent - A flag to add context to memories gained from epic events.
 * @returns A new character object with all changes applied and stats clamped.
 */
export const applyChoiceToCharacter = (character: Character, choice: Choice, isEpicEvent: boolean = false): Character => {
    let updatedChar = { ...character };

    // Apply stat changes
    if (choice.statChanges) {
        const coreStats: (keyof StatChanges)[] = ['intelligence', 'charisma', 'creativity', 'discipline', 'health'];
        
        // Pre-calculate high stats count for the penalty
        const highStatsCount = coreStats.reduce((count, stat) => {
            const currentValue = updatedChar[stat as keyof Character] as number;
            return currentValue >= 95 ? count + 1 : count;
        }, 0);

        for (const key in choice.statChanges) {
            const stat = key as keyof StatChanges;
            const change = choice.statChanges[stat] || 0;

            if (coreStats.includes(stat)) {
                const currentValue = updatedChar[stat as keyof Character] as number;
                // Check how many OTHER stats are high
                const otherHighStatsCount = currentValue >= 95 ? highStatsCount - 1 : highStatsCount;
                (updatedChar[stat] as number) += getScaledStatChange(currentValue, change, isEpicEvent, otherHighStatsCount);
            } else if (['fame', 'influence'].includes(stat)) {
                const currentValue = updatedChar[stat as keyof Character] as number;
                (updatedChar[stat] as number) += getReputationScaledStatChange(currentValue, change);
            } else {
                (updatedChar[stat] as number) += change;
            }
        }
    }

    // Apply asset changes
     if (choice.assetChanges) {
        updatedChar.assets = [...updatedChar.assets, ...(choice.assetChanges.add || [])];
        updatedChar.assets = updatedChar.assets.filter(a => !(choice.assetChanges!.remove || []).includes(a));
    }

    // Add new memories
    if(choice.memoryGained) {
        const newMemory: MemoryItem = { 
            ...choice.memoryGained, 
            name: isEpicEvent ? `Lembrança Épica: ${choice.memoryGained.name}` : choice.memoryGained.name,
            yearAcquired: updatedChar.age 
        };
        updatedChar.memories = [...updatedChar.memories, newMemory];
    }
    
    // Apply relationship changes
    if (choice.relationshipChanges) {
        let relationships = [...updatedChar.relationships];
        // Add new
        if (choice.relationshipChanges.add) {
            choice.relationshipChanges.add.forEach(newRel => {
                if (!relationships.some(r => r.name === newRel.name)) {
                    relationships.push(newRel);
                }
            });
        }
        // Update existing
        if (choice.relationshipChanges.update) {
            relationships = relationships.map(rel => {
                const updateInfo = choice.relationshipChanges!.update!.find(u => u.name === rel.name);
                if (updateInfo) {
                    const updatedRel = { ...rel };
                    if (updateInfo.intimacyChange) {
                        updatedRel.intimacy = clamp(rel.intimacy + updateInfo.intimacyChange, -100, 100);
                    }
                    if (updateInfo.status) {
                        updatedRel.status = updateInfo.status;
                    }
                    if (updateInfo.title) {
                        updatedRel.title = updateInfo.title;
                    }
                    return updatedRel;
                }
                return rel;
            });
        }
        // Remove
        if (choice.relationshipChanges.remove) {
            relationships = relationships.filter(rel => !choice.relationshipChanges!.remove!.includes(rel.name));
        }
        // Update history
        if (choice.relationshipChanges.updateHistory) {
            relationships = relationships.map(rel => {
                const historyUpdate = choice.relationshipChanges!.updateHistory!.find(h => h.name === rel.name);
                if (historyUpdate) {
                    const newHistory = [...(rel.history || []), historyUpdate.memory].slice(-5); // Keep last 5
                    return { ...rel, history: newHistory };
                }
                return rel;
            });
        }
        updatedChar.relationships = relationships;
    }

    // Apply skill changes
    if (choice.skillChanges) {
        let skills = [...updatedChar.skills];
        // Add new
        if (choice.skillChanges.add) {
            choice.skillChanges.add.forEach(newSkill => {
                if (!skills.some(h => h.name === newSkill.name)) {
                    skills.push(newSkill);
                }
            });
        }
        // Update existing
        if (choice.skillChanges.update) {
            choice.skillChanges.update.forEach(updateInfo => {
                const skillIndex = skills.findIndex(h => h.name === updateInfo.name);
                if (skillIndex > -1) {
                    skills[skillIndex].level = clamp(skills[skillIndex].level + updateInfo.levelChange, 0, 100);
                    if (updateInfo.description) {
                        skills[skillIndex].description = updateInfo.description;
                    }
                    if (updateInfo.newName) { // Logic for evolving skill name
                        skills[skillIndex].name = updateInfo.newName;
                    }
                } else {
                    // If skill doesn't exist, add it
                    skills.push({
                        name: updateInfo.newName || updateInfo.name,
                        level: clamp(updateInfo.levelChange, 0, 100),
                        description: updateInfo.description || `Iniciante em ${updateInfo.newName || updateInfo.name}`
                    });
                }
            });
        }
        updatedChar.skills = skills;
    }

    // Apply career changes
    if (choice.careerChange) {
        if (choice.careerChange.profession !== undefined) {
            if (choice.careerChange.profession === "") {
                updatedChar.profession = null;
                updatedChar.jobTitle = null; // Also clear job title when unemployed
                updatedChar.jobSatisfaction = 0; // Reset satisfaction
            } else {
                updatedChar.profession = choice.careerChange.profession;
            }
        }
        if (choice.careerChange.jobTitle !== undefined) {
            updatedChar.jobTitle = updatedChar.profession ? choice.careerChange.jobTitle : null; // Only have a job title if employed
        }
        if (choice.careerChange.levelChange) {
            updatedChar.careerLevel = clamp(updatedChar.careerLevel + choice.careerChange.levelChange, 0, 100);
        }
    }

    // Apply trait changes
    if (choice.traitChanges) {
        let traits = [...updatedChar.traits];
        if (choice.traitChanges.add) {
            choice.traitChanges.add.forEach(newTrait => {
                if (!traits.some(t => t.name === newTrait.name)) {
                    traits.push(newTrait);
                }
            });
        }
        if (choice.traitChanges.remove) {
            traits = traits.filter(t => !choice.traitChanges!.remove!.includes(t.name));
        }
        if (choice.traitChanges.update) {
            choice.traitChanges.update.forEach(updateInfo => {
                const traitIndex = traits.findIndex(t => t.name === updateInfo.name);
                if (traitIndex > -1) {
                    const currentLevel = traits[traitIndex].level || 1;
                    traits[traitIndex].level = currentLevel + updateInfo.levelChange;
                    if (updateInfo.description) {
                        traits[traitIndex].description = updateInfo.description;
                    }
                }
            });
        }
        updatedChar.traits = traits;
    }
    
    // Apply goal changes
    if (choice.goalChanges) {
        let goals = [...updatedChar.lifeGoals];
        if (choice.goalChanges.add) {
            choice.goalChanges.add.forEach(desc => {
                if (!goals.some(g => g.description === desc)) {
                    goals.push({ description: desc, completed: false });
                }
            });
        }
        if (choice.goalChanges.complete) {
            goals = goals.map(g => 
                choice.goalChanges!.complete!.includes(g.description) ? { ...g, completed: true } : g
            );
        }
        updatedChar.lifeGoals = goals;
    }

    // Apply crafted item changes
    if (choice.craftedItemChanges) {
        let items = [...updatedChar.craftedItems];
        if (choice.craftedItemChanges.add) {
            items.push(...choice.craftedItemChanges.add);
        }
        if (choice.craftedItemChanges.remove) {
            items = items.filter(item => !choice.craftedItemChanges!.remove!.includes(item.name));
        }
        updatedChar.craftedItems = items;
    }

    // Apply health condition change
    if (choice.healthConditionChange !== undefined) {
        // The AI might return the string "null" instead of the JSON null value.
        if (choice.healthConditionChange === null || choice.healthConditionChange.toLowerCase() === 'null') {
            updatedChar.healthCondition = null;
        } else {
            updatedChar.healthCondition = {
                name: choice.healthConditionChange,
                ageOfOnset: updatedChar.age,
            };
        }
    }

    // Apply location change
    if (choice.locationChange) {
        updatedChar.currentLocation = choice.locationChange;
    }
    
    // Apply plot changes
    if (choice.plotChanges) {
        let plots: Plot[] = [...(updatedChar.ongoingPlots || [])];
        // Add new plots
        if (choice.plotChanges.add) {
            choice.plotChanges.add.forEach(desc => {
                if (desc && desc.trim() && !plots.some(p => p.description === desc)) {
                    plots.push({ description: desc, completed: false });
                }
            });
        }
        // Mark plots as complete
        if (choice.plotChanges.complete) {
            plots = plots.map(p => 
                choice.plotChanges!.complete!.includes(p.description) ? { ...p, completed: true } : p
            );
        }
        // Remove plots (abandon)
        if (choice.plotChanges.remove) {
            plots = plots.filter(p => !choice.plotChanges!.remove!.includes(p.description));
        }
        updatedChar.ongoingPlots = plots;
    }

    // Handle pregnancy change
    if (choice.isPregnantChange !== undefined) {
        updatedChar.isPregnant = choice.isPregnantChange;
    }

    // Handle birth
    if (choice.childBorn) {
        const relationships = [...updatedChar.relationships];
        const newChild: Relationship = {
            name: choice.childBorn.name,
            gender: choice.childBorn.gender,
            age: 0,
            type: RelationshipType.FAMILY,
            intimacy: 80,
            history: [`Nasceu em ${updatedChar.birthYear + updatedChar.age}.`],
            title: choice.childBorn.gender === 'Masculino' ? 'Filho' : 'Filha'
        };
        relationships.push(newChild);
        updatedChar.relationships = relationships;
        updatedChar.isPregnant = false;
    }

    // Apply plot contribution text
    if (choice.plotContributionText) {
        updatedChar.plotContribution = choice.plotContributionText;
    }


    // Final clamping of all primary stats to ensure they are within valid ranges.
    updatedChar.health = clamp(updatedChar.health, 0, 100);
    updatedChar.intelligence = clamp(updatedChar.intelligence, 0, 100);
    updatedChar.charisma = clamp(updatedChar.charisma, 0, 100);
    updatedChar.creativity = clamp(updatedChar.creativity, 0, 100);
    updatedChar.discipline = clamp(updatedChar.discipline, 0, 100);
    updatedChar.morality = clamp(updatedChar.morality, -100, 100);
    updatedChar.fame = clamp(updatedChar.fame, -100, 100);
    updatedChar.influence = clamp(updatedChar.influence, -100, 100);
    updatedChar.happiness = clamp(updatedChar.happiness, 0, 100);
    updatedChar.energy = clamp(updatedChar.energy, 0, 100);
    updatedChar.stress = clamp(updatedChar.stress, 0, 100);
    updatedChar.luck = clamp(updatedChar.luck, 0, 100);
    updatedChar.jobSatisfaction = clamp(updatedChar.jobSatisfaction, 0, 100);


    return updatedChar;
};

export const applyCriticalStatPenalties = (character: Character): { updatedChar: Character; penaltiesApplied: string[] } => {
    let updatedChar = { ...character };
    const penaltiesApplied: string[] = [];

    // 1. Critical Low Health (Health < 10)
    if (updatedChar.health > 0 && updatedChar.health < 10 && !updatedChar.healthCondition) {
        const possibleIllnesses = ['Pneumonia', 'Esgotamento'];
        const illness = possibleIllnesses[Math.floor(Math.random() * possibleIllnesses.length)];

        updatedChar.healthCondition = {
            name: illness,
            ageOfOnset: updatedChar.age,
        };
        updatedChar.happiness = clamp(updatedChar.happiness - 25, 0, 100);
        updatedChar.energy = clamp(updatedChar.energy - 30, 0, 100);

        penaltiesApplied.push(
            `Com a saúde criticamente baixa, ${updatedChar.name} contraiu ${illness.toLowerCase()} e precisará de repouso absoluto, sentindo-se infeliz e sem energia.`
        );
    }

    // 2. Zero Energy (Energy <= 0)
    if (updatedChar.energy <= 0) {
        updatedChar.energy = 25; // Recover to a low state to prevent immediate re-trigger
        updatedChar.health = clamp(updatedChar.health - 5, 0, 100);
        updatedChar.happiness = clamp(updatedChar.happiness - 10, 0, 100);
        if(updatedChar.profession) {
            updatedChar.jobSatisfaction = clamp(updatedChar.jobSatisfaction - 15, 0, 100);
            updatedChar.careerLevel = clamp(updatedChar.careerLevel - 2, 0, 100);
        }

        penaltiesApplied.push(
            `${updatedChar.name} desmaiou de exaustão total. Acordou sentindo-se fraco(a), infeliz e com sua reputação profissional abalada.`
        );
    }
    
    // 3. Maximum Stress (Stress >= 95)
    if (updatedChar.stress >= 95) {
        updatedChar.stress = clamp(updatedChar.stress - 20, 0, 100); // Reduce stress after the breakdown
        updatedChar.happiness = clamp(updatedChar.happiness - 30, 0, 100);
        updatedChar.influence = clamp(updatedChar.influence - 5, -100, 100);
        updatedChar.fame = clamp(updatedChar.fame - 5, -100, 100);

        let breakdownEventText = '';

        // Social consequence: Damage a random relationship
        if (updatedChar.relationships.length > 0) {
            const targetIndex = Math.floor(Math.random() * updatedChar.relationships.length);
            const targetRelationship = updatedChar.relationships[targetIndex];
            targetRelationship.intimacy = clamp(targetRelationship.intimacy - 30, -100, 100);
            const memory = `Teve um colapso nervoso e descontou em mim.`;
            targetRelationship.history = [...(targetRelationship.history || []), memory].slice(-5);
            updatedChar.relationships[targetIndex] = targetRelationship;
            breakdownEventText += `afastando ${targetRelationship.name} com palavras duras`;
        }

        // Professional consequence: 20% chance to lose job
        if (updatedChar.profession && Math.random() < 0.20) {
            updatedChar.profession = null;
            updatedChar.jobTitle = null;
            updatedChar.careerLevel = clamp(updatedChar.careerLevel - 10, 0, 100);
            breakdownEventText += `${breakdownEventText ? ' e, para piorar, ' : ''}foi demitido(a) após um surto no trabalho`;
        }
        
        if (!breakdownEventText) {
            breakdownEventText = `prejudicou seriamente sua reputação pública`;
        }

        penaltiesApplied.push(
            `Sob estresse extremo, ${updatedChar.name} teve um colapso nervoso, ${breakdownEventText}.`
        );
    }

    return { updatedChar, penaltiesApplied };
};

const getAgeAndStressAppropriateConditions = (age: number, stress: number): string[] => {
    const conditions: string[] = [];

    // Stress-related
    if (stress > 70) {
        conditions.push('Enxaqueca Crônica', 'Insônia Crônica', 'Hipertensão', 'Esgotamento');
    }

    // Age-related
    if (age > 45) {
        conditions.push('Hipertensão', 'Diabetes Tipo 2');
    }
    if (age > 60) {
        conditions.push('Artrite', 'Doença Cardíaca');
    }
    
    // General acute illness
    conditions.push('Gripe Forte', 'Pneumonia');

    // Remove duplicates
    const uniqueConditions = [...new Set(conditions)];

    // Filter out conditions that aren't in the main list, just in case
    return uniqueConditions.filter(c => HEALTH_CONDITIONS[c]);
};

export const checkForNewHealthConditions = (character: Character): { updatedChar: Character; newConditionMessage: string | null } => {
    let updatedChar = { ...character };
    let newConditionMessage: string | null = null;

    // Don't assign a new condition if one already exists
    if (updatedChar.healthCondition) {
        return { updatedChar, newConditionMessage };
    }

    let conditionChance = 0;
    // Base chance increases with age
    if (updatedChar.age > 70) conditionChance += 0.25; // 25%
    else if (updatedChar.age > 50) conditionChance += 0.15; // 15%
    
    // Low health increases chance significantly
    if (updatedChar.health < 25) conditionChance += 0.30; // +30%
    else if (updatedChar.health < 50) conditionChance += 0.15; // +15%

    // High stress is a major factor
    if (updatedChar.stress > 80) conditionChance += 0.25; // +25%

    if (Math.random() < conditionChance) {
        const possibleConditions = getAgeAndStressAppropriateConditions(updatedChar.age, updatedChar.stress);
        
        if (possibleConditions.length > 0) {
            const newConditionName = possibleConditions[Math.floor(Math.random() * possibleConditions.length)];
            
            updatedChar.healthCondition = { name: newConditionName, ageOfOnset: updatedChar.age };
            
            // Apply an initial penalty for getting sick
            updatedChar.health = clamp(updatedChar.health - 15, 0, 100);
            updatedChar.happiness = clamp(updatedChar.happiness - 20, 0, 100);
            updatedChar.stress = clamp(updatedChar.stress + 10, 0, 100);

            newConditionMessage = `Em um ano difícil, ${updatedChar.name} foi diagnosticado(a) com ${newConditionName.toLowerCase()}. A notícia abalou sua saúde e felicidade.`;
        }
    }

    return { updatedChar, newConditionMessage };
};

export const determineCauseOfDeath = (character: Character): string => {
    // Priority 1: Extreme Old Age
    if (character.age >= 105) {
        return 'Causas naturais devido à idade avançada';
    }

    // If health is not at 0, and age is not extreme, death shouldn't happen, but as a fallback:
    if (character.health > 0) {
        return 'Faleceu pacificamente de causas naturais';
    }

    // Priority 2: Specific Health Condition
    if (character.healthCondition) {
        const condition = character.healthCondition.name;
        if (condition.toLowerCase().includes('câncer')) {
            return 'Perdeu a longa batalha contra o câncer';
        }
        if (condition.toLowerCase().includes('depressão') || condition.toLowerCase().includes('ansiedade')) {
            return 'Faleceu com o coração pesado, após uma vida de lutas internas';
        }
        if (condition.toLowerCase().includes('pneumonia') || condition.toLowerCase().includes('cardíaca')) {
            return `Complicações fatais de ${condition.toLowerCase()}`;
        }
        return `Complicações de ${condition.toLowerCase()}`;
    }

    // Priority 3: Traits and Vitals interaction
    if (character.traits.some(t => t.name === 'Tendência a Vícios') && character.stress > 80 && character.happiness < 20) {
        return 'Sucumbiu aos seus vícios após um período de grande dificuldade';
    }
    if (character.traits.some(t => t.name === 'Índole Criminosa') && character.morality < -70) {
        return 'Seu passado criminoso finalmente o alcançou de forma violenta';
    }
     if (character.traits.some(t => t.name === 'Impulsivo') && character.discipline < 20) {
        return 'Morte trágica em um acidente causado por imprudência';
    }
    if (character.traits.some(t => t.name === 'Saúde Frágil')) {
        return 'Complicações de uma doença comum que seu corpo frágil não conseguiu combater';
    }

    // Priority 4: Vitals
    if (character.stress > 95) {
        return 'Ataque cardíaco fulminante induzido por estresse extremo';
    }
    if (character.happiness < 5) {
        return 'Morreu de tristeza, desistindo silenciosamente da vida';
    }

    // Priority 5: Generic age-based causes
    if (character.age < 40) {
        return 'Um mal súbito e inesperado';
    }
    if (character.age < 65) {
        return 'Falência de múltiplos órgãos devido à saúde debilitada';
    }
    
    // Default fallback
    return 'Faleceu pacificamente de causas naturais';
};
