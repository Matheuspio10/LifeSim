

export interface Trait {
    name: string;
    description: string;
    type: 'positive' | 'negative';
}

export enum GameState {
  NOT_STARTED,
  IN_PROGRESS,
  GAME_OVER,
  LEGACY,
  ROUTINE_PLANNING,
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

export enum MiniGameType {
    INVESTMENT = 'INVESTMENT',
}

export enum Mood {
    HAPPY = 'Feliz',
    CONTENT = 'Contente',
    STRESSED = 'Estressado(a)',
    SAD = 'Triste',
    ANGRY = 'Irritado(a)',
}

export enum HobbyType {
    ART = 'Arte',
    MUSIC = 'Música',
    COOKING = 'Culinária',
    SPORTS = 'Esportes',
    GAMBLING = 'Jogos de Azar',
}

export interface Hobby {
    type: HobbyType;
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
}

export interface LifeGoal {
    description: string;
    completed: boolean;
}

export interface FounderTraits {
    hairColor: string;
    eyeColor: string;
}

export interface HealthCondition {
    name: string;
    ageOfOnset: number;
}

export interface Character {
  name: string;
  lastName: string;
  generation: number;
  birthYear: number;
  age: number;
  health: number; // 0-100
  intelligence: number; // 0-100
  charisma: number; // 0-100
  creativity: number; // 0-100
  discipline: number; // 0-100
  wealth: number; // Pode ser negativo
  investments: number; // Valor do portfólio de investimentos
  morality: number; // -100 (Antiético) a 100 (Ético)
  fame: number; // -100 (Infame) a 100 (Famoso)
  influence: number; // -100 (Inimigo Público) a 100 (Ícone Global)
  mood: Mood;
  birthplace: string;
  familyBackground: FamilyBackground;
  traits: Trait[];
  assets: string[];
  relationships: Relationship[];
  memories: MemoryItem[];
  craftedItems: CraftedItem[];
  lifeGoals: LifeGoal[];
  hobbies: Hobby[];
  healthCondition: HealthCondition | null;
  specialEnding?: string;
  founderTraits: FounderTraits;
  // Career
  profession: string | null;
  jobTitle: string | null;
  careerLevel: number; // 0-100, represents seniority/progress
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
    update?: { name: string; intimacyChange: number }[];
    remove?: string[]; // array of names to remove
    updateHistory?: { name: string; memory: string }[];
}

export interface HobbyChanges {
    add?: Hobby[];
    update?: { type: HobbyType; levelChange: number; description?: string; }[];
}

export interface CareerChange {
    profession?: string; // Set to "" to become unemployed
    jobTitle?: string;
    levelChange?: number;
}

export interface TraitChanges {
    add?: Trait[];
    remove?: string[]; // array of trait names to remove
}

export interface GoalChanges {
    add?: string[]; // array of goal descriptions to add
    complete?: string[]; // array of goal descriptions to mark as complete
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
  hobbyChanges?: HobbyChanges;
  moodChange?: Mood;
  specialEnding?: string;
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
    trait?: Trait;
    influence?: number;
    fame?: number;
}

export interface EconomicUpdate {
    climate: EconomicClimate;
    wealthChange: number;
    investmentChange: number;
    message: string;
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
}

export interface WeeklyFocus {
    id: string;
    name: string;
    description: string;
    iconName: string;
    statChanges: StatChanges;
    hobbyType?: HobbyType;
}