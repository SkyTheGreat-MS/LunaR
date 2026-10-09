/**
 * Simulation Screen
 * Central headquarters with clean white theme, compact controls, and streamlined navigation.
 */

import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  FlaskConical,
  GitCompare,
  History,
  Home,
  Menu,
  Settings,
  Sparkles,
} from 'lucide-react';
import { EventModal } from '../events/EventModal';
import { MissionHistoryModal } from '../history/MissionHistoryModal';
import { MissionReportModal } from '../reports/MissionReportModal';
import { ResourceDashboard } from '../resources/ResourceDashboard';
import { ScienceLabModal } from '../science-lab/ScienceLabModal';
import { SettingsModal } from '../settings/SettingsModal';
import { TutorialOverlay } from '../tutorial/TutorialOverlay';
import { WhatIfSimulatorModal } from '../what-if/WhatIfSimulatorModal';
import { BuildingPalette } from '../buildings/BuildingPalette';
import { InspectorPanel } from '../buildings/InspectorPanel';
import { ModulePreviewPanel } from '../buildings/ModulePreviewPanel';
import { IsometricCanvas } from '../world/IsometricCanvas';
import { ActivityFeed } from './ActivityFeed';
import { useGameStore } from '../../store/gameStore';

export const SimulationScreen: React.FC = () => {
  const activeMission = useGameStore((s) => s.activeMission);
  const selectedMissionDef = useGameStore((s) => s.selectedMissionDef);
  const advanceDay = useGameStore((s) => s.advanceDay);
  const openModal = useGameStore((s) => s.openModal);
  const exitToHome = useGameStore((s) => s.exitToHome);
  const startTutorial = useGameStore((s) => s.startTutorial);
  const selectedBuilding = useGameStore((s) => s.selectedBuilding);
  const placementType = useGameStore((s) => s.placementType);

  const [leftDrawerOpen, setLeftDrawerOpen] = useState(true);

  // Keyboard shortcut: Spacebar to advance day if no modal open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        const state = useGameStore.getState();
        const hasOpenModal =
          state.isScienceLabOpen ||
          state.isWhatIfOpen ||
          state.isHistoryOpen ||
          state.isSettingsOpen ||
          state.isReportOpen ||
          !!state.activeMission?.activePendingEvent;

        if (!hasOpenModal && state.activeMission) {
          e.preventDefault();
          advanceDay();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [advanceDay]);

  if (!activeMission) return null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-50 flex flex-col select-none text-slate-800">
      {/* 1. TOP BAR */}
      <header className="h-11 bg-white border-b border-slate-200 px-3 md:px-5 flex items-center justify-between z-20 shadow-2xs">
        {/* Left: Outpost Name & Day */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={exitToHome}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            title="Menu"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Menu</span>
          </button>

          <div className="h-4 w-px bg-slate-200" />

          <div className="flex items-center gap-2">
            <span className="font-bold text-xs md:text-sm text-slate-900">
              {selectedMissionDef?.title || 'Lunar Outpost'}
            </span>
            <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-bold">
              Day {activeMission.day}/{activeMission.maxDays}
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={startTutorial}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs text-sky-700 border border-slate-200 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Guide</span>
          </button>

          <button
            onClick={() => openModal('history')}
            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 cursor-pointer"
            title="Logs"
          >
            <History className="w-4 h-4" />
          </button>

          <button
            onClick={() => openModal('settings')}
            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 cursor-pointer"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. RESOURCE TELEMETRY */}
      <ResourceDashboard />

      {/* 3. MAIN CANVAS VIEWPORT */}
      <main className="flex-1 relative overflow-hidden bg-slate-950">
        <IsometricCanvas />

        {/* Floating Left: Activity Feed & Objectives */}
        <div className="absolute top-4 left-4 z-20 flex items-start gap-1">
          {leftDrawerOpen ? (
            <ActivityFeed />
          ) : (
            <button
              onClick={() => setLeftDrawerOpen(true)}
              className="p-2 rounded-xl bg-white/95 border border-slate-200 text-slate-700 shadow-md cursor-pointer"
              title="Show Tasks"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Floating Right: Selected Building Inspector or Module Placement Preview */}
        {selectedBuilding ? (
          <div className="absolute top-4 right-4 z-20">
            <InspectorPanel />
          </div>
        ) : placementType ? (
          <div className="absolute top-4 right-4 z-20">
            <ModulePreviewPanel />
          </div>
        ) : null}

        {/* Tutorial Floating Overlay */}
        <TutorialOverlay />
      </main>

      {/* 4. BOTTOM ACTION BAR */}
      <footer className="bg-white/95 backdrop-blur-md border-t border-slate-200 p-2 z-20 shadow-md flex flex-col md:flex-row items-center justify-between gap-2.5">
        {/* Left: Tools */}
        <div className="flex items-center gap-1.5 w-full md:w-auto justify-start">
          <button
            onClick={() => openModal('science')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
            <span>Science Lab</span>
            {activeMission.scienceExperimentsCompleted.length > 0 && (
              <span className="font-mono text-[10px] px-1 rounded bg-purple-200 text-purple-900">
                {activeMission.scienceExperimentsCompleted.length}
              </span>
            )}
          </button>

          <button
            onClick={() => openModal('whatIf')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <GitCompare className="w-3.5 h-3.5 text-indigo-600" />
            <span>What If?</span>
          </button>
        </div>

        {/* Center: Module Palette */}
        <div className="flex-1 max-w-3xl w-full min-w-0">
          <BuildingPalette />
        </div>

        {/* Right: Advance Day */}
        <div className="flex items-center justify-end w-full md:w-auto">
          <button
            onClick={() => advanceDay()}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-white text-xs md:text-sm shadow-md transition-all cursor-pointer"
            title="Advance 1 Day [Spacebar]"
          >
            <span>Advance Day</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </footer>

      {/* MODALS */}
      <EventModal />
      <ScienceLabModal />
      <WhatIfSimulatorModal />
      <MissionHistoryModal />
      <SettingsModal />
      <MissionReportModal />
    </div>
  );
};
