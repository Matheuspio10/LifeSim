export interface Trait {
    name: string;
    description: string;
    type: 'positive' | 'negative';
    level?: number;
}

export enum GameState {
  NOT_STARTED,
  IN_PROGRESS,
  GAME_OVER,
  LEGACY,
  ROUTINE_PLANNING,
  YEAR_END_PROCESSING,
}

export enum LifeStage {
  CHILDHOOD = 'Infância',
  ADOLESCENCE = 'Adolescência',
  YOUNG_ADULTHOOD = 'Jovem Adulto',
  ADULTHOOD = 'Adulto',
  OLD_AGE = 'Velhice',
}

export enum FamilyBackground {
    POOR = 'Pobre',
    MIDDLE_CLASS = 'Classe Média',
    WEALTHY = 'Rica'
}

export enum RelationshipType {
    FAMILY = 'Família',
    FRIEND = 'Amigo(a)',
    ROMANTIC = 'Romântico',
    RIVAL = 'Rival',
    MENTOR = 'Mentor',
}

export enum MemoryItemType {
    DOCUMENT = 'Documento',
    PHOTO = 'Foto',
    LETTER = 'Carta',
    TROPHY = 'Troféu',
    RELIC = 'Relíquia',
    MEMENTO = 'Recordação',
}

export enum EconomicClimate {
    RECESSION = 'Recessão',
    STABLE = 'Estável',
    BOOM = 'Boom Econômico',
}

export interface EconomicUpdate {
    climate: EconomicClimate;
    message: string;
    wealthChange: number;
    investmentChange: number;
}

export enum MiniGameType {
    INVESTMENT = 'INVESTMENT',
    PISTOL_DUEL = 'PISTOL_DUEL',
    PUBLIC_DEBATE = 'PUBLIC_DEBATE',
    STOCK_MARKET_SPECULATION = 'STOCK_MARKET_SPECULATION',
    SPEAKEASY_SMUGGLING = 'SPEAKEASY_SMUGGLING',
    BLACK_MARKET_TRADING = 'BLACK_MARKET_TRADING',
    COLD_WAR_ESPIONAGE = 'COLD_WAR_ESPIONAGE',
    GARAGE_STARTUP = 'GARAGE_STARTUP',
    DOTCOM_DAY_TRADING = 'DOTCOM_DAY_TRADING',
    VIRAL_CONTENT_CHALLENGE = 'VIRAL_CONTENT_CHALLENGE',
    GENETIC_EDITING_DILEMMA = 'GENETIC_EDITING_DILEMMA',
}

export enum Mood {
    HAPPY = 'Feliz',
    CONTENT = 'Contente',
    STRESSED = 'Estressado(a)',
    SAD = 'Triste',
    ANGRY = 'Irritado(a)',
}

export interface Skill {
    name: string;
    level: number; // 0-100
    description: string; // e.g., "Pintor Amador", "Virtuoso do Violão"
}

export interface MemoryItem {
    name: string;
    description: string;
    yearAcquired: number;
    type: MemoryItemType;
}

export interface CraftedItem {
    name: string;
    description: string;
}

export interface Relationship {
    name: string;
    type: RelationshipType;
    intimacy: number; // -100 (Inimigo Mortal) a 100 (Alma Gêmea)
    history: string[];
    status?: 'Dating' | 'Engaged' | 'Married' | 'Divorced' | 'Widowed';
    title?: string; // e.g., 'Filho', 'Esposa'
    age?: number;
    gender?: string;
}

export interface LifeGoal {
    description: string;
    completed: boolean;
}

export interface Plot {
    description: string;
    completed: boolean;
}

export interface FounderTraits {
    hairColor: string;
    eyeColor: string;
    skinTone: string;
    hairstyle: string;
    accessories: {
        glasses?: string;
    }
}

export interface HealthCondition {
    name: string;
    ageOfOnset: number;
}

