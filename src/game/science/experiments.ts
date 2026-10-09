/**
 * Science Lab Experiments
 * 4 interactive inquiry-based scientific investigations for Junior Astronauts (ages 13–16)
 * Flow: Question -> Prediction -> Experiment -> Result & Charts -> Explanation -> Apply Lesson
 */

export interface ExperimentOption {
  id: string;
  label: string;
  value: number | string;
  description?: string;
}

export interface ScienceExperiment {
  id: string;
  title: string;
  badge: string;
  question: string;
  scientificContext: string;
  predictionPrompt: string;
  predictionOptions: string[];
  parameters: {
    id: string;
    label: string;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    defaultValue: number | string;
    options?: ExperimentOption[];
  }[];
  calculateResult: (params: Record<string, number | string>) => {
    metrics: { label: string; value: string; status: 'good' | 'neutral' | 'bad' }[];
    chartData: { label: string; primary: number; secondary: number }[];
    primarySeriesName: string;
    secondarySeriesName: string;
    summary: string;
  };
  explanation: string;
  practicalLesson: string;
  missionBonusDescription: string;
  applyBonusEffect: (state: any) => { message: string };
}

export const SCIENCE_EXPERIMENTS: ScienceExperiment[] = [
  {
    id: 'exp_solar_dynamics',
    title: 'Photovoltaic Solar Flux & Dust Degradation',
    badge: 'Energy Science',
    question:
      'How do panel tilt angle relative to the low polar sun and electrostatic dust accumulation impact electrical power output?',
    scientificContext:
      'At the Moon’s South Pole (e.g. Shackleton Crater), the Sun skims the horizon at an angle of 1.5° to 15°. Flat panels capture almost no direct light. Furthermore, jagged lunar dust particles electrostatically cling to glass panels, reflecting and scattering photons.',
    predictionPrompt:
      'What has a greater impact on energy loss: a 30° panel tilt misalignment or a 40% dust coating?',
    predictionOptions: [
      'Panel tilt misalignment causes the greatest loss due to Lambert’s cosine law.',
      'Dust accumulation causes the greatest loss due to high regolith opacity and scattering.',
      'Both factors degrade power output roughly equally when combined.',
    ],
    parameters: [
      {
        id: 'tiltAngle',
        label: 'Panel Tilt Angle from Sun Vector (degrees)',
        min: 0,
        max: 80,
        step: 5,
        unit: '°',
        defaultValue: 15,
      },
      {
        id: 'dustLevel',
        label: 'Electrostatic Dust Accumulation',
        min: 0,
        max: 80,
        step: 5,
        unit: '%',
        defaultValue: 20,
      },
      {
        id: 'concentratorMirror',
        label: 'Booster Reflector Mirror',
        defaultValue: 'off',
        options: [
          { id: 'off', label: 'No Reflector (Standard 1.0x)', value: 'off' },
          { id: 'on', label: 'Deploy Silvered Mylar Mirror (+25% Flux)', value: 'on' },
        ],
      },
    ],
    calculateResult: (params) => {
      const tilt = Number(params.tiltAngle);
      const dust = Number(params.dustLevel) / 100;
      const mirror = params.concentratorMirror === 'on' ? 1.25 : 1.0;

      // Cosine efficiency
      const cosEff = Math.cos((tilt * Math.PI) / 180);
      const dustTransmission = 1 - dust * 0.9;
      const baseKw = 25; // 1 array nominal
      const generatedKw = baseKw * cosEff * dustTransmission * mirror;
      const efficiencyPct = (generatedKw / baseKw) * 100;

      // Chart comparing angles
      const chartData = [0, 20, 40, 60, 80].map((angle) => {
        const cEff = Math.cos((angle * Math.PI) / 180);
        return {
          label: `${angle}°`,
          primary: Math.round(baseKw * cEff * dustTransmission * mirror * 10) / 10,
          secondary: Math.round(baseKw * cEff * 1.0 * 10) / 10, // clean baseline
        };
      });

      return {
        metrics: [
          {
            label: 'Net Power Generated',
            value: `${generatedKw.toFixed(1)} kW`,
            status: generatedKw > 18 ? 'good' : generatedKw > 10 ? 'neutral' : 'bad',
          },
          {
            label: 'Effective Efficiency',
            value: `${efficiencyPct.toFixed(0)}%`,
            status: efficiencyPct > 70 ? 'good' : efficiencyPct > 45 ? 'neutral' : 'bad',
          },
          {
            label: 'Dust Scattering Loss',
            value: `-${(dust * 90).toFixed(0)}%`,
            status: dust > 0.4 ? 'bad' : 'neutral',
          },
        ],
        chartData,
        primarySeriesName: 'Current Setup (kW)',
        secondarySeriesName: 'Clean Baseline (kW)',
        summary: `At a ${tilt}° sun incidence angle and ${(dust * 100).toFixed(0)}% dust coverage, output is ${generatedKw.toFixed(1)} kW (nominal: 25.0 kW). Mirror boost added ${params.concentratorMirror === 'on' ? '+25%' : '0%'}.`,
      };
    },
    explanation:
      'Solar cell output obeys Lambert’s Cosine Law: power drops with the cosine of the angle of incidence. Additionally, microscopic lunar dust particles lack water erosion on the Moon and are razor-sharp with strong dielectric charges. When dust sticks, it scatters incoming photons before they can knock electrons free in the silicon p-n junctions.',
    practicalLesson:
      'Outpost solar arrays must track the moving sun continuously and be positioned vertically near polar peaks. Dust mitigation—such as electrodynamic dust shields—preserves critical kilowatt-hours for night storage.',
    missionBonusDescription: 'Apply Lesson: Boosts all solar array efficiencies by +15% via optimized tracking angles!',
    applyBonusEffect: (state) => {
      let updatedCount = 0;
      for (const b of state.buildings) {
        if (b.type === 'solar_array') {
          b.efficiency = Math.min(1.2, (b.efficiency ?? 1.0) + 0.15);
          updatedCount++;
        }
      }
      return {
        message: `Applied solar tracking optimization to ${updatedCount} Solar Array(s)! Efficiency boosted by +15%.`,
      };
    },
  },

  {
    id: 'exp_greenhouse_photoperiod',
    title: 'Controlled Environment Agriculture & Photoperiod',
    badge: 'Biosphere Science',
    question:
      'What photoperiod (hours of light/day) and CO2 concentration maximize caloric crop yield without overwhelming the outpost electrical budget?',
    scientificContext:
      'Plants on Earth evolved under a 24-hour day/night cycle. In a lunar greenhouse, artificial LED arrays provide photons for photosynthesis, but electrical lighting is power-hungry. If plants receive continuous 24-hour light without a dark period, do they produce 50% more food or suffer photoperiod stress?',
    predictionPrompt:
      'Which lighting regime offers the highest food yield per kilowatt-hour of energy consumed?',
    predictionOptions: [
      '24 hours continuous light: Plants never stop photosynthesizing.',
      '16 hours light / 8 hours dark: Balances Calvin-cycle dark reactions and enzyme recovery.',
      '8 hours light / 16 hours dark: Conserves the most electricity with negligible harvest drop.',
    ],
    parameters: [
      {
        id: 'photoperiodHours',
        label: 'LED Photoperiod (Hours of Light per Day)',
        min: 6,
        max: 24,
        step: 2,
        unit: 'h',
        defaultValue: 16,
      },
      {
        id: 'co2Level',
        label: 'Atmospheric CO2 Concentration',
        defaultValue: '800',
        options: [
          { id: '400', label: 'Earth Ambient (400 ppm)', value: 400 },
          { id: '800', label: 'Enriched Greenhouse (800 ppm)', value: 800 },
          { id: '1200', label: 'High Enrichment (1200 ppm)', value: 1200 },
        ],
      },
      {
        id: 'aeroponicNutrient',
        label: 'Root Irrigation Delivery',
        defaultValue: 'aeroponic',
        options: [
          { id: 'hydroponic', label: 'Liquid Submerged Bed (Consumes 8 L H2O)', value: 'hydroponic' },
          { id: 'aeroponic', label: 'Ultrasonic Root Misting (Consumes 4 L H2O)', value: 'aeroponic' },
        ],
      },
    ],
    calculateResult: (params) => {
      const hours = Number(params.photoperiodHours);
      const co2 = Number(params.co2Level);
      const isAeroponic = params.aeroponicNutrient === 'aeroponic';

      // Photoperiod curve: optimal around 16-18 hours; above 20h diminishing returns due to photoinhibition
      const lightFactor = hours <= 18 ? hours / 16 : 1.125 + (hours - 18) * 0.02;
      const co2Factor = co2 === 1200 ? 1.35 : co2 === 800 ? 1.2 : 1.0;
      const deliveryFactor = isAeroponic ? 1.15 : 1.0;

      const dailyFoodYield = Math.round(8 * lightFactor * co2Factor * deliveryFactor * 10) / 10;
      const powerKw = Math.round((hours * 0.55 + 2.0) * 10) / 10;
      const waterL = isAeroponic ? 4 : 8;
      const efficiencyRatio = Math.round((dailyFoodYield / powerKw) * 10) / 10;

      const chartData = [8, 12, 16, 20, 24].map((h) => {
        const lf = h <= 18 ? h / 16 : 1.125 + (h - 18) * 0.02;
        const fy = Math.round(8 * lf * co2Factor * deliveryFactor * 10) / 10;
        const pk = Math.round((h * 0.55 + 2.0) * 10) / 10;
        return {
          label: `${h}h Light`,
          primary: fy,
          secondary: pk,
        };
      });

      return {
        metrics: [
          {
            label: 'Daily Harvest Yield',
            value: `${dailyFoodYield} Food/day`,
            status: dailyFoodYield >= 12 ? 'good' : 'neutral',
          },
          {
            label: 'Power Consumption',
            value: `${powerKw} kW`,
            status: powerKw <= 11 ? 'good' : 'neutral',
          },
          {
            label: 'Yield Efficiency Ratio',
            value: `${efficiencyRatio} Food/kW`,
            status: efficiencyRatio >= 1.2 ? 'good' : 'neutral',
          },
          {
            label: 'Water Consumption',
            value: `${waterL} L/day`,
            status: isAeroponic ? 'good' : 'neutral',
          },
        ],
        chartData,
        primarySeriesName: 'Harvest Yield (Food units)',
        secondarySeriesName: 'Power Cost (kW)',
        summary: `Operating at ${hours}h light photoperiod with ${co2} ppm CO2 produces ${dailyFoodYield} food units while drawing ${powerKw} kW of electrical load.`,
      };
    },
    explanation:
      'Plants require dark periods to metabolize starches, transport sugars to roots and fruits, and repair the D1 protein in photosystem II. Running grow lights for 24 hours causes chlorophyll chlorosis and wastes electricity. Elevating CO2 to 800–1200 ppm boosts the enzyme RuBisCO, accelerating carbon fixation by up to 35% without requiring extra light!',
    practicalLesson:
      'A 16-hour photoperiod paired with CO2 enrichment and ultrasonic root misting provides maximum caloric return while saving over 30% in electrical and water life support costs.',
    missionBonusDescription: 'Apply Lesson: Boosts Greenhouse food production by +20% with zero extra power demand!',
    applyBonusEffect: (state) => {
      state.resources.foodProduced = Math.round((state.resources.foodProduced + 3) * 10) / 10;
      return {
        message: 'Optimized greenhouse circadian lighting and CO2 enrichment! Base food production increased by +3 units/day.',
      };
    },
  },

  {
    id: 'exp_radiation_shielding',
    title: 'Lunar Regolith Shielding & Proton Attenuation',
    badge: 'Physics & Safety',
    question:
      'How much compacted lunar regolith and hydrogen-rich shielding is required to stop lethal Galactic Cosmic Rays (GCR) and Solar Particle Events (SPE)?',
    scientificContext:
      'On the Moon, astronauts face two forms of ionizing radiation: steady background Galactic Cosmic Rays (~0.7 mSv/day) and intermittent Solar Particle Events (SPE), where coronal mass ejections can deliver over 2,000 mSv in hours. High doses damage DNA, suppress bone marrow, and cause acute radiation sickness.',
    predictionPrompt:
      'How does material thickness scale with radiation attenuation?',
    predictionOptions: [
      'Linear: Every 10 cm of regolith stops exactly the same fixed percentage of radiation.',
      'Exponential: Radiation follows the Beer-Lambert attenuation law ($I = I_0 e^{-\\mu x}$), where initial centimeters stop the most.',
      'Threshold: Nothing is stopped until a minimum thickness of 150 cm is reached.',
    ],
    parameters: [
      {
        id: 'regolithThickness',
        label: 'Compacted Regolith Berm Thickness',
        min: 0,
        max: 200,
        step: 25,
        unit: 'cm',
        defaultValue: 75,
      },
      {
        id: 'polyethyleneLiner',
        label: 'Hydrogen Polyethylene Internal Liner',
        defaultValue: '5',
        options: [
          { id: '0', label: 'None (0 cm)', value: 0 },
          { id: '5', label: '5 cm High-Density Polyethylene (HDPE)', value: 5 },
          { id: '10', label: '10 cm HDPE Wall Core', value: 10 },
        ],
      },
      {
        id: 'flareScenario',
        label: 'Solar Weather Condition',
        defaultValue: 'storm',
        options: [
          { id: 'quiet', label: 'Quiet Sun (Background GCR Only)', value: 'quiet' },
          { id: 'storm', label: 'Class X-5 Solar Proton Tempest', value: 'storm' },
        ],
      },
    ],
    calculateResult: (params) => {
      const regCm = Number(params.regolithThickness);
      const polyCm = Number(params.polyethyleneLiner);
      const isStorm = params.flareScenario === 'storm';

      const unshieldedDailyMsv = isStorm ? 12.5 : 0.85;

      // Attenuation coefficients:
      // Regolith halving thickness ~ 35 cm; Polyethylene halving thickness ~ 18 cm (superior due to hydrogen)
      const regAtten = Math.exp((-0.693 * regCm) / 35);
      const polyAtten = Math.exp((-0.693 * polyCm) / 18);
      const combinedDose = unshieldedDailyMsv * regAtten * polyAtten;
      const shieldedPct = Math.round((1 - combinedDose / unshieldedDailyMsv) * 100);

      const chartData = [0, 50, 100, 150, 200].map((thickness) => {
        const rAtt = Math.exp((-0.693 * thickness) / 35);
        const pAtt = Math.exp((-0.693 * polyCm) / 18);
        return {
          label: `${thickness} cm`,
          primary: Math.round(unshieldedDailyMsv * rAtt * pAtt * 100) / 100,
          secondary: 0.5, // NASA safe target threshold per day
        };
      });

      return {
        metrics: [
          {
            label: 'Attenuated Daily Dose',
            value: `${combinedDose.toFixed(2)} mSv/day`,
            status: combinedDose <= 1.0 ? 'good' : combinedDose <= 3.0 ? 'neutral' : 'bad',
          },
          {
            label: 'Radiation Blocked',
            value: `${shieldedPct}%`,
            status: shieldedPct >= 85 ? 'good' : shieldedPct >= 50 ? 'neutral' : 'bad',
          },
          {
            label: 'Safety Status',
            value: combinedDose < 1.0 ? 'Safe Zone' : combinedDose < 4.0 ? 'Elevated' : 'Hazardous',
            status: combinedDose < 1.0 ? 'good' : 'bad',
          },
        ],
        chartData,
        primarySeriesName: 'Crew Dose (mSv/day)',
        secondarySeriesName: 'Safe Target Line (mSv)',
        summary: `With ${regCm} cm regolith and ${polyCm} cm HDPE liner under ${isStorm ? 'Storm' : 'Quiet'} conditions, crew dose is reduced to ${combinedDose.toFixed(2)} mSv/day (${shieldedPct}% blocked).`,
      };
    },
    explanation:
      'Ionizing radiation follows exponential attenuation ($I = I_0 e^{-\\mu x}$). Fast protons and heavy ions lose energy when colliding with atomic nuclei in the shielding. Crucially, heavy metals like lead create dangerous secondary neutrons when struck by cosmic rays! Hydrogen-rich materials like water and polyethylene absorb neutrons cleanly, making lightweight polymers and lunar soil far safer.',
    practicalLesson:
      'Burying lunar modules under 1.5–2 meters of regolith or surrounding crew sleeping quarters with water tanks drops radiation doses below Earth astronaut career limits.',
    missionBonusDescription: 'Apply Lesson: Grants +20% bonus radiation protection to all current bulwarks!',
    applyBonusEffect: (state) => {
      let count = 0;
      for (const b of state.buildings) {
        if (b.type === 'radiation_shielding') {
          count++;
        }
      }
      state.crew.radiationDoseMsv = Math.max(0, state.crew.radiationDoseMsv - 5);
      return {
        message: `Applied hydrogen-polymer berm lining! Crew radiation cumulative dose purged by 5 mSv.`,
      };
    },
  },

  {
    id: 'exp_water_recovery',
    title: 'Closed-Loop Vapor Distillation & Recovery Rate',
    badge: 'Chemistry & Engineering',
    question:
      'Can multi-stage vapor compression distillation recover 90%+ of crew hygiene water and urine without consuming excessive electrical power?',
    scientificContext:
      'Each astronaut requires ~2.5 to 3.5 liters of clean water daily for hydration, rehydration of meals, and hygiene. Over a 1-year mission, a 4-person crew consumes ~4,000 kg of water. Because launching water costs ~$10,000/kg, closed-loop reclamation is an absolute prerequisite for off-world life.',
    predictionPrompt:
      'What limits a water recycler from reaching 100% recovery efficiency?',
    predictionOptions: [
      'Concentrated brine sludge and salt precipitation that clog distillation boilers.',
      'Evaporation loss through hull micrometeorite leaks.',
      'Chemical breakdown of water molecules into hydrogen gas during filtration.',
    ],
    parameters: [
      {
        id: 'distillationStages',
        label: 'Vapor-Compression Distillation Stages',
        defaultValue: '2',
        options: [
          { id: '1', label: 'Single-Stage Boiler (Consumes 4 kW)', value: 1 },
          { id: '2', label: 'Dual-Stage Thermoelectric (Consumes 7 kW)', value: 2 },
          { id: '3', label: 'Triple-Stage Catalytic VCD (Consumes 11 kW)', value: 3 },
        ],
      },
      {
        id: 'catalyticOxidation',
        label: 'High-Temperature Catalytic Volatiles Reactor',
        defaultValue: 'on',
        options: [
          { id: 'on', label: 'Active (Burns VOCs, +8% Purity, +2 kW)', value: 'on' },
          { id: 'off', label: 'Bypassed (Saves 2 kW, Risk of Biofilm)', value: 'off' },
        ],
      },
      {
        id: 'brineRecovery',
        label: 'Brine Dewatering Assembly',
        defaultValue: 'standard',
        options: [
          { id: 'standard', label: 'Standard Dump (Leaves 15% in Brine)', value: 'standard' },
          { id: 'advanced', label: 'Advanced Polymer Membrane (+10% Recovery, $50)', value: 'advanced' },
        ],
      },
    ],
    calculateResult: (params) => {
      const stages = Number(params.distillationStages);
      const catOn = params.catalyticOxidation === 'on';
      const advBrine = params.brineRecovery === 'advanced';

      const baseRecovery = stages === 1 ? 70 : stages === 2 ? 84 : 92;
      const brineBonus = advBrine ? 7 : 0;
      const totalRecoveryPct = Math.min(98, baseRecovery + brineBonus);

      let powerKw = stages === 1 ? 4 : stages === 2 ? 7 : 11;
      if (catOn) powerKw += 2;

      const dailyCrewWaterUsed = 14; // L
      const dailyReclaimedL = Math.round(((dailyCrewWaterUsed * totalRecoveryPct) / 100) * 10) / 10;
      const dailyLossL = Math.round((dailyCrewWaterUsed - dailyReclaimedL) * 10) / 10;

      const chartData = [1, 2, 3].map((s) => {
        const rec = s === 1 ? 70 : s === 2 ? 84 : 92;
        const p = s === 1 ? 4 : s === 2 ? 7 : 11;
        return {
          label: `${s}-Stage VCD`,
          primary: rec + (advBrine ? 7 : 0),
          secondary: p + (catOn ? 2 : 0),
        };
      });

      return {
        metrics: [
          {
            label: 'Water Recovery Rate',
            value: `${totalRecoveryPct}%`,
            status: totalRecoveryPct >= 90 ? 'good' : totalRecoveryPct >= 80 ? 'neutral' : 'bad',
          },
          {
            label: 'Reclaimed per Day',
            value: `${dailyReclaimedL} L/day`,
            status: dailyReclaimedL >= 12 ? 'good' : 'neutral',
          },
          {
            label: 'Net Water Loss',
            value: `${dailyLossL} L/day`,
            status: dailyLossL <= 1.5 ? 'good' : 'bad',
          },
          {
            label: 'Electrical Power Draw',
            value: `${powerKw} kW`,
            status: powerKw <= 9 ? 'good' : 'neutral',
          },
        ],
        chartData,
        primarySeriesName: 'Recovery Efficiency (%)',
        secondarySeriesName: 'Power Draw (kW)',
        summary: `Operating ${stages}-stage distillation with ${advBrine ? 'Advanced' : 'Standard'} brine dewatering recovers ${totalRecoveryPct}% of water (${dailyReclaimedL} L/day) using ${powerKw} kW.`,
      };
    },
    explanation:
      'In a zero-gravity or low-gravity distillation system, wastewater is spun in a centrifuge while compressed steam heats incoming fluid. Recovery is capped below 100% because as water evaporates, urea, calcium, and sulfates concentrate into thick brine. If boiled to complete dryness, gypsum scale cements inside the heat exchanger, destroying the system.',
    practicalLesson:
      'Aim for ~90–93% recovery. Pushing beyond 95% requires exponentially higher energy and maintenance, while falling below 80% creates unsustainable water logistics deficits.',
    missionBonusDescription: 'Apply Lesson: Permanently increases Water Recycler output by +2 L/day!',
    applyBonusEffect: (state) => {
      state.resources.waterProduced = Math.round((state.resources.waterProduced + 2) * 10) / 10;
      return {
        message: 'Upgraded distillation membranes! Outpost water recovery increased by +2 L/day.',
      };
    },
  },
];
