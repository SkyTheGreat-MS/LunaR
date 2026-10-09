/**
 * Pure Simulation Engine
 * Framework-independent deterministic simulation for lunar outpost life support,
 * electrical grid dispatch, environmental conditions, and crew safety.
 */

import { BUILDING_CATALOG } from '../catalog/buildings';
import {
  ActivityLogEntry,
  BuildingType,
  GridPosition,
  MissionDefinition,
  MissionObjective,
  MissionReport,
  MissionState,
  PlacedBuilding,
  Resources,
  ScheduledEvent,
  SimulationResult,
  SimulationSnapshot,
} from '../types';

/**
 * Deep clone a MissionState object to prevent any mutation
 */
export function cloneMissionState(state: MissionState): MissionState {
  return JSON.parse(JSON.stringify(state));
}

/**
 * Collision and boundary check for building placement
 */
export function canPlaceBuilding(
  gridSize: { width: number; height: number },
  existingBuildings: PlacedBuilding[],
  type: BuildingType,
  position: GridPosition,
  ignoreBuildingId?: string
): { valid: boolean; reason?: string } {
  const def = BUILDING_CATALOG[type];
  if (!def) return { valid: false, reason: 'Unknown building type' };

  const { width, height } = def.size;

  // Boundary check
  if (position.x < 0 || position.y < 0) {
    return { valid: false, reason: 'Placement out of grid boundaries (negative coordinate)' };
  }
  if (position.x + width > gridSize.width || position.y + height > gridSize.height) {
    return { valid: false, reason: 'Building extends beyond the outpost perimeter' };
  }

  // Check collision with existing buildings
  for (const b of existingBuildings) {
    if (ignoreBuildingId && b.id === ignoreBuildingId) continue;
    const existingDef = BUILDING_CATALOG[b.type];
    if (!existingDef) continue;

    const bLeft = b.position.x;
    const bRight = b.position.x + existingDef.size.width;
    const bTop = b.position.y;
    const bBottom = b.position.y + existingDef.size.height;

    const newLeft = position.x;
    const newRight = position.x + width;
    const newTop = position.y;
    const newBottom = position.y + height;

    const overlap =
      newLeft < bRight && newRight > bLeft && newTop < bBottom && newBottom > bTop;

    if (overlap) {
      return { valid: false, reason: `Overlaps with existing ${existingDef.name}` };
    }
  }

  return { valid: true };
}

/**
 * Calculate instantaneous rates for UI display and live preview
 */
export function calculateLiveRates(
  buildings: PlacedBuilding[],
  environment: { solarFlux: number; dustStormLevel: number }
) {
  let powerGen = 0;
  let powerDem = 0;
  let waterDem = 0;
  let waterProd = 0;
  let foodDem = 0;
  let foodProd = 0;
  let oxygenDem = 0;
  let oxygenProd = 0;
  let batteryCap = 0;
  let waterCap = 80;
  let foodCap = 80;
  let oxygenCap = 80;
  let radiationShieldScore = 0;

  for (const b of buildings) {
    if (!b.enabled) continue;
    const def = BUILDING_CATALOG[b.type];
    if (!def) continue;

    // Solar generation adjusted by dust and solar flux
    if (def.powerGenerated) {
      const dustLoss = Math.min(0.9, environment.dustStormLevel);
      const effectiveFlux = Math.max(0.1, environment.solarFlux * (1 - dustLoss));
      powerGen += def.powerGenerated * effectiveFlux * (b.efficiency ?? 1.0);
    }

    powerDem += def.powerDemanded || 0;
    waterDem += def.waterDemand || 0;
    waterProd += def.waterProduced || 0;
    foodDem += def.foodDemand || 0;
    foodProd += def.foodProduced || 0;
    oxygenDem += def.oxygenDemand || 0;
    oxygenProd += def.oxygenProduced || 0;

    if (def.batteryCapacity) batteryCap += def.batteryCapacity;
    if (def.waterCapacity) waterCap += def.waterCapacity;
    if (def.foodCapacity) foodCap += def.foodCapacity;
    if (def.oxygenCapacity) oxygenCap += def.oxygenCapacity;
    if (def.radiationProtection) radiationShieldScore += def.radiationProtection;
  }

  return {
    powerGenerated: Math.round(powerGen * 10) / 10,
    powerDemanded: Math.round(powerDem * 10) / 10,
    waterDemand: Math.round(waterDem * 10) / 10,
    waterProduced: Math.round(waterProd * 10) / 10,
    foodDemand: Math.round(foodDem * 10) / 10,
    foodProduced: Math.round(foodProd * 10) / 10,
    oxygenDemand: Math.round(oxygenDem * 10) / 10,
    oxygenProduced: Math.round(oxygenProd * 10) / 10,
    batteryCapacity: batteryCap,
    waterCapacity: waterCap,
    foodCapacity: foodCap,
    oxygenCapacity: oxygenCap,
    radiationShieldScore: Math.min(100, radiationShieldScore),
  };
}

