/**
 * Building Palette
 * Clean, spacious module cards showing just the name and price.
 * Clicking a module expands its detailed specifications beside the base before placement.
 */

import React from 'react';
import { BUILDING_LIST } from '../../game/catalog/buildings';
import { useGameStore } from '../../store/gameStore';

export const BuildingPalette: React.FC = () => {
  const activeMission = useGameStore((s) => s.activeMission);
  const placementType = useGameStore((s) => s.placementType);
  const setPlacementType = useGameStore((s) => s.setPlacementType);

  if (!activeMission) return null;

  const credits = activeMission.resources.credits;

  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-2 sm:p-2.5 shadow-xs w-full">
      <div className="flex items-center justify-between mb-1.5 px-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
            Lunar Modules
          </span>
          <span className="text-[10px] text-slate-500 hidden sm:inline">
            (Select to view details & place)
          </span>
        </div>
        <div className="text-[11px] font-mono font-medium text-slate-600">
          Budget: <span className="text-amber-700 font-bold">${credits}</span>
        </div>
      </div>

      {/* Spacious, uncramped module cards with small short names & prices */}
      <div className="flex items-stretch gap-1.5 sm:gap-2 overflow-x-auto pb-1 pt-0.5 px-0.5 scrollbar-thin">
        {BUILDING_LIST.map((b) => {
          const isSelected = placementType === b.type;
          const canAfford = credits >= b.cost;
          const displayName = b.shortName || b.name;

          return (
            <button
              key={b.type}
              onClick={() => {
                if (canAfford) {
                  setPlacementType(isSelected ? null : b.type);
                }
              }}
              disabled={!canAfford}
              className={`group flex-1 min-w-[70px] sm:min-w-[82px] text-left px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-lg border transition-all duration-150 flex flex-col justify-between cursor-pointer select-none ${
                isSelected
                  ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-300 shadow-xs'
                  : canAfford
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-slate-300'
                  : 'bg-slate-50/50 border-slate-200/60 opacity-40 cursor-not-allowed'
              }`}
              title={canAfford ? `Click to inspect details and place ${b.name}` : `Cannot afford ${b.name}`}
            >
              <div className={`font-semibold text-xs leading-tight transition-colors truncate ${
                isSelected ? 'text-sky-900 font-bold' : 'text-slate-800 group-hover:text-sky-700'
              }`}>
                {displayName}
              </div>

              <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-200/60">
                <span className={`font-mono text-xs font-bold ${
                  canAfford ? 'text-amber-700' : 'text-slate-400'
                }`}>
                  ${b.cost}
                </span>
                {isSelected && (
                  <span className="text-[9px] font-bold text-sky-600 uppercase tracking-tight ml-1">
                    Active
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
