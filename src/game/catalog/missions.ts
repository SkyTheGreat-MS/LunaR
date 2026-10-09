/**
 * Mission Catalog
 * Definitions for Build Your Outpost mode and 3 Survive Your Mission scenarios
 */

import { MissionDefinition, PlacedBuilding } from '../types';

export const MISSIONS: MissionDefinition[] = [
  {
    id: 'build_artemis_alpha',
    mode: 'build',
    title: 'Artemis Base Alpha',
    subtitle: 'Shackleton Crater Rim Construction',
    briefing:
      'Construct a self-sustaining outpost at Shackleton Crater. Deploy solar arrays, batteries, and life support to keep your 4-astronaut crew safe through 14 Sol days.',
    learningFocus: [
      'Solar angle & battery storage balance',
      'Crew life support consumption (O2, H2O, food)',
      'Closed-loop water recycling efficiency',
    ],
    durationDays: 14,
    initialCredits: 1450,
    initialResources: {
      credits: 1450,
      powerGenerated: 0,
      powerDemanded: 0,
      batteryStored: 60,
      batteryCapacity: 80,
      waterStored: 85,
      waterCapacity: 100,
      waterDemand: 0,
      waterProduced: 0,
      foodStored: 80,
      foodCapacity: 100,
      foodDemand: 0,
      foodProduced: 0,
      oxygenStored: 90,
      oxygenCapacity: 100,
      oxygenDemand: 0,
      oxygenProduced: 0,
    },
    initialBuildings: [],
    gridSize: { width: 10, height: 10 },
    crewCount: 4,
    difficulty: 'Beginner',
    objectives: [
      {
        id: 'obj_power_grid',
        title: 'Establish Stable Power Grid',
        description: 'Construct at least 2 Solar Arrays and 1 Battery Bank to prevent blackout.',
        type: 'build_types',
        requiredCount: 3,
        currentCount: 0,
        isCompleted: false,
        isFailed: false,
      },
      {
        id: 'obj_habitat',
        title: 'Deploy Pressurized Crew Habitat',
        description: 'Construct a Crew Habitat Module before Day 3 to house the astronaut expedition.',
        type: 'build_types',
        requiredBuildingType: 'habitat',
        requiredCount: 1,
        currentCount: 0,
        isCompleted: false,
        isFailed: false,
      },
      {
        id: 'obj_life_support',
        title: 'Closed-Loop Food & Water Recycling',
        description: 'Build a Water Recycler and a Hydroponic Greenhouse to establish self-replenishing life support.',
        type: 'build_types',
        requiredCount: 2,
        currentCount: 0,
        isCompleted: false,
        isFailed: false,
      },
      {
        id: 'obj_survive_duration',
        title: 'Complete 14 Mission Days',
        description: 'Maintain base operations and astronaut safety through Day 14.',
        type: 'survive_days',
        targetDay: 14,
        isCompleted: false,
        isFailed: false,
      },
      {
        id: 'obj_crew_safety',
        title: 'Maintain Crew Safety Above 75%',
        description: 'Keep life support systems stable so crew safety never drops below 75%.',
        type: 'maintain_safety',
        requiredSafety: 75,
        isCompleted: false,
        isFailed: false,
      },
    ],
    scheduledEvents: [
      {
        id: 'evt_day4_micrometeorite',
        day: 4,
        title: 'Micrometeorite Shower Alert',
        severity: 'medium',
        description:
          'Deep radar monitors detect a swarm of high-velocity lunar micrometeorites passing across our sector.',
        scientificContext:
          'Because the Moon lacks an atmosphere to burn up incoming debris, even millimeter-sized particles travel at 20–70 km/s and can puncture unshielded modules or pit photovoltaic glass.',
        affectedSystems: ['Power Grid', 'Solar Arrays'],
        choices: [
          {
            id: 'shield_deflect',
            title: 'Deploy Automated Whipple Shields ($100)',
            description: 'Activate retractable Kevlar/ceramic blankets over arrays during the peak crossing.',
            creditCost: 100,
            explanation:
              'Sacrifices credits but protects solar panel efficiency completely with zero loss of power.',
          },
          {
            id: 'brace_impact',
            title: 'Maintain Full Exposure',
            description: 'Keep arrays online and take the gamble on surface pitting.',
            environmentalModifiers: { dustStormLevel: 0.25 },
            explanation:
              'Saves money, but micrometeorite pitting and dust ejection reduces solar panel output by 25% for 2 days.',
          },
        ],
        isResolved: false,
      },
      {
        id: 'evt_day8_ice_discovery',
        day: 8,
        title: 'Volatiles & Ice Detection in Shadowed Crater',
        severity: 'low',
        description:
          'Thermal neutron spectrometer telemetry confirms a pocket of accessible water-ice within a nearby crater shadow.',
        scientificContext:
          'Temperatures inside permanently shadowed regions (PSRs) plunge to 40 Kelvin (-233°C), cold-trapping water molecules for billions of years.',
        affectedSystems: ['Water Reserves'],
        choices: [
          {
            id: 'sample_ice',
            title: 'Dispatch Extraction Sortie (Cost 15 kWh Power)',
            description: 'Draw emergency battery power to drill and melt an ice core sample.',
            resourceDeltas: { waterStored: 25 },
            explanation:
              'Gains +25 units of pure purified water directly into the habitat reservoir.',
          },
          {
            id: 'catalog_only',
            title: 'Log Coordinates for Future Missions',
            description: 'Preserve immediate base energy reserves and continue standard routine.',
            explanation:
              'No energy spent, but misses out on vital water replenishment.',
          },
        ],
        isResolved: false,
      },
    ],
  },

  {
    id: 'survive_dust_storm',
    mode: 'survive',
    title: 'Power Under Pressure',
    subtitle: 'Electrostatic Dust Storm',
    briefing:
      'An electrostatic regolith dust storm cuts solar irradiance by 65% for 4 days. Manage power triage, shed non-essential loads, and survive battery depletion.',
    learningFocus: [
      'Power load-shedding and life support triage',
      'Battery depth-of-discharge management',
    ],
    durationDays: 8,
    initialCredits: 520,
    initialResources: {
      credits: 520,
      powerGenerated: 50,
      powerDemanded: 36,
      batteryStored: 80,
      batteryCapacity: 160,
      waterStored: 70,
      waterCapacity: 100,
      waterDemand: 14,
      waterProduced: 10,
      foodStored: 65,
      foodCapacity: 100,
      foodDemand: 8,
      foodProduced: 12,
      oxygenStored: 80,
      oxygenCapacity: 100,
      oxygenDemand: 8,
      oxygenProduced: 6,
    },
    initialBuildings: [
      { id: 'b_hab_1', type: 'habitat', position: { x: 3, y: 3 }, enabled: true, builtOnDay: 0 },
      { id: 'b_sol_1', type: 'solar_array', position: { x: 1, y: 1 }, enabled: true, builtOnDay: 0 },
      { id: 'b_sol_2', type: 'solar_array', position: { x: 1, y: 3 }, enabled: true, builtOnDay: 0 },
      { id: 'b_bat_1', type: 'battery_bank', position: { x: 2, y: 5 }, enabled: true, builtOnDay: 0 },
      { id: 'b_bat_2', type: 'battery_bank', position: { x: 3, y: 5 }, enabled: true, builtOnDay: 0 },
      { id: 'b_rec_1', type: 'water_recycler', position: { x: 5, y: 3 }, enabled: true, builtOnDay: 0 },
      { id: 'b_gh_1', type: 'greenhouse', position: { x: 5, y: 5 }, enabled: true, builtOnDay: 0 },
      { id: 'b_rov_1', type: 'research_rover', position: { x: 7, y: 3 }, enabled: true, builtOnDay: 0 },
    ],
    gridSize: { width: 10, height: 10 },
    crewCount: 4,
    difficulty: 'Intermediate',
    objectives: [
      {
        id: 'obj_survive_storm_days',
        title: 'Endure the 8-Day Dust Crisis',
        description: 'Survive through Day 8 without life support collapse.',
        type: 'survive_days',
        targetDay: 8,
        isCompleted: false,
        isFailed: false,
      },
      {
        id: 'obj_storm_safety',
        title: 'Keep Crew Safety Above 70%',
        description: 'Ensure critical habitat life support stays energized throughout blackout threats.',
        type: 'maintain_safety',
        requiredSafety: 70,
        isCompleted: false,
        isFailed: false,
      },
      {
        id: 'obj_preserve_battery',
        title: 'Prevent Complete Grid Blackout',
        description: 'Do not allow battery reserves to drop to zero during the peak dust period.',
        type: 'resource_surplus',
        isCompleted: false,
        isFailed: false,
      },
    ],
    scheduledEvents: [
      {
        id: 'evt_storm_arrival',
        day: 3,
        title: 'Dust Cloud Arrival: Terminator Horizon Darkens',
        severity: 'high',
        description:
          'The front of electrostatically suspended regolith has reached the outpost. Solar irradiance drops by 65%.',
        scientificContext:
          'Lunar dust particles are razor-sharp (no wind erosion) and acquire positive charges from solar UV rays, causing them to hover several meters above the ground and cling electrostatically to glass.',
        affectedSystems: ['Photovoltaic Solar Arrays'],
        choices: [
          {
            id: 'clean_electrodynamic',
            title: 'Energize Electrodynamic Dust Shields ($120)',
            description: 'Apply alternating electric fields to repel dust off panels.',
            creditCost: 120,
            environmentalModifiers: { dustStormLevel: 0.3 },
            explanation:
              'Reduces dust blockage significantly, saving 50% of the lost solar generation.',
          },
          {
            id: 'load_shed',
            title: 'Emergency Power Rationing (Load-Shedding)',
            description: 'Accept the 65% loss; disable non-essential research rovers and rely on batteries.',
            environmentalModifiers: { dustStormLevel: 0.65 },
            explanation:
              'Saves your credits, but requires strict shutdown of non-essential consumers to protect the Habitat.',
          },
        ],
        isResolved: false,
      },
      {
        id: 'evt_storm_battery_spike',
        day: 5,
        title: 'Thermal Contraction Stress in Cell Bank 1',
        severity: 'medium',
        description:
          'Sudden temperature drops in the shaded dust cloud have chilled battery modules to -80°C.',
        scientificContext:
          'Chemical reactions inside lithium batteries slow drastically below -20°C, increasing internal impedance and reducing usable energy capacity.',
        affectedSystems: ['Battery Bank Storage'],
        choices: [
          {
            id: 'heaters_on',
            title: 'Reroute 10 kWh to Internal Resistance Heaters',
            description: 'Warm the electrolyte to preserve cell health.',
            resourceDeltas: { batteryStored: -10 },
            explanation:
              'Spends immediate energy, but prevents permanent cell degradation.',
          },
          {
            id: 'conserve_power',
            title: 'Allow Cells to Run Cold',
            description: 'Avoid spending emergency stored watt-hours right now.',
            resourceDeltas: { batteryCapacity: -25 },
            explanation:
              'Loses 25 units of total battery capacity permanently as cold anodes suffer lithium plating.',
          },
        ],
        isResolved: false,
      },
    ],
  },

  {
    id: 'survive_water_crisis',
    mode: 'survive',
    title: 'Water Budget Crisis',
    subtitle: 'Subsurface Condensate Line Fracture',
    briefing:
      'A feed pipe ruptured with only 35 units of water remaining. Optimize water recycling and balance greenhouse irrigation until replacement parts arrive in 7 days.',
    learningFocus: [
      'Closed-loop hydration balance & rationing',
      'Vapor distillation recovery trade-offs',
    ],
    durationDays: 7,
    initialCredits: 420,
    initialResources: {
      credits: 420,
      powerGenerated: 50,
      powerDemanded: 30,
      batteryStored: 90,
      batteryCapacity: 100,
      waterStored: 35,
      waterCapacity: 90,
      waterDemand: 14,
      waterProduced: 8,
      foodStored: 85,
      foodCapacity: 100,
      foodDemand: 8,
      foodProduced: 12,
      oxygenStored: 90,
      oxygenCapacity: 100,
      oxygenDemand: 8,
      oxygenProduced: 6,
    },
    initialBuildings: [
      { id: 'w_hab', type: 'habitat', position: { x: 3, y: 3 }, enabled: true, builtOnDay: 0 },
      { id: 'w_sol1', type: 'solar_array', position: { x: 1, y: 1 }, enabled: true, builtOnDay: 0 },
      { id: 'w_sol2', type: 'solar_array', position: { x: 1, y: 3 }, enabled: true, builtOnDay: 0 },
      { id: 'w_bat', type: 'battery_bank', position: { x: 1, y: 5 }, enabled: true, builtOnDay: 0 },
      { id: 'w_gh', type: 'greenhouse', position: { x: 5, y: 3 }, enabled: true, builtOnDay: 0 },
      { id: 'w_rec', type: 'water_recycler', position: { x: 3, y: 5 }, enabled: true, builtOnDay: 0 },
    ],
    gridSize: { width: 10, height: 10 },
    crewCount: 4,
    difficulty: 'Intermediate',
    objectives: [
      {
        id: 'obj_water_survive',
        title: 'Survive Until Pipe Fabrication (Day 7)',
        description: 'Keep water stores above zero through Day 7.',
        type: 'survive_days',
        targetDay: 7,
        isCompleted: false,
        isFailed: false,
      },
      {
        id: 'obj_no_dehydration',
        title: 'Avert Crew Dehydration Shock',
        description: 'Maintain human hydration so safety remains above 75%.',
        type: 'maintain_safety',
        requiredSafety: 75,
        isCompleted: false,
        isFailed: false,
      },
      {
        id: 'obj_upgrade_recycling',
        title: 'Deploy Redundant Recycler',
        description: 'Construct a second Water Recycler to reach 90%+ water self-sufficiency.',
        type: 'build_types',
        requiredBuildingType: 'water_recycler',
        requiredCount: 2,
        currentCount: 1,
        isCompleted: false,
        isFailed: false,
      },
    ],
    scheduledEvents: [
      {
        id: 'evt_gh_water_rationing',
        day: 2,
        title: 'Agricultural Irrigation Choice',
        severity: 'high',
        description:
          'The Greenhouse consumes 6 units of water per day for root misting. At current depletion rates, habitat drinking water will run out before Day 5.',
        scientificContext:
          'Plants transpire 95% of absorbed water back into the air. In closed greenhouses, condensing dehumidifiers can catch this moisture, but doing so requires electrical energy.',
        affectedSystems: ['Hydroponic Greenhouse', 'Crew Hydration'],
        choices: [
          {
            id: 'ration_crops',
            title: 'Dormancy Mode: Cut Greenhouse Water by 60%',
            description: 'Reduces greenhouse water demand to 2 units, but food output drops by 50%.',
            explanation:
              'Conserves critical water for the crew, accepting a modest reduction in fresh caloric harvest.',
          },
          {
            id: 'sacrificial_desal',
            title: 'Emergency Membrane Osmosis Flush ($110)',
            description: 'Spend funds to extract moisture from lunar soil chemical bound water.',
            creditCost: 110,
            resourceDeltas: { waterStored: 18 },
            explanation:
              'Immediate injection of +18 water into habitat tanks without halting crop growth.',
          },
        ],
        isResolved: false,
      },
      {
        id: 'evt_filter_clog',
        day: 4,
        title: 'Recycler Nanofiltration Biofilm Clog',
        severity: 'medium',
        description:
          'Recycled greywater particulate has saturated the catalytic filter membrane.',
        scientificContext:
          'Closed-loop water filters collect microbial organic matter and mineral scale that progressively lower flow rates unless backwashed.',
        affectedSystems: ['Water Recycler'],
        choices: [
          {
            id: 'acid_backwash',
            title: 'Chemical Backwash Cycle ($60)',
            description: 'Flushes membranes with citric acid to restore 100% recycling efficiency.',
            creditCost: 60,
            explanation:
              'Recycler efficiency remains top-tier with zero water losses.',
          },
          {
            id: 'throttle_recycler',
            title: 'Throttle Flow Rate',
            description: 'Allow flow rate to drop by 30% without spending credits.',
            resourceDeltas: { waterStored: -8 },
            explanation:
              'Saves money, but the base loses 8 units of potential reclaimed water.',
          },
        ],
        isResolved: false,
      },
    ],
  },

  {
    id: 'survive_solar_storm',
    mode: 'survive',
    title: 'Prepare for a Solar Storm',
    subtitle: 'Coronal Mass Ejection Event',
    briefing:
      'An X-class solar flare will bombard the Moon with high-energy protons in 3 days. Construct thick regolith shielding and manage power reserves to safeguard the crew.',
    learningFocus: [
      'Solar Particle Events (SPE) vs cosmic rays',
      'Regolith mass shielding (areal density)',
    ],
    durationDays: 7,
    initialCredits: 650,
    initialResources: {
      credits: 650,
      powerGenerated: 50,
      powerDemanded: 24,
      batteryStored: 75,
      batteryCapacity: 100,
      waterStored: 80,
      waterCapacity: 100,
      waterDemand: 10,
      waterProduced: 8,
      foodStored: 80,
      foodCapacity: 100,
      foodDemand: 8,
      foodProduced: 12,
      oxygenStored: 85,
      oxygenCapacity: 100,
      oxygenDemand: 8,
      oxygenProduced: 6,
    },
    initialBuildings: [
      { id: 's_hab', type: 'habitat', position: { x: 3, y: 3 }, enabled: true, builtOnDay: 0 },
      { id: 's_sol1', type: 'solar_array', position: { x: 1, y: 1 }, enabled: true, builtOnDay: 0 },
      { id: 's_sol2', type: 'solar_array', position: { x: 1, y: 3 }, enabled: true, builtOnDay: 0 },
      { id: 's_bat', type: 'battery_bank', position: { x: 1, y: 5 }, enabled: true, builtOnDay: 0 },
      { id: 's_gh', type: 'greenhouse', position: { x: 5, y: 3 }, enabled: true, builtOnDay: 0 },
      { id: 's_rec', type: 'water_recycler', position: { x: 5, y: 5 }, enabled: true, builtOnDay: 0 },
    ],
    gridSize: { width: 10, height: 10 },
    crewCount: 4,
    difficulty: 'Advanced',
    objectives: [
      {
        id: 'obj_cme_shield',
        title: 'Erect Radiation Shield Bulwarks',
        description: 'Construct at least 2 Sintered Regolith Shield Bulwarks to achieve >= 70% radiation attenuation.',
        type: 'build_types',
        requiredBuildingType: 'radiation_shielding',
        requiredCount: 2,
        currentCount: 0,
        isCompleted: false,
        isFailed: false,
      },
      {
        id: 'obj_cme_protect_crew',
        title: 'Limit Crew Radiation Dose Below 150 mSv',
        description: 'Shield the living modules so total cumulative radiation dose stays below acute thresholds.',
        type: 'maintain_safety',
        requiredSafety: 70,
        isCompleted: false,
        isFailed: false,
      },
      {
        id: 'obj_cme_survive_7',
        title: 'Withstand 7 Days of Solar Weather',
        description: 'Survive the high proton storm passage through Day 7.',
        type: 'survive_days',
        targetDay: 7,
        isCompleted: false,
        isFailed: false,
      },
    ],
    scheduledEvents: [
      {
        id: 'evt_cme_arrival',
        day: 3,
        title: 'Proton Tempest Impact: High Energy Solar Particle Event',
        severity: 'critical',
        description:
          'Proton flux exceeds 10,000 pfu at >10 MeV. Radiation sensors scream across the outpost.',
        scientificContext:
          'During a Solar Particle Event, energetic protons collide with materials creating secondary neutrons. Hydrogen-rich materials like polyethylene and water, along with heavy compacted regolith, absorb these particles effectively.',
        affectedSystems: ['Crew Health', 'Living Quarters', 'Solar Panel Avionics'],
        choices: [
          {
            id: 'bunker_lockdown',
            title: 'Water-Wall Bunkering Protocol (Cost: 15 kWh Power)',
            description: 'Pump habitat wastewater into perimeter bladder walls to form an emergency hydrogen shield.',
            resourceDeltas: { batteryStored: -15 },
            environmentalModifiers: { radiationLevel: 1.2 }, // buffered
            explanation:
              'Water molecules (H2O) are rich in lightweight hydrogen nuclei, providing superior stopping power against secondary neutrons.',
          },
          {
            id: 'standard_shelter',
            title: 'Standard Habitat Shelter',
            description: 'Keep crew inside quarters without supplemental water wall barriers.',
            environmentalModifiers: { radiationLevel: 3.8 }, // elevated dose
            explanation:
              'Saves battery power, but crew receives an unmitigated radiation dose, lowering safety score.',
          },
        ],
        isResolved: false,
      },
      {
        id: 'evt_emp_inverter_trip',
        day: 5,
        title: 'Geomagnetic Solar Wind Electrostatic Inverter Trip',
        severity: 'medium',
        description:
          'Static charge buildup from high-energy electrons has tripped inverter circuit breakers on Solar Array 1.',
        scientificContext:
          'Spacecraft charging occurs when space plasmas deposit net negative charges on dielectric surfaces, sparking sudden electrostatic discharges (ESD).',
        affectedSystems: ['Power Inverters'],
        choices: [
          {
            id: 'reset_grounding',
            title: 'Replace Sacrificial Grounding Fuse ($75)',
            description: 'Install replacement gallium-nitride surge suppression fuse.',
            creditCost: 75,
            explanation:
              'Instantly restores the solar array with zero further complications.',
          },
          {
            id: 'bypass_circuit',
            title: 'Bypass Ground Circuit',
            description: 'Run array ungrounded to save replacement credits.',
            environmentalModifiers: { solarFlux: 0.8 },
            explanation:
              'Avoids cash spending, but inverter runs at lowered efficiency to prevent arc burnout.',
          },
        ],
        isResolved: false,
      },
    ],
  },
];
