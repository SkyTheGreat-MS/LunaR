/**
 * Unit & Integration Tests for Junior Astronaut Mission Trainer Simulation Engine
 */

import { describe, expect, it } from 'vitest';
import { BUILDING_CATALOG } from '../game/catalog/buildings';
import { MISSIONS } from '../game/catalog/missions';
import {
  advanceDay,
  calculateLiveRates,
  canPlaceBuilding,
  cloneMissionState,
  createInitialMissionState,
} from '../game/simulation/engine';
import { PlacedBuilding } from '../game/types';
import {
  clearSavedMission,
  loadMissionFromStorage,
  saveMissionToStorage,
} from '../persistence/storage';

describe('Junior Astronaut Simulation Engine Tests', () => {
  it('correctly validates boundary and footprint collisions', () => {
    const gridSize = { width: 10, height: 10 };
    const buildings: PlacedBuilding[] = [
      { id: 'b1', type: 'habitat', position: { x: 2, y: 2 }, enabled: true, builtOnDay: 0 },
    ];

    // Habitat is 2x2, occupies (2,2), (3,2), (2,3), (3,3)

    // Valid placement outside
    const validCheck = canPlaceBuilding(gridSize, buildings, 'solar_array', { x: 5, y: 5 });
    expect(validCheck.valid).toBe(true);

    // Collision with habitat corner
    const collideCheck = canPlaceBuilding(gridSize, buildings, 'battery_bank', { x: 2, y: 2 });
    expect(collideCheck.valid).toBe(false);
    expect(collideCheck.reason).toContain('Overlaps');

    // Partial overlap with habitat (at x:3, y:3)
    const partialOverlap = canPlaceBuilding(gridSize, buildings, 'battery_bank', { x: 3, y: 3 });
    expect(partialOverlap.valid).toBe(false);

    // Out of bounds check: beyond grid
    const outBoundsX = canPlaceBuilding(gridSize, buildings, 'habitat', { x: 9, y: 0 }); // 9+2=11 > 10
    expect(outBoundsX.valid).toBe(false);
    expect(outBoundsX.reason).toContain('perimeter');

    // Negative coordinate
    const negativeCoord = canPlaceBuilding(gridSize, buildings, 'solar_array', { x: -1, y: 0 });
    expect(negativeCoord.valid).toBe(false);
  });

  it('calculates instantaneous rates based on enabled structures', () => {
    const buildings: PlacedBuilding[] = [
      { id: 'b1', type: 'solar_array', position: { x: 0, y: 0 }, enabled: true, builtOnDay: 0 },
      { id: 'b2', type: 'habitat', position: { x: 2, y: 0 }, enabled: true, builtOnDay: 0 },
      { id: 'b3', type: 'research_rover', position: { x: 5, y: 0 }, enabled: false, builtOnDay: 0 }, // disabled
    ];

    const rates = calculateLiveRates(buildings, { solarFlux: 1.0, dustStormLevel: 0 });

    // Solar array: +25 kW
    expect(rates.powerGenerated).toBe(25);
    // Habitat: -12 kW; Rover: -5 kW (disabled -> 0)
    expect(rates.powerDemanded).toBe(12);
    // Habitat demands: 8 water, 8 food, 8 O2
    expect(rates.waterDemand).toBe(8);
    expect(rates.foodDemand).toBe(8);
    expect(rates.oxygenDemand).toBe(8);
  });

  it('charges battery on power surplus and discharges on deficit with limits', () => {
    const def = MISSIONS[0];
    const initial = createInitialMissionState(def);

    // Add 2 solar arrays (50 kW) and 1 battery bank (80 kWh capacity) and 1 habitat (12 kW)
    initial.buildings = [
      { id: 's1', type: 'solar_array', position: { x: 0, y: 0 }, enabled: true, builtOnDay: 0 },
      { id: 's2', type: 'solar_array', position: { x: 2, y: 0 }, enabled: true, builtOnDay: 0 },
      { id: 'bat', type: 'battery_bank', position: { x: 4, y: 0 }, enabled: true, builtOnDay: 0 },
      { id: 'hab', type: 'habitat', position: { x: 0, y: 2 }, enabled: true, builtOnDay: 0 },
    ];
    initial.resources.batteryStored = 10;
    initial.resources.batteryCapacity = 80;

    // Advance 1 day with surplus
    const resultSurplus = advanceDay(initial);
    expect(resultSurplus.netPower).toBeGreaterThan(0);
    expect(resultSurplus.batteryCharged).toBeGreaterThan(0);
    expect(resultSurplus.nextState.resources.batteryStored).toBeGreaterThan(10);
    expect(resultSurplus.shortages.power).toBe(false);

    // Now test deficit: disable solar arrays
    const deficitState = cloneMissionState(resultSurplus.nextState);
    deficitState.buildings.forEach((b) => {
      if (b.type === 'solar_array') b.enabled = false;
    });

    const resultDeficit = advanceDay(deficitState);
    expect(resultDeficit.netPower).toBeLessThan(0);
    expect(resultDeficit.batteryDischarged).toBeGreaterThan(0);
    expect(resultDeficit.nextState.resources.batteryStored).toBeLessThan(
      deficitState.resources.batteryStored
    );
  });

  it('records water, food, and oxygen shortages when demands exceed supplies', () => {
    const def = MISSIONS[0];
    const state = createInitialMissionState(def);

    state.buildings = [
      { id: 'hab', type: 'habitat', position: { x: 0, y: 0 }, enabled: true, builtOnDay: 0 },
    ];
    // Drain resources to near 0
    state.resources.waterStored = 1;
    state.resources.foodStored = 1;
    state.resources.oxygenStored = 1;

    const result = advanceDay(state);

    expect(result.shortages.water).toBe(true);
    expect(result.shortages.food).toBe(true);
    expect(result.shortages.oxygen).toBe(true);
    expect(result.nextState.resources.waterStored).toBe(0);
    expect(result.nextState.resources.foodStored).toBe(0);
    expect(result.nextState.resources.oxygenStored).toBe(0);
    // Crew safety should drop due to triple shortages
    expect(result.nextState.crew.safetyScore).toBeLessThan(100);
  });

  it('ensures deterministic simulation replay across identical actions', () => {
    const def = MISSIONS[0];
    const stateA = createInitialMissionState(def);
    const stateB = createInitialMissionState(def);

    stateA.buildings = [
      { id: 's1', type: 'solar_array', position: { x: 0, y: 0 }, enabled: true, builtOnDay: 0 },
      { id: 'h1', type: 'habitat', position: { x: 2, y: 0 }, enabled: true, builtOnDay: 0 },
    ];
    stateB.buildings = [
      { id: 's1', type: 'solar_array', position: { x: 0, y: 0 }, enabled: true, builtOnDay: 0 },
      { id: 'h1', type: 'habitat', position: { x: 2, y: 0 }, enabled: true, builtOnDay: 0 },
    ];

    let currA = stateA;
    let currB = stateB;

    for (let day = 0; day < 5; day++) {
      const resA = advanceDay(currA);
      const resB = advanceDay(currB);
      currA = resA.nextState;
      currB = resB.nextState;

      expect(currA.resources.batteryStored).toEqual(currB.resources.batteryStored);
      expect(currA.resources.waterStored).toEqual(currB.resources.waterStored);
      expect(currA.resources.foodStored).toEqual(currB.resources.foodStored);
      expect(currA.resources.oxygenStored).toEqual(currB.resources.oxygenStored);
      expect(currA.crew.safetyScore).toEqual(currB.crew.safetyScore);
    }
  });

  it('guarantees What If? simulations do not mutate the original mission state', () => {
    const def = MISSIONS[0];
    const originalMission = createInitialMissionState(def);
    originalMission.buildings = [
      { id: 'hab', type: 'habitat', position: { x: 0, y: 0 }, enabled: true, builtOnDay: 0 },
    ];
    const initialBattery = originalMission.resources.batteryStored;

    // Simulate What-If sandbox on isolated clone
    const sandbox = cloneMissionState(originalMission);
    sandbox.buildings.push({
      id: 'bat_sandbox',
      type: 'battery_bank',
      position: { x: 4, y: 4 },
      enabled: true,
      builtOnDay: 1,
    });

    const sandboxResult = advanceDay(sandbox);

    // Verify original mission is completely untouched
    expect(originalMission.day).toBe(0);
    expect(originalMission.buildings.length).toBe(1);
    expect(originalMission.resources.batteryStored).toBe(initialBattery);

    // Verify sandbox progressed independently
    expect(sandboxResult.nextState.day).toBe(1);
    expect(sandboxResult.nextState.buildings.length).toBe(2);
  });

  it('persists and recovers mission state with local storage validation', () => {
    const def = MISSIONS[0];
    const state = createInitialMissionState(def);
    state.day = 4;
    state.crew.safetyScore = 88;

    const savedSuccess = saveMissionToStorage(state);
    expect(savedSuccess).toBe(true);

    const loadedState = loadMissionFromStorage();
    expect(loadedState).not.toBeNull();
    expect(loadedState?.day).toBe(4);
    expect(loadedState?.crew.safetyScore).toBe(88);
    expect(loadedState?.missionId).toBe(def.id);

    clearSavedMission();
    const afterClear = loadMissionFromStorage();
    expect(afterClear).toBeNull();
  });
});
