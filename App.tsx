
import React, { useState, useCallback, useEffect } from 'react';
import { GameState, Character, LifeStage, GameEvent, Choice, LegacyBonuses, LifeSummaryEntry, MemoryItem, EconomicClimate, Lineage, LineageCrest, FounderTraits, WeeklyFocus, MiniGameType, Mood, Hobby, HobbyType, FamilyBackground, Checkpoint, Ancestor } from './types';
import { generateGameEvent, evaluatePlayerResponse } from './services/gameService';
import { applyChoiceToCharacter } from './services/characterService';
import { WEEKLY_CHALLENGES, LAST_NAMES, PORTRAIT_COLORS, HEALTH_CONDITIONS, LINEAGE_TITLES, TOTAL_MONTHS_PER_YEAR } from './constants';
import { CREST_COLORS, CREST_ICONS, CREST_SHAPES } from './lineageConstants';
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

const getRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const SAVE_GAME_KEY = 'lifeSimMMORGSaveData';
const API_KEY_KEY = 'geminiApiKey';

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


  // Legacy State
  const [lineage, setLineage] = useState<Lineage | null>(null);
  const [legacyPoints, setLegacyPoints] = useState<number>(0);
  const [legacyBonuses, setLegacyBonuses] = useState<LegacyBonuses | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState<{ name: string; reward: number }[]>([]);
  
  useEffect(() => {
    const storedKey = localStorage.getItem(API_KEY_KEY);
    if (storedKey) {
        setApiKey(storedKey);
    }
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
    if (window.confirm('Tem certeza de que deseja alterar sua chave de API? Seu progresso salvo será mantido.')) {
        localStorage.removeItem(API_KEY_KEY);
        setApiKey(null);
    }
  };

  const handleFullReset = () => {
    if (window.confirm('Tem certeza de que deseja apagar TODO o progresso e a chave de API? Esta ação é irreversível.')) {
        localStorage.removeItem(API_KEY_KEY);
        setApiKey(null);
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
        setError("Chave de API do Gemini não configurada.");
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

  const startGame = (newCharacter: Character, isMultiplayer: boolean) => {
    const startYear = newCharacter.birthYear;
    setCurrentYear(startYear);
    setIsMultiplayerCycle(isMultiplayer);
    setMonthsRemainingInYear(TOTAL_MONTHS_PER_YEAR);
    setBehaviorTracker({}); 
    if (!lineage) {
        const color1 = getRandom(CREST_COLORS);
        const crest: LineageCrest = {
            icon: getRandom(CREST_ICONS),
            color1: color1,
            color2: getRandom(CREST_COLORS.filter(c => c !== color1)),
            shape: getRandom(CREST_SHAPES),
        };
        const founderTraits: FounderTraits = {
            hairColor: getRandom(PORTRAIT_COLORS.hair),
            eyeColor: getRandom(PORTRAIT_COLORS.eyes),
        };
        setLineage({
            lastName: newCharacter.lastName,
            generation: 1,
            crest,
            title: null,
            founderTraits
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
  
  const updateLineageTitle = (char: Character, currentLineage: Lineage): string | null => {
      for (const title of LINEAGE_TITLES) {
          if (title.condition(char)) {
              return title.name;
          }
      }
      return currentLineage.title;
  }
  
  const createAncestorFromCharacter = (char: Character, finalLineage: Lineage | null): Ancestor => {
    const achievements: Ancestor['achievements'] = [];
    if (char.lifeGoals.filter(g => g.completed).length > 0) {
        achievements.push({ text: `Completou ${char.lifeGoals.filter(g => g.completed).length} objetivo(s) de vida`, icon: 'CheckCircleIcon' });
    }
    if ((char.wealth + char.investments) > 500000) {
        achievements.push({ text: `Acumulou mais de $${(char.wealth + char.investments).toLocaleString()}`, icon: 'CurrencyDollarIcon' });
    }
    if (char.careerLevel > 80 && char.jobTitle) {
        achievements.push({ text: `Atingiu o ápice como ${char.jobTitle}`, icon: 'BriefcaseIcon' });
    }
    if (char.fame > 80) {
        achievements.push({ text: 'Alcançou fama mundial', icon: 'StarIcon' });
    } else if (char.fame < -80) {
        achievements.push({ text: 'Tornou-se globalmente infame', icon: 'ShieldExclamationIcon' });
    }
    
    const positiveTraits = char.traits.filter(t => t.type === 'positive').slice(0, 2).map(t => t.name);
    const negativeTraits = char.traits.filter(t => t.type === 'negative').slice(0, 1).map(t => t.name);
    const definingTraits = [...positiveTraits, ...negativeTraits];

    const finalStatus = char.specialEnding || char.causeOfDeath || 'Faleceu de causas naturais.';

    const narrative = `${char.name} foi um(a) ${definingTraits.join(', ')} que marcou sua época. Sua jornada foi definida por ${achievements.length > 0 ? achievements[0].text.toLowerCase() : 'uma vida de momentos simples'}. ${finalStatus}`;

    return {
        id: `${char.generation}-${char.lastName}`,
        generation: char.generation,
        name: char.name,
        lastName: char.lastName,
        eraLived: `${char.birthYear} - ${char.birthYear + char.age}`,
        portraitTraits: char.founderTraits,
        title: finalLineage?.title || null,
        achievements: achievements.slice(0, 3), // Max 3 achievements
        definingTraits,
        finalStatus,
        narrative
    };
  };

  const handleEndOfLife = (char: Character) => {
    let finalSummary = [...lifeSummary];
    const challengesDone = WEEKLY_CHALLENGES.filter(c => c.condition(char));
    const challengePoints = challengesDone.reduce((sum, c) => sum + c.reward, 0);
    setCompletedChallenges(challengesDone.map(({ name, reward }) => ({ name, reward })));

    let basePoints = calculateLegacyPoints(char);
    
    if (char.specialEnding) {
        basePoints += 100;
        finalSummary.push({ text: `Por trilhar um caminho único, sua linhagem ganhou um bônus de 100 Pontos de Legado.`, isEpic: true });
    }
    
    let finalLineage = lineage;
    if (lineage) {
        const newTitle = updateLineageTitle(char, lineage);
        const finalWealth = char.wealth + char.investments;
        let wealthTier: FamilyBackground;
        if (finalWealth < 10000) wealthTier = FamilyBackground.POOR;
        else if (finalWealth < 500000) wealthTier = FamilyBackground.MIDDLE_CLASS;
        else wealthTier = FamilyBackground.WEALTHY;

        finalLineage = { 
            ...lineage, 
            title: newTitle, 
            lastKnownLocation: char.birthplace, 
            lastKnownWealthTier: wealthTier 
        };
        setLineage(finalLineage);
    }
    
    const newAncestor = createAncestorFromCharacter(char, finalLineage);
    setAncestors(prev => [...prev, newAncestor]);

    setLegacyPoints(basePoints + challengePoints);

    setCurrentYear(char.birthYear + char.age);
    setCharacter(char);
    setGameState(GameState.GAME_OVER);
    
    const endMessage = char.specialEnding 
        ? char.specialEnding 
        : `Sua vida terminou aos ${char.age} anos, em ${char.birthYear + char.age}.`;
        
    finalSummary.push({ text: endMessage, isEpic: true });
    setLifeSummary(finalSummary);
  };

  const applyEconomicPhase = (char: Character, currentClimate: EconomicClimate): Character => {
    const updatedChar = { ...char };
    let wealthChange = 0;
    let investmentChange = 0;

    const rand = Math.random();

    switch (currentClimate) {
        case EconomicClimate.RECESSION:
            investmentChange = -Math.floor(updatedChar.investments * (0.05 + Math.random() * 0.10)); // Lose 5-15%
            wealthChange = -Math.floor(updatedChar.wealth * 0.01); // Higher cost of living
            if (updatedChar.profession && rand < 0.05) { // 5% chance of layoff
                updatedChar.profession = null;
                updatedChar.jobTitle = null;
                updatedChar.careerLevel = Math.max(0, updatedChar.careerLevel - 10);
            }
            break;
        case EconomicClimate.STABLE:
            investmentChange = Math.floor(updatedChar.investments * (Math.random() * 0.06 - 0.01)); // -1% to +5%
            break;
        case EconomicClimate.BOOM:
            investmentChange = Math.floor(updatedChar.investments * (0.05 + Math.random() * 0.15)); // Gain 5-20%
            wealthChange = Math.floor(updatedChar.wealth * 0.02); // Small bonus
            if (updatedChar.profession && rand < 0.1) { // 10% chance of promotion
                updatedChar.careerLevel += 5;
            }
            break;
    }

    updatedChar.wealth += wealthChange;
    updatedChar.investments += investmentChange;

    return updatedChar;
  };

   const advanceTime = (characterAfterChoice: Character, timeCostInMonths: number): boolean => {
    const newMonthsRemaining = monthsRemainingInYear - timeCostInMonths;

    if (newMonthsRemaining <= 0) {
        // --- End of Year Logic ---
        let updatedChar = { ...characterAfterChoice, age: characterAfterChoice.age + 1 };
        updatedChar.mood = Mood.CONTENT; // Mood resets each year

        // Economic Phase
        if (Math.random() < 0.25) { // 25% chance of economic shift per year
            const newEconomicClimate = getRandom([EconomicClimate.BOOM, EconomicClimate.RECESSION, EconomicClimate.STABLE]);
            if (newEconomicClimate !== economicClimate) {
                setEconomicClimate(newEconomicClimate);
                updatedChar = applyEconomicPhase(updatedChar, newEconomicClimate);
            }
        }

        // Health degradation with age
        if (updatedChar.age > 40) {
          const healthDecline = Math.max(1, Math.floor((updatedChar.age - 40) / 10));
          updatedChar.health = Math.max(0, updatedChar.health - healthDecline);
        }
        
        // Check for end of life
        if (updatedChar.health <= 0 || updatedChar.age >= 105) {
          let causeOfDeath = 'Causas naturais devido à idade avançada';
          if (updatedChar.health <= 0) {
            if (updatedChar.healthCondition) {
                causeOfDeath = `Complicações de ${updatedChar.healthCondition.name}`;
            } else if (updatedChar.age < 65) {
                causeOfDeath = 'Um mal súbito e inesperado';
            } else {
                causeOfDeath = 'Saúde debilitada';
            }
          }
          handleEndOfLife({ ...updatedChar, causeOfDeath });
          return true; // End of year flow
        }

        // Set state for the new year
        setCharacter(updatedChar);
        setCurrentYear(prev => prev + 1);
        setMonthsRemainingInYear(TOTAL_MONTHS_PER_YEAR + newMonthsRemaining); // Carry over negative time
        setGameState(GameState.ROUTINE_PLANNING); // Always plan at the start of a new year
        return true; // Signal that it's the end of the year
    } else {
        // --- Mid-Year Logic ---
        setMonthsRemainingInYear(newMonthsRemaining);
        setCharacter(characterAfterChoice);
        processNextDecision(characterAfterChoice);
        return false; // Signal that it's mid-year
    }
  };
  
  const handleChoice = (choice: Choice): boolean => {
    if (!character || !currentEvent) return false;
    
    saveForRollback();
    const eventBeingProcessed = currentEvent;
    setCurrentEvent(null); // Clear the event immediately to prevent re-rendering the old card

    const updatedChar = applyChoiceToCharacter(character, choice, eventBeingProcessed.isEpic);

    setLifeSummary(prev => [...prev, { text: choice.outcomeText, isEpic: eventBeingProcessed.isEpic || false }]);
    
    if(choice.specialEnding){
        handleEndOfLife({...updatedChar, specialEnding: choice.specialEnding});
        return true; // Game over is an end-of-year style transition
    }
    
    let timeCost = choice.timeCostInUnits || eventBeingProcessed.timeCostInUnits || 1;
    
    if (updatedChar.age <= 12) {
        timeCost *= 2;
    }
    
    return advanceTime(updatedChar, timeCost);
  };
  
  const handleOpenResponseSubmit = async (responseText: string) => {
    if (!character || !currentEvent || !apiKey) return;
    saveForRollback();
    setIsLoading(true);
    setError(null);

    const MAX_RETRIES = 3;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const choice = await evaluatePlayerResponse(character, currentEvent.eventText, responseText, currentFocusContext, apiKey, isTurboMode);

            if (!choice || !choice.choiceText || !choice.outcomeText) {
                throw new Error("A resposta da IA para sua ação estava vazia ou malformada.");
            }

            const isEndOfYear = handleChoice(choice);
            if (isEndOfYear) {
                setIsLoading(false);
            }
            return; // Success
        } catch (err) {
            console.error(`Falha na tentativa ${attempt} ao avaliar a resposta:`, err);
            const errorString = err instanceof Error ? `${err.name}: ${err.message}\n${err.stack}` : JSON.stringify(err);
            setLastError(errorString);

            if (attempt === MAX_RETRIES) {
                if (err instanceof Error && (err.message.includes('429') || err.message.toLowerCase().includes('quota'))) {
                    setIsQuotaModalOpen(true);
                    setError(null);
                } else {
                    const errorMessage = err instanceof Error
                        ? err.message
                        : 'Houve um problema ao processar sua resposta. Por favor, tente uma das opções ou reformule sua ação.';
                    setError(errorMessage);
                }
                setIsLoading(false);
            } else {
                await new Promise(res => setTimeout(res, 750));
            }
        }
    }
  };


  const handleRoutineConfirm = (focuses: WeeklyFocus[]) => {
      if (!character) return;
      saveForRollback();
      let updatedChar = { ...character };
      let focusContextText = "Focando em: ";
      focuses.forEach(focus => {
          focusContextText += focus.name + " ";
          for(const key in focus.statChanges) {
              const stat = key as keyof typeof focus.statChanges;
              (updatedChar[stat] as number) = (updatedChar[stat] as number) + (focus.statChanges[stat] || 0);
          }
      });
      
      setCurrentFocusContext(focuses.map(f => f.name).join(', '));
      setCharacter(updatedChar);
      processNextDecision(updatedChar);
  };
  
  const handleMicroAction = (result: MicroActionResult) => {
      if(!character) return;
      let updatedChar = { ...character };
      if (result.statChanges) {
        for (const key in result.statChanges) {
            const stat = key as keyof typeof result.statChanges;
            (updatedChar[stat] as number) = (updatedChar[stat] as number) + (result.statChanges[stat] || 0);
        }
      }
      if(result.moodChange) updatedChar.mood = result.moodChange;
      setCharacter(updatedChar);
  };
  
  const handleContinueGame = () => {
    loadGame();
  };

  const handleToggleTurboMode = () => {
    setIsTurboMode(prev => !prev);
  };
  
  const handleApiKeySave = (key: string) => {
    localStorage.setItem(API_KEY_KEY, key);
    setApiKey(key);
  };

  const handleRetry = () => {
    setError(null);
    if (!currentEvent && character) {
        processNextDecision(character);
    }
  };

  const renderMainContent = () => {
    if (isLoading) {
        if (character) {
            return <DowntimeActivities character={character} onMicroAction={handleMicroAction} onShowDebug={() => setShowDebug(true)} onRollback={handleOpenRollbackModal} canRollback={history.length > 0} />;
        }
        return <LoadingSpinner onShowDebug={() => setShowDebug(true)} onRollback={handleOpenRollbackModal} canRollback={history.length > 0} />;
    }
    if (error) {
        return (
            <div className="w-full max-w-lg text-center p-8 bg-red-900/50 border border-red-700 rounded-2xl shadow-2xl animate-fade-in">
                <h2 className="text-xl font-bold text-white mb-2">Um Contratempo do Destino</h2>
                <p className="text-slate-300 mb-6">{error}</p>
                <button
                    onClick={handleRetry}
                    className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 transition-colors"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    switch (gameState) {
      case GameState.NOT_STARTED:
        return <StartScreen onStart={startGame} lineage={lineage} legacyBonuses={legacyBonuses} currentYear={currentYear} hasSaveData={hasSaveData} onContinueGame={handleContinueGame} onStartNewGame={handleStartNewGameFromScratch} onShowDebug={() => setShowDebug(true)} />;
      case GameState.ROUTINE_PLANNING:
        return character && <RoutineScreen character={character} onConfirm={handleRoutineConfirm} isLoading={isLoading} />;
      case GameState.IN_PROGRESS:
        if (currentEvent?.type === 'MINI_GAME') {
            return character && <MiniGameHost event={currentEvent} character={character} onComplete={handleChoice} />;
        }
        return currentEvent ? <EventCard event={currentEvent} onChoice={handleChoice} onOpenResponseSubmit={handleOpenResponseSubmit} /> : <LoadingSpinner onShowDebug={() => setShowDebug(true)} onRollback={handleOpenRollbackModal} canRollback={history.length > 0} />;
      case GameState.GAME_OVER:
        return character ? <GameOverScreen finalCharacter={character} lifeSummary={lifeSummary} legacyPoints={legacyPoints} completedChallenges={completedChallenges} isMultiplayerCycle={isMultiplayerCycle} onContinueLineage={continueLineage} onStartNewLineage={startNewLineage} lineage={lineage} /> : <LoadingSpinner onShowDebug={() => setShowDebug(true)} onRollback={handleOpenRollbackModal} canRollback={history.length > 0} />;
      case GameState.LEGACY:
        return <LegacyScreen points={legacyPoints} onStart={startNextGeneration} finalCharacter={character} lineage={lineage} />;
      default:
        return <div>Estado de Jogo Desconhecido</div>;
    }
  };
  
  if (!apiKey) {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900">
            <ApiKeyModal onSave={handleApiKeySave} />
        </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col md:flex-row items-start justify-center gap-8 p-4 md:p-8 bg-slate-900 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
        {character && <CharacterSheet character={character} lifeStage={getCurrentLifeStage(character.age)} lineage={lineage} isTurboMode={isTurboMode} onToggleTurboMode={handleToggleTurboMode} onChangeApiKey={handleChangeApiKey} onFullReset={handleFullReset} monthsRemainingInYear={monthsRemainingInYear} onOpenFamilyBook={() => setIsFamilyBookOpen(true)} />}
        <div className="flex-grow flex items-center justify-center w-full">
            {renderMainContent()}
        </div>
        {gameState === GameState.IN_PROGRESS && character && (
            <button onClick={() => setIsJournalOpen(true)} className="fixed bottom-6 right-6 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-500 transition-all transform hover:scale-110 flex items-center justify-center" aria-label="Abrir Diário">
                <div className="w-8 h-8"><BookOpenIcon /></div>
            </button>
        )}
        {isJournalOpen && character && <JournalScreen character={character} lifeSummary={lifeSummary} onClose={() => setIsJournalOpen(false)} />}
        {isQuotaModalOpen && <QuotaErrorModal onClose={() => setIsQuotaModalOpen(false)} />}
        {isRollbackModalOpen && (
            <EmergencyRollbackModal
                isOpen={isRollbackModalOpen}
                onClose={() => setIsRollbackModalOpen(false)}
                onRestore={handleRestore}
                checkpoints={history}
            />
        )}
        {isFamilyBookOpen && lineage && (
            <FamilyBookModal
                isOpen={isFamilyBookOpen}
                onClose={() => setIsFamilyBookOpen(false)}
                ancestors={ancestors}
                lastName={lineage.lastName}
            />
        )}
        {showDebug && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                <div className="w-full max-w-2xl bg-slate-800 border border-slate-600 rounded-lg p-6 text-left">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white">Informações de Depuração</h2>
                        <button
                            onClick={() => setShowDebug(false)}
                            className="w-8 h-8 flex items-center justify-center bg-slate-700/50 rounded-full text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
                            aria-label="Fechar"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-300 mb-2">Último Erro Capturado</h3>
                    <pre className="bg-slate-900 p-4 rounded-md text-sm text-red-300 whitespace-pre-wrap overflow-auto max-h-96">
                        {lastError || 'Nenhum erro foi capturado ainda.'}
                    </pre>
                </div>
            </div>
        )}
    </main>
  );
};

export default App;
