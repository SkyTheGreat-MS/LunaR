/**
 * Junior Astronaut Mission Trainer
 * Core Game & Simulation Types
 */

export type ScreenType = 'home' | 'briefing' | 'simulation' | 'report';

export type GameMode = 'build' | 'survive';

export type ResourceType = 'power' | 'battery' | 'water' | 'food' | 'oxygen' | 'credits';

export interface Resources {
  credits: number;
  powerGenerated: number;
  powerDemanded: number;
  batteryStored: number;
  batteryCapacity: number;
  waterStored: number;
  waterCapacity: number;
  waterDemand: number;
  waterProduced: number;
  foodStored: number;
  foodCapacity: number;
  foodDemand: number;
  foodProduced: number;
  oxygenStored: number;
  oxygenCapacity: number;
  oxygenDemand: number;
  oxygenProduced: number;
}

export type BuildingType =
  | 'habitat'
  | 'solar_array'
  | 'greenhouse'
  | 'water_recycler'
  | 'battery_bank'
  | 'radiation_shielding'
  | 'research_rover';

export interface GridPosition {
  x: number;
  y: number;
}

export interface BuildingSize {
  width: number; // grid tiles
  height: number; // grid tiles
}

export interface BuildingDefinition {
  type: BuildingType;
  name: string;
  shortName?: string;
  category: 'life_support' | 'energy' | 'protection' | 'research';
  cost: number;
  size: BuildingSize;
  description: string;
  whyItMatters: string;
  powerGenerated?: number;
  powerDemanded: number;
  waterDemand?: number;
  waterProduced?: number;
  foodDemand?: number;
  foodProduced?: number;
  oxygenDemand?: number;
  oxygenProduced?: number;
  batteryCapacity?: number;
  waterCapacity?: number;
  foodCapacity?: number;
  oxygenCapacity?: number;
  radiationProtection?: number; // 0 to 100 scale contribution
  crewSupported?: number;
  color: string;
  accentColor: string;
}

export interface PlacedBuilding {
  id: string;
  type: BuildingType;
  position: GridPosition;
  enabled: boolean;
  builtOnDay: number;
  efficiency?: number; // 0 to 1.0 (e.g. dust on solar panels)
  customName?: string;
}

export interface CrewMember {
  id: string;
  name: string;
  role: 'Commander' | 'Life Support Engineer' | 'Botanist' | 'Power Systems Specialist';
  avatar: string;
}

export interface CrewState {
  members: CrewMember[];
  count: number;
  safetyScore: number; // 0 to 100
  safetyStatus: 'Optimal' | 'Stable' | 'Warning' | 'Critical';
  radiationDoseMsv: number; // cumulative mSv
  morale: number; // 0 to 100
  shortageDays: {
    power: number;
    water: number;
    food: number;
    oxygen: number;
  };
}

export interface EnvironmentState {
  solarFlux: number; // 1.0 = full sunlight, drops during eclipses/dust
  temperatureC: number; // -130 to +120
  dustStormLevel: number; // 0 to 1.0
  radiationLevel: number; // background mSv/day (normally ~0.7 mSv/day, higher during SPE)
  isDaytime: boolean;
  activeEvents: string[];
}

export interface MissionObjective {
  id: string;
  title: string;
  description: string;
  targetDay?: number;
  type:
    | 'survive_days'
    | 'build_types'
    | 'maintain_safety'
    | 'resource_surplus'
    | 'science_completed';
  requiredCount?: number;
  requiredBuildingType?: BuildingType;
  requiredSafety?: number;
  currentCount?: number;
  isCompleted: boolean;
  isFailed: boolean;
}

export interface EventChoice {
  id: string;
  title: string;
  description: string;
  creditCost?: number;
  resourceDeltas?: Partial<Resources>;
  environmentalModifiers?: Partial<EnvironmentState>;
  explanation: string;
}

export interface ScheduledEvent {
  id: string;
  day: number;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  scientificContext: string;
  affectedSystems: string[];
  choices: EventChoice[];
  resolvedChoiceId?: string;
  isResolved: boolean;
}

export interface SimulationSnapshot {
  day: number;
  resources: Resources;
  crewSafety: number;
  radiationDose: number;
  netPower: number;
  netWater: number;
  netFood: number;
  netOxygen: number;
  activeBuildingsCount: number;
  eventsSummary: string[];
}

export interface MissionState {
  missionId: string;
  mode: GameMode;
  day: number;
  maxDays: number;
  gridSize: { width: number; height: number };
  buildings: PlacedBuilding[];
  resources: Resources;
  crew: CrewState;
  environment: EnvironmentState;
  objectives: MissionObjective[];
  scheduledEvents: ScheduledEvent[];
  activePendingEvent: ScheduledEvent | null;
  snapshots: SimulationSnapshot[];
  activityLogs: ActivityLogEntry[];
  isCompleted: boolean;
  isFailed: boolean;
  outcomeReason?: string;
  scienceExperimentsCompleted: string[];
}

export interface ActivityLogEntry {
  id: string;
  day: number;
  timestamp: number;
  type: 'info' | 'warning' | 'alert' | 'success' | 'science';
  title: string;
  message: string;
  scienceNote?: string;
}

export interface SimulationResult {
  nextState: MissionState;
  netPower: number;
  netWater: number;
  netFood: number;
  netOxygen: number;
  batteryCharged: number;
  batteryDischarged: number;
  shortages: {
    power: boolean;
    water: boolean;
    food: boolean;
    oxygen: boolean;
  };
  warnings: string[];
  scientificExplanations: string[];
}

export interface MissionDefinition {
  id: string;
  mode: GameMode;
  title: string;
  subtitle: string;
  briefing: string;
  learningFocus: string[];
  durationDays: number;
  initialCredits: number;
  initialResources: Partial<Resources>;
  initialBuildings: PlacedBuilding[];
  gridSize: { width: number; height: number };
  crewCount: number;
  objectives: MissionObjective[];
  scheduledEvents: ScheduledEvent[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface MissionReport {
  missionId: string;
  missionTitle: string;
  mode: GameMode;
  success: boolean;
  daysCompleted: number;
  totalDays: number;
  outcomeTitle: string;
  outcomeSummary: string;
  objectivesAchieved: number;
  totalObjectives: number;
  finalCrewSafety: number;
  finalCreditsRemaining: number;
  snapshots: SimulationSnapshot[];
  strongDecisions: string[];
  improvementAreas: string[];
  keyScienceLessons: string[];
}

export interface GameSettings {
  soundEnabled: boolean;
  volume: number; // 0 to 1
  reducedMotion: boolean;
  showGridLines: boolean;
  highContrast: boolean;
}
