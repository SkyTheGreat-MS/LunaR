# Junior Astronaut Mission Trainer

**Junior Astronaut Mission Trainer** is an educational 2D isometric lunar-outpost simulation game designed for students aged 13–16. Players design, construct, and operate a permanent human base on the Moon's South Pole (Shackleton Crater rim), manage scarce life-support resources, respond to environmental hazards, and investigate the core science behind their engineering decisions.

---

## 🚀 Key Features

### 1. Dual Gameplay Modes
- **Build Your Outpost (Sandbox Campaign):** Start on virgin lunar regolith with initial construction credits and starter supplies. Design your base layout, deploy power generation, install water recycling and greenhouse farming, and keep your 4-person astronaut crew safe through 14 Sol days.
- **Survive Your Mission (Crisis Scenarios):**
  - **Power Under Pressure:** Face an electrostatic dust storm that cuts solar irradiance by 65% for 4 days. Manage power triage, shed non-essential loads, and survive battery depletion.
  - **Water Budget Crisis:** Respond to a fractured ice extraction line with 35 units of water remaining. Balance greenhouse irrigation, upgrade vapor recyclers, and avert dehydration shock.
  - **Prepare for a Solar Storm:** An X-class Coronal Mass Ejection (CME) bombards the outpost with relativistic protons. Build sintered regolith shield bulwarks, activate hydrogen water-wall bunkers, and prevent acute radiation doses.

### 2. Seven Realistic Outpost Structures
1. **Crew Habitat Module (2×2):** Pressurized living quarters for 4 astronauts; consumes life support (O2, H2O, food) and power.
2. **Photovoltaic Solar Array (2×1):** High-efficiency solar power generation; sensitive to low sun angles and electrostatic dust.
3. **Regolith-Shielded Battery Bank (1×1):** Stores surplus daytime energy (80 kWh); discharges automatically during deficits.
4. **Hydroponic Greenhouse Dome (2×2):** Closed-loop plant agriculture; consumes power and water, produces fresh calories and oxygen.
5. **Vapor-Compression Water Recycler (1×1):** Recovers up to 85–93% of humidity condensate and hygiene wastewater.
6. **Sintered Regolith Shield Bulwark (2×1):** Thick lunar basalt barrier attenuating ionizing cosmic rays and solar proton events.
7. **Pressurized Science Rover & Bay (1×1):** Explores crater shadows for ice volatiles; draws auxiliary power.

### 3. Pure Deterministic Simulation Engine
The simulation runs an explicit **10-step daily transactional sequence**:
1. **Apply Environmental Conditions:** Calculates solar flux, temperature, dust storms, and cosmic radiation.
2. **Determine Building Availability:** Evaluates online status and operational prerequisites.
3. **Calculate Building Production:** Generates power, water recycling yield, food, and oxygen.
4. **Calculate Resource Demands:** Tallies crew metabolic consumption and facility electrical draws.
5. **Power Dispatch & Battery Rules:** Evaluates net power ($P_{net} = P_{gen} - P_{dem}$), charges batteries on surplus (95% efficiency), discharges batteries on deficit, and flags brownouts if depleted.
6. **Inventory Updates:** Clamps storage capacities and records shortages.
7. **Crew Safety Evaluation:** Applies health penalties for shortages (hypoxia, dehydration, starvation, cold) and accumulates radiation doses (mSv).
8. **Scheduled Crisis Events:** Prompts player with command decisions with transparent trade-offs.
9. **Objective Tracking:** Evaluates duration, safety, and construction milestones.
10. **Telemetry Snapshot & Comms Log:** Stores historical trajectory and generates educational explanations.

### 4. Interactive Science Lab (Ages 13–16)
Follows an inquiry cycle: **Question → Prediction → Experiment → Result & Charts → Explanation → Apply Lesson**:
1. **Solar Power Dynamics:** Investigate panel tilt angles, Lambert's cosine law, and electrostatic dust scattering. *(Perk: +15% Solar efficiency)*.
2. **Controlled Environment Agriculture:** Test LED photoperiods (hours of light) and CO2 enrichment on plant biomass. *(Perk: +20% Greenhouse food yield)*.
3. **Lunar Regolith Shielding:** Model exponential radiation attenuation ($I = I_0 e^{-\mu x}$) and hydrogen-rich materials against solar proton tempests. *(Perk: +20% Radiation protection)*.
4. **Closed-Loop Water Recovery:** Explore multi-stage vapor-compression distillation and brine limits. *(Perk: +2 L/day Recycler yield)*.

### 5. What If? Scenario Sandbox
- Creates an **isolated deep clone** of the current mission state.
- Players can add hypothetical buildings or toggle off consumers over a 3, 5, or 7-day forecast horizon.
- Runs side-by-side comparative resource trajectories against the baseline outpost.
- Explains strategic trade-offs and allows one-click adoption into the active mission without risk.

