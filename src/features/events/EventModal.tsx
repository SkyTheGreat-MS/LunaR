/**
 * Event Choice Modal
 * Clean white theme, concise crisis summary, and transparent command options.
 */

import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  ShieldAlert,
} from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export const EventModal: React.FC = () => {
  const activeMission = useGameStore((s) => s.activeMission);
  const resolveEventChoice = useGameStore((s) => s.resolveEventChoice);

  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

  if (!activeMission || !activeMission.activePendingEvent) return null;

  const event = activeMission.activePendingEvent;
  const credits = activeMission.resources.credits;

  const handleConfirm = () => {
    if (!selectedChoiceId) return;
    resolveEventChoice(event.id, selectedChoiceId);
    setSelectedChoiceId(null);
  };

  const severityHeaderStyle =
    event.severity === 'critical'
      ? 'bg-rose-50 border-rose-200 text-rose-900'
      : event.severity === 'high'
      ? 'bg-amber-50 border-amber-200 text-amber-900'
      : 'bg-sky-50 border-sky-200 text-sky-900';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="max-w-xl w-full bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-800">
        {/* Banner */}
        <div className={`p-4 border-b flex items-center gap-3 ${severityHeaderStyle}`}>
          <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/80 border border-slate-200">
                DAY {event.day} ALERT
              </span>
              <span className="text-[10px] uppercase font-bold">
                [{event.severity.toUpperCase()}]
              </span>
            </div>
            <h2 className="text-base md:text-lg font-bold text-slate-900 mt-0.5">{event.title}</h2>
          </div>
        </div>

        <div className="p-4 space-y-3.5 max-h-[75vh] overflow-y-auto">
          {/* Description */}
          <p className="text-xs md:text-sm text-slate-700 leading-normal">
            {event.description}
          </p>

          {/* Scientific Context */}
          <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-2.5 text-xs text-sky-900 space-y-1">
            <div className="flex items-center gap-1 font-semibold text-sky-800 text-[11px]">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Scientific Context</span>
            </div>
            <p className="text-[11px] leading-relaxed text-sky-950">{event.scientificContext}</p>
          </div>

          {/* Options */}
          <div className="space-y-2 pt-0.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Select Command Action:
            </div>
            {event.choices.map((choice) => {
              const isSelected = selectedChoiceId === choice.id;
              const canAfford = !choice.creditCost || credits >= choice.creditCost;

              return (
                <button
                  key={choice.id}
                  disabled={!canAfford}
                  onClick={() => setSelectedChoiceId(choice.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-300 shadow-sm'
                      : canAfford
                      ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                      : 'bg-slate-50/50 border-slate-100 opacity-45 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{choice.title}</span>
                    {choice.creditCost ? (
                      <span className={`text-[11px] font-mono font-bold ${canAfford ? 'text-amber-700' : 'text-rose-600'}`}>
                        Cost: ${choice.creditCost}
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-emerald-600 font-semibold">Free</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">{choice.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-600">
            Available: <span className="font-mono text-slate-900 font-bold">${credits}</span>
          </div>
          <button
            onClick={handleConfirm}
            disabled={!selectedChoiceId}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer ${
              selectedChoiceId
                ? 'bg-sky-600 hover:bg-sky-500 text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Confirm Order</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
