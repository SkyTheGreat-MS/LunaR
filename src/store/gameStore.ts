/**
 * Game Store (Zustand)
 * Central reactive state management for screens, active simulation, UI selection,
 * modals, audio, and settings.
 */

import { create } from 'zustand';
import { sound } from '../game/audio/sound';
import { BUILDING_CATALOG } from '../game/catalog/buildings';
import { MISSIONS } from '../game/catalog/missions';
import { SCIENCE_EXPERIMENTS } from '../game/science/experiments';
import {
  advanceDay,
  calculateLiveRates,
  canPlaceBuilding,
  createInitialMissionState,
} from '../game/simulation/engine';
import {
  BuildingType,
  GameSettings,
  GridPosition,
  MissionDefinition,
  MissionReport,
  MissionState,
  PlacedBuilding,
  ScreenType,
} from '../game/types';
import {
  clearSavedMission,
  DEFAULT_SETTINGS,
  loadMissionFromStorage,
  loadSettingsFromStorage,
  saveMissionToStorage,
  saveSettingsToStorage,
} from '../persistence/storage';

export interface GameStoreState {
  screen: ScreenType;
  selectedMissionDef: MissionDefinition | null;
  activeMission: MissionState | null;
  hasSavedMission: boolean;

  // UI state
  placementType: BuildingType | null;
  selectedBuilding: PlacedBuilding | null;
  isPaused: boolean;

  // Modals
  isScienceLabOpen: boolean;
  isWhatIfOpen: boolean;
  isHistoryOpen: boolean;
  isSettingsOpen: boolean;
  isReportOpen: boolean;
  currentReport: MissionReport | null;

  // Tutorial
  tutorialActive: boolean;
  tutorialStep: number;

  // Settings
  settings: GameSettings;

  // Notifications / Toast
  toast: { message: string; type: 'info' | 'success' | 'warning' } | null;

  // Actions
  setScreen: (screen: ScreenType) => void;
  openMissionBriefing: (missionId: string) => void;
  startMission: () => void;
  resumeSavedMission: () => void;
  advanceDay: (choiceSelection?: { eventId: string; choiceId: string }) => void;
  setPlacementType: (type: BuildingType | null) => void;
  placeBuildingAt: (position: GridPosition) => boolean;
  selectBuilding: (building: PlacedBuilding | null) => void;
  toggleBuildingActive: (buildingId: string) => void;
  demolishBuilding: (buildingId: string) => void;
  openModal: (modal: 'science' | 'whatIf' | 'history' | 'settings' | 'report') => void;
  closeModals: () => void;
  resolveEventChoice: (eventId: string, choiceId: string) => void;
  applyScienceBonus: (experimentId: string) => void;
  applyWhatIfChanges: (newBuildings: PlacedBuilding[]) => void;
  nextTutorialStep: () => void;
  skipTutorial: () => void;
  startTutorial: () => void;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  showToast: (message: string, type?: 'info' | 'success' | 'warning') => void;
  retryMission: () => void;
  exitToHome: () => void;
}

