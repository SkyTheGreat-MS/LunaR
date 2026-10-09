/**
 * Mission History Modal
 * Clean white theme, concise historical telemetry logs.
 */

import React from 'react';
import { History, X } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export const MissionHistoryModal: React.FC = () => {
  const isHistoryOpen = useGameStore((s) => s.isHistoryOpen);
  const closeModals = useGameStore((s) => s.closeModals);
  const activeMission = useGameStore((s) => s.activeMission);

  if (!isHistoryOpen || !activeMission) return null;

  const { snapshots } = activeMission;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="max-w-3xl w-full h-[80vh] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-800">
        <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-700">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-bold text-slate-900">Flight Log Telemetry</h2>
              <p className="text-[11px] text-slate-500">History across {snapshots.length} mission days.</p>
            </div>
          </div>
          <button
            onClick={closeModals}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2">
          {[...snapshots].reverse().map((snap) => (
            <div
              key={snap.day}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-sky-700">Day {snap.day}</span>
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                      snap.crewSafety >= 75
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {snap.crewSafety}% Health
                  </span>
                  <span className="text-[10px] text-slate-400">{snap.activeBuildingsCount} modules</span>
                </div>
                {snap.eventsSummary.length > 0 && (
                  <div className="text-[10px] text-amber-700 mt-0.5 font-medium">
                    {snap.eventsSummary.join(', ')}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2.5 font-mono text-[10px] text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-200">
                <span>Net: <b className={snap.netPower >= 0 ? 'text-emerald-700' : 'text-rose-600'}>{snap.netPower > 0 ? `+${snap.netPower}` : snap.netPower}kW</b></span>
                <span>Bat: <b>{Math.round(snap.resources.batteryStored)}kWh</b></span>
                <span>H2O: <b>{Math.round(snap.resources.waterStored)}L</b></span>
                <span>Food: <b>{Math.round(snap.resources.foodStored)}u</b></span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={closeModals}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
