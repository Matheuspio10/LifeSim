
import { 
    Character, 
    Choice, 
    StatChanges,
    AssetChanges,
    RelationshipChanges,
    HobbyChanges,
    CareerChange,
    TraitChanges,
    GoalChanges,
    CraftedItemChanges,
    MemoryItem,
    Hobby,
    Relationship,
    Trait
} from '../types';

// Helper to ensure a stat stays within a given min/max range.
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

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
            (updatedChar[stat] as number) += (choice.statChanges[stat] || 0);
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

    // Change mood
    if (choice.moodChange) {
        updatedChar.mood = choice.moodChange;
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

    // Apply hobby changes
    if (choice.hobbyChanges) {
        let hobbies = [...updatedChar.hobbies];
        // Add new
        if (choice.hobbyChanges.add) {
            choice.hobbyChanges.add.forEach(newHobby => {
                if (!hobbies.some(h => h.type === newHobby.type)) {
                    hobbies.push(newHobby);
                }
            });
        }
        // Update existing
        if (choice.hobbyChanges.update) {
            choice.hobbyChanges.update.forEach(updateInfo => {
                const hobbyIndex = hobbies.findIndex(h => h.type === updateInfo.type);
                if (hobbyIndex > -1) {
                    hobbies[hobbyIndex].level = clamp(hobbies[hobbyIndex].level + updateInfo.levelChange, 0, 100);
                    if (updateInfo.description) {
                        hobbies[hobbyIndex].description = updateInfo.description;
                    }
                } else {
                    // If hobby doesn't exist, add it
                    hobbies.push({
                        type: updateInfo.type,
                        level: clamp(updateInfo.levelChange, 0, 100),
                        description: updateInfo.description || `Iniciante em ${updateInfo.type}`
                    });
                }
            });
        }
        updatedChar.hobbies = hobbies;
    }

    // Apply career changes
    if (choice.careerChange) {
        if (choice.careerChange.profession !== undefined) {
            updatedChar.profession = choice.careerChange.profession === "" ? null : choice.careerChange.profession;
            if (updatedChar.profession === null) {
                updatedChar.jobTitle = null; // Also clear job title when unemployed
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

    // Final clamping of all primary stats to ensure they are within valid ranges.
    updatedChar.health = clamp(updatedChar.health, 0, 100);
    updatedChar.intelligence = clamp(updatedChar.intelligence, 0, 100);
    updatedChar.charisma = clamp(updatedChar.charisma, 0, 100);
    updatedChar.creativity = clamp(updatedChar.creativity, 0, 100);
    updatedChar.discipline = clamp(updatedChar.discipline, 0, 100);
    updatedChar.morality = clamp(updatedChar.morality, -100, 100);
    updatedChar.fame = clamp(updatedChar.fame, -100, 100);
    updatedChar.influence = clamp(updatedChar.influence, -100, 100);

    return updatedChar;
};
