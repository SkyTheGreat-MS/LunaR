/**
 * Building Inspector Panel
 * Clean white theme, concise module metrics, power toggle, and demolition actions.
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Pause,
  Play,
  Trash2,
  X,
} from 'lucide-react';
import { BUILDING_CATALOG } from '../../game/catalog/buildings';
import { useGameStore } from '../../store/gameStore';

export const InspectorPanel: React.FC = () => {
  const selectedBuilding = useGameStore((s) => s.selectedBuilding);
  const selectBuilding = useGameStore((s) => s.selectBuilding);
  const toggleBuildingActive = useGameStore((s) => s.toggleBuildingActive);
  const demolishBuilding = useGameStore((s) => s.demolishBuilding);

  const [confirmDisable, setConfirmDisable] = useState(false);
  const [confirmDemolish, setConfirmDemolish] = useState(false);

  if (!selectedBuilding) return null;

  const def = BUILDING_CATALOG[selectedBuilding.type];
  if (!def) return null;

  const isCritical =
    selectedBuilding.type === 'habitat' ||
    selectedBuilding.type === 'water_recycler' ||
    selectedBuilding.type === 'solar_array';

  const handleToggle = () => {
    if (selectedBuilding.enabled && isCritical && !confirmDisable) {
      setConfirmDisable(true);
      return;
    }
    toggleBuildingActive(selectedBuilding.id);
    setConfirmDisable(false);
  };

  const handleDemolish = () => {
    if (!confirmDemolish) {
      setConfirmDemolish(true);
      return;
    }
    demolishBuilding(selectedBuilding.id);
    setConfirmDemolish(false);
  };

  const salvageValue = Math.floor(def.cost * 0.5);

  return (
    <div className="w-72 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-3.5 shadow-xl text-slate-800 flex flex-col gap-2.5">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-100 pb-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                selectedBuilding.enabled ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <h3 className="font-bold text-xs text-slate-900">{def.name}</h3>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            ({selectedBuilding.position.x}, {selectedBuilding.position.y}) • Day {selectedBuilding.builtOnDay}
          </div>
        </div>
        <button
          onClick={() => selectBuilding(null)}
          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          title="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Specifications */}
      <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 space-y-1 text-xs font-mono">
        {def.powerGenerated ? (
          <div className="flex justify-between text-amber-700">
            <span>Power Output:</span>
            <span>+{def.powerGenerated} kW</span>
          </div>
        ) : null}
        {def.powerDemanded ? (
          <div className="flex justify-between text-slate-600">
            <span>Power Demand:</span>
            <span>-{def.powerDemanded} kW</span>
          </div>
        ) : null}
        {def.waterDemand ? (
          <div className="flex justify-between text-sky-700">
            <span>Water Demand:</span>
            <span>-{def.waterDemand} L/day</span>
          </div>
        ) : null}
        {def.waterProduced ? (
          <div className="flex justify-between text-blue-700">
            <span>Water Reclaimed:</span>
            <span>+{def.waterProduced} L/day</span>
          </div>
        ) : null}
        {def.foodProduced ? (
          <div className="flex justify-between text-green-700">
            <span>Food Output:</span>
            <span>+{def.foodProduced} u/day</span>
          </div>
        ) : null}
        {def.oxygenProduced ? (
          <div className="flex justify-between text-cyan-700">
            <span>Oxygen Yield:</span>
            <span>+{def.oxygenProduced} kg/day</span>
          </div>
        ) : null}
        {def.batteryCapacity ? (
          <div className="flex justify-between text-emerald-700">
            <span>Storage:</span>
            <span>+{def.batteryCapacity} kWh</span>
          </div>
        ) : null}
        {def.radiationProtection ? (
          <div className="flex justify-between text-purple-700">
            <span>Shielding:</span>
            <span>+{def.radiationProtection}%</span>
          </div>
        ) : null}
      </div>

      {/* Concise Purpose Note */}
      <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-2 text-[11px] text-sky-900 leading-snug">
        <span className="font-semibold text-sky-800">Role: </span>
        {def.description}
      </div>

      {/* Warning when disabling critical module */}
      {confirmDisable && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-2 text-xs text-amber-900">
          <div className="flex items-center gap-1 font-bold text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Confirm Shutdown</span>
          </div>
          <p className="text-[10px] mt-0.5">Shutting down may cause brownout or shortages.</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-0.5">
        <button
          onClick={handleToggle}
          className={`flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            selectedBuilding.enabled
              ? confirmDisable
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          {selectedBuilding.enabled ? (
            confirmDisable ? (
              'Confirm Stop'
            ) : (
              <>
                <Pause className="w-3 h-3" /> Turn Off
              </>
            )
          ) : (
            <>
              <Play className="w-3 h-3" /> Turn On
            </>
          )}
        </button>

        <button
          onClick={handleDemolish}
          className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
            confirmDemolish
              ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600'
              : 'bg-white hover:bg-rose-50 text-rose-600 border-slate-200'
          }`}
        >
          <Trash2 className="w-3 h-3" />
          <span>{confirmDemolish ? `+$${salvageValue}` : 'Demolish'}</span>
        </button>
      </div>
    </div>
  );
};
