/**
 * Mission Report Modal
 * Clean white theme, concise mission debriefing, charts, and retry options.
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Home,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export const MissionReportModal: React.FC = () => {
  const isReportOpen = useGameStore((s) => s.isReportOpen);
  const currentReport = useGameStore((s) => s.currentReport);
  const retryMission = useGameStore((s) => s.retryMission);
  const exitToHome = useGameStore((s) => s.exitToHome);

  useEffect(() => {
    if (isReportOpen && currentReport?.success) {
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // Ignore
      }
    }
  }, [isReportOpen, currentReport?.success]);

  if (!isReportOpen || !currentReport) return null;

  const {
    missionTitle,
    success,
    daysCompleted,
    totalDays,
    outcomeTitle,
    outcomeSummary,
    objectivesAchieved,
    totalObjectives,
    finalCrewSafety,
    finalCreditsRemaining,
    snapshots,
    strongDecisions,
    improvementAreas,
    keyScienceLessons,
  } = currentReport;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="max-w-3xl w-full h-[85vh] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-800">
        {/* Banner */}
        <div
          className={`p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-rose-50 border-rose-200 text-rose-950'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                success ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}
            >
              {success ? <Award className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                DEBRIEF // {missionTitle}
              </span>
              <h2 className="text-lg md:text-xl font-bold">{outcomeTitle}</h2>
              <p className="text-xs text-slate-600 mt-0.5">{outcomeSummary}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/80 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono">
            <div>
              <span className="text-[9px] text-slate-400 block uppercase">Health</span>
              <span className={`font-bold ${finalCrewSafety >= 75 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {finalCrewSafety}%
              </span>
            </div>
            <div className="h-5 w-px bg-slate-200" />
            <div>
              <span className="text-[9px] text-slate-400 block uppercase">Days</span>
              <span className="text-sky-700 font-bold">{daysCompleted}/{totalDays}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4">
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Tasks Done</span>
              <div className="text-base font-bold font-mono text-emerald-700 mt-0.5">
                {objectivesAchieved} / {totalObjectives}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Budget Left</span>
              <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                ${finalCreditsRemaining.toLocaleString()}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Days Survived</span>
              <div className="text-base font-bold font-mono text-sky-700 mt-0.5">
                {daysCompleted} Sols
              </div>
            </div>
          </div>

          {/* History Chart */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 text-[11px]">Trajectory History</span>
              <div className="flex items-center gap-2 text-[10px] font-mono">
                <span className="text-emerald-700">■ Health</span>
                <span className="text-sky-700">■ Battery</span>
                <span className="text-blue-700">■ Water</span>
              </div>
            </div>

            <div className="h-24 flex items-end justify-between gap-1 border-b border-slate-200 px-1 pb-1">
              {snapshots.map((s) => {
                const sH = Math.max(8, s.crewSafety);
                const bH = Math.max(8, Math.min(100, (s.resources.batteryStored / 160) * 100));
                const wH = Math.max(8, Math.min(100, (s.resources.waterStored / 100) * 100));

                return (
                  <div key={s.day} className="flex-1 flex flex-col items-center justify-end h-full gap-0.5">
                    <div className="w-full flex items-end justify-center gap-0.5 h-full">
                      <div className="w-1.5 bg-emerald-500 rounded-t" style={{ height: `${sH}%` }} />
                      <div className="w-1.5 bg-sky-500 rounded-t" style={{ height: `${bH}%` }} />
                      <div className="w-1.5 bg-blue-500 rounded-t" style={{ height: `${wH}%` }} />
                    </div>
                    <span className="text-[8px] font-mono text-slate-400">D{s.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Decisions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Strong Decisions</span>
              </div>
              <ul className="space-y-1 text-slate-600 text-[11px]">
                {strongDecisions.map((sd, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-emerald-600">•</span>
                    <span>{sd}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-700 font-bold text-xs">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Areas to Improve</span>
              </div>
              <ul className="space-y-1 text-slate-600 text-[11px]">
                {improvementAreas.map((ia, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-amber-600">•</span>
                    <span>{ia}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={exitToHome}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Menu</span>
          </button>

          <button
            onClick={retryMission}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    </div>
  );
};
