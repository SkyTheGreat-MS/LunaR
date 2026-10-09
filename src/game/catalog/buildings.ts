/**
 * Building Catalog
 * Definitions, costs, footprints, and balanced mechanics for the lunar outpost
 */

import { BuildingDefinition, BuildingType } from '../types';

export const BUILDING_CATALOG: Record<BuildingType, BuildingDefinition> = {
  habitat: {
    type: 'habitat',
    name: 'Crew Habitat Module',
    category: 'life_support',
    cost: 350,
    size: { width: 2, height: 2 },
    description: 'Pressurized living quarters, airlock, and medical bay for up to 4 astronauts.',
    whyItMatters:
      'Human astronauts need atmospheric pressure (101.3 kPa), temperature control, and radiation-shielded bunking to survive the harsh lunar vacuum.',
    powerDemanded: 12,
    waterDemand: 8,
    foodDemand: 8,
    oxygenDemand: 8,
    crewSupported: 4,
    waterCapacity: 50,
    foodCapacity: 50,
    oxygenCapacity: 50,
    radiationProtection: 15,
    color: '#38bdf8', // sky-400
    accentColor: '#0284c7',
  },

  solar_array: {
    type: 'solar_array',
    name: 'Photovoltaic Solar Array',
    category: 'energy',
    cost: 150,
    size: { width: 2, height: 1 },
    description: 'High-efficiency dual-junction solar panels harvesting intense solar radiation.',
    whyItMatters:
      'Without an atmosphere to scatter light, lunar sunlight delivers ~1361 W/m². However, dust accumulation and low sun angles can degrade performance by up to 60%.',
    powerGenerated: 25,
    powerDemanded: 0,
    color: '#fbbf24', // amber-400
    accentColor: '#d97706',
  },

  battery_bank: {
    type: 'battery_bank',
    name: 'Regolith-Shielded Battery Bank',
    category: 'energy',
    cost: 180,
    size: { width: 1, height: 1 },
    description: 'Lithium-ion energy storage system with solid-state thermal insulation.',
    whyItMatters:
      'Batteries store excess daytime energy for lunar night cycles or sudden dust storm drop-offs. Energy stored is limited by round-trip chemical charge efficiency.',
    powerDemanded: 1,
    batteryCapacity: 80,
    color: '#34d399', // emerald-400
    accentColor: '#059669',
  },

  greenhouse: {
    type: 'greenhouse',
    name: 'Hydroponic Greenhouse Dome',
    category: 'life_support',
    cost: 280,
    size: { width: 2, height: 2 },
    description: 'Closed-loop hydroponic farm growing microgreens, radishes, and dwarf wheat with LED lighting.',
    whyItMatters:
      'Plants convert CO2, water, and artificial photons into fresh calories (food) and breathable oxygen (O2) while purifying transpiration moisture.',
    powerDemanded: 10,
    waterDemand: 6,
    foodProduced: 12,
    oxygenProduced: 6,
    foodCapacity: 40,
    oxygenCapacity: 40,
    color: '#4ade80', // green-400
    accentColor: '#16a34a',
  },

  water_recycler: {
    type: 'water_recycler',
    name: 'Vapor-Compression Water Recycler',
    category: 'life_support',
    cost: 220,
    size: { width: 1, height: 1 },
    description: 'Multi-stage distillation and catalytic oxidation unit recovering greywater and humidity condensate.',
    whyItMatters:
      'Shipping 1 liter of water from Earth to the Moon costs thousands of dollars. Closed-loop recovery of hygiene water and urine can recover up to 85–93% of moisture.',
    powerDemanded: 8,
    waterProduced: 10, // recycled yield per day under normal operational crew load
    waterCapacity: 60,
    color: '#60a5fa', // blue-400
    accentColor: '#2563eb',
  },

  radiation_shielding: {
    type: 'radiation_shielding',
    name: 'Sintered Regolith Shield Bulwark',
    category: 'protection',
    cost: 200,
    size: { width: 2, height: 1 },
    description: 'Microwave-sintered lunar basalt block wall and hydrogen-rich polyethylene berm.',
    whyItMatters:
      'The Moon has no global magnetic field or atmosphere to block Galactic Cosmic Rays (GCR) or Solar Particle Events (SPE). 1–2 meters of compacted regolith shields out 90%+ of ionizing radiation.',
    powerDemanded: 0,
    radiationProtection: 35,
    color: '#c084fc', // purple-400
    accentColor: '#9333ea',
  },

  research_rover: {
    type: 'research_rover',
    name: 'Pressurized Science Rover & Bay',
    category: 'research',
    cost: 240,
    size: { width: 1, height: 1 },
    description: 'Robotic exploration base exploring permanently shadowed craters for water ice deposits.',
    whyItMatters:
      'Scientific prospecting locates subsurface ice and volatile reserves essential for fuel and long-term lunar permanence. Requires auxiliary electrical recharge.',
    powerDemanded: 5,
    color: '#f472b6', // pink-400
    accentColor: '#db2777',
  },
};

export const BUILDING_LIST = Object.values(BUILDING_CATALOG);
