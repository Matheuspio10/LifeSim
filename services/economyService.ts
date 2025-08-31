import { Character, WeeklyFocus } from '../types';

/**
 * Calculates the dynamic cost of a weekly focus based on the character's current status.
 * @param focus The weekly focus option.
 * @param character The current character.
 * @returns The calculated cost for the focus for the entire year.
 */
export const getDynamicFocusCost = (focus: WeeklyFocus, character: Character): number => {
    let totalCost = focus.costFactors.base;

    if (focus.costFactors.wealthMultiplier && character.wealth > 0) {
        totalCost += character.wealth * focus.costFactors.wealthMultiplier;
    }
    if (focus.costFactors.careerLevelMultiplier && character.careerLevel > 0) {
        totalCost += character.careerLevel * focus.costFactors.careerLevelMultiplier;
    }
    if (focus.costFactors.influenceMultiplier && character.influence !== 0) {
        // Use absolute value as negative influence (infamy) can also be costly to maintain/use
        totalCost += Math.abs(character.influence) * focus.costFactors.influenceMultiplier;
    }

    return Math.max(0, Math.floor(totalCost));
};