export interface Character {
  name: string;
  lastName: string;
  gender: string;
  generation: number;
  birthYear: number;
  age: number;
  // Core Attributes
  health: number; // 0-100
  intelligence: number; // 0-100
  charisma: number; // 0-100
  creativity: number; // 0-100
  discipline: number; // 0-100
  // New Vitals
  happiness: number; // 0-100
  energy: number; // 0-100
  stress: number; // 0-100
  luck: number; // 0-100
  // Financial
  wealth: number; // Pode ser negativo
  investments: number; // Valor do portfólio de investimentos
  // Social/Reputation
  morality: number; // -100 (Antiético) a 100 (Ético)
  fame: number; // -100 (Infame) a 100 (Famoso)
  influence: number; // -100 (Inimigo Público) a 100 (Ícone Global)
  // Contextual Info
  birthplace: string;
  currentLocation: string;
  familyBackground: FamilyBackground;
  backstory: string;
  // Collections
  traits: Trait[];
  assets: string[];
  relationships: Relationship[];
  memories: MemoryItem[];
  craftedItems: CraftedItem[];
  lifeGoals: LifeGoal[];
  skills: Skill[];
  ongoingPlots?: Plot[];
  // Health & Ending
  healthCondition: HealthCondition | null;
  specialEnding?: string;
  causeOfDeath?: string;
  isPregnant?: boolean;
  // Lineage & Special
  founderTraits: FounderTraits;
  favors: number;
  inheritedSecret?: string | null;
  // Career
  profession: string | null;
  jobTitle: string | null;
  careerLevel: number; // 0-100, represents seniority/progress
  jobSatisfaction: number; // 0-100
}

export interface StatChanges {
  health?: number;
  intelligence?: number;
  charisma?: number;
  creativity?: number;
  discipline?: number;
  wealth?: number;
  investments?: number;
  morality?: number;
  fame?: number;
  influence?: number;
  happiness?: number;
  energy?: number;
  stress?: number;
  luck?: number;
  jobSatisfaction?: number;
}

export interface AssetChanges {
    add?: string[];
    remove?: string[];
}

export interface CraftedItemChanges {
    add?: CraftedItem[];
    remove?: string[]; // array of item names to remove
}

export interface RelationshipChanges {
    add?: Relationship[];
    update?: { name: string; intimacyChange?: number; status?: Relationship['status']; title?: string; }[];
    remove?: string[]; // array of names to remove
    updateHistory?: { name: string; memory: string }[];
}

export interface SkillChanges {
    add?: Skill[];
    update?: { name: string; levelChange: number; description?: string; newName?: string; }[];
}

export interface CareerChange {
    profession?: string; // Set to "" to become unemployed
    jobTitle?: string;
    levelChange?: number;
}

export interface TraitChanges {
    add?: Trait[];
    remove?: string[]; // array of trait names to remove
    update?: { name: string; levelChange: number; description?: string; }[];
}

export interface GoalChanges {
    add?: string[]; // array of goal descriptions to add
    complete?: string[]; // array of goal descriptions to mark as complete
}

export interface PlotChanges {
    add?: string[];
    complete?: string[];
    remove?: string[];
}

export interface Choice {
  choiceText: string;
  outcomeText: string;
  statChanges: StatChanges;
  assetChanges?: AssetChanges;
  relationshipChanges?: RelationshipChanges;
  careerChange?: CareerChange;
  memoryGained?: Omit<MemoryItem, 'yearAcquired'>;
  traitChanges?: TraitChanges;
  healthConditionChange?: string | null;
  goalChanges?: GoalChanges;
  craftedItemChanges?: CraftedItemChanges;
  skillChanges?: SkillChanges;
  plotChanges?: PlotChanges;
  childBorn?: { name: string; gender: string; };
  isPregnantChange?: boolean;
  specialEnding?: string;
  timeCostInUnits?: number; // Representa meses
  locationChange?: string;
}

