import React, { useState, useCallback, useEffect } from 'react';
import { GameState, Character, LifeStage, GameEvent, Choice, LegacyBonuses, LifeSummaryEntry, MemoryItem, EconomicClimate, EconomicUpdate, Lineage, LineageCrest, FounderTraits, WeeklyFocus, MiniGameType, Mood, Hobby } from './types';
import { generateGameEvent, evaluatePlayerResponse } from './services/gameService';
import { WEEKLY_CHALLENGES, LAST_NAMES, PORTRAIT_COLORS, HEALTH_CONDITIONS, LINEAGE_TITLES } from './constants';
import { CREST_COLORS, CREST_ICONS, CREST_SHAPES } from './lineageConstants';
import CharacterSheet from './components/CharacterSheet';
import EventCard from './components/EventCard';
import GameOverScreen from './components/GameOverScreen';
import StartScreen from './components/StartScreen';
import LoadingSpinner from './components/LoadingSpinner';
import LegacyScreen from './components/LegacyScreen';
import EconomicUpdateNotice from './components/EconomicUpdateNotice';
import RoutineScreen from './components/RoutineScreen';
import MiniGameHost from './components/MiniGameHost';
import JournalScreen from './components/JournalScreen';
import { BookOpenIcon } from './components/Icons';
import DowntimeActivities, { MicroActionResult } from './components/DowntimeActivities';

const getRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const ROUTINE_PLANNING_INTERVAL = 4; // Player plans their routine every 4 years.
const SAVE_GAME_KEY = 'lifeSimMMORGSaveData';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.NOT_STARTED);
  const [character, setCharacter] = useState<Character | null>(null);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lifeSummary, setLifeSummary] = useState<LifeSummaryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentYear, setCurrentYear] = useState<number>(1980);
  const [economicClimate, setEconomicClimate] = useState<EconomicClimate>(EconomicClimate.STABLE);
  const [economicUpdateNotice, setEconomicUpdateNotice] = useState<EconomicUpdate | null>(null);
  const [isMultiplayerCycle, setIsMultiplayerCycle] = useState<boolean>(false);
  const [yearsSinceLastRoutine, setYearsSinceLastRoutine] = useState<number>(0);
  const [currentFocusContext, setCurrentFocusContext] = useState<string | null>(null);
  const [behaviorTracker, setBehaviorTracker] = useState<Record<string, number>>({});
  const [isJournalOpen, setIsJournalOpen] = useState<boolean>(false);
  const [hasSaveData, setHasSaveData] = useState<boolean>(false);
  const [isTurboMode, setIsTurboMode] = useState<boolean>(false);


  // Legacy State
  const [lineage, setLineage] = useState<Lineage | null>(null);
  const [legacyPoints, setLegacyPoints] = useState<number>(0);
  const [legacyBonuses, setLegacyBonuses] = useState<LegacyBonuses | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState<{ name: string; reward: number }[]>([]);

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
            setYearsSinceLastRoutine(parsedData.yearsSinceLastRoutine ?? 0);
            setCurrentFocusContext(parsedData.currentFocusContext ?? null);
            setBehaviorTracker(parsedData.behaviorTracker ?? {});
            setLineage(parsedData.lineage ?? null);
            setLegacyPoints(parsedData.legacyPoints ?? 0);
            setIsTurboMode(parsedData.isTurboMode ?? false);
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
        gameState,
        character,
        currentEvent,
        lifeSummary,
        currentYear,
        economicClimate,
        isMultiplayerCycle,
        yearsSinceLastRoutine,
        currentFocusContext,
        behaviorTracker,
        lineage,
        legacyPoints,
        isTurboMode,
    };
    localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(gameToSave));
  }, [gameState, character, currentEvent, lifeSummary, currentYear, economicClimate, isMultiplayerCycle, yearsSinceLastRoutine, currentFocusContext, behaviorTracker, lineage, legacyPoints, isTurboMode]);

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
    setEconomicUpdateNotice(null);
    setIsMultiplayerCycle(false);
    setYearsSinceLastRoutine(0);
    setCurrentFocusContext(null);
    setBehaviorTracker({});
    setIsJournalOpen(false);
    setLineage(null);
    setLegacyPoints(0);
    setLegacyBonuses(null);
    setCompletedChallenges([]);
    setIsTurboMode(false);
  };

  const handleStartNewGameFromScratch = () => {
    if (window.confirm('Tem certeza de que deseja iniciar um novo jogo? Seu progresso salvo será perdido.')) {
        resetGameAndClearSave();
    }
  };

  const getCurrentLifeStage = (age: number): LifeStage => {
    if (age <= 12) return LifeStage.CHILDHOOD;
    if (age <= 19) return LifeStage.ADOLESCENCE;
    if (age <= 35) return LifeStage.YOUNG_ADULTHOOD;
    if (age <= 65) return LifeStage.ADULTHOOD;
    return LifeStage.OLD_AGE;
  };
  
  const fetchNextEvent = useCallback(async (char: Character, eventYear: number, focusContext: string | null = null, newBehaviorTracker?: Record<string, number>) => {
    setIsLoading(true);
    setError(null);
    try {
      const lifeStage = getCurrentLifeStage(char.age);
      const lineageTitle = lineage ? lineage.title : null;
      const event = await generateGameEvent(char, lifeStage, eventYear, economicClimate, lineageTitle, focusContext || currentFocusContext, newBehaviorTracker ?? behaviorTracker, isTurboMode);
      setCurrentEvent(event);
      setGameState(GameState.IN_PROGRESS);
    } catch (err)      {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Falha ao gerar um evento de vida. O universo está contemplando sua existência. Por favor, tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [economicClimate, lineage, currentFocusContext, behaviorTracker, isTurboMode]);

  const startGame = (newCharacter: Character, isMultiplayer: boolean) => {
    const startYear = newCharacter.birthYear;
    setCurrentYear(startYear);
    setIsMultiplayerCycle(isMultiplayer);
    setYearsSinceLastRoutine(0); 
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
    points += Math.floor(char.wealth / 1000);
    points += Math.floor(char.investments / 2000);
    points += Math.floor((char.intelligence + char.charisma + char.creativity + char.discipline) / 20);
    points += char.age > 85 ? Math.floor((char.age - 85) / 2) : 0;
    points += char.assets.length;
    points += char.memories.length * 2;
    points += char.lifeGoals.filter(g => g.completed).length * 5;
    points += Math.floor(char.careerLevel / 10);
    points += Math.floor(char.fame / 10);
    points += Math.max(0, Math.floor(char.influence / 5));
    return Math.max(0, points);
  };

  const startNewLineage = () => {
    localStorage.removeItem(SAVE_GAME_KEY);
    setLineage(null);
    setLegacyBonuses(null);
    setLegacyPoints(0);
    setCharacter(null);
    setCurrentEvent(null);
    setCompletedChallenges([]);
    setIsMultiplayerCycle(false);
    setGameState(GameState.NOT_STARTED);
  }

  const continueLineage = () => {
      setGameState(GameState.LEGACY);
  }

  const startNextGeneration = (bonuses: LegacyBonuses) => {
    setLegacyBonuses(bonuses);
    setCharacter(null);
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
    
    if (lineage) {
        const newTitle = updateLineageTitle(char, lineage);
        // This is a crucial update. We need to create a new object to trigger re-render.
        setLineage(prevLineage => prevLineage ? { ...prevLineage, title: newTitle } : null);
    }

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

  const applyEconomicPhase = (char: Character, currentClimate: EconomicClimate): { updatedCharacter: Character, updateInfo: EconomicUpdate } => {
    const updatedChar = { ...char };
    let wealthChange = 0;
    let investmentChange = 0;
    let message = "";

    const rand = Math.random();

    switch (currentClimate) {
        case EconomicClimate.RECESSION:
            investmentChange = -Math.floor(updatedChar.investments * (0.05 + Math.random() * 0.10)); // Lose 5-15%
            wealthChange = -Math.floor(updatedChar.wealth * 0.01); // Higher cost of living
            message = "A recessão aperta. Seus investimentos perdem valor e o custo de vida aumenta.";
            if (updatedChar.profession && rand < 0.05) { // 5% chance of layoff
                message += " Você foi demitido. O mercado de trabalho está congelado.";
                updatedChar.profession = null;
                updatedChar.jobTitle = null;
                updatedChar.careerLevel = Math.max(0, updatedChar.careerLevel - 10);
            }
            break;
        case EconomicClimate.STABLE:
            investmentChange = Math.floor(updatedChar.investments * (Math.random() * 0.06 - 0.01)); // -1% to +5%
            message = "A economia está estável, com pequenas flutuações no mercado de ações.";
            break;
        case EconomicClimate.BOOM:
            investmentChange = Math.floor(updatedChar.investments * (0.05 + Math.random() * 0.15)); // Gain 5-20%
            wealthChange = Math.floor(updatedChar.wealth * 0.02); // Small bonus
            message = "A economia está em alta! Seus investimentos disparam e novas oportunidades surgem.";
            if (updatedChar.profession && rand < 0.1) { // 10% chance of promotion
                message += " Você recebeu uma promoção inesperada!";
                updatedChar.careerLevel += 5;
            }
            break;
    }

    updatedChar.wealth += wealthChange;
    updatedChar.investments += investmentChange;

    const updateInfo: EconomicUpdate = { climate: currentClimate, wealthChange, investmentChange, message };
    return { updatedCharacter: updatedChar, updateInfo };
  };

   const advanceYear = useCallback(() => {
    if (!character) return;

    let updatedChar = { ...character, age: character.age + 1 };
    updatedChar.mood = Mood.CONTENT; // Mood resets each year towards content

    // Health degradation with age
    if (updatedChar.age > 40) {
      const healthDecline = Math.max(1, Math.floor((updatedChar.age - 40) / 10));
      updatedChar.health = Math.max(0, updatedChar.health - healthDecline);
    }
    
    // Check for end of life
    if (updatedChar.health <= 0 || updatedChar.age >= 105) {
      handleEndOfLife(updatedChar);
      return;
    }

    // Economic Phase
    if (Math.random() < 0.25) { // 25% chance of economic shift per year
        const newEconomicClimate = getRandom([EconomicClimate.BOOM, EconomicClimate.RECESSION, EconomicClimate.STABLE]);
        if (newEconomicClimate !== economicClimate) {
            setEconomicClimate(newEconomicClimate);
            const { updatedCharacter, updateInfo } = applyEconomicPhase(updatedChar, newEconomicClimate);
            updatedChar = updatedCharacter;
            setEconomicUpdateNotice(updateInfo);
        }
    } else {
        setEconomicUpdateNotice(null);
    }


    setCharacter(updatedChar);
    setCurrentYear(prev => prev + 1);
    
    const newYearsSinceRoutine = yearsSinceLastRoutine + 1;
    setYearsSinceLastRoutine(newYearsSinceRoutine);
    
    if (newYearsSinceRoutine >= ROUTINE_PLANNING_INTERVAL) {
        setGameState(GameState.ROUTINE_PLANNING);
    } else {
       setTimeout(() => fetchNextEvent(updatedChar, currentYear + 1), economicUpdateNotice ? 2500 : 500);
    }

  }, [character, currentYear, economicClimate, fetchNextEvent, yearsSinceLastRoutine]);
  
  const handleChoice = (choice: Choice) => {
    if (!character) return;
    
    let updatedChar = { ...character };

    // Apply changes, create helper function later
    if (choice.statChanges) {
        for (const key in choice.statChanges) {
            const stat = key as keyof typeof choice.statChanges;
            (updatedChar[stat] as number) = (updatedChar[stat] as number) + (choice.statChanges[stat] || 0);
        }
    }
     if (choice.assetChanges) {
        updatedChar.assets = [...updatedChar.assets, ...(choice.assetChanges.add || [])];
        updatedChar.assets = updatedChar.assets.filter(a => !(choice.assetChanges!.remove || []).includes(a));
    }
    if(choice.memoryGained) {
        const newMemory: MemoryItem = { ...choice.memoryGained, yearAcquired: updatedChar.age };
        updatedChar.memories = [...updatedChar.memories, newMemory];
    }
    if (choice.moodChange) {
        updatedChar.mood = choice.moodChange;
    }
    
    // Clamp values
    updatedChar.health = Math.max(0, Math.min(100, updatedChar.health));
    updatedChar.intelligence = Math.max(0, Math.min(100, updatedChar.intelligence));
    updatedChar.charisma = Math.max(0, Math.min(100, updatedChar.charisma));
    updatedChar.creativity = Math.max(0, Math.min(100, updatedChar.creativity));
    updatedChar.discipline = Math.max(0, Math.min(100, updatedChar.discipline));
    updatedChar.morality = Math.max(-100, Math.min(100, updatedChar.morality));
    updatedChar.fame = Math.max(-100, Math.min(100, updatedChar.fame));
    updatedChar.influence = Math.max(-100, Math.min(100, updatedChar.influence));


    setLifeSummary(prev => [...prev, { text: choice.outcomeText, isEpic: currentEvent?.isEpic || false }]);
    
    if(choice.specialEnding){
        handleEndOfLife({...updatedChar, specialEnding: choice.specialEnding});
        return;
    }
    
    setCharacter(updatedChar);
    advanceYear();
  };
  
  const handleOpenResponseSubmit = async (responseText: string) => {
     if (!character || !currentEvent) return;
     setIsLoading(true);
     setError(null);
     try {
        const choice = await evaluatePlayerResponse(character, currentEvent.eventText, responseText);
        handleChoice(choice);
     } catch (err) {
        console.error(err);
        const errorMessage = 'Houve um problema ao processar sua resposta. Por favor, tente uma das opções ou reformule sua ação.';
        setError(errorMessage);
     } finally {
        setIsLoading(false);
     }
  };

  const handleRoutineConfirm = (focuses: WeeklyFocus[]) => {
      if (!character) return;
      let updatedChar = { ...character };
      let focusContext = "Focando em: ";
      focuses.forEach(focus => {
          focusContext += focus.name + " ";
          for(const key in focus.statChanges) {
              const stat = key as keyof typeof focus.statChanges;
              (updatedChar[stat] as number) = (updatedChar[stat] as number) + (focus.statChanges[stat] || 0);
          }
      });
      
      setCurrentFocusContext(focuses.length > 0 ? focuses[0].name : null);
      setYearsSinceLastRoutine(0);
      setCharacter(updatedChar);
      fetchNextEvent(updatedChar, currentYear, focuses.length > 0 ? focuses[0].name : null);
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

  const renderMainContent = () => {
    if (isLoading) {
        if (gameState === GameState.IN_PROGRESS) {
            return character && <DowntimeActivities character={character} onMicroAction={handleMicroAction} />;
        }
        return <LoadingSpinner />;
    }
    if (error) {
        return <div className="text-red-400 text-center p-4 bg-red-900/50 rounded-lg">{error}</div>;
    }

    switch (gameState) {
      case GameState.NOT_STARTED:
        return <StartScreen onStart={startGame} lineage={lineage} legacyBonuses={legacyBonuses} currentYear={currentYear} hasSaveData={hasSaveData} onContinueGame={handleContinueGame} onStartNewGame={handleStartNewGameFromScratch} />;
      case GameState.ROUTINE_PLANNING:
        return character && <RoutineScreen character={character} onConfirm={handleRoutineConfirm} isLoading={isLoading} />;
      case GameState.IN_PROGRESS:
        if (economicUpdateNotice) {
            return <EconomicUpdateNotice update={economicUpdateNotice} />;
        }
        if (currentEvent?.type === 'MINI_GAME') {
            return character && <MiniGameHost event={currentEvent} character={character} onComplete={handleChoice} />;
        }
        return currentEvent ? <EventCard event={currentEvent} onChoice={handleChoice} onOpenResponseSubmit={handleOpenResponseSubmit} /> : <LoadingSpinner />;
      case GameState.GAME_OVER:
        return character ? <GameOverScreen finalCharacter={character} lifeSummary={lifeSummary} legacyPoints={legacyPoints} completedChallenges={completedChallenges} isMultiplayerCycle={isMultiplayerCycle} onContinueLineage={continueLineage} onStartNewLineage={startNewLineage} lineage={lineage} /> : <LoadingSpinner />;
      case GameState.LEGACY:
        return <LegacyScreen points={legacyPoints} onStart={startNextGeneration} finalCharacter={character} lineage={lineage} />;
      default:
        return <div>Estado de Jogo Desconhecido</div>;
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row items-start justify-center gap-8 p-4 md:p-8 bg-slate-900 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
        {character && <CharacterSheet character={character} lifeStage={getCurrentLifeStage(character.age)} lineage={lineage} isTurboMode={isTurboMode} onToggleTurboMode={handleToggleTurboMode} />}
        <div className="flex-grow flex items-center justify-center w-full">
            {renderMainContent()}
        </div>
        {gameState === GameState.IN_PROGRESS && character && (
            <button onClick={() => setIsJournalOpen(true)} className="fixed bottom-6 right-6 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-500 transition-all transform hover:scale-110 flex items-center justify-center" aria-label="Abrir Diário">
                <div className="w-8 h-8"><BookOpenIcon /></div>
            </button>
        )}
        {isJournalOpen && character && <JournalScreen character={character} lifeSummary={lifeSummary} onClose={() => setIsJournalOpen(false)} />}
    </main>
  );
};

export default App;