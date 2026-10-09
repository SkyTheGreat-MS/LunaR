/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BriefingScreen } from './features/mission/BriefingScreen';
import { HomeScreen } from './features/home/HomeScreen';
import { SimulationScreen } from './features/mission/SimulationScreen';
import { useGameStore } from './store/gameStore';

export default function App() {
  const screen = useGameStore((s) => s.screen);
  const toast = useGameStore((s) => s.toast);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-sky-500 selection:text-white">
      {/* Active Screen Router */}
      {screen === 'home' && <HomeScreen />}
      {screen === 'briefing' && <BriefingScreen />}
      {screen === 'simulation' && <SimulationScreen />}

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-fadeIn">
          <div
            className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-xl backdrop-blur-md border ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-emerald-900/10'
                : toast.type === 'warning'
                ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-amber-900/10'
                : 'bg-white border-slate-200 text-slate-800 shadow-slate-900/10'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
