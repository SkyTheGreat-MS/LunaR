/**
 * Resource Dashboard
 * Clean white theme, high contrast metrics for power, battery, water, food, oxygen,
 * credits, and crew status with streamlined labels.
 */

import React from 'react';
import {
  Battery,
  Droplet,
  HeartPulse,
  Leaf,
  Sun,
  Wind,
  Zap,
} from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export const ResourceDashboard: React.FC = () => {
  const activeMission = useGameStore((s) => s.activeMission);

  if (!activeMission) return null;

  const { resources, crew, environment } = activeMission;

  // Power metrics
  const netPower = Math.round((resources.powerGenerated - resources.powerDemanded) * 10) / 10;
  const powerSurplus = netPower >= 0;

  // Battery percentage
  const batteryPct = Math.min(
    100,
    Math.round((resources.batteryStored / (resources.batteryCapacity || 1)) * 100)
  );

  // Water net
  const netWater = Math.round((resources.waterProduced - resources.waterDemand) * 10) / 10;
  const waterPct = Math.min(
    100,
    Math.round((resources.waterStored / (resources.waterCapacity || 1)) * 100)
  );

  // Food net
  const netFood = Math.round((resources.foodProduced - resources.foodDemand) * 10) / 10;
  const foodPct = Math.min(
    100,
    Math.round((resources.foodStored / (resources.foodCapacity || 1)) * 100)
  );

  // Oxygen net
  const netOxygen = Math.round((resources.oxygenProduced - resources.oxygenDemand) * 10) / 10;
  const oxygenPct = Math.min(
    100,
    Math.round((resources.oxygenStored / (resources.oxygenCapacity || 1)) * 100)
  );

  // Crew health styling
  const safetyStyle =
    crew.safetyScore >= 80
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : crew.safetyScore >= 50
      ? 'text-amber-700 bg-amber-50 border-amber-200'
      : 'text-rose-700 bg-rose-50 border-rose-300 animate-pulse';

  return (
    <div className="w-full bg-white border-b border-slate-200 px-3 py-1.5 text-xs shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Credits */}
        <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
          <span className="text-amber-600 font-bold text-sm">¢</span>
          <div>
            <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Budget</div>
            <div className="font-mono font-bold text-slate-900 leading-none">
              ${resources.credits.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Power Grid */}
        <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 min-w-[120px]">
          <Zap className={`w-3.5 h-3.5 ${powerSurplus ? 'text-amber-500' : 'text-rose-500 animate-pulse'}`} />
          <div className="flex-1">
            <div className="flex justify-between items-center text-[9px] text-slate-500 font-medium">
              <span>POWER</span>
              <span className={`font-mono font-bold ${powerSurplus ? 'text-emerald-600' : 'text-rose-600'}`}>
                {powerSurplus ? `+${netPower}` : netPower} kW
              </span>
            </div>
            <div className="font-mono text-[10px] text-slate-600 leading-tight">
              {resources.powerGenerated} gen / {resources.powerDemanded} req
            </div>
          </div>
        </div>

        {/* Battery */}
        <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 min-w-[120px]">
          <Battery className={`w-3.5 h-3.5 ${batteryPct > 25 ? 'text-emerald-600' : 'text-rose-600 animate-pulse'}`} />
          <div className="flex-1">
            <div className="flex justify-between items-center text-[9px] text-slate-500 font-medium">
              <span>BATTERY</span>
              <span className="font-mono font-semibold text-slate-700">{batteryPct}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-0.5">
              <div
                className={`h-full transition-all duration-300 ${
                  batteryPct > 40 ? 'bg-emerald-500' : batteryPct > 20 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${batteryPct}%` }}
              />
            </div>
            <div className="text-[9px] font-mono text-slate-500 mt-0.5 leading-none">
              {Math.round(resources.batteryStored)}/{resources.batteryCapacity} kWh
            </div>
          </div>
        </div>

        {/* Water */}
        <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 min-w-[115px]">
          <Droplet className={`w-3.5 h-3.5 ${resources.waterStored > 15 ? 'text-sky-500' : 'text-rose-500 animate-pulse'}`} />
          <div className="flex-1">
            <div className="flex justify-between items-center text-[9px] text-slate-500 font-medium">
              <span>WATER</span>
              <span className={`font-mono text-[9px] font-bold ${netWater >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {netWater >= 0 ? `+${netWater}` : netWater}/d
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-0.5">
              <div className="h-full bg-sky-500 transition-all duration-300" style={{ width: `${waterPct}%` }} />
            </div>
            <div className="text-[9px] font-mono text-slate-500 mt-0.5 leading-none">
              {Math.round(resources.waterStored)}/{resources.waterCapacity} L
            </div>
          </div>
        </div>

        {/* Food */}
        <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 min-w-[115px]">
          <Leaf className={`w-3.5 h-3.5 ${resources.foodStored > 15 ? 'text-green-600' : 'text-rose-500 animate-pulse'}`} />
          <div className="flex-1">
            <div className="flex justify-between items-center text-[9px] text-slate-500 font-medium">
              <span>FOOD</span>
              <span className={`font-mono text-[9px] font-bold ${netFood >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {netFood >= 0 ? `+${netFood}` : netFood}/d
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-0.5">
              <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${foodPct}%` }} />
            </div>
            <div className="text-[9px] font-mono text-slate-500 mt-0.5 leading-none">
              {Math.round(resources.foodStored)}/{resources.foodCapacity} u
            </div>
          </div>
        </div>

        {/* Oxygen */}
        <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 min-w-[115px]">
          <Wind className={`w-3.5 h-3.5 ${resources.oxygenStored > 20 ? 'text-cyan-600' : 'text-rose-500 animate-pulse'}`} />
          <div className="flex-1">
            <div className="flex justify-between items-center text-[9px] text-slate-500 font-medium">
              <span>OXYGEN</span>
              <span className={`font-mono text-[9px] font-bold ${netOxygen >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {netOxygen >= 0 ? `+${netOxygen}` : netOxygen}/d
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-0.5">
              <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${oxygenPct}%` }} />
            </div>
            <div className="text-[9px] font-mono text-slate-500 mt-0.5 leading-none">
              {Math.round(resources.oxygenStored)}/{resources.oxygenCapacity} kg
            </div>
          </div>
        </div>

        {/* Crew Health */}
        <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border ${safetyStyle} min-w-[125px]`}>
          <HeartPulse className="w-4 h-4 flex-shrink-0" />
          <div>
            <div className="flex items-center justify-between gap-1 text-[9px] font-bold uppercase">
              <span>Crew Health</span>
              <span className="font-mono text-[8px] px-1 rounded bg-white/70">{crew.safetyStatus}</span>
            </div>
            <div className="font-mono font-bold text-xs leading-none mt-0.5">
              {crew.safetyScore}%
              <span className="text-[9px] font-normal text-slate-500 ml-1">({crew.radiationDoseMsv.toFixed(1)} mSv)</span>
            </div>
          </div>
        </div>

        {/* Dust alert badge */}
        {environment.dustStormLevel > 0 && (
          <div className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-300 px-2 py-1 rounded text-[10px] font-semibold animate-pulse">
            <Sun className="w-3 h-3 text-amber-600" />
            <span>Dust: -{(environment.dustStormLevel * 100).toFixed(0)}% Sun</span>
          </div>
        )}
      </div>
    </div>
  );
};
