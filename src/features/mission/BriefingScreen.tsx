/**
 * Mission Briefing Screen
 * Clean white theme, concise mission parameters and streamlined start action.
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Globe2,
  Rocket,
  Shield,
  Users,
} from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export const BriefingScreen: React.FC = () => {
  const selectedMissionDef = useGameStore((s) => s.selectedMissionDef);
  const startMission = useGameStore((s) => s.startMission);
  const setScreen = useGameStore((s) => s.setScreen);

  const [expandedObjId, setExpandedObjId] = useState<string | null>(null);

  if (!selectedMissionDef) return null;

  const def = selectedMissionDef;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col p-4 md:p-6 select-none">
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col justify-between space-y-4">
        {/* Top Navigation */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <button
            onClick={() => setScreen('home')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Missions</span>
          </button>

          <span className="font-mono text-xs text-sky-600 font-semibold">
            BRIEFING // {def.mode.toUpperCase()}
          </span>
        </div>

        {/* Main Dossier Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                  {def.mode === 'build' ? 'CONSTRUCTION' : 'SURVIVAL'}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {def.difficulty}
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900">{def.title}</h1>
              <p className="text-xs text-slate-500">{def.subtitle}</p>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Duration</span>
                <span className="text-sky-700 font-bold">{def.durationDays} Days</span>
              </div>
              <div className="h-5 w-px bg-slate-300" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Budget</span>
                <span className="text-amber-600 font-bold">${def.initialCredits.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Short Briefing */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
            {def.briefing}
          </div>

          {/* Objectives & Focus Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Objectives */}
            <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Objectives
                </h3>
                <span className="text-[10px] text-slate-400 font-medium">Click for details</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {def.objectives.map((obj) => {
                  const isExpanded = expandedObjId === obj.id;
                  return (
                    <button
                      key={obj.id}
                      type="button"
                      onClick={() => setExpandedObjId(isExpanded ? null : obj.id)}
                      className="w-full text-left p-2.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-800 transition-all cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span>{obj.title}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 ml-1.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 ml-1.5" />
                        )}
                      </div>
                      {isExpanded && (
                        <div className="text-[11px] text-slate-500 mt-1.5 pt-1.5 border-t border-slate-100 leading-snug animate-fadeIn">
                          {obj.description}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Science Learning Focus */}
            <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                Key Focus
              </h3>
              <div className="space-y-1.5 text-xs">
                {def.learningFocus.map((focus, i) => (
                  <div key={i} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center gap-1.5">
                    <span className="text-indigo-600 font-bold text-xs">✦</span>
                    <span className="text-[11px]">{focus}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Crew */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-sky-600" /> Crew ({def.crewCount}):
            </span>
            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-600">
              <span>Dr. Lin</span> • <span>Vance</span> • <span>Dr. Patel</span> • <span>Sato</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            onClick={() => setScreen('home')}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs transition-colors shadow-sm"
          >
            Cancel
          </button>

          <button
            onClick={startMission}
            className="flex-1 max-w-xs flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-white text-xs md:text-sm shadow-md transition-all cursor-pointer"
          >
            <Rocket className="w-4 h-4" />
            <span>Launch Outpost</span>
          </button>
        </div>
      </div>
    </div>
  );
};
