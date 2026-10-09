import React from 'react';
import { TaskItem } from '../types.js';
import { triggerHaptic } from '../utils/telegram.js';
import { CheckCircle2, Clock, Coins, Sparkles, Target } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TasksViewProps {
  tasks: TaskItem[];
  onClaim: (taskId: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ tasks, onClaim }) => {
  return (
    <div className="w-full max-w-md mx-auto space-y-4 pb-24 px-2 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-white flex items-center space-x-2">
          <Target className="w-5 h-5 text-amber-400" />
          <span>ЕЖЕДНЕВНЫЕ ЗАДАНИЯ</span>
        </h2>
        <p className="text-xs text-white/50 font-mono">
          Выполняйте задания каждый день и зарабатывайте до 500 Coins
        </p>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.map(task => {
          const isDone = task.progress >= task.target;
          const isClaimed = task.is_claimed === 1;

          return (
            <div
              key={task.id}
              className={`p-4 rounded-2xl border transition-all ${
                isClaimed
                  ? 'bg-emerald-950/20 border-emerald-500/20 opacity-70'
                  : isDone
                  ? 'bg-amber-950/30 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                  : 'bg-[#10121b] border-white/10'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {task.title}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs font-mono text-white/60">
                      Прогресс: <b className={isDone ? 'text-emerald-400' : 'text-white'}>{task.progress}/{task.target}</b>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 bg-amber-400/10 border border-amber-400/30 px-2.5 py-1 rounded-full">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-mono font-bold text-amber-400 text-xs">
                    +{task.reward_coins}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isDone ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                  style={{ width: `${Math.min(100, (task.progress / task.target) * 100)}%` }}
                />
              </div>

              {/* Claim Action */}
              <div className="mt-3">
                {isClaimed ? (
                  <div className="flex items-center justify-center space-x-1.5 py-2 text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 rounded-xl">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>НАГРАДА ЗАБРАНА</span>
                  </div>
                ) : isDone ? (
                  <button
                    onClick={() => {
                      triggerHaptic('success');
                      confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
                      onClaim(task.id);
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-black font-black text-xs font-mono tracking-wider shadow flex items-center justify-center space-x-2 active:scale-98"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>ЗАБРАТЬ +{task.reward_coins} COINS</span>
                  </button>
                ) : (
                  <div className="flex items-center justify-center space-x-1 py-2 text-xs font-mono text-white/40 bg-white/[0.02] rounded-xl border border-white/5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>ВЫПОЛНЯЕТСЯ</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
