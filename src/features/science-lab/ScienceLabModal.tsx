/**
 * Science Lab Modal
 * Clean white theme, concise STEM inquiry steps with visual chart comparisons.
 */

import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FlaskConical,
  HelpCircle,
  Lightbulb,
  Sparkles,
  X,
} from 'lucide-react';
import { SCIENCE_EXPERIMENTS } from '../../game/science/experiments';
import { useGameStore } from '../../store/gameStore';

export const ScienceLabModal: React.FC = () => {
  const isScienceLabOpen = useGameStore((s) => s.isScienceLabOpen);
  const closeModals = useGameStore((s) => s.closeModals);
  const activeMission = useGameStore((s) => s.activeMission);
  const applyScienceBonus = useGameStore((s) => s.applyScienceBonus);

  const [selectedExpId, setSelectedExpId] = useState<string>(SCIENCE_EXPERIMENTS[0].id);
  const [currentStep, setCurrentStep] = useState<'question' | 'prediction' | 'experiment' | 'result' | 'explanation'>('question');
  const [userPrediction, setUserPrediction] = useState<number | null>(null);

  // Dynamic parameters state
  const [paramValues, setParamValues] = useState<Record<string, Record<string, any>>>(() => {
    const initial: Record<string, Record<string, any>> = {};
    SCIENCE_EXPERIMENTS.forEach((exp) => {
      initial[exp.id] = {};
      exp.parameters.forEach((p) => {
        initial[exp.id][p.id] = p.defaultValue;
      });
    });
    return initial;
  });

  if (!isScienceLabOpen) return null;

  const currentExp = SCIENCE_EXPERIMENTS.find((e) => e.id === selectedExpId) || SCIENCE_EXPERIMENTS[0];
  const currentParams = paramValues[currentExp.id] || {};
  const result = currentExp.calculateResult(currentParams);

  const isCompletedInMission = activeMission?.scienceExperimentsCompleted.includes(currentExp.id);

  const handleParamChange = (paramId: string, val: any) => {
    setParamValues((prev) => ({
      ...prev,
      [currentExp.id]: {
        ...prev[currentExp.id],
        [paramId]: val,
      },
    }));
  };

  const handleApplyToMission = () => {
    applyScienceBonus(currentExp.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="max-w-4xl w-full h-[88vh] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-800">
        {/* Top Header */}
        <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Lunar Science Lab</h2>
              <p className="text-[11px] text-slate-500">Test scientific variables and unlock outpost upgrades.</p>
            </div>
          </div>
          <button
            onClick={closeModals}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Experiment Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-100 bg-slate-50/30 px-3 py-1.5 gap-1.5 text-xs">
          {SCIENCE_EXPERIMENTS.map((exp, idx) => {
            const isSelected = exp.id === currentExp.id;
            const completed = activeMission?.scienceExperimentsCompleted.includes(exp.id);

            return (
              <button
                key={exp.id}
                onClick={() => {
                  setSelectedExpId(exp.id);
                  setCurrentStep('question');
                  setUserPrediction(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-50 border-purple-300 text-purple-900 font-bold shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span>Lab {idx + 1}: {exp.badge}</span>
                {completed && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
              </button>
            );
          })}
        </div>

        {/* Step Flow Breadcrumb */}
        <div className="px-5 py-2 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 overflow-x-auto font-medium">
            {(['question', 'prediction', 'experiment', 'result', 'explanation'] as const).map(
              (step, idx) => {
                const labels = {
                  question: '1. Question',
                  prediction: '2. Hypothesis',
                  experiment: '3. Variables',
                  result: '4. Chart',
                  explanation: '5. Apply',
                };
                const isActive = currentStep === step;
                return (
                  <React.Fragment key={step}>
                    <button
                      onClick={() => setCurrentStep(step)}
                      className={`cursor-pointer transition-colors ${
                        isActive ? 'text-purple-700 font-bold underline underline-offset-4' : 'hover:text-slate-800'
                      }`}
                    >
                      {labels[step]}
                    </button>
                    {idx < 4 && <ChevronRight className="w-3 h-3 text-slate-400" />}
                  </React.Fragment>
                );
              }
            )}
          </div>

          {isCompletedInMission && (
            <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
              <Sparkles className="w-3 h-3 text-emerald-600" /> Active Perk
            </span>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {/* STEP 1: QUESTION */}
          {currentStep === 'question' && (
            <div className="space-y-4 max-w-xl mx-auto py-2">
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 text-purple-900 space-y-2">
                <div className="flex items-center gap-1.5 text-purple-700 font-bold text-xs uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4" />
                  <span>The Question</span>
                </div>
                <h3 className="text-base md:text-lg font-bold text-slate-900 leading-snug">
                  {currentExp.question}
                </h3>
              </div>

              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                {currentExp.scientificContext}
              </div>

              <button
                onClick={() => setCurrentStep('prediction')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-white text-xs md:text-sm shadow-md transition-all cursor-pointer"
              >
                <span>Make a Prediction</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: PREDICTION */}
          {currentStep === 'prediction' && (
            <div className="space-y-3 max-w-xl mx-auto py-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800">
                {currentExp.predictionPrompt}
              </div>

              <div className="space-y-2">
                {currentExp.predictionOptions.map((opt, idx) => {
                  const isSelected = userPrediction === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setUserPrediction(idx)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer ${
                        isSelected
                          ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-300 text-purple-950 font-medium'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full flex items-center justify-center bg-slate-100 border border-slate-300 text-[10px] font-mono font-bold flex-shrink-0 mt-0.5">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-xs leading-relaxed">{opt}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setCurrentStep('question')}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep('experiment')}
                  disabled={userPrediction === null}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer ${
                    userPrediction !== null
                      ? 'bg-purple-600 hover:bg-purple-500 text-white'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>Run Variables</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 & 4: EXPERIMENT & RESULTS */}
          {(currentStep === 'experiment' || currentStep === 'result') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sliders */}
              <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
                    <span>Variables</span>
                  </h3>
                  <span className="text-[10px] text-slate-400">Controls</span>
                </div>

                <div className="space-y-3 text-xs">
                  {currentExp.parameters.map((param) => {
                    const val = currentParams[param.id];

                    if (param.options) {
                      return (
                        <div key={param.id} className="space-y-1">
                          <label className="font-semibold text-slate-700 text-[11px]">{param.label}</label>
                          <div className="space-y-1">
                            {param.options.map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() => handleParamChange(param.id, opt.value)}
                                className={`w-full text-left p-2 rounded-lg border text-xs transition-all cursor-pointer ${
                                  String(val) === String(opt.value)
                                    ? 'bg-purple-50 border-purple-400 text-purple-900 font-bold'
                                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={param.id} className="space-y-1">
                        <div className="flex justify-between font-semibold text-slate-700 text-[11px]">
                          <span>{param.label}</span>
                          <span className="font-mono text-purple-700">
                            {val} {param.unit || ''}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={param.min}
                          max={param.max}
                          step={param.step}
                          value={val}
                          onChange={(e) => handleParamChange(param.id, Number(e.target.value))}
                          className="w-full accent-purple-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-[11px] text-purple-900 leading-snug">
                  {result.summary}
                </div>
              </div>

              {/* Chart & Metrics */}
              <div className="space-y-3 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-2">
                  {result.metrics.map((m, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">{m.label}</span>
                      <span
                        className={`text-sm font-bold font-mono mt-0.5 block ${
                          m.status === 'good' ? 'text-emerald-700' : m.status === 'bad' ? 'text-rose-600' : 'text-amber-700'
                        }`}
                      >
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* SVG Chart */}
                <div className="bg-white rounded-2xl p-3 border border-slate-200 flex-1 flex flex-col justify-between min-h-[180px]">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-800 text-[11px]">Response Curve</span>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-purple-600">■ {result.primarySeriesName}</span>
                      <span className="text-sky-600">■ {result.secondarySeriesName}</span>
                    </div>
                  </div>

                  <div className="h-32 w-full flex items-end justify-between gap-1.5 pt-4 pb-1 border-b border-slate-100">
                    {result.chartData.map((d, i) => {
                      const maxVal = Math.max(
                        ...result.chartData.map((cd) => Math.max(cd.primary, cd.secondary)),
                        1
                      );
                      const primaryH = Math.min(100, Math.max(8, (d.primary / maxVal) * 100));
                      const secondaryH = Math.min(100, Math.max(8, (d.secondary / maxVal) * 100));

                      return (
                        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-0.5">
                          <div className="w-full flex items-end justify-center gap-0.5 h-full">
                            <div className="w-2.5 rounded-t bg-purple-600" style={{ height: `${primaryH}%` }} />
                            <div className="w-2.5 rounded-t bg-sky-500" style={{ height: `${secondaryH}%` }} />
                          </div>
                          <span className="text-[9px] font-mono text-slate-500 mt-1">{d.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => setCurrentStep('explanation')}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-white text-xs shadow-md transition-all cursor-pointer"
                >
                  <span>Apply Engineering Lesson</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: EXPLANATION & APPLY */}
          {currentStep === 'explanation' && (
            <div className="space-y-3 max-w-xl mx-auto py-1">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <div className="flex items-center gap-1 font-bold text-purple-700 mb-1 text-[11px]">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>The Science</span>
                </div>
                {currentExp.explanation}
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
                <div className="flex items-center gap-1 font-bold text-emerald-800 mb-1 text-[11px]">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Practical Mission Rule</span>
                </div>
                {currentExp.practicalLesson}
              </div>

              {/* Bonus Card */}
              <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold text-purple-600 uppercase">Mission Bonus</div>
                  <div className="text-xs font-semibold text-purple-950 mt-0.5">{currentExp.missionBonusDescription}</div>
                </div>

                <button
                  onClick={handleApplyToMission}
                  disabled={isCompletedInMission}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                    isCompletedInMission
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm'
                  }`}
                >
                  {isCompletedInMission ? 'Applied' : 'Apply to Base'}
                </button>
              </div>

              <div className="flex justify-between pt-1">
                <button
                  onClick={() => setCurrentStep('experiment')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={closeModals}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
                >
                  Return to Outpost
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
