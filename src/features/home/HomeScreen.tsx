/**
 * Home Screen
 * Clean, modern white theme with minimal text and fast game mode access.
 */

import React from 'react';
import {
  Globe2,
  Play,
  RotateCcw,
  Settings,
  Shield,
  Sparkles,
  Sun,
  Zap,
} from 'lucide-react';
import { MISSIONS } from '../../game/catalog/missions';
import { useGameStore } from '../../store/gameStore';

export const HomeScreen: React.FC = () => {
  const openMissionBriefing = useGameStore((s) => s.openMissionBriefing);
  const resumeSavedMission = useGameStore((s) => s.resumeSavedMission);
  const hasSavedMission = useGameStore((s) => s.hasSavedMission);
  const openModal = useGameStore((s) => s.openModal);

  const buildMission = MISSIONS.find((m) => m.mode === 'build') || MISSIONS[0];
  const survivalMissions = MISSIONS.filter((m) => m.mode === 'survive');

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between p-4 md:p-8 select-none relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-50/80 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-600">
            <Globe2 className="w-4 h-4" />
          </div>
          <span className="font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold">
            Lunar Base Mission Trainer
          </span>
        </div>

        <button
          onClick={() => openModal('settings')}
          className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto w-full my-auto text-center space-y-5 z-10 py-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>Ages 13–16 Space Science Simulator</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
          Junior Astronaut <br />
          <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
            Mission Trainer
          </span>
        </h1>

        <p className="max-w-xl mx-auto text-sm sm:text-base text-slate-600 leading-normal">
          Build and run an outpost on the Moon. Balance power, water, oxygen, and crew safety through dynamic solar and dust challenges.
        </p>

        {/* Resume button if save exists */}
        {hasSavedMission && (
          <div className="pt-1">
            <button
              onClick={resumeSavedMission}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Resume Saved Base</span>
            </button>
          </div>
        )}

        {/* Modes Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left pt-3 max-w-3xl mx-auto">
          {/* Mode 1: Build Your Outpost */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-sky-400 hover:shadow-lg transition-all flex flex-col justify-between shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                  Campaign
                </span>
                <span className="text-xs font-mono text-slate-400">14 Days</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">Build Your Outpost</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Design and power a lunar base from scratch. Meet life support targets and maintain astronaut safety.
              </p>
            </div>

            <button
              onClick={() => openMissionBriefing(buildMission.id)}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-white text-xs shadow-md transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Start Campaign</span>
            </button>
          </div>

          {/* Mode 2: Survive Your Mission */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-lg transition-all flex flex-col justify-between shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  3 Scenarios
                </span>
                <span className="text-xs font-mono text-slate-400">Emergency</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">Survive Your Mission</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Handle pre-built bases during dust storms, water line fractures, or solar radiation flares.
              </p>
            </div>

            <div className="mt-4 space-y-1.5">
              {survivalMissions.map((sm) => (
                <button
                  key={sm.id}
                  onClick={() => openMissionBriefing(sm.id)}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-800 transition-all cursor-pointer"
                >
                  <span className="font-medium text-left">{sm.title}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-amber-600 border border-slate-200">
                    {sm.difficulty}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Highlights */}
        <div className="max-w-2xl mx-auto pt-3 text-xs text-slate-500 flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Solar & Battery Storage</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-indigo-500" />
            <span>Radiation Shielding</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-sky-500" />
            <span>Closed-Loop Life Support</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-3 z-10">
        <span>Artemis Junior Astronaut Academy</span>
        <span>Runs locally in browser</span>
      </div>
    </div>
  );
};
