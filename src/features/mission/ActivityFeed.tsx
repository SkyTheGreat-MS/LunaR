/**
 * Activity Feed & Objectives Sidebar
 * Clean white theme, concise mission logs and objective indicators.
 */

import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  FlaskConical,
  Info,
  ListTodo,
  Radio,
} from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export const ActivityFeed: React.FC = () => {
  const activeMission = useGameStore((s) => s.activeMission);
  const [activeTab, setActiveTab] = useState<'objectives' | 'logs'>('objectives');
  const [collapsed, setCollapsed] = useState(false);
  const [expandedObjId, setExpandedObjId] = useState<string | null>(null);

  if (!activeMission) return null;

  const { objectives, activityLogs } = activeMission;
  const completedCount = objectives.filter((o) => o.isCompleted).length;

  return (
    <div className="w-72 max-h-[calc(100vh-140px)] bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl flex flex-col overflow-hidden text-slate-800">
      {/* Header */}
      <div className="p-2 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('objectives')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'objectives'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Tasks</span>
            <span className="text-[10px] font-mono px-1 rounded bg-slate-100 text-slate-700">
              {completedCount}/{objectives.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Logs</span>
          </button>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2 text-xs">
          {activeTab === 'objectives' ? (
            <div className="space-y-1.5">
              {objectives.map((obj) => {
                const isExpanded = expandedObjId === obj.id;
                return (
                  <div
                    key={obj.id}
                    onClick={() => setExpandedObjId(isExpanded ? null : obj.id)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      obj.isCompleted
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {obj.isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-xs text-slate-900 flex items-center justify-between">
                          <span>{obj.title}</span>
                          <div className="flex items-center gap-1.5">
                            {obj.requiredCount && (
                              <span className="font-mono text-[10px] text-slate-500">
                                {obj.currentCount ?? 0}/{obj.requiredCount}
                              </span>
                            )}
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-3 h-3 text-slate-400" />
                            )}
                          </div>
                        </div>
                        {isExpanded && (
                          <p className="text-[11px] text-slate-500 mt-1 pt-1 border-t border-slate-200/70 leading-snug animate-fadeIn">
                            {obj.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-1.5">
              {activityLogs.slice(0, 20).map((log) => {
                const getIcon = () => {
                  switch (log.type) {
                    case 'alert':
                      return <AlertCircle className="w-3 h-3 text-rose-500" />;
                    case 'warning':
                      return <AlertTriangle className="w-3 h-3 text-amber-500" />;
                    case 'success':
                      return <CheckCircle2 className="w-3 h-3 text-emerald-600" />;
                    case 'science':
                      return <FlaskConical className="w-3 h-3 text-purple-600" />;
                    default:
                      return <Info className="w-3 h-3 text-sky-600" />;
                  }
                };

                return (
                  <div
                    key={log.id}
                    className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-0.5"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] text-slate-500">
                      <div className="flex items-center gap-1 font-semibold text-slate-800">
                        {getIcon()}
                        <span>{log.title}</span>
                      </div>
                      <span>Day {log.day}</span>
                    </div>
                    <p className="text-slate-600 leading-tight">{log.message}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
