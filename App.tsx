
import React, { useState, useCallback, useEffect } from 'react';
import { GameState, Character, LifeStage, GameEvent, Choice, LegacyBonuses, LifeSummaryEntry, MemoryItem, EconomicClimate, Lineage, LineageCrest, FounderTraits, WeeklyFocus, MiniGameType, Mood, Skill, FamilyBackground, Checkpoint, Ancestor, WorldEvent, Relationship, AuditReport, StatChanges, SkillChanges } from './types';
import { generateGameEvent, evaluatePlayerResponse, processMetaCommand, generateWorldEvent, processAuditModificationRequest, generateCatastrophicEvent } from './services/gameService';
import { applyChoiceToCharacter, checkLifeGoals, determineCauseOfDeath, applyCriticalStatPenalties, checkForNewHealthConditions } from './services/characterService';
import { getDynamicFocusCost } from './services/economyService';
import { runCharacterAudit } from './services/auditService';
import { WEEKLY_CHALLENGES, LAST_NAMES, PORTRAIT_COLORS, HEALTH_CONDITIONS, TOTAL_MONTHS_PER_YEAR, SKIN_TONES, HAIR_STYLES, ACCESSORIES } from './constants';
import { createHeirCharacter } from './services/characterCreationService';
import { CREST_COLORS, CREST_ICONS, CREST_SHAPES, LINEAGE_TITLES } from './lineageConstants';
import CharacterSheet from './components/CharacterSheet';
import EventCard from './components/EventCard';
import GameOverScreen from './components/GameOverScreen';
import StartScreen from './components/StartScreen';
import LoadingSpinner from './components/LoadingSpinner';
import LegacyScreen from './components/LegacyScreen';
import RoutineScreen from './components/RoutineScreen';
import MiniGameHost from './components/MiniGameHost';
import JournalScreen from './components/JournalScreen';
import ApiKeyModal from './components/ApiKeyModal';
import QuotaErrorModal from './components/QuotaErrorModal';
import { BookOpenIcon } from './components/Icons';
import DowntimeActivities, { MicroActionResult } from './components/DowntimeActivities';
import EmergencyRollbackModal from './components/EmergencyRollbackModal';
import FamilyBookModal from './components/FamilyBookModal';
import WorldEventToast from './components/WorldEventToast';
import AuditReportModal from './components/AuditReportModal';

const getRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomKey = <T extends object>(obj: T): keyof T => {
    const keys = Object.keys(obj) as Array<keyof T>;
    return keys[Math.floor(Math.random() * keys.length)];
};
const SAVE_GAME_KEY = 'lifeSimMMORGSaveData';
const API_KEY_KEY = 'lifeSimMMORGApiKey';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.NOT_STARTED);
  const [character, setCharacter] = useState<Character | null>(null);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lifeSummary, setLifeSummary] = useState<LifeSummaryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentYear, setCurrentYear] = useState<number>(1980);
  const [economicClimate, setEconomicClimate] = useState<EconomicClimate>(EconomicClimate.STABLE);
  const [isMultiplayerCycle, setIsMultiplayerCycle] = useState<boolean>(false);
  const [monthsRemainingInYear, setMonthsRemainingInYear] = useState<number>(TOTAL_MONTHS_PER_YEAR);
  const [currentFocusContext, setCurrentFocusContext] = useState<string | null>(null);
  const [behaviorTracker, setBehaviorTracker] = useState<Record<string, number>>({});
  const [isJournalOpen, setIsJournalOpen] = useState<boolean>(false);
  const [hasSaveData, setHasSaveData] = useState<boolean>(false);
  const [isTurboMode, setIsTurboMode] = useState<boolean>(true);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState<boolean>(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState<boolean>(false);
  const [history, setHistory] = useState<Checkpoint[]>([]);
  const [isRollbackModalOpen, setIsRollbackModalOpen] = useState(false);
  const [isFamilyBookOpen, setIsFamilyBookOpen] = useState(false);
  const [ancestors, setAncestors] = useState<Ancestor[]>([]);
  const [worldEventNotification, setWorldEventNotification] = useState<WorldEvent | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [isAuditLoading, setIsAuditLoading] = useState<boolean>(false);


  // Legacy State
  const [lineage, setLineage] = useState<Lineage | null>(null);
  const [legacyPoints, setLegacyPoints] = useState<number>(0);
  const [legacyBonuses, setLegacyBonuses] = useState<LegacyBonuses | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState<{ name: string; reward: number }[]>([]);
  
  // --- Game Balancing Helpers ---
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

  useEffect(() => {
    const savedKey = localStorage.getItem(API_KEY_KEY);
    if (savedKey) {
        setApiKey(savedKey);
    }
  }, []);

  const recordAncestor = useCallback((char: Character, currentLineage: Lineage | null, summary: LifeSummaryEntry[]) => {
      if (!currentLineage) return;
      const newAncestor: Ancestor = {
          id: `${char.name}-${char.generation}-${Date.now()}`,
          generation: char.generation,
          name: char.name,
          lastName: char.lastName,
          eraLived: `${char.birthYear} - ${char.birthYear + char.age}`,
          portraitTraits: char.founderTraits,
          title: currentLineage.title,
          achievements: char.lifeGoals.filter(g => g.completed).map(g => ({ text: g.description, icon: 'CheckCircleIcon' })),
          definingTraits: char.traits.map(t => t.name),
          finalStatus: char.causeOfDeath || "Desconhecido",
          narrative: summary.map(l => l.text).filter(Boolean).join(' '),
          finalStats: {
              intelligence: char.intelligence, charisma: char.charisma,
              creativity: char.creativity, discipline: char.discipline,
              morality: char.morality, fame: char.fame, influence: char.influence,
          },
          finalWealth: char.wealth + char.investments,
          careerSummary: { jobTitle: char.jobTitle, careerLevel: char.careerLevel },
          keyRelationships: char.relationships.slice(0, 3).map(r => ({ name: r.name, title: r.title, intimacy: r.intimacy })),
      };
      setAncestors(prev => [...prev, newAncestor]);
  }, []);
  
  const saveForRollback = useCallback(() => {
    const stateToSave = {
        gameState, character, currentEvent, lifeSummary, currentYear,
        economicClimate, isMultiplayerCycle, monthsRemainingInYear,
        currentFocusContext, behaviorTracker, lineage, legacyPoints, isTurboMode,
        ancestors,
    };

    let name = `Ponto de Restauração`;
    if (gameState === GameState.ROUTINE_PLANNING) {
        name = `Início do Ano ${currentYear}`;
    } else if (currentEvent) {
        name = `Antes do evento: "${currentEvent.eventText.substring(0, 30)}..."`;
    } else if (gameState === GameState.GAME_OVER) {
        name = `Fim da vida de ${character?.name}`;
    } else if (gameState === GameState.LEGACY) {
        name = `Antes de gastar Legado`;
    }

    const newCheckpoint: Checkpoint = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        name,
        keyActions: lifeSummary.slice(-1).map(l => l.text),
        stateSnapshot: stateToSave,
    };

    setHistory(prev => [newCheckpoint, ...prev].slice(0, 10));
  }, [gameState, character, currentEvent, lifeSummary, currentYear, economicClimate, isMultiplayerCycle, monthsRemainingInYear, currentFocusContext, behaviorTracker, lineage, legacyPoints, isTurboMode, ancestors]);

  // --- Save/Load Logic ---
  const loadGame = useCallback(() => {
    const savedData = localStorage.getItem(SAVE_GAME_KEY);
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            setGameState(parsedData.gameState ?? GameState.NOT_STARTED);
            setCharacter(parsedData.character ?? null);
            setCurrentEvent(parsedData.currentEvent ?? null);
            setLifeSummary(parsedData.lifeSummary ?? []);
            setCurrentYear(parsedData.currentYear ?? 1980);
            setEconomicClimate(parsedData.economicClimate ?? EconomicClimate.STABLE);
            setIsMultiplayerCycle(parsedData.isMultiplayerCycle ?? false);
            setMonthsRemainingInYear(parsedData.monthsRemainingInYear ?? TOTAL_MONTHS_PER_YEAR);
            setCurrentFocusContext(parsedData.currentFocusContext ?? null);
            setBehaviorTracker(parsedData.behaviorTracker ?? {});
            setLineage(parsedData.lineage ?? null);
            setLegacyPoints(parsedData.legacyPoints ?? 0);
            setIsTurboMode(parsedData.isTurboMode ?? true);
            setHistory(parsedData.history ?? []);
            setAncestors(parsedData.ancestors ?? []);
        } catch (e) {
            console.error("Falha ao carregar o jogo salvo", e);
            localStorage.removeItem(SAVE_GAME_KEY);
            setHasSaveData(false);
        }
    }
  }, []);

  useEffect(() => {
      const savedData = localStorage.getItem(SAVE_GAME_KEY);
      if (savedData) {
          setHasSaveData(true);
      }
  }, []);

  useEffect(() => {
    if (gameState === GameState.NOT_STARTED && !character) {
        return;
    }
    
    const gameToSave = {
        gameState, character, currentEvent, lifeSummary, currentYear,
        economicClimate, isMultiplayerCycle, monthsRemainingInYear,
        currentFocusContext, behaviorTracker, lineage, legacyPoints, isTurboMode, history, ancestors
    };
    localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(gameToSave));
  }, [gameState, character, currentEvent, lifeSummary, currentYear, economicClimate, isMultiplayerCycle, monthsRemainingInYear, currentFocusContext, behaviorTracker, lineage, legacyPoints, isTurboMode, history, ancestors]);

  const resetGameAndClearSave = () => {
    localStorage.removeItem(SAVE_GAME_KEY);
    setHasSaveData(false);
    setGameState(GameState.NOT_STARTED);
    setCharacter(null);
    setCurrentEvent(null);
    setIsLoading(false);
    setLifeSummary([]);
    setError(null);
    setCurrentYear(1980);
    setEconomicClimate(EconomicClimate.STABLE);
    setIsMultiplayerCycle(false);
    setMonthsRemainingInYear(TOTAL_MONTHS_PER_YEAR);
    setCurrentFocusContext(null);
    setBehaviorTracker({});
    setIsJournalOpen(false);
    setLineage(null);
    setLegacyPoints(0);
    setLegacyBonuses(null);
    setCompletedChallenges([]);
    setIsTurboMode(true);
    setHistory([]);
    setAncestors([]);
  };

  const handleStartNewGameFromScratch = () => {
    if (window.confirm('Tem certeza de que deseja iniciar um novo jogo? Seu progresso salvo será perdido.')) {
        resetGameAndClearSave();
    }
  };

  const handleChangeApiKey = () => {
    if (window.confirm('Tem certeza de que deseja trocar sua chave de API? Você precisará inserir uma nova para continuar jogando.')) {
        setApiKey(null);
        localStorage.removeItem(API_KEY_KEY);
    }
  };
  
  const handleFullReset = () => {
    if (window.confirm('Tem certeza de que deseja apagar TODO o progresso? Esta ação é irreversível.')) {
        localStorage.removeItem(API_KEY_KEY);
        resetGameAndClearSave();
    }
  };

  const handleOpenRollbackModal = () => {
    if (history.length > 0) {
        setIsRollbackModalOpen(true);
    } else {
        alert("Nenhum ponto de restauração disponível. Esta opção fica disponível após sua primeira ação.");
    }
  };

  const handleRestore = (checkpoint: Checkpoint) => {
    if (window.confirm('Tem certeza de que deseja restaurar para este ponto? Todo o progresso subsequente será perdido.')) {
        const { stateSnapshot } = checkpoint;
        setGameState(stateSnapshot.gameState);
        setCharacter(stateSnapshot.character);
        setCurrentEvent(stateSnapshot.currentEvent);
        setLifeSummary(stateSnapshot.lifeSummary);
        setCurrentYear(stateSnapshot.currentYear);
        setEconomicClimate(stateSnapshot.economicClimate);
        setIsMultiplayerCycle(stateSnapshot.isMultiplayerCycle);
        setMonthsRemainingInYear(stateSnapshot.monthsRemainingInYear);
        setCurrentFocusContext(stateSnapshot.currentFocusContext);
        setBehaviorTracker(stateSnapshot.behaviorTracker);
        setLineage(stateSnapshot.lineage);
        setLegacyPoints(stateSnapshot.legacyPoints);
        setIsTurboMode(stateSnapshot.isTurboMode);
        setAncestors(stateSnapshot.ancestors);

        const checkpointIndex = history.findIndex(h => h.id === checkpoint.id);
        if (checkpointIndex > -1) {
            setHistory(prev => prev.slice(checkpointIndex));
        }

        setIsLoading(false);
        setError(null);
        setIsRollbackModalOpen(false);
    }
  };

  const getCurrentLifeStage = (age: number): LifeStage => {
    if (age <= 12) return LifeStage.CHILDHOOD;
    if (age <= 19) return LifeStage.ADOLESCENCE;
    if (age <= 35) return LifeStage.YOUNG_ADULTHOOD;
    if (age <= 65) return LifeStage.ADULTHOOD;
    return LifeStage.OLD_AGE;
  };
  
  const fetchNextEvent = useCallback(async (char: Character, eventYear: number, newBehaviorTracker?: Record<string, number>) => {
    if (!apiKey) {
        setError("Chave de API não configurada.");
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    setError(null);

    const MAX_RETRIES = 3;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const lifeStage = getCurrentLifeStage(char.age);
            const lineageTitle = lineage ? lineage.title : null;
            const event = await generateGameEvent(char, lifeStage, eventYear, economicClimate, lineageTitle, currentFocusContext, newBehaviorTracker ?? behaviorTracker, isTurboMode, apiKey);
            
            if (!event || !event.eventText || !event.type) {
                throw new Error("A resposta da IA estava vazia ou malformada.");
            }

            setCurrentEvent(event);
            setGameState(GameState.IN_PROGRESS);
            setIsLoading(false);
            return; // Success
        } catch (err) {
            console.error(`Falha na tentativa ${attempt} ao buscar evento:`, err);
            const errorString = err instanceof Error ? `${err.name}: ${err.message}\n${err.stack}` : JSON.stringify(err);
            setLastError(errorString);

            if (attempt === MAX_RETRIES) {
                if (err instanceof Error) {
                    if (err.message.includes('429') || err.message.toLowerCase().includes('quota')) {
                        setIsQuotaModalOpen(true);
                        setError(null);
                    } else {
                        setError(err.message);
                    }
                } else {
                    setError('Falha ao gerar um evento de vida. O universo está contemplando sua existência.');
                }
                setIsLoading(false);
            } else {
                await new Promise(res => setTimeout(res, 750));
            }
        }
    }
  }, [economicClimate, lineage, currentFocusContext, behaviorTracker, isTurboMode, apiKey]);


  const processNextDecision = useCallback(async (char: Character) => {
    // Simplificado: A IA agora irá gerar um evento com base no foco atual do personagem,
    // em vez de uma área de decisão predefinida (Carreira, Pessoal, Social).
    await fetchNextEvent(char, currentYear);
  }, [currentYear, fetchNextEvent]);

  const startGame = (newCharacter: Character, isMultiplayer: boolean, lineageDetails?: Partial<Lineage>) => {
    const startYear = newCharacter.birthYear;
    setCurrentYear(startYear);
    setIsMultiplayerCycle(isMultiplayer);
    setMonthsRemainingInYear(TOTAL_MONTHS_PER_YEAR);
    setBehaviorTracker({}); 
    if (!lineage) {
        const finalCrest = lineageDetails?.crest 
            ? lineageDetails.crest
            : (() => {
                const color1 = getRandom(CREST_COLORS);
                return {
                    icon: getRandom(CREST_ICONS),
                    color1: color1,
                    color2: getRandom(CREST_COLORS.filter(c => c !== color1)),
                    shape: getRandom(CREST_SHAPES),
                };
            })();

        const founderTraits: FounderTraits = {
            hairColor: newCharacter.founderTraits.hairColor,
            eyeColor: newCharacter.founderTraits.eyeColor,
            skinTone: newCharacter.founderTraits.skinTone,
            hairstyle: newCharacter.founderTraits.hairstyle,
            accessories: newCharacter.founderTraits.accessories,
        };

        setLineage({
            lastName: newCharacter.lastName,
            generation: 1,
            crest: finalCrest,
            title: null,
            founderTraits,
            motto: lineageDetails?.motto || '',
            history: lineageDetails?.history || '',
            definingTraits: lineageDetails?.definingTraits || [],
        });
        setAncestors([]); // Reset ancestors for a new lineage
    } else {
        setLineage(prev => prev ? { ...prev, lastName: newCharacter.lastName, generation: newCharacter.generation } : null);
    }
    setLegacyBonuses(null); 
    setCharacter(newCharacter);
    setLifeSummary([{ text: `Uma nova vida começou para ${newCharacter.name} ${newCharacter.lastName} em ${newCharacter.birthplace} no ano de ${newCharacter.birthYear}.`, isEpic: false }]);
    setGameState(GameState.ROUTINE_PLANNING);
  };
  
  const calculateLegacyPoints = (char: Character): number => {
    let points = 0;
    // Use logarithmic scale for wealth and investments to prevent runaway points
    points += Math.floor(25 * Math.log10(Math.max(1, char.wealth)));
    points += Math.floor(25 * Math.log10(Math.max(1, char.investments)));

    // Increased weight for stats
    points += Math.floor((char.intelligence + char.charisma + char.creativity + char.discipline) / 20);
    
    // Age bonus remains the same
    points += char.age > 95 ? (char.age - 95) * 2 : 0;
    
    // Assets and memories are fine
    points += char.assets.length;
    points += Math.floor(char.memories.length / 2);
    
    // Life goals are a significant part of legacy
    points += char.lifeGoals.filter(g => g.completed).length * 25;
    
    // Increased weight for career, fame, and influence
    points += Math.floor(char.careerLevel / 10);
    points += Math.floor(Math.abs(char.fame) / 10); // Infamy is also a form of legacy
    points += Math.floor(Math.abs(char.influence) / 10); // Being a public enemy is also a legacy
    
    // Relationships are fine
    points += char.relationships.filter(r => r.intimacy > 80).length * 3;
    
    return Math.max(0, Math.floor(points));
  };

  const startNewLineage = () => {
    localStorage.removeItem(SAVE_GAME_KEY);
    setLineage(null);
    setLegacyBonuses(null);
    setLegacyPoints(0);
    setCurrentEvent(null);
    setCompletedChallenges([]);
    setIsMultiplayerCycle(false);
    setGameState(GameState.NOT_STARTED);
    setAncestors([]);
  }

  const continueLineage = () => {
      setGameState(GameState.LEGACY);
  }

  const startNextGeneration = (bonuses: LegacyBonuses) => {
    setLegacyBonuses(bonuses);
    setCurrentEvent(null);
    setCompletedChallenges([]);
    setGameState(GameState.NOT_STARTED);
  }
  
  const updateLineageTitle = useCallback((char: Character, currentLineage: Lineage | null): Lineage | null => {
    if (!currentLineage) return null;
    const existingTitleInfo = LINEAGE_TITLES.find(t => t.name === currentLineage.title);
    
    // Find the best new title the character qualifies for
    const bestNewTitle = LINEAGE_TITLES
        .filter(titleInfo => titleInfo.condition(char))
        .sort((a, b) => (LINEAGE_TITLES.indexOf(b) - LINEAGE_TITLES.indexOf(a)))[0]; // Get the highest-ranking title

    // If there's a new, better title, update it
    if (bestNewTitle && (!existingTitleInfo || LINEAGE_TITLES.indexOf(bestNewTitle) > LINEAGE_TITLES.indexOf(existingTitleInfo))) {
        setCompletedChallenges(prev => [...prev.filter(c => !LINEAGE_TITLES.some(t => t.name === c.name)), { name: bestNewTitle.name, reward: 50 }]);
        return { ...currentLineage, title: bestNewTitle.name };
    }
    
    return currentLineage;
  }, []);

  const advanceYear = useCallback(async (char: Character, monthsToAdvance: number = 1) => {
    saveForRollback();
    setIsLoading(true);
    let updatedChar = { ...char };
    let summaryAdditions: LifeSummaryEntry[] = [];
    let shouldEndGame = false;
    let finalMonthsRemaining = monthsRemainingInYear - monthsToAdvance;

    if (finalMonthsRemaining <= 0) {
        // End of year processing
        updatedChar.age += 1;
        finalMonthsRemaining = TOTAL_MONTHS_PER_YEAR;

        // Check for death by old age or health conditions
        const deathChance = (updatedChar.age > 70) ? (updatedChar.age - 70) * 0.01 : 0;
        const healthModifier = (100 - updatedChar.health) * 0.005;
        if (updatedChar.health <= 0 || Math.random() < (deathChance + healthModifier)) {
            shouldEndGame = true;
        } else {
            // World Event (once per year)
            if (apiKey) {
                try {
                    const worldEvent = await generateWorldEvent(currentYear + 1, economicClimate, apiKey);
                    const worldEventChoice = {
                        choiceText: `O mundo mudou: ${worldEvent.title}`,
                        outcomeText: worldEvent.description,
                        statChanges: worldEvent.effects,
                    };
                    updatedChar = applyChoiceToCharacter(updatedChar, worldEventChoice, true);
                    setWorldEventNotification(worldEvent);
                } catch (e) {
                    console.error("Failed to generate world event:", e);
                }
            }

            // Normal yearly updates
            updatedChar.relationships = updatedChar.relationships.map(r => ({ ...r, age: (r.age || 0) + 1 }));
            updatedChar = checkLifeGoals(updatedChar);
            const { updatedChar: charWithPenalties, penaltiesApplied } = applyCriticalStatPenalties(updatedChar);
            updatedChar = charWithPenalties;
            summaryAdditions.push(...penaltiesApplied.map(text => ({ text, isEpic: true })));

            const { updatedChar: charWithHealthCheck, newConditionMessage } = checkForNewHealthConditions(updatedChar);
            updatedChar = charWithHealthCheck;
            if (newConditionMessage) {
                summaryAdditions.push({ text: newConditionMessage, isEpic: true });
            }

            setLifeSummary(prev => [...prev, ...summaryAdditions, { text: `${updatedChar.name} completou ${updatedChar.age} anos.`, isEpic: false }]);
            setCurrentYear(prev => prev + 1);
            setMonthsRemainingInYear(TOTAL_MONTHS_PER_YEAR);
            setCharacter(updatedChar);
            setGameState(GameState.ROUTINE_PLANNING);
            setIsLoading(false);
        }
    } else {
        // Mid-year event progression
        setMonthsRemainingInYear(finalMonthsRemaining);
        setCharacter(updatedChar);
        await fetchNextEvent(updatedChar, currentYear);
    }
    
    if (shouldEndGame) {
        updatedChar.causeOfDeath = determineCauseOfDeath(updatedChar);
        const finalSummaryEntry = { text: `A vida de ${updatedChar.name} chegou ao fim aos ${updatedChar.age} anos. Causa: ${updatedChar.causeOfDeath}.`, isEpic: true };
        const finalSummary = [...lifeSummary, finalSummaryEntry];
        setLifeSummary(finalSummary);
        
        const updatedLineage = updateLineageTitle(updatedChar, lineage);
        
        recordAncestor(updatedChar, updatedLineage, finalSummary);

        setCharacter(updatedChar);
        setGameState(GameState.GAME_OVER);
        setLegacyPoints(prev => prev + calculateLegacyPoints(updatedChar));
        setLineage(updatedLineage);
        setIsLoading(false);
    }
  }, [character, lifeSummary, currentYear, monthsRemainingInYear, economicClimate, fetchNextEvent, saveForRollback, lineage, apiKey, completedChallenges, recordAncestor, updateLineageTitle]);

  const handleChoice = useCallback(async (choice: Choice) => {
    if (!character) return;
    saveForRollback();
    
    const timeCost = choice.timeCostInUnits || currentEvent?.timeCostInUnits || 1;

    let updatedChar = applyChoiceToCharacter(character, choice, currentEvent?.isEpic);
    const newSummaryEntry = { text: choice.outcomeText, isEpic: currentEvent?.isEpic || false };
    const newLifeSummary = [...lifeSummary, newSummaryEntry];
    setLifeSummary(newLifeSummary);
    
    // Update behavior tracker to avoid repetitive events
    if (currentEvent) {
        const eventKey = currentEvent.eventText.substring(0, 50);
        setBehaviorTracker(prev => ({...prev, [eventKey]: (prev[eventKey] || 0) + 1 }));
    }

    setCurrentEvent(null);

    // This handles special endings immediately
    if (choice.specialEnding) {
        updatedChar.causeOfDeath = choice.specialEnding;
        
        const updatedLineage = updateLineageTitle(updatedChar, lineage);
        
        recordAncestor(updatedChar, updatedLineage, newLifeSummary);

        setCharacter(updatedChar);
        setGameState(GameState.GAME_OVER);
        setLegacyPoints(prev => prev + calculateLegacyPoints(updatedChar));
        setLineage(updatedLineage);
        return;
    }
    
    await advanceYear(updatedChar, timeCost);
  }, [character, currentEvent, advanceYear, saveForRollback, lineage, lifeSummary, recordAncestor, updateLineageTitle]);

  const handleOpenResponseSubmit = useCallback(async (responseText: string) => {
    if (!character || !currentEvent || !apiKey) return;
    setIsLoading(true);
    
    const isMeta = responseText.toLowerCase().startsWith('meta:');
    
    try {
        const choice = isMeta
            ? await processMetaCommand(character, responseText.substring(5).trim(), isTurboMode, apiKey)
            : await evaluatePlayerResponse(character, currentEvent.eventText, responseText, currentFocusContext, isTurboMode, apiKey);
        
        await handleChoice(choice);
    } catch (err) {
        console.error("Falha ao avaliar resposta:", err);
        const errorString = err instanceof Error ? `${err.name}: ${err.message}\n${err.stack}` : JSON.stringify(err);
        setLastError(errorString);
        if (err instanceof Error) {
            if (err.message.includes('429') || err.message.toLowerCase().includes('quota')) {
                setIsQuotaModalOpen(true);
                setError(null);
            } else {
                setError(err.message);
            }
        } else {
            setError("Falha ao processar sua resposta. O universo parece confuso com sua decisão.");
        }
    } finally {
        setIsLoading(false);
    }
  }, [character, currentEvent, handleChoice, isTurboMode, apiKey, currentFocusContext]);

  const handleRoutineConfirm = async (focuses: WeeklyFocus[]) => {
      if (!character) return;
      saveForRollback();
      setIsLoading(true);

      let updatedChar = { ...character };
      let totalCost = 0;
      let focusDescriptions: string[] = [];

      focuses.forEach(focus => {
          totalCost += getDynamicFocusCost(focus, updatedChar);
          focusDescriptions.push(focus.name.toLowerCase());
          
          let statChanges: StatChanges = {};
          // Deep copy to avoid mutation
          for (const key in focus.statChanges) {
              const stat = key as keyof StatChanges;
              statChanges[stat] = focus.statChanges[stat];
          }

          updatedChar = applyChoiceToCharacter(updatedChar, {
              choiceText: '',
              outcomeText: '',
              statChanges
          });

          if (focus.skillName) {
              const skillUpdate: SkillChanges = {
                  update: [{ name: focus.skillName, levelChange: 2, description: `Praticando ${focus.skillName}` }]
              };
               updatedChar = applyChoiceToCharacter(updatedChar, {
                  choiceText: '',
                  outcomeText: '',
                  statChanges: {},
                  skillChanges: skillUpdate
              });
          }
      });

      updatedChar.wealth -= totalCost;
      const focusContext = `Focando em ${focusDescriptions.join(', ')}.`;
      setCurrentFocusContext(focusContext);
      setLifeSummary(prev => [...prev, {text: `${character.name} decidiu focar em ${focusDescriptions.join(', ')} este ano. Isso custou $${totalCost.toLocaleString()}.`, isEpic: false }]);
      
      await fetchNextEvent(updatedChar, currentYear, {});
  };

  const handleContinueAsHeir = (heir: Relationship) => {
    if (!character || !lineage) return;

    const heirChar = createHeirCharacter(heir, character, lineage, legacyPoints);
    
    // Ancestor is now recorded at the moment of death.
    // No need to create another one here.
    
    setLegacyPoints(0); // Reset for new generation
    startGame(heirChar, isMultiplayerCycle);
  };
  
  const handleDowntimeAction = (result: MicroActionResult) => {
    if (!character) return;
    const updatedChar = applyChoiceToCharacter(character, {
        choiceText: '',
        outcomeText: result.outcomeText,
        statChanges: result.statChanges
    });
    setCharacter(updatedChar);
  };
  
  const runAudit = () => {
      if (!character) return;
      setIsAuditLoading(true);
      const report = runCharacterAudit(character);
      setAuditReport(report);
      setIsAuditLoading(false);
      setIsAuditModalOpen(true);
  };

  const handleApplyAuditFixes = async (report: AuditReport) => {
      if (!character) return;
      setIsAuditLoading(true);

      const goalFixes = report.goals.filter(g => g.status === 'completed_unmarked').map(g => g.description);
      const plotFixes = report.plots.filter(p => p.status === 'bugged').map(p => p.description);

      const fixChoice: Choice = {
          choiceText: "Aplicou correções automáticas do sistema.",
          outcomeText: "Os registros da sua vida foram atualizados para refletir conquistas e remover inconsistências.",
          statChanges: {},
          goalChanges: { complete: goalFixes },
          plotChanges: { remove: plotFixes }
      };

      const updatedChar = applyChoiceToCharacter(character, fixChoice, true);
      setCharacter(updatedChar);
      
      // Re-run audit to show updated state
      const newReport = runCharacterAudit(updatedChar);
      setAuditReport(newReport);
      
      setIsAuditLoading(false);
  };
  
  const handleRequestAuditModification = async (request: string) => {
      if (!character || !apiKey) return;
      setIsAuditLoading(true);
      try {
          const fixChoice = await processAuditModificationRequest(character, request, apiKey);
          const updatedChar = applyChoiceToCharacter(character, fixChoice, true);
          setLifeSummary(prev => [...prev, { text: fixChoice.outcomeText, isEpic: true }]);
          setCharacter(updatedChar);
          const newReport = runCharacterAudit(updatedChar);
          setAuditReport(newReport);
      } catch (e) {
          console.error("Error processing audit modification:", e);
          setError("Não foi possível aplicar a correção. A IA pode estar sobrecarregada.");
      } finally {
        setIsAuditLoading(false);
      }
  };

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen font-sans flex flex-col md:flex-row items-start justify-center p-4 gap-4 bg-grid">
      <style>{`.bg-grid { background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px); background-size: 2rem 2rem; }`}</style>
      
      {/* Modals Layer */}
      {isQuotaModalOpen && <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4"><QuotaErrorModal onClose={() => setIsQuotaModalOpen(false)} /></div>}
      {!apiKey && <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4"><ApiKeyModal onSave={(key) => { setApiKey(key); localStorage.setItem(API_KEY_KEY, key); }} /></div>}
      {isRollbackModalOpen && <EmergencyRollbackModal isOpen={isRollbackModalOpen} onClose={() => setIsRollbackModalOpen(false)} onRestore={handleRestore} checkpoints={history} />}
      {isFamilyBookOpen && lineage && <FamilyBookModal isOpen={isFamilyBookOpen} onClose={() => setIsFamilyBookOpen(false)} ancestors={ancestors} lastName={lineage.lastName} />}
      {isJournalOpen && character && <JournalScreen character={character} lifeSummary={lifeSummary} onClose={() => setIsJournalOpen(false)} />}
      {isAuditModalOpen && <AuditReportModal isOpen={isAuditModalOpen} onClose={() => setIsAuditModalOpen(false)} report={auditReport} onApplyFixes={handleApplyAuditFixes} onRequestModification={handleRequestAuditModification} isLoading={isAuditLoading} />}


      {/* Character Sheet (Left Panel) */}
      {character && gameState !== GameState.NOT_STARTED && gameState !== GameState.LEGACY && (
        <CharacterSheet 
            character={character} 
            lifeStage={getCurrentLifeStage(character.age)} 
            lineage={lineage}
            isTurboMode={isTurboMode}
            onToggleTurboMode={() => setIsTurboMode(p => !p)}
            onChangeApiKey={handleChangeApiKey}
            onFullReset={handleFullReset}
            monthsRemainingInYear={monthsRemainingInYear}
            onOpenFamilyBook={() => setIsFamilyBookOpen(true)}
            onRollback={handleOpenRollbackModal}
            canRollback={history.length > 0}
            onRunAudit={runAudit}
        />
      )}
      
      {/* Main Content Area (Center) */}
      <div className="flex-grow flex items-center justify-center w-full md:w-auto p-4">
        {error && <div className="w-full max-w-2xl bg-red-900/50 border border-red-700 text-red-200 p-6 rounded-lg text-center"><p className="font-bold mb-2">Ocorreu um Erro Cósmico</p><p className="text-sm">{error}</p><button onClick={() => setError(null)} className="mt-4 px-4 py-2 bg-red-600 rounded-md">OK</button></div>}

        {!error && isLoading && gameState !== GameState.ROUTINE_PLANNING && (
             character 
             ? <DowntimeActivities character={character} onMicroAction={handleDowntimeAction} onShowDebug={() => setShowDebug(true)} />
             : <LoadingSpinner onShowDebug={() => setShowDebug(true)} />
        )}
        
        {!error && !isLoading && (
          <>
            {gameState === GameState.NOT_STARTED && <StartScreen onStart={startGame} lineage={lineage} legacyBonuses={legacyBonuses} currentYear={currentYear} hasSaveData={hasSaveData} onContinueGame={loadGame} onStartNewGame={handleStartNewGameFromScratch} onShowDebug={() => setShowDebug(true)} />}
            {gameState === GameState.IN_PROGRESS && currentEvent && currentEvent.type !== 'MINI_GAME' && <EventCard event={currentEvent} onChoice={handleChoice} onOpenResponseSubmit={handleOpenResponseSubmit} />}
            {gameState === GameState.IN_PROGRESS && currentEvent && currentEvent.type === 'MINI_GAME' && character && <MiniGameHost event={currentEvent} character={character} onComplete={handleChoice} />}
            {gameState === GameState.ROUTINE_PLANNING && character && <RoutineScreen character={character} onConfirm={handleRoutineConfirm} isLoading={isLoading} />}
            {gameState === GameState.GAME_OVER && character && <GameOverScreen finalCharacter={character} lifeSummary={lifeSummary} legacyPoints={legacyPoints} completedChallenges={completedChallenges} isMultiplayerCycle={isMultiplayerCycle} onContinueLineage={continueLineage} onStartNewLineage={startNewLineage} lineage={lineage} heirs={character.relationships.filter(r => (r.title === 'Filho' || r.title === 'Filha') && (r.age || 0) >= 18)} onContinueAsHeir={handleContinueAsHeir} />}
            {gameState === GameState.LEGACY && <LegacyScreen points={legacyPoints} onStart={startNextGeneration} finalCharacter={character} lineage={lineage} />}
          </>
        )}
      </div>

       {/* Journal Button */}
      {character && (
        <button
          onClick={() => setIsJournalOpen(true)}
          className="fixed bottom-4 right-4 w-16 h-16 bg-amber-800/80 backdrop-blur-sm border-2 border-amber-600 rounded-full text-amber-200 shadow-lg hover:bg-amber-700 transition-all transform hover:scale-110 z-20"
          title="Abrir Diário"
        >
          <span className="w-8 h-8 mx-auto"><BookOpenIcon /></span>
        </button>
      )}

      {/* World Event Toast */}
      {worldEventNotification && <WorldEventToast event={worldEventNotification} onClose={() => setWorldEventNotification(null)} />}
    
      {/* Debug Overlay */}
      {showDebug && lastError && (
        <div className="fixed inset-0 bg-black/80 z-50 p-8 overflow-auto">
          <button onClick={() => setShowDebug(false)} className="absolute top-4 right-4 text-white font-bold">FECHAR</button>
          <h2 className="text-xl text-red-500 font-bold">Último Erro da API</h2>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap mt-4">{lastError}</pre>
        </div>
      )}
    </div>
  );
};

export default App;
