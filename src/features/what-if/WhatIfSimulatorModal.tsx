/**
 * What If? Simulator Modal
 * Clean white theme, concise scenario testing and side-by-side trade-off comparisons.
 */

import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  GitCompare,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react';
import { BUILDING_CATALOG, BUILDING_LIST } from '../../game/catalog/buildings';
import {
  advanceDay,
  canPlaceBuilding,
  cloneMissionState,
} from '../../game/simulation/engine';
import { BuildingType, PlacedBuilding, SimulationSnapshot } from '../../game/types';
import { useGameStore } from '../../store/gameStore';

export const WhatIfSimulatorModal: React.FC = () => {
  const isWhatIfOpen = useGameStore((s) => s.isWhatIfOpen);
  const closeModals = useGameStore((s) => s.closeModals);
  const activeMission = useGameStore((s) => s.activeMission);
  const applyWhatIfChanges = useGameStore((s) => s.applyWhatIfChanges);

  const [horizonDays, setHorizonDays] = useState<number>(5);
  const [workingBuildings, setWorkingBuildings] = useState<PlacedBuilding[]>(() => {
    return activeMission ? JSON.parse(JSON.stringify(activeMission.buildings)) : [];
  });
  const [selectedAddType, setSelectedAddType] = useState<BuildingType>('solar_array');

  React.useEffect(() => {
    if (activeMission && isWhatIfOpen) {
      setWorkingBuildings(JSON.parse(JSON.stringify(activeMission.buildings)));
    }
  }, [activeMission?.missionId, isWhatIfOpen]);

  // Run isolated simulation forward for N days (Hook called unconditionally)
  const simulationResults = useMemo(() => {
    if (!activeMission) return null;

    let baseState = cloneMissionState(activeMission);
    const bSnaps: SimulationSnapshot[] = [];
    for (let d = 0; d < horizonDays; d++) {
      const res = advanceDay(baseState);
      baseState = res.nextState;
      bSnaps.push(baseState.snapshots[baseState.snapshots.length - 1]);
    }

    let altState = cloneMissionState(activeMission);
    altState.buildings = JSON.parse(JSON.stringify(workingBuildings));
    const aSnaps: SimulationSnapshot[] = [];
    for (let d = 0; d < horizonDays; d++) {
      const res = advanceDay(altState);
      altState = res.nextState;
      aSnaps.push(altState.snapshots[altState.snapshots.length - 1]);
    }

    return {
      baselineSnapshots: bSnaps,
      altSnapshots: aSnaps,
      baselineFinal: baseState,
      altFinal: altState,
    };
  }, [activeMission, workingBuildings, horizonDays]);

  if (!isWhatIfOpen || !activeMission || !simulationResults) return null;

  const { baselineFinal, altFinal } = simulationResults;

  const handleToggleBuilding = (id: string) => {
    setWorkingBuildings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b))
    );
  };

  const handleRemoveBuilding = (id: string) => {
    setWorkingBuildings((prev) => prev.filter((b) => b.id !== id));
  };

  const handleAddBuilding = () => {
    let placedPos = null;
    for (let y = 0; y < activeMission.gridSize.height; y++) {
      for (let x = 0; x < activeMission.gridSize.width; x++) {
        const check = canPlaceBuilding(activeMission.gridSize, workingBuildings, selectedAddType, {
          x,
          y,
        });
        if (check.valid) {
          placedPos = { x, y };
          break;
        }
      }
      if (placedPos) break;
    }

    if (!placedPos) return;

    const newB: PlacedBuilding = {
      id: `whatif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: selectedAddType,
      position: placedPos,
      enabled: true,
      builtOnDay: activeMission.day,
    };

    setWorkingBuildings((prev) => [...prev, newB]);
  };

  const handleResetToBaseline = () => {
    setWorkingBuildings(JSON.parse(JSON.stringify(activeMission.buildings)));
  };

  const handleApplyStrategy = () => {
    applyWhatIfChanges(workingBuildings);
  };

  const deltaPower = altFinal.resources.powerGenerated - baselineFinal.resources.powerGenerated;
  const deltaBattery = Math.round(altFinal.resources.batteryStored - baselineFinal.resources.batteryStored);
  const deltaWater = Math.round(altFinal.resources.waterStored - baselineFinal.resources.waterStored);
  const deltaFood = Math.round(altFinal.resources.foodStored - baselineFinal.resources.foodStored);
  const deltaSafety = altFinal.crew.safetyScore - baselineFinal.crew.safetyScore;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="max-w-4xl w-full h-[88vh] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-800">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">What If? Simulator</h2>
              <p className="text-[11px] text-slate-500">Test layout adjustments risk-free before applying to your base.</p>
            </div>
          </div>
          <button
            onClick={closeModals}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-2.5 border-b border-slate-100 bg-slate-50/40 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Horizon:</span>
            {[3, 5, 7].map((days) => (
              <button
                key={days}
                onClick={() => setHorizonDays(days)}
                className={`px-2.5 py-1 rounded-lg border font-mono transition-colors cursor-pointer ${
                  horizonDays === days
                    ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                +{days}d
              </button>
            ))}
          </div>

          <button
            onClick={handleResetToBaseline}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-[11px] cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset to Base</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4">
          {/* Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Power Gen</span>
              <div className="font-mono text-xs font-bold mt-1 text-slate-900">
                {deltaPower >= 0 ? `+${deltaPower}` : deltaPower} kW
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">End Battery</span>
              <div className="font-mono text-xs font-bold mt-1 text-slate-900">
                {deltaBattery >= 0 ? `+${deltaBattery}` : deltaBattery} kWh
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">End Water</span>
              <div className="font-mono text-xs font-bold mt-1 text-slate-900">
                {deltaWater >= 0 ? `+${deltaWater}` : deltaWater} L
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">End Food</span>
              <div className="font-mono text-xs font-bold mt-1 text-slate-900">
                {deltaFood >= 0 ? `+${deltaFood}` : deltaFood} u
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Crew Health</span>
              <div className={`font-mono text-xs font-bold mt-1 ${deltaSafety >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {deltaSafety >= 0 ? `+${deltaSafety}` : deltaSafety}%
              </div>
            </div>
          </div>

          {/* Module Adjustments */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs text-slate-900">Hypothetical Modules</h3>
                <p className="text-[10px] text-slate-500">Toggle or add modules to check impact.</p>
              </div>

              <div className="flex items-center gap-1.5">
                <select
                  value={selectedAddType}
                  onChange={(e) => setSelectedAddType(e.target.value as BuildingType)}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800"
                >
                  {BUILDING_LIST.map((b) => (
                    <option key={b.type} value={b.type}>
                      {b.name} (${b.cost})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddBuilding}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-0.5">
              {workingBuildings.map((b) => {
                const def = BUILDING_CATALOG[b.type];
                return (
                  <div
                    key={b.id}
                    className={`p-2 rounded-xl border flex items-center justify-between text-xs ${
                      b.enabled ? 'bg-white border-slate-200' : 'bg-slate-100 border-slate-200 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-[11px] text-slate-900">{def?.name}</div>
                      <div className="text-[9px] text-slate-400 font-mono">{b.enabled ? 'Online' : 'Off'}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleBuilding(b.id)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                          b.enabled
                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        }`}
                      >
                        {b.enabled ? 'Off' : 'On'}
                      </button>
                      <button
                        onClick={() => handleRemoveBuilding(b.id)}
                        className="p-1 rounded text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trade-off summary */}
          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-950 text-xs">
            <span className="font-bold text-indigo-900 block mb-0.5">Outcome Summary:</span>
            {deltaSafety > 0
              ? `Strategy delivers +${deltaSafety}% higher safety over ${horizonDays} days.`
              : deltaSafety < 0
              ? `Warning: Reduces safety by ${Math.abs(deltaSafety)}% over ${horizonDays} days.`
              : `Safety remains steady over ${horizonDays} days.`}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={closeModals}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold cursor-pointer"
          >
            Discard
          </button>
          <button
            onClick={handleApplyStrategy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <span>Apply to Base</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
