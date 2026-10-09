/**
 * Settings Modal
 * Clean white theme, sound, motion, and cache controls.
 */

import React, { useState } from 'react';
import {
  Eye,
  Grid,
  Moon,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { clearSavedMission } from '../../persistence/storage';
import { useGameStore } from '../../store/gameStore';

export const SettingsModal: React.FC = () => {
  const isSettingsOpen = useGameStore((s) => s.isSettingsOpen);
  const closeModals = useGameStore((s) => s.closeModals);
  const settings = useGameStore((s) => s.settings);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const showToast = useGameStore((s) => s.showToast);

  const [confirmClear, setConfirmClear] = useState(false);

  if (!isSettingsOpen) return null;

  const handleClearSave = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    clearSavedMission();
    showToast('Saved data cleared', 'info');
    useGameStore.setState({ hasSavedMission: false });
    setConfirmClear(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="max-w-sm w-full bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-800">
        <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-slate-100 text-sky-600 border border-slate-200">
              <Eye className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Settings</h2>
          </div>
          <button
            onClick={closeModals}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4 text-xs">
          {/* Audio */}
          <div className="space-y-2.5">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Audio</div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                {settings.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-sky-600" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
                <span>Sound Effects (Web Audio Synth)</span>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                className="w-4 h-4 accent-sky-600 cursor-pointer"
              />
            </div>

            {settings.soundEnabled && (
              <div className="space-y-1 pl-6">
                <div className="flex justify-between text-slate-500 text-[10px]">
                  <span>Volume</span>
                  <span>{Math.round(settings.volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.volume}
                  onChange={(e) => updateSettings({ volume: Number(e.target.value) })}
                  className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Display */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Display</div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <Grid className="w-4 h-4 text-sky-600" />
                <span>Show Grid Lines</span>
              </div>
              <input
                type="checkbox"
                checked={settings.showGridLines}
                onChange={(e) => updateSettings({ showGridLines: e.target.checked })}
                className="w-4 h-4 accent-sky-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <Moon className="w-4 h-4 text-indigo-600" />
                <span>Reduced Motion</span>
              </div>
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
                className="w-4 h-4 accent-sky-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Reset Save */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={handleClearSave}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs w-full justify-center transition-colors cursor-pointer ${
                confirmClear
                  ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600 font-bold'
                  : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{confirmClear ? 'Click again to confirm reset' : 'Clear Saved Game'}</span>
            </button>
          </div>
        </div>

        <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={closeModals}
            className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