export const useGameStore = create<GameStoreState>((set, get) => {
  const initialSettings = loadSettingsFromStorage();
  sound.setEnabled(initialSettings.soundEnabled);
  sound.setVolume(initialSettings.volume);

  const savedMission = loadMissionFromStorage();

  return {
    screen: 'home',
    selectedMissionDef: MISSIONS[0],
    activeMission: null,
    hasSavedMission: !!savedMission,

    placementType: null,
    selectedBuilding: null,
    isPaused: false,

    isScienceLabOpen: false,
    isWhatIfOpen: false,
    isHistoryOpen: false,
    isSettingsOpen: false,
    isReportOpen: false,
    currentReport: null,

    tutorialActive: false,
    tutorialStep: 0,

    settings: initialSettings,
    toast: null,

    setScreen: (screen) => {
      sound.playClick();
      set({ screen });
    },

    openMissionBriefing: (missionId) => {
      sound.playClick();
      const def = MISSIONS.find((m) => m.id === missionId) || MISSIONS[0];
      set({ selectedMissionDef: def, screen: 'briefing' });
    },

    startMission: () => {
      const def = get().selectedMissionDef || MISSIONS[0];
      const initial = createInitialMissionState(def);
      saveMissionToStorage(initial);
      sound.playSuccess();

      // Show tutorial on first mission if beginner
      const shouldTutorial = def.id === 'build_artemis_alpha';

      set({
        activeMission: initial,
        screen: 'simulation',
        hasSavedMission: true,
        placementType: null,
        selectedBuilding: null,
        tutorialActive: shouldTutorial,
        tutorialStep: 0,
        isReportOpen: false,
        currentReport: null,
      });
    },

    resumeSavedMission: () => {
      const saved = loadMissionFromStorage();
      if (saved) {
        sound.playClick();
        const def = MISSIONS.find((m) => m.id === saved.missionId) || MISSIONS[0];
        set({
          activeMission: saved,
          selectedMissionDef: def,
          screen: 'simulation',
          hasSavedMission: true,
          tutorialActive: false,
        });
      }
    },

    advanceDay: (choiceSelection) => {
      const state = get().activeMission;
      if (!state || state.isCompleted || state.isFailed) return;

      const simResult = advanceDay(state, choiceSelection);
      const nextState = simResult.nextState;

      sound.playAdvanceDay();
      if (simResult.warnings.length > 0) {
        sound.playWarning();
      }

      saveMissionToStorage(nextState);

      // Check if finished
      if (nextState.isCompleted || nextState.isFailed) {
        const def = get().selectedMissionDef || MISSIONS[0];
        import('../game/simulation/engine').then(({ generateMissionReport }) => {
          const report = generateMissionReport(nextState, def);
          set({
            activeMission: nextState,
            isReportOpen: true,
            currentReport: report,
          });
        });
      } else {
        set({
          activeMission: nextState,
          // Update selectedBuilding reference if any
          selectedBuilding: get().selectedBuilding
            ? nextState.buildings.find((b) => b.id === get().selectedBuilding?.id) || null
            : null,
        });
      }

      // If tutorial step 3 (learn advance day), advance tutorial
      if (get().tutorialActive && get().tutorialStep === 3) {
        set({ tutorialStep: 4 });
      }
    },

    setPlacementType: (type) => {
      sound.playClick();
      set({ placementType: type, selectedBuilding: null });
    },

    placeBuildingAt: (position: GridPosition) => {
      const { activeMission, placementType } = get();
      if (!activeMission || !placementType) return false;

      const def = BUILDING_CATALOG[placementType];
      if (!def) return false;

      // Budget check
      if (activeMission.resources.credits < def.cost) {
        sound.playWarning();
        get().showToast(`Insufficient credits! Need $${def.cost}`, 'warning');
        return false;
      }

      // Collision check
      const check = canPlaceBuilding(
        activeMission.gridSize,
        activeMission.buildings,
        placementType,
        position
      );
      if (!check.valid) {
        sound.playWarning();
        get().showToast(check.reason || 'Invalid placement', 'warning');
        return false;
      }

      // Deduct credits and add building
      const newBuilding: PlacedBuilding = {
        id: `b_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: placementType,
        position,
        enabled: true,
        builtOnDay: activeMission.day,
        efficiency: 1.0,
      };

      const updatedBuildings = [...activeMission.buildings, newBuilding];
      const nextCredits = activeMission.resources.credits - def.cost;

      // Re-calculate rates immediately
      const rates = calculateLiveRates(updatedBuildings, activeMission.environment);

      const nextResources = {
        ...activeMission.resources,
        credits: nextCredits,
        powerGenerated: rates.powerGenerated,
        powerDemanded: rates.powerDemanded,
        waterDemand: rates.waterDemand,
        waterProduced: rates.waterProduced,
        foodDemand: rates.foodDemand,
        foodProduced: rates.foodProduced,
        oxygenDemand: rates.oxygenDemand,
        oxygenProduced: rates.oxygenProduced,
        batteryCapacity: rates.batteryCapacity > 0 ? rates.batteryCapacity : activeMission.resources.batteryCapacity,
      };

      const nextState: MissionState = {
        ...activeMission,
        buildings: updatedBuildings,
        resources: nextResources,
        activityLogs: [
          {
            id: `log_build_${Date.now()}`,
            day: activeMission.day,
            timestamp: Date.now(),
            type: 'info' as const,
            title: `Constructed: ${def.name}`,
            message: `Deployed at (${position.x}, ${position.y}) for $${def.cost}.`,
            scienceNote: def.whyItMatters,
          },
          ...activeMission.activityLogs,
        ].slice(0, 50),
      };

      sound.playPlaceBuilding();
      saveMissionToStorage(nextState);

      set({
        activeMission: nextState,
        placementType: null, // Reset after placement
        selectedBuilding: newBuilding,
      });

      get().showToast(`Constructed ${def.name}!`, 'success');

      // Tutorial progression
      if (get().tutorialActive && get().tutorialStep === 0) {
        set({ tutorialStep: 1 });
      }

      return true;
    },

    selectBuilding: (building) => {
      sound.playClick();
      set({ selectedBuilding: building, placementType: null });
      if (get().tutorialActive && get().tutorialStep === 1) {
        set({ tutorialStep: 2 });
      }
    },

    toggleBuildingActive: (buildingId) => {
      const state = get().activeMission;
      if (!state) return;

      const target = state.buildings.find((b) => b.id === buildingId);
      if (!target) return;

      const updatedBuildings = state.buildings.map((b) =>
        b.id === buildingId ? { ...b, enabled: !b.enabled } : b
      );

      const rates = calculateLiveRates(updatedBuildings, state.environment);
      const nextState: MissionState = {
        ...state,
        buildings: updatedBuildings,
        resources: {
          ...state.resources,
          powerGenerated: rates.powerGenerated,
          powerDemanded: rates.powerDemanded,
          waterDemand: rates.waterDemand,
          waterProduced: rates.waterProduced,
          foodDemand: rates.foodDemand,
          foodProduced: rates.foodProduced,
          oxygenDemand: rates.oxygenDemand,
          oxygenProduced: rates.oxygenProduced,
        },
      };

      sound.playClick();
      saveMissionToStorage(nextState);
      set({
        activeMission: nextState,
        selectedBuilding: updatedBuildings.find((b) => b.id === buildingId) || null,
      });
    },

    demolishBuilding: (buildingId) => {
      const state = get().activeMission;
      if (!state) return;

      const target = state.buildings.find((b) => b.id === buildingId);
      if (!target) return;

      const def = BUILDING_CATALOG[target.type];
      const refund = Math.floor(def.cost * 0.5); // 50% material salvage

      const updatedBuildings = state.buildings.filter((b) => b.id !== buildingId);
      const rates = calculateLiveRates(updatedBuildings, state.environment);

      const nextState: MissionState = {
        ...state,
        buildings: updatedBuildings,
        resources: {
          ...state.resources,
          credits: state.resources.credits + refund,
          powerGenerated: rates.powerGenerated,
          powerDemanded: rates.powerDemanded,
          waterDemand: rates.waterDemand,
          waterProduced: rates.waterProduced,
          foodDemand: rates.foodDemand,
          foodProduced: rates.foodProduced,
          oxygenDemand: rates.oxygenDemand,
          oxygenProduced: rates.oxygenProduced,
        },
        activityLogs: [
          {
            id: `log_demo_${Date.now()}`,
            day: state.day,
            timestamp: Date.now(),
            type: 'warning' as const,
            title: `Demolished: ${def.name}`,
            message: `Salvaged $${refund} credits in recycled composites.`,
          },
          ...state.activityLogs,
        ].slice(0, 50),
      };

      sound.playClick();
      saveMissionToStorage(nextState);
      set({
        activeMission: nextState,
        selectedBuilding: null,
      });
      get().showToast(`Demolished ${def.name} (+ $${refund} salvage)`, 'info');
    },

    openModal: (modal) => {
      sound.playClick();
      set({
        isScienceLabOpen: modal === 'science',
        isWhatIfOpen: modal === 'whatIf',
        isHistoryOpen: modal === 'history',
        isSettingsOpen: modal === 'settings',
        isReportOpen: modal === 'report',
      });
    },

    closeModals: () => {
      set({
        isScienceLabOpen: false,
        isWhatIfOpen: false,
        isHistoryOpen: false,
        isSettingsOpen: false,
        isReportOpen: false,
      });
    },

    resolveEventChoice: (eventId, choiceId) => {
      get().advanceDay({ eventId, choiceId });
    },

    applyScienceBonus: (experimentId) => {
      const state = get().activeMission;
      if (!state) return;

      const exp = SCIENCE_EXPERIMENTS.find((e) => e.id === experimentId);
      if (!exp) return;

      const result = exp.applyBonusEffect(state);
      sound.playSuccess();

      const nextCompleted = Array.from(new Set([...state.scienceExperimentsCompleted, experimentId]));
      const nextState = {
        ...state,
        scienceExperimentsCompleted: nextCompleted,
        activityLogs: [
          {
            id: `log_sci_${Date.now()}`,
            day: state.day,
            timestamp: Date.now(),
            type: 'science' as const,
            title: `Science Applied: ${exp.title}`,
            message: result.message,
            scienceNote: exp.practicalLesson,
          },
          ...state.activityLogs,
        ].slice(0, 50),
      };

      saveMissionToStorage(nextState);
      set({ activeMission: nextState });
      get().showToast(result.message, 'success');
    },

    applyWhatIfChanges: (newBuildings: PlacedBuilding[]) => {
      const state = get().activeMission;
      if (!state) return;

      const rates = calculateLiveRates(newBuildings, state.environment);
      const nextState: MissionState = {
        ...state,
        buildings: newBuildings,
        resources: {
          ...state.resources,
          powerGenerated: rates.powerGenerated,
          powerDemanded: rates.powerDemanded,
          waterDemand: rates.waterDemand,
          waterProduced: rates.waterProduced,
          foodDemand: rates.foodDemand,
          foodProduced: rates.foodProduced,
          oxygenDemand: rates.oxygenDemand,
          oxygenProduced: rates.oxygenProduced,
        },
        activityLogs: [
          {
            id: `log_whatif_${Date.now()}`,
            day: state.day,
            timestamp: Date.now(),
            type: 'info' as const,
            title: 'What-If Strategy Applied',
            message: 'Outpost configuration updated with tested simulation parameters.',
          },
          ...state.activityLogs,
        ].slice(0, 50),
      };

      sound.playSuccess();
      saveMissionToStorage(nextState);
      set({ activeMission: nextState, isWhatIfOpen: false });
      get().showToast('What-If strategy applied to active outpost!', 'success');
    },

    nextTutorialStep: () => {
      sound.playClick();
      const next = get().tutorialStep + 1;
      if (next >= 5) {
        set({ tutorialActive: false, tutorialStep: 0 });
      } else {
        set({ tutorialStep: next });
      }
    },

    skipTutorial: () => {
      sound.playClick();
      set({ tutorialActive: false, tutorialStep: 0 });
    },

    startTutorial: () => {
      sound.playClick();
      set({ tutorialActive: true, tutorialStep: 0 });
    },

    updateSettings: (newSettings) => {
      const updated = { ...get().settings, ...newSettings };
      sound.setEnabled(updated.soundEnabled);
      sound.setVolume(updated.volume);
      saveSettingsToStorage(updated);
      set({ settings: updated });
    },

    showToast: (message, type = 'info') => {
      set({ toast: { message, type } });
      setTimeout(() => {
        if (get().toast?.message === message) {
          set({ toast: null });
        }
      }, 3500);
    },

    retryMission: () => {
      get().startMission();
    },

    exitToHome: () => {
      sound.playClick();
      set({
        screen: 'home',
        isReportOpen: false,
        placementType: null,
        selectedBuilding: null,
      });
    },
  };
});