export interface GameEvent {
  eventText: string;
  choices: Choice[];
  isEpic?: boolean;
  isWorldEvent?: boolean;
  type: 'MULTIPLE_CHOICE' | 'OPEN_RESPONSE' | 'MINI_GAME';
  placeholderText?: string;
  miniGameType?: MiniGameType;
  miniGameData?: any;
  timeCostInUnits?: number; // Representa meses
}

export interface LifeSummaryEntry {
    text: string;
    isEpic: boolean;
}

export interface LegacyBonuses {
    wealth?: number;
    intelligence?: number;
    charisma?: number;
    creativity?: number;
    discipline?: number;
    health?: number;
    influence?: number;
    fame?: number;
    favors?: number;
    addTraits?: Trait[];
    inheritedSecret?: string;
    addSkills?: Skill[];
    addAssets?: string[];
    addRelationships?: Relationship[];
}


export interface WeeklyChallenge {
    id: string;
    name: string;
    description: string;
    condition: (char: Character) => boolean;
    reward: number;
}

export interface ParallelLifeData {
    lastName: string;
    notableAchievement: string;
    finalWealth: number;
    isPlayer?: boolean;
}

export interface LineageCrest {
    icon: string;
    color1: string;
    color2: string;
    shape: 'circle' | 'shield';
}

export interface Lineage {
    lastName: string;
    generation: number;
    crest: LineageCrest;
    title: string | null;
    founderTraits: FounderTraits;
    lastKnownLocation?: string;
    lastKnownWealthTier?: FamilyBackground;
}

export interface WeeklyFocus {
    id: string;
    name: string;
    description: string;
    iconName: string;
    statChanges: StatChanges;
    skillName?: string;
}

export interface Checkpoint {
  id: string;
  timestamp: string;
  name: string;
  keyActions: string[];
  stateSnapshot: any;
}

export interface Ancestor {
  id: string;
  generation: number;
  name: string;
  lastName: string;
  eraLived: string;
  portraitTraits: FounderTraits;
  title: string | null;
  achievements: { text: string; icon: string; }[];
  definingTraits: string[];
  finalStatus: string;
  narrative: string;
}

export interface WorldEvent {
  title: string;
  description: string;
  effects: StatChanges;
}

export interface GameOverScreenProps {
  finalCharacter: Character;
  lifeSummary: LifeSummaryEntry[];
  legacyPoints: number;
  completedChallenges: { name: string; reward: number }[];
  isMultiplayerCycle: boolean;
  onContinueLineage: () => void;
  onStartNewLineage: () => void;
  lineage: Lineage | null;
  heirs: Relationship[];
  onContinueAsHeir: (heir: Relationship) => void;
}

// --- Audit System Types ---
export interface GoalFinding {
  description: string;
  status: 'completed_unmarked' | 'in_progress' | 'completed';
  recommendation: string;
}

export interface RelationshipFinding {
  name: string;
  status: 'neglected' | 'opportunity' | 'stale_rivalry' | 'healthy';
  recommendation: string;
}

export interface PlotFinding {
  description: string;
  status: 'in_progress' | 'completed' | 'bugged';
  recommendation: string;
}

export interface CohesionFinding {
  area: string;
  status: 'inconsistent' | 'ok';
  recommendation: string;
}

export interface AuditReport {
  goals: GoalFinding[];
  relationships: RelationshipFinding[];
  plots: PlotFinding[];
  cohesion: CohesionFinding[];
  fixesAvailable: number;
}

export interface CharacterSheetProps {
  character: Character;
  lifeStage: LifeStage;
  lineage: Lineage | null;
  isTurboMode: boolean;
  onToggleTurboMode: () => void;
  onChangeApiKey: () => void;
  onFullReset: () => void;
  monthsRemainingInYear: number;
  onOpenFamilyBook: () => void;
  onRollback: () => void;
  canRollback: boolean;
  onRunAudit: () => void;
}

export interface AuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: AuditReport | null;
  onApplyFixes: (report: AuditReport) => void;
}