/**
 * Pure 10-step advanceDay engine function
 */
export function advanceDay(
  currentState: MissionState,
  choiceSelection?: { eventId: string; choiceId: string }
): SimulationResult {
  // Step 0: Clone state to guarantee pure, immutable execution
  const state = cloneMissionState(currentState);
  const currentDay = state.day;
  const nextDay = currentDay + 1;
  state.day = nextDay;

  const warnings: string[] = [];
  const scientificExplanations: string[] = [];
  const newLogs: ActivityLogEntry[] = [];

  const addLog = (
    type: ActivityLogEntry['type'],
    title: string,
    message: string,
    scienceNote?: string
  ) => {
    newLogs.push({
      id: `log_${nextDay}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      day: nextDay,
      timestamp: Date.now(),
      type,
      title,
      message,
      scienceNote,
    });
  };

  // STEP 1: Apply scheduled environmental conditions
  // Reset transient dust/flux unless an active event is ongoing
  let solarFlux = state.environment.solarFlux;
  let dustLevel = state.environment.dustStormLevel;
  let radiationLevel = state.environment.radiationLevel;

  // STEP 8 PRE-APPLY: If player chose an event choice for an active pending event
  if (choiceSelection && state.activePendingEvent) {
    const event = state.scheduledEvents.find((e) => e.id === choiceSelection.eventId);
    if (event) {
      const choice = event.choices.find((c) => c.id === choiceSelection.choiceId);
      if (choice) {
        event.isResolved = true;
        event.resolvedChoiceId = choice.id;

        if (choice.creditCost) {
          state.resources.credits = Math.max(0, state.resources.credits - choice.creditCost);
        }
        if (choice.resourceDeltas) {
          if (choice.resourceDeltas.batteryStored !== undefined) {
            state.resources.batteryStored = Math.max(
              0,
              state.resources.batteryStored + choice.resourceDeltas.batteryStored
            );
          }
          if (choice.resourceDeltas.waterStored !== undefined) {
            state.resources.waterStored = Math.max(
              0,
              state.resources.waterStored + choice.resourceDeltas.waterStored
            );
          }
          if (choice.resourceDeltas.foodStored !== undefined) {
            state.resources.foodStored = Math.max(
              0,
              state.resources.foodStored + choice.resourceDeltas.foodStored
            );
          }
          if (choice.resourceDeltas.batteryCapacity !== undefined) {
            state.resources.batteryCapacity = Math.max(
              10,
              state.resources.batteryCapacity + choice.resourceDeltas.batteryCapacity
            );
          }
        }
        if (choice.environmentalModifiers) {
          if (choice.environmentalModifiers.dustStormLevel !== undefined) {
            dustLevel = choice.environmentalModifiers.dustStormLevel;
          }
          if (choice.environmentalModifiers.solarFlux !== undefined) {
            solarFlux = choice.environmentalModifiers.solarFlux;
          }
          if (choice.environmentalModifiers.radiationLevel !== undefined) {
            radiationLevel = choice.environmentalModifiers.radiationLevel;
          }
        }

        addLog(
          'info',
          `Decision Executed: ${choice.title}`,
          choice.explanation,
          event.scientificContext
        );
        state.activePendingEvent = null;
      }
    }
  }

  // Update environmental state
  state.environment.solarFlux = solarFlux;
  state.environment.dustStormLevel = dustLevel;
  state.environment.radiationLevel = radiationLevel;

  // STEP 2 & 3 & 4: Calculate building availability, production and demand
  const rates = calculateLiveRates(state.buildings, state.environment);

  state.resources.powerGenerated = rates.powerGenerated;
  state.resources.powerDemanded = rates.powerDemanded;
  state.resources.waterDemand = rates.waterDemand;
  state.resources.waterProduced = rates.waterProduced;
  state.resources.foodDemand = rates.foodDemand;
  state.resources.foodProduced = rates.foodProduced;
  state.resources.oxygenDemand = rates.oxygenDemand;
  state.resources.oxygenProduced = rates.oxygenProduced;

  // Set capacities based on structures
  if (rates.batteryCapacity > 0) {
    state.resources.batteryCapacity = rates.batteryCapacity;
  }
  state.resources.waterCapacity = rates.waterCapacity;
  state.resources.foodCapacity = rates.foodCapacity;
  state.resources.oxygenCapacity = rates.oxygenCapacity;

  // STEP 5: Apply power dispatch and battery charging/discharging
  const netPower = state.resources.powerGenerated - state.resources.powerDemanded;
  let batteryCharged = 0;
  let batteryDischarged = 0;
  let powerShortage = false;

  if (netPower >= 0) {
    // Surplus: charge battery with 95% charge efficiency
    const chargeEff = 0.95;
    const potentialCharge = netPower * chargeEff;
    const room = state.resources.batteryCapacity - state.resources.batteryStored;
    batteryCharged = Math.min(potentialCharge, Math.max(0, room));
    state.resources.batteryStored = Math.min(
      state.resources.batteryCapacity,
      state.resources.batteryStored + batteryCharged
    );
  } else {
    // Deficit: discharge from battery
    const needed = Math.abs(netPower);
    if (state.resources.batteryStored >= needed) {
      batteryDischarged = needed;
      state.resources.batteryStored -= needed;
    } else {
      // Partial discharge then brownout / shortage
      batteryDischarged = state.resources.batteryStored;
      state.resources.batteryStored = 0;
      powerShortage = true;
      warnings.push('Power grid brownout: electrical demand exceeded available solar and battery capacity.');
      addLog(
        'alert',
        'Power Blackout Warning',
        'Outpost battery depleted! Auxiliary systems, heaters, and scrubbers lost power.',
        'On the Moon, night periods and dust storms eliminate solar generation. Without adequate battery reserves, life support halts.'
      );
    }
  }

  // STEP 6: Update water, food, oxygen inventories
  let waterShortage = false;
  let foodShortage = false;
  let oxygenShortage = false;

  const netWater = state.resources.waterProduced - state.resources.waterDemand;
  const netFood = state.resources.foodProduced - state.resources.foodDemand;
  const netOxygen = state.resources.oxygenProduced - state.resources.oxygenDemand;

  // Water inventory
  const nextWater = state.resources.waterStored + netWater;
  if (nextWater < 0) {
    state.resources.waterStored = 0;
    waterShortage = true;
    warnings.push('Severe water shortage: water reservoir empty!');
    addLog('alert', 'Water Shortage', 'Crew water stores reached zero. Astronauts are rationing moisture.');
  } else {
    state.resources.waterStored = Math.min(state.resources.waterCapacity, nextWater);
  }

  // Food inventory
  const nextFood = state.resources.foodStored + netFood;
  if (nextFood < 0) {
    state.resources.foodStored = 0;
    foodShortage = true;
    warnings.push('Food shortage: emergency rations exhausted!');
    addLog('alert', 'Food Shortage', 'Hydroponic calories insufficient for human metabolic baseline.');
  } else {
    state.resources.foodStored = Math.min(state.resources.foodCapacity, nextFood);
  }

  // Oxygen inventory
  const nextOxygen = state.resources.oxygenStored + netOxygen;
  if (nextOxygen < 0) {
    state.resources.oxygenStored = 0;
    oxygenShortage = true;
    warnings.push('Life Support Alert: Hypoxic atmosphere! Oxygen reserves depleted.');
    addLog('alert', 'Atmospheric Failure', 'Habitat oxygen concentration dropped below breathable threshold!');
  } else {
    state.resources.oxygenStored = Math.min(state.resources.oxygenCapacity, nextOxygen);
  }

  // STEP 7: Evaluate crew safety and shortages
  // Count shortage days
  if (powerShortage) state.crew.shortageDays.power += 1;
  if (waterShortage) state.crew.shortageDays.water += 1;
  if (foodShortage) state.crew.shortageDays.food += 1;
  if (oxygenShortage) state.crew.shortageDays.oxygen += 1;

  // Radiation calculation
  const shieldFraction = rates.radiationShieldScore / 100; // 0 to 1
  const dailyDose = state.environment.radiationLevel * (1 - shieldFraction * 0.85);
  state.crew.radiationDoseMsv += dailyDose;

  // Safety score adjustments
  let safetyPenalty = 0;
  if (powerShortage) safetyPenalty += 14;
  if (oxygenShortage) safetyPenalty += 28;
  if (waterShortage) safetyPenalty += 18;
  if (foodShortage) safetyPenalty += 10;
  if (dailyDose > 2.0) safetyPenalty += 12; // high radiation day penalty

  // Has habitat? If crew has no habitat at all, extreme safety drop
  const hasHabitat = state.buildings.some((b) => b.type === 'habitat' && b.enabled);
  if (!hasHabitat && nextDay > 1) {
    safetyPenalty += 40;
    warnings.push('Crew has no active Habitat module! Astronauts are exposed in lander airlock.');
    addLog('alert', 'No Pressurized Habitat', 'Crew requires an active Habitat module for environmental control.');
  }

  if (safetyPenalty > 0) {
    state.crew.safetyScore = Math.max(0, state.crew.safetyScore - safetyPenalty);
  } else {
    // Gradual recovery if all systems green
    state.crew.safetyScore = Math.min(100, state.crew.safetyScore + 4);
  }

  // Classify crew status
  if (state.crew.safetyScore >= 90) {
    state.crew.safetyStatus = 'Optimal';
  } else if (state.crew.safetyScore >= 75) {
    state.crew.safetyStatus = 'Stable';
  } else if (state.crew.safetyScore >= 45) {
    state.crew.safetyStatus = 'Warning';
  } else {
    state.crew.safetyStatus = 'Critical';
  }

  // Scientific explanations generated based on dynamics
  if (rates.powerGenerated > 0) {
    scientificExplanations.push(
      `Solar arrays generated ${rates.powerGenerated} kW from solar photons. Dust factor: ${(state.environment.dustStormLevel * 100).toFixed(0)}%.`
    );
  }
  if (rates.waterProduced > 0) {
    scientificExplanations.push(
      `Water recyclers recovered ${rates.waterProduced} L of greywater/condensate, reducing Earth resupply dependence.`
    );
  }
  if (dailyDose > 0.5) {
    scientificExplanations.push(
      `Radiation shielding attenuated ${(shieldFraction * 85).toFixed(0)}% of incoming ionizing particles. Daily crew dose: ${dailyDose.toFixed(2)} mSv.`
    );
  }

  // STEP 8: Check for newly scheduled events on this day
  const upcomingEvent = state.scheduledEvents.find(
    (e) => e.day === nextDay && !e.isResolved
  );
  if (upcomingEvent) {
    state.activePendingEvent = upcomingEvent;
    addLog(
      upcomingEvent.severity === 'critical' || upcomingEvent.severity === 'high' ? 'alert' : 'warning',
      `Event Triggered: ${upcomingEvent.title}`,
      upcomingEvent.description,
      upcomingEvent.scientificContext
    );
  }

  // STEP 9: Update objectives and mission status
  let allObjectivesPassed = true;
  for (const obj of state.objectives) {
    if (obj.type === 'survive_days' && obj.targetDay) {
      if (nextDay >= obj.targetDay && state.crew.safetyScore > 0) {
        obj.isCompleted = true;
      }
    } else if (obj.type === 'build_types') {
      if (obj.requiredBuildingType) {
        const count = state.buildings.filter(
          (b) => b.type === obj.requiredBuildingType && b.enabled
        ).length;
        obj.currentCount = count;
        if (count >= (obj.requiredCount || 1)) {
          obj.isCompleted = true;
        }
      } else {
        // e.g. power grid or life support combination
        if (obj.id === 'obj_power_grid') {
          const solarCount = state.buildings.filter((b) => b.type === 'solar_array' && b.enabled).length;
          const batCount = state.buildings.filter((b) => b.type === 'battery_bank' && b.enabled).length;
          obj.currentCount = solarCount + batCount;
          if (solarCount >= 2 && batCount >= 1) obj.isCompleted = true;
        } else if (obj.id === 'obj_life_support') {
          const recCount = state.buildings.filter((b) => b.type === 'water_recycler' && b.enabled).length;
          const ghCount = state.buildings.filter((b) => b.type === 'greenhouse' && b.enabled).length;
          obj.currentCount = recCount + ghCount;
          if (recCount >= 1 && ghCount >= 1) obj.isCompleted = true;
        }
      }
    } else if (obj.type === 'maintain_safety' && obj.requiredSafety) {
      if (state.crew.safetyScore < obj.requiredSafety) {
        // Not necessarily permanent fail until mission end, but marks status
      } else if (nextDay >= state.maxDays) {
        obj.isCompleted = true;
      }
    } else if (obj.type === 'resource_surplus') {
      if (state.resources.batteryStored > 0) {
        obj.isCompleted = true;
      }
    }

    if (!obj.isCompleted) {
      allObjectivesPassed = false;
    }
  }

  // Mission termination criteria
  if (state.crew.safetyScore <= 0) {
    state.isFailed = true;
    state.outcomeReason = 'Mission Failed: Crew life support failure. Astronaut evacuation required.';
    addLog('alert', 'Mission Aborted', state.outcomeReason);
  } else if (nextDay >= state.maxDays) {
    state.isCompleted = true;
    state.outcomeReason = allObjectivesPassed
      ? 'Mission Accomplished! Outpost successfully self-sustained through mission duration.'
      : 'Mission Concluded: Target duration reached. Review debriefing for improvement areas.';
    addLog(allObjectivesPassed ? 'success' : 'info', 'Mission Completed', state.outcomeReason);
  }

  // STEP 10: Record snapshot
  const snapshot: SimulationSnapshot = {
    day: nextDay,
    resources: { ...state.resources },
    crewSafety: state.crew.safetyScore,
    radiationDose: state.crew.radiationDoseMsv,
    netPower: Math.round(netPower * 10) / 10,
    netWater: Math.round(netWater * 10) / 10,
    netFood: Math.round(netFood * 10) / 10,
    netOxygen: Math.round(netOxygen * 10) / 10,
    activeBuildingsCount: state.buildings.filter((b) => b.enabled).length,
    eventsSummary: state.activePendingEvent ? [state.activePendingEvent.title] : [],
  };

  state.snapshots.push(snapshot);
  state.activityLogs = [...newLogs, ...state.activityLogs].slice(0, 50);

  addLog(
    'info',
    `Day ${nextDay} Completed`,
    `Net Power: ${netPower > 0 ? '+' : ''}${netPower.toFixed(1)} kW | Water: ${state.resources.waterStored.toFixed(0)} L | O2: ${state.resources.oxygenStored.toFixed(0)} kg | Safety: ${state.crew.safetyScore}%`
  );

  return {
    nextState: state,
    netPower,
    netWater,
    netFood,
    netOxygen,
    batteryCharged,
    batteryDischarged,
    shortages: {
      power: powerShortage,
      water: waterShortage,
      food: foodShortage,
      oxygen: oxygenShortage,
    },
    warnings,
    scientificExplanations,
  };
}

/**
 * Creates initial mission state from MissionDefinition
 */
export function createInitialMissionState(def: MissionDefinition): MissionState {
  const initialResources: Resources = {
    credits: def.initialCredits,
    powerGenerated: def.initialResources.powerGenerated ?? 0,
    powerDemanded: def.initialResources.powerDemanded ?? 0,
    batteryStored: def.initialResources.batteryStored ?? 60,
    batteryCapacity: def.initialResources.batteryCapacity ?? 80,
    waterStored: def.initialResources.waterStored ?? 80,
    waterCapacity: def.initialResources.waterCapacity ?? 100,
    waterDemand: def.initialResources.waterDemand ?? 0,
    waterProduced: def.initialResources.waterProduced ?? 0,
    foodStored: def.initialResources.foodStored ?? 80,
    foodCapacity: def.initialResources.foodCapacity ?? 100,
    foodDemand: def.initialResources.foodDemand ?? 0,
    foodProduced: def.initialResources.foodProduced ?? 0,
    oxygenStored: def.initialResources.oxygenStored ?? 90,
    oxygenCapacity: def.initialResources.oxygenCapacity ?? 100,
    oxygenDemand: def.initialResources.oxygenDemand ?? 0,
    oxygenProduced: def.initialResources.oxygenProduced ?? 0,
  };

  const environment = {
    solarFlux: 1.0,
    temperatureC: -20,
    dustStormLevel: 0,
    radiationLevel: 0.7, // background mSv/day on lunar surface
    isDaytime: true,
    activeEvents: [],
  };

  const rates = calculateLiveRates(def.initialBuildings, environment);
  initialResources.powerGenerated = rates.powerGenerated;
  initialResources.powerDemanded = rates.powerDemanded;
  initialResources.waterDemand = rates.waterDemand;
  initialResources.waterProduced = rates.waterProduced;
  initialResources.foodDemand = rates.foodDemand;
  initialResources.foodProduced = rates.foodProduced;
  initialResources.oxygenDemand = rates.oxygenDemand;
  initialResources.oxygenProduced = rates.oxygenProduced;
  if (rates.batteryCapacity > 0) initialResources.batteryCapacity = rates.batteryCapacity;

  const initialSnapshot: SimulationSnapshot = {
    day: 0,
    resources: { ...initialResources },
    crewSafety: 100,
    radiationDose: 0,
    netPower: rates.powerGenerated - rates.powerDemanded,
    netWater: rates.waterProduced - rates.waterDemand,
    netFood: rates.foodProduced - rates.foodDemand,
    netOxygen: rates.oxygenProduced - rates.oxygenDemand,
    activeBuildingsCount: def.initialBuildings.filter((b) => b.enabled).length,
    eventsSummary: [],
  };

  return {
    missionId: def.id,
    mode: def.mode,
    day: 0,
    maxDays: def.durationDays,
    gridSize: def.gridSize,
    buildings: JSON.parse(JSON.stringify(def.initialBuildings)),
    resources: initialResources,
    crew: {
      count: def.crewCount,
      members: [
        { id: 'c1', name: 'Dr. Sarah Lin', role: 'Commander', avatar: '👩‍🚀' },
        { id: 'c2', name: 'Marcus Vance', role: 'Life Support Engineer', avatar: '👨‍🚀' },
        { id: 'c3', name: 'Dr. Maya Patel', role: 'Botanist', avatar: '👩‍🔬' },
        { id: 'c4', name: 'Kenji Sato', role: 'Power Systems Specialist', avatar: '👨‍💻' },
      ],
      safetyScore: 100,
      safetyStatus: 'Optimal',
      radiationDoseMsv: 0,
      morale: 100,
      shortageDays: { power: 0, water: 0, food: 0, oxygen: 0 },
    },
    environment,
    objectives: JSON.parse(JSON.stringify(def.objectives)),
    scheduledEvents: JSON.parse(JSON.stringify(def.scheduledEvents)),
    activePendingEvent: null,
    snapshots: [initialSnapshot],
    activityLogs: [
      {
        id: 'log_init',
        day: 0,
        timestamp: Date.now(),
        type: 'info',
        title: 'Mission Initialized',
        message: `${def.title} has begun. Review objectives and verify electrical generation before sundown.`,
      },
    ],
    isCompleted: false,
    isFailed: false,
    scienceExperimentsCompleted: [],
  };
}

/**
 * Generate comprehensive MissionReport
 */
export function generateMissionReport(state: MissionState, missionDef: MissionDefinition): MissionReport {
  const completedObjs = state.objectives.filter((o) => o.isCompleted).length;
  const totalObjs = state.objectives.length;
  const isVictory = !state.isFailed && state.crew.safetyScore > 0 && completedObjs >= Math.ceil(totalObjs * 0.7);

  const strongDecisions: string[] = [];
  const improvementAreas: string[] = [];

  // Evaluate decisions
  const solarCount = state.buildings.filter((b) => b.type === 'solar_array').length;
  const batCount = state.buildings.filter((b) => b.type === 'battery_bank').length;
  const recCount = state.buildings.filter((b) => b.type === 'water_recycler').length;
  const shieldCount = state.buildings.filter((b) => b.type === 'radiation_shielding').length;

  if (solarCount >= 2 && batCount >= 1) {
    strongDecisions.push('Solid electrical baseline: Sufficient solar collection paired with buffer batteries.');
  } else {
    improvementAreas.push('Vulnerable electrical grid: Insufficient battery buffering led to blackout risk.');
  }

  if (recCount >= 1) {
    strongDecisions.push('Effective closed-loop recycling: Reclaimed precious humidity and hygiene water.');
  } else {
    improvementAreas.push('High open-loop water drain: Without water recyclers, lunar ice stores drain rapidly.');
  }

  if (shieldCount >= 1) {
    strongDecisions.push('Proactive radiation protection: Sintered regolith shielding minimized cosmic particle doses.');
  } else if (state.crew.radiationDoseMsv > 15) {
    improvementAreas.push('High radiation accumulation: Crew accumulated elevated millisievert doses without shielding.');
  }

  if (state.crew.shortageDays.oxygen === 0) {
    strongDecisions.push('Unbroken atmospheric life support: Zero hypoxic events recorded.');
  } else {
    improvementAreas.push(`Oxygen shortages: Life support lost oxygen supply on ${state.crew.shortageDays.oxygen} day(s).`);
  }

  return {
    missionId: state.missionId,
    missionTitle: missionDef.title,
    mode: state.mode,
    success: isVictory,
    daysCompleted: state.day,
    totalDays: state.maxDays,
    outcomeTitle: isVictory ? 'Mission Accomplished! 🌟' : 'Mission Concluded with Warnings ⚠️',
    outcomeSummary: state.outcomeReason || (isVictory ? 'The outpost maintained stable life support and met expedition goals.' : 'The expedition encountered critical shortages and requires strategic reassessment.'),
    objectivesAchieved: completedObjs,
    totalObjectives: totalObjs,
    finalCrewSafety: state.crew.safetyScore,
    finalCreditsRemaining: state.resources.credits,
    snapshots: state.snapshots,
    strongDecisions,
    improvementAreas,
    keyScienceLessons: [
      'Energy balance on the Moon requires storing daylight surplus for dark periods and dust-scattering events.',
      'Water is the heaviest and most expensive consumable to transport; closed-loop recovery is essential for permanent habitation.',
      'Sintered regolith offers a dual benefit: abundant local building material and effective ionizing radiation shielding.',
    ],
  };
}
