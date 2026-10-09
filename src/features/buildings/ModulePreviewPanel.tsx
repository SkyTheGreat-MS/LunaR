/**
 * Module Preview Panel
 * Appears beside the base when a player selects a module from the palette,
 * showing full technical specifications, costs, and footprint before placement.
 */

import React from 'react';
import {
  Battery,
  Building,
  CheckCircle2,
  Cpu,
  Droplet,
  Info,
  Leaf,
  Shield,
  Sun,
  X,
  Zap,
} from 'lucide-react';
import { BUILDING_CATALOG } from '../../game/catalog/buildings';
import { BuildingType } from '../../game/types';
import { useGameStore } from '../../store/gameStore';

export const ModulePreviewPanel: React.FC = () => {
  const placementType = useGameStore((s) => s.placementType);
  const setPlacementType = useGameStore((s) => s.setPlacementType);
  const activeMission = useGameStore((s) => s.activeMission);

  if (!placementType || !activeMission) return null;

  const def = BUILDING_CATALOG[placementType];
  if (!def) return null;

  const canAfford = activeMission.resources.credits >= def.cost;

  const getIcon = (type: BuildingType) => {
    switch (type) {
      case 'habitat':
        return <Building className="w-4 h-4 text-sky-600" />;
      case 'solar_array':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'battery_bank':
        return <Battery className="w-4 h-4 text-emerald-600" />;
      case 'greenhouse':
        return <Leaf className="w-4 h-4 text-green-600" />;
      case 'water_recycler':
        return <Droplet className="w-4 h-4 text-blue-600" />;
      case 'radiation_shielding':
        return <Shield className="w-4 h-4 text-purple-600" />;
      case 'research_rover':
        return <Cpu className="w-4 h-4 text-pink-600" />;
    }
  };

  return (
    <div className="w-80 max-w-[calc(100vw-32px)] bg-white/95 backdrop-blur-md border border-sky-300/80 rounded-2xl p-4 shadow-2xl text-slate-800 flex flex-col gap-3 transition-all duration-200 animate-fadeIn ring-1 ring-sky-200/50">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-sky-100 border border-sky-300 text-sky-700 shadow-2xs">
            {getIcon(def.type)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] uppercase font-bold tracking-wider text-sky-600">
                Module Specifications
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 font-bold border border-sky-200">
                Ready to Place
              </span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 leading-tight mt-0.5">{def.name}</h3>
          </div>
        </div>
        <button
          onClick={() => setPlacementType(null)}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
          title="Cancel Placement"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Cost & Footprint Bar */}
      <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs">
        <div>
          <span className="text-[9px] text-slate-400 block uppercase font-sans font-bold">Cost</span>
          <span className={`font-bold text-sm ${canAfford ? 'text-amber-700' : 'text-rose-600'}`}>
            ${def.cost}
          </span>
        </div>
        <div className="h-6 w-px bg-slate-200" />
        <div>
          <span className="text-[9px] text-slate-400 block uppercase font-sans font-bold">Footprint</span>
          <span className="text-slate-700 font-semibold">
            {def.size.width}×{def.size.height} tiles
          </span>
        </div>
        <div className="h-6 w-px bg-slate-200" />
        <div>
          <span className="text-[9px] text-slate-400 block uppercase font-sans font-bold">Category</span>
          <span className="text-slate-700 font-semibold capitalize font-sans">
            {def.category.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Specific Operating Specifications */}
      <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/90 space-y-1.5 text-xs font-mono">
        <span className="text-[9px] uppercase font-bold text-slate-500 block tracking-wider font-sans">
          Telemetry & Demands
        </span>
        {def.powerGenerated ? (
          <div className="flex justify-between text-amber-700 font-medium">
            <span>Power Output:</span>
            <span className="font-bold">+{def.powerGenerated} kW</span>
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
          <div className="flex justify-between text-blue-700 font-medium">
            <span>Water Reclaimed:</span>
            <span className="font-bold">+{def.waterProduced} L/day</span>
          </div>
        ) : null}
        {def.foodProduced ? (
          <div className="flex justify-between text-green-700 font-medium">
            <span>Food Production:</span>
            <span className="font-bold">+{def.foodProduced} u/day</span>
          </div>
        ) : null}
        {def.oxygenProduced ? (
          <div className="flex justify-between text-cyan-700 font-medium">
            <span>Oxygen Yield:</span>
            <span className="font-bold">+{def.oxygenProduced} kg/day</span>
          </div>
        ) : null}
        {def.batteryCapacity ? (
          <div className="flex justify-between text-emerald-700 font-medium">
            <span>Battery Capacity:</span>
            <span className="font-bold">+{def.batteryCapacity} kWh</span>
          </div>
        ) : null}
        {def.radiationProtection ? (
          <div className="flex justify-between text-purple-700 font-medium">
            <span>Radiation Shielding:</span>
            <span className="font-bold">+{def.radiationProtection}%</span>
          </div>
        ) : null}
        {def.crewSupported ? (
          <div className="flex justify-between text-sky-700 font-medium">
            <span>Crew Capacity:</span>
            <span className="font-bold">{def.crewSupported} astronauts</span>
          </div>
        ) : null}
      </div>

      {/* Description */}
      <div className="bg-sky-50/80 border border-sky-200 rounded-xl p-2.5 text-xs text-sky-900 leading-snug">
        <span className="font-bold text-sky-800">Function: </span>
        {def.description}
      </div>

      {/* Placement Prompt Callout */}
      <div className="p-2.5 rounded-xl bg-sky-600 text-white text-center text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5 animate-pulse">
        <span>Click any lunar tile to place module</span>
      </div>

      <button
        onClick={() => setPlacementType(null)}
        className="w-full py-1 text-center text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
      >
        Cancel Selection
      </button>
    </div>
  );
};