### 6. Interactive Tutorial & Post-Mission Debriefing
- **Cadet Tutorial:** 5-step guided walkthrough on placement, inspecting, telemetry reading, and day advancement.
- **Mission Report:** Comprehensive evaluation including objective achievements, resource timeline graphs, commendations for strong decisions, improvement opportunities, and scientific lessons learned.

---

## 🛠 Technology Stack

- **Frontend:** React 19, TypeScript (strict mode), Vite 8
- **Styling:** Tailwind CSS 4, Lucide React icons
- **State Management:** Zustand
- **Audio:** Web Audio API Procedural Synthesizer (zero external audio assets needed)
- **Renderer:** HTML5 2D Isometric Canvas with pan, zoom, grid collision, and ghost preview
- **Persistence:** Versioned LocalStorage with automatic in-memory fallback
- **Testing:** Vitest

---

## 📦 Getting Started & Commands

### Prerequisites
Node.js 18+ and npm.

### Installation
```bash
npm install
```

### Development Server
Starts the local development server at `http://localhost:3000`:
```bash
npm run dev
```

### Build for Production
Compiles the application with full TypeScript verification:
```bash
npm run build
```

### Run Simulation Unit Tests
Executes the deterministic simulation engine test suite:
```bash
npm run test
```

### Code Linting / Type Checking
Validates TypeScript typings without emitting files:
```bash
npm run lint
```

---

## 📂 Architecture

```
src/
├── game/
│   ├── types.ts                   # Core interfaces (MissionState, Resources, Buildings)
│   ├── audio/
│   │   └── sound.ts               # Procedural Web Audio synthesizer (clicks, chimes, alarms)
│   ├── catalog/
│   │   ├── buildings.ts           # 7 Building definitions, footprints, costs, specs
│   │   └── missions.ts            # Campaign and 3 survival scenario definitions
│   ├── science/
│   │   └── experiments.ts         # 4 interactive science lab experiments
│   └── simulation/
│       └── engine.ts              # Pure, deterministic simulation engine & advanceDay()
├── features/
│   ├── home/
│   │   └── HomeScreen.tsx         # Title, modes, resume save, curriculum
│   ├── mission/
│   │   ├── BriefingScreen.tsx     # Mission briefing dossier & crew manifest
│   │   ├── SimulationScreen.tsx   # Operational headquarters & layout
│   │   └── ActivityFeed.tsx       # Real-time comms logs and objective tracker
│   ├── world/
│   │   ├── IsometricCanvas.tsx    # 2D isometric canvas renderer with camera controls
│   │   └── isometricUtils.ts      # Coordinate projection and inverse transforms
│   ├── resources/
│   │   └── ResourceDashboard.tsx  # Telemetry bar (power, battery, water, food, O2, health)
│   ├── buildings/
│   │   ├── BuildingPalette.tsx    # Module selector cards
│   │   └── InspectorPanel.tsx     # Module details, power toggle, demolition
│   ├── events/
│   │   └── EventModal.tsx         # Crisis choice dialog with transparent consequences
│   ├── science-lab/
│   │   └── ScienceLabModal.tsx    # 4-stage inquiry science lab
│   ├── what-if/
│   │   └── WhatIfSimulatorModal.tsx # Isolated sandbox forecasting
│   ├── reports/
│   │   └── MissionReportModal.tsx # Post-mission debriefing and charts
│   ├── history/
│   │   └── MissionHistoryModal.tsx# Daily telemetry log viewer
│   ├── tutorial/
│   │   └── TutorialOverlay.tsx    # Interactive cadet tutorial walkthrough
│   └── settings/
│       └── SettingsModal.tsx      # Audio, graphics, and persistence preferences
├── persistence/
│   └── storage.ts                 # Versioned local save/load with memory fallback
├── store/
│   └── gameStore.ts               # Central Zustand application store
├── tests/
│   └── simulation.test.ts         # Unit & integration tests
├── App.tsx                        # Screen routing & toasts
├── main.tsx                       # Entrypoint
└── index.css                      # Tailwind styles and animations
```

---

## 🔬 Educational Assumptions & Scientific Calibration

- **Solar Flux:** Solar irradiance at 1 AU is ~1361 W/m². On the lunar poles, sun elevation is low (~1.5°–15° above the horizon), requiring vertical array orientation.
- **Atmospheric Absence:** Without an atmosphere, micrometeorites strike unhindered, and temperatures swing from +120°C in sunlight to -130°C in shadow.
- **Radiation Environment:** Galactic Cosmic Rays (GCR) deliver ~0.7 mSv/day continuously. Solar Particle Events (SPE) can spike over 10–50 mSv/day. 1–2 meters of compacted regolith provides over 90% protection.
- **Human Baselines:** 4 astronauts require ~14 L water, ~32 units food, and ~32 kg oxygen daily. Closed-loop recycling recovers up to 85–93% of moisture.
