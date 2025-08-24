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
    RelationshipType
} from '../types';

// Helper to ensure a stat stays within a given min/max range.
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

const getScaledStatChange = (currentValue: number, change: number): number => {
    if (change <= 0) {
        return Math.floor(change); // Apply losses fully to maintain challenge
    }

    let multiplier = 1.0;
    if (currentValue >= 90) {
        multiplier = 0.25;
    } else if (currentValue >= 75) {
        multiplier = 0.5;
    } else if (currentValue >= 50) {
        multiplier = 0.75;
    }

    const scaledChange = change * multiplier;
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
        if (description.includes('imigrar para os eua') || description.includes('mudar para os estados unidos')) {
            if (character.currentLocation.toLowerCase().includes('estados unidos') || character.currentLocation.toLowerCase().includes('eua')) {
                isCompleted = true;
            }
        }
        if (description.includes('viajar por diferentes países')) {
            if (character.birthplace !== character.currentLocation) {
                 isCompleted = true; // Simple check: any move from birthplace counts.
            }
        }

        // Financial goals
        if (description.includes('viver livre de preocupações financeiras')) {
            if (character.wealth > 250000 && character.investments > 100000) {
                isCompleted = true;
            }
        }
        if (description.includes('fundar um negócio próprio')) {
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

        // Relationship goals
        if (description.includes('construir uma família') || description.includes('encontrar o amor verdadeiro')) {
            if (character.relationships.some(r => r.type === RelationshipType.ROMANTIC && r.intimacy >= 90)) {
                isCompleted = true;
            }
        }

        return { ...goal, completed: isCompleted || goal.completed };
    });

    return { ...character, lifeGoals: updatedGoals };
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
        for (const key in choice.statChanges) {
            const stat = key as keyof StatChanges;
            const change = choice.statChanges[stat] || 0;

            if (['health', 'intelligence', 'charisma', 'creativity', 'discipline'].includes(stat)) {
                const currentValue = updatedChar[stat as keyof Character] as number;
                (updatedChar[stat] as number) += getScaledStatChange(currentValue, change);
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
                    return { ...rel, intimacy: clamp(rel.intimacy + updateInfo.intimacyChange, -100, 100) };
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