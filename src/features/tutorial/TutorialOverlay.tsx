/**
 * Interactive Tutorial Overlay
 * Clean white theme, concise cadet steps.
 */

import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  MousePointer,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export const TutorialOverlay: React.FC = () => {
  const tutorialActive = useGameStore((s) => s.tutorialActive);
  const tutorialStep = useGameStore((s) => s.tutorialStep);
  const nextTutorialStep = useGameStore((s) => s.nextTutorialStep);
  const skipTutorial = useGameStore((s) => s.skipTutorial);

  if (!tutorialActive) return null;

  const steps = [
    {
      title: '1. Place a Module',
      instructions: 'Click a module from the bottom palette, then click a tile on the lunar grid to build.',
      icon: <MousePointer className="w-4 h-4 text-sky-600" />,
    },
    {
      title: '2. Inspect Module',
      instructions: 'Click directly on any built module to check power demand, production, and toggle options.',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
    },
    {
      title: '3. Monitor Telemetry',
      instructions: 'Watch the top bar. Keep power positive so surplus energy charges batteries for dark cycles.',
      icon: <Zap className="w-4 h-4 text-amber-500" />,
    },
    {
      title: '4. Advance Day',
      instructions: 'Click "Advance Day" [Spacebar] to simulate daily consumption, solar harvest, and events.',
      icon: <ArrowRight className="w-4 h-4 text-sky-600" />,
    },
    {
      title: '5. Science & What-If',
      instructions: 'Use the Science Lab for permanent bonuses and the What If? sandbox to test plans risk-free.',
      icon: <Sparkles className="w-4 h-4 text-purple-600" />,
    },
  ];

  const current = steps[tutorialStep] || steps[0];

  return (
    <div className="fixed bottom-24 left-4 z-40 max-w-xs w-full bg-white/95 border border-sky-300 rounded-2xl shadow-xl p-3 text-slate-800 backdrop-blur-md animate-fadeIn">
      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
        <div className="flex items-center gap-1.5">
          {current.icon}
          <h4 className="font-bold text-xs text-slate-900">{current.title}</h4>
        </div>
        <button
          onClick={skipTutorial}
          className="p-0.5 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="text-[11px] text-slate-600 leading-normal mb-3">{current.instructions}</p>

      {/* Progress & Buttons */}
      <div className="flex items-center justify-between pt-0.5">
        <div className="flex items-center gap-1">
          {steps.map((_, idx) => (
            <span
              key={idx}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                idx === tutorialStep
                  ? 'bg-sky-600 w-3'
                  : idx < tutorialStep
                  ? 'bg-emerald-500'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={skipTutorial}
            className="text-[10px] text-slate-400 hover:text-slate-600 px-1 py-0.5 cursor-pointer"
          >
            Skip
          </button>
          <button
            onClick={nextTutorialStep}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold shadow-xs cursor-pointer"
          >
            <span>{tutorialStep === steps.length - 1 ? 'Finish' : 'Next'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
